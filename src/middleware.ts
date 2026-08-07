import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // 1. BỎ QUA các file tài nguyên (ảnh, css, api,...)
  if (path.startsWith("/_astro") || 
      path.startsWith("/images") || 
      path.startsWith("/favicon.ico") || 
      path.startsWith("/api") ||
      path.includes(".")) {
    return next();
  }

  // 2. Lấy mã quốc gia.
  // Trên Cloudflare Workers: header CF-IPCountry do chính Cloudflare gắn.
  // X-Country-Code giữ lại để tương thích khi chạy sau Nginx trên VPS.
  // Thiếu cả hai (ví dụ `astro dev`) thì giá trị là null.
  const country =
    context.request.headers.get("CF-IPCountry") ??
    context.request.headers.get("X-Country-Code");

  // 3. LOGIC MỚI: MẶC ĐỊNH LÀ VIỆT NAM
  // Chỉ coi là khách nước ngoài khi có mã quốc gia VÀ mã đó KHÔNG phải VN
  const isForeigner = country && country.toUpperCase() !== 'VN';

  // --- XỬ LÝ ĐIỀU HƯỚNG ---

  // Trường hợp 1: Khách vào trang chủ gốc "/"
  if (path === "/" || path === "") {
    if (isForeigner) {
      return context.redirect("/en");
    } else {
      return context.redirect("/vi"); // Mặc định về đây (kể cả khi lỗi header)
    }
  }

  // Trường hợp 2: Khách đang ở tiếng Anh "/en..." nhưng thực ra là người Việt
  // (Bạn có thể bỏ đoạn này nếu muốn cho phép người Việt xem tiếng Anh)
  if (path.startsWith("/en") && !isForeigner) {
     // Logic này ép người dùng về /vi nếu họ không phải nước ngoài.
     // Nếu bạn muốn mềm mỏng hơn, hãy xóa khối if này đi.
     // return context.redirect(path.replace("/en", "/vi"));
  }

  // Trường hợp 3: Khách đang ở tiếng Việt "/vi..." nhưng là người nước ngoài
  if (path.startsWith("/vi") && isForeigner) {
     return context.redirect(path.replace("/vi", "/en"));
  }

  return next();
});
