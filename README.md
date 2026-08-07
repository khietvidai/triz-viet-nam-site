# TRIZ Việt Nam — TRIZ AI Solver

Hệ thống giải quyết vấn đề theo phương pháp TRIZ, có trợ lý AI dẫn dắt qua 7 bước.
Đang chạy tại **https://trizvietnam.com**

## Công nghệ

| Thành phần | Lựa chọn |
|---|---|
| Framework | Astro 5 (SSR) + React 19 |
| Adapter | `@astrojs/node` — standalone, chạy sau Nginx |
| Styling | Tailwind CSS 4 |
| AI | Google Gemini (`@google/genai`) |
| Lưu trữ | SQLite qua `better-sqlite3` (`triz-data.db`) |
| Đa ngôn ngữ | Định tuyến `/[lang]/` — `vi` và `en` |

## Cấu trúc

```
src/
├── Data/           # Ma trận mâu thuẫn 2010, 40 nguyên lý, tham số (vi + en)
├── actions/        # Astro Actions — gọi Gemini, tra ma trận TRIZ
├── components/     # React + Astro: stepper, radar chart, kết quả, xuất PDF
├── dictionaries/   # Chuỗi giao diện vi.json / en.json
├── lib/            # agent.ts (logic TRIZ), db.ts (lịch sử), math.ts
├── middleware.ts   # Điều hướng ngôn ngữ theo header X-Country-Code từ Nginx
└── pages/[lang]/   # Các trang theo ngôn ngữ
```

## Chạy ở local

```bash
npm install
```

Tạo file `apikey.txt` ở thư mục gốc, chứa **đúng một dòng** là Google Gemini API key:

```bash
echo "YOUR_GEMINI_API_KEY" > apikey.txt
```

> `src/actions/index.ts` đọc key từ file này (`API_KEY_PATH`), không đọc từ biến môi trường.
> File đã được `.gitignore` — tuyệt đối không commit.

Sao chép cấu hình môi trường:

```bash
cp .env.example .env
```

Chạy dev server:

```bash
npm run dev
```

## Build & chạy production

```bash
npm run build
node ./dist/server/entry.mjs
```

Server đọc `HOST` và `PORT` từ `.env`. Đặt sau reverse proxy Nginx — proxy cần gửi header `X-Country-Code` để middleware điều hướng ngôn ngữ (mặc định coi là Việt Nam khi thiếu header).

## Bài giảng 40 nguyên tắc

Mỗi nguyên tắc có hai trang:

| Đường dẫn | Nội dung | Truy cập |
|---|---|---|
| `/{lang}/principles/{id}` | Mục 2 (tình huống nghiên cứu) + mục 3 (minh họa vận dụng) | Công khai |
| `/{lang}/bai-giang/{id}` | Mục 1 (bài giảng) | Chỉ người được cấp quyền |

Nội dung nằm trong `src/Data/principle-lessons_{vi,en}.json`. Nguyên tắc 1 đã
có nội dung mẫu để tham chiếu định dạng; 39 nguyên tắc còn lại là khung rỗng.

Sinh lại khung sau khi thêm/sửa nguyên tắc (mục đã soạn được giữ nguyên):

```bash
node scripts/generate-lesson-skeleton.mjs
```

Cách khoá mục 1: xem [docs/cloudflare-access.md](docs/cloudflare-access.md).

## Lưu ý bảo mật

- `apikey.txt`, `.env`, `triz-data.db` đều nằm trong `.gitignore` — không được commit.
- `triz-data.db` chứa lịch sử phân tích của người dùng.

## Nhánh khác

- `emdash-template` — template blog EmDash (Cloudflare Workers) không liên quan tới ứng dụng này, giữ lại để tham khảo.
