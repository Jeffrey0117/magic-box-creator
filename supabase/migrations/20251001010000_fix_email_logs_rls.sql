-- Fix RLS Policy for email_logs to allow authenticated users to insert
-- Problem: Current policy "Anyone can log emails" uses true but RLS is blocking authenticated inserts

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Anyone can log emails" ON public.email_logs;

-- Create new policy allowing authenticated users to insert
CREATE POLICY "Authenticated users can log emails"
  ON public.email_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also allow anonymous users to insert (for non-logged-in unlock)
CREATE POLICY "Anonymous users can log emails"
  ON public.email_logs FOR INSERT
  TO anon
  WITH CHECK (true);