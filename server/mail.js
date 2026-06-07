// 資料包寄送 — 走同機 mailer（localhost:4018），自架的核心紅利
const MAILER_URL = process.env.MAILER_URL || 'http://localhost:4018/api/send';
const FROM = process.env.KEYBOX_FROM || 'KeyBox <noreply@isnowfriend.com>';

function esc(s) {
  return String(s == null ? '' : s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
}

function linkify(text) {
  return esc(text).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#7c5cff;font-weight:700;">$1</a>');
}

/** 把 box 內容包成一封品牌信。回傳 true = mailer 收件成功。 */
async function sendBoxEmail(box, email, name) {
  const greet = name ? `${esc(name)}，` : '';
  const html = `<div style="font-family:'Noto Sans TC',Arial,sans-serif;max-width:560px;margin:0 auto;color:#1c1917;line-height:1.9">
    <h2 style="color:#7c5cff;margin:0 0 4px">📦 ${esc(box.title || '你的資料包')}</h2>
    ${box.description ? `<p style="color:#78716c;font-size:14px;margin:0 0 18px;white-space:pre-line">${esc(box.description)}</p>` : ''}
    <p>${greet}這是你領取的資源：</p>
    <div style="background:#fafaf9;border:1px solid #eee;border-radius:10px;padding:16px 18px;white-space:pre-wrap;word-break:break-word">${linkify(box.content)}</div>
    <p style="color:#78716c;font-size:13px;margin-top:22px">這封信可以收藏，連結不會過期。</p>
  </div>`;
  try {
    const r = await fetch(MAILER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: email, from: FROM, subject: `📦 ${box.title || '你的資料包'} — 資源在這裡`, html }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

module.exports = { sendBoxEmail };
