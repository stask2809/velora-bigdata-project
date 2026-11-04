-- VELORA: 20 SQL practice queries. Run each numbered block separately.
-- Q1 CREATE: add a temporary customer for CRUD practice.
INSERT INTO customers(full_name,email,city)
VALUES ('Test Customer','crud.test@velora.uz','Tashkent')
RETURNING customer_id;

-- Q2 READ: show products under 400,000 UZS, cheapest first.
SELECT product_id,name,price FROM products
WHERE price < 400000 ORDER BY price ASC;

-- Q3 UPDATE: give the Summer Light collection a temporary 5% price reduction.
UPDATE products SET price = ROUND(price * 0.95,2)
WHERE collection_id = (SELECT collection_id FROM collections WHERE name='Summer Light');

-- Q4 DELETE: remove the temporary CRUD customer created by Q1.
DELETE FROM customers WHERE email='crud.test@velora.uz';

-- Q5 JOIN: list each product and its category.
SELECT p.name,c.name AS category,p.price
FROM products p JOIN categories c ON c.category_id=p.category_id
ORDER BY c.name,p.name;

-- Q6 JOIN (4 tables): show customers, order IDs, products and quantities.
SELECT o.order_id,cu.full_name,p.name,oi.quantity,oi.unit_price
FROM orders o
JOIN customers cu ON cu.customer_id=o.customer_id
JOIN order_items oi ON oi.order_id=o.order_id
JOIN variants v ON v.variant_id=oi.variant_id
JOIN products p ON p.product_id=v.product_id
ORDER BY o.order_id;

-- Q7 LEFT JOIN: find customers who have never placed an order.
SELECT cu.full_name,cu.city
FROM customers cu LEFT JOIN orders o ON o.customer_id=cu.customer_id
WHERE o.order_id IS NULL;

-- Q8 M:N JOIN: products saved in each customer's wishlist.
SELECT cu.full_name,p.name AS wishlist_product
FROM wishlists w
JOIN customers cu ON cu.customer_id=w.customer_id
JOIN wishlist_items wi ON wi.wishlist_id=w.wishlist_id
JOIN products p ON p.product_id=wi.product_id
ORDER BY cu.full_name;

-- Q9 JOIN: list variants and available stock.
SELECT p.name,v.size,v.color,v.stock
FROM variants v JOIN products p ON p.product_id=v.product_id
ORDER BY p.name,v.size;

-- Q10 JOIN: orders with payment method.
SELECT o.order_id,cu.full_name,o.total,pa.method,pa.paid_at
FROM orders o JOIN customers cu ON cu.customer_id=o.customer_id
LEFT JOIN payments pa ON pa.order_id=o.order_id
ORDER BY o.created_at DESC;

-- Q11 GROUP BY: product count and average price per category.
SELECT c.name,COUNT(p.product_id) AS products,ROUND(AVG(p.price),2) AS avg_price
FROM categories c LEFT JOIN products p ON p.category_id=c.category_id
GROUP BY c.name ORDER BY c.name;

-- Q12 GROUP BY: total revenue by city (exclude cancelled orders).
SELECT cu.city,COUNT(o.order_id) AS orders,SUM(o.total) AS revenue
FROM orders o JOIN customers cu ON cu.customer_id=o.customer_id
WHERE o.status<>'cancelled' GROUP BY cu.city ORDER BY revenue DESC;

-- Q13 GROUP BY + HAVING: collections with at least two products.
SELECT co.name,COUNT(p.product_id) AS product_count
FROM collections co JOIN products p ON p.collection_id=co.collection_id
GROUP BY co.name HAVING COUNT(p.product_id)>=2;

-- Q14 GROUP BY: total units sold by product.
SELECT p.name,SUM(oi.quantity) AS units_sold
FROM order_items oi JOIN variants v ON v.variant_id=oi.variant_id
JOIN products p ON p.product_id=v.product_id
GROUP BY p.name ORDER BY units_sold DESC;

-- Q15 VIEW: reusable stock summary by product.
CREATE OR REPLACE VIEW v_velora_stock AS
SELECT p.product_id,p.name,COALESCE(SUM(v.stock),0)::int AS total_stock
FROM products p LEFT JOIN variants v ON v.product_id=p.product_id
GROUP BY p.product_id,p.name;
SELECT * FROM v_velora_stock ORDER BY total_stock DESC;

-- Q16 WINDOW: rank products by price inside each category.
SELECT c.name AS category,p.name,p.price,
       RANK() OVER(PARTITION BY c.category_id ORDER BY p.price DESC) AS price_rank
FROM products p JOIN categories c ON c.category_id=p.category_id;

-- Q17 WINDOW: running revenue by order date.
SELECT order_id,created_at,total,
       SUM(total) OVER(ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_revenue
FROM orders WHERE status<>'cancelled';

-- Q18 SUBQUERY: products priced above the overall average.
SELECT name,price FROM products
WHERE price>(SELECT AVG(price) FROM products) ORDER BY price DESC;

-- Q19 TRANSACTION: safely reduce stock for one variant, then commit.
BEGIN;
UPDATE variants SET stock=stock-1 WHERE variant_id=1 AND stock>=1;
-- Check the affected row count in pgAdmin. If 0 rows were affected, use ROLLBACK instead.
COMMIT;

-- Q20 FREE BUSINESS QUERY: active coupons and their discount value.
SELECT code,discount_percent,expires_at
FROM coupons WHERE is_active=true AND (expires_at IS NULL OR expires_at>=CURRENT_DATE)
ORDER BY discount_percent DESC;
