-- 新增限額功能
ALTER TABLE keywords ADD COLUMN IF NOT EXISTS quota INT DEFAULT NULL;

-- NULL = 無限制，數字 = 限制份數
COMMENT ON COLUMN keywords.quota IS '限額數量（NULL=無限制）';