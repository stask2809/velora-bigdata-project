import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool, connectMongo, mongo } from './db.js';

const app = express();
const here = path.dirname(fileURLToPath(import.meta.url));
app.use(express.json({limit:'100kb'}));
app.use(express.static(path.join(here,'..','public')));
const wrap = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);

// 1. Health check: confirms both databases are reachable.
app.get('/api/health',wrap(async(req,res)=>{
  const pgResult=await pool.query('SELECT now() AS postgres_time');
  const reviewCount=await mongo().collection('reviews').countDocuments();
  res.json({ok:true,postgresTime:pgResult.rows[0].postgres_time,mongoReviews:reviewCount});
}));

// 2. Categories.
app.get('/api/categories',wrap(async(req,res)=>{
  const {rows}=await pool.query('SELECT category_id,name FROM categories ORDER BY name');
  res.json(rows);
}));

// 3. Product list with search and category filtering.
app.get('/api/products',wrap(async(req,res)=>{
  const q=req.query.q ? `%${String(req.query.q).slice(0,80)}%` : null;
  const category=req.query.category ? Number(req.query.category) : null;
  if (category!==null && !Number.isInteger(category)) return res.status(400).json({error:'Invalid category'});
  const {rows}=await pool.query(
    `SELECT p.product_id,p.name,p.description,p.price,p.image_url,c.name AS category,
            COALESCE(SUM(v.stock),0)::int AS stock
       FROM products p JOIN categories c ON c.category_id=p.category_id
       LEFT JOIN variants v ON v.product_id=p.product_id
      WHERE p.is_active=true AND ($1::text IS NULL OR p.name ILIKE $1)
        AND ($2::int IS NULL OR p.category_id=$2)
      GROUP BY p.product_id,c.name ORDER BY p.product_id`,
    [q,category]
  );
  res.json(rows);
}));


// Admin-style CRUD routes. These are tested through Thunder Client (not exposed in the public UI).
// 4. CREATE product.
app.post('/api/products',wrap(async(req,res)=>{
  const {categoryId,collectionId=null,name,description='',price,imageUrl=''}=req.body;
  const n=String(name||'').trim(), cat=Number(categoryId), amount=Number(price);
  if (!n||n.length>120||!Number.isInteger(cat)||cat<1||!Number.isFinite(amount)||amount<0)
    return res.status(400).json({error:'Valid name, categoryId and non-negative price are required'});
  const {rows}=await pool.query(
    `INSERT INTO products(category_id,collection_id,name,description,price,image_url)
     VALUES($1,$2,$3,$4,$5,$6) RETURNING product_id,name,price`,
    [cat,collectionId?Number(collectionId):null,n,String(description).slice(0,2000),amount,String(imageUrl).slice(0,1000)]);
  res.status(201).json(rows[0]);
}));

// 5. UPDATE product details.
app.put('/api/products/:id',wrap(async(req,res)=>{
  const id=Number(req.params.id), {name,description,price,categoryId}=req.body;
  if (!Number.isInteger(id)||id<1||!String(name||'').trim()||!Number.isFinite(Number(price))||Number(price)<0||!Number.isInteger(Number(categoryId)))
    return res.status(400).json({error:'Valid product id, name, categoryId and price are required'});
  const {rows}=await pool.query(
    `UPDATE products SET name=$1,description=$2,price=$3,category_id=$4
     WHERE product_id=$5 AND is_active=true RETURNING product_id,name,price`,
    [String(name).trim().slice(0,120),String(description||'').slice(0,2000),Number(price),Number(categoryId),id]);
  if (!rows.length) return res.status(404).json({error:'Product not found'});
  res.json(rows[0]);
}));

// 6. DELETE product safely by deactivating it (keeps order history intact).
app.delete('/api/products/:id',wrap(async(req,res)=>{
  const id=Number(req.params.id);
  if (!Number.isInteger(id)||id<1) return res.status(400).json({error:'Invalid product id'});
  const result=await pool.query('UPDATE products SET is_active=false WHERE product_id=$1 AND is_active=true',[id]);
  if (!result.rowCount) return res.status(404).json({error:'Product not found'});
  res.json({ok:true,message:'Product deactivated'});
}));

// 4. Product detail combines PostgreSQL product/variants and MongoDB reviews.
app.get('/api/products/:id',wrap(async(req,res)=>{
  const id=Number(req.params.id);
  if (!Number.isInteger(id)||id<1) return res.status(400).json({error:'Invalid product id'});
  const {rows}=await pool.query(
    `SELECT p.*,c.name AS category FROM products p
     JOIN categories c ON c.category_id=p.category_id WHERE p.product_id=$1`,[id]);
  if (!rows.length) return res.status(404).json({error:'Product not found'});
  const {rows:variants}=await pool.query(
    'SELECT variant_id,size,color,stock FROM variants WHERE product_id=$1 ORDER BY size,color',[id]);
  const reviews=await mongo().collection('reviews').find({productId:id},{projection:{_id:0}})
    .sort({createdAt:-1}).limit(20).toArray();
  const avgRating=reviews.length ? reviews.reduce((s,r)=>s+Number(r.rating),0)/reviews.length : null;
  mongo().collection('events').insertOne({type:'view',productId:id,ts:new Date(),device:'web',city:'Tashkent'})
    .catch(err=>console.error('event log failed:',err.message));
  res.json({...rows[0],variants,reviews,avgRating});
}));

// 5. Add review to MongoDB.
app.post('/api/products/:id/reviews',wrap(async(req,res)=>{
  const productId=Number(req.params.id), rating=Number(req.body.rating);
  const comment=String(req.body.comment||'').trim().slice(0,1000);
  const author=String(req.body.author||'Guest').trim().slice(0,80);
  if (!Number.isInteger(productId)||productId<1||!Number.isInteger(rating)||rating<1||rating>5||comment.length<3)
    return res.status(400).json({error:'Valid product, rating 1–5 and comment (at least 3 characters) are required'});
  const exists=await pool.query('SELECT 1 FROM products WHERE product_id=$1 AND is_active=true',[productId]);
  if (!exists.rowCount) return res.status(404).json({error:'Product not found'});
  await mongo().collection('reviews').insertOne({productId,rating,comment,author,createdAt:new Date(),tags:[]});
  res.status(201).json({ok:true});
}));

// 6. Place order with one PostgreSQL transaction and atomic stock checks.
app.post('/api/orders',wrap(async(req,res)=>{
  const {customer,items,paymentMethod='cash',couponCode}=req.body;
  if (!customer?.fullName||!customer?.email||!Array.isArray(items)||items.length===0)
    return res.status(400).json({error:'Customer name, email and at least one item are required'});
  if (!['cash','card','payme','click'].includes(paymentMethod))
    return res.status(400).json({error:'Unknown payment method'});
  if (items.length>20) return res.status(400).json({error:'Maximum 20 different items per order'});
  const client=await pool.connect();
  let customerId, orderId, total=0;
  try {
    await client.query('BEGIN');
    const c=await client.query(
      `INSERT INTO customers(full_name,email,phone,city) VALUES($1,$2,$3,COALESCE($4,'Tashkent'))
       ON CONFLICT(email) DO UPDATE SET full_name=EXCLUDED.full_name
       RETURNING customer_id`,
      [String(customer.fullName).slice(0,100),String(customer.email).slice(0,120),
       customer.phone?String(customer.phone).slice(0,20):null,customer.city?String(customer.city).slice(0,50):null]);
    customerId=c.rows[0].customer_id;
    let couponId=null,discount=0;
    if (couponCode) {
      const cp=await client.query(
        `SELECT coupon_id,discount_percent FROM coupons
         WHERE code=$1 AND is_active=true AND (expires_at IS NULL OR expires_at>=CURRENT_DATE)`,
        [String(couponCode).trim().toUpperCase()]);
      if (!cp.rowCount) throw Object.assign(new Error('Coupon is invalid or expired'),{status:400});
      couponId=cp.rows[0].coupon_id; discount=Number(cp.rows[0].discount_percent);
    }
    const o=await client.query(
      'INSERT INTO orders(customer_id,coupon_id) VALUES($1,$2) RETURNING order_id',[customerId,couponId]);
    orderId=o.rows[0].order_id;
    for (const item of items) {
      const variantId=Number(item.variantId), qty=Number(item.quantity);
      if (!Number.isInteger(variantId)||variantId<1||!Number.isInteger(qty)||qty<1||qty>20)
        throw Object.assign(new Error('Invalid variant or quantity'),{status:400});
      const p=await client.query(
        `UPDATE variants SET stock=stock-$1 WHERE variant_id=$2 AND stock>=$1
         RETURNING product_id,(SELECT price FROM products WHERE product_id=variants.product_id) AS price`,
        [qty,variantId]);
      if (!p.rowCount) throw Object.assign(new Error(`Not enough stock for variant ${variantId}`),{status:409});
      const price=Number(p.rows[0].price);
      total+=price*qty;
      await client.query(
        'INSERT INTO order_items(order_id,variant_id,quantity,unit_price) VALUES($1,$2,$3,$4)',
        [orderId,variantId,qty,price]);
      mongo().collection('events').insertOne({type:'add_to_cart',productId:p.rows[0].product_id,ts:new Date(),device:'web',city:customer.city||'Tashkent'})
        .catch(()=>{});
    }
    total=Number((total*(1-discount/100)).toFixed(2));
    await client.query('UPDATE orders SET total=$1,status=$2 WHERE order_id=$3',[total,'new',orderId]);
    await client.query('INSERT INTO payments(order_id,method,amount) VALUES($1,$2,$3)',[orderId,paymentMethod,total]);
    await client.query('COMMIT');
    res.status(201).json({ok:true,orderId,total,discountPercent:discount});
  } catch(err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}));
// ---------- Order history ----------
app.get('/api/orders', wrap(async (req, res) => {
  const email = String(req.query.email || '').trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ error: 'Customer email is required' });
  }

  const { rows } = await pool.query(
    `SELECT
        o.order_id,
        o.status,
        o.total,
        o.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'product', p.name,
              'quantity', oi.quantity,
              'unit_price', oi.unit_price,
              'size', v.size,
              'color', v.color
            )
          ) FILTER (WHERE oi.order_id IS NOT NULL),
          '[]'::json
        ) AS items
     FROM orders o
     JOIN customers c ON c.customer_id = o.customer_id
     LEFT JOIN order_items oi ON oi.order_id = o.order_id
     LEFT JOIN variants v ON v.variant_id = oi.variant_id
     LEFT JOIN products p ON p.product_id = v.product_id
     WHERE LOWER(c.email) = $1
     GROUP BY o.order_id
     ORDER BY o.created_at DESC`,
    [email]
  );

  res.json(rows);
}));

// 7. Customer order history.
app.get('/api/customers/:id/orders',wrap(async(req,res)=>{
  const id=Number(req.params.id);
  if (!Number.isInteger(id)||id<1) return res.status(400).json({error:'Invalid customer id'});
  const {rows}=await pool.query(
    `SELECT o.order_id,o.status,o.total,o.created_at,
      json_agg(json_build_object('product',p.name,'size',v.size,'color',v.color,
        'quantity',oi.quantity,'unit_price',oi.unit_price)) AS items
     FROM orders o JOIN order_items oi ON oi.order_id=o.order_id
     JOIN variants v ON v.variant_id=oi.variant_id
     JOIN products p ON p.product_id=v.product_id
     WHERE o.customer_id=$1 GROUP BY o.order_id ORDER BY o.created_at DESC`,[id]);
  res.json(rows);
}));

// 8. Sales by city from PostgreSQL.
app.get('/api/stats/sales-by-city',wrap(async(req,res)=>{
  const {rows}=await pool.query(
    `SELECT cu.city,COUNT(o.order_id)::int AS orders,SUM(o.total) AS revenue
     FROM orders o JOIN customers cu ON cu.customer_id=o.customer_id
     WHERE o.status<>'cancelled' GROUP BY cu.city ORDER BY revenue DESC`);
  res.json(rows);
}));

// 9. Top viewed products: MongoDB aggregation enriched with product names from PostgreSQL.
app.get('/api/stats/top-viewed',wrap(async(req,res)=>{
  const top=await mongo().collection('events').aggregate([
    {$match:{type:'view'}},{$group:{_id:'$productId',views:{$sum:1}}},
    {$sort:{views:-1}},{$limit:5}
  ]).toArray();
  const ids=top.map(x=>x._id);
  const {rows}=ids.length?await pool.query('SELECT product_id,name FROM products WHERE product_id=ANY($1::int[])',[ids]):{rows:[]};
  const names=Object.fromEntries(rows.map(x=>[x.product_id,x.name]));
  res.json(top.map(x=>({productId:x._id,name:names[x._id]||'Unknown',views:x.views})));
}));

// 10. Funnel from MongoDB.
app.get('/api/stats/funnel',wrap(async(req,res)=>{
  const rows=await mongo().collection('events').aggregate([
    {$group:{_id:'$type',count:{$sum:1}}},{$sort:{count:-1}}
  ]).toArray();
  res.json(Object.fromEntries(rows.map(x=>[x._id,x.count])));
}));

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Unknown API route' });
});

app.use((err,req,res,next)=>{
  console.error(err);
  res.status(err.status||500).json({error:err.status?err.message:'Internal server error'});
});

const port=Number(process.env.PORT)||3000;
await connectMongo();
await pool.query('SELECT 1');
app.listen(port,()=>console.log(`VELORA server running on http://localhost:${port}`));
