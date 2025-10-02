-- Fix email_logs DELETE policy
-- Problem: 目前沒有任何 DELETE policy，導致創作者無法刪除領取記錄

-- Drop existing policies for email_logs (if any)
DROP POLICY IF EXISTS "Creators can delete their keyword logs" ON public.email_logs;

-- Create new DELETE policy allowing creators to delete logs for their keywords
CREATE POLICY "Creators can delete their keyword logs"
  ON public.email_logs FOR DELETE
  TO authenticated
  USING (
    keyword_id IN (
      SELECT id FROM public.keywords WHERE creator_id = auth.uid()
    )
  );