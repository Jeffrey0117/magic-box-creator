# 🔧 KeyBox V6.1 修復清單

**版本**: V6.1  
**更新時間**: 2025-10-02  
**狀態**: 待執行

---

## 📋 本次修復項目總覽

| # | 問題 | 嚴重性 | 預計時間 |
|---|------|--------|---------|
| **UUID** | UUID 網址洩露安全問題 | 🔴 Critical | 15 min |
| **1** | iPhone 14 垂直滾動軸 + 留白問題 | 🔴 Critical | 5 min |
| **2** | Email 輸入門檻說明 | 🟡 Important | 10 min |
| **3** | 註冊登入誘因提示優化 | 🟡 Important | 10 min |
| **5** | 關鍵字說明不足 | 🟡 Important | 10 min |
| **10** | 隱私權說明 | 🔴 Critical | 15 min |
| **11** | 垃圾內容風險提示 | 🟢 Nice to Have | 10 min |

**總計**: 約 75 分鐘

---

## 🚨 Critical 問題（優先處理）

### 問題 UUID：UUID 網址洩露安全問題

#### 🔍 問題描述

**當前行為**：
```
用戶訪問：/aB3cD5（短網址）
  ↓ 解鎖後
URL 變成：/box/ec2f272f-49fb-46d3-aee4-08ab688b6129
```

**安全風險**：
- ❌ 這個 UUID 網址**任何人都能直接訪問**
- ❌ 繞過關鍵字驗證機制
- ❌ 內容可被病毒式傳播
- ❌ 創作者失去控制權

#### ✅ 解決方案

**核心概念**：強制使用短網址作為唯一入口

**修改檔案**：`src/pages/Box.tsx`

**位置 1**：[`Box.tsx:20-28`](src/pages/Box.tsx:20-28) - 修改 useEffect

```tsx
// BEFORE
useEffect(() => {
  const init = async () => {
    if (id || shortCode) {
      await fetchBoxData();
      await checkAuthAndAutoUnlock();
    }
  };
  init();
}, [id, shortCode]);

// AFTER
useEffect(() => {
  const init = async () => {
    if (id) {
      await redirectToShortCode();  // ← 新增：UUID 重導向
    } else if (shortCode) {
      await fetchBoxData();
      await checkAuthAndAutoUnlock();
    }
  };
  init();
}, [id, shortCode]);
```

**位置 2**：新增 `redirectToShortCode` 函式（在 `checkAuthAndAutoUnlock` 之前）

```tsx
const redirectToShortCode = async () => {
  const { data } = await supabase
    .from("keywords")
    .select("short_code")
    .eq("id", id)
    .maybeSingle();
  
  if (data?.short_code) {
    navigate(`/${data.short_code}`, { replace: true });
  } else {
    toast.error("找不到此資料包");
    navigate("/");
  }
};
```

#### 📊 修復效果

| 場景 | Before | After |
|------|--------|-------|
| 訪問 `/aB3cD5` | ✅ 正常解鎖 | ✅ 正常解鎖 |
| 訪問 `/box/uuid` | ❌ 直接顯示內容 | ✅ 重導向到 `/aB3cD5` |
| 分享 UUID 給朋友 | ❌ 朋友直接看到 | ✅ 朋友需要輸入關鍵字 |

---

### 問題 1：iPhone 14 垂直滾動軸 + 留白問題

#### 🔍 問題描述

**現象**：
- 電腦模擬手機：✅ 完美垂直置中
- 真實 iPhone 14：❌ 上方有留白 + 出現滾動軸

**根本原因**：
- Safari 地址欄動態高度
- `min-h-screen` 使用 `100vh` 不適用 iOS
- `background-attachment: fixed` 在 iOS 有 Bug

#### ✅ 解決方案

**修改檔案**：`src/index.css`

**位置**：[`index.css:109-113`](src/index.css:109-113)

```css
/* BEFORE */
body {
  @apply bg-background text-foreground;
  background-image: var(--gradient-glow);
  background-attachment: fixed;
}

/* AFTER */
body {
  @apply bg-background text-foreground;
  background-image: var(--gradient-glow);
  background-attachment: fixed;
  min-height: 100vh;        /* ← 舊瀏覽器降級 */
  min-height: 100dvh;       /* ← iOS Safari 專用 */
}
```

#### 📱 說明

- `100dvh` = Dynamic Viewport Height（動態視窗高度）
- 自動適應 Safari 地址欄展開/收起
- 舊瀏覽器會忽略 `100dvh`，使用 `100vh` 降級

---

### 問題 10：隱私權說明不足

#### 🔍 問題描述

**使用者疑慮**：
- ❓ Email 會被保存嗎？
- ❓ 創作者能看到我的 Email 嗎？
- ❓ 會被賣給第三方嗎？

#### ✅ 解決方案

**修改檔案**：`src/pages/Box.tsx`

**位置**：[`Box.tsx:217-229`](src/pages/Box.tsx:217-229) - Email 輸入欄位下方

```tsx
<div>
  <label className="text-sm font-medium mb-2 block">
    Email
  </label>
  <Input
    type="email"
    placeholder="your@email.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    className="w-full h-12 text-base md:h-10 md:text-sm"
  />
  {/* ← 新增隱私說明 */}
  <p className="text-xs text-muted-foreground mt-1">
    🔒 您的 Email 僅用於領取記錄，創作者可見，不會轉售第三方
  </p>
</div>
```

---

## 🟡 Important 問題（建議處理）

### 問題 2：Email 輸入門檻說明

#### 🔍 問題描述

**使用者困惑**：
- 為什麼要輸入 Email？
- 會不會收到垃圾信？

#### ✅ 解決方案

**已在「問題 10」中處理**（合併優化）

---

### 問題 3：註冊登入誘因提示優化

#### 🔍 問題描述

**現況**：
- 提示文字：「註冊後自動解鎖，無需重複輸入 ✨」
- **問題**：誘因不夠明顯

#### ✅ 解決方案

**修改檔案**：`src/pages/Box.tsx`

**位置**：[`Box.tsx:244-254`](src/pages/Box.tsx:244-254)

```tsx
/* BEFORE */
<div className="mt-6 text-center space-y-2">
  <button
    onClick={() => navigate(`/login?returnTo=${location.pathname}`)}
    className="text-sm font-medium text-foreground hover:text-accent transition-colors"
  >
    會員登入 →
  </button>
  <p className="text-xs text-muted-foreground">
    註冊後自動解鎖，無需重複輸入 ✨
  </p>
</div>

/* AFTER */
<div className="mt-6 text-center space-y-2">
  <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 mb-3">
    <p className="text-sm font-medium text-accent mb-1">
      ✨ 註冊會員享受更多便利
    </p>
    <p className="text-xs text-muted-foreground">
      • 自動解鎖，無需重複輸入<br/>
      • 查看我的領取記錄<br/>
      • 一鍵管理所有資料包
    </p>
  </div>
  <button
    onClick={() => navigate(`/login?returnTo=${location.pathname}`)}
    className="text-sm font-medium text-foreground hover:text-accent transition-colors"
  >
    立即註冊／登入 →
  </button>
</div>
```

---

### 問題 5：關鍵字說明不足

#### 🔍 問題描述

**使用者困惑**：
- 不知道「關鍵字」是什麼
- 創作者沒有明確告知
- 使用者亂猜浪費時間

#### ✅ 解決方案

**修改檔案**：`src/pages/Box.tsx`

**位置**：[`Box.tsx:205-216`](src/pages/Box.tsx:205-216) - 關鍵字輸入欄位

```tsx
/* BEFORE */
<div>
  <label className="text-sm font-medium mb-2 block">
    關鍵字
  </label>
  <Input
    placeholder="輸入關鍵字..."
    value={keyword}
    onChange={(e) => setKeyword(e.target.value)}
    required
    className="w-full h-12 text-base md:h-10 md:text-sm"
  />
</div>

/* AFTER */
<div>
  <label className="text-sm font-medium mb-2 block">
    關鍵字
  </label>
  <Input
    placeholder="輸入關鍵字..."
    value={keyword}
    onChange={(e) => setKeyword(e.target.value)}
    required
    className="w-full h-12 text-base md:h-10 md:text-sm"
  />
  <p className="text-xs text-muted-foreground mt-1">
    💡 請向創作者索取關鍵字（不分大小寫）
  </p>
</div>
```

---

## 🟢 Nice to Have（選用）

### 問題 11：垃圾內容風險提示

#### 🔍 問題描述

**潛在風險**：
- 創作者可能上傳不當內容
- 詐騙連結、惡意軟體

#### ✅ 解決方案（選用）

**修改檔案**：`src/pages/Box.tsx`

**位置**：[`Box.tsx:269-271`](src/pages/Box.tsx:269-271) - 內容顯示區塊上方

```tsx
/* 在內容顯示前加入警告（如果需要） */
<div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
  <p className="text-xs text-amber-600 dark:text-amber-400">
    ⚠️ 請確認內容來自可信來源，KeyBox 不對創作者內容負責
  </p>
</div>

<div className="bg-muted/50 rounded-lg p-6 mb-6">
  <p className="text-lg break-all">{result}</p>
</div>
```

---

## 📝 執行步驟

### Phase 1：Critical 修復（30 分鐘）

- [ ] **UUID 安全問題**
  - [ ] 新增 `redirectToShortCode` 函式
  - [ ] 修改 `useEffect` 邏輯
  - [ ] 測試 `/box/uuid` 重導向
  
- [ ] **iPhone 留白問題**
  - [ ] 修改 `src/index.css` 加入 `100dvh`
  - [ ] 真機測試 iPhone 14
  
- [ ] **隱私權說明**
  - [ ] 加入 Email 欄位說明
  - [ ] 確認文案清楚易懂

---

### Phase 2：Important 優化（30 分鐘）

- [ ] **註冊誘因優化**
  - [ ] 設計提示卡片
  - [ ] 列出具體好處
  
- [ ] **關鍵字說明**
  - [ ] 加入提示文字
  - [ ] 標註不分大小寫

---

### Phase 3：測試驗證（15 分鐘）

- [ ] **功能測試**
  - [ ] 訪問短網址正常
  - [ ] 訪問 UUID 重導向正確
  - [ ] iPhone 14 無滾動軸
  
- [ ] **視覺測試**
  - [ ] 提示文字清楚可見
  - [ ] RWD 正常運作

---

### Phase 4：Commit & Push

```bash
git add .
git commit -m "fix: V6.1 安全性與 UX 優化（UUID 洩露 + iPhone 留白 + 隱私說明）"
git push origin main
```

---

## ✅ 完成檢查清單

### 🔴 Critical（必須全部完成）
- [ ] UUID 重導向功能正常
- [ ] iPhone 14 垂直置中無滾動軸
- [ ] 隱私權說明清楚顯示

### 🟡 Important（建議完成）
- [ ] 註冊誘因卡片顯示
- [ ] 關鍵字提示文字顯示

### 🟢 Nice to Have（選用）
- [ ] 內容風險警告（視需求）

---

## 🚀 預期成果

### 安全性提升
- ✅ UUID 網址無法被濫用
- ✅ 強制透過短網址驗證
- ✅ 隱私權說明清楚

### UX 優化
- ✅ iPhone 體驗完美
- ✅ 使用者知道為何要輸入 Email
- ✅ 註冊誘因明確

---

**準備好了就開始執行！** 🎯