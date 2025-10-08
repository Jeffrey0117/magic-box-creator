-- Add images column to keywords table
ALTER TABLE keywords
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[];

COMMENT ON COLUMN keywords.images IS '資料包圖片 URL（最多 5 張）';

-- Ensure creator_id exists and can join with user_profiles
-- (Should already exist, this is just for documentation)
-- creator_id references auth.users(id)