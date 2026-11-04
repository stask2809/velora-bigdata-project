-- VELORA Big Data experiment: generate 500,000 product view events.
-- Run each numbered section separately and record your actual timings.
DROP TABLE IF EXISTS product_view_log;
CREATE TABLE product_view_log (
  event_id BIGSERIAL PRIMARY KEY,
  product_id INT NOT NULL,
  city VARCHAR(50) NOT NULL,
  device VARCHAR(20) NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL
);

-- Generate 500,000 realistic demo events.
INSERT INTO product_view_log(product_id,city,device,viewed_at)
SELECT 1+floor(random()*12)::int,
       (ARRAY['Tashkent','Samarkand','Bukhara','Namangan','Andijan','Fergana','Khiva','Nukus'])[1+floor(random()*8)::int],
       (ARRAY['android','ios','desktop'])[1+floor(random()*3)::int],
       now()-random()*interval '365 days'
FROM generate_series(1,500000);

ANALYZE product_view_log;
SELECT COUNT(*) FROM product_view_log;

-- BEFORE index: run EXPLAIN ANALYZE and save the output/screenshot.
EXPLAIN ANALYZE
SELECT * FROM product_view_log
WHERE city='Tashkent' AND product_id=3;

-- Create a composite index for the exact filter above.
CREATE INDEX idx_view_city_product ON product_view_log(city,product_id);
ANALYZE product_view_log;

-- AFTER index: run the same query and compare Execution Time / rows scanned.
EXPLAIN ANALYZE
SELECT * FROM product_view_log
WHERE city='Tashkent' AND product_id=3;
