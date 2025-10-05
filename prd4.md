# Phase 3 實作完成報告：候補系統 + 限時功能

## 📋 完成項目總覽

### ✅ Step 1: 資料庫架構 (Migration)
**檔案**: `supabase/migrations/20251005000000_add_expiry_and_waitlist.sql`

#### 新增欄位
- `keywords.expires_at` (TIMESTAMP): 資料包過期時間

#### 新增資料表
- `waitlist`: 候補名單資料表
  - `id` (UUID, PK)
  - `keyword_id` (UUID, FK → keywords.id)
  - `email` (TEXT): 候補者 Email
  - `reason` (TEXT): 加入原因
  - `status` (TEXT): 狀態 (pending/notified)
  - `notified_at` (TIMESTAMP): 通知時間
  - `created_at` (TIMESTAMP): 建立時間

#### RLS 政策
- **公開存取**: 允許任何人加入候補名單
- **創作者 & Admin**: 可查看自己資料包的候補名單

---

### ✅ Step 2: 倒數計時組件
**檔案**: `src/components/CountdownTimer.tsx`

#### 核心功能
- **即時倒數**: 使用 `setInterval` 每分鐘更新一次
- **剩餘時間計算**: 顯示「X天X小時X分鐘」格式
- **視覺效果**: 紅字 + 動畫 (`text-red-500 font-bold animate-pulse`)
- **自動清理**: 組件卸載時清除 interval

#### 使用情境
- Box 頁面顯示限時提示
- 過期後隱藏領取表單，改顯示候補卡片

---

### ✅ Step 3: 候補卡片組件
**檔案**: `src/components/WaitlistCard.tsx`

#### 核心功能
- **Email 驗證**: Regex 驗證格式 (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- **重複檢查**: 利用資料庫 UNIQUE constraint 防止重複加入
- **候補人數顯示**: 即時查詢並顯示當前候補人數
- **狀態回饋**: 
  - 成功 → 顯示「已加入候補」+ 候補人數
  - 重複 → 提示「您已在候補名單中」
  - 失敗 → 顯示錯誤訊息

#### UI/UX 設計
- 標題: 🎫 加入候補名單
- 輸入欄位: Email + 加入原因 (選填)
- 提交按鈕: Loading 狀態防止重複提交

---

### ✅ Step 4: Creator 設定限時功能
**檔案**: `src/pages/Creator.tsx` (修改)

#### 新增狀態
```typescript
const [enableExpiry, setEnableExpiry] = useState(false);
const [newExpiryDays, setNewExpiryDays] = useState<number>(7);
const [editExpiryDays, setEditExpiryDays] = useState<number>(7);
```

#### 建立資料包
- **限時設定**: 勾選啟用限時 → 設定天數 (預設 7 天)
- **到期時間計算**: `new Date(Date.now() + days * 24 * 60 * 60 * 1000)`
- **資料庫寫入**: `expires_at` 欄位

#### 編輯資料包
- **顯示剩餘時間**: 計算當前剩餘天數
- **調整限時**: 可增加或減少天數
- **更新邏輯**: 修改 `expires_at` 欄位

---

### ✅ Step 5: Admin 候補管理功能
**檔案**: `src/pages/admin/PackageDetail.tsx` (重構)

#### 新增 Tab 架構
- **數據分析**: 領取趨勢圖表 + 領取記錄表格
- **候補名單**: 候補管理面板 ⭐ (新增)
- **資料包內容**: 資料包詳細內容

#### 候補管理功能
1. **快速加開配額**
   - 加開 20 份按鈕
   - 加開 50 份按鈕
   - 自訂數量輸入框

2. **候補名單表格**
   - 顯示 Email、加入原因、狀態、加入時間
   - 狀態標示: ⏳ 等待中 / ✅ 已通知
   - 候補排序: 按加入時間由早到晚

3. **匯出 CSV 功能**
   - 匯出欄位: Email, 加入原因, 狀態, 加入時間, 通知時間
   - 檔名格式: `候補名單_{資料包名稱}_{日期}.csv`
   - UTF-8 BOM 編碼 (Excel 相容)

#### 新增函數
- `handleAddQuota(amount)`: 加開配額
- `handleCustomQuotaAdd()`: 自訂數量加開
- `exportWaitlist()`: 匯出候補名單 CSV

---

### ✅ Step 6: Email 通知系統 (選配)
**狀態**: ⚠️ **保留未實作**

#### 設計規劃
- **觸發時機**: Admin 加開配額後
- **通知內容**: 
  - 資料包名稱
  - 短網址
  - 7 天限時提示 (如有設定)
- **實作方式**: Supabase Edge Function + Resend API

#### 未實作原因
- 需要申請 Resend API Key
- 需要設定 Email 模板
- 屬於錦上添花功能，不影響核心流程
- 可在未來 Phase 4 實作

---

## 🎯 核心流程整合

### Box 頁面邏輯
```typescript
// 1. 檢查是否過期
const isExpired = boxData?.expires_at && new Date(boxData.expires_at) < new Date();

// 2. 檢查是否已完結
const isCompleted = boxData?.quota !== null && boxData?.current_count >= boxData?.quota;

// 3. 根據狀態顯示不同 UI
if (isExpired || isCompleted) {
  return <WaitlistCard keywordId={boxData.id} />;
} else if (boxData.expires_at) {
  return (
    <>
      <CountdownTimer expiresAt={boxData.expires_at} />
      <UnlockForm />
    </>
  );
} else {
  return <UnlockForm />;
}
```

### Admin 候補管理流程
1. 進入資料包詳情頁
2. 切換到「候補名單」Tab
3. 查看候補者資訊（排序、人數）
4. 點擊「加開 20/50 份」或自訂數量
5. 系統更新配額 (`quota` +N)
6. 候補者可再次嘗試領取

---

## 📊 資料表關聯

```
keywords (資料包)
├── expires_at (過期時間)
└── id ──┐
         │
waitlist (候補名單)
├── keyword_id (FK)
├── email
├── reason
├── status
└── created_at
```

---

## 🔒 安全性檢查

### RLS 政策
- ✅ 任何人可加入候補名單 (INSERT)
- ✅ Admin 可查看所有候補名單 (SELECT)
- ✅ 創作者可查看自己資料包的候補名單 (SELECT)
- ✅ 防止重複加入 (UNIQUE constraint)

### Email 驗證
- ✅ 前端 Regex 驗證
- ✅ 資料庫 NOT NULL constraint
- ✅ 防止 SQL Injection (使用 Supabase Client)

---

## 🚀 後續建議

### 優先實作
1. **Migration 執行**: 在 Supabase Dashboard 手動執行 SQL
2. **完整測試**: 測試限時、候補、加開配額流程
3. **Bug 修正**: 修正任何發現的問題

### 未來增強
1. **Email 通知**: 實作 Resend API 通知功能
2. **批次通知**: Admin 可選擇通知特定候補者
3. **候補優先權**: 設定候補者優先級
4. **自動加開**: 達到特定候補人數自動加開配額

---

## 📝 檔案清單

### 新建檔案
- `supabase/migrations/20251005000000_add_expiry_and_waitlist.sql`
- `src/components/CountdownTimer.tsx`
- `src/components/WaitlistCard.tsx`

### 修改檔案
- `src/pages/Box.tsx`
- `src/pages/Creator.tsx`
- `src/pages/admin/PackageDetail.tsx`

---

## ✅ 功能驗收清單

- [x] 資料包可設定限時（建立時 + 編輯時）
- [x] Box 頁面顯示倒數計時
- [x] 過期後顯示候補卡片
- [x] 完結後顯示候補卡片
- [x] 候補者可填寫 Email + 原因
- [x] 防止重複加入候補
- [x] Admin 可查看候補名單
- [x] Admin 可快速加開配額（20/50/自訂）
- [x] Admin 可匯出候補名單 CSV
- [ ] Email 通知系統 (保留未實作)

---

**🎉 Phase 3 核心功能已完成，等待測試與除錯！**