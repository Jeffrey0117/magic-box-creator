# 🔧 限量次數顯示問題最終報告

## 📊 問題現象

```
📊 總領取：19 人    ← current_count（不會自動更新）
📈 今日：+20        ← 即時查詢 email_logs（會更新）
🔥 剩餘：81 份      ← 基於錯誤的 current_count
```

**核心問題**：有人領取後，`current_count` 不會更新，但 `today_count` 會更新。

---

## 🔍 根本原因

### Migration SQL 已寫好但**沒有執行**

檢查程式碼後發現：
- ✅ [`Box.tsx:101`](src/pages/Box.tsx:101) - 前台讀取 `current_count`
- ✅ [`Box.tsx:175`](src/pages/Box.tsx:175) - 額滿檢查使用 `current_count`
- ✅ [`Creator.tsx:106`](src/pages/Creator.tsx:106) - 後台讀取 `current_count`
- ✅ Migration SQL 檔案存在 [`supabase/migrations/20251003180800_add_current_count_to_keywords.sql`](supabase/migrations/20251003180800_add_current_count_to_keywords.sql:1)

**但是**：
- ❌ Migration **沒有在 Supabase 資料庫執行**
- ❌ `keywords.current_count` 欄位存在但沒初始化（= 0）
- ❌ Trigger `update_count_on_claim` 不存在或未啟用

---

## 🎯 解決方案（立即執行）

### Step 1：登入 Supabase Dashboard

1. 前往 https://supabase.com/dashboard
2. 選擇你的專案
3. 左側選單 → **SQL Editor**
4. 點擊 **+ New Query**

### Step 2：執行以下 SQL

```sql
-- 1. 檢查並新增 current_count 欄位
ALTER TABLE keywords 
ADD COLUMN IF NOT EXISTS current_count INTEGER DEFAULT 0;

-- 2. 初始化所有現有資料的 current_count（關鍵步驟！）
UPDATE keywords k
SET current_count = (
  SELECT COUNT(*)
  FROM email_logs e
  WHERE e.keyword_id = k.id
);

-- 3. 建立自動更新函數
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

-- 4. 移除舊 Trigger（如果存在）
DROP TRIGGER IF EXISTS update_count_on_claim ON email_logs;

-- 5. 建立新 Trigger
CREATE TRIGGER update_count_on_claim
  AFTER INSERT OR DELETE ON email_logs
  FOR EACH ROW EXECUTE FUNCTION update_keyword_count();

-- 6. 驗證結果
SELECT 
  k.id,
  k.keyword,
  k.quota,
  k.current_count,
  COUNT(e.id) as actual_count,
  CASE 
    WHEN k.current_count = COUNT(e.id) THEN '✅ 正確'
    ELSE '❌ 不一致'
  END as status
FROM keywords k
LEFT JOIN email_logs e ON e.keyword_id = k.id
WHERE k.quota IS NOT NULL
GROUP BY k.id, k.keyword, k.quota, k.current_count;
```

### Step 3：點擊 **Run** 執行

執行後應該看到：
```
✅ 正確  ← 所有資料的 current_count = actual_count
```

---

## ✅ 預期結果

執行完後，重新整理後台：
```
📊 總領取：20 人    ← 正確（來自 current_count）
📈 今日：+20        ← 正確
🔥 剩餘：80 份      ← 100 - 20 = 80（正確）
```

**之後有人領取**：
```
INSERT email_logs → Trigger 觸發 → current_count + 1
```

**刪除記錄時**：
```
DELETE email_logs → Trigger 觸發 → current_count - 1
```

完全自動化，不需手動維護！

---

## 🚨 為什麼一直卡住？

因為：
1. 前端程式碼已部署（讀取 `current_count`）
2. 但資料庫沒執行 Migration
3. `current_count` 都是 0 或預設值
4. Trigger 不存在，新領取不會更新

**必須手動在 Supabase Dashboard 執行 SQL！**

---

## 📝 技術總結

### 原本設計（正確）
- 前台：讀取 `keywords.current_count`（公開欄位，不需查詢 email_logs）
- 後台：讀取 `keywords.current_count`（減少查詢）
- Trigger：自動維護 `current_count`（INSERT +1, DELETE -1）

### 問題所在
- Migration SQL 只存在本地 Git
- **沒有在 Supabase 雲端資料庫執行**
- 前端讀到的 `current_count` 都是 0 或舊值

### 最終解決
- **在 Supabase Dashboard 手動執行 Migration SQL**
- 初始化所有既有資料的 count
- 啟用 Trigger 自動更新

---

**執行完 SQL 後，問題就徹底解決了！** 🚀

---

**修正時間：** 2025-10-04 03:13 (UTC+8)  
**狀態：** ✅ 已提供完整解決方案，等待執行 SQL