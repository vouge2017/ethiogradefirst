# Class Assessment — Specification

## What is a Class Assessment?

A Class Assessment is a grading session tied to a registered class of students. Unlike a Quick Assessment, the teacher sets up a class first (with student names and IDs), then creates assessments linked to that class. The app tracks which students have been graded, flags missing students, and prevents duplicate entries.

---

## Why Class Assessment Matters

Quick Assessment is fast but minimal. For end-of-term exams, the teacher needs:
- A complete class record (every student's result)
- Confidence that no student was missed or counted twice
- A reusable class list that doesn't need to be re-entered each exam
- Historical results per class over multiple assessments

---

## Flow

### 1. Class Setup (One-time per class)

Teacher creates a class:
- Class name (e.g. "Grade 8 Section A")
- Academic year (optional)
- Student list: each student has a name and roll number / ID

Student list can be:
- Entered manually on the phone (one by one)
- Future: imported from a CSV file

### 2. Assessment Creation

Teacher creates an assessment and links it to a class:
- Assessment title
- Question types and weights
- Answer key (manual entry or future Master Scan)

### 3. Grading Phase

Teacher grades students:
- **Manual grading:** Teacher enters answers for each student one at a time (current v0.1 approach applied to class context)
- **Future batch scan:** Teacher photographs each student's answer sheet; app assigns results to the correct student by matching student ID on the sheet

### 4. Missing Student Detection

After all papers are graded, the app compares the result list against the class register:
- Students with a result: marked ✅
- Students with no result: flagged as Missing ⚠️

Teacher can:
- Enter a missing student's result manually
- Mark a student as Absent

### 5. Duplicate Scan Prevention

If the same student ID appears twice in scanned results, the app:
- Shows a warning: "Duplicate result for [Name]"
- Asks the teacher to keep one or replace the existing result
- Does not silently overwrite

### 6. Results and Export

- Full class result table with names, IDs, scores, percentages, grade bands
- Class statistics: average, median, pass rate, highest, lowest
- CSV export with per-student and per-question data
- Results stored in history — accessible after the session

---

## Status

Class Assessment is **not implemented** in v0.1. Current version supports Quick Assessment only.

Target version: v0.2 (class setup and manual grading linked to class) with batch scan in v0.4.

---

## Gaps vs Current App

| Feature | Status |
|---|---|
| Quick Assessment (no class needed) | ✅ Built |
| Class creation and student register | ❌ Not built |
| Assessment linked to class | ❌ Not built |
| Missing student detection | ❌ Not built |
| Duplicate scan prevention | ❌ Not built |
| Historical results per class | ❌ Not built |
| Student list import from CSV | ❌ Not built |
