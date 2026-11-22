-- Username + PIN accounts replace Cloudflare Access email sign-in.
-- Additive only: the old auth_sessions table is left untouched so this can run
-- before the new build is deployed (and so rollback needs no schema change).
-- COLLATE NOCASE: "Kari" and "kari" are the same account.
CREATE TABLE IF NOT EXISTS players (
  username TEXT PRIMARY KEY COLLATE NOCASE,
  pin_hash TEXT NOT NULL,
  pin_salt TEXT NOT NULL,
  failed INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER,
  -- how many times the account has been locked; lengthens each new lockout
  lock_count INTEGER NOT NULL DEFAULT 0,
  recovery_hash TEXT,
  recovery_salt TEXT,
  recover_failed INTEGER NOT NULL DEFAULT 0,
  recover_locked_until INTEGER,
  recover_lock_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  last_seen INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS app_sessions (
  token_hash TEXT PRIMARY KEY,
  username TEXT NOT NULL COLLATE NOCASE,
  csrf_token TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS app_sessions_expiry ON app_sessions(expires_at);
CREATE INDEX IF NOT EXISTS app_sessions_user ON app_sessions(username, created_at);
