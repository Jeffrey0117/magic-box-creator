ALTER TABLE email_logs
ADD COLUMN extra_data JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN email_logs.extra_data IS '領取者額外填寫的資料，例如 {"nickname": "小明", "phone": "0912345678"}';