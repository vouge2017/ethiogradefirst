# EthioGrade — AI Agent Roadmap

**Status: All AI agent features are future phases. Nothing below is being built in Milestone 1.**

The long-term vision is a suite of specialized AI agents that work together to eliminate repetitive teacher admin work. Each agent is a discrete system with defined inputs and outputs. They are listed here for planning purposes only.

---

## Agent 1 — Grading Agent (Phase 2)

**What it does:** Automatically grades multi-choice answer sheets from a photo using real computer vision. No teacher tap-per-question required.

**Inputs:** Camera image of filled answer sheet, answer key
**Outputs:** Per-question answer, confidence score, flagged questions for review

**Current state:** The app has a simulated version of this. The simulation uses Math.random() and does not read the image. It must be replaced with real image processing before this agent is usable.

**Blocker:** Requires real bubble-sheet segmentation, either on-device (TensorFlow Lite) or via a lightweight API call.

---

## Agent 2 — Assessment Agent (Phase 3)

**What it does:** Helps teachers create assessments faster. Given a subject, grade level, and topic, it suggests question sets with an answer key.

**Inputs:** Subject, grade level, topic, question count
**Outputs:** Draft question list + answer key for teacher review

**Current state:** Not started.

**Blocker:** Requires LLM access (Gemini or similar). Must work offline or with minimal connectivity — either on-device model or cached question bank.

---

## Agent 3 — Feedback Agent (Phase 3)

**What it does:** Generates per-student feedback summaries based on grading results. Tells the teacher which topics a student is weak on.

**Inputs:** Student result, answer key with topic tags per question
**Outputs:** Plain-language feedback paragraph per student

**Current state:** Not started. Requires topic tags on answer keys (not yet in the data model).

---

## Agent 4 — Class Performance Agent (Phase 4)

**What it does:** Analyzes class-level trends. Which questions did most students miss? Which topics need re-teaching?

**Inputs:** All student results for an assessment
**Outputs:** Per-question difficulty summary, topic weakness chart, re-teaching suggestions

**Current state:** The results screen shows basic stats (score distribution). Full class analysis is not yet built.

---

## Agent 5 — Parent Communication Agent (Phase 4)

**What it does:** Generates parent-ready summaries of student performance, formatted as an SMS or printable note.

**Inputs:** Student result, class average, teacher name
**Outputs:** Short message in English or local language (Amharic, Afaan Oromo, Tigrinya)

**Current state:** Not started. Language support is a prerequisite.

---

## Agent 6 — Teacher Admin Agent (Phase 5)

**What it does:** Handles broader teacher admin: attendance integration, term report compilation, grade book management.

**Inputs:** Assessment results, attendance data, curriculum calendar
**Outputs:** End-of-term reports, grade book exports, flagged at-risk students

**Current state:** Not started. Requires backend persistence and user accounts, which are also not yet built.

---

## Phase Timeline (Tentative)

| Phase | Focus | Prerequisite |
|-------|-------|-------------|
| Phase 1 (Now) | Offline grading MVP, manual + simulated OMR | Nothing |
| Phase 2 | Real OMR grading agent | Phase 1 validated in classroom |
| Phase 3 | Assessment + Feedback agents | Phase 2 stable |
| Phase 4 | Class + Parent agents | Phase 3 stable, backend added |
| Phase 5 | Admin agent, multi-school | Phase 4 stable |

---

**Do not build any phase 2+ features until the Milestone 1 classroom pilot has been completed and the feedback has been reviewed.**
