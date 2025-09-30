# ✦ Magic Box Creator ✦

輕量級關鍵字資料包分享平台 - 讓創作者輕鬆分享專屬內容給粉絲

## 🎯 專案簡介

這是一個極簡的內容分享系統，讓創作者可以：
1. 設定關鍵字與對應內容（文字/連結/檔案 URL）
2. 取得專屬分享連結
3. 粉絲透過輸入關鍵字即可解鎖內容

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

### 創作者端

1. **註冊/登入**
   - 前往 `/login` 頁面
   - 使用 email + 密碼註冊或登入

2. **新增資料包**
   - 登入後自動導向 `/creator` 管理頁面
   - 點擊「新增關鍵字」
   - 填寫：
     - 關鍵字（如：`freebook`）
     - 回覆內容（如：下載連結、文字、任何內容）
   - 送出後會顯示在列表中

3. **分享專屬連結**
   - 每個資料包都有專屬連結：`/box/{id}`
   - 點擊「複製」按鈕即可複製連結
   - 在影片、貼文中分享此連結給粉絲

### 使用者端

1. **開啟分享連結**
   - 點擊創作者分享的 `/box/{id}` 連結
   - 或是從首頁 `/` 輸入任意關鍵字查詢

2. **輸入關鍵字解鎖**
   - 輸入創作者提供的關鍵字
   - 輸入 email（用於記錄）
   - 點擊「Unlock」

3. **取得內容**
   - 驗證成功後顯示內容
   - 可以是文字、連結、下載網址等

## 🏗️ 技術架構

- **前端**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **後端**: Supabase (Auth + Database)
- **路由**: React Router

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

- ✅ 創作者認證系統
- ✅ 關鍵字與內容管理
- ✅ 專屬分享連結 (`/box/:id`)
- ✅ 關鍵字驗證機制
- ✅ Email 記錄追蹤
- ✅ 一鍵複製連結
- ✅ 魔法主題 UI

## 🎨 設計特色

- 魔法主題設計（漸層、發光效果）
- 響應式設計（支援手機/平板/桌面）
- 簡潔直覺的操作流程
- 即時錯誤提示

## 📝 開發筆記

### V1 (MVP) 已完成
- 基本認證功能
- 關鍵字新增/刪除
- 專屬連結生成
- 關鍵字驗證
- Email 記錄

### V2 規劃
- 檔案上傳到 Supabase Storage
- 領取次數統計顯示
- 關鍵字加密儲存
- 更完整的錯誤處理
- 自動化測試

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

## 📦 部署

專案可部署至：
- Vercel (推薦)
- Netlify
- 任何支援 Vite 的平台

記得設定環境變數：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

## 📄 授權

MIT License

---

**享受魔法般的內容分享體驗！✦**