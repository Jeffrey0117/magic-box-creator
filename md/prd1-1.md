# Creator 左側預覽改為實際資料包頁面預覽 規劃與記錄

## 文檔資訊
- 文檔版本: v1.0
- 建立日期: 2025-10-22
- 規劃範疇: 後台 Creator 左側預覽區重構為真實前台頁面預覽
- 優先級: 高
- 狀態: 規劃完成，待執行

---

## 一、背景與目標
- 背景：現行 [Creator.tsx](src/pages/Creator.tsx) 左側為靜態模板預覽，與實際前台顯示存在差異。
- 目標：在 Creator 左側呈現真實資料包頁面預覽，與 [Box.tsx](src/pages/Box.tsx) 一致。
- 成功標準：
  - 左側預覽與實際開啟連結一致（樣式、資料、互動）。
  - 任何模板與狀態變更可即時反映。
  - 編輯體驗流暢，不破壞現有後台編輯流程。

## 二、需求分析
### 2.1 功能性需求
- 在 Creator 左側嵌入可視預覽，顯示實際模板渲染。
- 即時反映右側表單變更：標題、描述、圖片、模板、限制設定等。
- 支援多模板 [registry.ts](src/components/templates/registry.ts) 動態切換。
- 支援創作者預覽模式（不需真的提交解鎖）。
- 支援深鏈接參數，如 ?preview=1 或內部狀態切換。

### 2.2 非功能性需求
- 性能：預覽渲染在 100ms 內回應主要變更。
- 穩定：不影響資料保存、提交、刪除等操作。
- 可維護：預覽與前台共用渲染邏輯，避免雙維護。
- 安全：預覽不對外暴露敏感資料與管理操作。

### 2.3 約束與相容
- 保持與 shadcn/ui、Tailwind 現有設計一致。
- 不修改資料模型與 Supabase 結構。
- 適配桌面與行動裝置編輯。

## 三、技術方案
### 3.1 架構選型
- 採用「嵌入式真實前台組件」：在 Creator 左側以 iframe 或內嵌組件渲染與 [Box.tsx](src/pages/Box.tsx) 相同的 Template 渲染樹。
- 優先內嵌組件，避免 iframe 跨上下文溝通成本；若樣式隔離衝突則回退 iframe。

### 3.2 實作策略
- 抽取「資料包視圖容器」組件，如 PackagePreviewShell，負責：
  - 接收完整 package 資料與 UI 狀態。
  - 從 [templates](src/components/templates/TemplateDefault.tsx) 等載入模板並渲染。
  - 提供 previewMode 屬性，替代真實解鎖流程，直接展示解鎖前/後狀態。
- 與右側表單透過單一來源狀態同步：使用 lifting state + React.Context 或 Zustand。

### 3.3 狀態同步
- 建立 Creator 編輯狀態 atom：templateType、title、intro、images[]、quota、expiry、requiredFields 等。
- 右側表單 onChange 直接更新狀態；左側 PackagePreviewShell 訂閱並重渲染。
- 慎控 re-render：以 memo、useMemo()、React.Suspense() 包裝。

### 3.4 資料來源
- 初始值：從 Supabase 拉取使用者現有關鍵字包資料。
- 即時預覽：優先使用本地暫存的未保存變更，未填則回退遠端值。

### 3.5 互動與限制
- 預覽模式不觸發真實解鎖 API；表單可禁用或改為假提交。
- 按鈕等互動保留 hover、focus 視覺，用於審視樣式。
- 連結點擊以阻止預設行為，避免跳走。

### 3.6 風格與樣式
- 共用 Tailwind 與 shadcn 主題；避免 Creator 容器樣式汙染模板。
- 如遇樣式衝突，使用樣式命名空間或 iframe 沙箱作法。

## 四、實現步驟
### 4.1 重構與抽象
1. 新增組件 src/components/PackagePreviewShell.tsx，封裝模板載入與 previewMode。
2. 將 [Box.tsx](src/pages/Box.tsx) 中與模板渲染相關邏輯抽離至 Shell 可重用。
3. 在 [Creator.tsx](src/pages/Creator.tsx) 左側用 ResizablePanel 包裹 PackagePreviewShell。

### 4.2 狀態與資料
4. 建立 Creator 編輯狀態 store（Zustand 或 Context）供左右兩側共用。
5. 將現有右側表單的 onChange 接線至 store，維持原有校驗。
6. 初次載入拉取 package 詳細資料，hydrate 至 store。

### 4.3 模板與預覽模式
7. PackagePreviewShell 依 store 的 templateType 從 [registry.ts](src/components/templates/registry.ts) 載入對應模板。
8. 向模板傳入 previewMode=true 與必要 props，避免真實提交。
9. 對涉及解鎖後畫面的模板，提供 unlocked=false/true 的切換控件。

### 4.4 體驗與性能
10. 對大圖使用懶載入與尺寸佔位，避免抖動。
11. 用 React.memo()、useMemo() 優化重渲。
12. 監控渲染耗時，超標則降級禁用某些即時效果。

### 4.5 回退機制
13. 提供「恢復舊預覽」開關，出問題可快速切回原行為。

## 五、測試計畫
### 5.1 單元測試
- PackagePreviewShell：模板選擇、props 傳遞、previewMode 行為。
- 狀態 store：變更同步、選擇器、訂閱解除。

### 5.2 組合與端對端
- 在 Creator 編輯流程中，逐項修改欄位，確認左側即時反映。
- 切換模板 default、layout1-8，預覽一致且無錯樣式。
- 行動裝置尺寸下拖曳預覽面板，確認可用性。

### 5.3 相容與回歸
- 確認不影響既有的新增、編輯、刪除關鍵字包行為。
- 比對實際前台開啟 [Box.tsx](src/pages/Box.tsx) 渲染結果：像素與交互一致。

### 5.4 性能與可用性
- 首次預覽渲染 < 200ms；變更回應 < 100ms。
- 無重大 reflow；滾動與拖曳流暢。

## 六、分步驟完成概念
### 6.1 MVP
- 左側渲染真實模板樹（default + 1 個 layout）。
- 與右側表單 5 項核心欄位同步：標題、描述、首圖、模板、解鎖文案。
- previewMode 禁用提交。

### 6.2 v1
- 覆蓋全部模板 layout1-8。
- 新增解鎖前/後視圖切換。
- 行動裝置優化與記憶上次預覽狀態。

### 6.3 v1.1
- 提供「恢復舊預覽」與問題回報入口。
- 針對大圖與多圖模板的骨架屏優化。

## 七、風險與緩解
- 樣式衝突：優先命名空間方案，必要時切換 iframe。
- 重渲成本高：以選擇器拆分狀態 + memo 進行細粒度渲染。
- 與 Box 真實流程差異：以共享模板與屬性規約對齊。

## 八、指標與驗收
- 功能：模板一致性 100%，字段同步無延遲錯誤。
- 體驗：變更回應 P95 < 120ms。
- 性能：記憶體穩定，無明顯 leak；FPS 穩定 > 55。

## 九、相關檔與位置
- 編輯頁 [Creator.tsx](src/pages/Creator.tsx)
- 前台頁 [Box.tsx](src/pages/Box.tsx)
- 模板註冊 [registry.ts](src/components/templates/registry.ts)
- 模板範例 [TemplateDefault.tsx](src/components/templates/TemplateDefault.tsx)

## 十、變更記錄
- v1.0 2025-10-22 新增：將 md 更新為 Creator 左側真實預覽規劃