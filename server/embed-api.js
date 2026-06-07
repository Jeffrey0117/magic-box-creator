// 公開 embed API — box meta + unlock（驗證/配額/防刷/領取記錄/寄送/webhook 全在 server）
const crypto = require('crypto');
const { getDb, newId } = require('./db');
const { checkEmail } = require('./guard');
const { sendBoxEmail } = require('./mail');

function isExpired(box) {
  return !!box.expires_at && new Date(box.expires_at).getTime() < Date.now();
}

function claimCount(boxId) {
  return getDb().prepare('SELECT COUNT(*) n FROM claims WHERE box_id = ?').get(boxId).n;
}

function isFull(box) {
  return !!box.quota && claimCount(box.id) >= box.quota;
}

// 簡易防刷：同 IP+box 一分鐘最多 10 次嘗試（claims UNIQUE 擋重複領取，這裡擋掃射）
const buckets = new Map();
function rateLimit(key, max, windowMs) {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now - entry.start > windowMs) {
    buckets.set(key, { start: now, count: 1 });
    return true;
  }
  entry.count += 1;
  return entry.count <= max;
}
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) {
    if (now - v.start > 60 * 1000) buckets.delete(k);
  }
}, 60 * 1000).unref();

function matchKeyword(box, provided) {
  const ok = String(box.keyword || '').toLowerCase().trim() === String(provided || '').toLowerCase().trim();
  return ok ? { ok } : { ok: false, error: '關鍵字錯誤，請重新輸入' };
}

// 解鎖成功 → 通知名單系統（HMAC，fire-and-forget — 常駐進程不用 await 完）
function fireWebhook(box, payload) {
  if (!box.webhook_url) return;
  try {
    const body = JSON.stringify(payload);
    const headers = { 'Content-Type': 'application/json' };
    if (box.webhook_secret) {
      headers['x-keybox-signature'] = 'sha256=' + crypto.createHmac('sha256', box.webhook_secret).update(body).digest('hex');
    }
    fetch(box.webhook_url, { method: 'POST', headers, body, signal: AbortSignal.timeout(5000) }).catch(() => {});
  } catch { /* webhook 永不影響解鎖 */ }
}

function getBoxMeta(code) {
  const db = getDb();
  const box = db.prepare('SELECT * FROM boxes WHERE short_code = ?').get(code);
  if (!box) return { status: 404, data: { error: 'box not found' } };
  return {
    status: 200,
    data: {
      code: box.short_code,
      title: box.title || '',
      description: box.description || '',
      image: null,
      unlockMode: box.unlock_mode === 'email' ? 'email' : 'keyword',
      delivery: box.delivery || 'instant',
      requireNickname: false,
      full: isFull(box),
      expired: isExpired(box),
      quota: box.quota || null,
      claimed: claimCount(box.id),
    },
  };
}

async function unlock(body, clientIp, host) {
  const code = String(body.code || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim().slice(0, 80);
  const keyword = String(body.keyword || '').trim();

  if (!code) return { status: 400, data: { error: 'code is required' } };

  const db = getDb();
  const box = db.prepare('SELECT * FROM boxes WHERE short_code = ?').get(code);
  if (!box) return { status: 404, data: { error: 'box not found' } };
  if (isExpired(box)) return { status: 410, data: { error: '此資料包已過期' } };

  if (!rateLimit(`${clientIp}:${box.id}`, 10, 60 * 1000)) {
    return { status: 429, data: { error: '操作過於頻繁，請稍後再試' } };
  }

  // 回訪會員 → 冪等：instant/both 直接回內容；email 模式告知已寄過（不重寄防濫用）
  const existing = db.prepare('SELECT id FROM claims WHERE box_id = ? AND email = ?').get(box.id, email);
  if (existing) {
    if (box.delivery === 'email') return { status: 200, data: { sent: true, welcomeBack: true } };
    return { status: 200, data: { content: box.content, welcomeBack: true } };
  }

  if (isFull(box)) return { status: 409, data: { error: '此資料包已額滿' } };

  if (box.unlock_mode !== 'email') {
    const m = matchKeyword(box, keyword);
    if (!m.ok) return { status: 403, data: { error: m.error } };
  }

  // 假信箱過濾：格式 + 拋棄式黑名單 + MX
  const emailCheck = await checkEmail(email);
  if (!emailCheck.ok) return { status: 400, data: { error: emailCheck.error } };

  const extra = { source: 'embed' };
  db.prepare('INSERT INTO claims (id, box_id, email, name, host, extra) VALUES (?, ?, ?, ?, ?, ?)').run(
    newId(), box.id, email, name || null, host || null, JSON.stringify(extra)
  );

  fireWebhook(box, {
    event: 'unlock',
    box: { id: box.id, shortCode: box.short_code, title: box.title || '', keyword: box.keyword },
    email,
    name: name || null,
    host: host || null,
    ts: new Date().toISOString(),
  });

  // delivery 三模式
  if (box.delivery === 'email') {
    const sent = await sendBoxEmail(box, email, name);
    if (!sent) {
      // mailer 掛了不能讓使用者空手而回 — 降級成當頁解鎖
      return { status: 200, data: { content: box.content, welcomeBack: false } };
    }
    return { status: 200, data: { sent: true, welcomeBack: false } };
  }
  if (box.delivery === 'both') {
    sendBoxEmail(box, email, name).catch(() => {});
    return { status: 200, data: { content: box.content, sent: true, welcomeBack: false } };
  }
  return { status: 200, data: { content: box.content, welcomeBack: false } };
}

module.exports = { getBoxMeta, unlock };
