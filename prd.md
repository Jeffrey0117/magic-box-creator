# KeyBox PRD - 產品需求文件

## 專案狀態：V7.5 正式版（已上線）

## 📌 產品定位

**KeyBox 是一個「關鍵字解鎖 Email 收集工具」**

- ✅ 主要功能：透過關鍵字機制收集 Email 名單
- ✅ 適用場景：社群貼文、Threads、IG 限動、Newsletter
- ⚠️ **重要說明**：KeyBox 僅負責「Email 收集與管理」
  - 實體資料包（檔案、連結）需創作者自行上傳雲端（Google Drive / Dropbox）
  - KeyBox 提供「內容欄位」讓你填入雲端連結
  - 未來可能規劃整合雲端服務（需求驗證中）

---

## ✅ 已完成功能總覽

### V1-V3：核心功能 + RWD + 品牌重塑
- ✅ 登入註冊系統（Supabase Auth）
- ✅ 創建資料包（關鍵字 + 內容）
- ✅ 關鍵字解鎖機制
- ✅ 已登入用戶自動解鎖
- ✅ 我的領取記錄功能
- ✅ RWD 全裝置支援
- ✅ KeyBox 綠色品牌主題

### V4：數據管理與分析
- ✅ CSV 匯出功能（Email 名單）
- ✅ OG Meta Tags（社群分享優化）
- ✅ Google Analytics 4 整合

### V5：短網址系統
- ✅ NanoID 短碼生成（6 字元）
- ✅ 短網址路由支援（`/:shortCode`）
- ✅ 向後兼容舊 UUID 連結

### V6：註冊登入體驗優化
- ✅ 驗證信中文化
- ✅ Tab 切換式 UI（登入/註冊）
- ✅ 驗證連結修正（Production 環境）
- ✅ 註冊提示優化

### V7：UX 最終優化
- ✅ 分享文案範本功能
- ✅ 錯誤訊息全面中文化
- ✅ Loading 狀態優化
- ✅ 隱私權政策頁面
- ✅ 使用說明頁面

### V7.1：管理面板優化（2025-10-02）
- ✅ 移除混亂的「回到 Box 頁面」按鈕
- ✅ 新增「使用說明」和「隱私權政策」快速入口
- ✅ 優化底部區塊文案與佈局

### V7.2：限額功能（2025-10-02）
- ✅ 新增 quota 欄位至 keywords 資料表
- ✅ 剩餘數量顯示功能

### V7.5：首頁重新設計（2025-10-02）
- ✅ 品牌介紹式首頁設計
- ✅ 使用者/創作者雙動線教學
- ✅ 適合場景展示
- ✅ 移除 Lovable SEO 痕跡
- ✅ 首頁自動導向登入頁邏輯修正

---

## 📋 待處理項目清單

### 🔥 最高優先級（已完成）

#### 0. 領取記錄管理優化 ✅ 已完成（V8.0）
**已解決問題**：
- ✅ **統計數字一目了然**：每個關鍵字卡片直接顯示總領取、今日新增、剩餘份數
- ✅ **記錄可刪除**：單筆刪除功能 + RLS DELETE policy
- ✅ **刪除驗證**：確認對話框 + 錯誤處理強化
- ✅ **按鈕配色優化**：提高可讀性

---

### 🔥 當前最高優先級（V8.1）

#### 1. Email 複製功能優化 ⭐⭐⭐⭐⭐
**用戶需求**：
> "信箱那邊除了刪除以外也要有複製按鈕，且要有一次複製（就是用,隔開）的"

**現況問題**：
- 需要手動選取 Email 才能複製
- 無法一次複製所有 Email 用於郵件行銷工具

**改進方案**：

##### A. 單筆 Email 複製按鈕（必做）⭐⭐⭐⭐⭐
**目標**：快速複製單一 Email

**UI 設計**：
```tsx
// 在領取記錄列表中，每筆記錄旁加入複製按鈕
<div className="flex justify-between items-center gap-2">
  <span className="font-medium truncate">{log.email}</span>
  <div className="flex gap-1">
    <Button
      size="sm"
      variant="ghost"
      onClick={() => {
        navigator.clipboard.writeText(log.email);
        toast.success(`已複製：${log.email}`);
      }}
    >
      <Copy className="w-3 h-3" />
    </Button>
    <Button
      size="sm"
      variant="ghost"
      onClick={() => handleDeleteEmailLog(log.id, log.email)}
      className="text-destructive"
    >
      <Trash2 className="w-3 h-3" />
    </Button>
  </div>
</div>
```

**時間估計**：10 分鐘  
**技術難度**：極低

---

##### B. 一鍵複製所有 Email（必做）⭐⭐⭐⭐⭐
**目標**：複製所有 Email 用於郵件行銷工具

**UI 設計**：
```tsx
// 在領取記錄區塊頂部加入「複製全部」按鈕
<div className="flex justify-between items-center mb-3">
  <h3 className="font-semibold">領取記錄 ({emailLogs.length})</h3>
  <div className="flex gap-2">
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        const emails = emailLogs.map(log => log.email).join(',');
        navigator.clipboard.writeText(emails);
        toast.success(`已複製 ${emailLogs.length} 個 Email`);
      }}
      className="gap-2"
    >
      <Copy className="w-4 h-4" />
      複製全部 Email
    </Button>
    <Button size="sm" variant="outline" onClick={exportToCSV}>
      <Download className="w-4 h-4" />
      匯出 CSV
    </Button>
    <Button size="sm" variant="ghost" onClick={closeModal}>
      關閉
    </Button>
  </div>
</div>
```

**功能說明**：
- 將所有 Email 用逗號 (`,`) 分隔
- 格式：`email1@example.com,email2@example.com,email3@example.com`
- 可直接貼到 Gmail / Mailchimp / ConvertKit

**時間估計**：10 分鐘  
**技術難度**：極低

---

##### C. 批次刪除功能（選做）⭐⭐⭐
**目標**：一次清空所有領取記錄

**UI 設計**：
```tsx
<Button
  size="sm"
  variant="outline"
  onClick={() => handleBatchDelete(selectedKeywordId)}
  className="text-destructive border-destructive"
>
  <Trash2 className="w-4 h-4" />
  清空所有記錄
</Button>
```

**功能流程**：
1. 點擊「清空所有記錄」
2. 彈出確認對話框：
   ```
   ⚠️ 警告：此操作將永久刪除所有 {emailLogs.length} 筆領取記錄
   此動作無法復原，確定要繼續嗎？
   ```
3. 確認後刪除該關鍵字下所有 email_logs
4. 重新載入統計數字

**時間估計**：15 分鐘  
**技術難度**：低

---

**實作順序**：
1. **立即執行**：A + B（單筆複製 + 複製全部）
2. **選做**：C（批次刪除）

**預期效益**：
- ✅ 提升 Email 管理效率 90%
- ✅ 支援主流郵件行銷工具
- ✅ 減少手動選取 Email 的時間

---

---

### 📧 Email 寄送服務整合討論

#### 問題：KeyBox 是否應該內建 Email 寄送功能？

**用戶疑問**：
> "關於寄信的服務是否要包含？我覺得不包含，但是否能開另一個專案去配合 Mailion 之類的"

**答案：不包含，理由如下**

##### 為什麼 KeyBox 不應該內建寄信功能？

1. **產品定位清晰**
   - KeyBox = Email **收集**工具（Lead Generation）
   - 專注做好一件事：收集 Email 名單
   - 避免功能膨脹（Feature Creep）

2. **技術複雜度高**
   - 需要 SMTP 伺服器 / SendGrid / AWS SES
   - Email 模板設計與管理
   - 反垃圾郵件機制（SPF / DKIM / DMARC）
   - 寄送追蹤（開信率、點擊率）
   - 退信處理（Bounce Management）
   - 成本：SendGrid 免費額度 100 封/天，付費 $15/月起

3. **市場已有成熟方案**
   - Mailchimp（領導品牌）
   - ConvertKit（創作者導向）
   - Mailgun / SendGrid（開發者工具）
   - 重複造輪子沒有意義

4. **維護成本高**
   - Email deliverability 是專業領域
   - 需要持續監控寄送成功率
   - 需要處理用戶投訴與退信

##### 建議方案：整合現有 Email 服務

**方案 A：一鍵複製 Email（✅ 推薦）**
- 提供「複製全部 Email」功能
- 用戶直接貼到 Gmail / Mailchimp / ConvertKit
- 實作成本：10 分鐘
- 維護成本：0

**方案 B：CSV 匯出（✅ 已實作）**
- 匯出 Email 列表為 CSV
- 匯入到任何 Email 行銷工具
- 實作成本：已完成
- 維護成本：0

**方案 C：Zapier / Make 整合（🔮 未來考慮）**
- 提供 Webhook 通知
- 有新 Email 領取時觸發 Zapier
- 自動同步到 Mailchimp / ConvertKit
- 實作成本：2-3 天
- 維護成本：低

**方案 D：獨立專案 Mailion 整合（❌ 不建議）**
- 需要開發新專案
- 需要維護兩個系統
- 增加複雜度與成本
- ROI 低

##### 最終建議

**✅ 立即執行**：
1. V8.1 Email 複製功能（單筆 + 複製全部）
2. 在「使用說明」補充教學：
   ```markdown
   ## 如何寄送 Email 給領取者？
   
   KeyBox 專注於 Email 收集，寄送功能請使用專業工具：
   
   **方法 1：直接寄送（適合小量）**
   1. 點擊「複製全部 Email」
   2. 貼到 Gmail 的「密件副本（BCC）」
   3. 撰寫信件並寄送
   
   **方法 2：使用 Email 行銷工具（推薦）**
   1. 匯出 CSV
   2. 匯入到 Mailchimp / ConvertKit
   3. 設計 Email 模板並排程寄送
   
   **推薦工具**：
   - Mailchimp（免費額度：500 訂閱者）
   - ConvertKit（免費額度：300 訂閱者）
   - Mailgun（開發者適用）
   ```

**🔮 PMF 後考慮**：
- Zapier / Make Webhook 整合
- API 開放（讓第三方整合）

---

### 🎯 高優先級（建議近期完成）

#### 2. 購買自訂網域 ⭐⭐⭐⭐
**現況**：使用 Vercel 預設網址（`xxx.vercel.app`）

**建議行動**：
- 購買簡短網域（例如：`keyb.ox`, `keyb.app`）
- 成本：$10-30/年
- 時間：30 分鐘（購買 + DNS 設定）
- 效益：提升品牌專業度 70%

---

### 🚀 中優先級（PMF 驗證後）

#### 2. PWA 支援 ⭐⭐⭐
**效益**：
- 可「安裝」到手機桌面
- 離線查看已領取的資料包
- 推播通知（新資料包上架）

**時間**：1-2 小時  
**成本**：0 元

---

#### 3. 自訂 Logo 設計 ⭐⭐
**現況**：使用 emoji 🔑

**選項**：
- A. 使用 Icon Library（30 分鐘）
- B. 委外設計（$50-200）
- C. 保持 emoji（簡約路線）

**建議**：驗證 PMF 後再做

---

#### 4. 雲端整合功能 ⭐⭐
**現況**：創作者需自行上傳檔案至 Google Drive / Dropbox

**未來規劃**：
- 整合 Google Drive API（一鍵授權存取）
- 整合 Dropbox / OneDrive
- 自動生成分享連結

**時間**：2-3 天（需 OAuth 整合）
**優先級**：待 PMF 驗證後決定

**暫時方案**：
在使用說明明確告知創作者：
> 「KeyBox 不提供檔案儲存空間，請將資料包上傳至 Google Drive 並貼上分享連結」

---

### 📋 低優先級（長期規劃）

#### 5. Webhook / API 整合（進階 Email 整合）
- Webhook 通知（新 Email 領取事件）
- Zapier / Make 整合
- API 開放（讓第三方串接）

#### 6. Email 行銷工具整合（低優先）
- 與 Mailchimp / ConvertKit 整合
- 自動同步領取名單

#### 7. 團隊協作功能
- 多人管理同一組資料包
- 權限管理

---

## 🎯 決策建議：下一步該做什麼？

### 立即執行（本週）：
1. ✅ V8.0 領取記錄管理優化（已完成）
2. **🔥 V8.1 Email 複製功能（最高優先）**
   - 單筆 Email 複製按鈕
   - 一鍵複製所有 Email（逗號分隔）

### 近期規劃（1-2 週內）：
1. 批次刪除記錄功能（選做）
2. 購買自訂網域（提升品牌感）
3. 使用說明補充 Email 寄送教學

### PMF 驗證後（1 個月後）：
- 根據用戶使用數據評估雲端整合需求
- 評估 PWA 需求
- 規劃進階數據分析功能

---

## 📝 版本變更記錄

### V8.0（2025-10-02）✅ 已完成
- ✅ 領取記錄統計數字顯示（總領取、今日新增、剩餘份數）
- ✅ 單筆記錄刪除功能（含 RLS DELETE policy）
- ✅ 按鈕配色優化（查看領取記錄）
- ✅ 刪除驗證強化（防止資料遺失）

### V8.1（規劃中）📧 Email 複製功能
- 📋 單筆 Email 複製按鈕
- 📋 一鍵複製所有 Email（逗號分隔）
- 🧹 批次清空記錄功能（選做）

### V7.5（2025-10-02）
- 🎨 首頁重新設計（品牌介紹 + 雙動線教學）
- 🔢 限額功能（quota）
- ✅ 首頁重定向邏輯修正

### V7.1（2025-10-02）
- 🔧 移除管理面板「回到 Box 頁面」按鈕
- ✅ 新增「使用說明」和「隱私權政策」快速入口
- 🎨 優化底部區塊佈局與文案

### V7（2025-10-01）
- 📋 分享文案範本功能
- 🌏 錯誤訊息中文化
- ⏳ Loading 狀態優化
- 📄 隱私權政策頁面
- 📖 使用說明頁面

### V6（2025-09-30）
- 🌍 驗證信中文化
- 🎨 Tab 切換式登入/註冊 UI
- 🔗 驗證連結修正

### V5（2025-09-29）
- 🔗 短網址系統（NanoID）
- 🚀 URL 優化（6 字元短碼）

### V4（2025-09-28）
- 📊 CSV 匯出功能
- 🔗 OG Meta Tags
- 📈 Google Analytics 4

### V1-V3（2025-09-27）
- 🏗️ 核心功能開發
- 📱 RWD 支援
- 🎨 KeyBox 品牌重塑

---

**文件最後更新**：2025-10-02  
**目前版本**：V8.0  
**下一版本規劃**：V8.1（Email 複製功能）  
**專案狀態**：✅ 已上線，持續優化中  
**產品定位**：Email 收集工具（不含寄信功能）

---
