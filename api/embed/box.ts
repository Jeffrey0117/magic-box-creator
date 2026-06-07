// GET /api/embed/box?code=<short_code>
// Public box metadata for the embed widget. Never returns `content` or the secret keyword.
import { getServiceClient, applyCors, isExpired, isFull } from '../_lib/embed'

export default async function handler(req: any, res: any) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' })

  const code = String(req.query.code || '').trim()
  if (!code) return res.status(400).json({ error: 'code is required' })

  try {
    const supabase = getServiceClient()
    const { data: box, error } = await supabase
      .from('keywords')
      .select('id, short_code, package_title, package_description, images, quota, current_count, expires_at, unlock_mode, required_fields')
      .eq('short_code', code)
      .maybeSingle()

    if (error) throw error
    if (!box) return res.status(404).json({ error: 'box not found' })

    return res.status(200).json({
      code: box.short_code,
      title: box.package_title || '',
      description: box.package_description || '',
      image: Array.isArray(box.images) && box.images.length ? box.images[0] : null,
      unlockMode: box.unlock_mode === 'email' ? 'email' : 'keyword',
      requireNickname: !!(box.required_fields as any)?.nickname,
      full: isFull(box),
      expired: isExpired(box),
      quota: box.quota || null,
      claimed: box.current_count || 0,
    })
  } catch (err: any) {
    console.error('[embed/box]', err?.message || err)
    return res.status(500).json({ error: 'internal error' })
  }
}
