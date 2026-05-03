# EthioGrade Scanning Strategy

## The Core Tension

Teachers need speed. Scanning 60 student papers automatically is fast.
But "scan anything" is a promise we cannot keep yet.

Forcing teachers to use a specific printed template reduces adoption.
But accepting any paper format reduces accuracy.

EthioGrade solves this with a three-lane strategy.

---

## Why We Cannot Promise "Scan Any Paper Automatically"

Generic paper scanning requires:
1. Reliable document detection (finding the paper in the photo)
2. Perspective correction (making the photo flat and aligned)
3. Answer region detection (finding where answers are on the paper)
4. Bubble/mark reading (identifying which bubble is filled)
5. Confidence scoring per answer
6. Teacher correction for low-confidence answers

Without a fixed layout and alignment markers, steps 3 and 4 are unreliable. A teacher in a dark classroom with a $50 Android phone cannot be promised 99% accuracy on arbitrary handwritten papers.

We will not promise what we cannot deliver. Trust is more important than the feature.

---

## Why We Cannot Force Templates From Day One

Many teachers have existing printed exams. Requiring a specific EthioGrade template before they can use the app adds a barrier:
- They need a printer
- They need to adopt a new format
- They need to trust the app first

EthioGrade should earn trust before requiring behavior change.

---

## The Three-Lane Strategy

### Lane 1: Any Paper Assist (Future — v0.6+)

Teacher scans their existing paper answer sheet.
App attempts to detect answers using general computer vision.
All detections are shown with confidence levels.
Teacher confirms every answer before it is accepted.

**Use case:** Teacher has existing answer sheets, wants some assistance.
**Speed:** Slow — high review burden.
**Accuracy:** Lower — no guaranteed layout.
**Requirement:** None from teacher.
**Status:** Future / experimental.

---

### Lane 2: Guided Paper Layout (v0.3 target)

Teacher uses their own paper but follows a simple recommended format:
```
1. A
2. C
3. True
4. B
```
One answer per line, numbered. Teacher writes answers clearly.
App uses OCR / text recognition to read the format.
Teacher reviews flagged (low-confidence) items.

**Use case:** Teacher wants speed improvement without printing a new template.
**Speed:** Medium — fewer phone taps, some review needed.
**Accuracy:** Medium — depends on handwriting and lighting.
**Requirement:** Teacher follows the layout format.
**Status:** Planned — v0.3.

---

### Lane 3: EthioGrade Printable Template (v0.4 target)

Teacher prints and uses the official EthioGrade answer sheet with alignment markers, numbered bubble positions, and a student ID area.
App uses geometric detection (corner markers) for high-accuracy reading.
Teacher reviews only flagged items.

**Use case:** Large classes, high-speed batch grading.
**Speed:** Fast — minimal review burden.
**Accuracy:** High — fixed layout enables reliable detection.
**Requirement:** Teacher must print the template.
**Status:** Planned — v0.4.

---

## Accuracy vs Speed vs Flexibility Trade-off

| Lane | Accuracy | Speed | Template Required |
|---|---|---|---|
| Any Paper Assist | Low | Slow | No |
| Guided Paper Layout | Medium | Medium | No |
| EthioGrade Template | High | Fast | Yes |

The more structured the paper, the faster and more accurate scanning becomes.
The more flexible the paper, the more teacher review is required.

---

## Teacher Confirmation Rules

Regardless of which lane is used:
1. No answer is recorded without the teacher seeing it
2. Low-confidence answers are always flagged and must be reviewed
3. The teacher can correct any detected answer at any time
4. Confirmation is required before results are finalized
5. Manual fallback is always available — any question can be manually scored

---

## Adoption Strategy

1. **v0.1:** Establish trust with reliable manual grading — no fake scanning
2. **v0.2:** Introduce Master Scan for answer key only (low stakes, one-time per assessment)
3. **v0.3:** Guided Layout student scan — reduce tapping without requiring template
4. **v0.4:** Template-based scanning — offer to teachers who want maximum speed
5. **v0.6+:** Any Paper Assist — for teachers with existing papers, with high review burden
6. **v1.0:** Teacher AI assistant with correction-learning loop

At each stage, teachers can see value without being forced into the next stage.

---

## What Teachers Will Be Told

| Scanning Mode | Teacher-facing message |
|---|---|
| Any Paper Assist | "We'll try to help — you'll need to confirm every answer." |
| Guided Layout | "Use this format and we'll read most answers automatically." |
| EthioGrade Template | "Print this sheet for the fastest grading." |
| Manual Entry | "Enter answers manually — always works, always accurate." |

The app will never say "automatic grading" without teacher confirmation.
