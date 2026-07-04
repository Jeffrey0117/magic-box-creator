// POST /api/webhooks/paygate
// PayGate subscription webhook → 更新 user_profiles.membership_tier
// 事件: subscription.activated → 升級為方案 tier；expired / cancelled → 降回 free
import crypto from 'node:crypto'
import { getServiceClient } from '../_lib/embed.js'

// HMAC 驗簽需要原始 body，關掉 Vercel 內建 JSON parser
export const config = { api: { bodyParser: false } }

const VALID_TIERS = new Set(['free', 'standard', 'premium'])

function readRawBody(req: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function verifySignature(body: Buffer, signature: string, secret: string): boolean {
  if (!signature.startsWith('sha256=')) return false
  const calculated = crypto.createHmac('sha256', secret).update(body).digest('hex')
  const provided = signature.slice(7)
  if (provided.length !== calculated.length) return false
  return crypto.timingSafeEqual(Buffer.from(calculated, 'hex'), Buffer.from(provided, 'hex'))
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' })

  const secret = process.env.PAYGATE_WEBHOOK_SECRET
  if (!secret) {
    console.error('[paygate-webhook] PAYGATE_WEBHOOK_SECRET not configured')
    return res.status(500).json({ error: 'webhook not configured' })
  }

  try {
    const body = await readRawBody(req)
    const signature = String(req.headers['x-webhook-signature'] || '')

    if (!verifySignature(body, signature, secret)) {
      return res.status(401).json({ error: 'invalid signature' })
    }

    const { event, data } = JSON.parse(body.toString('utf8'))
    const sub = data?.subscription || {}
    const plan = data?.plan || {}
    const email = String(sub.email || '').trim().toLowerCase()
    if (!email) return res.status(400).json({ error: 'missing email' })

    const supabase = getServiceClient()

    // email → auth user id（SECURITY DEFINER RPC，僅 service_role 可呼叫）
    const { data: userId, error: rpcError } = await supabase.rpc('get_user_id_by_email', {
      user_email: email,
    })
    if (rpcError) throw rpcError
    if (!userId) {
      // 付款 email 找不到對應帳號：回 200 避免重試轟炸，記 log 供人工對帳
      console.warn(`[paygate-webhook] no user for email: ${email} (event: ${event})`)
      return res.status(200).json({ success: true, matched: false })
    }

    let tier = 'free'
    if (event === 'subscription.activated') {
      const t = String(sub.tier || plan.tier || '').toLowerCase()
      tier = VALID_TIERS.has(t) ? t : 'free'
    } else if (event !== 'subscription.expired' && event !== 'subscription.cancelled') {
      return res.status(200).json({ success: true, ignored: event })
    }

    const { error: updateError } = await supabase
      .from('user_profiles')
      .upsert({ id: userId, membership_tier: tier, updated_at: new Date().toISOString() })
    if (updateError) throw updateError

    console.log(`[paygate-webhook] ${event}: ${email} → ${tier}`)
    return res.status(200).json({ success: true, tier })
  } catch (err: any) {
    console.error('[paygate-webhook]', err?.message || err)
    return res.status(500).json({ error: 'internal error' })
  }
}
