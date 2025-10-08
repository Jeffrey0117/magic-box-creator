-- 確保新欄位存在並設定預設值
-- 這個 migration 是冪等的（可重複執行）

-- 1. 確保 expires_at 欄位存在
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='keywords' AND column_name='expires_at'
    ) THEN
        ALTER TABLE keywords ADD COLUMN expires_at TIMESTAMP;
    END IF;
END $$;

-- 2. 確保 images 欄位存在
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='keywords' AND column_name='images'
    ) THEN
        ALTER TABLE keywords ADD COLUMN images TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
END $$;

-- 3. 確保現有資料的 images 欄位不是 NULL
UPDATE keywords SET images = ARRAY[]::TEXT[] WHERE images IS NULL;

-- 4. 驗證結果
DO $$
DECLARE
    expires_exists BOOLEAN;
    images_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='keywords' AND column_name='expires_at'
    ) INTO expires_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='keywords' AND column_name='images'
    ) INTO images_exists;
    
    IF NOT expires_exists THEN
        RAISE EXCEPTION 'expires_at 欄位新增失敗';
    END IF;
    
    IF NOT images_exists THEN
        RAISE EXCEPTION 'images 欄位新增失敗';
    END IF;
    
    RAISE NOTICE '✅ 欄位驗證成功: expires_at=%, images=%', expires_exists, images_exists;
END $$;