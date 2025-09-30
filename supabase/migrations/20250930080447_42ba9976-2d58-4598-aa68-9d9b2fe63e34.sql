-- Create keywords table for creator to manage keyword-content pairs
CREATE TABLE public.keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  keyword text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(creator_id, keyword)
);

-- Create email_logs table to track who unlocked what
CREATE TABLE public.email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id uuid REFERENCES public.keywords(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  unlocked_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for keywords table
-- Creators can view their own keywords
CREATE POLICY "Creators can view own keywords"
  ON public.keywords FOR SELECT
  USING (auth.uid() = creator_id);

-- Creators can insert their own keywords
CREATE POLICY "Creators can insert own keywords"
  ON public.keywords FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Creators can update their own keywords
CREATE POLICY "Creators can update own keywords"
  ON public.keywords FOR UPDATE
  USING (auth.uid() = creator_id);

-- Creators can delete their own keywords
CREATE POLICY "Creators can delete own keywords"
  ON public.keywords FOR DELETE
  USING (auth.uid() = creator_id);

-- Anyone can search keywords (for box page)
CREATE POLICY "Anyone can search keywords"
  ON public.keywords FOR SELECT
  USING (true);

-- RLS Policies for email_logs
-- Only authenticated users can view logs
CREATE POLICY "Creators can view all logs"
  ON public.email_logs FOR SELECT
  USING (auth.uid() IN (SELECT creator_id FROM public.keywords WHERE id = keyword_id));

-- Anyone can insert email logs
CREATE POLICY "Anyone can log emails"
  ON public.email_logs FOR INSERT
  WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add trigger to keywords table
CREATE TRIGGER update_keywords_updated_at
  BEFORE UPDATE ON public.keywords
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();