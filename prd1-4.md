# PRD: 進階模板編輯系統 (Template Config System)

## 產品概述

**版本**: 1.0
**優先級**: P0 (高優先級)
**預計工期**: 1-2 週
**負責人**: Development Team

### 問題陳述

目前進階模板（Layout5-8）存在大量硬編碼內容，導致用戶無法自訂進階模板的特色卡片、數據展示、社群連結等元素，嚴重限制了 Premium 會員的使用價值。

### 成功指標

- ✅ 所有進階模板的動態元素可編輯
- ✅ 編輯介面直觀易用，無需編寫 JSON
- ✅ 基礎模板不受影響（向後相容）
- ✅ 即時預覽正常運作

---

## MVP 範圍定義

### 階段劃分

#### MVP-1: 資料庫基礎建設 (Day 1)
- 新增 `template_config` JSONB 欄位
- 定義各模板的配置 schema
- 資料庫 migration

#### MVP-2: Layout7 完整實作 (Day 2-4)
- 編輯 UI（品牌、特色、社群連結）
- 模板渲染邏輯更新
- 即時預覽整合

#### MVP-3: Layout5 實作 (Day 5-6)
- 特色卡片陣列編輯器
- 圖示選擇器
- 模板渲染更新

#### MVP-4: Layout6 & Layout8 實作 + 測試 (Day 7-10)
- Layout6 數據展示編輯器
- Layout8 學習要點編輯器
- 完整測試與 Bug 修復

---

## 技術規格

### 1. 資料庫 Schema

#### 1.1 新增欄位
```sql
ALTER TABLE keywords
ADD COLUMN template_config JSONB DEFAULT '{}'::jsonb;
```

#### 1.2 配置結構定義

**Layout5 配置**
```json
{
  "layout5": {
    "features": [
      {
        "icon": "Lightbulb",
        "title": "智慧策略",
        "description": "學習經過驗證的技巧"
      },
      {
        "icon": "Target",
        "title": "明確目標",
        "description": "實現你的願景"
      },
      {
        "icon": "Zap",
        "title": "快速成果",
        "description": "看見立即影響"
      }
    ]
  }
}
```

**Layout6 配置**
```json
{
  "layout6": {
    "stats": [
      {
        "value": "10K+",
        "label": "活躍用戶",
        "color": "orange"
      },
      {
        "value": "95%",
        "label": "成功率",
        "color": "blue"
      }
    ]
  }
}
```

**Layout7 配置**
```json
{
  "layout7": {
    "brand": {
      "logo_icon": "Star",
      "name": "KeyBox"
    },
    "features": [
      {
        "icon": "Users",
        "title": "社群導向",
        "description": "加入充滿活力的創作者社群"
      },
      {
        "icon": "TrendingUp",
        "title": "持續成長",
        "description": "透過數據洞察追蹤進度"
      },
      {
        "icon": "Star",
        "title": "品質優先",
        "description": "獲得專業級的工具與支援"
      }
    ],
    "learning_points": [
      {
        "title": "願景",
        "description": "釐清你的創意目標"
      },
      {
        "title": "策略",
        "description": "建立可行動的計畫"
      },
      {
        "title": "執行",
        "description": "將想法變成現實"
      }
    ],
    "social_links": [
      {
        "platform": "Twitter",
        "url": "https://twitter.com"
      },
      {
        "platform": "LinkedIn",
        "url": "https://linkedin.com"
      },
      {
        "platform": "Instagram",
        "url": "https://instagram.com"
      }
    ]
  }
}
```

**Layout8 配置**
```json
{
  "layout8": {
    "learning_points": [
      {
        "title": "願景",
        "description": "釐清你的創意目標"
      },
      {
        "title": "策略",
        "description": "建立可行動的計畫"
      },
      {
        "title": "執行",
        "description": "將想法變成現實"
      }
    ]
  }
}
```

---

### 2. 前端實作規格

#### 2.1 TypeScript 型別定義

```typescript
// src/types/template-config.ts

export interface FeatureCard {
  icon: string;
  title: string;
  description: string;
}

export interface StatCard {
  value: string;
  label: string;
  color?: 'orange' | 'blue' | 'green' | 'purple';
}

export interface SocialLink {
  platform: 'Twitter' | 'LinkedIn' | 'Instagram' | 'Facebook';
  url: string;
}

export interface LearningPoint {
  title: string;
  description: string;
}

export interface BrandConfig {
  logo_icon: string;
  name: string;
}

export interface TemplateConfig {
  layout5?: {
    features: FeatureCard[];
  };
  layout6?: {
    stats: StatCard[];
  };
  layout7?: {
    brand: BrandConfig;
    features: FeatureCard[];
    learning_points: LearningPoint[];
    social_links: SocialLink[];
  };
  layout8?: {
    learning_points: LearningPoint[];
  };
}
```

#### 2.2 編輯 UI 組件結構

在 `Creator.tsx` 中新增動態表單區塊：

```tsx
{/* 🎨 視覺設計 - 在現有區塊後新增 */}

{/* ⚙️ 模板專屬設定（根據選擇的模板動態顯示） */}
{(editTemplateType === 'layout5' ||
  editTemplateType === 'layout6' ||
  editTemplateType === 'layout7' ||
  editTemplateType === 'layout8') && (
  <div className="pb-10 mb-10 border-b border-gray-800">
    <div className="text-sm font-semibold text-green-500 uppercase tracking-wider mb-6">
      ⚙️ 模板專屬設定
    </div>

    {/* Layout5: 特色卡片編輯器 */}
    {editTemplateType === 'layout5' && <Layout5ConfigEditor />}

    {/* Layout6: 數據展示編輯器 */}
    {editTemplateType === 'layout6' && <Layout6ConfigEditor />}

    {/* Layout7: 完整配置編輯器 */}
    {editTemplateType === 'layout7' && <Layout7ConfigEditor />}

    {/* Layout8: 學習要點編輯器 */}
    {editTemplateType === 'layout8' && <Layout8ConfigEditor />}
  </div>
)}
```

#### 2.3 共用組件

**圖示選擇器 (IconSelector.tsx)**
```tsx
interface IconSelectorProps {
  value: string;
  onChange: (icon: string) => void;
}

const availableIcons = [
  'Lightbulb', 'Target', 'Zap', 'Star', 'Users',
  'TrendingUp', 'Heart', 'Award', 'Shield', 'Rocket'
];
```

**卡片編輯器 (CardEditor.tsx)**
- 可新增/刪除/重新排序卡片
- 每個卡片包含：圖示、標題、描述

---

### 3. 模板渲染邏輯更新

每個進階模板組件需要：
1. 從 `boxData.template_config` 讀取配置
2. 提供預設值作為 fallback（向後相容）
3. 動態載入圖示（使用 `lucide-react`）

**範例 (TemplateLayout5.tsx)**
```tsx
const config = boxData.template_config?.layout5 || {
  features: [
    { icon: 'Lightbulb', title: '智慧策略', description: '學習經過驗證的技巧' },
    { icon: 'Target', title: '明確目標', description: '實現你的願景' },
    { icon: 'Zap', title: '快速成果', description: '看見立即影響' },
  ]
};

// 動態載入圖示
const IconComponent = icons[config.features[0].icon] || Lightbulb;
```

---

## MVP Todo List

### ✅ MVP-1: 資料庫基礎建設

- [ ] **Task 1.1**: 創建 migration 檔案
  - 檔案: `supabase/migrations/[timestamp]_add_template_config.sql`
  - 新增 `template_config` JSONB 欄位
  - 驗證: 在 Supabase Dashboard 確認欄位存在

- [ ] **Task 1.2**: 更新 TypeScript 型別
  - 檔案: `src/types/template-config.ts` (新建)
  - 定義所有配置介面
  - 檔案: `src/components/templates/BaseTemplate.tsx`
  - 在 `BoxData` 介面加入 `template_config?: TemplateConfig`

- [ ] **Task 1.3**: 執行 migration
  - 執行 SQL migration
  - 驗證測試資料正常寫入

---

### ✅ MVP-2: Layout7 完整實作

- [ ] **Task 2.1**: Layout7ConfigEditor 組件
  - 檔案: `src/components/template-editors/Layout7ConfigEditor.tsx` (新建)
  - 包含 4 個子區塊：
    - 品牌設定（Logo 圖示 + 品牌名稱）
    - 特色區塊（3 個卡片）
    - 學習要點（3 個項目）
    - 社群連結（Twitter/LinkedIn/Instagram）

- [ ] **Task 2.2**: 圖示選擇器組件
  - 檔案: `src/components/shared/IconSelector.tsx` (新建)
  - 顯示常用圖示網格（10-15 個）
  - 支援搜尋功能

- [ ] **Task 2.3**: 卡片陣列編輯器
  - 檔案: `src/components/shared/CardArrayEditor.tsx` (新建)
  - 支援新增/刪除/編輯卡片
  - 每個卡片：圖示 + 標題 + 描述

- [ ] **Task 2.4**: Creator.tsx 整合
  - 在編輯表單中新增「⚙️ 模板專屬設定」區塊
  - 新增 state: `editTemplateConfig`
  - 連接到 Layout7ConfigEditor

- [ ] **Task 2.5**: TemplateLayout7.tsx 更新
  - 從 `boxData.template_config.layout7` 讀取配置
  - 移除硬編碼，使用動態數據
  - 實作預設值 fallback

- [ ] **Task 2.6**: 儲存邏輯更新
  - 在 `handleUpdateKeyword` 函數中包含 `template_config`
  - 在 `handleSubmit` (新增關鍵字) 中包含 `template_config`

---

### ✅ MVP-3: Layout5 實作

- [ ] **Task 3.1**: Layout5ConfigEditor 組件
  - 檔案: `src/components/template-editors/Layout5ConfigEditor.tsx` (新建)
  - 特色卡片陣列編輯器（複用 CardArrayEditor）
  - 預設 3 個卡片，最多 5 個

- [ ] **Task 3.2**: TemplateLayout5.tsx 更新
  - 從 `boxData.template_config.layout5` 讀取配置
  - 動態渲染特色卡片

- [ ] **Task 3.3**: Creator.tsx 整合
  - 在模板專屬設定區塊加入 Layout5 判斷

---

### ✅ MVP-4: Layout6 & Layout8 實作

- [ ] **Task 4.1**: Layout6ConfigEditor 組件
  - 檔案: `src/components/template-editors/Layout6ConfigEditor.tsx` (新建)
  - 數據卡片編輯器（數值 + 標籤 + 顏色選擇）
  - 預設 2 個，最多 4 個

- [ ] **Task 4.2**: Layout8ConfigEditor 組件
  - 檔案: `src/components/template-editors/Layout8ConfigEditor.tsx` (新建)
  - 學習要點編輯器（標題 + 描述）
  - 預設 3 個，最多 5 個

- [ ] **Task 4.3**: TemplateLayout6.tsx 更新
  - 從 `template_config.layout6` 讀取配置

- [ ] **Task 4.4**: TemplateLayout8.tsx 更新
  - 從 `template_config.layout8` 讀取配置

- [ ] **Task 4.5**: Creator.tsx 最終整合
  - 整合 Layout6 和 Layout8 編輯器
  - 確保所有狀態正確管理

---

### ✅ 測試階段

#### 單元測試
- [ ] **Test 1**: 資料庫欄位驗證
  - 確認 `template_config` 欄位可正確寫入 JSONB
  - 測試空值處理

- [ ] **Test 2**: 預設值 Fallback
  - 測試沒有 `template_config` 的舊資料
  - 確認模板使用預設硬編碼值

- [ ] **Test 3**: 圖示動態載入
  - 測試所有支援的圖示名稱
  - 測試無效圖示名稱的錯誤處理

#### 整合測試
- [ ] **Test 4**: Layout7 完整流程
  - 建立新關鍵字 → 選擇 Layout7 → 編輯所有設定 → 儲存
  - 重新開啟編輯 → 確認所有設定保留
  - 前往預覽頁 → 確認渲染正確

- [ ] **Test 5**: Layout5/6/8 流程測試
  - 重複 Test 4 的流程，確認每個模板都正常

- [ ] **Test 6**: 基礎模板相容性
  - 測試 Default, Layout1, Layout2, Layout4
  - 確認沒有受到新功能影響

#### 使用者測試
- [ ] **Test 7**: 編輯體驗測試
  - 新增卡片是否直觀？
  - 刪除卡片是否有確認？
  - 圖示選擇器是否易用？

- [ ] **Test 8**: 即時預覽測試
  - 編輯後即時預覽是否更新？
  - 切換模板時配置是否保留/清空正確？

#### 效能測試
- [ ] **Test 9**: 大量卡片渲染
  - 測試 5 個特色卡片的渲染效能
  - 確認無明顯延遲

- [ ] **Test 10**: Migration 效能
  - 確認新增欄位不影響現有查詢效能

---

## 邊界條件處理

### 1. 資料驗證
- 卡片數量上限檢查（Layout5: 最多 5 個）
- 必填欄位檢查（標題、描述不可為空）
- URL 格式驗證（社群連結）

### 2. 錯誤處理
- 無效的圖示名稱 → 使用預設圖示 (Star)
- 缺少 template_config → 使用預設值
- JSONB 解析錯誤 → 記錄錯誤，使用預設值

### 3. 向後相容
- 所有模板必須能處理沒有 `template_config` 的情況
- 基礎模板完全不受影響

---

## 驗收標準

### 功能完整性
- ✅ 所有進階模板的動態元素可在編輯器中修改
- ✅ 圖示選擇器包含至少 10 個常用圖示
- ✅ 即時預覽正確反映編輯內容

### 程式碼品質
- ✅ TypeScript 無錯誤
- ✅ 組件可複用（CardArrayEditor 等）
- ✅ 有適當的錯誤處理

### 使用者體驗
- ✅ 編輯介面直觀，無需閱讀文檔
- ✅ 載入速度 < 1 秒
- ✅ 無明顯 UI bug

---

## 檔案清單

### 新建檔案
```
supabase/migrations/
  └── [timestamp]_add_template_config.sql

src/types/
  └── template-config.ts

src/components/template-editors/
  ├── Layout5ConfigEditor.tsx
  ├── Layout6ConfigEditor.tsx
  ├── Layout7ConfigEditor.tsx
  └── Layout8ConfigEditor.tsx

src/components/shared/
  ├── IconSelector.tsx
  └── CardArrayEditor.tsx
```

### 修改檔案
```
src/components/templates/
  ├── BaseTemplate.tsx          (新增 template_config 型別)
  ├── TemplateLayout5.tsx       (讀取動態配置)
  ├── TemplateLayout6.tsx       (讀取動態配置)
  ├── TemplateLayout7.tsx       (讀取動態配置)
  └── TemplateLayout8.tsx       (讀取動態配置)

src/pages/
  └── Creator.tsx               (新增編輯器整合)
```

---

## 風險評估

### 技術風險
- **風險**: JSONB 效能問題
- **緩解**: 索引優化，配置不會太大（< 5KB）

### 產品風險
- **風險**: 使用者覺得編輯器太複雜
- **緩解**: 提供預設模板，使用摺疊面板隱藏進階選項

### 時程風險
- **風險**: 低估實作複雜度
- **緩解**: 採用 MVP 分階段交付，優先完成 Layout7

---

## 未來擴展

### Phase 2 (未來版本)
- 區塊拖拉排序
- 自訂顏色主題
- 更多圖示庫整合
- 模板複製功能

### Phase 3 (未來版本)
- 視覺化區塊編輯器（無程式碼）
- 模板市集（分享自訂模板）
- A/B 測試模板效果

---

**文檔版本**: v1.0
**最後更新**: 2025-01-08
**狀態**: ✅ Ready for Development
