-- VELORA clothing brand — PostgreSQL schema
-- WARNING: rerunning this file drops the project tables and their data.
DROP TABLE IF EXISTS payments, order_items, orders, wishlist_items, wishlists,
                     coupons, variants, products, collections, categories, customers CASCADE;

CREATE TABLE customers (
  customer_id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  phone VARCHAR(20),
  city VARCHAR(50) NOT NULL DEFAULT 'Tashkent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  category_id SERIAL PRIMARY KEY,
  name VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE collections (
  collection_id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  season VARCHAR(20) NOT NULL CHECK (season IN ('spring','summer','autumn','winter','all-season')),
  launch_date DATE
);

CREATE TABLE products (
  product_id SERIAL PRIMARY KEY,
  category_id INT NOT NULL REFERENCES categories(category_id),
  collection_id INT REFERENCES collections(collection_id),
  name VARCHAR(120) NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE variants (
  variant_id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  size VARCHAR(10) NOT NULL CHECK (size IN ('XS','S','M','L','XL','XXL','One Size')),
  color VARCHAR(30) NOT NULL,
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  UNIQUE(product_id, size, color)
);

CREATE TABLE coupons (
  coupon_id SERIAL PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  discount_percent INT NOT NULL CHECK (discount_percent BETWEEN 1 AND 80),
  expires_at DATE,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE wishlists (
  wishlist_id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL UNIQUE REFERENCES customers(customer_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- M:N relation: one wishlist contains many products, one product can be in many wishlists.
CREATE TABLE wishlist_items (
  wishlist_id INT NOT NULL REFERENCES wishlists(wishlist_id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(wishlist_id, product_id)
);

CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES customers(customer_id),
  coupon_id INT REFERENCES coupons(coupon_id),
  status VARCHAR(20) NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','paid','processing','shipped','delivered','cancelled')),
  total NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- M:N relation: one order can contain many variants; a variant can appear in many orders.
CREATE TABLE order_items (
  order_id INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  variant_id INT NOT NULL REFERENCES variants(variant_id),
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  PRIMARY KEY(order_id, variant_id)
);

CREATE TABLE payments (
  payment_id SERIAL PRIMARY KEY,
  order_id INT NOT NULL UNIQUE REFERENCES orders(order_id) ON DELETE CASCADE,
  method VARCHAR(20) NOT NULL CHECK (method IN ('cash','card','payme','click')),
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_collection ON products(collection_id);
CREATE INDEX idx_variants_product ON variants(product_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_order_items_variant ON order_items(variant_id);
CREATE INDEX idx_wishlist_items_product ON wishlist_items(product_id);
