-- Admin RLS Policies for KeyBox

-- Allow admin to view all keywords
CREATE POLICY "Admin can view all keywords"
ON keywords FOR SELECT
USING (
  auth.jwt() ->> 'email' = 'jeffby8@gmail.com'
);

-- Allow admin to view all email_logs
CREATE POLICY "Admin can view all email_logs"
ON email_logs FOR SELECT
USING (
  auth.jwt() ->> 'email' = 'jeffby8@gmail.com'
);

-- Admin email: jeffby8@gmail.com
-- This policy allows the admin to bypass normal RLS restrictions and view all data