-- Add short_code column to keywords table
ALTER TABLE public.keywords
ADD COLUMN short_code TEXT;

-- Generate short codes for existing records (6 characters, unique)
UPDATE public.keywords
SET short_code = substring(md5(random()::text || id::text) from 1 for 6)
WHERE short_code IS NULL;

-- Make short_code NOT NULL and add UNIQUE constraint
ALTER TABLE public.keywords
ALTER COLUMN short_code SET NOT NULL,
ADD CONSTRAINT keywords_short_code_unique UNIQUE (short_code);

-- Create index for fast lookups
CREATE INDEX idx_keywords_short_code ON public.keywords(short_code);

-- Comment for documentation
COMMENT ON COLUMN public.keywords.short_code IS 'Short URL code (6-8 characters) for user-friendly sharing links';