-- PayGate 金流整合：會員等級三層化 + webhook 用的 email→user 查詢函數

-- 1. membership_tier 支援 free / standard / premium（原本只有 free / premium）
DO $$
DECLARE con TEXT;
BEGIN
  SELECT conname INTO con FROM pg_constraint
  WHERE conrelid = 'public.user_profiles'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%membership_tier%';
  IF con IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.user_profiles DROP CONSTRAINT %I', con);
  END IF;
END $$;

ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_membership_tier_check
CHECK (membership_tier IN ('free', 'standard', 'premium'));

COMMENT ON COLUMN public.user_profiles.membership_tier IS '會員等級: free=免費 / standard=標準版(NT$299) / premium=專業版(NT$599)';

-- 2. PayGate webhook 以 email 找 auth user id（SECURITY DEFINER，只開放 service_role）
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(user_email TEXT)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT id FROM auth.users WHERE lower(email) = lower(user_email) LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_user_id_by_email(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_id_by_email(TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_id_by_email(TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(TEXT) TO service_role;
