# Box 頁面 V10.0 UI/UX 重構計畫

## 📋 需求概述

根據使用者提供的範例 HTML，需要重新調整 Box 頁面的版面配置：

### 1. 版面順序調整

**新的版面順序**（從上到下）：
1. **CreatorCard**（創作者資訊卡）
2. **限量提示 + 註冊會員免輸入關鍵字提示**（兩個區塊並排）
3. **資料包標題/簡介 + 關鍵字輸入表單**（桌面版左右並排）
4. **預覽圖片輪播**

---

### 2. 資料包新增欄位

✅ **已完成**：資料庫欄位已在 `supabase/migrations/20251008120000_add_package_intro_fields.sql` 中新增：
- `package_title` (TEXT) - 資料包標題
- `package_description` (TEXT) - 資料包簡介

✅ **TypeScript 類型定義已更新**：`src/integrations/supabase/types.ts` 已包含這兩個欄位。

---

### 3. 桌面版 Grid 並排佈局

**目標**：在桌面版（≥768px），讓以下兩個區塊**左右並排顯示**：
- **左側**：資料包標題 + 簡介卡片（展示內容）
- **右側**：關鍵字輸入表單（互動區）

**實作方式**：使用 Tailwind 的 `md:grid md:grid-cols-2 md:gap-4`

---

## 📝 詳細修改清單

### 檔案 1: `src/pages/Box.tsx`

#### 修改 A：調整版面結構（Line 266-411）

**現況**：
```tsx
<div className="min-h-screen flex items-center justify-center p-4">
  <div className="w-full max-w-lg">
    {/* 標題區 */}
    {/* CreatorCard */}
    {/* 資料包標題/簡介（單獨區塊） */}
    {/* 倒數/限量提示 */}
    {/* 關鍵字輸入表單 */}
    {/* 預覽圖片 */}
  </div>
</div>
```

**改為**：
```tsx
<div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4">
  <div className="max-w-4xl mx-auto space-y-6">
    
    {/* 1. CreatorCard */}
    <CreatorCard creatorId={boxData.creator_id} />

    {/* 2. 限量提示 + 註冊會員提示（並排） */}
    <div className="flex flex-col md:flex-row items-center gap-3">
      {/* 限量提示 */}
      {boxData.quota && (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-lg w-full md:w-auto">
          <p className="text-sm font-medium text-accent">
            �� 限量 {boxData.quota} 份 · 剩餘 {Math.max(0, boxData.quota - currentCount)} 份
          </p>
        </div>
      )}

      {/* 註冊會員免輸入關鍵字提示 */}
      <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 w-full md:flex-1">
        <p className="text-sm font-medium text-accent mb-1">
          ✨ 註冊會員免輸入關鍵字
        </p>
        <p className="text-xs text-muted-foreground">
          • 登入後自動解鎖，無需輸入關鍵字<br/>
          • 查看我的領取記錄<br/>
          • 創建資料包，分享給你的受眾
        </p>
      </div>
    </div>

    {/* 3. 資料包標題/簡介 + 關鍵字輸入表單（桌面版並排） */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 左側：資料包標題 + 簡介 */}
      {(boxData.package_title || boxData.package_description) && (
        <div className="glass-card rounded-2xl shadow-card p-6">
          {boxData.package_title && (
            <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
              📦 {boxData.package_title}
            </h3>
          )}
          {boxData.package_description && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {boxData.package_description}
            </p>
          )}
        </div>
      )}

      {/* 右側：關鍵字輸入表單 */}
      <div className="glass-card rounded-2xl shadow-card p-6">
        <form onSubmit={handleUnlock} className="space-y-4">
          {/* 關鍵字輸入 */}
          <div>
            <label className="text-sm font-medium mb-2 block">關鍵字</label>
            <Input
              placeholder="輸入關鍵字..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              required
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              💡 請向創作者索取關鍵字（不分大小寫）
            </p>
          </div>

          {/* Email 輸入 */}
          <div>
            <label className="text-sm font-medium mb-2 block">Email</label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              🔒 僅創作者可見
            </p>
          </div>

          {/* 送出按鈕 */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full gradient-magic hover:opacity-90 transition-opacity font-medium gap-2"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                解鎖中...
              </div>
            ) : (
              <>
                <Key className="w-5 h-5" />
                立即解鎖 🔓
              </>
            )}
          </Button>
        </form>

        {/* 註冊/登入連結 */}
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate(`/login?returnTo=${location.pathname}`)}
            className="text-sm font-medium text-foreground hover:text-accent transition-colors"
          >
            免費註冊／登入 →
          </button>
        </div>
      </div>
    </div>

    {/* 4. 預覽圖片輪播 */}
    {boxData && boxData.images && boxData.images.length > 0 && (
      <div className="glass-card rounded-2xl shadow-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          🖼️ 資料包預覽圖片
        </h3>
        <PackageImageCarousel images={boxData.images} />
      </div>
    )}

    {/* 5. 頁尾（使用說明 + 隱私權政策） */}
    <div className="mt-8 pt-6 border-t border-border/50 text-center">
      <p className="text-xs text-muted-foreground">
        © 2025 Powered by UPPER |{" "}
        <button
          onClick={() => navigate("/help")}
          className="hover:text-accent transition-colors"
        >
          使用說明
        </button>
        {" "}
        <button
          onClick={() => navigate("/privacy")}
          className="hover:text-accent transition-colors"
        >
          隱私權政策
        </button>
      </p>
    </div>

  </div>
</div>
```

---

#### 修改 B：移除舊的版面結構

**需要移除的區塊**：
- Line 271-280：舊的標題區（Lock icon + KeyBox 標題）
- Line 284-314：舊的分散式版面（CreatorCard、資料包介紹、倒數/限量分開顯示）
- Line 317-401：舊的關鍵字輸入表單（含註冊提示）

這些區塊將被上方的新版面結構取代。

---

#### 修改 C：調整容器寬度

**現況**：
```tsx
<div className="w-full max-w-lg">
```

**改為**：
```tsx
<div className="max-w-4xl mx-auto space-y-6">
```

理由：桌面版需要更寬的容器才能容納並排佈局。

---

#### 修改 D：保留倒數計時器位置

**現況**：倒數計時器在 Line 303-305

**改為**：移到「限量提示」區塊的上方或整合進去（根據需求決定）

如果需要保留倒數計時器，建議放在 Step 2（限量提示區）之前：

```tsx
{/* 倒數計時器（如果有設定） */}
{boxData.expires_at && (
  <CountdownTimer expiresAt={boxData.expires_at} />
)}
```

---

### 檔案 2: `src/pages/Creator.tsx`

#### 修改 A：新增資料包標題/簡介欄位到表單

**位置**：在「圖片上傳」欄位**之前**新增

```tsx
{/* 資料包標題 */}
<div>
  <Label htmlFor="package-title">資料包標題（選填）</Label>
  <Input
    id="package-title"
    value={newKeyword.package_title || ""}
    onChange={(e) => setNewKeyword({ ...newKeyword, package_title: e.target.value })}
    placeholder="例：2025 行銷素材包"
  />
  <p className="text-xs text-muted-foreground mt-1">
    顯示在 Box 頁面的資料包標題
  </p>
</div>

{/* 資料包簡介 */}
<div>
  <Label htmlFor="package-description">資料包簡介（選填）</Label>
  <Textarea
    id="package-description"
    value={newKeyword.package_description || ""}
    onChange={(e) => setNewKeyword({ ...newKeyword, package_description: e.target.value })}
    placeholder="描述這個資料包的內容與特色..."
    rows={4}
  />
  <p className="text-xs text-muted-foreground mt-1">
    最多 500 字，支援換行
  </p>
</div>
```

---

#### 修改 B：更新 `newKeyword` State 的 TypeScript 型別

**現況**：
```tsx
const [newKeyword, setNewKeyword] = useState({
  keyword: "",
  content: "",
  quota: null as number | null,
  expiry_date: "",
  image_urls: ["", "", "", "", ""],
});
```

**改為**：
```tsx
const [newKeyword, setNewKeyword] = useState({
  keyword: "",
  content: "",
  quota: null as number | null,
  expiry_date: "",
  package_title: "",
  package_description: "",
  image_urls: ["", "", "", "", ""],
});
```

---

#### 修改 C：更新 `handleSubmit()` - INSERT 邏輯

**現況**：
```tsx
const { error } = await supabase.from("keywords").insert({
  keyword: newKeyword.keyword.toLowerCase().trim(),
  content: newKeyword.content,
  quota: newKeyword.quota,
  expires_at: newKeyword.expiry_date || null,
  creator_id: session?.user.id,
  images: filteredImages,
});
```

**改為**：
```tsx
const { error } = await supabase.from("keywords").insert({
  keyword: newKeyword.keyword.toLowerCase().trim(),
  content: newKeyword.content,
  quota: newKeyword.quota,
  expires_at: newKeyword.expiry_date || null,
  package_title: newKeyword.package_title || null,
  package_description: newKeyword.package_description || null,
  creator_id: session?.user.id,
  images: filteredImages,
});
```

---

#### 修改 D：更新編輯資料包表單

在編輯資料包的 Dialog 中，同樣新增 `package_title` 和 `package_description` 欄位。

**位置**：在圖片欄位之前

```tsx
{/* 資料包標題 */}
<div>
  <Label htmlFor="edit-package-title">資料包標題（選填）</Label>
  <Input
    id="edit-package-title"
    value={editingKeyword.package_title || ""}
    onChange={(e) => setEditingKeyword({ ...editingKeyword, package_title: e.target.value })}
    placeholder="例：2025 行銷素材包"
  />
</div>

{/* 資料包簡介 */}
<div>
  <Label htmlFor="edit-package-description">資料包簡介（選填）</Label>
  <Textarea
    id="edit-package-description"
    value={editingKeyword.package_description || ""}
    onChange={(e) => setEditingKeyword({ ...editingKeyword, package_description: e.target.value })}
    placeholder="描述這個資料包的內容與特色..."
    rows={4}
  />
</div>
```

---

#### 修改 E：更新 `handleEdit()` - UPDATE 邏輯

確保 UPDATE 時包含新欄位：

```tsx
const { error } = await supabase
  .from("keywords")
  .update({
    keyword: editingKeyword.keyword.toLowerCase().trim(),
    content: editingKeyword.content,
    quota: editingKeyword.quota,
    expires_at: editingKeyword.expiry_date || null,
    package_title: editingKeyword.package_title || null,
    package_description: editingKeyword.package_description || null,
    images: filteredImages,
  })
  .eq("id", editingKeyword.id);
```

---

### 檔案 3: `src/pages/Admin.tsx`

#### 修改：同步更新 Admin 後台編輯表單

在 Admin 後台的編輯資料包功能中，同樣新增 `package_title` 和 `package_description` 欄位。

---

## 📊 UI/UX 設計細節

### 手機版（< 768px）

**佈局**：單欄垂直排列
```
┌────────────────────────┐
│ CreatorCard            │
├────────────────────────┤
│ 限量提示               │
├────────────────────────┤
│ 註冊會員提示           │
├────────────────────────┤
│ 資料包標題/簡介        │
├────────────────────────┤
│ 關鍵字輸入表單         │
├────────────────────────┤
│ 預覽圖片               │
└────────────────────────┘
```

---

### 桌面版（≥ 768px）

**佈局**：關鍵區塊左右並排
```
┌─────────────────────────────────────────────────┐
│ CreatorCard                                     │
├─────────────────────────────────────────────────┤
│ 限量提示         │ 註冊會員提示                 │
├─────────────────────────────────────────────────┤
│ 資料包標題/簡介  │ 關鍵字輸入表單               │
│                  │                              │
│                  │                              │
├─────────────────────────────────────────────────┤
│ 預覽圖片                                        │
└─────────────────────────────────────────────────┘
```

---

### 配色與樣式

- 延續 `glass-card` 風格（半透明毛玻璃效果）
- 標題使用 `text-foreground`
- 簡介使用 `text-muted-foreground`
- 支援 `whitespace-pre-wrap` 保留換行

---

## ✅ 測試檢查清單

- [ ] **Box 頁面**：版面順序正確（CreatorCard → 提示並排 → 標題/表單並排 → 圖片）
- [ ] **桌面版**：資料包標題/簡介 與 關鍵字輸入表單左右並排
- [ ] **手機版**：所有區塊上下堆疊，無橫向溢出
- [ ] **資料顯示**：package_title 和 package_description 正確顯示
- [ ] **Creator 頁面**：新增資料包表單包含標題/簡介欄位
- [ ] **Creator 頁面**：編輯資料包表單包含標題/簡介欄位
- [ ] **Admin 頁面**：編輯資料包表單包含標題/簡介欄位
- [ ] **資料庫**：INSERT 和 UPDATE 正確寫入新欄位
- [ ] **空值處理**：未填寫標題/簡介時不顯示該區塊
- [ ] **換行支援**：簡介文字支援換行顯示

---

## 🚀 實作順序建議

### Step 1：Box 頁面版面重構
1. 調整 `src/pages/Box.tsx` 的 JSX 結構
2. 移除舊的版面區塊
3. 實作新的 Grid 並排佈局
4. 測試手機版/桌面版響應式

### Step 2：Creator 頁面表單更新
1. 更新 `newKeyword` State 型別
2. 新增標題/簡介欄位到新增表單
3. 新增標題/簡介欄位到編輯表單
4. 更新 `handleSubmit()` 和 `handleEdit()`

### Step 3：Admin 頁面同步
1. 在 Admin 後台編輯表單新增欄位

### Step 4：整合測試
1. 建立測試資料包（有/無標題簡介）
2. 測試各種螢幕尺寸
3. 測試編輯功能
4. 測試資料持久化

---

## 💡 注意事項

1. **空值處理**：如果 `package_title` 和 `package_description` 都為空，則不顯示左側卡片，關鍵字輸入表單改為單欄顯示。

2. **Grid 響應式**：使用 `grid-cols-1 md:grid-cols-2`，確保手機版單欄，桌面版雙欄。

3. **容器寬度**：從 `max-w-lg` 改為 `max-w-4xl`，才能容納並排佈局。

4. **向後相容**：舊的資料包（沒有標題/簡介）仍能正常顯示。

5. **文字換行**：使用 `whitespace-pre-wrap` 支援使用者輸入的換行。

---

## 📝 資料庫狀態確認

✅ **Migration 已完成**：`supabase/migrations/20251008120000_add_package_intro_fields.sql`
✅ **TypeScript 類型已更新**：`src/integrations/supabase/types.ts`
✅ **欄位定義**：
- `package_title` TEXT (nullable)
- `package_description` TEXT (nullable)

確保執行 `supabase db push` 同步到遠端資料庫。

---

# KeyBox Admin 後台 - 數據分析導向設計

## 🎯 核心理念

**從「資料管理」轉向「數據洞察」**
- 不只是看資料，而是理解數據背後的意義
- 以「用戶」和「資料包」為核心分析對象
- 視覺化呈現關鍵指標和趨勢
- **移除單純的領取記錄列表**，改為整合到資料包詳情中

---

## 📊 功能架構

### Tab 1: 📊 統計總覽（Dashboard）
**已完成 ✅**：
- 總用戶數、本週新增
- 總資料包數、本週新增
- 總領取次數、今日領取
- 創作者數量

**未來擴充**：
- 平台成長曲線圖（過去 30 天用戶數、資料包數）
- 熱門資料包 Top 10（領取次數排行）
- 活躍創作者 Top 5

---

## 👥 Tab 2: 用戶管理（User-Centric）

### 主列表頁

**顯示表格**：
```
┌─────────────────────────────────────────────────────────────────┐
│ Email            │ 資料包數 │ 總領取次數 │ 加入時間    │ 狀態     │
├─────────────────────────────────────────────────────────────────┤
│ user@example.com │ 5       │ 128       │ 2024-01-15 │ 🟢 活躍  │
│ user2@gmail.com  │ 2       │ 45        │ 2024-02-20 │ 🟡 一般  │
│ user3@yahoo.com  │ 0       │ 15        │ 2024-03-01 │ 🔵 領取者│
└─────────────────────────────────────────────────────────────────┘
```

**欄位定義**：

1. **Email** - 用戶信箱（from `auth.users.email`）
2. **資料包數** - 該用戶建立的資料包總數
   ```sql
   SELECT COUNT(*) FROM keywords WHERE creator_id = user.id
   ```
3. **總領取次數** - 該用戶的資料包被領取的總次數
   ```sql
   SELECT SUM(k.current_count) FROM keywords k WHERE k.creator_id = user.id
   ```
4. **加入時間** - 註冊時間（`auth.users.created_at`）
5. **狀態**（自動判定）：
   - 🟢 **活躍創作者**：資料包數 ≥ 3 且 總領取次數 ≥ 50
   - 🟡 **一般創作者**：有建立資料包（資料包數 > 0）
   - 🔵 **純領取者**：只領取，沒建立（資料包數 = 0）

**功能**：
- ✅ 搜尋（Email）
- ✅ 排序（資料包數、領取次數、加入時間）
- ✅ 篩選（活躍/一般/純領取者）
- ✅ 點擊進入用戶詳情頁

---

### 用戶詳情頁（User Detail）

**路由**：`/admin/users/:userId`

#### 個人資訊
```
┌─────────────────────────────────────┐
│ 👤 user@example.com                │
│ 加入時間：2024-01-15 14:30:25      │
│ 用戶 ID：abc123...                 │
└─────────────────────────────────────┘
```

#### 關鍵數據卡片
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ 建立資料包數  │ 總領取次數    │ 平均每包領取  │ 最後活躍時間  │
│     5       │    128       │    25.6      │ 2 天前       │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**計算邏輯**：
- **平均每包領取** = 總領取次數 / 建立資料包數
- **最後活躍時間** = MAX(keywords.created_at, keywords.updated_at)

#### 資料包清單（該用戶建立的所有資料包）
```
┌────────────────────────────────────────────────────────────────┐
│ 關鍵字        │ 領取次數 │ 額度狀態      │ 建立時間       │ 操作 │
├────────────────────────────────────────────────────────────────┤
│ 限時優惠券    │ 100/100 │ ✅ 已領完     │ 2024-03-01    │ 查看 │
│ 免費試用碼    │ 45/∞   │ 🔄 進行中     │ 2024-03-10    │ 查看 │
│ VIP邀請碼     │ 8/50   │ 🟡 16% 完成   │ 2024-03-15    │ 查看 │
└────────────────────────────────────────────────────────────────┘
```

#### 活躍度圖表（選配）
- 📈 過去 30 天領取趨勢（折線圖）
- 📊 資料包領取分佈（圓餅圖）

---

## 📦 Tab 3: 資料包管理（Package-Centric）⭐ 核心功能

### 主列表頁

**顯示表格**：
```
┌───────────────────────────────────────────────────────────────────┐
│ 關鍵字      │ 短碼   │ 創作者        │ 領取進度    │ 狀態     │ 操作 │
├───────────────────────────────────────────────────────────────────┤
│ 限時優惠券  │ abc123 │ user@test.com │ 100/100    │ ✅ 完成  │ 查看 │
│ 免費試用    │ def456 │ user2@...     │ 45/∞      │ 🔄 進行  │ 查看 │
│ VIP碼       │ ghi789 │ user3@...     │ 8/50 (16%)│ 🟡 進行  │ 查看 │
└───────────────────────────────────────────────────────────────────┘
```

**欄位定義**：

1. **關鍵字** - `keyword`
2. **短碼** - `short_code`
3. **創作者** - creator email（JOIN auth.users）
4. **領取進度** - `current_count / quota`（∞ = 無限制）
5. **狀態**（自動判定）：
   - ✅ **已完成**：quota ≠ NULL && current_count >= quota
   - 🔄 **進行中**：current_count < quota * 0.8
   - 🟡 **即將完成**：current_count >= quota * 0.8 && current_count < quota
   - ⏸️ **未啟用**：current_count = 0

**功能**：
- ✅ 搜尋（關鍵字、短碼、創作者 email）
- ✅ 排序（領取次數、建立時間、完成度）
- ✅ 篩選（已完成/進行中/即將完成/未啟用）
- ✅ 點擊進入資料包詳情頁

---

### 資料包詳情頁（Package Detail）⭐⭐⭐ **最核心功能**

**路由**：`/admin/packages/:packageId`

#### 基本資訊
```
┌────────────────────────────────────────────────────────┐
│ 📦 限時優惠券                                          │
│ 短網址：https://keybox.app/abc123                     │
│ 創作者：user@example.com                              │
│ 建立時間：2024-03-01 10:30:00                         │
└────────────────────────────────────────────────────────┘
```

#### 關鍵數據卡片（2行 x 4列）
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ 總領取次數    │ 額度設定      │ 完成度        │ 完成用時      │
│    100      │   100        │   100%       │   3天5小時    │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ 首次領取時間  │ 最後領取時間  │ 平均每日領取  │ 峰值領取      │
│ 03-01 10:45 │ 03-04 15:20  │   33.3       │ 45 (03-02)   │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**計算邏輯**：

1. **完成用時**：
   ```typescript
   if (current_count >= quota && quota != null) {
     const firstClaim = MIN(email_logs.unlocked_at)
     const lastClaim = MAX(email_logs.unlocked_at)
     return lastClaim - created_at // 轉換為「X天X小時」
   }
   return null // 尚未完成
   ```

2. **首次領取時間**：
   ```sql
   SELECT MIN(unlocked_at) FROM email_logs WHERE keyword_id = ?
   ```

3. **最後領取時間**：
   ```sql
   SELECT MAX(unlocked_at) FROM email_logs WHERE keyword_id = ?
   ```

4. **平均每日領取**：
   ```typescript
   const days = (now - created_at) / 86400000
   return current_count / days
   ```

5. **峰值領取**：
   ```sql
   SELECT DATE(unlocked_at) as date, COUNT(*) as count
   FROM email_logs
   WHERE keyword_id = ?
   GROUP BY DATE(unlocked_at)
   ORDER BY count DESC
   LIMIT 1
   ```

---

#### 📈 領取趨勢圖（核心視覺化）

**使用套件**：Recharts

**圖表類型**：折線圖 + 柱狀圖組合

**範例視覺化**：
```
累積領取數
100 ┤                              ●────● 100% 達成！
 90 ┤                          ●───┘
 80 ┤                      ●───┘         ← 80% 里程碑
 70 ┤                  ●───┘
 60 ┤              ●───┘
 50 ┤          ●───┘                     ← 50% 里程碑
 40 ┤      ●───┘
 30 ┤  ●───┘
 20 ┤●─┘
 10 ┤┘
  0 └─────────────────────────────────────────────
    3/1  3/2  3/3  3/4  3/5  3/6  3/7  3/8
    
每日領取量（柱狀圖）
 45 ┤     █                    ← 峰值：3/2 (45次)
 40 ┤     █
 35 ┤  █  █
 30 ┤  █  █  █
 25 ┤  █  █  █
 20 ┤  █  █  █     █
 15 ┤  █  █  █     █
 10 ┤  █  █  █  █  █
  5 ┤  █  █  █  █  █
  0 └─────────────────────────────────────────────
    3/1  3/2  3/3  3/4  3/5  3/6  3/7  3/8
```

**圖表功能**：
- ✅ 折線圖：累積領取曲線
- ✅ 柱狀圖：每日領取量分佈
- ✅ 標記點：重要里程碑（50%、80%、100%）
- ✅ Tooltip：Hover 顯示精確時間和數量
- ✅ 區間選擇：1天/7天/30天/全部
- ✅ 響應式設計（手機/桌面自適應）

**關鍵洞察文字**（圖表下方）：
```
💡 關鍵洞察：
• 前 48 小時完成 60%
• 3/2 出現領取高峰（45 次）
• 3/4 達到 100% 額度
• 總耗時：3 天 5 小時
• 平均每日：33.3 次領取
```

---

#### 領取記錄表格（可展開/摺疊）

**預設**：摺疊狀態（只顯示前 10 筆）
**展開後**：分頁顯示（每頁 50 筆）

```
┌─────────────────────────────────────────────────┐
│ Email               │ 領取時間              │ #  │
├─────────────────────────────────────────────────┤
│ claim1@test.com     │ 2024-03-01 10:45:12  │ 1  │
│ claim2@gmail.com    │ 2024-03-01 11:20:33  │ 2  │
│ claim3@yahoo.com    │ 2024-03-01 12:05:47  │ 3  │
│ ...                 │ ...                  │ ...│
└─────────────────────────────────────────────────┘

[▼ 展開查看全部 100 筆記錄]
```

**功能**：
- ✅ 展開/摺疊切換
- ✅ 搜尋（Email）
- ✅ 分頁（展開後）
- ✅ 匯出 CSV

---

#### 資料包內容（可展開/摺疊）

**預設**：摺疊狀態

```
┌────────────────────────────────┐
│ 📄 資料包內容 [▼ 展開]        │
└────────────────────────────────┘

展開後：
┌────────────────────────────────┐
│ 📄 資料包內容 [▲ 摺疊]        │
├────────────────────────────────┤
│                                │
│ 優惠碼：SAVE50                 │
│ 有效期限：2024-12-31           │
│ 使用方式：結帳時輸入           │
│ ...                            │
│                                │
└────────────────────────────────┘
```

---

#### 操作按鈕（頁面底部）

```
┌──────────────────────────────────────┐
│ [🔗 複製短網址]  [📊 匯出CSV]       │
│ [🗑️ 刪除資料包]                     │
└──────────────────────────────────────┘
```

- **複製短網址**：一鍵複製 `https://keybox.app/{short_code}`
- **匯出 CSV**：匯出該資料包的所有領取記錄
- **刪除資料包**：危險操作，需二次確認

---

## 🎨 視覺化技術選型

### 圖表套件：Recharts
**選擇理由**：
- ✅ React 原生支援
- ✅ 聲明式 API（易維護）
- ✅ 響應式設計
- ✅ 輕量級（~50KB gzipped）
- ✅ TypeScript 支援良好

### 關鍵圖表類型
1. **折線圖（LineChart）** - 累積領取趨勢
2. **柱狀圖（BarChart）** - 每日/小時領取量
3. **複合圖（ComposedChart）** - 折線+柱狀組合
4. **圓餅圖（PieChart）** - 資料包分佈（Dashboard 用）
5. **進度條（Progress）** - 額度完成度

### 範例程式碼
```tsx
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';

<ResponsiveContainer width="100%" height={400}>
  <ComposedChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis yAxisId="left" />
    <YAxis yAxisId="right" orientation="right" />
    <Tooltip />
    <Legend />
    <Bar yAxisId="left" dataKey="dailyCount" fill="#10b981" name="每日領取" />
    <Line yAxisId="right" type="monotone" dataKey="cumulativeCount" stroke="#3b82f6" name="累積領取" strokeWidth={2} />
  </ComposedChart>
</ResponsiveContainer>
```

---

## 🔢 資料查詢策略

### 方案 A：前端即時查詢（簡單）
**優點**：實作快速
**缺點**：效能較差（多次查詢）

```typescript
// 1. 取得資料包基本資料
const { data: keyword } = await supabase
  .from('keywords')
  .select('*')
  .eq('id', packageId)
  .single()

// 2. 取得領取記錄
const { data: logs } = await supabase
  .from('email_logs')
  .select('*')
  .eq('keyword_id', packageId)
  .order('unlocked_at', { ascending: true })

// 3. 前端計算統計數據
const firstClaim = logs[0]?.unlocked_at
const lastClaim = logs[logs.length - 1]?.unlocked_at
// ...
```

### 方案 B：Database Function（推薦）⭐
**優點**：效能好、邏輯集中
**缺點**：需要寫 SQL Function

```sql
CREATE OR REPLACE FUNCTION get_package_analytics(package_id uuid)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_claims', COUNT(*),
    'first_claim', MIN(unlocked_at),
    'last_claim', MAX(unlocked_at),
    'daily_stats', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          DATE(unlocked_at) as date,
          COUNT(*) as count
        FROM email_logs
        WHERE keyword_id = package_id
        GROUP BY DATE(unlocked_at)
        ORDER BY date
      ) t
    )
  ) INTO result
  FROM email_logs
  WHERE keyword_id = package_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 📋 開發優先級

### ✅ Phase 1 - 已完成（MVP 基礎）
- [x] 統計總覽（7 項數據卡片）
- [x] 用戶管理主列表（含 user_stats VIEW）
- [x] 資料包管理主列表
- [x] 創作者管理面板（`/creator`）
- [x] 個人資料編輯 Dialog
- [x] Database Migration（user_profiles + user_stats VIEW）
- [x] RLS 政策設定
- [x] 短碼顯示優化
- [x] 資料包預覽樣式修正

### 🚧 Phase 2 - TODO（核心數據視覺化）⭐⭐⭐

#### Test 1: 安裝 Recharts + 環境設定
- [ ] `npm install recharts`
- [ ] 測試 Recharts 基本渲染
- [ ] 建立圖表測試頁面（假數據）

#### Test 2: Database Function - 資料包分析
- [ ] 建立 `get_package_analytics(package_id uuid)` SQL Function
- [ ] 測試 Function 回傳格式
- [ ] 驗證效能（< 1s）

#### Test 3: 資料包詳情頁 - 基本架構
- [ ] 建立 `/admin/packages/:packageId` 路由
- [ ] 建立 `PackageDetail.tsx` 頁面
- [ ] 實作基本資訊卡片（關鍵字、短碼、創作者、建立時間）
- [ ] 實作 8 個關鍵數據卡片（總領取、額度、完成度等）

#### Test 4: 領取趨勢圖表組件
- [ ] 建立 `ClaimTrendChart.tsx` 組件
- [ ] 實作複合圖（折線 + 柱狀）
- [ ] 實作區間選擇（1天/7天/30天/全部）
- [ ] 實作 Tooltip 顯示
- [ ] 實作響應式設計

#### Test 5: 領取記錄表格
- [ ] 實作展開/摺疊功能
- [ ] 實作分頁（每頁 50 筆）
- [ ] 實作搜尋（Email）
- [ ] 實作匯出 CSV

#### Test 6: 資料包詳情頁 - 完整功能
- [ ] 整合圖表組件
- [ ] 整合領取記錄表格
- [ ] 實作複製短網址按鈕
- [ ] 實作刪除資料包按鈕
- [ ] 測試完整流程

### 📌 Phase 3 - 進階功能（P1）
- [ ] 用戶詳情頁（`/admin/users/:userId`）
- [ ] 用戶活躍度圖表
- [ ] 進階搜尋/篩選/排序

### 🎨 Phase 4 - 優化增強（P2）
- [ ] Dashboard 圖表視覺化（平台成長曲線）
- [ ] 熱門資料包 Top 10
- [ ] 活躍創作者 Top 5
- [ ] 即時資料更新（WebSocket）

---

## 🎯 成功指標

### 功能完整性
- [ ] 能看到所有用戶及其創作數據
- [ ] 能進入每個資料包查看詳細分析
- [ ] **能看到領取趨勢曲線圖** ⭐
- [ ] **能計算完成用時（精確到小時）** ⭐
- [ ] 能識別峰值領取時段

### 數據洞察
- [ ] 一眼看出哪些資料包最受歡迎
- [ ] 了解領取速度（快速爆滿 vs 緩慢消耗）
- [ ] 識別活躍創作者 vs 一般用戶
- [ ] **視覺化看出領取模式（爆發式 vs 穩定型）** ⭐

### 效能指標
- [ ] 圖表渲染 < 500ms
- [ ] 頁面載入 < 2s
- [ ] 數據查詢 < 1s
- [ ] 支援 100+ 資料包的圖表渲染

---

## 💡 未來擴充方向

### Phase 3（進階分析）
- **預測模型**：根據歷史數據預測資料包完成時間
- **異常檢測**：偵測異常領取模式（bot、作弊）
- **A/B 測試**：比較不同關鍵字命名的效果
- **地理分佈**：領取者地理位置分析（需 IP）

### Phase 4（自動化）
- **自動警報**：資料包即將領完時通知創作者
- **自動報告**：每週/每月數據報告自動生成
- **智能建議**：根據歷史數據建議最佳額度設定

---

## 📝 實作備註

### 注意事項
1. **RLS 政策**：確保 Admin 可以查看所有資料
2. **效能優化**：使用 `current_count` 快取欄位
3. **時區處理**：統一使用 UTC，前端轉換顯示
4. **大數據集**：超過 1000 筆領取記錄考慮分頁載入圖表數據

### 開發建議
1. 先完成**資料包詳情頁**（最核心）
2. 再做用戶管理（相對簡單）
3. 最後補充 Dashboard 圖表
4. Recharts 圖表可以先用假數據快速 prototype

---

## 🎨 UI/UX 設計原則

1. **數據第一**：重要數字要大、要醒目
2. **視覺化優先**：能用圖表就不用表格
3. **即時反饋**：Loading 狀態、成功/失敗提示
4. **響應式設計**：手機/平板/桌面都要好用
5. **漸進式揭露**：預設摺疊，需要時展開


---

## 🎨 創作者管理面板（Creator Dashboard）

### 核心理念
讓創作者能夠：
1. **建立個人品牌**：設定暱稱、自我介紹
2. **管理資料包**：查看、編輯、刪除自己的資料包
3. **追蹤數據**：查看自己的資料包領取情況

---

## 📝 個人資料編輯功能

### 新增資料庫欄位（user_profiles）

**建立新表**：`user_profiles`
```sql
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text, -- 暱稱（選填）
  bio text, -- 自我介紹（選填）
  avatar_url text, -- 頭像網址（選填）
  website text, -- 個人網站（選填）
  social_links jsonb, -- 社群連結（選填）
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS 政策
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 用戶可以查看所有人的 profile（公開）
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.user_profiles FOR SELECT
  USING (true);

-- 用戶只能編輯自己的 profile
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- 用戶可以建立自己的 profile
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

---

## 🎯 欄位設計（基於使用場景）

### 必填欄位
- **Email**（from auth.users，不可編輯）

### 選填欄位

#### 1. **暱稱（display_name）**
- **用途**：公開顯示名稱
- **範例**：「小明的優惠碼倉庫」、「資源分享者」
- **限制**：2-20 字元
- **預設值**：Email 的前綴（`user@gmail.com` → `user`）

#### 2. **自我介紹（bio）**
- **用途**：讓領取者了解創作者
- **範例**：
  - 「分享各類優惠碼和試用資源 🎁」
  - 「專注於科技產品的限時優惠」
  - 「每週更新最新折扣碼」
- **限制**：最多 200 字元
- **提示文字**：「介紹你的資料包主題，讓領取者更了解你」

#### 3. **頭像網址（avatar_url）**（選配）
- **用途**：個人化顯示
- **實作方式**：
  - MVP：使用 Gravatar（Email 自動生成）
  - 未來：整合 Uploadcare 或 Cloudinary

#### 4. **個人網站（website）**（選配）
- **用途**：導流到個人網站/部落格
- **範例**：`https://example.com`
- **驗證**：URL 格式檢查

#### 5. **社群連結（social_links）**（選配）
- **用途**：連結社群媒體
- **格式**：JSON
  ```json
  {
    "twitter": "https://twitter.com/username",
    "instagram": "https://instagram.com/username",
    "youtube": "https://youtube.com/@channel"
  }
  ```

---

## 🖥️ UI 設計

### 管理面板路由
**實際路由**：`/creator`（已實作）
**PRD 原規劃**：`/creator/dashboard`

### 頁面結構

#### 左側：個人資訊卡片
```
┌────────────────────────────────┐
│   👤                          │
│  [頭像]                       │
│                               │
│  小明的優惠碼倉庫             │
│  user@gmail.com               │
│                               │
│  分享各類優惠碼和試用資源 🎁  │
│                               │
│  🌐 example.com               │
│  🐦 @username                 │
│                               │
│  [✏️ 編輯個人資料]            │
└────────────────────────────────┘
```

#### 右側：資料包管理
```
┌────────────────────────────────────────┐
│ 我的資料包 (5)                         │
├────────────────────────────────────────┤
│ [+ 建立新資料包]                       │
│                                        │
│ ┌────────────────────────────────────┐│
│ │ 限時優惠券                         ││
│ │ 領取：100/100 (已完成)            ││
│ │ 建立：2024-03-01                  ││
│ │ [查看] [編輯] [刪除]              ││
│ └────────────────────────────────────┘│
│                                        │
│ ┌────────────────────────────────────┐│
│ │ 免費試用碼                         ││
│ │ 領取：45/∞ (進行中)               ││
│ │ 建立：2024-03-10                  ││
│ │ [查看] [編輯] [刪除]              ││
│ └────────────────────────────────────┘│
└────────────────────────────────────────┘
```

---

## 📋 編輯個人資料 Dialog

**觸發**：點擊「✏️ 編輯個人資料」按鈕

**表單欄位**：
```
┌─────────────────────────────────────────┐
│ 編輯個人資料                            │
├─────────────────────────────────────────┤
│                                         │
│ Email（不可編輯）                       │
│ [user@gmail.com        ]  🔒           │
│                                         │
│ 暱稱（選填）                            │
│ [小明的優惠碼倉庫      ]               │
│ 2-20 字元                               │
│                                         │
│ 自我介紹（選填）                        │
│ ┌─────────────────────────────────────┐│
│ │分享各類優惠碼和試用資源 🎁          ││
│ │                                     ││
│ └─────────────────────────────────────┘│
│ 最多 200 字元（已使用 15 字元）         │
│                                         │
│ 個人網站（選填）                        │
│ [https://example.com   ]               │
│                                         │
│ Twitter（選填）                         │
│ [https://twitter.com/username]         │
│                                         │
│          [取消]  [儲存]                │
└─────────────────────────────────────────┘
```

---

## 🚀 MVP 開發規劃

### MVP Scope（Phase 1）

#### 必做功能 ✅（已全部完成）
- [x] 建立 `user_profiles` 表 + RLS 政策
- [x] 編輯個人資料 Dialog（暱稱、自我介紹）
- [x] 創作者管理面板主頁（個人資訊 + 資料包列表）
- [x] 預設暱稱生成（Email 前綴）

#### 選配功能 ⏳（Phase 2）
- [ ] 頭像上傳功能
- [ ] 個人網站/社群連結
- [ ] 創作者公開頁面（`/creator/:username`）

---

## 🧪 測試架構

### Unit Tests

#### 1. 欄位驗證測試
```typescript
describe('UserProfile Validation', () => {
  test('暱稱長度驗證', () => {
    expect(validateDisplayName('A')).toBe(false) // 太短
    expect(validateDisplayName('小明的優惠碼倉庫')).toBe(true) // 正常
    expect(validateDisplayName('超過二十個字的暱稱超過二十個字的暱稱')).toBe(false) // 太長
  })

  test('自我介紹長度驗證', () => {
    const longBio = 'A'.repeat(201)
    expect(validateBio(longBio)).toBe(false) // 超過 200 字元
    expect(validateBio('正常的自我介紹')).toBe(true)
  })

  test('網址格式驗證', () => {
    expect(validateWebsite('https://example.com')).toBe(true)
    expect(validateWebsite('not-a-url')).toBe(false)
  })
})
```

#### 2. Database Function 測試
```sql
-- 測試 RLS 政策
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims TO '{"sub": "user-id-1"}';
  
  -- 測試：用戶可以更新自己的 profile
  UPDATE user_profiles SET display_name = 'New Name' WHERE id = 'user-id-1';
  -- 預期：成功
  
  -- 測試：用戶不能更新別人的 profile
  UPDATE user_profiles SET display_name = 'Hacked' WHERE id = 'user-id-2';
  -- 預期：失敗（RLS 阻止）
ROLLBACK;
```

---

### Integration Tests

#### 1. 編輯流程測試
```typescript
describe('Edit Profile Flow', () => {
  test('用戶可以編輯並儲存個人資料', async () => {
    // 1. 開啟編輯 Dialog
    const editButton = screen.getByText('✏️ 編輯個人資料')
    fireEvent.click(editButton)
    
    // 2. 輸入資料
    const nameInput = screen.getByLabelText('暱稱')
    fireEvent.change(nameInput, { target: { value: '測試用戶' } })
    
    const bioInput = screen.getByLabelText('自我介紹')
    fireEvent.change(bioInput, { target: { value: '這是測試' } })
    
    // 3. 送出表單
    const saveButton = screen.getByText('儲存')
    fireEvent.click(saveButton)
    
    // 4. 驗證儲存成功
    await waitFor(() => {
      expect(screen.getByText('測試用戶')).toBeInTheDocument()
      expect(screen.getByText('這是測試')).toBeInTheDocument()
    })
  })
})
```

#### 2. 驗證錯誤測試
```typescript
test('暱稱太短時顯示錯誤訊息', async () => {
  const nameInput = screen.getByLabelText('暱稱')
  fireEvent.change(nameInput, { target: { value: 'A' } })
  fireEvent.blur(nameInput)
  
  await waitFor(() => {
    expect(screen.getByText('暱稱需要 2-20 字元')).toBeInTheDocument()
  })
})
```

---

### E2E Tests（Playwright）

```typescript
test('創作者完整編輯流程', async ({ page }) => {
  // 1. 登入
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  // 2. 前往管理面板
  await page.goto('/creator/dashboard')
  await page.waitForSelector('text=我的資料包')
  
  // 3. 編輯個人資料
  await page.click('text=✏️ 編輯個人資料')
  await page.fill('[name="display_name"]', 'E2E 測試用戶')
  await page.fill('[name="bio"]', '這是 E2E 測試的自我介紹')
  await page.click('text=儲存')
  
  // 4. 驗證更新成功
  await expect(page.locator('text=E2E 測試用戶')).toBeVisible()
  await expect(page.locator('text=這是 E2E 測試的自我介紹')).toBeVisible()
  
  // 5. 重新整理頁面驗證持久化
  await page.reload()
  await expect(page.locator('text=E2E 測試用戶')).toBeVisible()
})
```

---

## 📊 數據分析應用

### Admin 後台顯示創作者資料

在 **用戶管理** Tab 中顯示：
```
┌─────────────────────────────────────────────────────────────────┐
│ Email            │ 暱稱          │ 資料包數 │ 總領取 │ 加入時間 │
├─────────────────────────────────────────────────────────────────┤
│ user@test.com    │ 小明的優惠碼  │ 5       │ 128    │ 2024-01  │
│ user2@gmail.com  │ 資源分享者    │ 2       │ 45     │ 2024-02  │
│ user3@yahoo.com  │ (未設定)      │ 0       │ 15     │ 2024-03  │
└─────────────────────────────────────────────────────────────────┘
```

### 公開創作者頁面（Phase 2）

**路由**：`/creator/:username` 或 `/creator/:userId`

**顯示內容**：
- 創作者暱稱 + 自我介紹
- 該創作者的所有公開資料包
- 社群連結

**範例**：
```
┌────────────────────────────────────┐
│   👤 小明的優惠碼倉庫               │
│   分享各類優惠碼和試用資源 🎁      │
│   🌐 example.com  🐦 @username    │
├────────────────────────────────────┤
│   資料包列表（5）                  │
│   ┌──────────────────────────────┐│
│   │ 限時優惠券 (已領完)          ││
│   │ 建立於 2024-03-01           ││
│   └──────────────────────────────┘│
│   ┌──────────────────────────────┐│
│   │ 免費試用碼 (45/∞)           ││
│   │ 建立於 2024-03-10           ││
│   └──────────────────────────────┘│
└────────────────────────────────────┘
```

---

## 🎯 成功指標

### 功能完整性
- [ ] 創作者可以編輯暱稱和自我介紹
- [ ] 資料持久化（重新整理不消失）
- [ ] RLS 政策正常運作（只能編輯自己）
- [ ] 管理面板正確顯示個人資訊
- [ ] Admin 後台可以看到創作者資料

### 測試覆蓋率
- [ ] Unit Tests 覆蓋率 > 80%
- [ ] Integration Tests 覆蓋關鍵流程
- [ ] E2E Tests 模擬真實使用情境

### UX 指標
- [ ] 編輯操作 < 5 步驟
- [ ] 儲存成功有明確提示
- [ ] 錯誤訊息清楚易懂

---

## 🛠️ 實作順序

### Step 1: Database Migration
```sql
-- 1. 建立 user_profiles 表
-- 2. 設定 RLS 政策
-- 3. 建立 updated_at trigger
```

### Step 2: Frontend Components
```typescript
// 1. UserProfileForm.tsx（編輯表單）
// 2. CreatorDashboard.tsx（管理面板主頁）
// 3. ProfileCard.tsx（個人資訊卡片）
```

### Step 3: API Integration
```typescript
// 1. useUserProfile() hook（查詢 profile）
// 2. useUpdateProfile() hook（更新 profile）
// 3. Profile validation schemas（Zod）
```

### Step 4: Tests
```typescript
// 1. Validation tests
// 2. Component tests
// 3. E2E tests
```

---

## 📝 注意事項

1. **預設值處理**：首次登入自動建立 profile，暱稱預設為 Email 前綴
2. **唯一性**：暱稱不需要唯一（用 UUID 作為 ID）
3. **公開性**：所有 profile 預設公開（未來可加隱私設定）
4. **效能**：profile 資料與 keywords 一起 JOIN 查詢
