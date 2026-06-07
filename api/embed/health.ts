// GET /api/embed/health — config probe (booleans only, no secrets)
import { applyCors } from '../_lib/embed'

export default async function handler(_req: any, res: any) {
  applyCors(res)
  const hasUrl = !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
  let dbOk = false
  let dbError = ''
  if (hasUrl && hasServiceKey) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      )
      const { error } = await supabase.from('keywords').select('id', { head: true, count: 'exact' }).limit(1)
      dbOk = !error
      if (error) dbError = error.message
    } catch (e: any) {
      dbError = String(e?.message || e).slice(0, 200)
    }
  }
  return res.status(200).json({ hasUrl, hasServiceKey, dbOk, dbError })
}
