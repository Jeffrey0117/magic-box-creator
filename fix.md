# 🔧 Admin 後台數據修復方案

**問題**：總資料包顯示 0，本週新增顯示 4  
**原因**：RLS Policy 衝突或查詢邏輯錯誤  
**目標**：修正統計數據，確保 Admin 可以查看所有資料

---

## 🚨 問題診斷

### 當前狀況：
```
總資料包：0
本週新增：4
```

### 問題分析：
1. **RLS Policy 衝突**：可能有其他 Policy 限制 Admin 查看全部資料
2. **查詢方式錯誤**：`count` 查詢可能被 RLS 阻擋
3. **Policy 未生效**：新建立的 Admin Policy 可能沒有正確套用

---

## 🔍 步驟 1：檢查現有 RLS Policy

### 執行以下 SQL 檢查 keywords 資料表的所有 Policy：

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'keywords';
```

### 預期結果：
應該看到類似這樣的 Policy：
- `Users can view own keywords` - 限制一般用戶只能看自己的
- `Admin can view all keywords` - 允許 Admin 看全部

### 如果發現問題：
可能有衝突的 Policy，例如：
```sql
-- 錯誤範例：這會讓 Admin 也被限制
CREATE POLICY "Users can view own keywords"
ON keywords FOR SELECT
USING (auth.uid() = user_id);
```

---

## ✅ 步驟 2：修正 RLS Policy

### 方案 A：確保 Admin Policy 優先（✅ 推薦）

```sql
-- 先刪除所有舊的 SELECT Policy
DROP POLICY IF EXISTS "Users can view own keywords" ON keywords;
DROP POLICY IF EXISTS "Admin can view all keywords" ON keywords;
DROP POLICY IF EXISTS "Enable read access for all users" ON keywords;

-- 重新建立正確的 Policy（Admin 優先）
CREATE POLICY "Admin can view all keywords"
ON keywords FOR SELECT
USING (
  auth.jwt() ->> 'email' = 'jeffby8@gmail.com'
);

-- 一般用戶只能看自己的
CREATE POLICY "Users can view own keywords"
ON keywords FOR SELECT
USING (
  auth.uid() = user_id
  OR auth.jwt() ->> 'email' = 'jeffby8@gmail.com'
);
```

### 方案 B：檢查 email_logs 的 Policy

```sql
-- 同樣的邏輯套用到 email_logs
DROP POLICY IF EXISTS "Users can view own email logs" ON email_logs;
DROP POLICY IF EXISTS "Admin can view all email_logs" ON email_logs;

CREATE POLICY "Admin can view all email_logs"
ON email_logs FOR SELECT
USING (
  auth.jwt() ->> 'email' = 'jeffby8@gmail.com'
);

CREATE POLICY "Users can view own email logs"
ON email_logs FOR SELECT
USING (
  keyword_id IN (
    SELECT id FROM keywords WHERE user_id = auth.uid()
  )
  OR auth.jwt() ->> 'email' = 'jeffby8@gmail.com'
);
```

---

## 🛠️ 步驟 3：修正查詢邏輯

### 問題：`head: true` 可能導致 count 不正確

### 修正前：
```typescript
const { count: totalKeywords } = await supabase
  .from('keywords')
  .select('user_id', { count: 'exact', head: true });
```

### 修正後：
```typescript
// 方式 1：不使用 head（✅ 推薦）
const { data, count: totalKeywords } = await supabase
  .from('keywords')
  .select('id', { count: 'exact' });

// 方式 2：使用 count-only 查詢
const { count: totalKeywords } = await supabase
  .from('keywords')
  .select('*', { count: 'exact', head: true });
```

---

## 📝 步驟 4：更新 Admin.tsx

### 修正查詢邏輯：

```typescript
const fetchStats = async () => {
  try {
    setLoading(true);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // 修正：移除 head: true，改用 data 查詢
    const [
      { data: allKeywords, count: totalKeywords },
      { count: weeklyKeywords },
      { count: totalClaims },
      { count: todayClaims }
    ] = await Promise.all([
      supabase.from('keywords').select('id, user_id', { count: 'exact' }),
      supabase.from('keywords').select('*', { count: 'exact', head: true }).gte('created_at', startOfWeek.toISOString()),
      supabase.from('email_logs').select('*', { count: 'exact', head: true }),
      supabase.from('email_logs').select('*', { count: 'exact', head: true }).gte('claimed_at', startOfDay.toISOString()),
    ]);

    // 計算創作者數量
    const uniqueCreators = new Set(allKeywords?.map(k => k.user_id).filter(Boolean)).size;

    setStats({
      totalUsers: 0,
      weeklyUsers: 0,
      totalKeywords: totalKeywords || 0,
      weeklyKeywords: weeklyKeywords || 0,
      totalClaims: totalClaims || 0,
      todayClaims: todayClaims || 0,
      totalCreators: uniqueCreators,
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    toast.error('載入統計數據失敗');
  } finally {
    setLoading(false);
  }
};
```

---

## 🎯 執行順序

### 1. 在 Supabase Dashboard 執行 SQL（修正 RLS Policy）
```sql
-- 複製上面「步驟 2」的 SQL
-- 在 Supabase Dashboard → SQL Editor 執行
```

### 2. 更新 Admin.tsx 查詢邏輯
- 移除 `head: true` 從總數查詢
- 改用 `data` 查詢

### 3. 測試驗證
- 用 `jeffby8@gmail.com` 登入
- 前往 `/admin`
- 檢查統計數字是否正確

---

## ✅ 成功標準

- [ ] 總資料包數 > 0（應該顯示實際數量）
- [ ] 本週新增數正確
- [ ] 總領取次數正確
- [ ] 今日領取次數正確
- [ ] 創作者數量正確

---

## 🚀 完成後

將修復方案整合到 todo-test.md，作為 V9.1 的修復任務執行。