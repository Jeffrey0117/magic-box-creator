ALTER TABLE keywords
ADD COLUMN required_fields JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN keywords.required_fields IS '領取者必填欄位設定，例如 {"nickname": true, "phone": false}';