-- VELORA sample data. Run after 01_schema.sql.
INSERT INTO categories(name) VALUES
('T-shirts'),('Shirts'),('Hoodies'),('Trousers'),('Jeans'),('Outerwear');

INSERT INTO collections(name,season,launch_date) VALUES
('Essential Form','all-season','2026-01-15'),
('Urban Autumn','autumn','2026-09-01'),
('Summer Light','summer','2026-05-01'),
('Winter Layers','winter','2026-11-01');

INSERT INTO customers(full_name,email,phone,city) VALUES
('Aziza Karimova','aziza.k@example.uz','+998901112233','Tashkent'),
('Bekzod Tursunov','bekzod.t@example.uz','+998935556677','Samarkand'),
('Dilnoza Rahimova','dilnoza.r@example.uz','+998977778899','Bukhara'),
('Jasur Aliyev','jasur.a@example.uz','+998901234567','Tashkent'),
('Malika Yusupova','malika.y@example.uz','+998991112244','Namangan'),
('Otabek Ergashev','otabek.e@example.uz','+998903334455','Andijan'),
('Sevara Nazarova','sevara.n@example.uz','+998946667788','Fergana'),
('Timur Saidov','timur.s@example.uz','+998909998877','Tashkent'),
('Zarina Islomova','zarina.i@example.uz','+998931231231','Khiva'),
('Sardor Qodirov','sardor.q@example.uz','+998935551122','Nukus');

INSERT INTO products(category_id,collection_id,name,description,price,image_url) VALUES
(1,1,'Core Cotton T-Shirt','Heavyweight 100% cotton everyday T-shirt.',189000,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900'),
(2,1,'Relaxed Oxford Shirt','Relaxed fit cotton Oxford shirt.',329000,'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=900'),
(3,2,'Urban Essential Hoodie','Soft brushed fleece hoodie.',459000,'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900'),
(4,1,'Straight Fit Trousers','Minimal straight-leg trousers.',389000,'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=900'),
(5,2,'Classic Denim Jeans','Straight fit mid-blue denim.',429000,'https://images.unsplash.com/photo-1542272604-787c3835535d?w=900'),
(6,4,'Wool Blend Coat','Clean silhouette wool blend coat.',899000,'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=900'),
(1,3,'Summer Boxy Tee','Lightweight oversized summer T-shirt.',169000,'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=900'),
(3,4,'Heavyweight Zip Hoodie','Warm zip hoodie for cold days.',529000,'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=900'),
(4,2,'Cargo Utility Pants','Utility pockets and relaxed fit.',499000,'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=900'),
(2,3,'Linen Blend Shirt','Breathable shirt for warm weather.',349000,'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=900'),
(5,1,'Washed Black Jeans','Washed black everyday denim.',449000,'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=900'),
(6,4,'Puffer Jacket','Lightweight padded winter jacket.',799000,'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=900');

-- Multiple size/color variants for every product (24 rows).
INSERT INTO variants(product_id,size,color,stock) VALUES
(1,'S','White',12),(1,'M','White',18),(1,'L','Black',10),
(2,'M','White',8),(2,'L','Blue',7),
(3,'M','Grey',10),(3,'L','Black',9),
(4,'M','Black',8),(4,'L','Beige',10),
(5,'M','Blue',14),(5,'L','Blue',11),
(6,'L','Black',4),(6,'XL','Black',3),
(7,'S','Cream',16),(7,'M','Cream',20),
(8,'L','Charcoal',6),(8,'XL','Black',5),
(9,'M','Olive',9),(9,'L','Black',8),
(10,'M','White',7),(10,'L','Beige',6),
(11,'M','Black',13),(11,'L','Black',12),
(12,'L','Black',5),(12,'XL','Black',4);

INSERT INTO coupons(code,discount_percent,expires_at) VALUES
('VELORA10',10,'2027-12-31'),
('WELCOME15',15,'2027-06-30'),
('AUTUMN20',20,'2026-12-31');

INSERT INTO wishlists(customer_id) VALUES (1),(2),(3),(4),(5);
INSERT INTO wishlist_items(wishlist_id,product_id) VALUES
(1,1),(1,3),(1,6),(2,2),(2,5),(3,7),(3,10),(4,4),(5,8);

INSERT INTO orders(customer_id,coupon_id,status,total,created_at) VALUES
(1,1,'paid',359100,now()-interval '5 days'),
(2,NULL,'delivered',758000,now()-interval '3 days'),
(3,3,'processing',343200,now()-interval '1 day'),
(4,NULL,'paid',429000,now()-interval '12 hours'),
(5,2,'new',390150,now()-interval '3 hours');

INSERT INTO order_items(order_id,variant_id,quantity,unit_price) VALUES
(1,1,1,189000),(1,6,1,459000),
(2,4,1,329000),(2,10,1,429000),
(3,14,2,169000),
(4,10,1,429000),
(5,8,1,389000);

INSERT INTO payments(order_id,method,amount) VALUES
(1,'click',359100),(2,'card',758000),(3,'payme',343200),(4,'cash',429000);
