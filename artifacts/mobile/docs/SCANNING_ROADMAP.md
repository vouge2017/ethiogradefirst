# EthioGrade Scanning Roadmap

## Current Status

**v0.1 (current):** Manual grading only. No camera scanning.
The previous Math.random() mock scan has been removed from the teacher-facing app.
See `docs/OMR_STATUS.md` for details.

---

## Version Milestones

### v0.1 — Manual Grading Foundation (Current)

**Status: Built**

- Quick Assessment: teacher sets question types, weights, and answer key
- Mixed question support: MCQ, True/False, Short Answer, Matching
- Per-question weights
- Manual entry: teacher taps/enters each student's answers
- Hybrid scoring: MCQ/T-F auto-scored, Short/Matching scored manually
- Results: class average, median, pass rate, grade distribution
- CSV export with grade band and per-question responses
- Offline storage (AsyncStorage)
- No scanning, no camera, no Math.random() fake results

---

### v0.2 — Class Setup + Master Scan Prototype

**Status: Planned**

- Class creation and student register
- Assessment linked to a class
- Master Scan for answer key capture (EthioGrade template or guided layout)
- Confidence review for detected key answers
- Teacher confirmation before key is saved
- No student paper scanning yet

---

### v0.3 — Guided Layout Student Scan

**Status: Planned**

- Teacher uses existing paper with recommended numbered format
- OCR / text line detection to read student answers
- Per-answer confidence scoring
- Review queue for low-confidence answers
- Manual fallback for any answer
- Guided layout format documentation and in-app sample

---

### v0.4 — EthioGrade Template + Batch Scan

**Status: Planned**

- Printable EthioGrade answer sheet template (20, 50, 100 question variants)
- Geometric detection using corner alignment markers
- High-confidence batch scanning for large classes
- Missing student detection against class register
- Duplicate scan prevention
- Review queue with exception-only teacher interaction

---

### v0.5 — Correction-Learning Dataset

**Status: Future**

- App records teacher corrections to detected answers
- Builds a local dataset of detection errors and corrections
- Prepares data for future model improvement
- No AI inference yet — data collection phase only

---

### v0.6 — Any Paper Assist with Teacher Confirmation

**Status: Future / Experimental**

- Teacher can scan any existing paper answer sheet
- App attempts detection with general computer vision
- All detections shown with confidence
- High review burden — teacher confirms every answer
- Not recommended for large classes — slow per-paper

---

### v1.0 — Teacher AI Assistant

**Status: Long-term**

- AI-assisted question generation from curriculum
- Automated scoring with high confidence for scanned sheets
- Correction-learning loop: app improves from teacher corrections
- Class progress tracking over time
- Parent report generation in local languages
- Foundation for full teacher workflow automation

---

## Three-Lane Scanning Strategy

See `docs/SCANNING_STRATEGY.md` for the full strategy.

| Lane | Version | Speed | Accuracy | Template Required |
|---|---|---|---|---|
| Manual Entry | v0.1 | Slow | 100% | No |
| Guided Layout | v0.3 | Medium | Medium | No |
| EthioGrade Template | v0.4 | Fast | High | Yes |
| Any Paper Assist | v0.6+ | Slow | Low | No |

---

## Absolute Rules for All Scanning Work

1. No Math.random() or fake scan results in production
2. Every detection must show confidence to the teacher
3. Teacher confirmation is required before any result is saved
4. Manual fallback is always available
5. No scan result auto-accepted without teacher review
