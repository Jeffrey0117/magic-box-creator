# KeyBox Admin 後台 MVP 開發規劃

## 📊 當前問題分析

### 問題 1：總用戶數顯示為 0
**原因**：
- `src/pages/Admin.tsx:78` 將 `totalUsers` 硬編碼為 0
- Supabase Auth 的 `auth.users` 表無法透過一般 RLS 政策直接查詢
- 需要使用 Service Role Key 或建立 Database Function

**解決方案**：
1. 建立 Database Function 來統計用戶數（使用 `security definer`）
2. 或透過 `email_logs` 表的 unique emails 來估算活躍用戶數

### 問題 2：總資料包數可能顯示錯誤
**原因**：
- Admin 查詢 `keywords` 表時受到 RLS 政策限制
- 現有政策只允許創作者查看自己的關鍵字，或所有人搜尋（但不包含完整資料）

**解決方案**：
- 新增 Admin 專用的 RLS 政策
- 允許 Admin Email 查看所有資料

---

## 🎯 MVP 開發範圍（Phase 1）

### 1. 資料庫層修復

#### 1.1 建立用戶統計 Function
```sql
-- 建立統計函數（只有 admin 可以呼叫）
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  -- 檢查是否為 admin
  IF auth.email() NOT IN ('jeffbao860623@gmail.com') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT json_build_object(
    'total_users', (SELECT count(*) FROM auth.users),
    'weekly_users', (
      SELECT count(*) 
      FROM auth.users 
      WHERE created_at >= now() - interval '7 days'
    ),
    'total_keywords', (SELECT count(*) FROM public.keywords),
    'weekly_keywords', (
      SELECT count(*) 
      FROM public.keywords 
      WHERE created_at >= now() - interval '7 days'
    ),
    'total_creators', (
      SELECT count(DISTINCT creator_id) 
      FROM public.keywords
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 1.2 建立 Admin RLS 政策
```sql
-- 允許 admin 查看所有 keywords
CREATE POLICY "Admin can view all keywords"
  ON public.keywords FOR SELECT
  USING (
    auth.email() IN ('jeffbao860623@gmail.com')
  );

-- 允許 admin 查看所有 email_logs
CREATE POLICY "Admin can view all email_logs"
  ON public.email_logs FOR SELECT
  USING (
    auth.email() IN ('jeffbao860623@gmail.com')
  );
```

### 2. 前端修復

#### 2.1 修改 Admin 頁面統計邏輯
- 呼叫新的 `get_admin_stats()` function
- 正確顯示所有統計數據
- 移除硬編碼的 0 值

#### 2.2 顯示資料
- ✅ 總用戶數（從 auth.users）
- ✅ 本週新增用戶數
- ✅ 總資料包數（從 keywords）
- ✅ 本週新增資料包
- ✅ 總領取次數（從 email_logs）
- ✅ 今日領取次數
- ✅ 創作者數量（unique creator_id）

---

## 📋 開發步驟

### Step 1: 建立 Database Migration
- [ ] 建立 `get_admin_stats()` function
- [ ] 新增 Admin RLS 政策
- [ ] 測試 migration

### Step 2: 更新 TypeScript Types
- [ ] 在 `types.ts` 中新增 function 型別定義

### Step 3: 修改 Admin 頁面
- [ ] 建立新的 API 呼叫函數
- [ ] 修改 `fetchStats()` 邏輯
- [ ] 移除硬編碼的 0 值
- [ ] 測試資料正確顯示

### Step 4: 測試驗證
- [ ] 本地測試統計數據
- [ ] 驗證權限保護（非 admin 無法呼叫）
- [ ] 部署到 Vercel
- [ ] 線上測試驗證

---

## 🚀 Phase 2 規劃（未來功能）

### 資料表格檢視
1. **用戶列表**
   - 顯示所有註冊用戶
   - Email、註冊時間、最後登入
   - 分頁功能

2. **資料包列表**
   - 顯示所有建立的資料包
   - 關鍵字、創作者、建立時間、領取次數
   - 搜尋/篩選功能

3. **領取記錄**
   - 顯示所有領取記錄
   - Email、關鍵字、時間
   - 匯出功能

### 管理功能
- 停用/啟用資料包
- 刪除不當內容
- 查看詳細使用記錄

---

## 🔐 安全考量

### 權限控制
- ✅ Admin Email 白名單（hardcode）
- ✅ Function level 權限檢查
- ✅ RLS 政策保護
- ⏳ 未來：Admin 角色表（可擴展）

### 資料保護
- 不暴露完整 Email（前台）
- Admin 才能看完整資料
- 防止 SQL Injection（使用 parameterized queries）

---

## 📊 成功指標

### MVP 完成條件
- [x] Admin 頁面顯示正確的統計數據
- [ ] 總用戶數 ≥ 2（你和朋友）
- [ ] 總資料包數 > 0
- [ ] 所有統計數字準確
- [ ] 非 admin 無法存取

### 效能指標
- 統計查詢 < 1 秒
- 頁面載入 < 2 秒

---

## 🛠️ 技術實作細節

### Database Function 優勢
- ✅ 繞過 RLS 限制（SECURITY DEFINER）
- ✅ 統一權限檢查邏輯
- ✅ 減少前端複雜度
- ✅ 更好的效能（單次查詢）

### 替代方案（不建議）
- ❌ 使用 Service Role Key（前端暴露風險）
- ❌ 逐筆查詢後端聚合（效能差）
- ❌ 關閉 RLS（安全風險）

---

## 📅 時程規劃

- **Day 1**：Database Migration + Types（1-2 小時）
- **Day 1**：前端修改 + 測試（1-2 小時）
- **Day 2**：部署 + 線上驗證（30 分鐘）

**預計總時程**：3-4 小時

---

## 🎓 學習重點

1. Supabase Security Definer Functions
2. RLS 政策設計
3. Admin 權限控制最佳實踐
4. PostgreSQL JSON 聚合函數

---

## 📝 Notes

- 目前 Admin Email 採用硬編碼，未來可改為資料表管理
- 統計數據使用 JSON 格式返回，便於擴展
- 所有敏感操作都在 Database Function 中進行權限檢查