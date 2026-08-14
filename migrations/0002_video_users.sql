-- Người dùng khu vực video đào tạo nội bộ.
-- Đăng ký xong phải được admin duyệt (approved = 1) mới xem được video.
CREATE TABLE IF NOT EXISTS video_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    approved INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_video_users_email ON video_users (email);
