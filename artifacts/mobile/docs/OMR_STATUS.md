# OMR Status — EthioGrade

## Current Status: NOT IMPLEMENTED

**As of v0.1, EthioGrade has no real optical mark recognition (OMR) or camera scanning.**

---

## History

| Version | OMR Status |
|---|---|
| Early dev builds | Math.random() mock scan — simulated fake answers, never read actual photos |
| v0.1 (current) | Mock scan removed from teacher flow. Manual grading only. |
| v0.2 (planned) | Fixed-template OMR — see SCANNING_ROADMAP.md |

---

## What Was Removed

The early development builds contained a `mockOmrDetection()` function that:
- Accepted a photo URI parameter but **never read it**
- Generated random MCQ/True-False answers using `Math.random()`
- Simulated "confidence scores" and detection issues

This was removed from the teacher-facing app in v0.1 because:
- It did not provide real value
- It was misleading — teachers could mistake simulated results for real detections
- Trust is critical for a grading tool; fake results undermine it

The mock code is preserved in `lib/omr.mock.dev.ts` as a development reference only.
It is not imported or callable from any production screen.

---

## What the Teacher Sees in v0.1

The "Scan Answer Sheet" button is visible in the Grading Hub but is **disabled** and clearly labeled:
> "Scan Answer Sheet — Coming in v0.2 — not available yet"

There is no fake scan, no loading animation, no simulated result.

---

## Real OMR Plan

See `docs/SCANNING_ROADMAP.md` for the three paths:
1. Fixed-template OMR (v0.2)
2. ML Kit assisted scanning (v0.3)
3. Full computer vision (v1.0)

---

## Files Reference

| File | Purpose |
|---|---|
| `lib/omr.ts` | Production module — exports nothing, documents isolation |
| `lib/omr.mock.dev.ts` | Dev reference only — contains removed mock code |
| `app/scan.tsx` | Grading Hub — manual entry only, scanning disabled |
| `docs/SCANNING_ROADMAP.md` | Future scanning implementation plan |
