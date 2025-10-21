# KeyBox 模板系統 - 現況與擴充規劃

## 📋 目前實作狀況 (2025-10-21)

### 已完成的模板 (4 個免費模板)

| ID | 名稱 | 描述 | 檔案 | 狀態 |
|---|---|---|---|---|
| `default` | 經典樣式 | 原有的 KeyBox 頁面設計 | `TemplateDefault.tsx` | ✅ |
| `layout1` | 左右分欄型 | 圖片在左,表單在右 | `TemplateLayout1.tsx` | ✅ |
| `layout2` | Hero 卡片 | 頂部 Banner + 下方表單 | `TemplateLayout2.tsx` | ✅ |
| `layout4` | 玻璃擬態 | 全螢幕漸層背景 + 毛玻璃卡片 | `TemplateLayout4.tsx` | ✅ |

### 已完成的核心功能

1. ✅ **模板切換系統**
   - `registry.ts` - 模板註冊中心
   - `BaseTemplate.tsx` - 統一 Props 介面
   - `Box.tsx` - 模板路由器

2. ✅ **共用元件**
   - `BoxUnlockForm.tsx` - 統一的解鎖表單
   - `UnlockSuccessView.tsx` - 成功畫面
   - `PackageImageCarousel.tsx` - 圖片輪播
   - `CreatorCard.tsx` - 創作者資訊卡

3. ✅ **後台功能**
   - `TemplateSelector.tsx` - 模板選擇器
   - `Creator.tsx` - 整合模板選擇 + 預覽按鈕
   - 創作者預覽模式 (`isCreatorPreview` prop)

4. ✅ **圖片過濾**
   - `filterEmptyImages()` 函數 (Creator.tsx:46-49)
   - 自動過濾空白 URL,避免輪播顯示空白 slide

---

## 🎯 後續擴充計畫

### Phase 10: 新增進階模板 (4 個付費模板)

參考來源: `template-layout-hub/src/pages/`

#### Layout5 - 特色網格
- **檔案**: `TemplateLayout5.tsx`
- **參考**: `template-layout-hub/src/pages/Layout5.tsx`
- **特色**: 3 張特色卡片網格 + 底部 CTA 表單
- **適用場景**: 課程/服務介紹,強調 3 大優勢
- **tier**: `premium`

#### Layout6 - 對比分欄
- **檔案**: `TemplateLayout6.tsx`
- **參考**: `template-layout-hub/src/pages/Layout6.tsx`
- **特色**: 左黑右白強烈對比 + 數據展示
- **適用場景**: 數據報告、白皮書下載
- **tier**: `premium`

#### Layout7 - 多段落長頁
- **檔案**: `TemplateLayout7.tsx`
- **參考**: `template-layout-hub/src/pages/Layout7.tsx`
- **特色**: 導航欄 + 多個 Section + Footer
- **適用場景**: 完整課程介紹、產品說明
- **tier**: `premium`

#### Layout8 - 視訊風格
- **檔案**: `TemplateLayout8.tsx`
- **參考**: `template-layout-hub/src/pages/Layout8.tsx`
- **特色**: 全螢幕背景 + Play 按鈕 + 滾動指示
- **適用場景**: 影片課程、Webinar 宣傳
- **tier**: `premium`

---

## 🔧 實作步驟 (Phase 10)

### Step 1: 建立進階模板檔案
```bash
# 從 template-layout-hub 移植 Layout5-8
# 改寫為符合 BaseTemplateProps 介面
# 整合 BoxUnlockForm, PackageImageCarousel, CreatorCard
```

### Step 2: 更新 registry.ts
```typescript
export const TEMPLATE_REGISTRY: TemplateConfig[] = [
  // ... 現有 4 個免費模板 ...
  {
    id: 'layout5',
    name: '特色網格',
    description: '3 張特色卡片 + CTA 表單',
    category: '進階',
    tier: 'premium',  // 🔒 付費模板
    component: lazy(() => import('./TemplateLayout5')),
    enabled: true,
  },
  {
    id: 'layout6',
    name: '對比分欄',
    description: '左黑右白對比 + 數據展示',
    category: '進階',
    tier: 'premium',
    component: lazy(() => import('./TemplateLayout6')),
    enabled: true,
  },
  {
    id: 'layout7',
    name: '多段落長頁',
    description: '導航欄 + 多 Section + Footer',
    category: '進階',
    tier: 'premium',
    component: lazy(() => import('./TemplateLayout7')),
    enabled: true,
  },
  {
    id: 'layout8',
    name: '視訊風格',
    description: '全螢幕 + Play 按鈕 + 滾動指示',
    category: '進階',
    tier: 'premium',
    component: lazy(() => import('./TemplateLayout8')),
    enabled: true,
  },
];
```

### Step 3: 更新 TemplateConfig 介面
```typescript
// src/components/templates/registry.ts
export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  category?: string;
  tier?: 'free' | 'premium';  // 🆕 新增 tier 欄位
  thumbnail?: string;
  component: ComponentType<BoxTemplateProps>;
  enabled: boolean;
}
```

### Step 4: 資料庫 Migration
```sql
-- supabase/migrations/20251021000000_add_membership_tier.sql
ALTER TABLE user_profiles
ADD COLUMN membership_tier TEXT DEFAULT 'free' CHECK (membership_tier IN ('free', 'premium'));

COMMENT ON COLUMN user_profiles.membership_tier IS '會員等級: free=免費 / premium=付費';
```

### Step 5: 更新 TypeScript Types
```typescript
// src/integrations/supabase/types.ts
export interface UserProfile {
  id: string;
  email: string;
  nickname?: string;
  social_link?: string;
  avatar_url?: string;
  membership_tier?: 'free' | 'premium';  // 🆕
  created_at?: string;
  updated_at?: string;
}
```

### Step 6: TemplateSelector 鎖定邏輯
```typescript
// src/components/TemplateSelector.tsx
const userTier = userProfile?.membership_tier || 'free';
const isLocked = template.tier === 'premium' && userTier !== 'premium';

return (
  <Card className={isLocked ? 'opacity-50 cursor-not-allowed' : ''}>
    {isLocked && <Lock className="absolute top-2 right-2" />}
    <CardTitle>{template.name}</CardTitle>
    <CardDescription>{template.description}</CardDescription>
    {isLocked && <Badge variant="outline">進階會員專屬</Badge>}
  </Card>
);
```

---

## 📊 最終模板系統架構

### 模板分級
- **免費 (4 個)**: default, layout1, layout2, layout4
- **進階 (4 個)**: layout5, layout6, layout7, layout8

### 商業模式
- 免費用戶: 可使用 4 個基礎模板,滿足一般需求
- 付費用戶: 解鎖 8 個模板,獲得更多視覺選擇

### 升級路徑
1. 使用者在 TemplateSelector 看到鎖定的進階模板
2. 點擊顯示「升級到進階會員」提示
3. 引導至付費頁面 (待實作)

---

## ✅ 目前已實作的 Phase 清單

- [x] Phase 1: 建立資料庫 migration (新增 template_type 欄位)
- [x] Phase 2: 建立模板核心架構 (BaseTemplate, registry, 共用元件)
- [x] Phase 3: 建立 TemplateDefault
- [x] Phase 4: 修改 Box.tsx 為模板路由器
- [x] Phase 5: 建立 TemplateLayout1-3
- [x] Phase 6: 建立 TemplateSelector + 整合 Creator.tsx
- [x] Phase 7: 修復編譯錯誤
- [x] Phase 8: 創作者預覽模式
- [x] Phase 9A: 圖片過濾功能
- [x] Phase 9B: 刪除舊模板 + 移植 Layout2/Layout4

---

## 🔮 待辦事項

- [ ] Phase 10A: 建立 TemplateLayout5.tsx (特色網格)
- [ ] Phase 10B: 建立 TemplateLayout6.tsx (對比分欄)
- [ ] Phase 10C: 建立 TemplateLayout7.tsx (多段落長頁)
- [ ] Phase 10D: 建立 TemplateLayout8.tsx (視訊風格)
- [ ] Phase 10E: 更新 registry.ts (8 模板 + tier 欄位)
- [ ] Phase 10F: 資料庫 Migration (membership_tier)
- [ ] Phase 10G: TemplateSelector 鎖定 UI
- [ ] Phase 11: 付費系統整合 (Stripe/綠界)

---

## 📝 技術筆記

### 模板移植策略
1. 從 `template-layout-hub/src/pages/LayoutX.tsx` 讀取原始模板
2. 保留視覺設計 (背景、佈局、動畫)
3. 改寫為 `BaseTemplateProps` 介面
4. 整合共用元件:
   - `BoxUnlockForm` → 解鎖表單
   - `PackageImageCarousel` → 圖片輪播
   - `CreatorCard` → 創作者資訊
   - `UnlockSuccessView` → 成功畫面

### 圖片過濾邏輯
```typescript
const filterEmptyImages = (urls: string[]): string[] | null => {
  const filtered = urls.filter(url => url.trim() !== '');
  return filtered.length > 0 ? filtered : null;
};
```

### 創作者預覽模式
- 傳遞 `isCreatorPreview={true}` 給模板元件
- `BoxUnlockForm` 顯示 disabled 狀態
- 創作者可預覽頁面外觀,無需實際解鎖

---

## 🎨 模板視覺定位

| 模板 | 風格 | 適用場景 |
|---|---|---|
| default | 簡潔中央卡片 | 一般資料包 |
| layout1 | 左右分欄 | 強調圖片/封面 |
| layout2 | Hero Banner | 活動宣傳 |
| layout4 | 玻璃擬態 | 時尚/科技感 |
| layout5 | 特色網格 | 課程/服務 3 大優勢 |
| layout6 | 對比分欄 | 數據報告/白皮書 |
| layout7 | 多段落長頁 | 完整產品說明 |
| layout8 | 視訊風格 | 影片課程/Webinar |

---

**最後更新**: 2025-10-21  
**目前狀態**: 完成 4 免費模板,準備擴充 4 進階模板