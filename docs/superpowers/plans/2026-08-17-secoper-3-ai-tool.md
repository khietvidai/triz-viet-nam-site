# Kế Hoạch Triển Khai: AI SECOPER 3.0 Diagnostic Tool

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng công cụ AI SECOPER 3.0 hoàn chỉnh trên nền tảng web Astro + React, sử dụng DeepSeek API (Thinking/Reasoning Mode) để phân tích, chẩn đoán, phát biểu đúng bài toán theo chuẩn SECOPER 3.0 và liên kết trực tiếp với TRIZ AI Solver.

**Architecture:** Mở rộng Astro Action `solveSecoperProblem` tại backend kết nối DeepSeek reasoning model với system prompt chứa đầy đủ 8 phân đoạn (GĐ 0, S, E, C, OR, P, E, R), 5 van an toàn và 5 cờ đỏ vĩ mô. Frontend React Studio cung cấp giao diện dashboard tương tác phân tầng trực quan, hỗ trợ song ngữ (VI/EN), xuất PDF và chuyển giao 1-click sang TRIZ Solver.

**Tech Stack:** Astro 5, React 19, Tailwind CSS 4, Lucide React, Framer Motion, Recharts, DeepSeek API (OpenAI SDK), html2canvas, jspdf.

## Global Constraints
- Tuân thủ nghiêm ngặt quy trình SECOPER 3.0 từ file `SECOPER_3.0_hoan_thien.docx`.
- Giữ vững tính nhất quán với giao diện dark theme và phong cách thiết kế của TRIZ Việt Nam.
- Đảm bảo tính nhất quán giữa Type definitions, Schema JSON của DeepSeek, và UI Components.
- Không để xảy ra lỗi Typecheck (`npm run astro check` hoặc `npx tsc --noEmit`).

---

### Task 1: Định Nghĩa Mô Hình Dữ Liệu TypeScript & Dictionary Song Ngữ

**Files:**
- Modify: `src/types.ts`
- Modify: `src/dictionaries/vi.json`
- Modify: `src/dictionaries/en.json`

**Interfaces:**
- Produces: `FullSecoperResult`, `SecoperTriage`, `SecoperSituation`, `SecoperEvidence`, `SecoperCoreGap`, `SecoperObstacle`, `SecoperPerspective`, `SecoperEssence`, `SecoperReframe`.

- [ ] **Step 1: Mở rộng `src/types.ts` với đầy đủ các types cho SECOPER 3.0**
- [ ] **Step 2: Cập nhật `src/dictionaries/vi.json` và `src/dictionaries/en.json` với các nhãn, tiêu đề, và ví dụ mẫu cho SECOPER 3.0**
- [ ] **Step 3: Chạy type check để xác thực không bị lỗi cú pháp**

---

### Task 2: Xây Dựng Backend Action `solveSecoperProblem` & Prompt Engine SECOPER 3.0

**Files:**
- Modify: `src/actions/index.ts`

**Interfaces:**
- Consumes: DeepSeek Client, `src/types.ts`
- Produces: `actions.solveSecoperProblem({ situation, parkingLotSolutions, lang })`

- [ ] **Step 1: Viết System Prompt & User Prompt chuẩn mực SECOPER 3.0 (nạp 5 van an toàn, 5 cờ đỏ, quy tắc xếp hạng thứ bậc không cộng dồn, chốt chặn vòng lặp gia cường, incentive check, 5 cổng vàng)**
- [ ] **Step 2: Cấu hình DeepSeek API gọi với reasoning mode (`thinking: { type: 'enabled' }`) và parse an toàn JSON**
- [ ] **Step 3: Tích hợp action `solveSecoperProblem` vào export server actions của Astro**

---

### Task 3: Phát Triển Các Visual Sub-Components Cho SECOPER Studio

**Files:**
- Create: `src/components/secoper/SecoperTriageCard.tsx`
- Create: `src/components/secoper/SecoperSituationCard.tsx`
- Create: `src/components/secoper/SecoperEvidenceCard.tsx`
- Create: `src/components/secoper/SecoperCoreGapCard.tsx`
- Create: `src/components/secoper/SecoperObstacleCard.tsx`
- Create: `src/components/secoper/SecoperPerspectiveCard.tsx`
- Create: `src/components/secoper/SecoperEssenceCard.tsx`
- Create: `src/components/secoper/SecoperReframeCard.tsx`

**Interfaces:**
- Consumes: `FullSecoperResult`
- Produces: Các card chuyên dụng hiển thị trực quan dữ liệu chẩn đoán của từng giai đoạn.

- [ ] **Step 1: Xây dựng Card Triage & Parking Lot Sealed Box**
- [ ] **Step 2: Xây dựng Card Situation (Thực trạng, Mục tiêu, Guardrail, Shadow Metric, S-Curve)**
- [ ] **Step 3: Xây dựng Card Evidence (Bảng Red-Team 4 phần, Ngưỡng rủi ro)**
- [ ] **Step 4: Xây dựng Card Core Gap (5 nhãn, Ma trận phụ thuộc, Bảng xếp hạng thứ bậc Impact $\rightarrow$ Leverage, Thẻ Tách nhánh tái cấu trúc 5/5)**
- [ ] **Step 5: Xây dựng Card Obstacle (Cây nguyên nhân, Cảnh báo Vòng lặp gia cường, Incentive Check)**
- [ ] **Step 6: Xây dựng Card Perspective (Locus 4 tầng, Thẩm quyền, Bản đề xuất Escalation kèm Default-to-Action & Co-sign)**
- [ ] **Step 7: Xây dựng Card Essence & Reframe (Phát biểu Mẫu A/B, Radar 5 vùng tài nguyên, Thẻ 5 Cổng Vàng, Cơ chế Boomerang)**

---

### Task 4: Xây Dựng Toàn Bộ Giao Diện Chính `SecoperClient.tsx`

**Files:**
- Create: `src/components/SecoperClient.tsx`

**Interfaces:**
- Consumes: `actions.solveSecoperProblem`, All Secoper sub-cards, Dictionary
- Produces: Giao diện chẩn đoán tương tác hoàn chỉnh

- [ ] **Step 1: Xây dựng Hero input box, các nút preset tình huống mẫu thực chiến, ô Bãi đỗ xe giải pháp (Parking Lot)**
- [ ] **Step 2: Xây dựng Stepper/Tabs chuyển đổi mượt mà giữa các giai đoạn (Giai đoạn 0, Diagnose: S-E-C-OR-P, Define: E-R)**
- [ ] **Step 3: Tích hợp tính năng 1-Click Handoff sang TRIZ Solver (`window.location.href = /[lang]/triz?prompt=...`)**
- [ ] **Step 4: Tích hợp tính năng Xuất PDF Báo cáo chẩn đoán & Sao chép Markdown**

---

### Task 5: Tạo Trang Astro `/[lang]/secoper.astro` & Cập Nhật Navigation Header

**Files:**
- Create: `src/pages/[lang]/secoper.astro`
- Modify: `src/components/Header.astro`

**Interfaces:**
- Consumes: `SecoperClient.tsx`, Layout, Header, Footer
- Produces: Route `/[lang]/secoper` cho cả `vi` và `en`

- [ ] **Step 1: Tạo trang `src/pages/[lang]/secoper.astro` tương tự `src/pages/[lang]/triz.astro`**
- [ ] **Step 2: Cập nhật `src/components/Header.astro` thêm link "SECOPER AI"**
- [ ] **Step 3: Cập nhật `src/components/TrizClient.tsx` để nhận tham số pre-filled từ URL (nếu có handoff từ SECOPER)**

---

### Task 6: Kiểm Thử, Typecheck & Xác Minh Toàn Diện

- [ ] **Step 1: Chạy `npm run astro check` và `npx tsc --noEmit` để đảm bảo 0 lỗi TypeScript**
- [ ] **Step 2: Chạy thử `npm run build` để kiểm tra quá trình build production không có lỗi**
- [ ] **Step 3: Xác minh luồng chạy thực tế của công cụ SECOPER AI trên trình duyệt**
