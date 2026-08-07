# TRIZ AI AGENT - BẢN THIẾT KẾ HOÀN CHỈNH v5.2.1 (FINAL)

> **Version:** 5.2.1 PRODUCTION READY  
> **Updated:** 2025-01-XX  
> **Status:** ✅ All Critical Patches + Deployment Notes Applied  
> **Author:** Project Owner & TRIZ Level 5 Certified

---

## 📋 CHANGELOG v5.1 → v5.2 → v5.2.1

### v5.2.1 (Current) - Deployment Notes
| Issue | Solution | Status |
|-------|----------|--------|
| Context không được carry-over khi Path A/B → Path C | Thêm **Context Injection Protocol** với prediction_mode flag | ✅ Fixed |
| STC Operator giọng robot, không kích thích sáng tạo | Thêm **Tone Guidelines** với prompts playful/provocative | ✅ Fixed |
| Final Report thiếu navigation tới các files thành phần | Thêm **File Index Auto-Generation** với relative paths | ✅ Fixed |

### v5.2 - Tri-Core Architecture
| Issue | Problem | Solution | Status |
|-------|---------|----------|--------|
| #1 | Trends of Evolution bị nhét sai chỗ trong Path A | Tách thành **Path C** độc lập (Future Prediction Mode) | ✅ Fixed |
| #2 | Thiếu công cụ phá vỡ Quán tính tâm lý | Thêm **STC Operator Mini-Game** ở Phase 1.5 | ✅ Fixed |
| #3 | Vòng lặp vô tận ở Flow C | Thêm **MAX_RECURSION_DEPTH = 1** | ✅ Fixed |
| #4 | User Fatigue (quy trình quá dài) | Thêm **Checkpoint Save System** | ✅ Fixed |

---

## TRIẾT LÝ THIẾT KẾ

**Mục tiêu:** Xây dựng AI Agent hoạt động như một "Mentor TRIZ khó tính" - không cho phép nhảy cóc tư duy, buộc người dùng đi qua từng cổng logic trước khi tiến tiếp.

**Nguyên tắc cốt lõi:**
- **Explainable:** Mỗi bước đều có file output minh bạch
- **Contestable:** User có thể tranh biện nhưng phải có logic
- **Non-compromising:** TRIZ không chấp nhận trade-off, phải giải triệt để mâu thuẫn
- **Fatigue-aware:** Checkpoint system cho phép tạm dừng và tiếp tục ⭐ NEW v5.2

---

## TỔNG QUAN KIẾN TRÚC (TRI-CORE ENGINE) ⭐ UPDATED v5.2

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                    TRIZ AI AGENT - TRI-CORE ARCHITECTURE v5.2                    │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  INPUT → SCREEN → [STC OPERATOR] → SYSTEM ANALYSIS → FUNCTION MODEL → AI ROUTER │
│    ↓        ↓           ↓               ↓               ↓               ↓        │
│  raw.md  screen.md  stc.md ⭐NEW   system.md    function.md      [CLASSIFIER]   │
│                                                                                  │
│  [Gate 0] [Gate 1]  [Gate 1.5]    [Gate 2]       [Gate 2.5]          │          │
│                        ⭐NEW                                          │          │
│                    ┌─────────────────────────────┴─────────────────────┐        │
│                    ↓                             ↓                     ↓        │
│     ┌──────────────────────────┐  ┌──────────────────────────┐  ┌────────────┐ │
│     │   PATH A: CONTRADICTION  │  │   PATH B: SU-FIELD       │  │  PATH C:   │ │
│     │   "Được A thì mất B"     │  │   "Harmful / Ineffective"│  │  TRENDS ⭐ │ │
│     ├──────────────────────────┤  ├──────────────────────────┤  │  NEW v5.2  │ │
│     │ ↓ IFR                    │  │ ↓ Su-Field Model         │  ├────────────┤ │
│     │ ↓ Technical/Physical     │  │   (S1-S2-Field)          │  │ ↓ 8 Trends │ │
│     │   Contradiction          │  │ ↓ 76 Standard Solutions  │  │ ↓ S-Curve  │ │
│     │ ↓ Proxy Mapping (50→39)  │  │                          │  │ ↓ Forecast │ │
│     │ ↓ Matrix 39×39           │  │                          │  │            │ │
│     │ ↓ 40 Principles          │  │                          │  │            │ │
│     └───────────┬──────────────┘  └───────────┬──────────────┘  └─────┬──────┘ │
│                 │                             │                       │         │
│                 └─────────────┬───────────────┴───────────────────────┘         │
│                               ↓                                                  │
│                    SOLUTION GENERATION                                           │
│                         ↓                                                        │
│                    [RECURSION LIMITER] ⭐ NEW v5.2                               │
│                         ↓                                                        │
│                    EVALUATION & RANKING                                          │
│                         ↓                                                        │
│                    FINAL REPORT                                                  │
│                                                                                  │
│  ═══════════════════════════════════════════════════════════════════════════    │
│  [CHECKPOINT SYSTEM] - Save/Resume at any Phase ⭐ NEW v5.2                      │
│  ═══════════════════════════════════════════════════════════════════════════    │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘

KEY FEATURES - VERSION 5.2 (TRI-CORE):
┌────────────────────────────────────────────────────────────────────────────────┐
│ ✓ Function Analysis (S-A-O)  │ Cầu nối ngôn ngữ tự nhiên → ngôn ngữ TRIZ       │
│ ✓ AI Router                  │ Phân loại: Contradiction vs Harmful vs Forecast │
│ ✓ Tri-Core Paths             │ Path A (Matrix) + Path B (Su-Field) + Path C    │
│ ✓ STC Operator ⭐ NEW        │ Phá vỡ quán tính tâm lý trước khi phân tích     │
│ ✓ Recursion Limiter ⭐ NEW   │ Giới hạn Secondary Loop = 1 cấp                 │
│ ✓ Checkpoint System ⭐ NEW   │ Save/Resume cho quy trình dài                   │
│ ✓ Path C: Trends ⭐ NEW      │ 8 quy luật phát triển cho Future Prediction     │
│ ✓ Proxy Mapping              │ Map 50 params → 39 params khi tra Matrix        │
│ ✓ 50 Parameters (Mann)       │ 39 Technical + 11 Business (Darrell Mann)       │
│ ✓ 6/9 Screen Adaptive        │ Tìm nguyên nhân vs Dự đoán tương lai            │
│ ✓ Root Cause Engine          │ 95% user fail ở bước này → AI hướng dẫn         │
│ ✓ Contextualization          │ Dịch nguyên lý sang domain của user             │
│ ✓ No Compromise Gates        │ AI không chấp nhận trade-off                    │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🆕 CHECKPOINT SYSTEM (NEW v5.2)

### Mục đích
Quy trình TRIZ có 9 phases, tốn nhiều năng lượng tư duy. User cần khả năng tạm dừng và tiếp tục.

### Checkpoint Trigger Points

```
┌────────────────────────────────────────────────────────────────┐
│                    CHECKPOINT LOCATIONS                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Phase 0: Input Collection          → checkpoint_00            │
│  Phase 1: TRIZ Screening            → checkpoint_01            │
│  Phase 1.5: STC Operator ⭐NEW      → checkpoint_01b           │
│  Phase 2: System Analysis           → checkpoint_02 ⭐CRITICAL │
│  Phase 2.5: Function Model          → checkpoint_02c           │
│  Phase 2.6: Router Decision         → checkpoint_02d           │
│  Phase 3-5: Path Execution          → checkpoint_path          │
│  Phase 6: Solution Generation       → checkpoint_06            │
│  Phase 7: Evaluation                → checkpoint_07            │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Checkpoint File Format

```yaml
# /triz_project_[uuid]/checkpoint/latest.yaml
---
checkpoint_id: "cp_02_20250115_103500"
project_uuid: "abc123..."
phase_completed: 2
phase_name: "System Analysis"
timestamp: "2025-01-15T10:35:00Z"
user_id: "user_xxx"
state:
  input_confirmed: true
  triz_fit_score: 85
  screen_mode: "6_screen"
  root_cause_confidence: 78
  files_generated:
    - "00_input_raw.md"
    - "01_screening.md"
    - "01b_stc_operator.md"
    - "02a_system_analysis.md"
resume_command: "resume cp_02_20250115_103500"
---
```

### User Commands

```
AI: "Bạn đã hoàn thành Phase 2 (System Analysis). 
     
     Đây là điểm tốn nhiều năng lượng nhất. 
     Bạn muốn tiếp tục hay lưu lại để mai làm tiếp?
     
     [1] Tiếp tục ngay
     [2] Lưu checkpoint và tạm dừng
     
     Nếu chọn [2], bạn có thể gõ: resume cp_02_20250115_103500
     để tiếp tục bất kỳ lúc nào."
```

### Resume Protocol

```
User: "resume cp_02_20250115_103500"

AI: "✅ Đã load checkpoint: Phase 2 - System Analysis (hoàn thành)
     
     📋 Tóm tắt tiến độ:
     - Vấn đề: [summary từ input]
     - Nguyên nhân gốc: [root cause identified]
     - Độ tin cậy: 78%
     
     Tiếp theo: Phase 2.5 - Function Analysis (S-A-O)
     
     Bạn sẵn sàng tiếp tục chứ?"
```

---

## PHASE 0: INPUT COLLECTION
**Output:** `00_input_raw.md`

### Hành động
| Step | Action | Logic |
|------|--------|-------|
| 0.1 | Thu nhận input (text/voice/file/data) | Parse → text chuẩn hóa |
| 0.2 | Tóm tắt thành 1 đoạn coherent | Loại noise, giữ signal |
| 0.3 | Hỏi xác nhận | "Tôi hiểu vấn đề của bạn là... Đúng chưa?" |

### Gate 0: Confirmation
```
User confirms → Proceed
User corrects → Update & re-confirm
```

**💾 Checkpoint Available: checkpoint_00**

---

## PHASE 1: TRIZ SCREENING
**Output:** `01_screening.md`

### Hành động
| Step | Action | Output |
|------|--------|--------|
| 1.1 | Phân loại domain | TECHNICAL / BUSINESS / PROCESS / MIXED |
| 1.2 | Detect contradiction | Có trade-off? Có xung đột? |
| 1.3 | TRIZ Fit Score | 0-100% |

### Gate 1: Decision
```
Score ≥ 70%  → TRIZ Full Pipeline
Score 30-69% → ⭐ TRIGGER STC OPERATOR (Phase 1.5) → TRIZ + Hybrid
Score < 30%  → Redirect to other framework, END
```

### Ruling Logic
- **Không có mâu thuẫn** → Không phải bài toán TRIZ → Redirect
- **Chỉ thiếu ý tưởng** → Brainstorming thường, không cần TRIZ
- **Có xung đột rõ ràng** → TRIZ phù hợp

**💾 Checkpoint Available: checkpoint_01**

---

## 🆕 PHASE 1.5: STC OPERATOR (Phá vỡ Quán tính Tâm lý) - NEW v5.2
**Output:** `01b_stc_operator.md`

### Mục đích
Khi TRIZ Fit Score nằm trong vùng "nghi ngờ" (30-69%), user có thể đang mang tư duy lối mòn vào định nghĩa bài toán. STC Operator giúp "làm mềm" tư duy trước khi đi sâu.

### Khi nào kích hoạt

```
┌────────────────────────────────────────────────────────────────┐
│                    STC OPERATOR TRIGGER                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  TRIZ Fit Score:                                               │
│                                                                │
│  ≥ 70%  → Skip STC, đi thẳng Phase 2                          │
│  30-69% → ⭐ TRIGGER STC OPERATOR                              │
│  < 30%  → Not TRIZ problem, redirect                          │
│                                                                │
│  HOẶC:                                                         │
│                                                                │
│  User nói: "Không thể làm được" / "Bất khả thi"               │
│  → ⭐ TRIGGER STC OPERATOR (bất kể score)                      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### STC Operator Process

```
┌────────────────────────────────────────────────────────────────┐
│                    STC OPERATOR MINI-GAME                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  S = SIZE (Kích thước)                                         │
│  T = TIME (Thời gian)                                          │
│  C = COST (Chi phí)                                            │
│                                                                │
│  ═══════════════════════════════════════════════════════════  │
│                                                                │
│  BƯỚC 1: PHÓNG ĐẠI VÔ HẠN                                     │
│  ─────────────────────────                                     │
│  AI: "Hãy tưởng tượng bạn có:                                 │
│       • Ngân sách VÔ HẠN                                       │
│       • Thời gian VÔ HẠN                                       │
│       • Kích thước có thể LỚN VÔ TẬN hoặc NHỎ VÔ TẬN         │
│                                                                │
│       Với những điều kiện đó, giải pháp lý tưởng là gì?"      │
│                                                                │
│  User trả lời → AI ghi nhận "Ideal Vision"                    │
│                                                                │
│  ═══════════════════════════════════════════════════════════  │
│                                                                │
│  BƯỚC 2: THU NHỎ DẦN                                          │
│  ─────────────────────                                         │
│  AI: "Bây giờ hãy dần dần thu hẹp lại:                        │
│                                                                │
│       • Nếu ngân sách chỉ còn 50% → Giữ được gì?              │
│       • Nếu thời gian chỉ còn 1 tháng → Cắt gì?               │
│       • Nếu kích thước bị giới hạn → Thay đổi gì?"            │
│                                                                │
│  User trả lời → AI ghi nhận "Constrained Vision"              │
│                                                                │
│  ═══════════════════════════════════════════════════════════  │
│                                                                │
│  BƯỚC 3: TÌM MÂU THUẪN ẨN                                     │
│  ─────────────────────────                                     │
│  AI so sánh:                                                   │
│  "Ideal Vision" vs "Constrained Vision"                        │
│                                                                │
│  → Sự khác biệt chính là đâu?                                 │
│  → ĐÓ chính là MÂU THUẪN CỐT LÕI cần giải quyết!             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### STC Operator Output Format

```yaml
---
file_id: 01b_stc_operator
trigger_reason: "triz_fit_score_in_gray_zone" | "user_said_impossible"
triz_fit_score_before: 45
---

# STC OPERATOR SESSION

## Bước 1: Ideal Vision (Vô hạn)
**User's Ideal:** "Nếu có ngân sách vô hạn, tôi sẽ thuê 100 người 
và hoàn thành trong 1 tuần với chất lượng hoàn hảo."

## Bước 2: Constrained Vision (Thực tế)
**50% Budget:** "Chỉ thuê được 10 người"
**1 Month Only:** "Phải cắt bớt features"
**Size Limit:** "Chỉ làm MVP"

## Bước 3: Hidden Contradiction Discovered
**Mâu thuẫn ẩn được phát hiện:**
"Muốn CHẤT LƯỢNG CAO nhưng NGUỒN LỰC HẠN CHẾ"

→ Đây là Technical Contradiction:
- Improving: #27 Reliability (Chất lượng)
- Worsening: #22 Loss of Energy (Nguồn lực)

## Kết quả
- TRIZ Fit Score điều chỉnh: 45% → 82% ⭐
- Lý do: Đã phát hiện mâu thuẫn rõ ràng qua STC

→ Proceed to Phase 2
```

### Gate 1.5: STC Validation
```
Mâu thuẫn được phát hiện qua STC? 
   YES → Điều chỉnh TRIZ Fit Score lên ≥70%, tiếp tục Phase 2
   NO  → Xác nhận đây không phải bài toán TRIZ, redirect
```

**💾 Checkpoint Available: checkpoint_01b**

---

## PHASE 2: SYSTEM ANALYSIS & ROOT CAUSE DISCOVERY
**Output:** `02_system_analysis.md`

### 2A. Mode Selection: 6-Screen vs 9-Screen

**Critical Insight:** 95% người dùng TRIZ thất bại ở việc xác định bài toán và nguyên nhân. AI phải hướng dẫn thu thập thông tin có mục đích, không để user "thử và sai".

```
┌────────────────────────────────────────────────────────────────┐
│                    SCREEN MODE SELECTOR                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  AI hỏi: "Mục tiêu chính của bạn là gì?"                      │
│                                                                │
│  ┌──────────────────────┐    ┌──────────────────────┐         │
│  │ A. TÌM NGUYÊN NHÂN   │    │ B. DỰ ĐOÁN XU HƯỚNG  │         │
│  │    vấn đề hiện tại   │    │    phát triển tương  │         │
│  │                      │    │    lai               │         │
│  │    → 6 SCREENS       │    │    → 9 SCREENS       │         │
│  │    (Past + Present)  │    │    (Past+Present+    │         │
│  │                      │    │     Future)          │         │
│  │    → Path A hoặc B   │    │    → Path C ⭐NEW    │         │
│  └──────────────────────┘    └──────────────────────┘         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 2B. 6-Screen Analysis (Root Cause Mode)

**Dùng khi:** Cần tìm nguyên nhân gốc rễ của vấn đề hiện tại

```
┌─────────────────────────────┬─────────────────────────────┐
│         PAST                │         PRESENT             │
├─────────────────────────────┼─────────────────────────────┤
│                             │                             │
│  [1] Super-system           │  [2] Super-system           │
│  Môi trường trước đây       │  Môi trường hiện tại        │
│  - Thị trường ra sao?       │  - Thị trường thế nào?      │
│  - Đối thủ làm gì?          │  - Áp lực từ đâu?           │
│  - Quy định nào?            │  - Constraints nào?         │
│                             │                             │
├─────────────────────────────┼─────────────────────────────┤
│                             │                             │
│  [3] System                 │  [4] SYSTEM (FOCUS)         │
│  Hệ thống trước đây         │  Hệ thống hiện tại          │
│  - Nó hoạt động thế nào?    │  - Vấn đề ở đâu?            │
│  - Có vấn đề gì không?      │  - Triệu chứng là gì?       │
│  - Khi nào bắt đầu tệ?      │  - Ai bị ảnh hưởng?         │
│                             │                             │
├─────────────────────────────┼─────────────────────────────┤
│                             │                             │
│  [5] Sub-system             │  [6] Sub-system             │
│  Thành phần trước đây       │  Thành phần hiện tại        │
│  - Parts nào đã thay đổi?   │  - Part nào đang hỏng?      │
│  - Quy trình cũ ra sao?     │  - Bottleneck ở đâu?        │
│  - Ai phụ trách trước?      │  - Ai đang gánh vác?        │
│                             │                             │
└─────────────────────────────┴─────────────────────────────┘
```

### 2C. 9-Screen Analysis (Future Prediction Mode)

**Dùng khi:** Cần dự đoán xu hướng hoặc thiết kế giải pháp dài hạn → **Kích hoạt Path C**

```
┌─────────────────┬─────────────────┬─────────────────┐
│   PAST          │   PRESENT       │   FUTURE        │
├─────────────────┼─────────────────┼─────────────────┤
│ [1] Super       │ [2] Super       │ [3] Super       │
│ Môi trường cũ   │ Môi trường nay  │ Môi trường sẽ   │
├─────────────────┼─────────────────┼─────────────────┤
│ [4] System      │ [5] SYSTEM      │ [6] System      │
│ Hệ thống cũ     │ (FOCUS)         │ Hệ thống sẽ     │
├─────────────────┼─────────────────┼─────────────────┤
│ [7] Sub         │ [8] Sub         │ [9] Sub         │
│ Thành phần cũ   │ Thành phần nay  │ Thành phần sẽ   │
└─────────────────┴─────────────────┴─────────────────┘
```

### 2D. ROOT CAUSE DISCOVERY ENGINE

*(Giữ nguyên từ v5.1 - không thay đổi)*

### Gate 2: Root Cause Validation
```
Root Cause Confidence ≥ 70%?
    YES → Present root cause to user → Proceed to Phase 2.5
    NO  → Collect more info → Loop until confidence ≥ 70%
```

**💾 Checkpoint Available: checkpoint_02** ⭐ CRITICAL SAVE POINT

---

## PHASE 2.5: FUNCTION ANALYSIS (S-A-O)
**Output:** `02c_function_model.md`

*(Giữ nguyên từ v5.1)*

**💾 Checkpoint Available: checkpoint_02c**

---

## PHASE 2.6: AI ROUTER (CLASSIFIER) ⭐ UPDATED v5.2
**Output:** `02d_router_decision.md`

### Router Decision Logic - TRI-CORE

```
┌────────────────────────────────────────────────────────────────┐
│                    AI ROUTER LOGIC v5.2                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Phân tích Function Model từ Phase 2.5                         │
│  + Screen Mode từ Phase 2A                                     │
│                    ↓                                           │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │  QUESTION 1: User chọn 9-Screen Mode?                    │ │
│  │                                                          │ │
│  │      YES → Có vấn đề hiện tại không?                     │ │
│  │            │                                             │ │
│  │            ├── YES → Path A/B (solve) THEN Path C        │ │
│  │            └── NO  → PATH C (Trends Only)                │ │
│  │                                                          │ │
│  │      NO → QUESTION 2: Có TRADE-OFF không?                │ │
│  │           │                                              │ │
│  │           ├── YES → PATH A (Contradiction)               │ │
│  │           └── NO  → PATH B (Su-Field)                    │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  DECISION TREE:                                                │
│                                                                │
│       ┌───────────────────┐                                   │
│       │ 9-Screen Mode?    │                                   │
│       └────────┬──────────┘                                   │
│                │                                               │
│       ┌────────┴────────┐                                     │
│      YES               NO                                      │
│       │                 │                                      │
│       ▼                 ▼                                      │
│  ┌─────────┐     ┌─────────────┐                              │
│  │ Has     │     │ Trade-off?  │                              │
│  │ Current │     └──────┬──────┘                              │
│  │ Problem?│            │                                      │
│  └────┬────┘      ┌─────┴─────┐                               │
│       │          YES         NO                                │
│   ┌───┴───┐       │           │                               │
│  YES     NO       ▼           ▼                               │
│   │       │   ┌───────┐   ┌───────┐                           │
│   ▼       ▼   │PATH A │   │PATH B │                           │
│ A/B→C   PATH C│Matrix │   │Su-Field│                          │
│          │    └───────┘   └───────┘                           │
│          ▼                                                     │
│     ┌────────┐                                                 │
│     │PATH C  │                                                 │
│     │Trends  │                                                 │
│     └────────┘                                                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Gate 2.6: Router Confirmation
```
AI presents routing decision with rationale
User confirms → Proceed to respective Path
User disagrees → Re-analyze Function Model
```

**💾 Checkpoint Available: checkpoint_02d**

---

## PHASE 2B: RESOURCE INVENTORY (Chạy song song)
**Output:** `02b_resources.md`

*(Giữ nguyên từ v5.1)*

---

# ═══════════════════════════════════════════════════════════════
# PATH A: CONTRADICTION RESOLUTION (Matrix → 40 Principles)
# ═══════════════════════════════════════════════════════════════

*(Giữ nguyên Phase 3A, 4A, 5A từ v5.1)*

**LƯU Ý QUAN TRỌNG v5.2:** 
- Đã **LOẠI BỎ** mục 5A.3 (Trends of Evolution) khỏi Path A
- Trends được chuyển sang Path C riêng biệt

---

# ═══════════════════════════════════════════════════════════════
# PATH B: SU-FIELD ANALYSIS (76 Standard Solutions)
# ═══════════════════════════════════════════════════════════════

*(Giữ nguyên Phase 3B, 4B, 5B từ v5.1)*

---

# ═══════════════════════════════════════════════════════════════
# 🆕 PATH C: TRENDS OF EVOLUTION (Future Prediction) - NEW v5.2
# ═══════════════════════════════════════════════════════════════

## PHASE 3C: S-CURVE POSITIONING
**Output:** `03c_scurve.md`

### Mục đích
Xác định hệ thống đang ở giai đoạn nào của vòng đời để dự đoán hướng phát triển.

### S-Curve Model

```
┌────────────────────────────────────────────────────────────────┐
│                    S-CURVE LIFE CYCLE                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Performance                                                   │
│      │                                    ┌──────┐             │
│      │                                 ───┤MATURE├──────       │
│      │                              ╱     └──────┘             │
│      │                           ╱                             │
│      │                 ┌──────┐╱                              │
│      │              ───┤GROWTH├                                │
│      │           ╱     └──────┘                               │
│      │        ╱                                                │
│      │  ┌─────┐                                               │
│      │──┤BIRTH├───                                            │
│      │  └─────┘                                               │
│      └──────────────────────────────────────────────► Time    │
│                                                                │
│  STAGE INDICATORS:                                             │
│  ────────────────                                              │
│  BIRTH:  Few patents, high R&D cost, low performance          │
│  GROWTH: Many patents, improving rapidly, competition enters  │
│  MATURE: Patent decline, diminishing returns, commoditized    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### AI S-Curve Analysis

```
AI hỏi:
"Để xác định vị trí của hệ thống trên S-Curve, hãy trả lời:

1. Số lượng patent/sáng kiến trong lĩnh vực này:
   □ Rất ít (Birth)  □ Đang tăng mạnh (Growth)  □ Giảm dần (Mature)

2. Chi phí R&D so với output:
   □ Cao/Thấp (Birth)  □ Tối ưu (Growth)  □ Giảm hiệu quả (Mature)

3. Đối thủ cạnh tranh:
   □ Gần như không có (Birth)  □ Nhiều (Growth)  □ Consolidation (Mature)

4. Khách hàng:
   □ Early adopters (Birth)  □ Mainstream (Growth)  □ Commodity buyers (Mature)"
```

### Gate 3C: S-Curve Position Confirmation
```
AI confirms S-Curve position → User validates → Proceed to Phase 4C
```

---

## PHASE 4C: 8 TRENDS OF EVOLUTION
**Output:** `04c_trends.md`

### 8 Quy luật Phát triển Hệ thống (TESE)

```
┌────────────────────────────────────────────────────────────────┐
│              8 TRENDS OF EVOLUTION (TESE)                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  1. STAGES OF EVOLUTION                                        │
│     Mọi hệ thống đều đi qua: Birth → Growth → Maturity        │
│     → Prediction: Hệ thống sẽ tiến hóa hoặc bị thay thế       │
│                                                                │
│  2. EVOLUTION TOWARD INCREASED IDEALITY                        │
│     Ideality = Benefits / (Costs + Harms) → ∞                  │
│     → Prediction: Hệ thống sẽ giảm phần cứng, tăng phần mềm   │
│                                                                │
│  3. NON-UNIFORM EVOLUTION OF SUBSYSTEMS                        │
│     Các subsystem phát triển không đều                         │
│     → Prediction: Bottleneck subsystem cần được nâng cấp      │
│                                                                │
│  4. EVOLUTION TOWARD INCREASED DYNAMISM                        │
│     Rigid → Jointed → Flexible → Fluid → Field                │
│     → Prediction: Hệ thống sẽ trở nên linh hoạt hơn           │
│                                                                │
│  5. EVOLUTION WITH MATCHING/MISMATCHING                        │
│     Hệ thống tối ưu khi các component "match" nhau            │
│     → Prediction: Sẽ có sự điều chỉnh để harmonize            │
│                                                                │
│  6. EVOLUTION TOWARD MICRO-LEVEL                               │
│     Macro → Micro → Nano → Field                               │
│     → Prediction: Hệ thống sẽ thu nhỏ/phi vật chất hóa        │
│                                                                │
│  7. EVOLUTION TOWARD DECREASED HUMAN INVOLVEMENT               │
│     Manual → Mechanized → Automated → Autonomous               │
│     → Prediction: AI/Automation sẽ thay thế human tasks       │
│                                                                │
│  8. EVOLUTION TOWARD INCREASED USE OF FIELDS                   │
│     Substance-based → Field-based (EM, Acoustic, Thermal...)   │
│     → Prediction: Physical → Digital/Virtual transformation   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Trend Application Matrix

| S-Curve Position | Most Relevant Trends | Action |
|------------------|---------------------|--------|
| **BIRTH** | #1 (Stages), #3 (Non-uniform) | Focus on core function, identify weak subsystems |
| **GROWTH** | #4 (Dynamism), #5 (Matching) | Optimize flexibility, harmonize components |
| **MATURE** | #2 (Ideality), #6 (Micro), #7 (Automation) | Prepare for disruption, explore next-gen tech |

### AI Trend Forecast Output

```markdown
## TREND FORECAST REPORT

### Current S-Curve Position: GROWTH

### Applicable Trends & Predictions

#### Trend #4: Evolution Toward Increased Dynamism
**Current State:** Rigid organizational structure
**Prediction:** Within 2-3 years, industry will shift to flexible/project-based models
**Evidence:** [Competitor X đã làm, Market signal Y]
**Recommendation:** Begin piloting flexible structures now

#### Trend #7: Decreased Human Involvement
**Current State:** 60% manual processes
**Prediction:** Industry benchmark is 30% manual, 70% automated
**Evidence:** [Technology Z is mature, ROI positive]
**Recommendation:** Automate high-volume, low-complexity tasks first
```

---

## PHASE 5C: FUTURE SYSTEM DESIGN
**Output:** `05c_future_system.md`

### IFR cho Future System

```
Hệ thống tương lai TỰ NÓ [evolves theo trend X]
mà KHÔNG cần [major restructuring]
và KHÔNG gây ra [disruption to current operations]
trong khi [vượt qua đối thủ cạnh tranh]
```

### Roadmap Generation

```
┌────────────────────────────────────────────────────────────────┐
│              FUTURE EVOLUTION ROADMAP                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  NOW ─────────────────────────────────────────────► FUTURE    │
│   │                                                            │
│   │  Q1-Q2: PREPARE                                           │
│   │  ├── Skill gap analysis                                   │
│   │  ├── Technology assessment                                │
│   │  └── Pilot program design                                 │
│   │                                                            │
│   │  Q3-Q4: PILOT                                             │
│   │  ├── Small-scale implementation                           │
│   │  ├── Measure & learn                                      │
│   │  └── Refine approach                                      │
│   │                                                            │
│   │  Y2: SCALE                                                │
│   │  ├── Full rollout                                         │
│   │  ├── Organization change                                  │
│   │  └── New capability building                              │
│   │                                                            │
│   ▼  Y3+: OPTIMIZE                                            │
│      ├── Continuous improvement                               │
│      └── Next evolution cycle                                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

# ═══════════════════════════════════════════════════════════════
# MERGED PATH: SOLUTION GENERATION & EVALUATION
# ═══════════════════════════════════════════════════════════════

## PHASE 6: SOLUTION GENERATION
**Output:** `06_giaiphap_phacthao.md`

*(Giữ nguyên Resource Injection + Analogical Reasoning từ v5.1)*

**💾 Checkpoint Available: checkpoint_06**

---

## 🆕 PHASE 6.5: RECURSION LIMITER (NEW v5.2)
**Output:** `06b_secondary_check.md`

### Mục đích
Ngăn chặn vòng lặp vô tận khi giải pháp tạo ra vấn đề mới.

### Recursion Limiter Logic

```
┌────────────────────────────────────────────────────────────────┐
│                    RECURSION LIMITER v5.2                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  CONFIG:                                                       │
│  MAX_RECURSION_DEPTH = 1                                       │
│                                                                │
│  ═══════════════════════════════════════════════════════════  │
│                                                                │
│  GIẢI PHÁP ĐƯỢC ĐỀ XUẤT                                       │
│           ↓                                                    │
│  AI CHECK: "Giải pháp này có tạo ra vấn đề mới không?"        │
│           ↓                                                    │
│      ┌────┴────┐                                               │
│     YES        NO                                              │
│      │          │                                              │
│      ▼          ▼                                              │
│  RECURSION   PROCEED                                           │
│  DEPTH += 1  to Phase 7                                        │
│      │                                                         │
│      ▼                                                         │
│  DEPTH > 1?                                                    │
│      │                                                         │
│  ┌───┴───┐                                                     │
│ YES     NO                                                     │
│  │       │                                                     │
│  ▼       ▼                                                     │
│ STOP    MINI-LOOP                                              │
│ ⚠️      (Phase 4-6                                             │
│         for secondary                                          │
│         problem ONLY)                                          │
│  │                                                             │
│  ▼                                                             │
│ FLAG SOLUTION:                                                 │
│ "⚠️ LOW IDEALITY / COMPLEX"                                   │
│                                                                │
│ SUGGEST:                                                       │
│ "Giải pháp này tạo ra chuỗi vấn đề phụ.                       │
│  Khuyến nghị:                                                  │
│  1. Quay lại chọn nguyên lý/standard khác                     │
│  2. Re-evaluate Root Cause (có thể đã định nghĩa sai)"        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Secondary Problem Detection Prompt

```
AI: "Tôi đã phân tích giải pháp đề xuất.

     ⚠️ SECONDARY PROBLEM DETECTED:
     
     Giải pháp gốc: [Description]
     
     Vấn đề phụ phát sinh: [New problem]
     
     ═══════════════════════════════════════════
     
     Đây là vấn đề phụ CẤP 1. Tôi sẽ giải quyết nó.
     
     Nếu việc giải quyết lại tạo ra vấn đề phụ CẤP 2,
     tôi sẽ DỪNG LẠI vì giải pháp này có Ideality thấp.
     
     Bạn có muốn tiếp tục không?"
```

### Recursion Limiter Output Format

```yaml
---
file_id: 06b_secondary_check
recursion_depth: 1
max_depth: 1
status: within_limit | limit_reached
primary_solution:
  id: 2
  description: "Phân module dịch vụ"
secondary_problems:
  - level: 1
    description: "Quản lý inventory phức tạp hơn"
    resolved: true
    resolution: "Dùng platform quản lý tập trung"
  - level: 2
    description: "Chi phí platform cao"
    resolved: false
    reason: "LIMIT REACHED - MAX_RECURSION_DEPTH = 1"
recommendation: "reject_solution" | "accept_with_caveat" | "accept"
---

# SECONDARY PROBLEM CHECK

## Primary Solution
**ID:** #2 - Modular Service Packages
**Status:** Secondary problem detected

## Level 1 Secondary Problem
**Problem:** Quản lý inventory phức tạp hơn khi có nhiều modules
**Resolution:** Dùng platform quản lý inventory tập trung
**Status:** ✅ Resolved

## Level 2 Secondary Problem
**Problem:** Chi phí platform quản lý cao
**Status:** ⚠️ LIMIT REACHED

## AI Recommendation
Giải pháp #2 tạo ra chuỗi vấn đề 2 cấp. 

**Ideality Assessment:** LOW
- Benefits: +3 (modular, flexible, scalable)
- Costs: +2 (inventory mgmt, platform cost)
- Net Ideality Change: +1 (marginal)

**Recommendation:** 
Xem xét giải pháp #3 hoặc #4 có thể có Ideality cao hơn.
Hoặc re-evaluate Root Cause - có thể vấn đề không phải ở service packaging.
```

---

## PHASE 7: EVALUATION & RANKING
**Output:** `07_danhgia.md`

*(Giữ nguyên từ v5.1)*

**💾 Checkpoint Available: checkpoint_07**

---

## PHASE 8: FINAL OUTPUT
**Output:** `08_final_report.md`

*(Giữ nguyên từ v5.1)*

---

## SPECIAL FLOWS (UPDATED v5.2)

### Flow A: User Disagreement Protocol
*(Giữ nguyên từ v5.1)*

### Flow B: Physical Law Violation
*(Giữ nguyên từ v5.1)*

### Flow C: Secondary Problem Loop ⭐ UPDATED v5.2

```
┌────────────────────────────────────────────────────────────────┐
│              FLOW C: SECONDARY PROBLEM (v5.2)                  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Solution creates new problem                                  │
│           ↓                                                    │
│  Flag as "Secondary Contradiction"                             │
│           ↓                                                    │
│  CHECK: recursion_depth < MAX_RECURSION_DEPTH (1)?            │
│           ↓                                                    │
│      ┌────┴────┐                                               │
│     YES        NO                                              │
│      │          │                                              │
│      ▼          ▼                                              │
│  Mini-loop:   STOP IMMEDIATELY                                 │
│  Phase 4-6    │                                                │
│  for new      ▼                                                │
│  problem      Flag solution as "Low Ideality"                  │
│      │        Suggest: Re-evaluate or choose different        │
│      │               principle/standard                        │
│      ▼                                                         │
│  Integrate solution                                            │
│      │                                                         │
│      ▼                                                         │
│  NEW PROBLEM from integration?                                 │
│      │                                                         │
│  ┌───┴───┐                                                     │
│ YES     NO                                                     │
│  │       │                                                     │
│  ▼       ▼                                                     │
│ STOP    PROCEED                                                │
│ (limit  to Phase 7                                             │
│ reached)                                                       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Flow D: Multi-Problem Decomposition
*(Giữ nguyên từ v5.1)*

---

## FILE STRUCTURE (TRI-CORE v5.2)

```
/triz_project_[uuid]/
│
├── checkpoint/                    # ⭐ NEW v5.2
│   ├── latest.yaml
│   ├── cp_00_[timestamp].yaml
│   ├── cp_01_[timestamp].yaml
│   └── ...
│
├── 00_input_raw.md
├── 01_screening.md
├── 01b_stc_operator.md            # ⭐ NEW v5.2
├── 02a_system_analysis.md
├── 02b_resources.md
├── 02c_function_model.md
├── 02d_router_decision.md
│
├── path_a/                        # CONTRADICTION PATH
│   ├── 03a_ifr.md
│   ├── 04a_mauthuan.md
│   └── 05a_principles.md          # Đã loại bỏ Trends
│
├── path_b/                        # SU-FIELD PATH
│   ├── 03b_sufield_model.md
│   ├── 04b_76_standards.md
│   └── 05b_standard_solutions.md
│
├── path_c/                        # ⭐ NEW v5.2 - TRENDS PATH
│   ├── 03c_scurve.md
│   ├── 04c_trends.md
│   └── 05c_future_system.md
│
├── 06_giaiphap_phacthao.md
├── 06b_secondary_check.md         # ⭐ NEW v5.2
├── 07_danhgia.md
├── 08_final_report.md
│
├── secondary/
│   ├── 04_mauthuan_secondary_1.md  # MAX 1 level
│   └── ...
│
├── logs/
│   ├── user_overrides.md
│   ├── conversation_history.md
│   ├── gate_decisions.md
│   └── recursion_log.md           # ⭐ NEW v5.2
│
└── 99_ketthuc_loi.md
```

---

## SAFETY PROTOCOLS (NEW v5.2)

```yaml
# config/safety_config.yaml

safety_protocol:
  # Recursion Limiter
  max_secondary_loops: 1
  action_on_limit_reached:
    - stop_generation
    - label_solution: "Low Ideality / Complex"
    - suggest_alternatives:
        - "Re-evaluate Root Cause"
        - "Choose different Principle"
        - "Try Path B if was Path A"
  
  # Checkpoint System
  checkpoint:
    enabled: true
    auto_save_phases: [0, 1, "1b", 2, "2c", "2d", 6, 7]
    critical_save_phases: [2]  # Force offer save after Phase 2
    retention_days: 30
    max_checkpoints_per_project: 10
  
  # STC Operator
  stc_operator:
    trigger_on_score_range: [30, 69]
    trigger_on_keywords:
      - "không thể"
      - "bất khả thi"
      - "impossible"
      - "can't be done"
    force_run: false  # Set true to always run STC
```

---

## IMPLEMENTATION NOTES (UPDATED v5.2)

### AI Behavior Rules

1. **Never skip gates** - Mỗi phase phải pass gate trước khi tiếp
2. **Always explain TRIZ logic** - Không chỉ ra kết quả, mà giải thích WHY
3. **Challenge trade-offs** - Luôn hỏi "Có cách nào đạt cả hai không?"
4. **Prioritize existing resources** - Cảnh báo khi user muốn mua mới
5. **Log everything** - Mọi decision đều traceable
6. **⭐ Respect recursion limits** - KHÔNG vượt quá 1 cấp secondary problem
7. **⭐ Offer checkpoints** - Đặc biệt sau Phase 2 (tốn não nhất)
8. **⭐ Run STC when uncertain** - Khi score 30-69% hoặc user nói "impossible"

### New Prompt Templates (v5.2)

#### Prompt: STC Operator
```
You are helping the user break free from Psychological Inertia using the STC Operator.

Current problem: {problem_description}
TRIZ Fit Score: {score} (in gray zone 30-69%)

STEP 1: Ask the user to imagine INFINITE resources:
"Nếu bạn có:
- Ngân sách VÔ HẠN
- Thời gian VÔ HẠN  
- Kích thước có thể thay đổi tùy ý

Giải pháp lý tưởng nhất sẽ là gì?"

STEP 2: After user responds, ask them to constrain:
"Bây giờ hãy thu nhỏ dần:
- Nếu ngân sách chỉ còn 50%?
- Nếu thời gian chỉ còn 1 tháng?
- Nếu kích thước bị giới hạn?"

STEP 3: Identify the GAP between Ideal and Constrained vision.
This GAP is the HIDDEN CONTRADICTION to solve.

Output the discovered contradiction and adjust TRIZ Fit Score accordingly.
```

#### Prompt: Recursion Check
```
You just generated a solution. Now check for secondary problems.

Solution: {solution_description}
Current recursion_depth: {depth}
MAX_RECURSION_DEPTH: 1

QUESTIONS TO ASK:
1. Does this solution create any new problems?
2. Does it require resources we don't have?
3. Does it conflict with existing systems?
4. Will it create resistance from stakeholders?

IF secondary problem found AND depth < 1:
   - Attempt to solve it (mini-loop Phase 4-6)
   - Increment depth
   
IF secondary problem found AND depth >= 1:
   - STOP immediately
   - Flag solution as "Low Ideality / Complex"
   - Suggest: Re-evaluate root cause or choose different principle
   - DO NOT attempt to solve the secondary problem

Output your analysis in the required YAML format.
```

#### Prompt: Checkpoint Offer
```
User has completed Phase: {phase_name}
This is a {critical_level} checkpoint.

IF critical_level == "CRITICAL":
   Say: "Bạn đã hoàn thành {phase_name}. 
        Đây là bước tốn nhiều năng lượng tư duy nhất.
        
        Bạn muốn:
        [1] Tiếp tục ngay
        [2] Lưu checkpoint và nghỉ ngơi
        
        Nếu chọn [2], bạn có thể gõ:
        'resume {checkpoint_id}'
        để tiếp tục bất kỳ lúc nào."

IF critical_level == "NORMAL":
   Say: "✅ Hoàn thành {phase_name}. Tiếp tục Phase tiếp theo.
        (Gõ 'save' bất kỳ lúc nào để lưu tiến độ)"
```

---

## VERSION HISTORY

- v1.0: Initial design with 39 technical parameters
- v2.0: Extended to 50 parameters (Technical + Business)
- v2.1: Added special flows (Disagreement, Violation, Secondary)
- v2.2: Refined gate logic and evaluation matrix
- v3.0: Added 6/9 Screen adaptive mode, Root Cause Engine
- v4.0: DUAL-CORE Architecture - Added Function Analysis (S-A-O), AI Router, Path A/B split
- v4.1: Added Proxy Mapping for Business → Technical parameters
- v5.0: PRODUCTION READY - Dynamic Proxy, Business Physics, Anti-paraphrase
- v5.1: FINAL AUDIT - Solution Translation, Web Search, Hybrid Matrix
- v5.2: TRI-CORE FINAL
  - ✅ Path C: Trends of Evolution (tách riêng khỏi Path A)
  - ✅ STC Operator (phá vỡ quán tính tâm lý)
  - ✅ Recursion Limiter (MAX_DEPTH = 1)
  - ✅ Checkpoint System (save/resume)
  - ✅ Safety Protocols config
  - ✅ Updated Router for Tri-Core
- **v5.2.1: DEPLOYMENT READY** ⭐ CURRENT
  - ✅ Context Carry-over Protocol (Path A/B → Path C)
  - ✅ STC Operator Tone Guidelines (playful/provocative)
  - ✅ File Index Auto-Generation for Final Report
  - ✅ Deployment Checklist for Dev Team

---

## SUCCESS METRICS (UPDATED v5.2)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Contradiction Resolution Rate | >80% | Solutions that truly resolve (not trade-off) |
| IFR Proximity | >70% | Average IFR alignment score |
| Resource Efficiency | >60% | Solutions using existing resources |
| User Satisfaction | >4/5 | Post-session rating |
| Time to Solution | <30 min | For standard complexity problems |
| Analogy Quality | >3 case studies | Each solution references real examples |
| Case Study Accuracy | 100% verified | No fabricated company names |
| **⭐ Recursion Violations** | **0%** | Solutions stopped at depth > 1 |
| **⭐ Checkpoint Usage** | **>30%** | Users who save & resume |
| **⭐ STC Effectiveness** | **>50%** | Gray-zone cases that found hidden contradiction |

---

## APPENDIX A: QUICK REFERENCE CARDS (UPDATED v5.2)

### Card 1: Router Decision Quick Guide (Tri-Core)
```
9-Screen Mode chosen? ─────────────────────────────────────┐
       │                                                   │
       YES                                                 NO
       │                                                   │
       ▼                                                   ▼
   Has Current Problem?                           Trade-off detected?
       │                                                   │
   ┌───┴───┐                                      ┌────────┴────────┐
  YES     NO                                     YES               NO
   │       │                                      │                 │
   ▼       ▼                                      ▼                 ▼
 A/B→C   PATH C                               PATH A            PATH B
(Solve    ONLY                             (Contradiction)    (Su-Field)
then
Predict)
```

### Card 2: STC Operator Quick Reference
```
TRIGGER CONDITIONS:
├── TRIZ Fit Score 30-69%
├── User says "impossible" / "can't be done"
└── Manual override (force_run: true)

PROCESS:
1. IMAGINE INFINITE → What's the ideal?
2. CONSTRAIN GRADUALLY → What must you sacrifice?
3. FIND THE GAP → That's the hidden contradiction!

OUTPUT:
└── Discovered contradiction + Adjusted TRIZ Fit Score
```

### Card 3: Recursion Limiter Quick Reference
```
MAX_DEPTH = 1

Solution → Secondary Problem Found?
              │
         ┌────┴────┐
        YES        NO
         │          │
         ▼          ▼
   Depth < 1?    PROCEED
         │
    ┌────┴────┐
   YES        NO
    │          │
    ▼          ▼
  SOLVE      STOP!
  ONCE       Flag: "Low Ideality"
    │        Suggest alternatives
    ▼
  MORE PROBLEMS?
    │
   YES → STOP!
   NO  → PROCEED
```

---

## APPENDIX B: SYSTEM PROMPTS FOR AI (UPDATED v5.2)

*(Bao gồm tất cả prompts từ v5.1 + các prompts mới ở trên)*

---

---

# ⚡ DEPLOYMENT NOTES FOR DEV TEAM (v5.2.1)

> **Mục đích:** Các lưu ý implementation quan trọng để hệ thống vận hành mượt mà. Không cần sửa bản thiết kế, chỉ là hướng dẫn khi code.

---

## 1. CONTEXT CARRY-OVER CHO PATH C ⭐ CRITICAL

### Vấn đề
Khi Router quyết định chạy **Path A/B → Path C** (solve rồi mới predict), AI phải hiểu rằng "Current System" của Path C là **giải pháp vừa tìm được**, không phải hệ thống cũ nát ban đầu.

### Logic Flow

```
┌────────────────────────────────────────────────────────────────┐
│            CONTEXT CARRY-OVER: PATH A/B → PATH C              │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  CASE: Router chọn "A/B → C" (9-Screen + Has Current Problem) │
│                                                                │
│  ═══════════════════════════════════════════════════════════  │
│                                                                │
│  PATH A/B EXECUTION                                            │
│       ↓                                                        │
│  Solution Found: "Service Module hóa"                          │
│       ↓                                                        │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  CONTEXT INJECTION INTO PATH C                          │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │                                                         │  │
│  │  OLD "Current System" (from Phase 2):                   │  │
│  │  → "Gói dịch vụ All-in-one cồng kềnh, khó scale"       │  │
│  │                                                         │  │
│  │  NEW "Current System" (for Path C):                     │  │
│  │  → "Service Module hóa (giải pháp từ Path A)"          │  │
│  │                                                         │  │
│  │  Path C sẽ dự báo tương lai cho:                        │  │
│  │  ✅ "Service Module" (giải pháp mới)                    │  │
│  │  ❌ "All-in-one cồng kềnh" (hệ thống cũ)               │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│       ↓                                                        │
│  PATH C EXECUTION (với context mới)                            │
│       ↓                                                        │
│  S-Curve: "Service Module đang ở BIRTH stage"                  │
│  Trends: "#4 Dynamism - Module sẽ trở nên adaptive hơn"       │
│  Future: "Micro-services architecture trong 2-3 năm"           │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Implementation Code Hint

```python
# Khi chuyển từ Path A/B sang Path C
def transition_to_path_c(path_ab_result, original_system_analysis):
    """
    Inject solution context into Path C
    """
    path_c_context = {
        "original_problem": original_system_analysis["problem"],
        "solution_applied": path_ab_result["recommended_solution"],
        
        # ⭐ CRITICAL: Current System = Solution, not original
        "current_system_for_trends": path_ab_result["recommended_solution"],
        
        # Keep original for reference
        "legacy_system": original_system_analysis["current_system"],
        
        # Flag để Path C biết đây là post-solution prediction
        "prediction_mode": "post_solution"  # vs "standalone"
    }
    return path_c_context
```

### Prompt Template: Path C với Context Injection

```
You are now running Path C (Trends of Evolution).

⚠️ IMPORTANT CONTEXT:
This is a POST-SOLUTION prediction. The user has already solved their problem 
using Path {A/B}.

SOLUTION FOUND: {solution_description}

Your task is to predict the FUTURE of this NEW solution, NOT the old broken system.

Questions to answer:
1. Where is "{solution_name}" on the S-Curve? (Probably BIRTH or early GROWTH)
2. Which Trends will affect "{solution_name}" in the next 2-5 years?
3. What should the user prepare for to stay ahead?

DO NOT analyze the old system: "{legacy_system_description}"
That system is being replaced by the solution.
```

### File Metadata Update

```yaml
# Trong file 03c_scurve.md khi chạy sau Path A/B
---
file_id: 03c_scurve
prediction_mode: post_solution  # ⭐ Flag quan trọng
context_source:
  from_path: A
  solution_id: 2
  solution_name: "Service Module hóa"
current_system_analyzed: "Service Module hóa"  # Không phải hệ thống cũ
legacy_system_reference: "Gói All-in-one cồng kềnh"
---
```

---

## 2. STC OPERATOR TONE ⭐ CREATIVE

### Vấn đề
STC Operator là bước phá vỡ quán tính tâm lý. Nếu AI nói giọng "robot" khô khan, user sẽ không mở được tư duy.

### Nguyên tắc Tone

```
┌────────────────────────────────────────────────────────────────┐
│                STC OPERATOR TONE GUIDELINES                    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ❌ TRÁNH (Robot/Formal):                                      │
│  ─────────────────────────                                     │
│  "Hãy tưởng tượng bạn có ngân sách vô hạn."                   │
│  "Vui lòng cho biết giải pháp lý tưởng của bạn."              │
│  "Xin hãy thu hẹp dần các ràng buộc."                         │
│                                                                │
│  ✅ NÊN (Playful/Provocative):                                 │
│  ─────────────────────────────                                 │
│  "Okay, giờ chúng ta chơi một trò nhé! 🎮"                    │
│  "Tưởng tượng bạn vừa trúng xổ số VÔ HẠN tiền..."            │
│  "Thời gian? Pfft, bạn có cả VĨNH HẰNG!"                      │
│  "Kích thước? Bạn có thể làm nó to bằng Mặt Trăng            │
│   hoặc nhỏ bằng hạt cát - tùy bạn!"                           │
│                                                                │
│  TONE KEYWORDS:                                                │
│  ─────────────                                                 │
│  • Khiêu khích: "Dám mơ lớn không?"                           │
│  • Bay bổng: "Nếu có phép thuật..."                           │
│  • Playful: "Chơi trò này đi!"                                │
│  • Encouraging: "Đừng lo về thực tế, cứ bay đi!"              │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Prompt Template: STC với Tone Sáng Tạo

```
You are running the STC Operator to break Psychological Inertia.

YOUR PERSONALITY FOR THIS STEP:
- Be playful and provocative, like a creative workshop facilitator
- Use imagination-triggering language
- Add occasional emojis to keep it light 🚀✨💡
- Challenge the user to dream bigger
- Sound like a friend brainstorming at a café, not a consultant in a boardroom

═══════════════════════════════════════════════════════════════

STEP 1: INFINITE RESOURCES (Bay bổng mode)

Say something like:
"Okay, tạm quên mọi giới hạn đi nhé! 🎮

Tưởng tượng bạn vừa được một vị thần cho 3 điều ước:
💰 Ngân sách? VÔ HẠN. Muốn bao nhiêu tỷ cũng có.
⏰ Thời gian? Bạn có cả THIÊN NIÊN KỶ để làm.
📐 Kích thước? To bằng cả thành phố hay nhỏ bằng con chip - tùy!

Với sức mạnh thần thánh đó... giải pháp HOÀN HẢO NHẤT của bạn là gì?
Đừng ngại, cứ mơ điên lên đi! 🚀"

═══════════════════════════════════════════════════════════════

STEP 2: GRADUAL CONSTRAINT (Kéo về thực tế từ từ)

Say something like:
"Hay lắm! Giờ thần bắt đầu thu hồi phép thuật dần... 😅

Nếu ngân sách chỉ còn 50%... phần nào bạn GIỮ CHẾT cũng không bỏ?
Nếu thời gian chỉ còn 1 tháng... cái gì bạn CẮT NGAY không tiếc?
Nếu kích thước bị giới hạn... bạn sẽ THAY ĐỔI gì?

Đây là lúc sự thật bắt đầu lộ ra... 👀"

═══════════════════════════════════════════════════════════════

STEP 3: REVEAL THE HIDDEN CONTRADICTION

Say something like:
"A-HA! 💡 Thấy chưa?

Cái khoảng cách giữa 'giấc mơ vô hạn' và 'thực tế ràng buộc' của bạn...
Đó chính là MÂU THUẪN ẨN mà chúng ta cần giải!

Bạn muốn [X từ ideal vision] nhưng bị kẹt bởi [Y từ constraint].
Đây mới là bài toán THẬT. Và TRIZ sinh ra để giải những thứ này! 🎯"
```

### Ví dụ Output STC với Tone Đúng

```markdown
## STC OPERATOR SESSION

### 🎮 Bước 1: Infinite Mode

**AI:** "Okay bestie, giờ mình chơi trò 'Nếu có phép thuật' nhé! ✨

Tưởng tượng: Bạn có CÂY ĐŨA THẦN. 
- Tiền? In được vô hạn.
- Thời gian? Dừng được như Dr. Strange.
- Size? Co giãn như Ant-Man.

Với siêu năng lực đó... bạn sẽ giải quyết vấn đề này thế nào? 
Cứ bay đi, đừng để gravity kéo xuống! 🚀"

**User:** "Nếu vậy thì tôi sẽ thuê 1000 kỹ sư giỏi nhất thế giới, 
mỗi người chỉ làm 1 feature, hoàn thành trong 1 tuần với chất lượng tuyệt đối."

### 🎯 Bước 2: Reality Check

**AI:** "Đỉnh! Giờ thần bắt đầu thu phép... 😏

- Nếu chỉ còn 10 kỹ sư thay vì 1000?
- Nếu phải ship trong 1 tháng, không phải 1 tuần?
- Nếu budget chỉ đủ thuê người tầm trung?

Cái gì bạn KHÔNG THỂ hi sinh?"

**User:** "Chất lượng. Tôi có thể giảm scope nhưng không thể giảm chất lượng."

### 💡 Bước 3: Hidden Contradiction Revealed

**AI:** "BOOM! 💥 Thấy chưa?

**Mâu thuẫn ẩn đây rồi:**
Bạn muốn CHẤT LƯỢNG CAO với NGUỒN LỰC HẠN CHẾ.

Đây không phải 'thiếu tiền' hay 'thiếu người' đơn thuần.
Đây là bài toán TRIZ chính hiệu: Làm sao đạt chất lượng 1000 người 
mà chỉ có 10 người?

TRIZ Fit Score: 45% → 85% ⭐
Let's crack this! 🎯"
```

---

## 3. QUẢN LÝ FILE & FINAL REPORT LINKS ⭐ HOUSEKEEPING

### Vấn đề
Với Tri-Core + Checkpoint, mỗi project có thể sinh ra 15-20 files. User cần navigation rõ ràng trong Final Report.

### File Inventory Template

```yaml
# Tự động generate trong 08_final_report.md
file_inventory:
  total_files: 18
  categories:
    input_screening: 3
    analysis: 4
    path_execution: 3  # hoặc 6 nếu chạy 2 paths
    solution: 3
    logs: 3
    checkpoints: 2
```

### Final Report Link Section Template

```markdown
# 08_final_report.md

...

---

## 📁 APPENDIX: PROJECT FILE INDEX

> Tất cả files trong project này với relative paths để dễ tra cứu.

### 🔍 Input & Screening
| File | Description | Status |
|------|-------------|--------|
| [00_input_raw.md](./00_input_raw.md) | Input gốc từ user | ✅ Locked |
| [01_screening.md](./01_screening.md) | TRIZ Fit Assessment | ✅ Locked |
| [01b_stc_operator.md](./01b_stc_operator.md) | STC Session (nếu có) | ✅ Locked |

### 🔬 Analysis Phase
| File | Description | Status |
|------|-------------|--------|
| [02a_system_analysis.md](./02a_system_analysis.md) | 6/9 Screen Analysis | ✅ Locked |
| [02b_resources.md](./02b_resources.md) | Resource Inventory | ✅ Locked |
| [02c_function_model.md](./02c_function_model.md) | S-A-O Function Model | ✅ Locked |
| [02d_router_decision.md](./02d_router_decision.md) | Path Selection Logic | ✅ Locked |

### 🛤️ Path Execution
<!-- Dynamic section - chỉ hiển thị paths đã chạy -->

#### Path A: Contradiction (nếu đã chạy)
| File | Description |
|------|-------------|
| [path_a/03a_ifr.md](./path_a/03a_ifr.md) | Ideal Final Result |
| [path_a/04a_mauthuan.md](./path_a/04a_mauthuan.md) | Contradiction Analysis |
| [path_a/05a_principles.md](./path_a/05a_principles.md) | 40 Principles Applied |

#### Path B: Su-Field (nếu đã chạy)
| File | Description |
|------|-------------|
| [path_b/03b_sufield_model.md](./path_b/03b_sufield_model.md) | S1-S2-Field Model |
| [path_b/04b_76_standards.md](./path_b/04b_76_standards.md) | Standards Lookup |
| [path_b/05b_standard_solutions.md](./path_b/05b_standard_solutions.md) | Generated Solutions |

#### Path C: Trends (nếu đã chạy)
| File | Description |
|------|-------------|
| [path_c/03c_scurve.md](./path_c/03c_scurve.md) | S-Curve Position |
| [path_c/04c_trends.md](./path_c/04c_trends.md) | 8 Trends Analysis |
| [path_c/05c_future_system.md](./path_c/05c_future_system.md) | Future Roadmap |

### 💡 Solution & Evaluation
| File | Description | Status |
|------|-------------|--------|
| [06_giaiphap_phacthao.md](./06_giaiphap_phacthao.md) | Solution Concepts | ✅ Locked |
| [06b_secondary_check.md](./06b_secondary_check.md) | Recursion Check | ✅ Locked |
| [07_danhgia.md](./07_danhgia.md) | Evaluation Matrix | ✅ Locked |

### 📋 Logs & Checkpoints
| File | Description |
|------|-------------|
| [logs/user_overrides.md](./logs/user_overrides.md) | User Override Decisions |
| [logs/gate_decisions.md](./logs/gate_decisions.md) | Gate Pass/Fail Records |
| [logs/recursion_log.md](./logs/recursion_log.md) | Secondary Problem Log |
| [checkpoint/latest.yaml](./checkpoint/latest.yaml) | Latest Checkpoint |

### 🚨 Error Files (nếu có)
| File | Description |
|------|-------------|
| [99_ketthuc_loi.md](./99_ketthuc_loi.md) | Termination Report |

---

## 🔗 Quick Navigation

**Muốn xem nhanh?**
- 👉 [Executive Summary](#executive-summary) - Tóm tắt 1 trang
- 👉 [Recommended Solution](#4-recommended-solution) - Giải pháp chính
- 👉 [Implementation Roadmap](#42-implementation-roadmap) - Các bước triển khai

**Muốn trace logic?**
- 👉 [Root Cause](./02a_system_analysis.md#root-cause) → 
  [Contradiction](./path_a/04a_mauthuan.md) → 
  [Principles](./path_a/05a_principles.md) → 
  [Solution](./06_giaiphap_phacthao.md)

**Muốn verify?**
- 👉 [Gate Decisions Log](./logs/gate_decisions.md) - Mọi quyết định AI đưa ra
- 👉 [User Overrides Log](./logs/user_overrides.md) - Các lần user không đồng ý
```

### Auto-Generate Script Hint

```python
def generate_file_index(project_path):
    """
    Auto-generate file index for Final Report
    """
    categories = {
        "input_screening": ["00_", "01_"],
        "analysis": ["02a_", "02b_", "02c_", "02d_"],
        "path_a": ["path_a/"],
        "path_b": ["path_b/"],
        "path_c": ["path_c/"],
        "solution": ["06_", "07_"],
        "logs": ["logs/"],
        "checkpoint": ["checkpoint/"],
        "error": ["99_"]
    }
    
    file_index = {}
    for category, prefixes in categories.items():
        files = []
        for prefix in prefixes:
            # Scan project folder for matching files
            matching = glob.glob(f"{project_path}/{prefix}*")
            files.extend(matching)
        
        if files:
            file_index[category] = [
                {
                    "path": f"./{os.path.relpath(f, project_path)}",
                    "name": os.path.basename(f),
                    "status": get_file_status(f)  # locked/draft
                }
                for f in files
            ]
    
    return file_index

def inject_into_final_report(final_report_path, file_index):
    """
    Inject file index table into Final Report
    """
    index_markdown = render_file_index_table(file_index)
    
    with open(final_report_path, 'a') as f:
        f.write("\n\n---\n\n")
        f.write("## 📁 APPENDIX: PROJECT FILE INDEX\n\n")
        f.write(index_markdown)
```

### Validation Checklist for Dev

```
□ Final Report có link tới TẤT CẢ files trong project?
□ Links là relative paths (./path/file.md), không phải absolute?
□ Chỉ hiển thị paths ĐÃ CHẠY (không show Path B nếu chỉ chạy Path A)?
□ Quick Navigation links hoạt động (anchor links)?
□ File status (locked/draft) được cập nhật đúng?
□ Checkpoint folder được liệt kê?
□ Error file (99_) chỉ hiển thị nếu tồn tại?
```

---

## 📋 DEPLOYMENT CHECKLIST

Trước khi deploy v5.2, đảm bảo:

```
CONTEXT CARRY-OVER:
□ Path C nhận được solution từ Path A/B làm "current system"
□ prediction_mode flag được set đúng ("post_solution" vs "standalone")
□ Legacy system chỉ được reference, không analyzed

STC OPERATOR TONE:
□ Prompts có giọng playful/provocative
□ Emojis được enable cho STC phase
□ Tone khác biệt rõ với các phases khác

FILE MANAGEMENT:
□ Auto-generate file index cho Final Report
□ Relative paths hoạt động
□ Dynamic sections chỉ show executed paths
□ Checkpoint files được tracked
```

---

# ✅ READY FOR IMPLEMENTATION

Bản thiết kế v5.2 đã hoàn chỉnh với tất cả các bản vá từ expert review:

1. ✅ **Path C (Trends)** - Tách riêng khỏi Path A
2. ✅ **STC Operator** - Phá vỡ quán tính tâm lý 
3. ✅ **Recursion Limiter** - MAX_DEPTH = 1
4. ✅ **Checkpoint System** - Save/Resume cho quy trình dài

**Next Steps for Dev Team:**
1. Implement Checkpoint System first (foundational)
2. Add STC Operator to Phase 1
3. Build Path C: Trends of Evolution
4. Integrate Recursion Limiter in Phase 6
5. Update Router for Tri-Core architecture

---

*Document generated by Project Owner & TRIZ Level 5 Certified*
