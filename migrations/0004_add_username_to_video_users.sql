-- Thêm cột username để hỗ trợ tài khoản đăng nhập nội bộ
ALTER TABLE video_users ADD COLUMN username TEXT;
CREATE INDEX IF NOT EXISTS idx_video_users_username ON video_users (username);
