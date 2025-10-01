# 🔑 KeyBox

輕量級關鍵字資料包分享平台 - 讓創作者輕鬆分享專屬內容給受眾

## 🎯 專案簡介

KeyBox 是一個極簡的內容分享系統，透過「關鍵字」作為鑰匙 🔑，讓創作者輕鬆管理與分發數位內容。

**核心理念**：簡單、舒適、流暢

創作者可以：
1. 建立關鍵字與對應內容（文字/連結/檔案 URL）
2. 取得專屬分享連結
3. 追蹤誰領取了內容
4. 檢視自己領取過的其他資料包

使用者可以：
1. 透過關鍵字解鎖內容
2. 會員自動解鎖（無需重複輸入 Email）
3. 查看歷史領取記錄

## 🚀 快速開始

### 安裝依賴
```bash
npm install
```

### 啟動開發伺服器
```bash
npm run dev
```

預設運行在 `http://localhost:8080`

## 📖 使用流程

### 🎬 創作者端

1. **註冊/登入**
   - 前往 `/login` 頁面註冊或登入
   - 使用 Email + 密碼認證

2. **建立資料包**
   - 登入後導向管理面板 `/creator`
   - 點擊「新增關鍵字」
   - 填寫關鍵字與回覆內容
   - 系統自動生成專屬連結

3. **分享給受眾**
   - 複製專屬連結：`/box/{id}`
   - 在影片描述、貼文、社群平台分享
   - 告知受眾關鍵字（如：`freebook`、`download`）

4. **管理與追蹤**
   - 查看每個資料包的領取記錄
   - 刪除不需要的資料包
   - 查看自己領取過的其他資料包

### 👥 使用者端

#### 匿名使用者
1. 開啟創作者分享的連結 `/box/{id}`
2. 輸入關鍵字 + Email
3. 點擊「Unlock 🔓」解鎖內容

#### 會員使用者
1. 開啟連結後**自動解鎖**（無需輸入 Email）
2. 在管理面板查看領取記錄
3. 一鍵重新查看已領取內容

## 🏗️ 技術架構

- **前端框架**: React 18 + TypeScript + Vite
- **UI 設計**: Tailwind CSS + shadcn/ui
- **後端服務**: Supabase (Authentication + PostgreSQL Database)
- **路由管理**: React Router v6
- **狀態管理**: React Hooks
- **部署平台**: Vercel / Netlify / 任何 Vite-ready 平台

## 📊 資料結構

### keywords 表
```sql
- id (uuid) - 主鍵
- creator_id (uuid) - 創作者 ID
- keyword (text) - 關鍵字
- content (text) - 回覆內容
- created_at (timestamp)
- updated_at (timestamp)
```

### email_logs 表
```sql
- id (uuid) - 主鍵
- keyword_id (uuid) - 關鍵字 ID
- email (text) - 使用者 email
- unlocked_at (timestamp)
```

## 🔐 權限設定

- 創作者只能讀取/修改/刪除自己的關鍵字
- 使用者可以查詢所有關鍵字（但需輸入正確關鍵字才能看到內容）
- Email logs 記錄誰解鎖了什麼

## ✨ 核心功能

### V3 完整功能列表

#### 基礎功能
- ✅ 創作者註冊/登入認證
- ✅ 關鍵字與內容管理（CRUD）
- ✅ 專屬分享連結生成 (`/box/:id`)
- ✅ 關鍵字驗證解鎖機制
- ✅ Email 記錄與追蹤

#### 進階功能
- ✅ **會員自動解鎖**（登入後自動記錄，無需輸入 Email）
- ✅ **我的領取記錄**（創作者可查看自己領取過的資料包）
- ✅ **創作者專屬過濾**（只顯示自己的關鍵字）
- ✅ **領取記錄即時顯示**（頁面載入自動顯示）

#### 使用者體驗
- ✅ **響應式設計 (RWD)**（手機/平板/桌面完整支援）
- ✅ Touch Target 優化（按鈕 ≥ 44x44px）
- ✅ 文字清晰可讀（手機 ≥ 14px）
- ✅ 單手操作友善
- ✅ 無水平滾動
- ✅ 平滑滾動與動畫

#### 視覺設計
- ✅ **KeyBox 品牌識別**（鑰匙 🔑 主題）
- ✅ 金色 Accent 配色
- ✅ 漸層魔法效果
- ✅ Glass morphism 卡片
- ✅ 一致的 Icon 設計

## 🎨 設計理念

### 核心哲學

**簡單、舒適、流暢**

KeyBox 的設計遵循三大原則：

1. **簡單 Simple**
   - 最少步驟完成目標
   - 清晰的資訊層級
   - 直覺的操作流程

2. **舒適 Comfortable**
   - 金色暖調配色
   - 適當的留白空間
   - 一致的視覺語言

3. **流暢 Smooth**
   - 響應式設計全支援
   - 平滑的動畫過渡
   - 快速的載入反應

### 視覺風格

- **主題**：鑰匙 🔑 - 代表解鎖與存取
- **配色**：紫藍漸層 + 金色 Accent
- **質感**：Glass morphism + 發光效果
- **字體**：系統字體（最佳可讀性）

## 📝 開發歷程

### V1 - MVP 核心功能
- ✅ 基本認證功能
- ✅ 關鍵字新增/刪除
- ✅ 專屬連結生成
- ✅ 關鍵字驗證
- ✅ Email 記錄

### V2 - 體驗優化
- ✅ 會員自動解鎖機制
- ✅ 管理面板領取記錄顯示
- ✅ 我的領取記錄功能
- ✅ Creator ID 過濾邏輯
- ✅ RLS Policy 修正

### V3 - 全面升級（Current）
- ✅ KeyBox 品牌重塑
- ✅ 完整 RWD 支援
- ✅ 金色視覺微調
- ✅ 跨裝置測試通過
- ✅ 效能優化

### 未來規劃
- 📦 檔案上傳至 Supabase Storage
- 📊 領取次數統計儀表板
- 🔐 關鍵字加密儲存
- 🧪 自動化測試
- 🌐 多語系支援

## 🛠️ 相關指令

```bash
# 開發模式
npm run dev

# 建置
npm run build

# 預覽建置結果
npm run preview

# Lint 檢查
npm run lint
```

## 📦 部署指南

### 推薦平台

1. **Vercel**（推薦）
   - 零設定部署
   - 自動 HTTPS
   - 全球 CDN

2. **Netlify**
   - 拖拉即部署
   - 表單處理

3. **其他 Vite-ready 平台**
   - Cloudflare Pages
   - GitHub Pages
   - Railway

### 環境變數設定

建立 `.env` 檔案：

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### 部署步驟

```bash
# 1. 建置專案
npm run build

# 2. 預覽建置結果
npm run preview

# 3. 部署至平台
# (根據選擇的平台執行對應指令)
```

## 🎯 使用案例

KeyBox 適合用於：

- 🎥 **影片創作者**：在影片描述分享下載連結
- 📝 **部落客**：提供訂閱者專屬內容
- 🎓 **線上課程**：發放課程資源
- 📚 **作家/出版商**：分發電子書試閱
- 🎵 **音樂人**：分享 Demo 或獨家音軌
- 🎮 **遊戲開發者**：發放 Beta 測試碼

## 🔐 安全性

- ✅ Supabase Row Level Security (RLS)
- ✅ 創作者資料隔離
- ✅ Email 記錄防重複領取
- ✅ HTTPS 加密傳輸

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

建議開發流程：
1. Fork 此專案
2. 建立 feature branch
3. Commit 你的變更
4. Push 到你的 branch
5. 發起 Pull Request

## 📄 授權

MIT License - 自由使用、修改、分發

## 🙏 致謝

- [Supabase](https://supabase.com/) - 開源 Firebase 替代方案
- [shadcn/ui](https://ui.shadcn.com/) - 精美的 React 元件庫
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS 框架
- [Lucide Icons](https://lucide.dev/) - 簡潔優雅的 Icon 集

---

**用 KeyBox 🔑 解鎖無限可能！**

專案維護：KeyBox Team
最後更新：2025-10-01
版本：v3.0.0