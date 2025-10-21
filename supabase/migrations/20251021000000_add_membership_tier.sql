-- 新增會員等級欄位到 user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS membership_tier TEXT DEFAULT 'free' CHECK (membership_tier IN ('free', 'premium'));

COMMENT ON COLUMN user_profiles.membership_tier IS '會員等級: free=免費會員 / premium=付費會員';

-- 更新現有用戶為免費會員
UPDATE user_profiles
SET membership_tier = 'free'
WHERE membership_tier IS NULL;