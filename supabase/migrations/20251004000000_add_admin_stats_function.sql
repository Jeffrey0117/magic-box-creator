-- 建立 Admin 統計函數
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  -- 檢查是否為 admin
  IF auth.email() NOT IN ('jeffbao860623@gmail.com') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT json_build_object(
    'total_users', (SELECT count(*) FROM auth.users),
    'weekly_users', (
      SELECT count(*) 
      FROM auth.users 
      WHERE created_at >= now() - interval '7 days'
    ),
    'total_keywords', (SELECT count(*) FROM public.keywords),
    'weekly_keywords', (
      SELECT count(*) 
      FROM public.keywords 
      WHERE created_at >= now() - interval '7 days'
    ),
    'total_creators', (
      SELECT count(DISTINCT creator_id) 
      FROM public.keywords
    ),
    'total_claims', (SELECT count(*) FROM public.email_logs),
    'today_claims', (
      SELECT count(*) 
      FROM public.email_logs 
      WHERE unlocked_at >= CURRENT_DATE
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 允許 admin 查看所有 keywords
CREATE POLICY "Admin can view all keywords"
  ON public.keywords FOR SELECT
  USING (
    auth.email() IN ('jeffbao860623@gmail.com')
  );

-- 允許 admin 查看所有 email_logs
CREATE POLICY "Admin can view all email_logs"
  ON public.email_logs FOR SELECT
  USING (
    auth.email() IN ('jeffbao860623@gmail.com')
  );