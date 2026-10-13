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
