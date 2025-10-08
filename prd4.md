# Phase 4 需求文件：資料包圖片展示 + 創作者資訊

## 📋 需求概述

在資料包頁面 (Box.tsx) 新增圖片輪播展示與創作者資訊卡片，風格參考 2010 年代 Instagram 的極簡設計。

---

## 🎯 核心功能

### 1. 創作者資訊卡片
#### 視覺設計
- **大頭貼**: 圓形頭像 (64x64px)
- **暱稱**: 創作者名稱 (來自 `user_profiles.display_name`)
- **個人簡介**: 一行文字描述 (來自 `user_profiles.bio`)
- **位置**: 頁面最上方，在資料包標題之前

#### 資料來源
```typescript
// 從 user_profiles 資料表讀取
{
  avatar_url: string;    // 大頭貼 URL
  display_name: string;  // 暱稱
  bio: string;          // 個人簡介
}
```

---

### 2. 資料包圖片展示

#### 圖片數量規則
- **0 張**: 不顯示圖片區域
- **1 張**: 顯示單張靜態圖片
- **2-5 張**: 顯示輪播圖 (Carousel)

#### 輪播功能 (使用現有 Carousel 組件)
- 左右箭頭導航
- 圖片指示點 (Dots)
- 支援鍵盤操作 (← →)
- 支援觸控滑動 (Mobile)

#### 圖片儲存方式
- **選項 1**: Supabase Storage (推薦)
  - 創建 `package-images` bucket
  - 檔案路徑: `{keyword_id}/{image_index}.jpg`
  - 最大單檔 5MB

- **選項 2**: 外部 URL
  - 直接儲存圖片 URL (imgur, cloudinary, etc.)
  - 較簡單但依賴外部服務

---

## 🎨 UI/UX 設計 (Instagram 2010 風格)

### 配色方案
```css
背景: #fafafa (淺灰)
卡片: #ffffff (純白)
邊框: #dbdbdb (中灰)
文字主色: #262626 (深黑)
文字次色: #8e8e8e (灰色)
按鈕: #0095f6 (IG 藍)
```

### 版面配置
```
┌─────────────────────────────────┐
│  ⚪ 創作者暱稱                    │ ← 創作者資訊卡片
│     個人簡介...                   │
├─────────────────────────────────┤
│                                 │
│      [輪播圖片區域]               │ ← 圖片展示 (如有)
│                                 │
│     • • • • •  (指示點)          │
├─────────────────────────────────┤
│  📦 資料包標題                    │ ← 現有內容
│  關鍵字解鎖區...                  │
└─────────────────────────────────┘
```

---

## 🗄️ 資料庫架構

### Migration: `20251007000000_add_package_images.sql`

#### 1. 新增欄位至 `keywords` 資料表
```sql
ALTER TABLE keywords
ADD COLUMN images TEXT[] DEFAULT ARRAY[]::TEXT[];

COMMENT ON COLUMN keywords.images IS '資料包圖片 URL 陣列，最多 5 張';
```

#### 2. 確保 `user_profiles` 欄位存在
```sql
-- 已存在於 20251004000001_add_user_profiles.sql
-- avatar_url TEXT
-- display_name TEXT
-- bio TEXT
```

#### 3. 創建 Supabase Storage Bucket (如使用 Storage)
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('package-images', 'package-images', true);

-- RLS 政策
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'package-images');

CREATE POLICY "Creator upload access"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'package-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## 📦 組件架構

### 1. `CreatorCard.tsx` (新建)
```typescript
interface CreatorCardProps {
  creatorId: string;
}

// 功能:
// - 查詢 user_profiles 資料
// - 顯示大頭貼、暱稱、簡介
// - Loading 狀態處理
```

### 2. `PackageImageCarousel.tsx` (新建)
```typescript
interface PackageImageCarouselProps {
  images: string[]; // 圖片 URL 陣列
}

// 功能:
// - 0 張: return null
// - 1 張: 顯示單張圖片
// - 2+ 張: 使用 Carousel 組件
// - 圖片載入失敗處理 (fallback)
```

### 3. 修改 `Box.tsx`
```typescript
// 新增查詢創作者資訊
const fetchCreatorProfile = async (creatorId: string) => {
  const { data } = await supabase
    .from('user_profiles')
    .select('avatar_url, display_name, bio')
    .eq('id', creatorId)
    .single();
  return data;
};

// 版面結構
return (
  <>
    <CreatorCard creatorId={boxData.creator_id} />
    <PackageImageCarousel images={boxData.images} />
    {/* 現有的解鎖表單... */}
  </>
);
```

---

## 🎨 Creator 管理面板更新

### 修改 `Creator.tsx`

#### 新增圖片上傳功能
```typescript
// 狀態管理
const [newImages, setNewImages] = useState<File[]>([]);
const [newImageUrls, setNewImageUrls] = useState<string[]>([]);

// 圖片上傳處理
const handleImageUpload = async (files: FileList) => {
  // 1. 檢查數量 (最多 5 張)
  if (files.length > 5) {
    toast.error('最多上傳 5 張圖片');
    return;
  }
  
  // 2. 檢查檔案大小 (每張 < 5MB)
  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('圖片大小不能超過 5MB');
      return;
    }
  }
  
  // 3. 上傳至 Supabase Storage
  const urls = await uploadToStorage(files);
  setNewImageUrls(urls);
};
```

#### UI 更新
```typescript
// 在「新增資料包」表單中加入:
<div>
  <label>資料包圖片 (最多 5 張)</label>
  <input
    type="file"
    accept="image/*"
    multiple
    max={5}
    onChange={(e) => handleImageUpload(e.target.files)}
  />
  {/* 圖片預覽 */}
  <div className="grid grid-cols-3 gap-2">
    {newImageUrls.map((url, i) => (
      <img key={i} src={url} alt={`預覽 ${i+1}`} />
    ))}
  </div>
</div>
```

---

## 🔐 安全性考量

### 圖片上傳限制
- ✅ 檔案類型: `image/jpeg, image/png, image/webp`
- ✅ 檔案大小: 單檔 < 5MB
- ✅ 圖片數量: 最多 5 張
- ✅ RLS 政策: 只有創作者可上傳至自己的資料夾

### 儲存路徑規範
```
package-images/
├── {creator_id}/
│   ├── {keyword_id}_1.jpg
│   ├── {keyword_id}_2.jpg
│   └── ...
```

---

## 🚀 實作步驟建議

### Step 1: 資料庫準備
1. 執行 Migration 新增 `images` 欄位
2. 創建 Storage Bucket (如使用 Storage)
3. 設定 RLS 政策

### Step 2: 創作者資訊組件
1. 建立 `CreatorCard.tsx`
2. 整合至 `Box.tsx`
3. 測試顯示效果

### Step 3: 圖片輪播組件
1. 建立 `PackageImageCarousel.tsx`
2. 整合現有 Carousel 組件
3. 測試 0/1/多張圖片情境

### Step 4: Creator 管理面板
1. 新增圖片上傳 UI
2. 實作上傳邏輯
3. 新增圖片預覽功能
4. 測試編輯模式

### Step 5: 樣式調整
1. 套用 Instagram 2010 風格
2. RWD 響應式調整
3. Loading 與錯誤狀態處理

---

## 📊 資料流程圖

```
┌─────────────┐
│ Creator 頁面│
│ (上傳圖片)  │
└──────┬──────┘
       │ Upload
       ↓
┌──────────────────┐
│ Supabase Storage │
│ /package-images/ │
└──────┬───────────┘
       │ 儲存 URL
       ↓
┌──────────────┐
│ keywords 表  │
│ images: []   │
└──────┬───────┘
       │ 查詢
       ↓
┌──────────────┐
│  Box 頁面    │
│ (顯示輪播)   │
└──────────────┘
```

---

## 🎯 驗收清單

- [ ] Migration 執行成功
- [ ] Storage Bucket 建立完成
- [ ] CreatorCard 組件顯示正常
- [ ] 圖片輪播功能正常 (0/1/多張)
- [ ] Creator 可上傳圖片 (最多 5 張)
- [ ] 圖片預覽功能正常
- [ ] 編輯模式可修改圖片
- [ ] RWD 響應式正常
- [ ] Instagram 風格樣式完成

---

## 🎨 參考設計 (Instagram 2010 風格重點)

### 創作者卡片
- 圓形大頭貼 + 極簡資訊
- 白色背景 + 淺灰邊框
- 暱稱粗體、簡介細體

### 圖片展示
- 正方形裁切 (1:1 比例)
- 乾淨的輪播指示點
- 無複雜特效，強調內容

### 整體風格
- 留白充足
- 邊框細緻 (1px)
- 字體: system-ui / -apple-system
- 配色單純 (黑白灰 + IG 藍)

---

**📝 備註**: 此設計強調簡約與易用性，圖片展示不搶戲，讓內容本身成為焦點。