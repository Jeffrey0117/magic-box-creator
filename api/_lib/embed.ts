// Shared helpers for the embed API (Vercel serverless functions).
// Uses the service-role key — server-side only, never shipped to the client.
import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'

export function getServiceClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured')
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

export function applyCors(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

/** Fire the box's outbound webhook (HMAC-SHA256 signed). Await-ed but never throws —
 *  serverless freezes after response, so we must finish before returning. */
export async function fireWebhook(box: { webhook_url?: string | null; webhook_secret?: string | null }, payload: Record<string, unknown>) {
  if (!box.webhook_url) return
  try {
    const body = JSON.stringify(payload)
    const signature = box.webhook_secret
      ? crypto.createHmac('sha256', box.webhook_secret).update(body).digest('hex')
      : ''
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000)
    await fetch(box.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(signature ? { 'x-keybox-signature': `sha256=${signature}` } : {}),
      },
      body,
      signal: controller.signal,
    }).catch(() => {})
    clearTimeout(timer)
  } catch {
    /* webhook is best-effort — never block the unlock */
  }
}

export function isExpired(box: { expires_at?: string | null }) {
  return !!box.expires_at && new Date(box.expires_at).getTime() < Date.now()
}

export function isFull(box: { quota?: number | null; current_count?: number | null }) {
  return !!box.quota && (box.current_count || 0) >= box.quota
}
