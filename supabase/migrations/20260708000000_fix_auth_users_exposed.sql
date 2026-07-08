-- Fix Supabase advisor: auth_users_exposed
-- user_stats view exposed auth.users emails to every authenticated user.
-- Replace with an admin-gated SECURITY DEFINER RPC; frontend switches to rpc('get_user_stats').

DROP VIEW IF EXISTS public.user_stats;

CREATE OR REPLACE FUNCTION public.get_user_stats()
RETURNS TABLE (
  user_id uuid,
  email text,
  display_name text,
  keyword_count bigint,
  total_claims bigint,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    u.id,
    u.email::text,
    up.display_name,
    COUNT(DISTINCT k.id),
    COALESCE(SUM(k.current_count), 0)::bigint,
    u.created_at
  FROM auth.users u
  LEFT JOIN public.user_profiles up ON u.id = up.id
  LEFT JOIN public.keywords k ON u.id = k.creator_id
  WHERE lower(coalesce(auth.jwt() ->> 'email', '')) = 'jeffby8@gmail.com'
  GROUP BY u.id, u.email, up.display_name, u.created_at;
$$;

REVOKE ALL ON FUNCTION public.get_user_stats() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_stats() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_user_stats() TO authenticated;

-- get_user_email can also leak any user's email; frontend never calls it → lock it down
-- IF it exists (it was defined in an old migration that may never have run on this DB).
DO $$
DECLARE
  fn regprocedure;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'get_user_email'
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn);
  END LOOP;
END $$;
