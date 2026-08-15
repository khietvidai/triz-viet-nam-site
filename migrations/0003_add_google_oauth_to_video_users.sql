-- Thêm các trường lưu thông tin Google OAuth vào video_users
ALTER TABLE video_users ADD COLUMN google_id TEXT;
ALTER TABLE video_users ADD COLUMN name TEXT;
ALTER TABLE video_users ADD COLUMN avatar_url TEXT;

CREATE INDEX IF NOT EXISTS idx_video_users_google_id ON video_users (google_id);
