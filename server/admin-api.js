// 管理 API（Bearer KEYBOX_TOKEN）— box CRUD + 領取帳本查詢
const { getDb, newId } = require('./db');

const ALLOWED_FIELDS = [
  'short_code', 'keyword', 'title', 'description', 'content',
  'unlock_mode', 'delivery', 'quota', 'expires_at', 'webhook_url', 'webhook_secret',
];

function listBoxes() {
  const db = getDb();
  const boxes = db.prepare(`
    SELECT b.*, (SELECT COUNT(*) FROM claims c WHERE c.box_id = b.id) AS claimed
    FROM boxes b ORDER BY b.created_at DESC
  `).all();
  return { status: 200, data: { boxes } };
}

function createBox(body) {
  if (!body.short_code || !body.content) {
    return { status: 400, data: { error: 'short_code and content are required' } };
  }
  if (body.unlock_mode !== 'email' && !body.keyword) {
    return { status: 400, data: { error: 'keyword is required unless unlock_mode is email' } };
  }
  const db = getDb();
  const id = newId();
  try {
    db.prepare(`
      INSERT INTO boxes (id, short_code, keyword, title, description, content, unlock_mode, delivery, quota, expires_at, webhook_url, webhook_secret)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      String(body.short_code).trim(),
      body.keyword || '',
      body.title || '',
      body.description || '',
      body.content,
      body.unlock_mode === 'email' ? 'email' : 'keyword',
      ['instant', 'email', 'both'].includes(body.delivery) ? body.delivery : 'instant',
      body.quota || null,
      body.expires_at || null,
      body.webhook_url || null,
      body.webhook_secret || null
    );
  } catch (err) {
    if (err.message.includes('UNIQUE')) return { status: 409, data: { error: 'short_code already exists' } };
    throw err;
  }
  return { status: 201, data: { id, short_code: body.short_code } };
}

function updateBox(id, body) {
  const db = getDb();
  const fields = [];
  const values = [];
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(body[key]);
    }
  }
  if (!fields.length) return { status: 400, data: { error: 'no fields to update' } };
  fields.push("updated_at = datetime('now')");
  const result = db.prepare(`UPDATE boxes SET ${fields.join(', ')} WHERE id = ?`).run(...values, id);
  if (!result.changes) return { status: 404, data: { error: 'box not found' } };
  return { status: 200, data: { id, updated: true } };
}

function deleteBox(id) {
  const result = getDb().prepare('DELETE FROM boxes WHERE id = ?').run(id);
  if (!result.changes) return { status: 404, data: { error: 'box not found' } };
  return { status: 200, data: { id, deleted: true } };
}

function listClaims(query) {
  const db = getDb();
  if (query.box) {
    const rows = db.prepare(`
      SELECT c.* FROM claims c JOIN boxes b ON b.id = c.box_id
      WHERE b.short_code = ? ORDER BY c.created_at DESC
    `).all(query.box);
    return { status: 200, data: { claims: rows } };
  }
  if (query.email) {
    // 這個 email 拿過什麼 — 名單經營的核心查詢
    const rows = db.prepare(`
      SELECT c.*, b.short_code, b.title FROM claims c JOIN boxes b ON b.id = c.box_id
      WHERE c.email = ? ORDER BY c.created_at DESC
    `).all(String(query.email).toLowerCase());
    return { status: 200, data: { claims: rows } };
  }
  const rows = db.prepare(`
    SELECT c.*, b.short_code, b.title FROM claims c JOIN boxes b ON b.id = c.box_id
    ORDER BY c.created_at DESC LIMIT 500
  `).all();
  return { status: 200, data: { claims: rows } };
}

module.exports = { listBoxes, createBox, updateBox, deleteBox, listClaims };
