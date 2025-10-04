-- 建立 user_profiles 表（MVP：只含暱稱和自我介紹）
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text CHECK (char_length(display_name) >= 2 AND char_length(display_name) <= 20),
  bio text CHECK (char_length(bio) <= 200),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 建立索引
CREATE INDEX idx_user_profiles_display_name ON public.user_profiles(display_name);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS 政策：所有人可以查看 profiles（公開）
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.user_profiles FOR SELECT
  USING (true);

-- RLS 政策：用戶只能更新自己的 profile
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS 政策：用戶可以建立自己的 profile
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 建立 updated_at trigger
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 建立函數：自動為新用戶建立預設 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      split_part(NEW.email, '@', 1),
      'User'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 建立 trigger：新用戶註冊時自動建立 profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 註解
COMMENT ON TABLE public.user_profiles IS '用戶公開資料（暱稱、自我介紹）';
COMMENT ON COLUMN public.user_profiles.display_name IS '暱稱（2-20字元）';
COMMENT ON COLUMN public.user_profiles.bio IS '自我介紹（最多200字元）';