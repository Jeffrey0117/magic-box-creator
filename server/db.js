// KeyBox NG — SQLite schema + lazy singleton (same pattern as seedblog/db.js)
const Database = require('better-sqlite3');
const { join } = require('path');
const fs = require('fs');

let db = null;

function getDb() {
  if (db) return db;

  const dataDir = join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  db = new Database(join(dataDir, 'keybox.db'));
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS boxes (
      id              TEXT PRIMARY KEY,
      short_code      TEXT NOT NULL UNIQUE,
      keyword         TEXT DEFAULT '',
      title           TEXT DEFAULT '',
      description     TEXT DEFAULT '',
      content         TEXT NOT NULL,
      unlock_mode     TEXT NOT NULL DEFAULT 'keyword',  -- keyword | email
      delivery        TEXT NOT NULL DEFAULT 'instant',  -- instant | email | both
      quota           INTEGER DEFAULT NULL,
      expires_at      TEXT DEFAULT NULL,
      webhook_url     TEXT DEFAULT NULL,
      webhook_secret  TEXT DEFAULT NULL,
      created_at      TEXT DEFAULT (datetime('now')),
      updated_at      TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS claims (
      id          TEXT PRIMARY KEY,
      box_id      TEXT NOT NULL REFERENCES boxes(id) ON DELETE CASCADE,
      email       TEXT NOT NULL,
      name        TEXT DEFAULT NULL,
      host        TEXT DEFAULT NULL,
      extra       TEXT DEFAULT NULL,
      created_at  TEXT DEFAULT (datetime('now')),
      UNIQUE(box_id, email)
    );

    CREATE INDEX IF NOT EXISTS idx_claims_box ON claims(box_id);
    CREATE INDEX IF NOT EXISTS idx_claims_email ON claims(email);
  `);

  return db;
}

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

module.exports = { getDb, newId };
