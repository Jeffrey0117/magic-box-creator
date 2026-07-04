-- 免費版資料包數量上限（後端硬性限制，防止繞過前端直接 insert）
-- 免費版最多 3 個；standard / premium 無限。以 BEFORE INSERT trigger 在資料庫層強制。

CREATE OR REPLACE FUNCTION public.enforce_free_package_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_tier TEXT;
  current_count INT;
BEGIN
  -- 取該創作者的會員等級（查不到 profile 視為 free）
  SELECT membership_tier INTO user_tier
  FROM public.user_profiles
  WHERE id = NEW.creator_id;

  IF user_tier IS NULL THEN
    user_tier := 'free';
  END IF;

  -- 付費方案不限量
  IF user_tier <> 'free' THEN
    RETURN NEW;
  END IF;

  -- 免費版：已達 3 個就擋
  SELECT COUNT(*) INTO current_count
  FROM public.keywords
  WHERE creator_id = NEW.creator_id;

  IF current_count >= 3 THEN
    RAISE EXCEPTION 'FREE_PACKAGE_LIMIT_REACHED: 免費版最多 3 個資料包，請升級標準版'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_free_package_limit ON public.keywords;
CREATE TRIGGER trg_enforce_free_package_limit
  BEFORE INSERT ON public.keywords
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_free_package_limit();
