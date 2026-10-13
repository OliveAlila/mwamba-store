-- Mwamba Store demo catalogue seed for an already-installed MySQL schema.
-- Safe to import more than once: unique slugs/SKUs and INSERT IGNORE prevent duplicates.
-- This does not delete or overwrite existing products.
SET NAMES utf8mb4;
START TRANSACTION;

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

INSERT IGNORE INTO products
  (category_id, name, slug, description, sku, price, compare_at_price, stock_quantity, image_url, status)
SELECT c.id, seed.name, seed.slug, seed.description, seed.sku, seed.price, seed.compare_at_price,
       seed.stock_quantity, seed.image_url, 'active'
FROM (
  SELECT 'Classic White Cotton Tee' AS name, 'classic-white-cotton-tee' AS slug,
         'A clean, versatile cotton tee for everyday outfits.' AS description, 'DEMO-FAS-001' AS sku,
         899.00 AS price, 1299.00 AS compare_at_price, 35 AS stock_quantity,
         'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=82' AS image_url,
         'fashion' AS category_slug
  UNION ALL SELECT 'Everyday Red Sneakers' AS name, 'everyday-red-sneakers' AS slug,
         'Comfortable casual sneakers to finish your everyday look.' AS description, 'DEMO-FAS-002' AS sku,
         2890.00 AS price, 4200.00 AS compare_at_price, 18 AS stock_quantity,
         'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=82' AS image_url,
         'fashion' AS category_slug
  UNION ALL SELECT 'Structured Everyday Handbag' AS name, 'structured-everyday-handbag' AS slug,
         'A structured handbag for work, campus and weekend plans.' AS description, 'DEMO-FAS-003' AS sku,
         2499.00 AS price, 3500.00 AS compare_at_price, 16 AS stock_quantity,
         'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=82' AS image_url,
         'fashion' AS category_slug
  UNION ALL SELECT 'Floral Summer Dress' AS name, 'floral-summer-dress' AS slug,
         'A light, easy-to-style dress for sunny days and outings.' AS description, 'DEMO-FAS-004' AS sku,
         2199.00 AS price, 3200.00 AS compare_at_price, 14 AS stock_quantity,
         'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&q=82' AS image_url,
         'fashion' AS category_slug
  UNION ALL SELECT 'Classic Denim Jacket' AS name, 'classic-denim-jacket' AS slug,
         'A timeless layering piece that works across seasons.' AS description, 'DEMO-FAS-005' AS sku,
         3299.00 AS price, 4500.00 AS compare_at_price, 12 AS stock_quantity,
         'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=700&q=82' AS image_url,
         'fashion' AS category_slug
  UNION ALL SELECT 'Everyday Statement Sunglasses' AS name, 'everyday-statement-sunglasses' AS slug,
         'Easy-to-wear sunglasses to complement casual outfits.' AS description, 'DEMO-FAS-006' AS sku,
         799.00 AS price, 1200.00 AS compare_at_price, 28 AS stock_quantity,
         'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=700&q=82' AS image_url,
         'fashion' AS category_slug
  UNION ALL SELECT 'Structured Daily Backpack' AS name, 'structured-daily-backpack' AS slug,
         'A practical backpack for commuting, study and daily essentials.' AS description, 'DEMO-FAS-007' AS sku,
         2199.00 AS price, 3200.00 AS compare_at_price, 14 AS stock_quantity,
         'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=82' AS image_url,
         'fashion' AS category_slug
  UNION ALL SELECT 'Minimal Classic Wristwatch' AS name, 'minimal-classic-wristwatch' AS slug,
         'A minimalist watch that pairs with smart and casual looks.' AS description, 'DEMO-FAS-008' AS sku,
         1899.00 AS price, 2800.00 AS compare_at_price, 17 AS stock_quantity,
         'https://images.unsplash.com/photo-1524592094714-0f065e20314?auto=format&fit=crop&w=700&q=82' AS image_url,
         'fashion' AS category_slug
) AS seed
INNER JOIN categories c ON c.slug = seed.category_slug;

COMMIT;

-- Verification: expected demo product count is 8 (unless you already had matching slugs).
SELECT id, name, sku, price, stock_quantity, status
FROM products
WHERE slug IN (
  'wireless-bluetooth-headphones',
  'everyday-classic-sneakers',
  'smart-watch-series-8',
  'minimal-ceramic-table-lamp',
  'daily-glow-skincare-set',
  'compact-portable-speaker',
  'structured-everyday-backpack',
  'non-stick-cookware-set'
)
ORDER BY name;
