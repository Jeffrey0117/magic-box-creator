// 假信箱過濾：格式 → 拋棄式網域黑名單 → MX record 檢查（帶快取）
const dns = require('dns').promises;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// 常見拋棄式信箱網域（精選高頻，不求全 — MX 檢查會接住更多）
const DISPOSABLE = new Set([
  'mailinator.com', 'guerrillamail.com', 'sharklasers.com', '10minutemail.com',
  'tempmail.com', 'temp-mail.org', 'throwawaymail.com', 'yopmail.com',
  'getnada.com', 'maildrop.cc', 'trashmail.com', 'fakeinbox.com',
  'tempinbox.com', 'mailnesia.com', 'mintemail.com', 'mohmal.com',
]);

// domain → { ok, ts }；快取 6 小時，省 DNS 也擋連發
const mxCache = new Map();
const MX_TTL = 6 * 60 * 60 * 1000;

async function hasMx(domain) {
  const cached = mxCache.get(domain);
  if (cached && Date.now() - cached.ts < MX_TTL) return cached.ok;
  let ok = false;
  try {
    const records = await Promise.race([
      dns.resolveMx(domain),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
    ]);
    ok = Array.isArray(records) && records.length > 0;
  } catch (err) {
    // DNS 超時/暫時故障 → 放行（寧可漏擋，不可錯殺真用戶）
    ok = err.message === 'timeout' ? true : false;
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') ok = false;
    else if (err.message !== 'timeout') ok = true;
  }
  mxCache.set(domain, { ok, ts: Date.now() });
  return ok;
}

/** @returns {Promise<{ok: boolean, error?: string}>} */
async function checkEmail(email) {
  if (!EMAIL_RE.test(email)) return { ok: false, error: '請輸入有效的 email' };
  const domain = email.split('@')[1].toLowerCase();
  if (DISPOSABLE.has(domain)) return { ok: false, error: '請使用常用信箱（不收拋棄式信箱）' };
  const mx = await hasMx(domain);
  if (!mx) return { ok: false, error: '這個信箱網域收不到信，檢查一下有沒有打錯？' };
  return { ok: true };
}

module.exports = { checkEmail };
