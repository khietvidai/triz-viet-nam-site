# Kế hoạch tạo bộ thẻ học 40 nguyên tắc (thủ thuật) sáng tạo cơ bản bằng Python + Codex trên macOS

Mục tiêu: tạo 40 thẻ hai mặt, giúp người học nhận ra cơ chế, nhớ tên và thử vận dụng từng nguyên tắc. Đây là bản thiết kế triển khai; chưa phải bộ ảnh hoặc chương trình đã chạy.

## Yêu cầu ưu tiên của người dùng — Thuật ngữ cho Việt Nam

Người dùng yêu cầu dùng tên theo hệ thuật ngữ của GS. Phan Dũng và tài liệu do thầy Hưởng gợi ý, phù hợp người học tại Việt Nam. Nguồn người dùng chỉ định: [TRIZ Việt Nam — Nội bộ](https://trizvietnam.com/vi/noi-bo).

Tình trạng xác minh: trong phiên lập kế hoạch này chưa đọc được nội dung trang trên. Vì vậy chưa thể chứng nhận tên của từng nguyên tắc trong kế hoạch là nguyên văn của nguồn đó hoặc của thầy Hưởng. Các tên xuất hiện trong ví dụ là tên làm việc, phải đối chiếu trước khi chốt bộ thẻ.

Quy tắc triển khai bắt buộc:

1. Tên chính trên lá bài, danh mục, dữ liệu và PDF phải lấy từ hệ thuật ngữ Việt Nam được người dùng chỉ định; không tự dịch ngược tên tiếng Anh để thay thế.
2. Lập `data/terminology_vi.json` cho đủ 40 ID: tên nguyên văn từ nguồn, tên hiển thị, tên tiếng Anh đối chiếu, tên gọi khác, URL/tên tài liệu, vị trí trang/mục và trạng thái xác minh.
3. Phân biệt ba lớp: **tên chuẩn Việt Nam**, **câu gợi nhớ do bộ thẻ biên soạn**, **tên tiếng Anh để tra cứu**. Câu gợi nhớ không được thay tên chuẩn.
4. Nếu tài liệu GS. Phan Dũng và nguồn thầy Hưởng dùng tên khác nhau, lưu cả hai và ghi nguồn riêng. Tạm ưu tiên tên trong tài liệu người dùng trực tiếp cung cấp cho bộ thẻ; trình đúng các khác biệt còn lại để người dùng quyết định, không tự khẳng định hai nguồn thống nhất.
5. Bảo toàn tên gọi kể cả khi dài hoặc mang sắc thái thuật ngữ. Giải thích bằng tiếng Việt đời thường ở phần nội dung. Chỉ rút phần tiền tố lặp lại như “Nguyên tắc” theo một quy tắc hiển thị nhất quán, vẫn giữ tên nguyên văn trong dữ liệu.
6. Khóa bảng thuật ngữ trước khi chốt nội dung in. Đổi tên phải cập nhật đồng bộ mọi đầu ra bằng Python; không sửa tay từng ảnh.
7. Nếu trang yêu cầu đăng nhập, dùng nội dung người dùng có quyền truy cập và cung cấp. Nếu desktop vẫn không đọc được, yêu cầu ảnh chụp/PDF/danh sách 40 tên; trong lúc chờ vẫn làm template, code và brief hình, nhưng không đánh dấu thuật ngữ là đã xác minh.
8. Đây là bộ thẻ tự biên soạn theo hệ thuật ngữ được chọn. Không ghi rằng GS. Phan Dũng, thầy Hưởng hoặc TRIZ Việt Nam đã chứng thực hay là tác giả của bộ thẻ khi chưa có căn cứ.

Tên bộ thẻ đề xuất: **40 nguyên tắc (thủ thuật) sáng tạo cơ bản — Học TRIZ qua hình ảnh**. Đây là đề xuất biên tập, không phải trích tên sản phẩm chính thức.

## 1. Quyết định thiết kế

- Ngôn ngữ: tiếng Việt, tên chuẩn theo yêu cầu ưu tiên ở trên; thêm tên tiếng Anh nhỏ ở mặt giải thích để tra cứu.
- Đối tượng: người lớn mới học TRIZ. Ví dụ vật lý, đồ dùng và công việc gần gũi; ví dụ IT chỉ dùng khi giúp hiểu rõ hơn.
- Giữ số nguyên tắc chuẩn 01–40. Không tự đổi số theo nhóm màu.
- 40 thẻ vật lý = 40 hình minh họa chính + 40 mặt giải thích, không cần tạo 80 hình AI.
- Mỗi hình thể hiện một ứng dụng cụ thể. Phần giải thích phải nói rõ ứng dụng này minh họa khía cạnh nào; một hình không thay thế toàn bộ nội dung nguyên tắc.
- AI tạo minh họa không chữ. Python dựng chữ, số, khung, nhãn và các mũi tên cần chính xác.
- Hướng mỹ thuật đề xuất: minh họa biên tập dạng vector, hình khối rõ, đổ bóng nhẹ, nền kem, nét xanh đậm, điểm nhấn cam và xanh ngọc. “Dạng vector” mô tả phong cách; file AI có thể vẫn là raster PNG.
- Ưu tiên hiểu được cơ chế ở kích thước in thật. Tránh nền phức tạp, biểu tượng bóng đèn chung chung, nhiều nhân vật và chi tiết nhỏ.

Lý do tách chữ và hình: tài liệu OpenAI ghi nhận mô hình ảnh vẫn có thể sai vị trí/độ rõ chữ và thiếu nhất quán giữa các lần tạo. Dàn chữ bằng Python giúp sửa thuật ngữ mà không phải tạo lại tranh. Nguồn: [OpenAI — Image generation, Limitations](https://developers.openai.com/api/docs/guides/image-generation).

## 2. Một lá bài phải giúp học điều gì?

Thiết kế hai mặt theo cơ chế tự nhớ trước khi xem đáp án.

| Thành phần | Mặt A — Nhìn và suy nghĩ | Mặt B — Kiểm tra và áp dụng |
|---|---|---|
| Nhận diện | Số 01–40 nhỏ ở góc | Số, tên Việt, tên Anh |
| Nội dung chính | Minh họa cơ chế, chiếm khoảng 70% vùng sử dụng | Bản chất nguyên tắc, 1–2 câu |
| Gợi nhớ | Một câu hỏi không tiết lộ tên nguyên tắc | Một câu chốt ngắn, dễ nhớ |
| Giải thích | Không in sẵn đáp án | Giải mã tình huống trong hình |
| Vận dụng | — | Một câu hỏi gắn với vấn đề của người học |
| Phân biệt | — | Một lưu ý về nguyên tắc dễ nhầm |

Xuất thêm biến thể mặt A có tên nguyên tắc để dùng như bộ tra cứu. Chỉ đổi cấu hình render, dùng lại cùng dữ liệu và tranh.

Giới hạn biên tập ban đầu: mặt A khoảng 12–20 từ; mặt B khoảng 75–105 từ tiếng Việt. Đây là giới hạn thử nghiệm, phải điều chỉnh sau khi kiểm tra dàn trang và đọc ở kích thước thật. Không tự thu nhỏ chữ để nhét hết nội dung.

Ví dụ lá 01:

- Mặt A: một tủ kệ nguyên khối khó đi qua cửa; cùng chiếc kệ đó dưới dạng các mô-đun tháo rời đi qua được. Câu hỏi: “Làm sao đưa chiếc kệ qua cửa mà vẫn giữ đủ công năng?”
- Mặt B: tên “Phân nhỏ / Segmentation”; giải thích chia thành phần độc lập, thuận tiện tháo lắp; câu chốt “Chia nhỏ để dễ xử lý”; câu hỏi “Trong việc của bạn, phần nào có thể tách thành mô-đun?”
- Phân biệt: trọng tâm ở khả năng chia và thao tác từng phần; nếu chỉ lấy riêng bộ phận gây phiền hoặc bộ phận cần thiết, hãy đối chiếu nguyên tắc 02.

## 3. Phân vai Codex và Python

| Công việc | Codex | Python |
|---|---|---|
| Kiểm chứng TRIZ | Đọc nguồn, thống nhất thuật ngữ, đánh giá ví dụ | Kiểm tra đủ ID và các trường bắt buộc |
| Thiết kế nội dung | Viết định nghĩa, câu hỏi, ý tưởng hình và prompt | Lưu JSON UTF-8, kiểm tra schema |
| Tạo tranh | Chọn và gọi năng lực tạo ảnh khả dụng, nhận xét hình | Điều phối API nếu có, lưu ảnh và trạng thái |
| Thiết kế thẻ | Đặt quy tắc bố cục và kiểm tra trực quan | Dàn chữ, ghép hình, xuất PNG/PDF |
| Sửa lỗi | Nhận diện sai cơ chế, sửa brief hoặc nội dung | Chạy lại đúng lá, đúng bước bị ảnh hưởng |

Codex viết và vận hành quy trình; khả năng tạo ảnh phụ thuộc công cụ/dịch vụ thực tế của môi trường. Không mặc định một phiên đăng nhập Codex cung cấp sẵn quyền gọi API ảnh từ Python.

Ưu tiên triển khai một trong hai đường:

1. **Tự động bằng API:** Python gọi một image API có quyền truy cập. Tên model, kích thước được hỗ trợ, chất lượng và giá đặt trong cấu hình sau khi Codex kiểm tra tài liệu hiện hành. OpenAI có hướng dẫn tạo và chỉnh ảnh bằng SDK Python: [Image generation](https://developers.openai.com/api/docs/guides/image-generation).
2. **Qua công cụ ảnh trong phiên Codex, nếu có:** Codex dùng prompt và công cụ được cung cấp, lưu kết quả theo ID; Python tiếp nhận và dàn trang. Không giả định công cụ nội bộ của phiên là hàm Python có thể import.

Nếu cả hai chưa khả dụng, hoàn thành dữ liệu, 40 prompt, template, bản xem trước có placeholder được đánh dấu và danh sách ảnh cần nhập. Báo rõ phần ảnh chưa thực hiện; không coi placeholder là sản phẩm hoàn thành.

## 4. Bước 0 — Chuẩn hóa nội dung và dựng nền

Đầu ra: `data/principles.json`, `data/sources.md`, `design/style.md`, `config.yaml`, môi trường Python riêng.

Việc Codex cần làm:

1. Đọc hướng dẫn dự án nếu có. Kiểm tra Python và các công cụ tạo ảnh đang khả dụng; không sửa Python hệ thống.
2. Dùng `venv` trong thư mục dự án. Chọn và khóa phiên bản thư viện sau khi kiểm tra tương thích macOS.
3. Đối chiếu đủ 40 số và tên với nguồn Việt Nam người dùng chỉ định; dùng nguồn tiếng Anh để kiểm tra chéo cơ chế và số thứ tự. Viết giải thích tiếng Việt bằng lời mới, lưu URL và phần nguồn tương ứng cho từng lá.
4. Giữ riêng `name_vi`, `name_en`, `aliases_vi`. Không coi các cách dịch khác nhau là nguyên tắc khác nhau.
5. Mỗi lá có bản chất, câu chốt, ví dụ, cơ chế thay đổi, lợi ích, câu hỏi vận dụng và nguyên tắc dễ nhầm.
6. Nêu vấn đề và đánh đổi cụ thể khi thích hợp. Không ép mọi ví dụ thành một mâu thuẫn kỹ thuật không có thật.
7. Đối với nguyên tắc vật lý/hóa học, không thay nội dung chuẩn bằng một phép ví von tâm lý hoặc kinh doanh.

Nguồn tiếng Anh để đối chiếu số và cơ chế: [The TRIZ Journal — 40 Inventive Principles](https://the-trizjournal.com/40-inventive-principles-examples/). Nguồn này không quyết định tên tiếng Việt. Chỉ dùng để kiểm chứng; không sao chép hàng loạt ví dụ và lời giải thích. Ví dụ trong nguồn cũng cần kiểm tra tính phù hợp trước khi đưa vào bộ thẻ.

Tài liệu nền về vai trò của mâu thuẫn: [G. Altshuller — Contradictions: Administrative, Technical and Physical](https://www.altshuller.ru/world/eng/triz6.asp).

Tiêu chí qua bước: đủ 40 ID duy nhất; tên và số khớp nguồn; từng ví dụ giải thích được “đã thay đổi gì” và “vì sao có ích”; mọi điểm chưa chắc được đánh dấu để giải quyết trước khi vẽ lá đó.

## 5. Bước 1 — Viết prompt riêng cho từng lá

Đầu ra: 40 brief và 40 prompt hoàn chỉnh trong `prompts/01.txt` đến `prompts/40.txt`, cùng file tổng hợp `prompts_catalog.md`.

Không chỉ thay tên nguyên tắc trong một mẫu chung. Với từng lá, Codex phải:

1. Đề xuất hai cảnh minh họa khác nhau bằng văn bản.
2. Chọn cảnh có cơ chế dễ nhìn hơn, ít gây nhầm với nguyên tắc khác và phù hợp diện tích nhỏ.
3. Viết `must_show`: những dấu hiệu bắt buộc phải nhìn thấy.
4. Viết `must_avoid`: những cách thể hiện sai hoặc dễ hiểu lệch.
5. Chọn một cảnh, hai trạng thái trước/sau, hoặc tối đa ba nhịp thời gian. Không ép tất cả thành bố cục trước/sau.
6. Biên dịch thành prompt tự đủ ngữ cảnh: quy chuẩn phong cách + cảnh cụ thể + cơ chế + bố cục + điều kiện loại bỏ.
7. Tự rà soát prompt theo nội dung chuẩn trước khi phát sinh yêu cầu tạo ảnh.

Mẫu prompt viết brief cho Codex:

```text
Bạn đang thiết kế thẻ học TRIZ cho người lớn mới học.
Dựa trên bản ghi nguyên tắc và nguồn đã kiểm chứng được cung cấp:

1. Nêu cơ chế cốt lõi bằng tiếng Việt đơn giản.
2. Đề xuất 2 cảnh cụ thể. Mỗi cảnh có vấn đề, thay đổi và lợi ích.
3. So sánh độ rõ khi in nhỏ, tính đúng và nguy cơ nhầm nguyên tắc.
4. Chọn 1 cảnh; ghi lý do chọn và giới hạn mà cảnh chưa thể hiện.
5. Liệt kê must_show, must_avoid và nguyên tắc dễ nhầm.
6. Viết prompt vẽ cuối bằng tiếng Anh, tự đủ ngữ cảnh.

Chỉ yêu cầu vẽ vùng minh họa. Không vẽ chữ, số, tiêu đề, logo,
khung thẻ hoặc watermark. Nếu cần đường dẫn, nhãn hay mũi tên chính xác,
ghi chúng vào overlay_spec để Python dựng sau.
Không thêm phép ẩn dụ không giải thích được cơ chế.
Trả dữ liệu có cấu trúc phù hợp schema của dự án.
```

Ví dụ prompt vẽ hoàn chỉnh cho lá 01:

```text
Create one square editorial illustration for an adult TRIZ learning card.
Use crisp vector-like shapes, consistent dark navy outlines, a warm ivory
background, restrained teal and orange accents, and subtle soft shadows.
Use an uncluttered three-quarter view with generous negative space.

The teaching mechanism is segmentation: turning one bulky object into
independent detachable modules makes moving and reassembly easier.

Show two clearly separated scenes arranged left to right. On the left,
a tall teal storage cabinet is blocked by a doorway that is too narrow
for the assembled cabinet. The cabinet has a clear modular grid but its
modules are joined together. On the right, show the same cabinet as
three detached, intact modules. Each module is visibly narrow enough
to pass through an identical doorway. Show simple matching connectors
on the module edges, indicating that they can be reassembled afterward.
Keep the doorway size and module dimensions consistent between scenes.

The focal point is the contrast between the blocked assembled cabinet
and the manageable detached modules. The modules remain useful and intact.
Do not show broken wood, destruction, discarded pieces, a larger doorway,
a smaller replacement cabinet, or a magically shrinking object.
No decorative machinery, extra characters, or unrelated objects.
No text, letters, numbers, labels, logos, watermark, card border, or arrows.
Keep all essential objects inside the central 84 percent of the canvas.
```

Đây là mẫu khởi đầu cần kiểm tra bằng hình thực tế. Nếu hình không giữ được kích thước giữa hai cảnh, sửa brief hoặc tạo riêng từng panel rồi ghép; không tiếp tục tăng độ dài prompt vô hạn.

## 6. Bước 2A — Làm thử sáu lá đại diện

Chọn sáu lá để phát hiện nhiều loại lỗi khác nhau:

| Lá | Ý tưởng hình đề xuất | Điều phải kiểm tra |
|---|---|---|
| 01 — Phân nhỏ | Kệ mô-đun đi qua cửa hẹp | Tháo thành phần nguyên vẹn, không phải đập vỡ |
| 09 — Gây ứng suất sơ bộ | Minh họa khái niệm dầm được tạo ứng suất trước để đối lại tải về sau | Chiều tác dụng và trình tự phải đúng; lực/mũi tên dựng bằng Python |
| 12 — Đẳng thế | Hai mặt bàn cùng cao độ để trượt thùng ngang giữa các trạm | Lợi ích là giảm nhu cầu nâng hạ, không chỉ rút ngắn đường đi |
| 23 — Quan hệ phản hồi | Cảm biến ẩm đất cung cấp tín hiệu điều chỉnh van tưới | Có đường quay về điều khiển; chỉ đo và hiển thị chưa đủ cho ví dụ này |
| 36 — Chuyển pha | Túi vật liệu giữ mát hấp thu nhiệt khi lõi đang tan | Thể hiện lợi ích gắn với quá trình chuyển pha, không chỉ tô màu nóng/lạnh |
| 40 — Vật liệu hợp thành | Lát cắt tấm sandwich với lớp mặt và lõi khác vật liệu | Các thành phần phối hợp tạo tính chất hữu ích, không chỉ xếp đồ cạnh nhau |

Với sơ đồ cơ học, vòng phản hồi hoặc dòng nhiệt cần chính xác, Python dựng sơ đồ từ dữ liệu có kiểm tra. AI có thể tạo vật thể minh họa nền, nhưng không quyết định topology hay hướng lực.

Tạo tối đa hai ứng viên ban đầu cho mỗi lá thử, nếu ngân sách cho phép. Đặt cả sáu vào đúng template và xuất bản xem thử trước khi nhân rộng. Chọn một ảnh đạt làm tham chiếu phong cách khi backend hỗ trợ; vẫn giữ quy chuẩn văn bản, vì ảnh tham chiếu không bảo đảm nhất quán tuyệt đối.

Codex tự đánh giá và sửa trong phạm vi đã giao. Có thể trình bảng sáu lá để người dùng góp ý mỹ thuật, nhưng không mặc định bắt buộc dừng xin duyệt từng lá.

## 7. Bước 2B — Tạo toàn bộ ảnh có khả năng chạy tiếp

Đầu ra: ít nhất một ảnh được chọn cho mỗi ID, toàn bộ ứng viên và lịch sử tạo còn nguyên.

- Làm phần còn lại theo nhóm 5–8 lá để nhìn được sai lệch phong cách sớm. Đây là nhóm sản xuất, không mặc định là API Batch.
- Bắt đầu với concurrency 1; chỉ tăng khi dịch vụ hỗ trợ và không vượt giới hạn chi phí/tốc độ.
- Mỗi lần tạo lưu ID, prompt hoàn chỉnh, hash prompt, phiên bản style, provider/model, tham số, ảnh tham chiếu, thời gian, kết quả và lỗi.
- Chỉ lưu seed khi backend thực sự hỗ trợ. Lưu cấu hình để truy vết; không hứa tái tạo ảnh AI giống từng pixel.
- Ảnh mới lưu thành ứng viên mới, không ghi đè ảnh đã chọn.
- Manifest quyết định ảnh nào dùng cho từng lá; không chọn bằng tên file “mới nhất”.
- Dừng rồi chạy lại phải bỏ qua các bước đã thành công với cùng đầu vào.
- Thay chữ chỉ render lại; thay prompt mới cần tạo lại ảnh; thay template chỉ dàn lại cả bộ.
- Retry lỗi tạm thời có backoff và số lần tối đa. Lỗi xác thực/quyền truy cập phải báo cụ thể, không retry vô hạn.
- Timeout không rõ kết quả phải ghi trạng thái `unknown`; kiểm tra khả năng truy hồi request trước khi gửi lại để tránh tính phí trùng.
- Nếu không có cơ chế idempotency từ backend, không hứa bảo đảm yêu cầu được tính phí đúng một lần.

Ngân sách: cấu hình trần số ảnh và, khi ước lượng được, trần tiền. Tính cả ảnh thử, lần sửa, đầu vào tham chiếu và đánh giá qua API nếu dùng. Không hard-code đơn giá. Nếu thiếu thông tin giá, báo phần chưa định giá và dùng trần lượt gọi. Không kích hoạt chạy có phí chỉ vì một API key tình cờ tồn tại; thực thi theo quyền sử dụng và hạn mức người dùng đã giao cho phiên desktop.

## 8. Bước 3 — Dàn trang bằng Python

Stack dự kiến, Codex kiểm tra phiên bản trước khi cài:

| Thư viện/công cụ | Vai trò |
|---|---|
| `pathlib`, `json`, `hashlib`, `sqlite3` hoặc manifest JSON | Quản lý file và lịch sử; mặc định manifest JSON là đủ cho 40 lá |
| `Pydantic` | Kiểm tra dữ liệu từng lá và cấu hình |
| `Pillow` | Ghép ảnh, xuất PNG, bảng ảnh tổng quan |
| `ReportLab` | PDF có chữ vector, font nhúng và kích thước vật lý |
| `PyMuPDF` | Render PDF để kiểm tra trực quan |
| SDK của image provider | Gọi API ảnh khi chọn đường tự động |

Không cần database server, framework agent hoặc giao diện web cho phiên bản đầu.

Thông số đề xuất:

- Thẻ sau cắt: 70 × 120 mm, khổ đứng.
- Bleed đề xuất: 3 mm mỗi cạnh; trang đơn để in là 76 × 126 mm. Xác nhận lại với nhà in trước sản xuất.
- Safe area: nội dung quan trọng cách đường cắt ít nhất 5 mm.
- Bản raster 300 ppi: khoảng 827 × 1417 px sau cắt; khoảng 898 × 1488 px gồm bleed. PDF dùng mm làm chuẩn để tránh sai số làm tròn pixel.
- Font hỗ trợ đầy đủ tiếng Việt, ví dụ Noto Sans kèm giấy phép. Kiểm tra glyph và nhúng font; không phụ thuộc font có sẵn trên máy.
- Cỡ chữ nội dung mục tiêu 10–11 pt; phải thử với bản in. Tiêu đề dài được xuống tối đa hai dòng theo quy tắc nhất quán.
- Hình giữ nguyên tỉ lệ; không kéo méo hoặc crop mất cơ chế. Kiểm tra độ phân giải hiệu dụng của vùng tranh, không chỉ metadata DPI.
- RGB cho xem màn hình và bản in thử. Chỉ chuyển CMYK/PDF/X khi có yêu cầu, profile và quy trình kiểm tra của nhà in; không gắn nhãn “chuẩn nhà in” khi chưa xác nhận.

PDF A4 để tự in: đề xuất 2 cột × 2 hàng, tối đa 4 lá mỗi mặt trang; 40 lá cần 10 tờ hai mặt. Bố trí đủ khoảng cho bleed, khoảng hở và dấu cắt. Xuất riêng mặt trước/sau hoặc bản xen kẽ đã quy định rõ. Hoán vị vị trí mặt sau theo chế độ lật, không lật gương nội dung chữ. In thử một tờ có đánh dấu góc và ID để xác nhận mặt trước khớp mặt sau, chiều đọc đúng, in 100% kích thước.

## 9. Schema dữ liệu và cấu trúc dự án

Các trường nội dung tối thiểu cho một lá:

```json
{
  "id": 1,
  "name_vi": "Phân nhỏ",
  "name_en": "Segmentation",
  "aliases_vi": [],
  "definition_vi": "...",
  "memory_hook_vi": "Chia nhỏ để dễ xử lý",
  "front_question_vi": "...",
  "example_vi": "...",
  "mechanism_vi": "...",
  "application_question_vi": "...",
  "confusable_with": [2],
  "distinction_vi": "...",
  "source_refs": [{"url": "...", "section": "Principle 1"}],
  "visual_brief": {
    "scene": "...",
    "layout": "two_panels",
    "must_show": ["..."],
    "must_avoid": ["..."],
    "scope_note": "Minh họa khía cạnh tháo lắp thành mô-đun"
  },
  "image_prompt_en": "...",
  "overlay_spec": [],
  "content_status": "draft"
}
```

Các dấu `...` chỉ minh họa schema, không được tồn tại trong bản bàn giao hoàn chỉnh. Tách trạng thái nội dung, trạng thái tạo ảnh và trạng thái render; không gom vào một cờ `done`.

| Đường dẫn tương đối | Nội dung |
|---|---|
| `README.md` | Cài đặt và lệnh chạy trên macOS |
| `config.yaml`, `.env.example`, `.gitignore` | Cấu hình, tên biến môi trường, loại trừ bí mật |
| `data/principles.json`, `data/sources.md` | Nội dung và nguồn |
| `data/terminology_vi.json` | Bảng 40 tên Việt Nam, nguồn và trạng thái xác minh |
| `design/style.md`, `assets/fonts/` | Quy chuẩn và font có giấy phép |
| `prompts/01.txt` … `40.txt` | Prompt cuối của từng lá |
| `prompts_catalog.md` | Duyệt toàn bộ ý tưởng và prompt |
| `src/triz_cards/` | Các module Python |
| `images/candidates/`, `images/selected/` | Ứng viên và ảnh đã chọn |
| `state/manifest.json`, `state/calls.jsonl` | Trạng thái và lịch sử chạy |
| `output/cards/front/`, `output/cards/back/` | 80 PNG cuối |
| `output/triz_40_review.pdf` | PDF đọc, mỗi lá có cả hai mặt để đối chiếu |
| `output/triz_40_print_a4.pdf` | PDF dàn in hai mặt |
| `output/triz_40_fronts.jpg`, `output/triz_40_backs.jpg` | Hai bảng tổng quan |
| `output/qa_report.md`, `output/print_instructions.md` | Lỗi còn lại và hướng dẫn in |

Dùng đường dẫn tương đối từ thư mục dự án; không hard-code tên người dùng Mac. API key chỉ lấy từ biến môi trường hoặc cơ chế bí mật được phép, không đưa vào prompt, log hoặc ảnh chụp màn hình.

## 10. Các lệnh Codex cần xây dựng

Đây là giao diện CLI đề xuất để Codex triển khai, chưa phải lệnh đang có sẵn:

```bash
python -m triz_cards validate-content
python -m triz_cards compile-prompts
python -m triz_cards generate --ids 01,09,12,23,36,40 --variants 2
python -m triz_cards render --ids 01,09,12,23,36,40
python -m triz_cards contact-sheet
python -m triz_cards generate --missing --resume
python -m triz_cards render --all
python -m triz_cards export-pdf
python -m triz_cards qa
```

`compile-prompts` ghép dữ liệu brief đã viết với style thành prompt hoàn chỉnh; không giả định Python tự viết nội dung sáng tạo nếu chưa tích hợp text model. Cần có cách chọn ứng viên rõ ràng qua CLI hoặc manifest được kiểm tra schema.

## 11. Kiểm tra chất lượng

Chấm từng lá theo thang 0–5 ở năm tiêu chí:

| Tiêu chí | Câu hỏi kiểm tra |
|---|---|
| Đúng nguyên tắc | Thay đổi trong hình có thực sự thể hiện cơ chế cần học? |
| Dễ hiểu | Xem hình rồi đọc mặt sau có hiểu được vì sao giải pháp có ích? |
| Dễ phân biệt | Hình có bằng chứng cụ thể phân biệt với nguyên tắc gần nhất? |
| Dễ đọc | Chữ, nét và chi tiết chính có rõ khi in đúng kích thước? |
| Nhất quán | Có cùng hệ màu, nét, bố cục và mức chi tiết với cả bộ? |

Ngưỡng nội bộ đề xuất: tổng ít nhất 21/25, không tiêu chí nào dưới 4; mọi lỗi sai bản chất, thiếu đối tượng then chốt hoặc chữ bị cắt đều phải sửa dù tổng điểm cao. Đây là rubric biên tập, không phải chuẩn TRIZ hay phép đo khách quan chất lượng học.

Kiểm tra tự động: đủ 40 ID, đủ 80 mặt, không placeholder, font/glyph đúng, không tràn khung, file mở được, kích thước và ghép mặt khớp, không thiếu nguồn, không dùng ảnh bị đánh dấu loại.

Kiểm tra trực quan: xem toàn bộ hai bảng tổng quan để phát hiện lệch phong cách; xem từng lá ở kích thước thật; đọc kỹ các lá khó và mọi lá đã sửa. Dùng AI thị giác hỗ trợ phát hiện lỗi nếu có, nhưng không coi điểm AI là chứng nhận đúng kiến thức.

Kiểm tra học thử: đưa sáu lá thử cho người học, yêu cầu mô tả “đã thay đổi gì” và nêu một ứng dụng mới sau khi xem mặt sau. Nếu họ chỉ nhớ màu hoặc đồ vật mà không nhớ cơ chế, sửa minh họa hoặc câu giải thích. Đây là bước kiểm tra với người thật, không tự ghi là đã thực hiện.

Những phân biệt cần rà kỹ: 01/02; 05/06; 09/10/11; 18/19; 19/20; 22/25; 35/36. Các nguyên tắc có thể cùng xuất hiện trong một giải pháp; không ép chúng loại trừ nhau. Bộ thẻ chọn một trọng tâm giảng dạy rõ cho từng lá.

## 12. Mốc bàn giao và giới hạn hoàn thành

| Mốc | Sản phẩm kiểm tra được | Điều kiện chuyển tiếp |
|---|---|---|
| M1 | 40 bản ghi nội dung và nguồn | Đủ, đúng số/tên, ví dụ giải thích được |
| M2 | Style và 40 prompt hoàn chỉnh | Mỗi prompt có cơ chế riêng, không còn chỗ trống |
| M3 | Sáu lá thử hai mặt | Cơ chế đúng, đọc được ở khổ thật, phong cách dùng được |
| M4 | 40 ảnh được chọn | Từng ảnh được kiểm tra, lưu đủ lịch sử |
| M5 | 80 mặt thẻ và PDF | Dàn trang đúng, không lỗi chữ/crop/ghép mặt |
| M6 | Gói dự án và báo cáo | Có lệnh chạy lại, danh sách kiểm tra và hạn chế thực tế |

Chưa có giá/model/quyền truy cập cụ thể thì không hứa tổng tiền hoặc thời gian chính xác. Dùng kết quả sáu lá thử để ước lượng thời gian, tỉ lệ phải tạo lại và chi phí cho 34 lá còn lại.

## 13. Prompt giao việc cho Codex desktop

Sao chép nguyên đoạn dưới vào Codex sau khi đặt file kế hoạch trong thư mục dự án:

```text
Hãy triển khai dự án tạo bộ thẻ học 40 nguyên tắc TRIZ theo file
TRIZ_40_CARDS_PLAN_MACOS.md trong thư mục này.

Mục tiêu là 40 thẻ hai mặt bằng tiếng Việt, có 40 prompt minh họa riêng,
ảnh chất lượng, 80 PNG, PDF xem và PDF dàn in. Đọc toàn bộ kế hoạch
và hướng dẫn dự án áp dụng trước khi làm.

Hãy thực hiện lần lượt M1–M6, tự giải quyết lựa chọn kỹ thuật thông thường.
Kiểm tra môi trường macOS và năng lực tạo ảnh thực tế. Tạo môi trường
Python riêng, khóa phiên bản thư viện, dùng đường dẫn di động.

Trước hết chuẩn hóa đủ 40 nguyên tắc có nguồn và biên soạn nội dung mới.
Đặc biệt: tên chính phải theo hệ thuật ngữ của GS. Phan Dũng và tài liệu
do thầy Hưởng gợi ý, với nguồn người dùng chỉ định là
https://trizvietnam.com/vi/noi-bo . Đọc phần “Yêu cầu ưu tiên của người dùng”
trong kế hoạch. Không tự dịch tên từ tiếng Anh. Lập và kiểm chứng
terminology_vi.json trước khi khóa nội dung in. Tên chuẩn, câu gợi nhớ
và tên tiếng Anh là ba trường riêng. Nếu chưa đọc được nguồn, vẫn làm
code/template/brief và nói rõ cần tài liệu nào để xác minh tên.
Viết hai ý tưởng cảnh cho mỗi lá, chọn một, rồi viết prompt hoàn chỉnh.
AI chỉ tạo vùng minh họa không chữ. Python dàn chữ Việt, số, khung,
nhãn và sơ đồ cần chính xác. Không đánh đổi tính đúng lấy vẻ đẹp.

Làm thử các lá 01,09,12,23,36,40, dàn cả hai mặt và kiểm tra trực quan
trước khi sản xuất phần còn lại. Sửa đến khi đạt rubric trong kế hoạch.
Không mặc định dừng xin duyệt từng lá. Cho tôi thấy kết quả cụ thể
nếu cần quyết định mỹ thuật hoặc thông tin bắt buộc còn thiếu.

Với tạo ảnh qua API, xác minh model, tham số, quyền truy cập và giá
từ tài liệu chính thức. Thực thi trong hạn mức/quyền sử dụng tôi đã cấp.
Không tự suy ra quyền dùng có phí chỉ từ sự hiện diện của API key.
Nếu chưa có backend hoặc hạn mức cần thiết, tiếp tục hoàn thành nội dung,
40 prompt, chương trình và bản xem trước đánh dấu placeholder; nêu rõ
điểm thiếu để tôi bổ sung, không báo đã tạo ảnh khi chưa tạo.

Xây dựng cơ chế resume và chọn ứng viên qua manifest. Không ghi đè ảnh
đã chọn. Chỉ chạy lại phần chịu ảnh hưởng khi sửa nội dung/prompt/template.
Lưu log không có bí mật. Giới hạn retry, phân biệt timeout không rõ kết quả.

Kiểm tra tất cả 80 mặt, xuất bảng tổng quan và render PDF để xem lại.
Kiểm tra tự động việc ghép mặt và tạo một tờ thử in có ID/góc định hướng.
Không tuyên bố đã in thử vật lý nếu chưa có xác nhận từ tôi.

Bàn giao code, dữ liệu, prompt, ảnh được chọn, PNG/PDF, README,
nguồn, hướng dẫn in và báo cáo kiểm tra. Nêu rõ việc nào đã thực hiện,
việc nào chưa thể xác nhận. Bắt đầu triển khai, đừng chỉ trả lại kế hoạch.
```
