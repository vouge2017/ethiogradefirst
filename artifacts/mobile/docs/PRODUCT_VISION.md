# EthioGrade — Product Vision

## What EthioGrade Is

**EthioGrade is an offline-first mobile grading lab for teachers.**

Not just a calculator. Not a scanner. A complete teacher-side grading system that starts with manual grading today and grows into assisted and automated scanning over time — always with the teacher in control, always honest about what the app can and cannot do.

---

## The Problem

Ethiopian primary and secondary classrooms average 60–80 students per teacher. Grading a 20-question standardized exam for 60 students by hand takes 2–3 hours. Teachers do this every exam cycle, for every subject, with no tools except a red pen and a calculator.

EthioGrade's goal is to cut that time to under 10 minutes per class — offline, on a low-cost Android phone, without internet.

---

## The Foundation: Paper-First Workflow

EthioGrade is built for teachers who work on paper. Students answer on paper. Teachers carry paper, not laptops. The app must fit into a paper-first workflow, not fight it.

This means:
- The teacher should not be forced to type 60 answers manually if scanning can help
- But scanning should never lie about its accuracy
- If the app cannot detect an answer with confidence, the teacher must review it
- The teacher is always the final authority on every grade

---

## The Vision: Teacher Grading Lab

EthioGrade is not a single feature. It is a grading lab with multiple tools:

| Tool | Status |
|---|---|
| Quick Assessment (manual key + manual grading) | v0.1 — Built |
| Mixed question types (MCQ, T/F, Short, Matching) | v0.1 — Built |
| Per-question weights | v0.1 — Built |
| Offline storage and CSV export | v0.1 — Built |
| Class Assessment (class + student register) | v0.2 — Planned |
| Master Scan answer key capture | v0.2 — Planned |
| Guided Paper Layout student scan | v0.3 — Planned |
| EthioGrade Printable Template scan | v0.4 — Planned |
| Batch scan with confidence + review queue | v0.4 — Planned |
| Missing/duplicate paper detection | v0.4 — Planned |
| Correction-learning dataset | v0.5 — Future |
| Any-paper assist with teacher confirmation | v0.6 — Future |
| Teacher AI assistant | v1.0 — Long-term |

---

## Long-Term Vision: Teacher AI Assistant

The long-term goal is a suite of AI agents that handles the full teacher admin cycle:
- Generating assessments from curriculum
- Grading student papers (scanned)
- Tracking class progress over time
- Flagging students who need extra help
- Generating parent reports in local languages

None of this is being built yet. The foundation is a reliable, trustworthy offline grading tool.

---

## Why Trust Comes First

A teacher will not use a grading tool they cannot trust. If the app gives a wrong grade and the teacher does not catch it, real students are harmed.

EthioGrade rules for trust:
1. **Never fake a scan result.** Math.random() scan results have been removed.
2. **Never claim AI grading unless it actually works.** Labels must be honest.
3. **Always show confidence levels** when scanning exists.
4. **Always require teacher confirmation** before a grade is recorded.
5. **Never silently auto-grade** without the teacher seeing the result.

---

## Why Paper-First Matters

Many EdTech tools assume digital-native students and teachers. Ethiopian classrooms are not digital-native. Paper exams will continue for years. EthioGrade must be useful today with paper, not only useful when schools upgrade to digital exams.

---

## Design Principles

- **Offline first** — must work with zero connectivity, always
- **Teacher time as the constraint** — minimize taps per student
- **Honest about limitations** — never mislead on what is automated
- **Low-cost device compatible** — target Android under $100, app under 35 MB
- **Paper-first** — fit into existing teacher workflow, not replace it
- **Teacher in control** — every grade requires teacher confirmation

---

## What Is NOT Being Built

| Feature | Reason not built yet |
|---|---|
| Real OMR / bubble sheet scanning | Future — v0.3+ |
| AI essay grading | Future — v1.0 |
| Backend server or user accounts | Future — post-pilot |
| Parent communication | Future — v1.0 |
| Amharic / Afaan Oromo / Tigrinya UI | Future — after pilot validation |
| Play Store public release | Future — after classroom pilot |
| OCR / handwriting recognition | Future — size and accuracy constraints |
