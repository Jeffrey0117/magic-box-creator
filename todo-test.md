# KeyBox V3 開發執行清單

## 階段性 Commit 策略
每完成一個 Phase 就 commit 一次，確保進度可追蹤。

---

## Phase 0: 現階段成果存檔
- [ ] Commit 現有成果：`feat: complete V2 with RLS fix and auto-unlock`
- [ ] Push 到遠端

---

## Phase 1: 品牌重塑 (預計 30 分鐘)

### 1.1 文案替換
- [ ] `index.html` - 更新 `<title>` 為 "KeyBox"
- [ ] `src/pages/Login.tsx` - Logo 文字改為 "KeyBox"
- [ ] `src/pages/Box.tsx` - 標題改為 "KeyBox 🔑"
- [ ] `src/pages/Box.tsx` - 副標題改為 "輸入關鍵字解鎖內容"
- [ ] `src/pages/Creator.tsx` - 標題改為 "KeyBox 管理面板 🔑"

### 1.2 Icon 替換
- [ ] `src/pages/Box.tsx` - 將 `Sparkles` 改為 `Key` icon
- [ ] `src/pages/Box.tsx` - 未解鎖狀態使用 `Lock` icon
- [ ] `src/pages/Box.tsx` - 解鎖成功使用 `Unlock` icon
- [ ] 從 `lucide-react` import: `Key, Lock, Unlock`

### 1.3 Toast 訊息更新
- [ ] "會員自動解鎖成功！" → "🔓 自動解鎖成功！"
- [ ] "歡迎回來！" → "🔓 歡迎回來！"
- [ ] "解鎖成功！" → "🔓 解鎖成功！"

### 1.4 Commit
- [ ] `feat: rebrand to KeyBox with key icons`
- [ ] Push

---

## Phase 2: RWD - Login 頁面 (預計 15 分鐘)

### 2.1 Logo 響應式
- [ ] Logo 文字大小：`text-4xl md:text-5xl lg:text-6xl`
- [ ] Logo container padding 調整

### 2.2 卡片寬度
- [ ] Auth UI 卡片：`w-full max-w-md px-4 md:px-0`
- [ ] 間距調整：`p-6 md:p-8`

### 2.3 測試
- [ ] 手機 (375px) 顯示正常
- [ ] 平板 (768px) 顯示正常
- [ ] 桌面 (1920px) 顯示正常

### 2.4 Commit
- [ ] `feat: add RWD support for Login page`
- [ ] Push

---

## Phase 3: RWD - Box 頁面 (預計 30 分鐘)

### 3.1 Touch Target 優化
- [ ] Input 高度：`h-12 text-base md:h-10 md:text-sm`
- [ ] Button 高度：`h-14 text-lg md:h-12 md:text-base`
- [ ] 確保最小 touch target 44x44px

### 3.2 卡片響應式
- [ ] 主卡片 padding：`p-6 md:p-8`
- [ ] Icon container 大小：`w-16 h-16 md:w-20 md:h-20`
- [ ] 標題大小：`text-3xl md:text-4xl lg:text-5xl`

### 3.3 按鈕群組
- [ ] 解鎖後按鈕：`flex flex-col sm:flex-row gap-3`
- [ ] 確保手機 vertical stack

### 3.4 測試
- [ ] 手機輸入流暢
- [ ] 按鈕易點擊
- [ ] 解鎖後卡片顯示完整

### 3.5 Commit
- [ ] `feat: add RWD support for Box page`
- [ ] Push

---

## Phase 4: RWD - Creator 頁面 (預計 60 分鐘)

### 4.1 Header 優化
- [ ] Email 顯示：加入 `truncate` 或換行
- [ ] 標題響應式：`text-2xl md:text-3xl lg:text-4xl`
- [ ] 登出按鈕：手機顯示 icon only

### 4.2 關鍵字列表重構
- [ ] Item layout：`flex flex-col md:flex-row gap-4`
- [ ] 關鍵字/內容：`grid grid-cols-1 md:grid-cols-2 gap-4`
- [ ] 專屬連結區塊獨立成一行

### 4.3 URL 顯示優化
- [ ] URL code block：`truncate max-w-[200px] md:max-w-full`
- [ ] 複製按鈕：固定寬度不 shrink

### 4.4 按鈕群組
- [ ] 查看記錄 / 刪除按鈕：`flex flex-col sm:flex-row gap-2`
- [ ] 確保手機 stack 顯示

### 4.5 領取記錄優化
- [ ] Record item：卡片式 layout
- [ ] 時間顯示：`text-xs md:text-sm`
- [ ] Scroll area 高度響應式

### 4.6 新增關鍵字表單
- [ ] 表單 padding：`p-4 md:p-6`
- [ ] Input spacing：`space-y-3 md:space-y-4`

### 4.7 測試
- [ ] 手機單手操作順暢
- [ ] 所有按鈕不會誤觸
- [ ] 長 URL 正確 truncate
- [ ] 領取記錄可滾動查看

### 4.8 Commit
- [ ] `feat: add RWD support for Creator page`
- [ ] Push

---

## Phase 5: 視覺微調 (預計 15 分鐘)

### 5.1 金色調整
- [ ] 定義 CSS variable：`--key-gold: #FFD700`
- [ ] 鑰匙 icon 使用金色
- [ ] 解鎖成功狀態金色 accent

### 5.2 Icon 統一
- [ ] 確認所有 Key/Lock/Unlock icon 正確使用
- [ ] Icon 大小一致：`w-5 h-5` 或 `w-6 h-6`

### 5.3 間距微調
- [ ] 檢查所有頁面間距一致性
- [ ] 確保 mobile/desktop 間距合理

### 5.4 Commit
- [ ] `style: visual refinement with gold accents`
- [ ] Push

---

## Phase 6: 測試 & Debug (預計 30 分鐘)

### 6.1 裝置測試
- [ ] iPhone SE (375x667) - 直向/橫向
- [ ] iPhone 12 (390x844) - 直向/橫向
- [ ] Android (360x640) - 直向/橫向
- [ ] iPad (768x1024) - 直向/橫向
- [ ] Desktop (1920x1080)

### 6.2 功能測試
- [ ] 手機註冊/登入流程
- [ ] 手機輸入關鍵字解鎖
- [ ] 手機複製專屬連結
- [ ] 手機查看領取記錄
- [ ] 手機新增/刪除關鍵字
- [ ] 平板所有功能
- [ ] 桌面所有功能

### 6.3 視覺測試
- [ ] 所有文字清晰可讀 (≥14px mobile)
- [ ] 所有按鈕易點擊 (≥44x44px)
- [ ] 無水平滾動
- [ ] Icon 顯示正確
- [ ] 品牌一致性

### 6.4 Debug & 修正
- [ ] 記錄發現的問題
- [ ] 逐一修正
- [ ] 重新測試

### 6.5 Commit
- [ ] `test: verify RWD on all devices and fix issues`
- [ ] Push

---

## Phase 7: README 撰寫 (預計 15 分鐘)

### 7.1 README 內容
- [ ] 專案簡介
- [ ] 設計理念
- [ ] 核心功能
- [ ] 技術架構
- [ ] 安裝步驟
- [ ] 使用說明
- [ ] 開發指南
- [ ] License

### 7.2 語言
- [ ] 使用繁體中文
- [ ] 簡單清楚
- [ ] 包含範例

### 7.3 Commit
- [ ] `docs: add comprehensive Chinese README`
- [ ] Push

---

## Phase 8: 最終檢查 & 部署

### 8.1 程式碼檢查
- [ ] 移除所有 console.log (除錯用)
- [ ] 檢查 TODO comments
- [ ] 確認無 lint errors

### 8.2 文件檢查
- [ ] README.md 完整
- [ ] prd.md 記錄所有迭代
- [ ] todo-test.md 全部勾選

### 8.3 Git 檢查
- [ ] 所有變更已 commit
- [ ] Commit messages 清楚
- [ ] 已 push 到遠端

### 8.4 最終 Commit
- [ ] `chore: final cleanup and preparation for launch`
- [ ] Push
- [ ] 打 tag：`v3.0.0`

---

## 完成標準

✅ **技術**：
- 所有頁面 RWD 完整支援
- Touch target ≥ 44px
- 文字 ≥ 14px (mobile)
- 無水平滾動

✅ **品牌**：
- 全站使用 KeyBox 命名
- 鑰匙 Icon 統一
- 視覺風格一致

✅ **體驗**：
- 手機單手操作順暢
- 按鈕不會誤觸
- 文字清晰易讀

✅ **文件**：
- README 完整清楚
- 中文撰寫
- 包含使用說明

---

**總預計時間：3 小時**

**最終目標：簡單、舒適、流暢 🚀**

**天使輪融資、公司上市上櫃 💰**