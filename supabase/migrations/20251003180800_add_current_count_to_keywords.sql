-- Add current_count column to keywords table for caching claim count
ALTER TABLE keywords 
ADD COLUMN current_count INTEGER DEFAULT 0;

-- Initialize current_count for existing keywords
UPDATE keywords k
SET current_count = (
  SELECT COUNT(*)
  FROM email_logs e
  WHERE e.keyword_id = k.id
);

-- Create trigger function to automatically update current_count
CREATE OR REPLACE FUNCTION update_keyword_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE keywords 
    SET current_count = current_count + 1
    WHERE id = NEW.keyword_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE keywords 
    SET current_count = GREATEST(current_count - 1, 0)
    WHERE id = OLD.keyword_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on email_logs to update keywords.current_count
CREATE TRIGGER update_count_on_claim
  AFTER INSERT OR DELETE ON email_logs
  FOR EACH ROW EXECUTE FUNCTION update_keyword_count();

-- Add comment for documentation
COMMENT ON COLUMN keywords.current_count IS 'Cached count of email_logs for this keyword, updated via trigger';