-- 新增大頭貼欄位到 user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN user_profiles.avatar_url IS '使用者大頭貼圖片 URL';