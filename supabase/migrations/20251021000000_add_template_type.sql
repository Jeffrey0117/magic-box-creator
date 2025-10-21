-- 新增 template_type 欄位到 keywords 表
ALTER TABLE keywords
ADD COLUMN template_type TEXT DEFAULT 'default';

COMMENT ON COLUMN keywords.template_type IS '資料包頁面模板類型 (default, layout-1, layout-2, ...)';

-- 為現有資料設定預設值 (確保向下相容)
UPDATE keywords SET template_type = 'default' WHERE template_type IS NULL;