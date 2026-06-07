/**
 * KeyBox Embed SDK — 一行把「email 換資料包」鑲進任何網站。
 *
 * 安裝：
 *   <script defer src="https://keybox.cc/embed.js" data-box="abc123"></script>
 *
 * 選配屬性：
 *   data-color="#27486f"   主色（按鈕/重點），預設 KeyBox 紫
 *   data-cta="解鎖下載"     按鈕文字
 *
 * 行為：
 * - 讀 GET /api/embed/box 畫鎖定卡片（標題/描述/額度），不碰祕密內容
 * - 解鎖走 POST /api/embed/unlock（server-side 驗證 + email_logs 記錄 + webhook）
 * - localStorage 記會員（per origin）；回訪自動重打 unlock（冪等）→ 直接展開內容
 * - Shadow DOM 隔離樣式，不污染宿主頁面
 */
;(function () {
  const script = document.currentScript as HTMLScriptElement | null
  if (!script) return
  const CODE = script.getAttribute('data-box') || ''
  if (!CODE) return

  const COLOR = script.getAttribute('data-color') || '#7c5cff'
  const CTA = script.getAttribute('data-cta') || '🔓 解鎖領取'
  const BASE = (() => {
    try {
      return new URL(script.getAttribute('src') || '', window.location.href).origin
    } catch {
      return ''
    }
  })()
  const MEMBER_KEY = 'keybox_member'

  type Member = { email: string; name?: string }

  function getMember(): Member | null {
    try {
      const raw = localStorage.getItem(MEMBER_KEY)
      if (!raw) return null
      const m = JSON.parse(raw)
      return m && typeof m.email === 'string' && m.email.includes('@') ? m : null
    } catch {
      return null
    }
  }

  function saveMember(m: Member) {
    try {
      localStorage.setItem(MEMBER_KEY, JSON.stringify(m))
    } catch {
      /* private mode etc. — degrade to per-visit */
    }
  }

  // ── mount point + shadow root ───────────────────────────────
  const host = document.createElement('div')
  host.setAttribute('data-keybox', CODE)
  script.parentNode?.insertBefore(host, script.nextSibling)
  const root = host.attachShadow({ mode: 'open' })

  const style = document.createElement('style')
  style.textContent = `
    .kb { font-family: 'Noto Sans TC', -apple-system, 'Segoe UI', sans-serif; background:#fff; border:1px solid #e7e5e4; border-radius:14px; padding:24px; box-shadow:0 6px 24px rgba(20,30,50,.06); color:#1c1917; line-height:1.7; }
    .kb-title { font-weight:900; font-size:1.15rem; margin:0 0 4px; }
    .kb-desc { color:#78716c; font-size:.9rem; margin:0 0 14px; white-space:pre-line; }
    .kb-meta { font-size:.78rem; color:#a8a29e; margin-bottom:12px; }
    .kb-form { display:flex; flex-direction:column; gap:9px; }
    .kb-input { width:100%; box-sizing:border-box; padding:11px 14px; border:1px solid #d6d3d1; border-radius:10px; font-size:.95rem; font-family:inherit; outline:none; }
    .kb-input:focus { border-color:${COLOR}; }
    .kb-btn { width:100%; box-sizing:border-box; background:${COLOR}; color:#fff; border:none; cursor:pointer; font-weight:900; font-size:1rem; padding:12px; border-radius:100px; font-family:inherit; }
    .kb-btn:disabled { opacity:.6; cursor:default; }
    .kb-note { text-align:center; color:#a8a29e; font-size:.72rem; margin:10px 0 0; }
    .kb-error { color:#dc2626; font-size:.85rem; margin-top:8px; display:none; }
    .kb-content { white-space:pre-wrap; word-break:break-word; font-size:.95rem; background:#fafaf9; border:1px solid #f0f1f4; border-radius:10px; padding:14px 16px; }
    .kb-content a { color:${COLOR}; font-weight:700; }
    .kb-ok { font-size:.85rem; color:${COLOR}; font-weight:700; margin-bottom:8px; }
    .kb-brand { text-align:right; margin-top:10px; }
    .kb-brand a { color:#c7c2bd; font-size:.7rem; text-decoration:none; }
    .kb-skel { height:88px; display:flex; align-items:center; justify-content:center; color:#a8a29e; font-size:.85rem; }
  `
  root.appendChild(style)

  const card = document.createElement('div')
  card.className = 'kb'
  card.innerHTML = '<div class="kb-skel">資料包載入中…</div>'
  root.appendChild(card)

  function esc(s: string): string {
    return String(s == null ? '' : s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string))
  }

  // bare-URL lines → clickable links；其他行原樣
  function linkify(text: string): string {
    return esc(text).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
  }

  function renderContent(content: string, welcomeBack: boolean) {
    card.innerHTML = `
      <div class="kb-ok">${welcomeBack ? '🔓 歡迎回來，已為你自動解鎖' : '🔓 解鎖成功！'}</div>
      <div class="kb-content">${linkify(content)}</div>
      <div class="kb-brand"><a href="${esc(BASE)}" target="_blank" rel="noopener">🔑 Powered by KeyBox</a></div>
    `
  }

  async function unlock(payload: { email: string; name?: string; keyword?: string }): Promise<{ ok: boolean; content?: string; welcomeBack?: boolean; error?: string }> {
    try {
      const r = await fetch(`${BASE}/api/embed/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: CODE, ...payload }),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) return { ok: false, error: data.error || '解鎖失敗，請稍後再試' }
      return { ok: true, content: data.content, welcomeBack: !!data.welcomeBack }
    } catch {
      return { ok: false, error: '連線失敗，請稍後再試' }
    }
  }

  function renderForm(box: any) {
    const needKeyword = box.unlockMode === 'keyword'
    const quotaLine = box.quota ? `已領取 ${box.claimed}/${box.quota}` : ''
    card.innerHTML = `
      ${box.title ? `<p class="kb-title">📦 ${esc(box.title)}</p>` : ''}
      ${box.description ? `<p class="kb-desc">${esc(box.description)}</p>` : ''}
      ${quotaLine ? `<p class="kb-meta">${esc(quotaLine)}</p>` : ''}
      <form class="kb-form">
        <input class="kb-input" name="name" type="text" placeholder="你的名字" required>
        <input class="kb-input" name="email" type="email" placeholder="you@example.com" required>
        ${needKeyword ? '<input class="kb-input" name="keyword" type="text" placeholder="關鍵字" required>' : ''}
        <button class="kb-btn" type="submit">${esc(CTA)}</button>
      </form>
      <p class="kb-error"></p>
      <p class="kb-note">填一次，之後的免費資源都自動解鎖。不亂發信。</p>
      <div class="kb-brand"><a href="${esc(BASE)}" target="_blank" rel="noopener">🔑 Powered by KeyBox</a></div>
    `
    const form = card.querySelector('form') as HTMLFormElement
    const errEl = card.querySelector('.kb-error') as HTMLElement
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      const fd = new FormData(form)
      const email = String(fd.get('email') || '').trim()
      const name = String(fd.get('name') || '').trim()
      const keyword = String(fd.get('keyword') || '').trim()
      if (!email.includes('@') || !name) return
      const btn = form.querySelector('button') as HTMLButtonElement
      btn.disabled = true
      btn.textContent = '處理中…'
      const r = await unlock({ email, name, ...(needKeyword ? { keyword } : {}) })
      if (r.ok) {
        saveMember({ email, name })
        renderContent(r.content || '', !!r.welcomeBack)
      } else {
        btn.disabled = false
        btn.textContent = CTA
        errEl.textContent = r.error || '解鎖失敗'
        errEl.style.display = 'block'
      }
    })
  }

  function renderClosed(box: any) {
    card.innerHTML = `
      ${box.title ? `<p class="kb-title">📦 ${esc(box.title)}</p>` : ''}
      <p class="kb-desc">${box.expired ? '此資料包已過期。' : '此資料包已額滿。'}</p>
      <div class="kb-brand"><a href="${esc(BASE)}" target="_blank" rel="noopener">🔑 Powered by KeyBox</a></div>
    `
  }

  async function init() {
    let box: any
    try {
      const r = await fetch(`${BASE}/api/embed/box?code=${encodeURIComponent(CODE)}`)
      if (!r.ok) throw new Error(String(r.status))
      box = await r.json()
    } catch {
      card.innerHTML = '<div class="kb-skel">資料包載入失敗</div>'
      return
    }

    // 回訪會員 + email 模式 → 直接冪等解鎖（server 驗證、有 email_logs 才回內容）
    const member = getMember()
    if (member && box.unlockMode === 'email' && !box.expired) {
      const r = await unlock({ email: member.email, name: member.name })
      if (r.ok) return renderContent(r.content || '', true)
    }

    if (box.expired || box.full) return renderClosed(box)
    renderForm(box)
  }

  init()
})()
