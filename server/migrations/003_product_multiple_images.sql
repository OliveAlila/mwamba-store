-- Add support for up to 10 ordered images per product.
-- Keep image_url as the primary image for backwards compatibility.
ALTER TABLE products
  ADD COLUMN images_json JSON NULL AFTER image_url;

UPDATE products
SET images_json = JSON_ARRAY(image_url)
WHERE image_url IS NOT NULL AND image_url <> '' AND images_json IS NULL;
