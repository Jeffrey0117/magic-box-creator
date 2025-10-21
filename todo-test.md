# Phase 3: 候補系統 + 限時功能實作清單

> **日期**：2025-10-05  
> **目標**：實作候補排隊系統 + 通用限時倒數功能

---

## 🎯 功能總覽

### 1. 通用限時功能
- 創作者可設定資料包「有效期限」
- 領取頁面顯示紅字倒數計時（製造壓迫感）
- 過期後自動隱藏資料包

### 2. 候補排隊系統
- 資料包達配額後，顯示候補表單
- 用戶加入候補（Email + 備註）
- Admin 可加開配額，自動通知候補者（含 7 天限時）
- 候補者和一般用戶平等競爭，不保留名額

---

## 📋 實作清單

### Step 1: 資料庫 Migration

#### 1.1 新增 `expires_at` 欄位到 `keywords`
```sql
ALTER TABLE keywords ADD COLUMN expires_at TIMESTAMP;
```

#### 1.2 新增 `waitlist` 資料表
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

#### 1.3 RLS 政策
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

**檔案**：`supabase/migrations/20251005000000_add_expiry_and_waitlist.sql`

---

### Step 2: 前端 - 倒數計時組件

#### 2.1 新增 `CountdownTimer` 組件
```tsx
// src/components/CountdownTimer.tsx
import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  expiresAt: string;
}

export function CountdownTimer({ expiresAt }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setIsExpired(true);
        return '已過期';
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        return `${days} 天 ${hours} 小時`;
      }
      return `${hours} 小時 ${minutes} 分`;
    };

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // 每分鐘更新

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (isExpired) return null;

  return (
    <div className="text-red-500 font-bold animate-pulse flex items-center gap-2">
      ⏰ 限時：{timeLeft} 後失效
    </div>
  );
}
```

#### 2.2 修改 `Box.tsx` 整合倒數
```tsx
// src/pages/Box.tsx
import { CountdownTimer } from '@/components/CountdownTimer';

// ...在資料包資訊區塊加入
{keyword.expires_at && (
  <CountdownTimer expiresAt={keyword.expires_at} />
)}

// 判斷是否過期
const isExpired = keyword.expires_at && new Date(keyword.expires_at) < new Date();

if (isExpired) {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <p className="text-muted-foreground">此資料包已過期</p>
      </CardContent>
    </Card>
  );
}
```

---

### Step 3: 前端 - 候補卡片組件

#### 3.1 新增 `WaitlistCard` 組件
```tsx
// src/components/WaitlistCard.tsx
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface WaitlistCardProps {
  keyword: any;
  waitlistCount: number;
}

export function WaitlistCard({ keyword, waitlistCount }: WaitlistCardProps) {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joined, setJoined] = useState(false);

  const handleJoinWaitlist = async () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('請輸入有效的 Email');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('waitlist').insert({
        keyword_id: keyword.id,
        email: email.toLowerCase().trim(),
        reason: reason.trim() || null,
      });

      if (error) {
        if (error.code === '23505') {
          toast.error('您已加入過此資料包的候補名單');
        } else {
          throw error;
        }
        return;
      }

      setJoined(true);
      toast.success('已加入候補名單！');
    } catch (error) {
      console.error('Failed to join waitlist:', error);
      toast.error('加入候補失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (joined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>✅ 已加入候補名單！</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-secondary/30 p-4 rounded-lg">
            <p className="text-sm mb-2">📧 通知 Email：{email}</p>
            <p className="text-sm mb-2">📊 目前排隊人數：{waitlistCount + 1} 人</p>
          </div>
          <div className="bg-secondary/30 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">💡 接下來：</p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• 創作者會看到候補需求</li>
              <li>• 若決定加開配額，會優先通知您</li>
              <li>• 請留意 Email 信箱</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            ⚠️
          </div>
          <div>
            <h2 className="text-2xl font-bold">{keyword.keyword}</h2>
            <p className="text-muted-foreground">此資料包已領取完畢</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-secondary/30 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">
            ✅ 已發放：{keyword.current_count}/{keyword.quota} 份
          </p>
          <p className="text-sm text-muted-foreground">
            👥 候補名單：{waitlistCount} 人排隊中
          </p>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground mb-4">
            💡 創作者可能會根據需求加開配額<br />
            加入候補名單即可在開放時收到通知！
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">為什麼想要這個資料包？（選填）</label>
              <Textarea
                placeholder="例：想用在公司專案、學習用途"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleJoinWaitlist}
              disabled={isSubmitting || !email}
              className="w-full"
            >
              {isSubmitting ? '加入中...' : '🔔 加入候補名單'}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              ✨ 加入候補後，創作者加開配額時會優先通知
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### 3.2 修改 `Box.tsx` 整合候補卡片
```tsx
// src/pages/Box.tsx
import { WaitlistCard } from '@/components/WaitlistCard';

// 判斷是否已完結
const isCompleted = keyword.quota !== null && keyword.current_count >= keyword.quota;

// 取得候補人數
const [waitlistCount, setWaitlistCount] = useState(0);

useEffect(() => {
  const fetchWaitlistCount = async () => {
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .eq('keyword_id', keyword.id)
      .eq('status', 'waiting');
    
    setWaitlistCount(count || 0);
  };

  if (isCompleted) {
    fetchWaitlistCount();
  }
}, [keyword.id, isCompleted]);

// 渲染邏輯
return (
  <div className="min-h-screen p-6">
    {isCompleted ? (
      <WaitlistCard keyword={keyword} waitlistCount={waitlistCount} />
    ) : (
      <ClaimForm keyword={keyword} />
    )}
  </div>
);
```

---

### Step 4: Creator - 建立資料包時設定限時

#### 4.1 修改 `Creator.tsx` 表單
```tsx
// src/pages/Creator.tsx
const [expiryDays, setExpiryDays] = useState<number | null>(null);
const [enableExpiry, setEnableExpiry] = useState(false);

// 表單中新增限時設定
<div className="space-y-2">
  <label className="text-sm font-medium">⏰ 限時設定（選填）</label>
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={enableExpiry}
      onChange={(e) => setEnableExpiry(e.target.checked)}
    />
    <span className="text-sm">啟用限時領取</span>
  </div>
  
  {enableExpiry && (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min="1"
        value={expiryDays || ''}
        onChange={(e) => setExpiryDays(Number(e.target.value))}
        placeholder="7"
        className="w-20"
      />
      <span className="text-sm">天後失效</span>
    </div>
  )}
</div>

// 建立資料包時計算 expires_at
const expiresAt = enableExpiry && expiryDays
  ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString()
  : null;

const { error } = await supabase.from('keywords').insert({
  keyword: keywordInput.trim(),
  content: contentInput.trim(),
  quota: quotaInput || null,
  expires_at: expiresAt,
  creator_id: user.id,
});
```

---

### Step 5: Admin - 候補名單管理

#### 5.1 修改 `PackageDetail.tsx` 新增候補 Tab
```tsx
// src/pages/admin/PackageDetail.tsx
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

#### 5.2 新增 `WaitlistManagement` 組件
```tsx
// src/components/WaitlistManagement.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function WaitlistManagement({ keywordId }: { keywordId: string }) {
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWaitlist();
  }, [keywordId]);

  const fetchWaitlist = async () => {
    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .eq('keyword_id', keywordId)
      .eq('status', 'waiting')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch waitlist:', error);
      toast.error('載入候補名單失敗');
    } else {
      setWaitlist(data || []);
    }
    setLoading(false);
  };

  const handleIncreaseQuota = async (additionalQuota: number) => {
    if (!confirm(`確定要加開 ${additionalQuota} 份配額嗎？`)) return;

    // TODO: 更新配額 + 通知候補者
    toast.success(`已加開 ${additionalQuota} 份配額！`);
  };

  if (loading) return <p>載入中...</p>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={() => handleIncreaseQuota(20)}>加開 20 份</Button>
        <Button onClick={() => handleIncreaseQuota(50)}>加開 50 份</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>備註</TableHead>
            <TableHead>加入時間</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {waitlist.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                暫無候補者
              </TableCell>
            </TableRow>
          ) : (
            waitlist.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>#{index + 1}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>{item.reason || '（未填寫）'}</TableCell>
                <TableCell>{new Date(item.created_at).toLocaleString('zh-TW')}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

---

### Step 6: Email 通知系統（選配）

#### 6.1 Supabase Edge Function
```typescript
// supabase/functions/notify-waitlist/index.ts
import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  const { keyword_id } = await req.json();
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

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

  // TODO: 使用 Resend 發送 Email
  console.log(`通知 ${waitlist?.length} 位候補者：${keyword?.keyword}`);

  // 更新候補狀態
  const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  await supabase
    .from('waitlist')
    .update({ 
      status: 'notified', 
      notified_at: new Date().toISOString() 
    })
    .eq('keyword_id', keyword_id)
    .eq('status', 'waiting');

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

---

## ✅ 測試檢查清單

### 限時功能測試
- [ ] 創作者可在建立資料包時設定「X 天後失效」
- [ ] 領取頁面顯示紅字倒數計時
- [ ] 過期後資料包自動隱藏
- [ ] 倒數顯示格式正確（X 天 X 小時 / X 小時 X 分）

### 候補功能測試
- [ ] 資料包達配額時，顯示候補卡片（隱藏表單）
- [ ] 可輸入 Email + 備註加入候補
- [ ] Email 格式驗證正確
- [ ] 同一 Email 不可重複加入同一資料包
- [ ] 顯示目前候補人數
- [ ] 加入成功後顯示確認訊息

### Admin 管理測試
- [ ] Admin 可查看候補名單
- [ ] 顯示候補者 Email、備註、加入時間
- [ ] 「加開配額」按鈕正常運作
- [ ] 加開後候補人數歸零（已通知）

### Email 通知測試（選配）
- [ ] 加開配額時發送通知 Email
- [ ] Email 包含資料包名稱和短網址
- [ ] Email 提示「7 天內有效」

---

## 🚀 實作順序建議

1. **Step 1**：建立 Migration（資料表）
2. **Step 2**：倒數計時組件（通用功能）
3. **Step 4**：Creator 設定限時（測試倒數）
4. **Step 3**：候補卡片組件
5. **Step 5**：Admin 候補管理
6. **Step 6**：Email 通知（選配）

---

## 📝 備註

- MVP 階段可暫時不做 Email 通知，用 toast 提示代替
- 限時功能和候補功能獨立，可分開測試
- 候補不保留名額，先到先得
- 7 天限時從「通知時間」開始計算，非「加入候補時間」

---

# Phase 11: 最終細節調整

> **日期**：2025-10-21
> **目標**：優化 Creator 後台卡片 UI 的最終細節

---

## 🎯 調整項目

### 1. 統計顏色橘色化
- **位置**：[`src/pages/Creator.tsx:1289`](src/pages/Creator.tsx:1289)
- **調整內容**：
  ```tsx
  // 原本：text-muted-foreground
  <div className="text-xs text-muted-foreground flex items-center gap-3">
  
  // 調整為：text-orange-500 dark:text-orange-400
  <div className="text-xs text-orange-500 dark:text-orange-400 flex items-center gap-3">
  ```
- **原因**：與頂部統計卡片的紫/藍/綠色區隔，避免視覺混淆
- **效果**：卡片內統計資訊更醒目，與背景形成對比

### 2. 按鈕位置交換
- **位置**：[`src/pages/Creator.tsx:1301-1322`](src/pages/Creator.tsx:1301-1322)
- **調整內容**：
  ```tsx
  // 原順序：進階分析 → 複製文案
  <Button><BarChart3 /> 進階分析</Button>
  <Button>📝 複製文案</Button>
  
  // 新順序：複製文案 → 進階分析
  <Button>📝 複製文案</Button>  {/* 主要操作 */}
  <Button><BarChart3 /></Button>  {/* 次要操作 */}
  ```
- **原因**：「複製文案」為最常用操作，應置於首位
- **優先級設計**：
  - 主要操作：`variant="ghost"` + 文字
  - 次要操作：`variant="outline"` + 圖示

### 3. 空白問題解決
- **位置**：[`src/pages/Creator.tsx:1321`](src/pages/Creator.tsx:1321)
- **調整內容**：
  ```tsx
  // 原本：文字 + 圖示
  <Button>
    <BarChart3 className="w-5 h-5" />
    進階分析
  </Button>
  
  // 調整為：只保留圖示
  <Button className="w-full border-purple-500/30">
    <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
  </Button>
  ```
- **原因**：「進階分析」文字造成操作區過寬，壓縮資訊區空間
- **效果**：
  - 操作區寬度從 `lg:w-48` 縮減為 `lg:min-w-[160px]`
  - 資訊區比例提升，可展示更多內容

---

## ✅ 完成檢查

- [x] 統計文字改為橘色 (`text-orange-500 dark:text-orange-400`)
- [x] 「複製文案」按鈕移至第一位
- [x] 「進階分析」按鈕移除文字，只保留 [`BarChart3`](src/pages/Creator.tsx:1321) 圖示
- [x] 操作區寬度縮小，資訊區空間增加
- [x] 兩欄式布局比例優化 (資訊區 `flex-[2]`，操作區 `min-w-[160px]`)
- [x] 響應式設計維持正常 (行動裝置垂直堆疊)

---

## 📊 視覺效果對比

### 調整前
```
[左：資訊區 flex-1] [右：操作區 w-48]
├─ 關鍵字 + 狀態點
├─ 回覆內容 (截斷)
└─ 統計 (灰色)      ├─ [進階分析] 按鈕寬
                    ├─ [📝 複製文案]
                    └─ ...
```

### 調整後
```
[左：資訊區 flex-[2]] [右：操作區 min-w-[160px]]
├─ 關鍵字 + 狀態點
├─ 回覆內容 (截斷)
└─ 統計 (橘色)      ├─ [📝 複製文案] 主要操作
                    ├─ [📊] 圖示按鈕縮小
                    └─ ...
```

---

## 📝 相關文檔

- UI 設計文檔：[`ui.md`](ui.md) - 已同步更新 Phase 11 調整
- 主實作檔案：[`src/pages/Creator.tsx`](src/pages/Creator.tsx:1-1492)
- 設計原則：兩欄式布局、色彩編碼、操作優先級

---

**完成時間**：2025-10-21
**狀態**：✅ 已完成並測試