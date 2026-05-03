# EthioGrade Scanning Roadmap

Scanning/OMR is not included in v0.1. This document describes three possible paths for adding it in future versions.

---

## Current Status

v0.1 (current release): Manual grading only. No camera scanning.  
The previous Math.random() mock scan has been removed from the teacher-facing app.

---

## Path 1 — Fixed-Template OMR (v0.2 target)

**How it works:**
- Design a specific EthioGrade answer sheet (PDF template)
- Teacher prints and distributes the sheet
- Student bubbles in answers with a pen
- Teacher photographs the sheet with the phone camera
- App detects bubble marks using geometric analysis (no ML required)

**Pros:**
- Works without internet
- Can run entirely on-device
- Known template → predictable detection accuracy
- Relatively simple implementation

**Cons:**
- Teachers must print the EthioGrade template
- Different sheet sizes (A4 vs A5) need calibration
- Printing infrastructure needed in rural areas

**Tech stack:** expo-image-picker + custom geometry detection (JavaScript)  
**Estimated effort:** 6–10 weeks

---

## Path 2 — ML Kit Assisted Scanning (v0.3 target)

**How it works:**
- Use Google ML Kit (React Native wrapper available) for document detection and perspective correction
- Use ML Kit's text recognition or custom TFLite model for bubble detection
- Works on any reasonably clear bubble sheet, not just EthioGrade template

**Pros:**
- More flexible — works with existing answer sheets
- Google ML Kit runs on-device (offline)
- Better accuracy than pure geometry

**Cons:**
- Requires training a custom TFLite model for Ethiopian answer sheet formats
- More complex integration
- Still requires clear photos and good lighting

**Tech stack:** react-native-mlkit or expo-modules + TFLite  
**Estimated effort:** 12–20 weeks (includes model training)

---

## Path 3 — Full Computer Vision OMR (v1.0 target)

**How it works:**
- Custom computer vision pipeline
- Handles varied answer sheet formats, orientations, lighting conditions
- Possibly cloud-assisted for difficult cases (with offline fallback)
- High confidence scoring with teacher correction workflow

**Pros:**
- Works with any bubble sheet
- Highest accuracy
- Can handle challenging field conditions

**Cons:**
- Requires significant ML expertise and training data
- Possible server dependency for hard cases
- Longest development timeline

**Tech stack:** Custom model + cloud inference API (optional)  
**Estimated effort:** 20–40 weeks

---

## Recommendation

Start with Path 1 (fixed-template OMR) in v0.2. It is the fastest path to real scanning and works offline. Validate with teachers before investing in Path 2 or 3.

---

## Decision Criteria for Moving to Scanning

Before building scanning, validate from teacher pilots:
1. Is manual entry too slow? (If not, scanning is lower priority)
2. Would teachers print and use a standard template?
3. What is the typical lighting / camera quality in target classrooms?
4. How many answers per paper? (Higher count → more scanning value)
