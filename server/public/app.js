const money = n => new Intl.NumberFormat('uz-UZ').format(Number(n)) + " UZS";
const getCart = () => JSON.parse(localStorage.getItem('veloraCart') || '[]');
const saveCart = cart => { localStorage.setItem('veloraCart',JSON.stringify(cart)); updateCartCount(); };
function updateCartCount(){const el=document.getElementById('cart-count');if(el)el.textContent=getCart().reduce((s,x)=>s+x.quantity,0);}
async function api(url,options={}){const r=await fetch(url,{headers:{'Content-Type':'application/json'},...options});const data=await r.json();if(!r.ok)throw new Error(data.error||'Request failed');return data;}
function safeText(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

async function loadHome(){
 const grid=document.getElementById('products');if(!grid)return;
 const cats=await api('/api/categories');const select=document.getElementById('category');
 cats.forEach(c=>{const o=document.createElement('option');o.value=c.category_id;o.textContent=c.name;select.appendChild(o);});
 async function load(){const q=document.getElementById('search').value;const category=select.value;const params=new URLSearchParams();if(q)params.set('q',q);if(category)params.set('category',category);
 const products=await api('/api/products?'+params.toString());
 grid.innerHTML=products.map(p=>`<article class="product-card"><a href="/product.html?id=${p.product_id}"><img src="${safeText(p.image_url||'')}" alt="${safeText(p.name)}"><div class="product-info"><h3>${safeText(p.name)}</h3><p>${safeText(p.category)}</p><p class="price">${money(p.price)}</p><p>${p.stock} in stock</p></div></a></article>`).join('');}
 document.getElementById('search').addEventListener('input',load);select.addEventListener('change',load);await load();
}
async function loadProduct(){
 const root=document.getElementById('product-detail');if(!root)return;
 try{const id=new URLSearchParams(location.search).get('id');const p=await api('/api/products/'+id);
 root.innerHTML=`<div class="detail"><img src="${safeText(p.image_url)}" alt="${safeText(p.name)}"><div class="detail-copy"><p class="eyebrow">${safeText(p.category)}</p><h1>${safeText(p.name)}</h1><p>${safeText(p.description)}</p><h2>${money(p.price)}</h2><p>Rating: ${p.avgRating?Number(p.avgRating).toFixed(1)+'/5':'No ratings yet'}</p><h3>Select size and colour</h3><div class="variant-row">${p.variants.map(v=>`<label><input type="radio" name="variant" value="${v.variant_id}" ${v.stock<1?'disabled':''}> ${safeText(v.size)} · ${safeText(v.color)} (${v.stock})</label>`).join('')}</div><button id="add" class="button">ADD TO CART</button><h3>Customer reviews</h3><div>${p.reviews.map(r=>`<p><b>${safeText(r.author)}</b> · ${r.rating}/5<br>${safeText(r.comment)}</p>`).join('')||'No reviews yet.'}</div><form id="review"><h3>Leave a review</h3><input name="author" placeholder="Your name"><input name="rating" type="number" min="1" max="5" placeholder="Rating 1–5" required><textarea name="comment" placeholder="Your review" required></textarea><button class="small-button">Submit review</button><p id="review-msg"></p></form></div></div>`;
 document.getElementById('add').onclick=()=>{const chosen=document.querySelector('input[name="variant"]:checked');if(!chosen){alert('Please select an available size and colour.');return;}const cart=getCart();const item=cart.find(x=>x.variantId===Number(chosen.value));if(item)item.quantity++;else cart.push({variantId:Number(chosen.value),productId:p.product_id,name:p.name,price:Number(p.price),quantity:1});saveCart(cart);alert('Added to cart');};
 document.getElementById('review').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);try{await api(`/api/products/${id}/reviews`,{method:'POST',body:JSON.stringify({author:f.get('author'),rating:Number(f.get('rating')),comment:f.get('comment')})});document.getElementById('review-msg').textContent='Review submitted.';e.target.reset();}catch(err){document.getElementById('review-msg').textContent=err.message;}};
 }catch(e){root.textContent=e.message;}
}
function loadCart(){
 const root=document.getElementById('cart-items');if(!root)return;
 const cart=getCart();root.innerHTML=cart.length?cart.map(x=>`<div class="cart-row"><span>${safeText(x.name)} · Variant ${x.variantId} × ${x.quantity}</span><b>${money(x.price*x.quantity)}</b></div>`).join(''):'Your cart is empty.';
 document.getElementById('checkout').onclick=async()=>{const customer={fullName:document.getElementById('fullName').value,email:document.getElementById('email').value,phone:document.getElementById('phone').value,city:document.getElementById('city').value};const msg=document.getElementById('checkout-message');
 try{const result=await api('/api/orders',{method:'POST',body:JSON.stringify({customer,items:cart.map(x=>({variantId:x.variantId,quantity:x.quantity})),couponCode:document.getElementById('coupon').value,paymentMethod:document.getElementById('payment').value})});saveCart([]);root.textContent='';msg.textContent=`Order #${result.orderId} created. Total: ${money(result.total)}.`;}catch(e){msg.textContent=e.message;}};
}
async function loadDashboard(){
 const city=document.getElementById('sales-city');if(!city)return;
 const [sales,top,funnel]=await Promise.all([api('/api/stats/sales-by-city'),api('/api/stats/top-viewed'),api('/api/stats/funnel')]);
 city.innerHTML=sales.map(x=>`${safeText(x.city)}: ${x.orders} orders · ${money(x.revenue)}`).join('<br>')||'No sales yet';
 document.getElementById('top-viewed').innerHTML=top.map(x=>`${safeText(x.name)}: ${x.views} views`).join('<br>')||'No views yet';
 document.getElementById('funnel').innerHTML=Object.entries(funnel).map(([k,v])=>`${safeText(k)}: ${v}`).join('<br>')||'No events yet';
    
  }

async function loadOrders() {
  const root = document.getElementById('orders');
  if (!root) return;

  try {
    const customerId = 13;
    const orders = await api(`/api/customers/${customerId}/orders`);

    if (!orders.length) {
      root.textContent = 'No orders yet.';
      return;
    }

    root.innerHTML = orders.map(order => `
      <article class="panel" style="margin-bottom:20px;padding:24px">
        <h2>Order #${safeText(order.order_id)}</h2>
        <p>Status: ${safeText(order.status)}</p>
        <p>Date: ${safeText(order.created_at)}</p>
        <h3>${money(order.total)}</h3>
        ${(order.items || []).map(item => `
          <p>
            ${safeText(item.product)} ·
            ${safeText(item.size)} ·
            ${safeText(item.color)} ·
            Quantity: ${safeText(item.quantity)}
          </p>
        `).join('')}
      </article>
    `).join('');
  } catch (error) {
    root.textContent = error.message;
  }
}


updateCartCount();loadHome().catch(e=>console.error(e));loadProduct();loadCart();loadDashboard().catch(e=>console.error(e));loadOrders();
