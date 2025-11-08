# 編輯關鍵字區塊 - UI 設計規範

## 一、設計分析與評估

### 參考來源：編輯作者資料彈窗設計
參考 [`ProfileEditDialog.tsx`](src/components/ProfileEditDialog.tsx:1) 的優秀設計模式：
- **分區標題系統** - 使用 emoji + 大寫英文 + 綠色品牌色
- **標籤 Badge 系統** - 清楚標示「選填」「不可編輯」等狀態
- **即時預覽機制** - 頭像上傳區提供即時預覽回饋
- **字數計數器** - 動態顏色回饋（綠/黃/紅）
- **引導式流程** - 圖片上傳使用 AlertDialog 引導使用者
- **深色主題統一** - bg-gray-900 / 700 / 600 漸層層次

### 現有編輯關鍵字區塊問題
參考 [`Creator.tsx:1870-2275`](src/pages/Creator.tsx:1870-2275) 側邊編輯面板：
1. **缺乏視覺層次** - 所有欄位平鋪，沒有分區概念
2. **標籤樣式不一致** - 使用純文字 Label，缺少狀態標示
3. **即時回饋不足** - 字數計數器未實作顏色狀態
4. **圖片管理混亂** - 多個輸入框垂直排列，視覺負擔重
5. **進階功能藏太深** - 多關鍵字規則沒有明確分區

---

## 二、完整 UI 設計規範

### 1. 整體布局結構

#### 1.1 側邊面板配置（Sheet 元件）
```
┌─────────────────────────────────────────────┐
│ [60% 預覽區]        │ [40% 編輯表單區]      │
│                     │                        │
│  即時預覽模板       │  📋 基本資訊           │
│  (半透明遮罩)       │  ├─ 關鍵字             │
│                     │  ├─ 回覆內容           │
│                     │  └─ 限額設定           │
│                     │                        │
│                     │  ⏰ 時效設定           │
│                     │  └─ 啟用限時領取       │
│                     │                        │
│                     │  📦 資料包包裝         │
│                     │  ├─ 標題               │
│                     │  ├─ 介紹               │
│                     │  └─ 必填欄位           │
│                     │                        │
│                     │  🎨 視覺設計           │
│                     │  ├─ 頁面模板           │
│                     │  ├─ 圖片管理           │
│                     │  └─ 隱藏作者資訊       │
│                     │                        │
│                     │  🧩 進階規則           │
│                     │  └─ 多關鍵字設定       │
│                     │                        │
│                     │  [儲存] [取消]         │
└─────────────────────────────────────────────┘
```

#### 1.2 響應式調整
- **桌面** (lg+): 60/40 分割
- **平板** (md): 50/50 分割
- **手機** (sm): 隱藏預覽區，全寬表單

---

### 2. 分區標題系統

#### 2.1 標題樣式規範
```tsx
// 標準分區標題元件
<div className="text-sm font-semibold text-green-500 uppercase tracking-wider mb-5">
  📋 基本資訊
</div>
```

**設計參數**:
- **字體大小**: 14px (text-sm)
- **字重**: 600 (font-semibold)
- **顏色**: #10b981 (text-green-500)
- **文字轉換**: uppercase
- **字距**: 0.05em (tracking-wider)
- **下方間距**: 20px (mb-5)

#### 2.2 分區規劃
```tsx
const sections = [
  { emoji: '📋', title: '基本資訊', fields: ['關鍵字', '回覆內容', '限額數量'] },
  { emoji: '⏰', title: '時效設定', fields: ['啟用限時領取', '天/小時/分鐘'] },
  { emoji: '📦', title: '資料包包裝', fields: ['標題', '介紹', '必填欄位'] },
  { emoji: '🎨', title: '視覺設計', fields: ['頁面模板', '圖片管理', '隱藏作者'] },
  { emoji: '🧩', title: '進階規則', fields: ['多關鍵字規則'] },
];
```

#### 2.3 分隔線設計
```tsx
<div className="pb-8 border-b border-gray-800">
  {/* 分區內容 */}
</div>
```

---

### 3. 表單欄位標籤系統

#### 3.1 標籤結構
```tsx
<div className="flex items-center gap-2 mb-2.5">
  <Label htmlFor="fieldId" className="text-[15px] font-medium text-gray-200">
    欄位名稱
  </Label>
  {/* Badge 狀態標示 */}
  <span className="text-[11px] px-2 py-0.5 rounded bg-gray-700 text-gray-400 font-medium">
    選填
  </span>
  {/* 特殊圖示（如鎖定） */}
  <span className="text-sm">🔒</span>
</div>
```

#### 3.2 Badge 變體
| 狀態 | 文字 | 背景色 | 文字色 | 使用時機 |
|------|------|--------|--------|----------|
| 選填 | 選填 | bg-gray-700 | text-gray-400 | 非必填欄位 |
| 必填 | 必填 | bg-red-900/30 | text-red-400 | 必填欄位 |
| 不可編輯 | 不可編輯 | bg-gray-700 | text-gray-400 | 禁用欄位 |
| 進階功能 | Premium | bg-amber-900/30 | text-amber-400 | 付費功能 |

---

### 4. 輸入欄位設計

#### 4.1 基本輸入框樣式
```tsx
<Input
  className="bg-gray-700 border-2 border-transparent 
             focus:border-green-500 focus:bg-gray-600 
             text-white placeholder:text-gray-500 
             rounded-lg py-3.5 px-4 
             transition-all duration-300"
/>
```

**設計參數**:
- **背景色**: #374151 (bg-gray-700)
- **Focus 背景**: #4b5563 (bg-gray-600)
- **邊框**: 2px transparent → green-500
- **圓角**: 8px (rounded-lg)
- **內邊距**: 14px 16px (py-3.5 px-4)
- **文字色**: white
- **Placeholder**: #6b7280 (text-gray-500)

#### 4.2 Textarea 特殊樣式
```tsx
<Textarea
  className="min-h-[100px] bg-gray-700 border-2 border-transparent 
             focus:border-green-500 focus:bg-gray-600 
             text-white placeholder:text-gray-500 
             rounded-lg py-3.5 px-4 resize-y leading-relaxed 
             transition-all duration-300"
/>
```

**額外參數**:
- **最小高度**: 100px (min-h-[100px])
- **行高**: 1.625 (leading-relaxed)
- **Resize**: vertical (resize-y)

#### 4.3 禁用狀態
```tsx
<Input
  disabled
  className="bg-gray-800/70 border-transparent 
             text-gray-400 cursor-not-allowed opacity-70"
/>
```

---

### 5. 字數計數器設計

#### 5.1 布局結構
```tsx
<div className="flex justify-between items-center mt-2">
  <span className="text-[13px] text-gray-400">輔助說明文字</span>
  <span className={`text-[13px] font-medium ${getCharCountColor(length, max)}`}>
    {length} / {max}
  </span>
</div>
```

#### 5.2 動態顏色邏輯
```tsx
const getCharCountColor = (length: number, max: number) => {
  if (length === 0) return 'text-gray-400';      // 未輸入
  const percentage = length / max;
  if (percentage >= 1) return 'text-red-500';    // 已達上限 ❌
  if (percentage >= 0.8) return 'text-amber-500'; // 警告 ⚠️
  return 'text-green-500';                       // 正常 ✓
};
```

#### 5.3 應用範例
| 欄位 | 上限 | 輔助文字 |
|------|------|----------|
| 關鍵字 | 50 | 建議使用簡短易記的詞彙 |
| 回覆內容 | 2000 | 支援多行文字與 Markdown |
| 資料包標題 | 50 | 顯示在頁面頂部 |
| 資料包介紹 | 300 | 顯示在圖片上方 |
| 暱稱 | 20 | 建議使用真實姓名或常用暱稱 |
| 自我介紹 | 200 | 讓其他人更認識你 |

---

### 6. 圖片管理區設計

#### 6.1 優化前問題
```tsx
// ❌ 舊設計：垂直列表，視覺混亂
{newImageUrls.map((url, index) => (
  <div key={index} className="flex gap-2">
    <Input type="url" value={url} />
    <Button variant="ghost"><Trash2 /></Button>
  </div>
))}
```

#### 6.2 優化後設計
```tsx
// ✅ 新設計：卡片式管理 + 批量貼入
<div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-xl p-6">
  {/* 標題列 */}
  <div className="flex items-center justify-between mb-4">
    <div className="text-sm font-medium text-gray-200">
      📷 資料包圖片 ({editImageUrls.length} / 5)
    </div>
    <div className="flex gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="secondary">
            上傳圖片
          </Button>
        </AlertDialogTrigger>
        {/* AlertDialog 內容 */}
      </AlertDialog>
      <Button size="sm" variant="outline" onClick={() => setShowBatchImageDialog(true)}>
        📋 批量貼入
      </Button>
    </div>
  </div>

  {/* 圖片預覽網格 */}
  <div className="grid grid-cols-2 gap-3 mb-4">
    {editImageUrls.filter(url => url.trim()).map((url, index) => (
      <div key={index} className="relative group">
        {/* 圖片預覽 */}
        <div className="aspect-video bg-gray-700 rounded-lg overflow-hidden">
          <img src={url} alt={`圖片 ${index + 1}`} className="w-full h-full object-cover" />
        </div>
        {/* Hover 顯示操作按鈕 */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
          <Button size="sm" variant="ghost" className="text-white">
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-red-400">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        {/* 圖片編號 */}
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          #{index + 1}
        </div>
      </div>
    ))}
    
    {/* 新增圖片按鈕 */}
    {editImageUrls.length < 5 && (
      <button
        type="button"
        onClick={() => setEditImageUrls([...editImageUrls, ''])}
        className="aspect-video border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-green-500 hover:bg-gray-800/50 transition-all"
      >
        <Plus className="w-6 h-6 text-gray-400" />
        <span className="text-sm text-gray-400">新增圖片</span>
      </button>
    )}
  </div>

  {/* 摺疊式 URL 編輯區（進階使用者） */}
  <details className="mt-4">
    <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
      📝 直接編輯圖片 URL
    </summary>
    <div className="mt-3 space-y-2">
      {editImageUrls.map((url, index) => (
        <Input
          key={index}
          type="url"
          value={url}
          onChange={(e) => {
            const updated = [...editImageUrls];
            updated[index] = e.target.value;
            setEditImageUrls(updated);
          }}
          placeholder={`圖片 ${index + 1} URL`}
          className="h-9 text-sm"
        />
      ))}
    </div>
  </details>
</div>
```

#### 6.3 批量貼入對話框
```tsx
<Dialog open={showBatchImageDialog} onOpenChange={setShowBatchImageDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>批量貼入圖片 URL</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <Label>每行一個 URL（最多 5 個）</Label>
      <Textarea
        placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
        value={batchImageInput}
        onChange={(e) => setBatchImageInput(e.target.value)}
        rows={8}
        className="font-mono text-sm"
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setShowBatchImageDialog(false)}>
          取消
        </Button>
        <Button onClick={handleBatchImagePaste}>
          確定匯入
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

---

### 7. Checkbox 開關設計

#### 7.1 基本結構
```tsx
<label className="flex items-center gap-2 cursor-pointer">
  <input
    type="checkbox"
    checked={editEnableExpiry}
    onChange={(e) => setEditEnableExpiry(e.target.checked)}
    className="w-4 h-4 rounded border-gray-600 text-green-500 focus:ring-green-500 focus:ring-offset-0"
  />
  <span className="text-sm text-gray-200">啟用限時領取</span>
</label>
```

#### 7.2 搭配展開內容
```tsx
<div className="space-y-2">
  <label className="flex items-center gap-2">
    <input type="checkbox" checked={editEnableExpiry} onChange={...} />
    <span className="text-sm">啟用限時領取</span>
  </label>
  
  {/* 條件顯示展開內容 */}
  {editEnableExpiry && (
    <div className="ml-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-3">
      {/* 展開內容 */}
    </div>
  )}
</div>
```

---

### 8. 進階功能區設計

#### 8.1 會員等級判斷
```tsx
<div className="space-y-2">
  <Label>🧩 進階規則（多關鍵字）</Label>
  {userProfile?.membership_tier === 'free' ? (
    // 免費用戶：顯示升級提示
    <div className="p-4 rounded-lg border-2 border-amber-500/30 bg-amber-900/10">
      <div className="flex items-start gap-3">
        <div className="text-2xl">⭐</div>
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-400 mb-1">
            Premium 專屬功能
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            升級至 Premium 即可使用多關鍵字規則，讓一個資料包支援多個解鎖關鍵字。
          </p>
          <Button size="sm" className="mt-3 bg-gradient-to-r from-amber-500 to-amber-600">
            立即升級
          </Button>
        </div>
      </div>
    </div>
  ) : (
    // Premium 用戶：完整功能
    <>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={editUnlockEnabled} onChange={...} />
        <span className="text-sm">啟用多關鍵字規則（OR 模式）</span>
      </label>
      {editUnlockEnabled && (
        <div className="ml-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <Label>關鍵字列表（逗號分隔）</Label>
          <Textarea
            value={editUnlockKeywords}
            onChange={(e) => setEditUnlockKeywords(e.target.value)}
            placeholder="alpha, beta, gamma"
            rows={3}
            className="mt-2"
          />
          <p className="text-xs text-gray-400 mt-2">
            輸入 1 個或多個關鍵字，使用逗號分隔。任一符合即解鎖
          </p>
        </div>
      )}
    </>
  )}
</div>
```

---

### 9. 按鈕設計規範

#### 9.1 主要動作按鈕（Primary）
```tsx
<Button
  type="submit"
  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 
             hover:from-green-600 hover:to-green-700 
             text-white font-semibold rounded-lg py-3.5 
             shadow-lg shadow-green-500/30 
             hover:shadow-green-500/40 hover:-translate-y-0.5 
             transition-all duration-300"
>
  <span className="mr-2">💾</span>
  儲存變更
</Button>
```

#### 9.2 次要動作按鈕（Secondary）
```tsx
<Button
  type="button"
  variant="outline"
  className="flex-1 bg-transparent border-2 border-gray-700 
             text-gray-400 hover:border-gray-600 
             hover:text-gray-200 hover:bg-gray-800 
             rounded-lg py-3.5 font-semibold 
             transition-all duration-300"
>
  取消
</Button>
```

#### 9.3 小型輔助按鈕
```tsx
<Button size="sm" variant="secondary">
  上傳圖片
</Button>

<Button size="sm" variant="outline" className="gap-2">
  📋 批量貼入
</Button>
```

---

### 10. 色彩系統

#### 10.1 主要色彩
| 用途 | Tailwind Class | Hex 值 | 說明 |
|------|---------------|--------|------|
| 品牌綠 | text/bg-green-500 | #10b981 | 分區標題、焦點邊框、成功狀態 |
| 品牌綠深 | text/bg-green-600 | #059669 | Hover 狀態 |
| 背景深 | bg-gray-900 | #111827 | 主背景 |
| 背景中 | bg-gray-800 | #1f2937 | 次要背景 |
| 背景淺 | bg-gray-700 | #374151 | 輸入框背景 |
| 邊框色 | border-gray-700 | #374151 | 分隔線、輸入框邊框 |

#### 10.2 文字色彩
| 用途 | Tailwind Class | Hex 值 |
|------|---------------|--------|
| 主要文字 | text-white | #ffffff |
| 次要文字 | text-gray-200 | #e5e7eb |
| 輔助文字 | text-gray-400 | #9ca3af |
| 禁用文字 | text-gray-500 | #6b7280 |
| Placeholder | text-gray-500 | #6b7280 |

#### 10.3 狀態色彩
| 狀態 | Tailwind Class | Hex 值 | 使用時機 |
|------|---------------|--------|----------|
| 成功 | text-green-500 | #10b981 | 字數正常、驗證通過 |
| 警告 | text-amber-500 | #f59e0b | 字數 80%+、Premium 提示 |
| 錯誤 | text-red-500 | #ef4444 | 字數超限、驗證失敗 |
| 資訊 | text-blue-500 | #3b82f6 | 提示訊息 |

---

### 11. 間距標準

#### 11.1 垂直間距系統
```
2px   - 極小間距 (gap-0.5)
4px   - 微小間距 (gap-1)
8px   - 小間距 (gap-2) - 標籤內元素
10px  - 標籤與輸入框間距 (mb-2.5)
12px  - 中間距 (gap-3)
16px  - 大間距 (gap-4)
20px  - 分區標題下方 (mb-5)
24px  - 欄位間距 (space-y-6)
32px  - 分區間距 (pb-8)
```

#### 11.2 內邊距標準
```
12px  - 小型按鈕 (px-3 py-1.5)
14px  - 輸入框垂直 (py-3.5)
16px  - 輸入框水平 (px-4)
24px  - 卡片內邊距 (p-6)
40px  - 對話框內邊距 (p-10)
```

---

### 12. 動畫與過渡

#### 12.1 基本過渡
```tsx
// 標準過渡時長：300ms
className="transition-all duration-300"
```

#### 12.2 Hover 動畫
```tsx
// 按鈕上移效果
className="hover:-translate-y-0.5 transition-all duration-300"

// 陰影增強
className="shadow-lg hover:shadow-xl transition-all duration-300"
```

#### 12.3 焦點動畫
```tsx
// 邊框 + 背景色過渡
className="border-2 border-transparent 
           focus:border-green-500 focus:bg-gray-600 
           transition-all duration-300"
```

---

## 三、實作建議

### 與現有元件整合
現有 [`Creator.tsx:1870-2275`](src/pages/Creator.tsx:1870-2275) 側邊編輯面板建議優化：

1. **引入分區標題系統**
   - 將表單分為 5 大區塊（基本資訊、時效設定、資料包包裝、視覺設計、進階規則）
   - 每區使用綠色大寫標題 + emoji

2. **統一標籤樣式**
   - 所有 Label 改用 15px 字體 + text-gray-200
   - 加入 Badge 狀態標示

3. **實作字數計數器**
   - 關鍵字、回覆內容、標題、介紹欄位加入動態計數器
   - 使用 `getCharCountColor` 函數提供顏色回饋

4. **優化圖片管理**
   - 改用卡片式網格預覽（2 欄）
   - 加入批量貼入功能
   - URL 編輯區改為摺疊式（進階使用者）

5. **改善進階功能區**
   - 加入會員等級判斷邏輯
   - 免費用戶顯示升級提示卡片
   - Premium 用戶顯示完整功能

### 技術棧對應
```
設計規範               →  React + Tailwind CSS
────────────────────────────────────────────────
分區標題               →  <div className="text-sm font-semibold text-green-500 uppercase tracking-wider mb-5">
標籤 + Badge          →  <Label> + <span className="text-[11px] px-2 py-0.5 rounded bg-gray-700">
輸入框                 →  <Input className="bg-gray-700 border-2 border-transparent focus:border-green-500">
字數計數器             →  動態 className + getCharCountColor()
圖片網格               →  <div className="grid grid-cols-2 gap-3">
Checkbox              →  <input type="checkbox"> + <label className="flex items-center gap-2">
按鈕                   →  <Button className="bg-gradient-to-r from-green-500 to-green-600">
```

---

## 四、設計決策記錄

### 為何採用分區標題系統？
**決策**: 引入 5 大分區（📋 基本資訊、⏰ 時效設定、📦 資料包包裝、🎨 視覺設計、🧩 進階規則）

**理由**:
1. **降低認知負荷** - 將 15+ 欄位分組，使用者更容易理解表單結構
2. **提升掃描效率** - emoji + 顏色標題提供視覺錨點
3. **符合心智模型** - 分區符合「建立資料包」的自然流程（內容 → 包裝 → 進階）
4. **保持一致性** - 與 ProfileEditDialog 設計語言統一

### 為何優化圖片管理區？
**決策**: 從垂直列表改為卡片式網格 + 批量貼入

**理由**:
1. **提升視覺效率** - 網格預覽一眼看出所有圖片
2. **降低操作成本** - 批量貼入減少重複操作
3. **符合預期心智模型** - 圖片管理應以視覺為主，URL 為輔
4. **漸進式披露** - 進階使用者可展開 URL 編輯區

### 為何加入字數計數器？
**決策**: 所有文字輸入欄位加入動態顏色計數器

**理由**:
1. **即時回饋** - 使用者即時知道字數狀態
2. **避免錯誤** - 80% 警告預防超限
3. **引導優化** - 鼓勵使用者精簡文字
4. **提升專業度** - 與現代 SaaS 產品設計一致

### 為何區分會員等級？
**決策**: 進階功能顯示升級提示卡片

**理由**:
1. **商業模式需求** - 推動 Premium 轉換
2. **避免混淆** - 免費用戶不會誤觸無法使用的功能
3. **提供誘因** - 清楚說明 Premium 價值
4. **保持友善** - 非強制打斷，僅提示升級

---

## 五、完整實作範例

### 範例：優化後的側邊編輯面板

```tsx
<Sheet open={!!editingKeywordId} onOpenChange={(open) => !open && cancelEdit()}>
  <SheetContent side="right" className="w-full sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] p-0 overflow-hidden">
    <div className="flex h-full">
      {/* 左側：預覽區 (60%) */}
      <div className="w-3/5 bg-muted/30 overflow-y-auto border-r">
        {/* 預覽內容 */}
      </div>

      {/* 右側：編輯表單區 (40%) */}
      <div className="w-2/5 overflow-y-auto bg-gray-900">
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle className="text-xl">編輯關鍵字</SheetTitle>
        </SheetHeader>
        
        <form onSubmit={handleUpdateKeyword} className="px-6 pb-6 space-y-8">
          {/* 📋 基本資訊 */}
          <div className="pb-8 border-b border-gray-800">
            <div className="text-sm font-semibold text-green-500 uppercase tracking-wider mb-5">
              📋 基本資訊
            </div>
            
            {/* 關鍵字 */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2.5">
                <Label htmlFor="editKeyword" className="text-[15px] font-medium text-gray-200">
                  關鍵字
                </Label>
                <span className="text-[11px] px-2 py-0.5 rounded bg-red-900/30 text-red-400 font-medium">
                  必填
                </span>
              </div>
              <Input
                id="editKeyword"
                value={editKeyword}
                onChange={(e) => setEditKeyword(e.target.value)}
                required
                maxLength={50}
                className="bg-gray-700 border-2 border-transparent focus:border-green-500 focus:bg-gray-600 text-white placeholder:text-gray-500 rounded-lg py-3.5 px-4 transition-all duration-300"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-[13px] text-gray-400">建議使用簡短易記的詞彙</span>
                <span className={`text-[13px] font-medium ${getCharCountColor(editKeyword.length, 50)}`}>
                  {editKeyword.length} / 50
                </span>
              </div>
            </div>

            {/* 回覆內容 */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2.5">
                <Label htmlFor="editContent" className="text-[15px] font-medium text-gray-200">
                  回覆內容
                </Label>
                <span className="text-[11px] px-2 py-0.5 rounded bg-red-900/30 text-red-400 font-medium">
                  必填
                </span>
              </div>
              <Textarea
                id="editContent"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                required
                maxLength={2000}
                className="min-h-[120px] bg-gray-700 border-2 border-transparent focus:border-green-500 focus:bg-gray-600 text-white placeholder:text-gray-500 rounded-lg py-3.5 px-4 resize-y leading-relaxed transition-all duration-300"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-[13px] text-gray-400">支援多行文字與 Markdown</span>
                <span className={`text-[13px] font-medium ${getCharCountColor(editContent.length, 2000)}`}>
                  {editContent.length} / 2000
                </span>
              </div>
            </div>

            {/* 限額數量 */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Label htmlFor="editQuota" className="text-[15px] font-medium text-gray-200">
                  限額數量
                </Label>
                <span className="text-[11px] px-2 py-0.5 rounded bg-gray-700 text-gray-400 font-medium">
                  選填
                </span>
              </div>
              <Input
                id="editQuota"
                type="number"
                value={editQuota}
                onChange={(e) => setEditQuota(e.target.value)}
                min="1"
                placeholder="留空 = 無限制"
                className="bg-gray-700 border-2 border-transparent focus:border-green-500 focus:bg-gray-600 text-white placeholder:text-gray-500 rounded-lg py-3.5 px-4 transition-all duration-300"
              />
            </div>
          </div>

          {/* ⏰ 時效設定 */}
          <div className="pb-8 border-b border-gray-800">
            <div className="text-sm font-semibold text-green-500 uppercase tracking-wider mb-5">
              ⏰ 時效設定
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editEnableExpiry}
                  onChange={(e) => setEditEnableExpiry(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 text-green-500 focus:ring-green-500 focus:ring-offset-0"
                />
                <span className="text-sm text-gray-200">啟用限時領取</span>
              </label>
              
              {editEnableExpiry && (
                <div className="ml-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={editExpiryDays}
                      onChange={(e) => setEditExpiryDays(e.target.value.replace(/\D/g, ''))}
                      placeholder="0"
                      className="w-16 h-10 bg-gray-700 text-white text-center"
                    />
                    <span className="text-sm text-gray-300">天</span>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={editExpiryHours}
                      onChange={(e) => setEditExpiryHours(e.target.value.replace(/\D/g, '').padStart(2, '0'))}
                      placeholder="00"
                      maxLength={2}
                      className="w-16 h-10 bg-gray-700 text-white text-center"
                    />
                    <span className="text-sm text-gray-300">小時</span>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={editExpiryMinutes}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        const num = parseInt(val || '0');
                        if (num <= 59) {
                          setEditExpiryMinutes(val.padStart(2, '0'));
                        }
                      }}
                      placeholder="00"
                      maxLength={2}
                      className="w-16 h-10 bg-gray-700 text-white text-center"
                    />
                    <span className="text-sm text-gray-300">分鐘後失效</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 📦 資料包包裝 */}
          <div className="pb-8 border-b border-gray-800">
            <div className="text-sm font-semibold text-green-500 uppercase tracking-wider mb-5">
              📦 資料包包裝
            </div>
            
            {/* 標題、介紹、必填欄位... */}
          </div>

          {/* 🎨 視覺設計 */}
          <div className="pb-8 border-b border-gray-800">
            <div className="text-sm font-semibold text-green-500 uppercase tracking-wider mb-5">
              🎨 視覺設計
            </div>
            
            {/* 頁面模板、圖片管理、隱藏作者... */}
          </div>

          {/* 🧩 進階規則 */}
          <div className="pb-8">
            <div className="text-sm font-semibold text-green-500 uppercase tracking-wider mb-5">
              🧩 進階規則
            </div>
            
            {/* 多關鍵字設定... */}
          </div>

          {/* 按鈕組 */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={cancelEdit}
              className="flex-1 bg-transparent border-2 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-200 hover:bg-gray-800 rounded-lg py-3.5 font-semibold transition-all duration-300"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg py-3.5 shadow-lg shadow-green-500/30 hover:shadow-green-500/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              <span className="mr-2">💾</span>
              {loading ? '儲存中...' : '儲存變更'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </SheetContent>
</Sheet>
```

---

## 六、優先實作清單

### Phase 1: 基礎優化（建議先做）
1. ✅ 引入分區標題系統（5 大區塊）
2. ✅ 統一標籤樣式 + Badge 狀態
3. ✅ 實作字數計數器（4 個欄位）
4. ✅ 優化按鈕樣式（漸層 + 陰影）

### Phase 2: 圖片管理優化
1. ✅ 改用卡片式網格預覽
2. ✅ 加入批量貼入功能
3. ✅ URL 編輯區改為摺疊式

### Phase 3: 進階功能
1. ✅ 加入會員等級判斷
2. ✅ 設計升級提示卡片
3. ✅ Premium 功能完整實作

---

此設計規範參考 ProfileEditDialog 的成功經驗，針對編輯關鍵字區塊進行全面優化，提供一致的使用者體驗與專業的視覺設計。