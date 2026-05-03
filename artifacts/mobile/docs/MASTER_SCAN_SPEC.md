# Master Scan — Specification

## What is Master Scan?

Master Scan is the process of capturing the answer key by scanning a paper, not by tapping answers on the phone.

The teacher marks the correct answers on a paper answer sheet (either the EthioGrade printed template or a guided-layout paper). The teacher photographs that sheet. The app reads the marked answers, shows what it detected with confidence indicators, and asks the teacher to confirm or edit. After confirmation, the detected key becomes the official answer key for grading student papers.

---

## Why Master Scan Exists

For a 20-question assessment, tapping answers on the phone is manageable. For a 50 or 100-question assessment, it becomes slow and error-prone. Master Scan replaces the phone-tapping step with a single photo of a paper the teacher already has in hand.

Master Scan also creates a physical audit trail — the teacher's marked answer sheet is the authority, and the app captures it from that.

---

## Absolute Rules

- **No fake Master Scan.** The camera must actually read the image.
- If the image cannot be read with acceptable confidence, the teacher must correct the key manually before saving.
- The teacher always confirms the detected key before it is used for grading.
- Low-confidence detections must be flagged, not silently accepted.

---

## Supported Answer Sheet Types

### Option 1: EthioGrade Printable Template (Preferred)

A standardized printed answer sheet with:
- Four corner alignment markers (fiducials)
- Numbered bubble positions for each question
- Student ID area (for student sheets)
- Assessment ID / QR placeholder

Detection method: Geometric alignment detection using corner markers.
Accuracy: High — predictable layout means predictable detection.
Requirement: Teacher must print the template.

### Option 2: Guided Paper Layout (Accessible)

Teacher uses their own paper, but follows a simple recommended format:
```
1. A
2. C
3. True
4. B
```
Detection method: OCR / text line recognition.
Accuracy: Medium — depends on handwriting clarity and lighting.
Requirement: Teacher follows the layout format.

### Option 3: Any Paper Assist (Future / Experimental)

Teacher scans any answer sheet format. App attempts to assist with cropping, straightening, and reading, but accuracy is lower. Teacher must review every detection carefully.

Detection method: General computer vision with teacher confirmation.
Accuracy: Lower — no guaranteed layout.
Status: Future/experimental — v0.6+.

---

## Confidence Review

After scanning, each detected answer is shown with a confidence indicator:
- **High confidence (green):** App is certain — teacher can accept with one tap
- **Medium confidence (yellow):** App is unsure — teacher should review this answer
- **Low confidence / undetected (red):** App cannot read this answer — teacher must enter it manually

The teacher can edit any detected answer before confirming. No answer is auto-accepted without teacher seeing it.

---

## Teacher Confirmation Flow

1. Teacher scans the master answer sheet
2. App shows detected answer key with confidence per question
3. Teacher reviews flagged (yellow/red) questions first
4. Teacher corrects any wrong detections
5. Teacher confirms the full key
6. Key is saved and used for grading all student papers in this assessment

---

## Low-Confidence Correction

If more than 20% of answers are low confidence, the app should warn the teacher:
> "Many answers could not be detected clearly. Consider retaking the photo in better lighting or entering the key manually."

The teacher always has the option to switch to manual key entry at any point.

---

## Limitations (v0.2 target)

- Only supports MCQ and True/False in first version
- Short Answer and Matching marking notes must still be entered manually
- Requires the EthioGrade printed template OR the teacher follows the guided layout
- May not work well in very low light or with blurry photos
- Teacher confirmation is always required — not fully automatic

---

## Status

Master Scan is **not implemented** in v0.1.
Target version: v0.2.
See `docs/SCANNING_ROADMAP.md` for full timeline.
