# OMR Status — EthioGrade Prototype

## Current Status: SIMULATED (Not Real Image Processing)

The current OMR (Optical Mark Recognition) implementation is a **prototype simulation**. It does not read or analyze camera images in any way.

**File:** `artifacts/mobile/lib/omr.ts`
**Function:** `runOMRDetection(imageUri, answerKey, paperIndex)`

The `imageUri` parameter is accepted but never read. All answer detection is performed by `Math.random()`.

---

## What the Simulation Does

The simulation models realistic OMR behavior to make teacher review meaningful during development and testing. Per question it randomly assigns one of four detection statuses:

| Status | Probability | Meaning |
|--------|------------|---------|
| SINGLE | 72% | One bubble clearly filled — answer recorded |
| LOW_CONFIDENCE | 13% | Detection uncertain — flagged for teacher review |
| BLANK | 8% | No bubble filled — flagged for teacher review |
| MULTIPLE | 7% | Multiple bubbles filled — flagged for teacher review |

When status is SINGLE, the simulation biases toward the correct answer ~70% of the time to model a realistic student error rate.

---

## Issue / Reason Codes Produced

| Code | When Triggered |
|------|---------------|
| `TEMPLATE_UNSUPPORTED_QUESTION_COUNT` | Question count is not 20 |
| `TEMPLATE_ALIGNMENT_LOW` | Random 15% chance — simulates sheet misalignment |
| `LOW_OVERALL_CONFIDENCE` | Average confidence below 0.65 |
| `QUESTION_REVIEW_REQUIRED` | Any question has needsReview = true |

---

## Teacher Review Behavior

- All LOW_CONFIDENCE, BLANK, and MULTIPLE detections are flagged with `needsReview = true`
- The review screen displays these prominently and requires the teacher to either confirm or correct each one
- The teacher can correct any answer (including SINGLE detections) before confirming
- A paper is not counted in CSV export until `reviewComplete = true`
- Low-confidence results are never silently graded

---

## Supported Templates

Current (simulated): 20-question multiple-choice, A–E options. Other question counts trigger the `TEMPLATE_UNSUPPORTED_QUESTION_COUNT` issue code but still process.

Real OMR (future): Would require a standardized printed answer sheet template with fiducial markers. Template design is not yet finalized.

---

## Limitations (Simulation)

- The image is never read — the camera is used only to trigger the grading flow
- Confidence values are random — they do not reflect actual image quality
- Alignment issues are random — they do not reflect actual sheet position
- Results will differ on every scan of the same sheet

---

## Path to Real OMR (Phase 2)

To replace the simulation with real detection:

1. Design a standardized answer sheet template with timing marks / QR corner anchors
2. Implement on-device image processing (OpenCV via native module or TensorFlow Lite bubble detector)
3. Replace `runOMRDetection` with a real implementation — the function signature and return type can stay the same
4. Run validation tests with physical printed sheets in multiple lighting conditions
5. Add `OMR_ENGINE_VERSION` to the result model so exported CSVs can track which engine produced each result

---

## Test Cases (Manual)

Because the simulation is random, automated tests for OMR output are not meaningful. Manual test cases to run when real OMR is implemented:

| Test | Expected Result |
|------|----------------|
| Well-lit sheet, all bubbles filled | 100% SINGLE, all confidence > 0.85 |
| Sheet with one bubble torn | BLANK on that question, flagged |
| Two bubbles filled for one question | MULTIPLE on that question, flagged |
| Sheet rotated 5 degrees | TEMPLATE_ALIGNMENT_LOW issue |
| Sheet with pencil marks not erased | LOW_CONFIDENCE on affected questions |
| Dark room photo | LOW_OVERALL_CONFIDENCE issue |
