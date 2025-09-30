# KeyBox - 產品需求文件 (PRD) V2.1 路由與 UX 問題修正

## 🚨 發現的 UX 問題

### 問題描述
**現況**：
- 使用者領取 2 個資料包後
- 在 Creator 頁面看到這 2 個資料包，誤以為是自己發佈的
- 「我的領取記錄」區塊是空的
- 造成身份混淆

**根本原因**：
- `email_logs` 記錄了領取行為
- 但 `keywords` 表沒有區分「我建立的」vs「我領取的」
- Creator 頁面顯示所有 keywords（包含別人建立的）

---

## 💡 解決方案評估

### 方案 A：修正查詢邏輯（最簡單）⭐ 推薦

**核心概念**：
- Creator 頁面只顯示「我建立的資料包」
- 「我的領取記錄」顯示「我領取的資料包」
- 關鍵在於 `keywords.creator_id` 欄位

**修正 1：Creator 頁面的關鍵字列表**
```tsx
// 現況（錯誤）：顯示所有 keywords
const { data } = await supabase
  .from("keywords")
  .select("*")
  .order("created_at", { ascending: false });

// 修正後：只顯示當前使用者建立的
const { data } = await supabase
  .from("keywords")
  .select("*")
  .eq("creator_id", session.user.id)  // ⭐ 關鍵修正
  .order("created_at", { ascending: false });
```

**修正 2：我的領取記錄區塊保持不變**
- 已經正確查詢 `email_logs`
- 顯示「我領取的資料包」

**優勢**：
- ✅ 5 分鐘修正
- ✅ 只改一個查詢
- ✅ 零新增資料表
- ✅ 身份清楚分離

---

### 方案 B：獨立 Dashboard 頁面（過度設計）

**設計**：
- `/dashboard` 獨立頁面
- Tab 1: 我領取的
- Tab 2: 我發佈的

**缺點**：
- ❌ 需要建立新頁面
- ❌ 需要 Tab 切換 UI
- ❌ 增加開發時間 1-2 小時
- ❌ 與極簡原則衝突

---

### 方案 C：完全分離頁面（最複雜）

**設計**：
- `/my-boxes` - 我領取的
- `/my-creations` - 我發佈的
- 兩個獨立頁面

**缺點**：
- ❌ 需要建立 2 個新頁面
- ❌ 需要導航邏輯
- ❌ 增加認知負擔
- ❌ 過度設計

---

## ✅ 決定：採用方案 A（修正查詢邏輯）

### 實作計畫（5 分鐘）

**唯一修改**：`src/pages/Creator.tsx` 的 `fetchKeywords` 函式

```tsx
const fetchKeywords = async () => {
  setLoading(true);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    setLoading(false);
    return;
  }

  const { data, error } = await supabase
    .from("keywords")
    .select("*")
    .eq("creator_id", session.user.id)  // ⭐ 新增這行
    .order("created_at", { ascending: false });

  if (error) {
    toast.error("無法載入關鍵字列表");
  } else {
    setKeywords(data || []);
  }
  setLoading(false);
};
```

### 修正後的 UX 流程

**創作者視角**：
1. 進入 `/creator` 頁面
2. 看到「我發佈的資料包」列表
   - 只顯示自己建立的（`creator_id = 自己`）
   - 顯示專屬連結、查看領取記錄、刪除
3. 點擊「查看我的領取記錄」
   - 顯示自己領取過的資料包（`email_logs`）
   - 兩個區塊清楚分離

**使用者視角**：
1. 領取別人的資料包
2. 進入 `/creator` 頁面
3. 「我發佈的資料包」是空的（因為沒建立過）
4. 「我的領取記錄」顯示剛才領取的

---

## 🎯 修正驗證

### 測試情境 1：純使用者
- 領取 2 個別人的資料包
- 進入 Creator 頁面
- ✅ 「關鍵字列表」是空的（提示：還沒建立資料包）
- ✅ 「我的領取記錄」顯示 2 個資料包

### 測試情境 2：純創作者
- 建立 3 個資料包
- 沒有領取過任何資料包
- 進入 Creator 頁面
- ✅ 「關鍵字列表」顯示 3 個（自己建立的）
- ✅ 「我的領取記錄」是空的

### 測試情境 3：混合身份
- 建立 2 個資料包
- 領取 3 個別人的資料包
- 進入 Creator 頁面
- ✅ 「關鍵字列表」顯示 2 個（只顯示自己建立的）
- ✅ 「我的領取記錄」顯示 3 個（自己領取的）

---

## 📝 其他 UX 改善（選擇性）

### 改善 1：空狀態提示優化

**關鍵字列表空狀態**：
```tsx
{keywords.length === 0 ? (
  <div className="text-center py-12 text-muted-foreground">
    還沒有建立任何資料包，點擊上方「新增關鍵字」開始！
  </div>
) : ...}
```

**領取記錄空狀態**：
```tsx
{myRecords.length === 0 ? (
  <div className="text-center py-4 text-muted-foreground">
    還沒有領取任何資料包，去試試看吧！
  </div>
) : ...}
```

### 改善 2：標題更清楚

**關鍵字列表標題**：
```tsx
<h2 className="text-xl font-semibold">我發佈的資料包</h2>
```

---

## ✅ 總結

### 問題
- Creator 頁面顯示所有 keywords（包含別人的）
- 造成使用者誤以為自己建立了別人的資料包

### 解決
- 修正查詢：只顯示 `creator_id = 自己` 的資料包
- 5 分鐘修正
- 零新增複雜度

### 結果
- 「我發佈的資料包」只顯示自己建立的
- 「我的領取記錄」只顯示自己領取的
- 身份清楚分離，不會混淆

---

**開發時間：5 分鐘** ⚡

**原則：最簡單、最聰明、最快速** 🚀

---

## 🔴 緊急問題修復：自動解鎖失效問題

### 問題描述
用戶 `test@gmail.com` 登入後訪問 `/box/:id` 連結，自動解鎖功能執行但未顯示在「我的領取記錄」面板。

### 問題分析

#### 可能原因 1：重複插入失敗（最可能）⭐
**位置**：`src/pages/Box.tsx:35-38`
```tsx
await supabase.from("email_logs").insert({
  keyword_id: data.id,
  email: session.user.email || "logged-in-user",
});
```

**問題**：
- 若 `email_logs` 表有 UNIQUE constraint (`keyword_id + email`)
- 重複訪問同一連結會導致插入失敗
- 但因為沒有 error handling，所以靜默失敗

**解決方案**：使用檢查機制避免重複插入

#### 可能原因 2：執行時序問題
**位置**：`src/pages/Box.tsx:18-23`
```tsx
useEffect(() => {
  if (id) {
    fetchBoxData();
  }
  checkAuthAndAutoUnlock();  // 可能在 fetchBoxData 之前執行
}, [id]);
```

**問題**：`checkAuthAndAutoUnlock()` 不依賴 `fetchBoxData()` 結果，但應該在確認 box 存在後才執行

#### 可能原因 3：查詢條件不一致
**Creator 查詢**：`src/pages/Creator.tsx:145`
```tsx
.eq("email", session.user.email)
```

**Box 插入**：`src/pages/Box.tsx:37`
```tsx
email: session.user.email || "logged-in-user"
```

**問題**：若 `session.user.email` 為 `null`，會插入 `"logged-in-user"`，但查詢時用 `session.user.email`，導致查不到

### 測試場景

#### Scenario A：首次訪問（應該成功）
1. ✅ 登入 `test@gmail.com`
2. ✅ 訪問 `/box/b3415549-3a09-4d72-bc58-bb857a168dbb`
3. ✅ 自動解鎖並插入 `email_logs`
4. ❌ 查看「我的領取記錄」→ 無資料

#### Scenario B：重複訪問（靜默失敗）
1. ✅ 已有記錄的用戶再次訪問
2. ❌ INSERT 失敗（unique constraint）
3. ❌ 沒有錯誤提示
4. ✅ 但 `setResult()` 仍執行，顯示內容

### 修復方案

#### 方案 A：完整錯誤處理（推薦）⭐
```tsx
const checkAuthAndAutoUnlock = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || !id || !session.user.email) return;

  const { data: keywordData } = await supabase
    .from("keywords")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!keywordData) return;

  // 檢查是否已領取
  const { data: existingLog } = await supabase
    .from("email_logs")
    .select("id")
    .eq("keyword_id", keywordData.id)
    .eq("email", session.user.email)
    .maybeSingle();

  if (!existingLog) {
    const { error } = await supabase.from("email_logs").insert({
      keyword_id: keywordData.id,
      email: session.user.email,
    });

    if (error) {
      console.error("Auto-unlock failed:", error);
      toast.error("自動解鎖失敗");
      return;
    }
  }

  setResult(keywordData.content);
  toast.success(existingLog ? "歡迎回來！" : "會員自動解鎖成功！");
};
```

**優點**：
- ✅ 避免重複插入
- ✅ 完整錯誤處理
- ✅ 區分首次/重複訪問
- ✅ 確保 email 存在

#### 方案 B：調整執行順序
```tsx
useEffect(() => {
  const init = async () => {
    if (id) {
      await fetchBoxData();  // 先確認 box 存在
      await checkAuthAndAutoUnlock();  // 再執行解鎖
    }
  };
  init();
}, [id]);
```

### 決策矩陣

| 方案 | 開發時間 | 可靠性 | 用戶體驗 | 推薦度 |
|------|---------|--------|---------|--------|
| A 完整檢查 | 10 min | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ 最推薦 |
| B 順序調整 | 3 min | ⭐⭐⭐ | ⭐⭐⭐ | 輔助 |

### 最終建議：方案 A + B 組合

**理由**：
1. 方案 A 解決核心問題（重複插入、錯誤處理）
2. 方案 B 優化執行邏輯（確保 box 存在才解鎖）
3. 組合後最穩定且用戶體驗最佳

### 後續驗證

修復後需測試：
1. ✅ 首次訪問自動解鎖 → 記錄出現在面板
2. ✅ 重複訪問同一連結 → 不報錯，顯示「歡迎回來」
3. ✅ 無效連結 → 不執行解鎖
4. ✅ 未登入訪問 → 正常顯示輸入表單
5. ✅ email 為 null → 不執行解鎖

---

## 🔴 第二波問題：面板無記錄 + CTA 文案錯誤

### 測試結果
用戶 `test@gmail.com` 訪問 `/box/:id` 後：
- ✅ 看到「會員自動解鎖成功！」
- ❌ Creator 面板「我的領取記錄」仍然是空的
- ❌ 解鎖後按鈕顯示「註冊 KeyBox 免費查看 →」（已登入卻顯示註冊）

---

### 問題 1：面板無記錄

#### 可能原因分析

**原因 A：fetchMyRecords 未自動觸發（最可能）⭐**
- `checkAuthAndAutoUnlock()` 執行在 Box 頁面
- 插入 `email_logs` 成功
- 但 Creator 頁面的 `myRecords` state 沒有更新
- 因為是不同的頁面 context

**驗證方法**：
- 在 Creator 頁面點擊「查看我的領取記錄」按鈕
- 如果此時能看到記錄 → 確認是此原因

**原因 B：fetchMyRecords 被初次修改影響**
- V2 改動後的 `fetchKeywords` 加了 `creator_id` 篩選
- 可能不小心影響到 `fetchMyRecords`

**驗證方法**：
- 檢查 `src/pages/Creator.tsx:132-146` 的 `fetchMyRecords` 函式
- 確認沒有誤加 `creator_id` 篩選

#### 排查步驟

1. **檢查資料庫**：
```sql
SELECT * FROM email_logs 
WHERE email = 'test@gmail.com' 
ORDER BY unlocked_at DESC;
```
→ 若有記錄：問題在前端查詢或狀態管理

2. **檢查 fetchMyRecords 查詢**：
```tsx
// src/pages/Creator.tsx:132-146
const { data, error } = await supabase
  .from("email_logs")
  .select(`
    id,
    keyword_id,
    email,
    unlocked_at,
    keywords (
      id,
      keyword,
      content
    )
  `)
  .eq("email", session.user.email)  // ⚠️ 確認 email 匹配
  .order("unlocked_at", { ascending: false });
```

3. **檢查 session.user.email**：
- Box 插入時的 email: `session.user.email`
- Creator 查詢時的 email: `session.user.email`
- 兩者必須完全一致（含大小寫）

---

### 問題 2：CTA 文案錯誤

#### 現況
**`src/pages/Box.tsx:220-226`**：
```tsx
<Button
  onClick={() => navigate("/login")}
  variant="outline"
  className="flex-1"
>
  註冊 KeyBox 免費查看 →
</Button>
```

#### 問題分析
- 此按鈕在「解鎖成功」後才顯示
- 若用戶已登入自動解鎖 → 顯示「註冊」不合理
- 若用戶未登入手動解鎖 → 顯示「註冊」合理

#### 解決方案

**方案 A：動態文案（推薦）⭐**
```tsx
const [isLoggedIn, setIsLoggedIn] = useState(false);

// 在 checkAuthAndAutoUnlock 中設定
const checkAuthAndAutoUnlock = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  setIsLoggedIn(!!session);
  // ... rest of code
};

// 在按鈕中使用
<Button
  onClick={() => navigate(isLoggedIn ? "/creator" : "/login")}
  variant="outline"
  className="flex-1"
>
  {isLoggedIn ? "查看我的記錄 →" : "註冊 KeyBox 免費查看 →"}
</Button>
```

**優點**：
- ✅ 已登入：導向 Creator 面板
- ✅ 未登入：導向 Login 註冊
- ✅ 文案符合用戶狀態

**方案 B：隱藏按鈕**
```tsx
{!isLoggedIn && (
  <Button onClick={() => navigate("/login")} variant="outline">
    註冊 KeyBox 免費查看 →
  </Button>
)}
```

**缺點**：已登入用戶無法快速導向 Creator

**方案 C：固定文案「查看更多」**
```tsx
<Button onClick={() => navigate("/creator")} variant="outline">
  查看更多資料包 →
</Button>
```

**缺點**：未登入用戶點擊後會被導向登入頁，體驗有斷層

---

### 決策矩陣

| 問題 | 方案 | 開發時間 | 體驗 | 推薦度 |
|------|------|---------|------|--------|
| 問題1 面板無記錄 | 先驗證原因 | 2 min | - | ✅ 必須 |
| 問題2 CTA 文案 | A 動態文案 | 5 min | ⭐⭐⭐⭐⭐ | ✅ 最佳 |
| 問題2 CTA 文案 | B 隱藏按鈕 | 3 min | ⭐⭐⭐ | 可選 |
| 問題2 CTA 文案 | C 固定文案 | 1 min | ⭐⭐ | 不推薦 |

---

### 實作計畫

#### Step 1：驗證問題 1（2 分鐘）
1. 打開 Creator 頁面
2. 點擊「查看我的領取記錄」
3. 若出現記錄 → 確認是 state 管理問題
4. 若仍無記錄 → 檢查資料庫 / 查詢條件

#### Step 2：修正問題 2（5 分鐘）
實作方案 A：動態 CTA

```tsx
// src/pages/Box.tsx 頂部新增 state
const [isLoggedIn, setIsLoggedIn] = useState(false);

// 在 checkAuthAndAutoUnlock 設定
const checkAuthAndAutoUnlock = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  setIsLoggedIn(!!session);
  // ... existing code
};

// 修改按鈕（line 220-226）
<Button
  onClick={() => navigate(isLoggedIn ? "/creator" : "/login")}
  variant="outline"
  className="flex-1"
>
  {isLoggedIn ? "查看我的管理面板 →" : "註冊 KeyBox 免費查看 →"}
</Button>
```

#### Step 3：若問題 1 是 state 問題（10 分鐘）
考慮以下方案：

**方案 X：useEffect 監聽路由**
```tsx
// src/pages/Creator.tsx
useEffect(() => {
  fetchMyRecords();
}, [location]);  // 當從 Box 頁面返回時自動刷新
```

**方案 Y：導航時帶參數**
```tsx
// Box.tsx
navigate("/creator?refresh=claimed");

// Creator.tsx
useEffect(() => {
  const params = new URLSearchParams(location.search);
  if (params.get("refresh") === "claimed") {
    fetchMyRecords();
  }
}, [location]);
```

---

### 測試驗證

修復後測試流程：

1. **未登入用戶**：
   - 訪問 `/box/:id`
   - 輸入關鍵字 + email 解鎖
   - 看到「註冊 KeyBox 免費查看 →」
   - 點擊導向 `/login`

2. **已登入用戶**：
   - 訪問 `/box/:id`
   - 自動解鎖
   - 看到「查看我的管理面板 →」
   - 點擊導向 `/creator`
   - 面板「我的領取記錄」顯示剛才領取的資料包

---

**開發時間：15 分鐘**（驗證 2 + CTA 5 + 可能的 state 修復 10）

**原則：先驗證、再修復、最後測試** 🔍

---

# 🔑 KeyBox V3：品牌重塑 + RWD 完整支援

## 一、專案願景

**從 Magic Box 升級為 KeyBox**

- **核心概念**：鑰匙 🔑 開啟寶箱的隱喻
- **品牌定位**：簡約、安全、流暢的內容分享平台
- **設計哲學**：Less is More - 最小化複雜度，最大化體驗

---

## 二、V3 目標

### 🎯 核心任務

1. **品牌重塑**：全站從 "Magic Box" 改為 "KeyBox"
2. **視覺升級**：導入鑰匙 🔑 意象，保持簡約風格
3. **RWD 完整支援**：手機、平板、桌面完美適配
4. **流暢體驗**：每個頁面在任何裝置都舒適流暢

### ⏱️ 開發時間估算

- **品牌文案替換**：15 分鐘
- **Icon & 視覺元素**：30 分鐘
- **RWD 調整（3 頁面）**：90 分鐘
- **測試 & 微調**：30 分鐘
- **README 撰寫**：15 分鐘
- **總計**：**180 分鐘（3 小時）**

---

## 三、品牌重塑方案

### 3.1 命名變更

| 舊名稱 | 新名稱 | 位置 |
|--------|--------|------|
| Magic Box | KeyBox | 全站標題、頁面 title |
| Keyword Box | KeyBox | Creator 管理面板 |
| 魔法盒子 | 鑰匙盒 | 中文文案 |
| Magic ✦ | KeyBox 🔑 | Logo & Branding |

### 3.2 視覺元素

**鑰匙意象設計**：

- **主 Icon**：🔑（Key emoji）
- **解鎖狀態**：🔓（Unlocked emoji）
- **鎖定狀態**：🔒（Locked emoji）
- **品牌色調**：保持現有的 gradient-magic，但加入金色調（#FFD700）象徵鑰匙

**Icon 使用規則**：

- 未解鎖：🔒 Locked
- 輸入關鍵字：🔑 Unlocking...
- 解鎖成功：🔓 Unlocked
- 管理面板：🔑 KeyBox Dashboard

### 3.3 文案更新

**Box 頁面**：
```
舊：Magic Box - 解鎖你的專屬內容 ✦
新：KeyBox 🔑 - 輸入關鍵字解鎖內容
```

**Creator 頁面**：
```
舊：Keyword Box 管理面板
新：KeyBox 管理面板 🔑
```

**Toast 訊息**：
```
舊：會員自動解鎖成功！
新：🔓 自動解鎖成功！
```

---

## 四、RWD 完整支援方案

### 4.1 響應式斷點

遵循 Tailwind CSS 預設斷點：

```
sm: 640px   (手機橫屏)
md: 768px   (平板)
lg: 1024px  (小筆電)
xl: 1280px  (桌面)
```

### 4.2 各頁面 RWD 需求

#### 📱 Login 頁面

**現狀**：基本 RWD 已完成
**需優化**：
- Auth UI 在小螢幕的間距
- Logo 大小響應式調整

**優化項目**：
```tsx
// Logo 響應式大小
<div className="text-4xl md:text-5xl lg:text-6xl">

// 卡片寬度
<div className="w-full max-w-md px-4 md:px-0">
```

#### 📱 Box 頁面

**現狀**：部分 RWD 已完成
**需優化**：
- 表單 Input 在小螢幕的觸控友善度
- 按鈕大小（手機需要更大的可點擊區域）
- 解鎖後的內容卡片排版

**優化項目**：
```tsx
// Input 加大 touch target
<Input className="h-12 text-base md:h-10" />

// 按鈕加大
<Button className="h-14 text-lg md:h-12 md:text-base">

// 卡片 padding 響應式
<div className="p-4 md:p-6 lg:p-8">
```

#### 📱 Creator 頁面（最複雜）

**現狀**：基本 grid 響應式已完成
**需優化**：

1. **Header 區塊**：
   - Email 顯示在小螢幕會過長
   - 登出按鈕位置

2. **關鍵字列表**：
   - 每個 item 在手機需要改為 vertical layout
   - 按鈕群組需要 stack

3. **專屬連結區塊**：
   - 長 URL 在手機需要 truncate
   - 複製按鈕位置

4. **領取記錄**：
   - 表格式 layout 改為卡片式

**優化策略**：
```tsx
// 關鍵字 item 響應式 layout
<div className="flex flex-col md:flex-row md:items-center gap-4">

// 按鈕群組 stack
<div className="flex flex-col sm:flex-row gap-2">

// URL truncate
<code className="truncate max-w-[200px] md:max-w-full">
```

### 4.3 通用 RWD 優化

**字體大小**：
```css
h1: text-2xl md:text-3xl lg:text-4xl
h2: text-xl md:text-2xl
body: text-sm md:text-base
small: text-xs md:text-sm
```

**間距**：
```css
section padding: p-4 md:p-6 lg:p-8
card padding: p-4 md:p-6
gap between elements: gap-2 md:gap-4
```

**觸控優化**：
```css
最小 touch target: 44x44px (iOS HIG)
按鈕最小高度: h-12 (48px)
Input 最小高度: h-12
```

---

## 五、視覺風格指南

### 5.1 色彩系統

**保持現有漸變**：
```css
gradient-magic: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
```

**新增金色調**（鑰匙主題）：
```css
key-gold: #FFD700
key-dark: #B8860B
```

**使用場景**：
- 鑰匙 Icon：金色
- 解鎖成功狀態：金色 accent
- Hover 效果：金色微光

### 5.2 Icon 系統

**現有 Icon（保留）**：
- Trash2（刪除）
- Plus（新增）
- LogOut（登出）
- Sparkles（特效）

**新增 Icon**（from lucide-react）：
- Key（鑰匙 - 替代 Sparkles）
- Lock（鎖定）
- Unlock（解鎖）
- KeyRound（圓形鑰匙）

### 5.3 動畫效果

**保持簡約**：
- Hover 效果：subtle scale (1.02)
- Loading：spin animation
- Toast：slide-in from top

**不過度設計**：
- ❌ 不要複雜的 3D 動畫
- ❌ 不要過多的 parallax
- ✅ 簡單的 fade / slide

---

## 六、開發執行計畫

### Phase 1：品牌重塑（30 分鐘）

1. 替換所有文案（Magic Box → KeyBox）
2. 更新 Icon（Sparkles → Key）
3. 調整 Toast 訊息
4. 更新 document title

### Phase 2：RWD - Login 頁面（15 分鐘）

1. Logo 響應式大小
2. Auth UI 卡片 padding
3. 測試手機顯示

### Phase 3：RWD - Box 頁面（30 分鐘）

1. Input touch target 加大
2. 按鈕響應式大小
3. 卡片 padding 調整
4. 測試解鎖流程

### Phase 4：RWD - Creator 頁面（60 分鐘）

1. Header 響應式 layout
2. 關鍵字 item 卡片化
3. 按鈕群組 stack
4. URL truncate
5. 領取記錄響應式
6. 測試所有功能

### Phase 5：視覺微調（15 分鐘）

1. 金色調整
2. Icon 統一
3. 間距微調

### Phase 6：測試 & Debug（30 分鐘）

1. iPhone (375px)
2. Android (360px)
3. iPad (768px)
4. Desktop (1920px)

---

## 七、測試清單

### 裝置測試

- [ ] iPhone SE (375x667)
- [ ] iPhone 12 (390x844)
- [ ] Android (360x640)
- [ ] iPad (768x1024)
- [ ] iPad Pro (1024x1366)
- [ ] Desktop (1920x1080)

### 功能測試

- [ ] 登入/註冊流程
- [ ] 手機輸入關鍵字
- [ ] 手機複製連結
- [ ] 手機查看領取記錄
- [ ] 平板管理關鍵字
- [ ] 所有按鈕可點擊（touch target 足夠）

### 視覺測試

- [ ] 文字不會過小
- [ ] 按鈕不會過小
- [ ] 長 URL 正確 truncate
- [ ] Icon 正確顯示
- [ ] 間距舒適

---

## 八、Commit 策略

### Commit 時機

1. **Phase 1 完成**：`feat: rebrand to KeyBox with key icons`
2. **Phase 2 完成**：`feat: add RWD support for Login page`
3. **Phase 3 完成**：`feat: add RWD support for Box page`
4. **Phase 4 完成**：`feat: add RWD support for Creator page`
5. **Phase 5 完成**：`style: visual refinement with gold accents`
6. **Phase 6 完成**：`test: verify RWD on all devices`
7. **README 完成**：`docs: add comprehensive Chinese README`

### Commit Message 規範

```
<type>: <subject>

<body>

<footer>
```

**Type**：
- feat（新功能）
- fix（修復）
- style（樣式）
- refactor（重構）
- docs（文件）
- test（測試）

---

## 九、成功標準

### 技術指標

- ✅ 所有頁面通過 Lighthouse Mobile 測試 > 90 分
- ✅ Touch target 最小 44x44px
- ✅ 文字最小 14px (mobile)
- ✅ 無水平滾動（任何裝置）

### 用戶體驗指標

- ✅ 手機單手操作順暢
- ✅ 按鈕不會誤觸
- ✅ 文字清晰易讀
- ✅ 品牌一致性

### 品牌指標

- ✅ 所有頁面使用 KeyBox 命名
- ✅ 鑰匙 Icon 統一使用
- ✅ 視覺風格一致

---

**開發時間：3 小時**

**完成標準：簡單、舒適、流暢** 🚀

**最終目標：天使輪融資、公司上市上櫃** 💰
