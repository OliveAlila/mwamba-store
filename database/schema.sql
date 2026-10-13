-- Mwamba Store production schema for MySQL 8.0+ / compatible Hostinger MySQL.
-- Back up the database before applying schema changes to a live installation.
SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  status ENUM('active','disabled') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role_status (role, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  description VARCHAR(500) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_name (name),
  UNIQUE KEY uq_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id BIGINT UNSIGNED NULL,
  name VARCHAR(180) NOT NULL,
  slug VARCHAR(190) NOT NULL,
  description TEXT NULL,
  sku VARCHAR(100) NULL,
  price DECIMAL(12,2) NOT NULL,
  compare_at_price DECIMAL(12,2) NULL,
  stock_quantity INT UNSIGNED NOT NULL DEFAULT 0,
  image_url VARCHAR(2048) NULL,
  status ENUM('draft','active','archived') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_slug (slug),
  UNIQUE KEY uq_products_sku (sku),
  KEY idx_products_category_status (category_id, status),
  KEY idx_products_status_created (status, created_at),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT chk_products_price CHECK (price > 0),
  CONSTRAINT chk_products_compare_price CHECK (compare_at_price IS NULL OR compare_at_price >= price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_movements (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  quantity_delta INT NOT NULL,
  reason ENUM('restock','sale','return','correction','reservation_release') NOT NULL,
  reference_type VARCHAR(50) NULL,
  reference_id BIGINT UNSIGNED NULL,
  note VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_inventory_product_created (product_id, created_at),
  CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT fk_inventory_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  order_number VARCHAR(100) NOT NULL,
  status ENUM('pending_payment','payment_initialization_failed','processing','packed','shipped','delivered','cancelled','refunded','review_required') NOT NULL DEFAULT 'pending_payment',
  payment_status ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(12,2) NOT NULL,
  delivery_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'KES',
  delivery_phone VARCHAR(30) NOT NULL,
  delivery_address VARCHAR(500) NOT NULL,
  payment_reference VARCHAR(100) NOT NULL,
  payment_access_code VARCHAR(150) NULL,
  paid_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_number (order_number),
  UNIQUE KEY uq_orders_payment_reference (payment_reference),
  KEY idx_orders_user_created (user_id, created_at),
  KEY idx_orders_status_created (status, created_at),
  KEY idx_orders_payment_status (payment_status),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT chk_orders_total CHECK (total >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NULL,
  product_name VARCHAR(180) NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  line_total DECIMAL(12,2) GENERATED ALWAYS AS (unit_price * quantity) STORED,
  PRIMARY KEY (id),
  KEY idx_order_items_order (order_id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  CONSTRAINT chk_order_items_quantity CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  provider VARCHAR(30) NOT NULL,
  provider_reference VARCHAR(100) NOT NULL,
  event_type VARCHAR(60) NOT NULL,
  payload_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_payment_events_order (order_id, created_at),
  KEY idx_payment_events_reference (provider_reference),
  CONSTRAINT fk_payment_events_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS promotions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(160) NOT NULL,
  code VARCHAR(60) NULL,
  discount_type ENUM('percentage','fixed') NOT NULL,
  discount_value DECIMAL(12,2) NOT NULL,
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_promotions_code (code),
  KEY idx_promotions_active_dates (is_active, starts_at, ends_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO categories (name, slug) VALUES
('Phones & Tablets','phones-tablets'),
('Fashion','fashion'),
('Home & Living','home-living'),
('Electronics','electronics'),
('Beauty','beauty'),
('Sports & Outdoors','sports-outdoors'),
('Books & Stationery','books-stationery'),
('Baby & Kids','baby-kids'),
('Automotive','automotive'),
('Watches & Accessories','watches-accessories');

 
-- Idempotent demo catalogue so a fresh database has products to display.
-- Re-running this schema will not duplicate products because each slug is unique.
INSERT IGNORE INTO products
  (category_id, name, slug, description, sku, price, compare_at_price, stock_quantity, image_url, status)
SELECT c.id, seed.name, seed.slug, seed.description, seed.sku, seed.price, seed.compare_at_price,
       seed.stock_quantity, seed.image_url, 'active'
FROM (
  SELECT 'Wireless Bluetooth Headphones' AS name, 'wireless-bluetooth-headphones' AS slug,
         'Comfortable wireless headphones for everyday listening.' AS description, 'DEMO-AUD-001' AS sku,
         2499.00 AS price, 3999.00 AS compare_at_price, 24 AS stock_quantity,
         'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=82' AS image_url,
         'electronics' AS category_slug
  UNION ALL SELECT 'Everyday Classic Sneakers', 'everyday-classic-sneakers',
         'Versatile everyday sneakers with a clean, casual look.', 'DEMO-FAS-001',
         2890.00, 4200.00, 18,
         'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=82',
         'fashion'
  UNION ALL SELECT 'Smart Watch Series 8', 'smart-watch-series-8',
         'A smart everyday watch for activity and notifications.', 'DEMO-PHN-001',
         3599.00, 5500.00, 15,
         'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=82',
         'phones-tablets'
  UNION ALL SELECT 'Minimal Ceramic Table Lamp', 'minimal-ceramic-table-lamp',
         'A minimal table lamp for a warm, comfortable room.', 'DEMO-HOM-001',
         1850.00, 2500.00, 12,
         'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=82',
         'home-living'
  UNION ALL SELECT 'Daily Glow Skincare Set', 'daily-glow-skincare-set',
         'A skincare gift set for your daily self-care routine.', 'DEMO-BEA-001',
         1699.00, 2200.00, 20,
         'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=700&q=82',
         'beauty'
  UNION ALL SELECT 'Compact Portable Speaker', 'compact-portable-speaker',
         'A portable speaker for music at home or on the go.', 'DEMO-AUD-002',
         1999.00, 2800.00, 16,
         'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=82',
         'electronics'
  UNION ALL SELECT 'Structured Everyday Backpack', 'structured-everyday-backpack',
         'A practical backpack for commuting, study and daily use.', 'DEMO-FAS-002',
         2199.00, 3200.00, 14,
         'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=82',
         'fashion'
  UNION ALL SELECT 'Non-stick Cookware Set', 'non-stick-cookware-set',
         'A cookware set for everyday home meals.', 'DEMO-HOM-002',
         3299.00, 4500.00, 10,
         'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=700&q=82',
         'home-living'
) AS seed
INNER JOIN categories c ON c.slug = seed.category_slug;

-- Create the first administrator using the one-time bootstrap script:
-- ADMIN_NAME="Store Admin" ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="a-long-random-password" npm run create-admin
-- Never insert an admin with a plaintext password or allow public registration to select a role.