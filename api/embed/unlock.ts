// POST /api/embed/unlock  { code, email, name?, keyword? }
// Server-side unlock for the embed SDK: validates keyword/quota/expiry on the server
// (unlike the SPA flow, the secret never reaches the client before validation),
// records the claim in email_logs, returns content, and fires the box webhook.
import { getServiceClient, applyCors, fireWebhook, isExpired, isFull } from '../_lib/embed'

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

function matchKeyword(box: any, provided: string): { ok: boolean; ruleId?: string; error?: string } {
  const values = provided
    .split(/[,\s]+/)
    .map((v) => v.toLowerCase().trim())
    .filter(Boolean)

  if (!box.unlock_rule_enabled) {
    const ok = String(box.keyword || '').toLowerCase().trim() === provided.toLowerCase().trim()
    return ok ? { ok } : { ok: false, error: '關鍵字錯誤，請重新輸入' }
  }

  // Advanced rules (unlock_rule_json; mirrors the SPA logic in Box.tsx)
  const rules: any[] = Array.isArray(box.unlock_rule_json) ? box.unlock_rule_json : []
  const now = Date.now()
  const normalize = (arr: string[]) => (arr || []).map((s) => s.toLowerCase().trim()).filter(Boolean)
  const active = rules.filter((r) => {
    const start = r.startAt ? new Date(r.startAt).getTime() : null
    const end = r.endAt ? new Date(r.endAt).getTime() : null
    return !(start && now < start) && !(end && now > end)
  })
  const hit = active.find((r) => {
    const kws = normalize(r.keywords)
    if (!kws.length) return false
    const mode = String(r.matchMode || 'AND').toUpperCase()
    if (mode === 'AND') return kws.every((k) => values.includes(k))
    if (mode === 'OR') return kws.some((k) => values.includes(k))
    if (mode === 'ORDER') return values.join('|') === kws.join('|')
    return false
  })
  if (!hit) {
    return { ok: false, error: rules.find((r) => r?.errorMessage)?.errorMessage || '關鍵字組合不正確，請重新輸入' }
  }
  return { ok: true, ruleId: hit.id }
}

export default async function handler(req: any, res: any) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' })

  const body = typeof req.body === 'object' && req.body ? req.body : {}
  const code = String(body.code || '').trim()
  const email = String(body.email || '').trim().toLowerCase()
  const name = String(body.name || '').trim().slice(0, 80)
  const keyword = String(body.keyword || '').trim()

  if (!code) return res.status(400).json({ error: 'code is required' })
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'valid email is required' })

  try {
    const supabase = getServiceClient()
    const { data: box, error } = await supabase
      .from('keywords')
      .select('*')
      .eq('short_code', code)
      .maybeSingle()
    if (error) throw error
    if (!box) return res.status(404).json({ error: 'box not found' })
    if (isExpired(box)) return res.status(410).json({ error: '此資料包已過期' })

    // Returning member → idempotent: hand the content back, no new log, no webhook.
    const { data: existing } = await supabase
      .from('email_logs')
      .select('id')
      .eq('keyword_id', box.id)
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      return res.status(200).json({ content: box.content, welcomeBack: true })
    }

    if (isFull(box)) return res.status(409).json({ error: '此資料包已額滿' })

    // keyword check (email-mode boxes skip it entirely)
    let ruleId: string | undefined
    if (box.unlock_mode !== 'email') {
      const m = matchKeyword(box, keyword)
      if (!m.ok) return res.status(403).json({ error: m.error })
      ruleId = m.ruleId
    }

    // anti-abuse: same email + box, max 3 attempts / 10s
    const sinceIso = new Date(Date.now() - 10 * 1000).toISOString()
    const { count: recent } = await supabase
      .from('email_logs')
      .select('*', { count: 'exact', head: true })
      .eq('keyword_id', box.id)
      .eq('email', email)
      .gte('unlocked_at', sinceIso)
    if ((recent || 0) >= 3) return res.status(429).json({ error: '操作過於頻繁，請稍後再試' })

    const host = String(req.headers.origin || req.headers.referer || '').slice(0, 200)
    const extra: Record<string, unknown> = { source: 'embed' }
    if (host) extra.host = host
    if (name) extra.nickname = name
    if (ruleId) extra.rule_id = ruleId

    const { error: insertError } = await supabase.from('email_logs').insert({
      keyword_id: box.id,
      email,
      extra_data: extra,
    })
    if (insertError) throw insertError

    // outbound webhook (HMAC) — lets subscriber systems (e.g. SeedBlog) ingest the lead
    await fireWebhook(box, {
      event: 'unlock',
      box: { id: box.id, shortCode: box.short_code, title: box.package_title || '', keyword: box.keyword },
      email,
      name: name || null,
      host: host || null,
      ts: new Date().toISOString(),
    })

    return res.status(200).json({ content: box.content, welcomeBack: false })
  } catch (err: any) {
    console.error('[embed/unlock]', err?.message || err)
    return res.status(500).json({ error: 'internal error' })
  }
}
