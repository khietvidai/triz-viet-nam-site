# Khoá mục 1 — Bài giảng, bằng Cloudflare Access

Mục 1 (bài giảng 40 nguyên tắc) nằm ở đường dẫn riêng `/{lang}/bai-giang/*`.
Mục 2 và 3 nằm ở `/{lang}/principles/*` và luôn công khai.

Sở dĩ tách hai đường dẫn: Cloudflare Access chặn theo **path**, không chặn
được một phần bên trong trang. Nội dung bài giảng vì thế phải ở URL riêng.

Access chặn ngay tại biên Cloudflare, **trước khi** request chạm tới site.
Người chưa được cấp quyền không tải được HTML, nên nội dung không rò rỉ dù
trang là file tĩnh.

## Các bước bật (làm trên dashboard, khoảng 5 phút)

1. Vào [dash.cloudflare.com](https://dash.cloudflare.com) → **Zero Trust**.
   Lần đầu sẽ được hỏi chọn gói — chọn **Free** (tới 50 người dùng).

2. Vào **Access → Applications → Add an application → Self-hosted**.

3. Điền:

   | Trường | Giá trị |
   |---|---|
   | Application name | `TRIZ — Bài giảng 40 nguyên tắc` |
   | Session duration | `1 month` (học viên đỡ phải đăng nhập lại) |

4. Ở phần **Public hostname**, thêm **hai** đường dẫn (mỗi ngôn ngữ một dòng):

   | Subdomain | Domain | Path |
   |---|---|---|
   | `triz-ai-solver` | `khietvidai.workers.dev` | `vi/bai-giang` |
   | `triz-ai-solver` | `khietvidai.workers.dev` | `en/bai-giang` |

   > Khi nào trỏ tên miền thật về đây thì đổi domain thành `trizvietnam.com`
   > và giữ nguyên phần path.

5. Sang bước **Policies → Add a policy**:

   | Trường | Giá trị |
   |---|---|
   | Policy name | `Học viên được cấp quyền` |
   | Action | `Allow` |
   | Include → Selector | `Emails` |
   | Value | liệt kê email từng học viên |

   Muốn mở cho cả một tổ chức thì dùng selector `Emails ending in`
   với giá trị dạng `@tencongty.com`.

6. **Save**. Xong.

## Học viên vào bài giảng thế nào

1. Bấm **"Vào bài giảng"** trên trang nguyên tắc.
2. Cloudflare hiện màn hình đăng nhập, hỏi email.
3. Học viên nhập email → nhận mã một lần trong hộp thư → dán vào.
4. Vào được, và giữ phiên suốt thời gian đã đặt ở *Session duration*.

Không cần tạo mật khẩu, không cần lưu tài khoản trong database.

## Cấp và thu hồi quyền

Sửa danh sách email trong policy ở bước 5. Bỏ một email ra khỏi danh sách
là người đó mất quyền ngay lần truy cập kế tiếp.

Xem ai đã vào: **Zero Trust → Logs → Access**.

## Kiểm tra đã khoá thật chưa

Mở cửa sổ ẩn danh và truy cập:

```
https://triz-ai-solver.khietvidai.workers.dev/vi/bai-giang/1
```

- Chưa bật Access → thấy luôn nội dung bài giảng (**chưa an toàn**).
- Đã bật Access → hiện màn hình đăng nhập của Cloudflare.

Nhớ kiểm tra cả `/en/bai-giang/1`, vì hai ngôn ngữ là hai path khác nhau.
