-- Migration: 新增限時功能與候補系統
-- Date: 2025-10-05

-- 1. 新增 expires_at 欄位到 keywords 資料表
ALTER TABLE keywords ADD COLUMN expires_at TIMESTAMP;

-- 2. 建立 waitlist 資料表
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'waiting',
  notified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_email_per_keyword UNIQUE (keyword_id, email)
);

-- 3. 建立索引以優化查詢效能
CREATE INDEX idx_waitlist_keyword ON waitlist(keyword_id);
CREATE INDEX idx_waitlist_status ON waitlist(status);
CREATE INDEX idx_keywords_expires ON keywords(expires_at) WHERE expires_at IS NOT NULL;

-- 4. 設定 RLS 政策

-- 4.1 允許所有人新增候補記錄
DROP POLICY IF EXISTS "Anyone can join waitlist" ON waitlist;
CREATE POLICY "Anyone can join waitlist"
ON waitlist FOR INSERT
WITH CHECK (true);

-- 4.2 只允許查看候補人數（不顯示個人資料）
DROP POLICY IF EXISTS "Anyone can view waitlist count" ON waitlist;
CREATE POLICY "Anyone can view waitlist count"
ON waitlist FOR SELECT
USING (true);

-- 4.3 Admin 可查看完整候補名單
DROP POLICY IF EXISTS "Admin can view all waitlist" ON waitlist;
CREATE POLICY "Admin can view all waitlist"
ON waitlist FOR SELECT
USING (auth.jwt() ->> 'email' = 'jeffby8@gmail.com');

-- 4.4 創作者可查看自己資料包的候補名單
DROP POLICY IF EXISTS "Creator can view own waitlist" ON waitlist;
CREATE POLICY "Creator can view own waitlist"
ON waitlist FOR SELECT
USING (
  keyword_id IN (
    SELECT id FROM keywords WHERE creator_id = auth.uid()
  )
);

-- 4.5 Admin 可更新候補狀態（通知後）
DROP POLICY IF EXISTS "Admin can update waitlist" ON waitlist;
CREATE POLICY "Admin can update waitlist"
ON waitlist FOR UPDATE
USING (auth.jwt() ->> 'email' = 'jeffby8@gmail.com');

-- 4.6 創作者可更新自己資料包的候補狀態
DROP POLICY IF EXISTS "Creator can update own waitlist" ON waitlist;
CREATE POLICY "Creator can update own waitlist"
ON waitlist FOR UPDATE
USING (
  keyword_id IN (
    SELECT id FROM keywords WHERE creator_id = auth.uid()
  )
);

-- 5. 新增註解說明
COMMENT ON COLUMN keywords.expires_at IS '資料包過期時間（限時功能）';
COMMENT ON TABLE waitlist IS '候補名單（資料包達配額後的候補者）';
COMMENT ON COLUMN waitlist.status IS '候補狀態：waiting（等待中）、notified（已通知）、claimed（已領取）、expired（已過期）';