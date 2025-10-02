# 🔍 Admin 後台 MVP 檢查清單

**檢查日期**：2025-10-02  
**目標**：確認 Admin 後台功能正常運作

---

## 📋 MVP 核心功能需求

### 1. 權限管理 ✅
**要求**：
- [x] 只有 Admin Email 可以訪問 `/admin`
- [x] 非 Admin 自動重導向
- [x] RLS Policy 允許 Admin 查看所有資料

**驗證方式**：
- 用非 Admin 帳號訪問 `/admin` → 應該被擋下
- 用 `jeffby8@gmail.com` 登入後訪問 `/admin` → 應該成功

---

### 2. 統計數據正確性 ❌ **有問題**

#### 問題報告：
```
總資料包：0
本週新增：4
```

**邏輯錯誤**：
- ✅ 應該是：總數 4，本週新增 4（假設本週建立）
- ❌ 實際顯示：總數 0，本週新增 4

**可能原因**：
1. RLS Policy 導致 Admin 無法讀取 `keywords` 總數
2. `count` 查詢沒有正確執行
3. Policy 權限設定錯誤

---

### 3. 資料查詢需求

#### 總資料包數
```typescript
const { count: totalKeywords } = await supabase
  .from('keywords')
  .select('*', { count: 'exact', head: true });
```

**問題**：RLS Policy 可能阻擋了這個查詢

#### 本週新增資料包
```typescript
const { count: weeklyKeywords } = await supabase
  .from('keywords')
  .select('*', { count: 'exact', head: true })
  .gte('created_at', startOfWeek.toISOString());
```

**問題**：這個查詢可能成功（因為有篩選條件）

---

## 🔧 修復方案

### 方案 A：修正 RLS Policy（✅ 推薦）

**問題診斷**：
- 現有 Policy 只允許 `SELECT`，但 `count` 查詢可能需要特殊處理
- Policy 可能需要明確允許 Admin 查詢所有欄位

**修正方式**：
```sql
-- 確認 Policy 是否允許 count 查詢
-- 如果 Policy 使用 user_id 篩選，Admin 無法看到其他人的資料包

-- 正確的 Policy 應該是：
DROP POLICY IF EXISTS "Admin can view all keywords" ON keywords;
CREATE POLICY "Admin can view all keywords"
ON keywords FOR SELECT
USING (auth.jwt() ->> 'email' = 'jeffby8@gmail.com');

-- 不要加入任何 user_id 篩選！
```

---

### 方案 B：檢查現有 RLS Policy（🔍 調查）

**需要確認**：
1. `keywords` 資料表是否有其他 Policy 干擾？
2. 是否有 `user_id = auth.uid()` 的限制？

**檢查方式**：
```sql
-- 查看 keywords 資料表所有 Policy
SELECT * FROM pg_policies WHERE tablename = 'keywords';
```

---

### 方案 C：繞過 RLS（⚠️ 暫時方案）

使用 Service Role Key（僅後端）：
```typescript
// 需要新增環境變數
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const { count } = await supabaseAdmin
  .from('keywords')
  .select('*', { count: 'exact', head: true });
```

**問題**：需要後端 API，前端不安全

---

## ✅ MVP 通過標準

### 必須達成：
- [ ] **總資料包數正確**（目前：0，應該：4）
- [ ] **本週新增數正確**（目前：4，正確✅）
- [ ] **總領取次數正確**
- [ ] **今日領取次數正確**
- [ ] **創作者數量正確**

### 附加功能：
- [ ] Loading 狀態顯示
- [ ] 錯誤處理
- [ ] 數據自動刷新

---

## 🚨 當前狀態：未通過 MVP

**問題清單**：
1. ❌ 總資料包數顯示 0（應該 > 0）
2. ❓ RLS Policy 權限設定錯誤
3. ❓ 需要檢查資料庫其他 Policy

**下一步行動**：
1. 檢查 Supabase Dashboard 的 RLS Policy 設定
2. 確認是否有其他 Policy 干擾
3. 修正 Policy 或改用 Service Role Key
4. 重新測試統計數據

---

**結論**：Admin 後台框架已建立，但統計數據不正確，需要修正 RLS Policy 或查詢方式。