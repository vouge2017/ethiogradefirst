# EthioGrade — Workflow Modes

## Overview

EthioGrade has two grading modes and several answer key and grading methods that can be mixed and matched.

---

## Mode 1: Quick Assessment

**Purpose:** Fast, ad-hoc grading without class setup.

**When to use:**
- One-off quizzes or pop tests
- Teacher wants results immediately
- No student register needed
- Small classes or individual grading

**Flow:**
1. Teacher taps "New Quick Assessment"
2. Enters title and question count
3. Sets question types and weights
4. Enters answer key manually (or future: Master Scan)
5. Grades students one at a time (manual entry)
6. Views results and optionally exports CSV
7. Results stored for the session; minimal history

**Student identity:** Name and ID are optional.

**Status:** Built in v0.1.

---

## Mode 2: Class Assessment

**Purpose:** Full batch grading for a registered class.

**When to use:**
- End-of-term exams
- Large classes (30–80 students)
- Teacher needs complete class records
- Missing/duplicate paper tracking needed

**Flow:**
1. Teacher selects or creates a class (student register)
2. Creates assessment linked to that class
3. Sets answer key (manual or Master Scan)
4. Grades students — by scan batch or manual fallback
5. App tracks missing students and duplicate scans
6. Teacher reviews only exceptions
7. Results exported with full class history

**Status:** Planned for v0.2.

---

## Answer Key Methods

### Manual Key Entry (v0.1 — Built)
Teacher taps each answer on the phone. Supports MCQ (A–E), True/False, and marking notes for Short Answer and Matching.

### Master Scan Key (v0.2 — Planned)
Teacher marks a paper answer sheet with the correct answers, scans it with the camera, and the app detects the answer key. Teacher confirms/edits before saving. Reduces phone tapping for large assessments.

---

## Grading Methods

### Manual Grading (v0.1 — Built)
Teacher taps or enters each student's answers on the phone. MCQ and T/F are auto-scored. Short Answer and Matching are scored manually with teacher-assigned points.

### Student Paper Scan (v0.3 — Planned)
Teacher photographs student answer sheets. App detects answers, assigns confidence scores, and flags low-confidence items for teacher review. Teacher confirms or corrects each flagged item.

### Manual Fallback (Always Available)
If scanning fails or confidence is too low for a particular question, the teacher can always enter the answer manually. Manual fallback is never blocked.

### Hybrid Grading (v0.1 — Built)
MCQ and T/F scored automatically from a manual key; Short Answer and Matching scored manually. This is the current v0.1 model.

---

## Review Queue

When scanning produces low-confidence detections, those papers and questions are added to a review queue. The teacher works through the queue, confirming or correcting, before results are finalized.

**Status:** Review screen exists in v0.1 for manual verification. Scan-based confidence review is planned for v0.3.

---

## Missing Student Detection

When a class register exists and batch scanning is complete, the app compares scanned results against the register and flags students with no result. Teacher can choose to enter missed students manually or mark them absent.

**Status:** Planned for v0.4.

---

## Duplicate Scan Prevention

If the same student answer sheet is scanned twice (same student ID detected), the app warns the teacher and prevents a duplicate result from being recorded.

**Status:** Planned for v0.4.
