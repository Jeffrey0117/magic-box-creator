# 限時功能修正計畫

## 🐛 問題清單

1. **編輯時限時設定會跳掉** - 勾選後再次編輯，限時設定未保留
2. **Box 頁面未顯示倒數計時** - 即使設定了限時，頁面也不顯示
3. **時間單位過於粗糙** - 只能設定「天」，希望可以設定「天 + 分鐘」

## 🔍 問題診斷

### 問題 1：編輯時限時跳掉

**根本原因**：`handleUpdateKeyword()` 每次編輯都重新計算過期時間

**錯誤邏輯** (Creator.tsx:212):
```typescript
const expiresAt = editEnableExpiry && editExpiryDays
  ? new Date(Date.now() + parseInt(editExpiryDays) * 24 * 60 * 60 * 1000).toISOString()
  : null;
```

問題：應該根據「剩餘時間」重新計算，而非「從現在開始」計算

### 問題 2：Box 未顯示倒數

**可能原因**：
- `fetchBoxData()` 有正確 SELECT `expires_at` ✅
- `boxData?.expires_at` 條件判斷正確 ✅
- 最可能：**資料包本身沒有 `expires_at` 值**

### 問題 3：時間單位粗糙

需求：支援「X 天 X 分鐘」

## ✅ 修正方案

### 修正 1：新增「分鐘」輸入框

**新增 State**：
```typescript
const [newExpiryMinutes, setNewExpiryMinutes] = useState("");
const [editExpiryMinutes, setEditExpiryMinutes] = useState("");
```

**修改新增表單**：
```typescript
{enableExpiry && (
  <div className="flex gap-2 items-center">
    <Input type="number" min="0" value={newExpiryDays} ... />
    <span className="text-sm">天</span>
    <Input type="number" min="0" max="1439" value={newExpiryMinutes} ... />
    <span className="text-sm">分鐘後失效</span>
  </div>
)}
```

**修改編輯表單** - 同上

### 修正 2：正確計算過期時間

**`handleAddKeyword()`**：
```typescript
const expiresAt = enableExpiry && (newExpiryDays || newExpiryMinutes)
  ? new Date(Date.now() + (parseInt(newExpiryDays || "0") * 24 * 60 + parseInt(newExpiryMinutes || "0")) * 60 * 1000).toISOString()
  : null;
```

**`handleEdit()`**：
```typescript
if (item.expires_at) {
  setEditEnableExpiry(true);
  const now = new Date().getTime();
  const expiry = new Date(item.expires_at).getTime();
  const minutesLeft = Math.ceil((expiry - now) / (1000 * 60));
  const daysLeft = Math.floor(minutesLeft / (60 * 24));
  const remainingMinutes = minutesLeft % (60 * 24);
  
  setEditExpiryDays(daysLeft.toString());
  setEditExpiryMinutes(remainingMinutes.toString());
}
```

**`handleUpdateKeyword()`**：
```typescript
let expiresAt: string | null = null;

if (editEnableExpiry && (editExpiryDays || editExpiryMinutes)) {
  const days = parseInt(editExpiryDays || "0");
  const minutes = parseInt(editExpiryMinutes || "0");
  const totalMs = (days * 24 * 60 + minutes) * 60 * 1000;
  expiresAt = new Date(Date.now() + totalMs).toISOString();
}
```

### 修正 3：改善倒數顯示

**CountdownTimer.tsx**：
```typescript
if (days > 0) {
  return `剩餘 ${days} 天 ${hours} 小時 ${minutes} 分鐘`;
} else if (hours > 0) {
  return `剩餘 ${hours} 小時 ${minutes} 分鐘`;
} else {
  return `剩餘 ${minutes} 分鐘`;
}
```

## 📋 實施步驟

1. ✅ 撰寫修正計畫 (fix.md)
2. ⏳ 修正 Creator.tsx
3. ⏳ 改善 CountdownTimer.tsx
4. ⏳ 測試完整流程
5. ⏳ Commit + Push