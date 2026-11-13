CREATE TABLE IF NOT EXISTS auth_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  csrf_token TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS auth_sessions_expiry ON auth_sessions(expires_at);
CREATE TABLE IF NOT EXISTS request_limits (
  bucket TEXT NOT NULL,
  minute INTEGER NOT NULL,
  requests INTEGER NOT NULL,
  PRIMARY KEY (bucket, minute)
);
CREATE INDEX IF NOT EXISTS request_limits_expiry ON request_limits(minute);
