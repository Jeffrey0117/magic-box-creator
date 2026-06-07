// GET /api/embed/health — config probe (booleans only, no secrets)
import { applyCors } from '../_lib/embed.js'

export default async function handler(_req: any, res: any) {
  applyCors(res)
  const hasUrl = !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const hasServiceKey = !!key

  // What kind of key is this? (role claim only — never echo the key itself)
  let keyRole = 'none'
  if (key.startsWith('sb_secret_')) keyRole = 'sb_secret'
  else if (key.startsWith('sb_publishable_')) keyRole = 'sb_publishable (WRONG — this is a public key)'
  else if (key.split('.').length === 3) {
    try {
      keyRole = JSON.parse(Buffer.from(key.split('.')[1], 'base64').toString()).role || 'unknown-jwt'
    } catch { keyRole = 'unparseable-jwt' }
  }

  let dbOk = false
  let claimsReadable = false
  let dbError = ''
  if (hasUrl && hasServiceKey) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)!,
        key,
        { auth: { persistSession: false } }
      )
      const { error } = await supabase.from('keywords').select('id', { head: true, count: 'exact' }).limit(1)
      dbOk = !error
      if (error) dbError = error.message
      // anon keys can INSERT email_logs but not SELECT — this distinguishes them from service_role
      const { error: logsErr, count } = await supabase.from('email_logs').select('id', { head: true, count: 'exact' }).limit(1)
      claimsReadable = !logsErr && count !== null && count > 0
    } catch (e: any) {
      dbError = String(e?.message || e).slice(0, 200)
    }
  }
  return res.status(200).json({ hasUrl, hasServiceKey, keyRole, dbOk, claimsReadable, dbError })
}
