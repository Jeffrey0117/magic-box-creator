ALTER TABLE keywords
ADD COLUMN package_title TEXT,
ADD COLUMN package_description TEXT;

COMMENT ON COLUMN keywords.package_title IS '資料包標題（顯示在前台）';
COMMENT ON COLUMN keywords.package_description IS '資料包文字介紹（顯示在前台）';