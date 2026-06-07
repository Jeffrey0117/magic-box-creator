// KeyBox NG — self-hosted server（cloudpipe :4032）
// 路由：/embed.js（SDK）、/api/embed/*（公開）、/api/admin/*（Bearer token）、/api/health
const http = require('http');
const fs = require('fs');
const { join } = require('path');

// 自帶 .env 載入（repo 根目錄 + server/），不依賴 pm2/部署器注入；已存在的環境變數優先
for (const envPath of [join(__dirname, '..', '.env'), join(__dirname, '.env')]) {
  try {
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  } catch { /* ignore */ }
}

const embedApi = require('./embed-api');
const adminApi = require('./admin-api');

const PORT = parseInt(process.env.PORT || '4032', 10);
const TOKEN = process.env.KEYBOX_TOKEN || '';

const EMBED_JS_PATH = join(__dirname, '..', 'public', 'embed.js');

function json(res, status, data) {
  const payload = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > 1024 * 1024) { reject(new Error('body too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }
      catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

function requireAuth(req) {
  if (!TOKEN) return false; // secure by default：沒設 token 一律拒絕
  const auth = req.headers.authorization || '';
  return auth.startsWith('Bearer ') && auth.slice(7) === TOKEN;
}

function getClientIp(req) {
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return fwd || req.socket.remoteAddress || '';
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;

  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });
      return res.end();
    }

    if (path === '/api/health') {
      return json(res, 200, { ok: true, service: 'keybox-ng', mailer: process.env.MAILER_URL || 'http://localhost:4018/api/send' });
    }

    // SDK — 與 repo 根目錄 public/embed.js 同一份，BASE 自動跟著本網域走
    if (req.method === 'GET' && path === '/embed.js') {
      const code = fs.readFileSync(EMBED_JS_PATH);
      res.writeHead(200, {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300',
      });
      return res.end(code);
    }

    // ── 公開 embed API ──
    if (req.method === 'GET' && path === '/api/embed/box') {
      const r = embedApi.getBoxMeta(String(url.searchParams.get('code') || '').trim());
      return json(res, r.status, r.data);
    }
    if (req.method === 'POST' && path === '/api/embed/unlock') {
      const body = await readBody(req);
      const host = String(req.headers.origin || req.headers.referer || '').slice(0, 200);
      const r = await embedApi.unlock(body, getClientIp(req), host);
      return json(res, r.status, r.data);
    }

    // ── 管理 API ──
    if (path.startsWith('/api/admin/')) {
      if (!requireAuth(req)) return json(res, 401, { error: 'unauthorized' });

      if (req.method === 'GET' && path === '/api/admin/boxes') return jsonR(res, adminApi.listBoxes());
      if (req.method === 'POST' && path === '/api/admin/boxes') return jsonR(res, adminApi.createBox(await readBody(req)));

      const boxMatch = path.match(/^\/api\/admin\/boxes\/([^/]+)$/);
      if (boxMatch && req.method === 'PUT') return jsonR(res, adminApi.updateBox(boxMatch[1], await readBody(req)));
      if (boxMatch && req.method === 'DELETE') return jsonR(res, adminApi.deleteBox(boxMatch[1]));

      if (req.method === 'GET' && path === '/api/admin/claims') {
        return jsonR(res, adminApi.listClaims({
          box: url.searchParams.get('box') || '',
          email: url.searchParams.get('email') || '',
        }));
      }
      return json(res, 404, { error: 'not found' });
    }

    return json(res, 404, { error: 'not found' });
  } catch (err) {
    console.error('[keybox]', err.message);
    return json(res, 500, { error: 'internal error' });
  }

  function jsonR(response, result) {
    return json(response, result.status, result.data);
  }
});

server.listen(PORT, () => {
  console.log(`[keybox-ng] listening on :${PORT}`);
  console.log(`[keybox-ng] admin token: ${TOKEN ? 'configured' : 'MISSING (all admin calls will 401)'}`);
});
