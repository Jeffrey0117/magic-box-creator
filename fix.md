# 🔐 KeyBox Admin 後台系統規劃

**文件類型**：技術規劃  
**創建日期**：2025-10-02  
**規劃目標**：建立 Admin 管理後台，監控平台運營數據

---

## 📌 需求背景

作為 KeyBox 平台管理者，需要一個後台系統來：
1. 監控平台整體數據（會員數、資料包數、領取數）
2. 查看所有用戶列表（創作者、使用者）
3. 管理資料包內容（審核、下架違規內容）
4. 追蹤系統健康狀態（Supabase 用量、API 請求）

---

## 🎯 核心功能需求

### 1. 儀表板總覽 (Dashboard)
**一眼掌握平台關鍵數據**

#### 數據指標：
- **用戶統計**
  - 總註冊用戶數
  - 本週新註冊用戶
  - 創作者數量（至少建立 1 個資料包）
  - 一般使用者數量（僅領取）

- **資料包統計**
  - 總資料包數量
  - 本週新建資料包
  - 平均每個資料包領取數
  - 最熱門資料包 TOP 5

- **領取統計**
  - 總領取次數
  - 本週領取次數
  - 今日領取次數
  - 領取趨勢圖表（7 日 / 30 日）

- **系統狀態**
  - Supabase 儲存空間使用率
  - API 請求次數（本月）
  - 系統健康狀態

---

### 2. 用戶管理 (Users)
**查看所有註冊用戶**

#### 用戶列表：
| 欄位 | 說明 |
|------|------|
| Email | 用戶信箱 |
| 註冊日期 | created_at |
| 角色 | 創作者 / 使用者 / 兩者 |
| 建立資料包數 | 創作數量 |
| 領取資料包數 | 消費數量 |
| 最後活動時間 | last_sign_in_at |
| 操作 | 查看詳情 / 停權（進階功能） |

#### 篩選功能：
- 依角色篩選（創作者 / 使用者）
- 依註冊時間排序
- 依活躍度排序
- 搜尋功能（Email）

---

### 3. 資料包管理 (Keywords)
**查看所有資料包內容**

#### 資料包列表：
| 欄位 | 說明 |
|------|------|
| 標題 | title |
| 關鍵字 | keyword |
| 短網址 | short_code |
| 創作者 | creator_email |
| 領取數 | total_claims |
| 剩餘數 | remaining_quota |
| 建立日期 | created_at |
| 操作 | 查看詳情 / 下架（進階功能） |

#### 篩選功能：
- 依領取數排序（熱門度）
- 依建立日期排序
- 搜尋功能（標題、關鍵字、創作者）
- 狀態篩選（已用完 / 仍可領取）

---

### 4. 領取記錄 (Email Logs)
**查看所有領取活動**

#### 領取記錄列表：
| 欄位 | 說明 |
|------|------|
| Email | 領取者信箱 |
| 資料包標題 | keyword.title |
| 關鍵字 | keyword.keyword |
| 創作者 | keyword.user_id |
| 領取時間 | claimed_at |

#### 篩選功能：
- 依時間範圍篩選（今日 / 本週 / 本月）
- 依資料包篩選
- 依領取者篩選

---

## 🔐 權限設計

### Admin 角色識別方案

#### 方案 A：特定 Email 白名單（✅ 推薦）
**優點**：
- 實作簡單（5 分鐘）
- 無需修改資料庫結構
- 安全性高（硬編碼）

**實作方式**：
```typescript
// src/lib/admin.ts
const ADMIN_EMAILS = [
  'your-admin-email@example.com',
  // 可新增多個管理員
];

export function isAdmin(email: string | null): boolean {
  return email ? ADMIN_EMAILS.includes(email.toLowerCase()) : false;
}
```

**路由保護**：
```typescript
// src/pages/Admin.tsx
useEffect(() => {
  if (!user) {
    navigate('/login');
    return;
  }
  
  if (!isAdmin(user.email)) {
    toast.error('⛔ 權限不足');
    navigate('/');
  }
}, [user]);
```

---

#### 方案 B：資料庫 role 欄位（進階）
**優點**：
- 可動態新增管理員
- 支援多種角色（admin / moderator）

**缺點**：
- 需要 Migration
- 需要管理員管理介面

**實作方式**：
```sql
-- 新增 role 欄位到 auth.users metadata
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS raw_user_meta_data jsonb DEFAULT '{}';

-- 設定特定用戶為 admin
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data, 
  '{role}', 
  '"admin"'
)
WHERE email = 'your-admin-email@example.com';
```

**建議**：先用方案 A，PMF 後再考慮方案 B

---

## 🎨 UI/UX 設計

### 路由規劃
```
/admin              - 儀表板總覽
/admin/users        - 用戶管理
/admin/keywords     - 資料包管理
/admin/logs         - 領取記錄
```

### 導航設計
```tsx
<Sidebar>
  <NavItem icon={<LayoutDashboard />} to="/admin">儀表板</NavItem>
  <NavItem icon={<Users />} to="/admin/users">用戶管理</NavItem>
  <NavItem icon={<Package />} to="/admin/keywords">資料包管理</NavItem>
  <NavItem icon={<History />} to="/admin/logs">領取記錄</NavItem>
</Sidebar>
```

### 入口設計
**選項 A：隱藏入口（✅ 推薦）**
- 不在主導航顯示
- Admin 用戶直接訪問 `/admin`
- 非 Admin 自動重導向

**選項 B：顯示入口（進階）**
- Creator 頁面顯示「管理後台」按鈕
- 僅 Admin 可見（條件渲染）

---

## 📊 資料查詢設計

### Supabase RLS Policy

#### Admin 專用 Policy（讀取所有資料）
```sql
-- 允許 Admin 讀取所有 keywords
CREATE POLICY "Admin can view all keywords"
ON keywords FOR SELECT
USING (
  auth.jwt() ->> 'email' IN (
    'your-admin-email@example.com'
  )
);

-- 允許 Admin 讀取所有 email_logs
CREATE POLICY "Admin can view all email_logs"
ON email_logs FOR SELECT
USING (
  auth.jwt() ->> 'email' IN (
    'your-admin-email@example.com'
  )
);
```

### 查詢範例

#### 用戶統計
```typescript
// 總註冊用戶數
const { count: totalUsers } = await supabase
  .from('auth.users')
  .select('*', { count: 'exact', head: true });

// 創作者數量（至少建立 1 個資料包）
const { data: creators } = await supabase
  .from('keywords')
  .select('user_id')
  .not('user_id', 'is', null);

const uniqueCreators = new Set(creators?.map(k => k.user_id)).size;
```

#### 資料包統計
```typescript
// 總資料包數
const { count: totalKeywords } = await supabase
  .from('keywords')
  .select('*', { count: 'exact', head: true });

// 本週新建資料包
const { count: weeklyKeywords } = await supabase
  .from('keywords')
  .select('*', { count: 'exact', head: true })
  .gte('created_at', startOfWeek);
```

#### 領取統計
```typescript
// 總領取次數
const { count: totalClaims } = await supabase
  .from('email_logs')
  .select('*', { count: 'exact', head: true });

// 今日領取次數
const { count: todayClaims } = await supabase
  .from('email_logs')
  .select('*', { count: 'exact', head: true })
  .gte('claimed_at', startOfDay);
```

---

## 🚀 實作階段規劃

### Phase 1：基礎框架（30 分鐘）⭐⭐⭐⭐⭐
- [ ] 建立 Admin 權限判定 (`isAdmin()`)
- [ ] 建立 `/admin` 路由與保護機制
- [ ] 建立 Admin Layout（Sidebar + Header）
- [ ] 建立儀表板頁面框架

**優先級**：🔥 最高（必須先有權限管理）

---

### Phase 2：儀表板總覽（45 分鐘）⭐⭐⭐⭐⭐
- [ ] 實作用戶統計卡片
- [ ] 實作資料包統計卡片
- [ ] 實作領取統計卡片
- [ ] 實作 Supabase 用量顯示

**優先級**：🔥 最高（快速掌握平台狀態）

---

### Phase 3：用戶管理（60 分鐘）⭐⭐⭐⭐
- [ ] 建立用戶列表頁面
- [ ] 實作篩選功能（角色、時間）
- [ ] 實作搜尋功能（Email）
- [ ] 實作用戶詳情查看

**優先級**：🔴 高（了解用戶行為）

---

### Phase 4：資料包管理（60 分鐘）⭐⭐⭐⭐
- [ ] 建立資料包列表頁面
- [ ] 實作篩選功能（領取數、日期）
- [ ] 實作搜尋功能（標題、關鍵字）
- [ ] 實作資料包詳情查看

**優先級**：🔴 高（監控內容品質）

---

### Phase 5：領取記錄（45 分鐘）⭐⭐⭐
- [ ] 建立領取記錄列表頁面
- [ ] 實作時間範圍篩選
- [ ] 實作資料包篩選
- [ ] 實作即時更新（optional）

**優先級**：🟡 中（進階分析用途）

---

### Phase 6：進階功能（選做）⭐⭐
- [ ] 用戶停權功能
- [ ] 資料包下架功能
- [ ] 圖表視覺化（Chart.js）
- [ ] 匯出報表（CSV / PDF）

**優先級**：🟢 低（PMF 後再做）

---

## 📋 資料庫 Migration 需求

### RLS Policy 新增
```sql
-- 20251002_add_admin_policies.sql

-- Admin 可查看所有 keywords
CREATE POLICY "Admin can view all keywords"
ON keywords FOR SELECT
USING (
  auth.jwt() ->> 'email' = 'your-admin-email@example.com'
);

-- Admin 可查看所有 email_logs
CREATE POLICY "Admin can view all email_logs"
ON email_logs FOR SELECT
USING (
  auth.jwt() ->> 'email' = 'your-admin-email@example.com'
);

-- Admin 可查看所有 users（需要 auth.users view）
-- 注意：Supabase 預設不允許直接查詢 auth.users
-- 需要建立 view 或使用 Service Role Key
```

### 替代方案：使用現有 Policy + Service Role
```typescript
// 在 Admin 後台使用 Service Role Key（僅後端）
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // 需要新增環境變數
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// 查詢所有用戶（繞過 RLS）
const { data: users } = await supabaseAdmin.auth.admin.listUsers();
```

**安全提醒**：
- ⚠️ Service Role Key 擁有完整權限
- ⚠️ 絕對不可暴露於前端
- ✅ 建議：將 Admin 查詢包裝成 Supabase Edge Functions

---

## 🔒 安全性考量

### 1. 環境變數保護
```env
# .env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # ⚠️ 僅後端使用
```

### 2. 前端路由保護
```typescript
// 所有 /admin/* 路由都需檢查權限
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin(user.email)) return <Navigate to="/" />;
  
  return <>{children}</>;
};
```

### 3. API 請求驗證
```typescript
// 每次 API 請求都驗證 Admin 身份
const fetchAdminData = async () => {
  const { data, error } = await supabase
    .from('keywords')
    .select('*');
  
  if (error?.code === 'PGRST301') {
    // Policy 拒絕存取
    toast.error('⛔ 權限不足');
    navigate('/');
  }
};
```

---

## 🎯 決策建議

### 立即執行（V9.0）：
1. **Phase 1：基礎框架**（30 分鐘）
2. **Phase 2：儀表板總覽**（45 分鐘）

**理由**：
- ✅ 快速上線（1.5 小時即可看到成果）
- ✅ 立即掌握平台關鍵數據
- ✅ 無需複雜的資料庫修改

---

### 近期執行（V9.1）：
1. **Phase 3：用戶管理**（60 分鐘）
2. **Phase 4：資料包管理**（60 分鐘）

**理由**：
- ✅ 深入了解用戶行為
- ✅ 監控內容品質
- ✅ 為未來審核機制打基礎

---

### 選做（V9.2+）：
1. **Phase 5：領取記錄**（45 分鐘）
2. **Phase 6：進階功能**（依需求）

**理由**：
- 🟡 非緊急需求
- 🟡 可用 Supabase Dashboard 暫時替代
- 🟡 等用戶規模擴大再做

---

## 📊 預期效益

### 對平台管理者：
- ✅ 一眼掌握平台健康狀態
- ✅ 快速識別異常行為（濫用、違規）
- ✅ 數據驅動決策（哪些功能受歡迎）

### 對產品發展：
- ✅ 了解用戶行為模式
- ✅ 優化功能優先順序
- ✅ 建立內容審核機制

### 時間成本：
- **MVP（儀表板）**：1.5 小時
- **完整版（含管理功能）**：4 小時
- **進階版（含圖表與匯出）**：6 小時

---

## 🚀 總結

### 建議執行順序：
1. ✅ **立即做**：Phase 1 + Phase 2（儀表板總覽）
2. 🔜 **本週做**：Phase 3 + Phase 4（用戶與資料包管理）
3. 🔮 **未來做**：Phase 5 + Phase 6（領取記錄與進階功能）

### 技術選型：
- **權限管理**：方案 A（Email 白名單）
- **資料查詢**：前端直接查詢（搭配 RLS Policy）
- **進階查詢**：Supabase Edge Functions + Service Role Key

### 安全性優先：
- ⚠️ 絕不暴露 Service Role Key
- ✅ 前端路由保護
- ✅ API 請求驗證

---

**KeyBox Admin 後台系統 - 讓數據說話！** 📊