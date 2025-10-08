-- 在 user_profiles 表新增 social_link 欄位
ALTER TABLE public.user_profiles
ADD COLUMN social_link text CHECK (char_length(social_link) <= 200);

-- 註解
COMMENT ON COLUMN public.user_profiles.social_link IS '社群平台連結（最多200字元）';