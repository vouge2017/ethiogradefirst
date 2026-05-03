# EthioGrade Answer Sheet Template Plan

## Overview

This document defines the design requirements for future EthioGrade printed answer sheet templates. These templates will be used for automated scanning once real OMR is implemented (v0.4+).

No real scanning exists in v0.1. This document is for planning and design reference only.

---

## Template Variants

### Template A: 20-Question Student Sheet

- Questions: Q1–Q20
- Answer format: MCQ bubbles (A, B, C, D, E per row)
- True/False section: optional T / F columns
- Student ID area: top-right (6 digits)
- Assessment ID area: top-left
- Marking notes area: not included (manual scoring only)

### Template B: 50-Question Student Sheet

- Questions: Q1–Q50
- Two-column layout for space efficiency
- Same structure as Template A otherwise

### Template C: 100-Question Student Sheet

- Questions: Q1–Q100
- Three-column layout
- Requires A4 paper minimum

### Template D: Master Key Sheet

- Same as student sheet but labeled "ANSWER KEY"
- Teacher marks correct answers
- No Student ID area (or labeled "Teacher Key")
- Used for Master Scan answer key capture

---

## Layout Requirements

### Corner Alignment Markers (Fiducials)

All templates must have four corner markers:
- Position: 15mm from each corner
- Size: 10mm × 10mm solid black squares
- Purpose: Allow the app to detect sheet orientation and correct perspective

Corner markers must:
- Be solid black (not outlined)
- Survive photocopying
- Be visible even if the sheet is slightly rotated (up to 15°)

### Student ID Area

- Position: Top-right of the sheet
- Format: 6 numbered bubbles, each with digits 0–9
- Purpose: Automatic student identification in future batch scan

### Assessment ID / QR Placeholder

- Position: Top-left of the sheet
- Format: Small QR code area (20mm × 20mm)
- Purpose: Future — encode assessment ID in QR for auto-linking

### MCQ Answer Bubbles

- Bubbles: A, B, C, D, E per question
- Size: 7mm diameter circles
- Fill method: Teacher/student uses pen to fill bubble completely
- Spacing: Minimum 10mm between adjacent bubbles to reduce detection errors

### True/False Section

- Two columns: T / F
- Same bubble size as MCQ

### Short Answer / Matching Area

- A blank space at the bottom of the sheet
- Labeled: "Teacher marks scores here"
- No automated detection — always manually scored by teacher

---

## Print Quality Requirements

- Design for single-color black-and-white
- Must be readable after photocopying (2nd generation copy)
- Line weight for bubbles: minimum 0.5mm stroke
- Corner markers: solid fill, minimum 8mm × 8mm
- Font: minimum 8pt for question numbers
- Overall layout: high contrast, no decorative gradients or patterns

---

## Paper Size Support

| Template | Paper | Orientation |
|---|---|---|
| 20-question | A4 or A5 | Portrait |
| 50-question | A4 | Portrait |
| 100-question | A4 | Portrait (2 pages if needed) |
| Master Key | A4 or A5 | Portrait |

---

## File Format

- PDF for printing
- PDF must be under 200 KB for easy WhatsApp sharing
- SVG source for future modifications

---

## Future Considerations

- QR code encoding of student ID + assessment ID for automatic linking
- Barcode strip on the side for sheet sequence detection in batch scanning
- Student name area (handwritten, not scanned automatically)
- Per-question weight printed on the sheet for teacher reference
- Color variants for blind-accessible photocopying (avoid light grey bubbles)

---

## Status

Template design has not started. This document is a planning reference for v0.4+ work. No templates exist yet.
