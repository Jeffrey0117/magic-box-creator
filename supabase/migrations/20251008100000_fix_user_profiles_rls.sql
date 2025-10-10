-- 確保 user_profiles 的 RLS 政策正確設定
-- 先刪除舊政策（如果存在）
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;

-- 重新建立：所有人（包含未登入用戶）都可以查看 profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.user_profiles FOR SELECT
  USING (true);

-- 確認 RLS 已啟用
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;