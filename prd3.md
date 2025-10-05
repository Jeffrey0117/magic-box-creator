# PRD3: 候補排隊系統（Phase 3）

> **決策**：採用候補排隊模式（原方案 B）
> **日期**：2025-10-05
> **狀態**：待審核 MVP

---

## 📋 問題定義

### 現況問題
當資料包領取數達到配額上限時（`current_count >= quota`），使用者訪問該資料包頁面會遇到以下矛盾：
- 顯示「剩餘 0 份」
- 但表單仍可填寫並送出
- 送出後才顯示「已達上限」錯誤

### 用戶體驗問題
1. **資訊不一致**：顯示 0 份卻還能填表單
2. **浪費時間**：填完表單才知道領不到
3. **缺乏引導**：沒有明確的「已完結」狀態提示
4. **錯失補救機會**：熱門資料包完結後，創作者無法得知還有多少人想要

---

## 🎯 採用方案：候補排隊模式

### 核心概念
- 資料包達到配額後，不直接關閉，而是開啟「候補模式」
- 用戶可加入候補名單，留下 Email + 備註
- 創作者可在 Admin 後台查看候補需求，決定是否加開配額
- 加開配額後，自動通知候補者

### 使用情境
1. **創作者測試需求**：先開 10 份測試市場反應 → 看到 50 人候補 → 決定加開 100 份
2. **彈性調整**：原本設定 50 份，但候補人數超過 100 → 評估後加開至 150 份
3. **數據導向決策**：透過候補人數了解真實需求，避免配額設定過少或過多

---

## 🎨 使用者介面設計

### 1. 候補頁面（Box.tsx - 已完結狀態）

```
┌────────────────────────────────────────────┐
│  ⚠️ 此資料包已領取完畢                      │
│                                            │
│  📦 測試資料包                              │
│  ✅ 已發放：100/100 份                     │
│  👥 候補名單：12 人排隊中                  │
│                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                            │
│  💡 創作者可能會根據需求加開配額            │
│     加入候補名單即可在開放時收到通知！      │
│                                            │
│  ┌────────────────────────────────────┐   │
│  │ Email *                            │   │
│  │ [your@email.com____________]       │   │
│  │                                    │   │
│  │ 為什麼想要這個資料包？（選填）      │   │
│  │ ┌──────────────────────────────┐  │   │
│  │ │ 例：想用在公司專案、學習用途  │  │   │
│  │ │                              │  │   │
│  │ └──────────────────────────────┘  │   │
│  └────────────────────────────────────┘   │
│                                            │
│  [🔔 加入候補名單]  [👤 追蹤創作者]        │
│                                            │
│  ✨ 加入候補後，創作者加開配額時會優先通知  │
└────────────────────────────────────────────┘
```

### 2. 加入候補成功提示

```
┌────────────────────────────────────┐
│  ✅ 已加入候補名單！                │
│                                    │
│  📧 通知 Email：your@email.com     │
│  📊 目前排隊人數：13 人            │
│                                    │
│  💡 接下來：                        │
│  • 創作者會看到候補需求            │
│  • 若決定加開配額，會優先通知您    │
│  • 請留意 Email 信箱               │
│                                    │
│  [🏠 返回首頁]  [👤 追蹤創作者]    │
└────────────────────────────────────┘
```

### 3. Admin 後台 - 候補名單管理

```
┌─────────────────────────────────────────────┐
│  📦 測試資料包 - 候補名單管理                │
│                                             │
│  ✅ 已發放：100/100 份                      │
│  👥 候補名單：12 人                         │
│                                             │
│  [💡 快速加開] ▼                            │
│  ├─ 加開 20 份（120 份總配額）              │
│  ├─ 加開 50 份（150 份總配額）              │
│  └─ 自訂數量...                             │
│                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                             │
│  候補名單（依加入時間排序）                 │
│  ┌─────────────────────────────────────┐   │
│  │ #1  user1@example.com               │   │
│  │     「想用在公司專案」               │   │
│  │     2025-10-05 10:30                │   │
│  ├─────────────────────────────────────┤   │
│  │ #2  user2@example.com               │   │
│  │     「學習用途」                     │   │
│  │     2025-10-05 11:15                │   │
│  ├─────────────────────────────────────┤   │
│  │ #3  user3@example.com               │   │
│  │     （未填寫備註）                   │   │
│  │     2025-10-05 12:00                │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [📧 匯出候補名單 CSV]                      │
└─────────────────────────────────────────────┘
```

---

## 🗄️ 資料庫設計

### 新增資料表：`waitlist`

```sql
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'waiting',
  notified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_email_per_keyword UNIQUE (keyword_id, email)
);

CREATE INDEX idx_waitlist_keyword ON waitlist(keyword_id);
CREATE INDEX idx_waitlist_status ON waitlist(status);
```

### 狀態欄位說明
- `waiting`: 等待中
- `notified`: 已通知（配額加開時）
- `claimed`: 已成功領取（追蹤用）
- `expired`: 已過期（創作者選擇不加開）

---

## 🛠️ 技術實作規劃

### Phase 1: 基礎候補功能（MVP）

#### 1.1 前端組件

**新增檔案：`src/components/WaitlistCard.tsx`**
```tsx
interface WaitlistCardProps {
  keyword: Keyword;
  waitlistCount: number;
}

export function WaitlistCard({ keyword, waitlistCount }: WaitlistCardProps) {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleJoinWaitlist = async () => {
    // 驗證 Email 格式
    // 呼叫 Supabase 新增候補記錄
    // 顯示成功提示
  };
  
  return (/* UI 實作 */);
}
```

**修改檔案：`src/pages/Box.tsx`**
```tsx
// 判斷是否已完結
const isCompleted = keyword.quota !== null && keyword.current_count >= keyword.quota;

// 取得候補人數
const { count: waitlistCount } = await supabase
  .from('waitlist')
  .select('*', { count: 'exact', head: true })
  .eq('keyword_id', keyword.id)
  .eq('status', 'waiting');

return (
  <div className="min-h-screen p-6">
    {isCompleted ? (
      <WaitlistCard keyword={keyword} waitlistCount={waitlistCount || 0} />
    ) : (
      <ClaimForm keyword={keyword} />
    )}
  </div>
);
```

#### 1.2 後端 API（Supabase RLS）

```sql
-- 允許所有人新增候補記錄
CREATE POLICY "Anyone can join waitlist"
ON waitlist FOR INSERT
WITH CHECK (true);

-- 只允許查看候補人數（不顯示個人資料）
CREATE POLICY "Anyone can view waitlist count"
ON waitlist FOR SELECT
USING (true);

-- Admin 可查看完整候補名單
CREATE POLICY "Admin can view all waitlist"
ON waitlist FOR SELECT
USING (auth.jwt() ->> 'email' = 'jeffby8@gmail.com');

-- 創作者可查看自己資料包的候補名單
CREATE POLICY "Creator can view own waitlist"
ON waitlist FOR SELECT
USING (
  keyword_id IN (
    SELECT id FROM keywords WHERE creator_id = auth.uid()
  )
);
```

---

### Phase 2: Admin 後台管理

#### 2.1 候補名單顯示

**修改檔案：`src/pages/admin/PackageDetail.tsx`**

新增「候補名單」Tab：
```tsx
<Tabs>
  <TabsList>
    <TabsTrigger value="overview">📊 總覽</TabsTrigger>
    <TabsTrigger value="records">📋 領取記錄</TabsTrigger>
    <TabsTrigger value="waitlist">👥 候補名單</TabsTrigger>
  </TabsList>
  
  <TabsContent value="waitlist">
    <WaitlistManagement keywordId={keyword.id} />
  </TabsContent>
</Tabs>
```

**新增組件：`src/components/WaitlistManagement.tsx`**
```tsx
export function WaitlistManagement({ keywordId }: { keywordId: string }) {
  const [waitlist, setWaitlist] = useState([]);
  
  const fetchWaitlist = async () => {
    const { data } = await supabase
      .from('waitlist')
      .select('*')
      .eq('keyword_id', keywordId)
      .eq('status', 'waiting')
      .order('created_at', { ascending: true });
    
    setWaitlist(data || []);
  };
  
  return (
    <Table>
      {/* 候補名單表格 */}
    </Table>
  );
}
```

#### 2.2 快速加開配額功能

```tsx
const handleIncreaseQuota = async (additionalQuota: number) => {
  const { error } = await supabase
    .from('keywords')
    .update({
      quota: keyword.quota + additionalQuota
    })
    .eq('id', keyword.id);
  
  if (!error) {
    // 通知所有候補者
    await notifyWaitlist(keyword.id);
    toast.success(`已加開 ${additionalQuota} 份配額！`);
  }
};
```

---

### Phase 3: Email 通知系統

#### 3.1 Supabase Edge Function

**新增檔案：`supabase/functions/notify-waitlist/index.ts`**

```typescript
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

Deno.serve(async (req) => {
  const { keyword_id } = await req.json();
  
  // 取得候補名單
  const { data: waitlist } = await supabase
    .from('waitlist')
    .select('email')
    .eq('keyword_id', keyword_id)
    .eq('status', 'waiting');
  
  // 取得資料包資訊
  const { data: keyword } = await supabase
    .from('keywords')
    .select('keyword, short_code')
    .eq('id', keyword_id)
    .single();
  
  // 批次發送 Email
  const emails = waitlist.map(w => ({
    from: 'KeyBox <noreply@keybox.cc>',
    to: w.email,
    subject: `🎉 好消息！「${keyword.keyword}」已加開配額`,
    html: `
      <h2>您候補的資料包已加開配額！</h2>
      <p>創作者決定加開「${keyword.keyword}」的配額。</p>
      <p>立即前往領取：<a href="https://keybox.cc/${keyword.short_code}">點此領取</a></p>
    `
  }));
  
  await resend.batch.send(emails);
  
  // 更新候補狀態
  await supabase
    .from('waitlist')
    .update({ status: 'notified', notified_at: new Date().toISOString() })
    .eq('keyword_id', keyword_id)
    .eq('status', 'waiting');
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

#### 3.2 前端呼叫通知

```tsx
const notifyWaitlist = async (keywordId: string) => {
  const { error } = await supabase.functions.invoke('notify-waitlist', {
    body: { keyword_id: keywordId }
  });
  
  if (!error) {
    toast.success('已通知所有候補者！');
  }
};
```

---

## ✅ MVP 審核標準

### 必要功能（Phase 1）
- [ ] 資料包達到配額時，顯示候補卡片（隱藏原領取表單）
- [ ] 用戶可填寫 Email + 備註加入候補
- [ ] 顯示目前候補人數
- [ ] 同一 Email 不可重複加入同一資料包候補
- [ ] Email 格式驗證
- [ ] 加入成功後顯示確認訊息
- [ ] 行動裝置顯示正常

### Admin 管理功能（Phase 2）
- [ ] Admin 後台可查看候補名單
- [ ] 顯示候補者 Email、備註、加入時間
- [ ] 提供「快速加開配額」按鈕
- [ ] 匯出候補名單 CSV 功能

### Email 通知（Phase 3）
- [ ] 加開配額時自動發送 Email 給候補者
- [ ] Email 包含資料包名稱和短網址連結
- [ ] 發送成功後更新候補狀態為 `notified`

---

## 🚧 技術風險評估

### 風險 1：垃圾 Email 濫用
**問題**：惡意用戶大量加入候補名單
**解決**：
- 加入 Email 驗證碼機制
- 限制同一 IP 每小時只能加入 3 次候補
- 提供「取消候補」功能

### 風險 2：Email 送達率
**問題**：通知 Email 可能被視為垃圾郵件
**解決**：
- 使用專業 Email 服務（Resend / SendGrid）
- 設定 SPF / DKIM / DMARC 記錄
- 提供「取消訂閱」連結

### 風險 3：候補人數過多
**問題**：熱門資料包可能有 1000+ 候補
**解決**：
- 限制候補名單上限（例如 500 人）
- 超過上限時提示「候補已滿」
- 提供「追蹤創作者」替代方案

---

## 📊 數據追蹤指標

### 關鍵指標（KPI）
1. **候補轉換率**：候補人數 vs 實際加開後領取人數
2. **加開比例**：有候補的資料包中，實際加開配額的比例
3. **平均候補人數**：每個完結資料包的平均候補數
4. **通知到達率**：Email 發送成功率

### SQL 查詢範例
```sql
-- 候補轉換率
SELECT
  k.keyword,
  COUNT(DISTINCT w.email) as waitlist_count,
  COUNT(DISTINCT CASE WHEN w.status = 'claimed' THEN w.email END) as claimed_count,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN w.status = 'claimed' THEN w.email END) /
        NULLIF(COUNT(DISTINCT w.email), 0), 2) as conversion_rate
FROM keywords k
LEFT JOIN waitlist w ON k.id = w.keyword_id
GROUP BY k.keyword;
```

---

## 🎯 未來擴充方向

### Phase 4: 智慧加開建議
```
💡 系統建議：
目前候補 50 人，建議加開 50-100 份配額
（根據過往數據，預估 70% 會實際領取）
```

### Phase 5: 候補優先級
- VIP 用戶優先通知
- 早加入候補者優先
- 填寫詳細理由者優先

### Phase 6: 候補到期機制
- 加開配額後 7 天內未領取，候補狀態改為 `expired`
- 釋放配額給下一位候補者

---

## 📝 開發時程規劃

| 階段 | 功能 | 預估時間 | 負責人 |
|------|------|----------|--------|
| Phase 1 | 候補表單 + 資料表 | 3 小時 | - |
| Phase 2 | Admin 後台管理 | 3 小時 | - |
| Phase 3 | Email 通知系統 | 2 小時 | - |
| **總計** | | **8 小時** | |

---

## 🤔 待討論問題

1. **候補名單上限是否需要？**
   - 建議：500 人上限（避免濫用）

2. **Email 驗證是否必要？**
   - MVP 階段可暫時不做
   - 若發現濫用再補上

3. **候補者是否可取消候補？**
   - 建議：提供「取消候補」功能
   - 避免 Email 持續接收無用通知

4. **加開配額後，是否限時領取？**
   - 建議：通知後 7 天內有效
   - 超過時間釋放配額

請審核 MVP 標準，確認後即可開始實作！

#### 介面設計
```
┌─────────────────────────────────────┐
│  🎉 此資料包已領取完畢               │
│                                     │
│  📦 測試資料包                       │
│  ✅ 已發放：100/100 份              │
│  📅 完結時間：2025-10-05 14:30     │
│                                     │
│  💡 想要類似的資料包？               │
│  [👤 追蹤創作者] [🔔 開啟通知]      │
└─────────────────────────────────────┘
```

#### 功能細節
- ✅ 隱藏領取表單
- ✅ 顯示完結狀態卡片
- ✅ 提供「追蹤創作者」功能（未來可通知新資料包）
- ✅ 顯示完結統計資訊
- ❌ 不提供候補機制

#### 優點
- 資訊明確，避免誤導
- 實作簡單，邏輯清晰
- 引導用戶關注創作者（提升黏著度）

#### 缺點
- 無法收集潛在需求
- 錯過的用戶無補救機會

---

### 方案 B：候補排隊模式

#### 介面設計
```
┌─────────────────────────────────────┐
│  ⚠️ 此資料包已領取完畢               │
│                                     │
│  📦 測試資料包                       │
│  ✅ 已發放：100/100 份              │
│  👥 候補名單：12 人                  │
│                                     │
│  💡 加入候補名單（創作者可能加開）   │
│  ┌───────────────────────────────┐ │
│  │ Email: [________________]     │ │
│  │ 備註: [________________]     │ │
│  └───────────────────────────────┘ │
│  [🔔 加入候補] [👤 追蹤創作者]      │
└─────────────────────────────────────┘
```

#### 功能細節
- ✅ 顯示候補人數
- ✅ 簡化表單（只需 Email + 備註）
- ✅ 創作者可在 Admin 後台看到候補名單
- ✅ 創作者可決定是否加開配額
- ✅ 候補者會收到通知 Email

#### 優點
- 提供補救機會
- 收集真實需求數據
- 創作者可彈性調整配額

#### 缺點
- 實作複雜度較高
- 需額外資料表（waitlist）
- 需 Email 通知機制

---

### 方案 C：智慧引導模式（折衷）

#### 介面設計
```
┌─────────────────────────────────────┐
│  🎉 此資料包已領取完畢               │
│                                     │
│  📦 測試資料包                       │
│  ✅ 已發放：100/100 份              │
│                                     │
│  💡 您可能也感興趣：                 │
│  ┌─────────────────────────────┐   │
│  │ 📦 類似資料包 A (剩 20 份)   │   │
│  │ 📦 類似資料包 B (剩 5 份)    │   │
│  └─────────────────────────────┘   │
│                                     │
│  [🔔 通知我類似資料包]              │
│  [👤 追蹤此創作者]                  │
└─────────────────────────────────────┘
```

#### 功能細節
- ✅ 隱藏表單
- ✅ 推薦同創作者的其他資料包
- ✅ 提供「關鍵字訂閱」功能
- ❌ 不提供候補機制

#### 優點
- 將流量導向其他資料包
- 提升平台整體轉換率
- 降低用戶失落感

#### 缺點
- 需要推薦演算法
- 實作複雜度中等

---

## 🗳️ 方案比較表

| 項目 | 方案 A | 方案 B | 方案 C |
|------|--------|--------|--------|
| 實作難度 | ⭐ 簡單 | ⭐⭐⭐ 複雜 | ⭐⭐ 中等 |
| 用戶體驗 | ⭐⭐⭐ 清晰 | ⭐⭐⭐⭐ 貼心 | ⭐⭐⭐ 引導性強 |
| 需求收集 | ❌ 無 | ✅ 完整 | ⭐ 間接 |
| 平台價值 | ⭐⭐ 低 | ⭐⭐⭐⭐ 高 | ⭐⭐⭐ 中 |
| 開發時間 | 2 小時 | 8 小時 | 5 小時 |

---

## 💡 建議實作順序

### Phase 1（立即實作）：方案 A
先快速解決「領完還能填表單」的矛盾問題。

```tsx
// Box.tsx 修改重點
if (keyword.current_count >= keyword.quota) {
  return <CompletedPackageCard keyword={keyword} />;
}
```

### Phase 2（未來規劃）：方案 B 或 C
根據實際使用情況決定是否需要候補功能。

---

## 🛠️ 技術實作細節（方案 A）

### 1. 新增 `CompletedPackageCard` 組件

```tsx
interface CompletedPackageCardProps {
  keyword: Keyword;
}

export function CompletedPackageCard({ keyword }: CompletedPackageCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            🎉
          </div>
          <div>
            <h2 className="text-2xl font-bold">{keyword.keyword}</h2>
            <p className="text-muted-foreground">此資料包已領取完畢</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-secondary/30 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              ✅ 已發放：{keyword.current_count}/{keyword.quota} 份
            </p>
            <p className="text-sm text-muted-foreground">
              📅 完結時間：{formatDate(keyword.updated_at)}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              👤 追蹤創作者
            </Button>
            <Button variant="outline" className="flex-1">
              🔔 開啟通知
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 2. 修改 `Box.tsx` 邏輯

```tsx
// 在 Box.tsx 中判斷狀態
const isCompleted = keyword.quota !== null && keyword.current_count >= keyword.quota;

return (
  <div className="min-h-screen p-6">
    {isCompleted ? (
      <CompletedPackageCard keyword={keyword} />
    ) : (
      <ClaimForm keyword={keyword} />
    )}
  </div>
);
```

---

## 📊 數據追蹤（選配）

建議新增以下事件追蹤：

```sql
-- event_logs table
CREATE TABLE event_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(50), -- 'package_completed_view', 'follow_creator', etc.
  user_id UUID REFERENCES auth.users(id),
  keyword_id UUID REFERENCES keywords(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## ✅ 驗收標準（方案 A）

- [ ] 領完的資料包隱藏表單
- [ ] 顯示完結狀態卡片
- [ ] 顯示已發放數量和完結時間
- [ ] 提供「追蹤創作者」按鈕（可先設為 placeholder）
- [ ] 行動裝置顯示正常

---

## 🚀 未來擴充方向

1. **追蹤系統**（Phase 3）
   - 用戶可追蹤創作者
   - 新資料包發佈時通知追蹤者

2. **候補系統**（Phase 4）
   - 實作方案 B
   - Admin 後台顯示候補名單

3. **推薦系統**（Phase 5）
   - 實作方案 C
   - 智慧推薦類似資料包

---

## 📝 討論問題

1. **是否需要候補功能？**
   - 如果創作者習慣「先開少量測試」，候補很有用
   - 如果多數創作者一次開足，候補意義不大

2. **追蹤功能的優先級？**
   - 可提升平台黏著度
   - 需額外實作 followers 系統

3. **是否顯示「已領取用戶數」？**
   - 可增加信任感（這麼多人領過）
   - 可能造成隱私疑慮

請討論後決定優先實作哪個方案！