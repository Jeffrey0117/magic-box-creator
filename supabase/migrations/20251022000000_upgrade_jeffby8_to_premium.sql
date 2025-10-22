-- 將 jeffby8 用戶升級為 premium 會員
-- 這將允許該用戶使用所有進階模板

-- 根據 email 或 username 更新會員等級
UPDATE user_profiles
SET membership_tier = 'premium'
WHERE id IN (
  SELECT id 
  FROM auth.users 
  WHERE email LIKE '%jeffby8%' 
     OR raw_user_meta_data->>'username' LIKE '%jeffby8%'
     OR raw_user_meta_data->>'name' LIKE '%jeffby8%'
);

-- 驗證更新結果
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM user_profiles
  WHERE membership_tier = 'premium'
    AND id IN (
      SELECT id 
      FROM auth.users 
      WHERE email LIKE '%jeffby8%' 
         OR raw_user_meta_data->>'username' LIKE '%jeffby8%'
         OR raw_user_meta_data->>'name' LIKE '%jeffby8%'
    );
  
  RAISE NOTICE '已更新 % 個 jeffby8 相關帳號為 premium 會員', updated_count;
END $$;