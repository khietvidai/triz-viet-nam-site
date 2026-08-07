-- Analysis history for the TRIZ AI solver.
-- Ported from the better-sqlite3 schema in src/lib/db.ts.
CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    situation TEXT NOT NULL,
    language TEXT NOT NULL,
    constraints TEXT,
    result TEXT
);

CREATE INDEX IF NOT EXISTS idx_history_timestamp ON history (timestamp DESC);
