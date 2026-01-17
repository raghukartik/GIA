CREATE VIEW effective_item_tax AS
SELECT
  i.id AS item_id,
  COALESCE(sc.tax_percentage, c.tax_percentage) AS effective_tax_percentage,
  COALESCE(sc.tax_applicable, c.tax_applicable) AS tax_applicable
FROM items i
JOIN subcategory sc ON i.subcategory_id = sc.id
JOIN category c ON sc.category_id = c.id;