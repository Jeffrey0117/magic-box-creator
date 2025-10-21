# KeyBox Creator 後台 UI 設計文檔

> **最後更新**：2025-10-21  
> **版本**：v2.1  
> **基於實作**：[`src/pages/Creator.tsx`](src/pages/Creator.tsx:1-1492)

---

## 📋 目錄

1. [設計原則](#設計原則)
2. [頂部儀表板](#頂部儀表板)
3. [搜尋與篩選系統](#搜尋與篩選系統)
4. [卡片設計](#卡片設計)
5. [色彩系統](#色彩系統)
6. [響應式設計](#響應式設計)
7. [組件使用指南](#組件使用指南)

---

## 🎨 設計原則

### 核心理念
- **資訊密度優先**：在有限空間內呈現最大價值資訊
- **操作效率**：常用功能一鍵觸達，減少點擊層級
- **視覺引導**：用色彩編碼快速傳達狀態資訊
- **響應式優先**：桌面與行動裝置同等重要

### 布局哲學
- **兩欄式卡片**：左側資訊展示 (flex-[2])，右側操作區 (固定寬度)
- **垂直優先**：行動裝置採用單欄堆疊，減少橫向滾動
- **漸進披露**：次要資訊透過 hover 展開，保持介面簡潔

---

## 📊 頂部儀表板

### 設計規格

```tsx
// 三卡式統計儀表板 - 橘色統計文字
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
```

#### 1️⃣ 總資料包數 (紫色主題)
```tsx
<Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
  <CardHeader className="pb-3">
    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
      <Package className="w-4 h-4" />
      總資料包
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
      {dashboardStats.totalPackages}
    </div>
    <p className="text-xs text-muted-foreground mt-1">個資料包</p>
  </CardContent>
</Card>
```

**視覺特徵**：
- 背景：紫色漸層 (`from-purple-500/10 to-purple-600/5`)
- 邊框：半透明紫色 (`border-purple-500/20`)
- 數字：3xl 大小，紫色 (`text-purple-600 dark:text-purple-400`)
- Icon：[`Package`](src/pages/Creator.tsx:544) 圖示

#### 2️⃣ 總領取數 (藍色主題)
```tsx
<Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
  <CardHeader className="pb-3">
    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
      <Users className="w-4 h-4" />
      總領取數
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
      {dashboardStats.totalClaims}
    </div>
    <p className="text-xs text-muted-foreground mt-1">累計領取人次</p>
  </CardContent>
</Card>
```

**視覺特徵**：
- 背景：藍色漸層
- Icon：[`Users`](src/pages/Creator.tsx:560) 圖示
- 統計來源：[`dashboardStats.totalClaims`](src/pages/Creator.tsx:484)

#### 3️⃣ 今日新增 (綠色主題)
```tsx
<Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
  <CardHeader className="pb-3">
    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
      <TrendingUp className="w-4 h-4" />
      今日新增
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
      +{dashboardStats.todayGrowth}
    </div>
    <p className="text-xs text-muted-foreground mt-1">今日領取人次</p>
  </CardContent>
</Card>
```

**視覺特徵**：
- 背景：綠色漸層
- Icon：[`TrendingUp`](src/pages/Creator.tsx:576) 圖示
- 前綴：加號 `+` 表示增長

### 數據計算邏輯

```tsx
// src/pages/Creator.tsx:482-488
const dashboardStats = useMemo(() => {
  const totalPackages = keywords.length;
  const totalClaims = keywords.reduce((sum, item) => sum + (item.email_count || 0), 0);
  const todayGrowth = keywords.reduce((sum, item) => sum + (item.today_count || 0), 0);
  
  return { totalPackages, totalClaims, todayGrowth };
}, [keywords]);
```

---

## 🔍 搜尋與篩選系統

### 布局結構

```tsx
// src/pages/Creator.tsx:648-707
<div className="mb-6 space-y-3">
  <div className="flex flex-col sm:flex-row gap-3">
    {/* 搜尋框 */}
    <div className="flex-1">
      <Input placeholder="🔍 搜尋關鍵字或內容..." />
    </div>
    
    {/* 狀態篩選按鈕組 */}
    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
      <Button variant={statusFilter === 'all' ? 'default' : 'outline'}>全部</Button>
      <Button variant={statusFilter === 'active' ? 'default' : 'outline'}>
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        使用中
      </Button>
      {/* ... 其他狀態 */}
    </div>
  </div>
  
  {/* 結果統計 */}
  {(searchKeyword || statusFilter !== 'all') && (
    <div className="text-sm text-muted-foreground">
      找到 {filteredKeywords.length} 個關鍵字
      {searchKeyword && ` (搜尋: "${searchKeyword}")`}
    </div>
  )}
</div>
```

### 狀態篩選邏輯

```tsx
// src/pages/Creator.tsx:491-499
const getKeywordStatus = (item: Keyword): 'active' | 'warning' | 'exhausted' => {
  if (!item.quota) return 'active';
  const remaining = item.quota - (item.email_count || 0);
  const percentage = remaining / item.quota;
  
  if (remaining <= 0) return 'exhausted';
  if (percentage <= 0.2) return 'warning';  // 剩餘 20% 以下
  return 'active';
};
```

### 篩選實作

```tsx
// src/pages/Creator.tsx:502-514
const filteredKeywords = useMemo(() => {
  return keywords.filter(item => {
    // 搜尋過濾
    const matchesSearch = searchKeyword.trim() === '' ||
      item.keyword.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.content.toLowerCase().includes(searchKeyword.toLowerCase());
    
    // 狀態過濾
    const matchesStatus = statusFilter === 'all' || getKeywordStatus(item) === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
}, [keywords, searchKeyword, statusFilter]);
```

---

## 🎴 卡片設計

### 兩欄式布局 (Phase 11 最終版)

```tsx
// src/pages/Creator.tsx:1256-1378
<div className="flex flex-col lg:flex-row gap-4 flex-1">
  {/* 左：主要資訊區 (比例擴展) */}
  <div className="lg:flex-[2] space-y-2">
    {/* 關鍵字 + 狀態點 */}
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
      <p className="text-2xl font-bold text-accent truncate">{item.keyword}</p>
    </div>
    
    {/* 回覆內容 (hover 展開) */}
    <div className="relative group">
      <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-line">
        {item.content}
      </p>
      {item.content.length > 100 && (
        <div className="absolute hidden group-hover:block z-10 top-0 left-0 right-0 p-2 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
          <p className="text-sm whitespace-pre-line">{item.content}</p>
        </div>
      )}
    </div>
    
    {/* 統計資訊 - 橘色文字 (Phase 11 調整) */}
    <div className="text-xs text-orange-500 dark:text-orange-400 flex items-center gap-3">
      <span>今日 +{item.today_count || 0}</span>
      <span>|</span>
      <span>剩餘 {item.quota ? item.quota - (item.email_count || 0) : '∞'}</span>
    </div>
  </div>
  
  {/* 右：操作區 (縮小寬度) */}
  <div className="lg:w-auto lg:min-w-[160px] flex flex-col gap-2">
    {/* 主要操作：複製文案 (文字按鈕) - Phase 11 調整 */}
    <Button variant="ghost" size="default" className="w-full gap-2 hover:bg-accent/10">
      📝 複製文案
    </Button>
    
    {/* 進階分析 (圖示按鈕) - Phase 11 調整 */}
    <Button 
      variant="outline" 
      size="default"
      className="w-full border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/10"
    >
      <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
    </Button>
    
    {/* 預覽按鈕 */}
    <Button size="sm" variant="outline" className="w-full gap-2">
      <Eye className="w-4 h-4" />
      預覽
    </Button>
    
    {/* 更多選單：複製連結 / 編輯 / 刪除 */}
    <div className="flex gap-2">
      <Button size="sm" variant="ghost" className="flex-1">📋</Button>
      <Button size="sm" variant="ghost" className="flex-1"><Edit /></Button>
      <Button size="sm" variant="ghost" className="flex-1 text-destructive"><Trash2 /></Button>
    </div>
  </div>
</div>
```

### Phase 11 關鍵調整

1. **統計顏色橘色化** ([`Creator.tsx:1289`](src/pages/Creator.tsx:1289))
   ```tsx
   // 原本：text-muted-foreground
   // 現在：text-orange-500 dark:text-orange-400
   <div className="text-xs text-orange-500 dark:text-orange-400">
   ```

2. **按鈕位置交換** ([`Creator.tsx:1301-1322`](src/pages/Creator.tsx:1301-1322))
   ```tsx
   // 原順序：進階分析 → 複製文案
   // 新順序：複製文案 → 進階分析
   <Button>📝 複製文案</Button>  {/* 主要操作 */}
   <Button><BarChart3 /></Button>  {/* 次要操作 */}
   ```

3. **空白問題解決**
   - 移除 [`BarChart3`](src/pages/Creator.tsx:1321) 按鈕內的「進階分析」文字
   - 只保留圖示，縮小按鈕寬度
   - 操作區整體寬度從 `lg:w-48` 調整為 `lg:min-w-[160px]`

---

## 🎨 色彩系統

### 狀態色彩編碼

```tsx
// src/pages/Creator.tsx:1262-1271
const statusColors = {
  active: 'bg-green-500',      // 使用中 (剩餘 > 20%)
  warning: 'bg-yellow-500',    // 即將用完 (剩餘 ≤ 20%)
  exhausted: 'bg-red-500'      // 已用完 (剩餘 = 0)
};
```

### 主題色彩

| 用途 | 亮色模式 | 暗色模式 | 類別 |
|------|----------|----------|------|
| 總資料包 | `text-purple-600` | `text-purple-400` | 統計卡片 |
| 總領取數 | `text-blue-600` | `text-blue-400` | 統計卡片 |
| 今日新增 | `text-green-600` | `text-green-400` | 統計卡片 |
| 統計資訊 | `text-orange-500` | `text-orange-400` | 卡片內統計 |
| 關鍵字 | `text-accent` | `text-accent` | 主標題 |
| 回覆內容 | `text-muted-foreground` | `text-muted-foreground` | 次要文字 |

### 漸層背景

```tsx
// 統計卡片漸層模式
from-{color}-500/10 to-{color}-600/5 border-{color}-500/20
```

---

## 📱 響應式設計

### 斷點策略

```tsx
// Tailwind 斷點
sm:  640px   // 手機橫屏
md:  768px   // 平板
lg:  1024px  // 筆電
xl:  1280px  // 桌機
```

### 布局轉換

#### 儀表板
```tsx
// 行動：單欄堆疊
grid-cols-1

// 平板以上：三欄並排
md:grid-cols-3
```

#### 卡片
```tsx
// 行動：垂直堆疊
flex-col

// 筆電以上：兩欄並排
lg:flex-row
```

#### 搜尋篩選
```tsx
// 行動：垂直堆疊 + 按鈕換行
flex-col gap-3
flex gap-2 flex-wrap

// 平板以上：水平排列 + 按鈕不換行
sm:flex-row gap-3
sm:flex-nowrap
```

---

## 🧩 組件使用指南

### 1. 狀態指示點

```tsx
// 使用方式
const status = getKeywordStatus(item);
const statusColors = {
  active: 'bg-green-500',
  warning: 'bg-yellow-500',
  exhausted: 'bg-red-500'
};

<span className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
```

### 2. Hover 展開內容

```tsx
// 超過 100 字的內容自動 hover 展開
<div className="relative group">
  <p className="line-clamp-2">{content}</p>
  {content.length > 100 && (
    <div className="absolute hidden group-hover:block z-10 ...">
      <p>{content}</p>
    </div>
  )}
</div>
```

### 3. 統計數據 Badge

```tsx
// 橘色統計文字 (Phase 11)
<div className="text-xs text-orange-500 dark:text-orange-400 flex items-center gap-3">
  <span>今日 +{todayCount}</span>
  <span>|</span>
  <span>剩餘 {remaining}</span>
</div>
```

### 4. 按鈕優先級

```tsx
// 主要操作：文字按鈕 (ghost)
<Button variant="ghost" size="default" className="w-full">
  📝 複製文案
</Button>

// 次要操作：圖示按鈕 (outline)
<Button variant="outline" size="default" className="w-full">
  <Icon />
</Button>

// 危險操作：紅色 (ghost + text-destructive)
<Button variant="ghost" className="text-destructive">
  <Trash2 />
</Button>
```

---

## 📝 設計決策記錄

### Phase 11 最終細節調整 (2025-10-21)

#### 調整項目
1. **統計顏色橘色化**
   - 原因：與頂部統計卡片區隔，避免視覺混淆
   - 實作：[`Creator.tsx:1289`](src/pages/Creator.tsx:1289)

2. **按鈕位置交換**
   - 原因：「複製文案」為最常用操作，應置於首位
   - 實作：[`Creator.tsx:1301-1322`](src/pages/Creator.tsx:1301-1322)

3. **空白問題解決**
   - 原因：「進階分析」文字造成操作區過寬
   - 方案：移除文字，只保留 [`BarChart3`](src/pages/Creator.tsx:1321) 圖示
   - 效果：操作區寬度減少，資訊區可展示更多內容

### 之前重大調整

#### Phase 10: 兩欄式卡片布局
- 從單欄改為兩欄，提升資訊密度
- 左側比例從 `flex-1` 調整為 `flex-[2]`
- 右側固定寬度 `lg:min-w-[160px]`

#### Phase 9: 頂部儀表板
- 新增三個關鍵指標統計卡片
- 採用色彩編碼：紫 (資料包) / 藍 (領取) / 綠 (增長)
- 漸層背景提升視覺層次

---

## 🔗 相關檔案

- 主實作：[`src/pages/Creator.tsx`](src/pages/Creator.tsx:1-1492)
- UI 組件：[`src/components/ui/`](src/components/ui/)
- 測試清單：[`todo-test.md`](todo-test.md)
- PRD 文檔：[`prd.md`](prd.md), [`prd2.md`](prd2.md), [`prd4.md`](prd4.md)

---

**文檔維護者**：KeyBox 開發團隊  
**最後審核**：2025-10-21