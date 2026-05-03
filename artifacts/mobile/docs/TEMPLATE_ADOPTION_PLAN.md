# EthioGrade Template Adoption Plan

## Goal

Move teachers from manual grading today toward template-based fast scanning in the future — without forcing template adoption before trust is established.

---

## The Adoption Ladder

### Step 1: Manual Entry (Today — v0.1)

Teacher enters each student's answers on the phone.
No paper scanning. No template required.
This is the baseline — every teacher can use this immediately.

**What the app should show:**
> "Manual grading is accurate and always works. When you're ready for faster grading, we'll guide you."

---

### Step 2: Guided Layout (Future — v0.3)

Teacher uses their existing paper but follows a simple numbered layout.
App reads it with OCR. Teacher reviews flagged items.
No printed template required. Low adoption barrier.

**What the app should show:**
> "Use this format on your existing paper and we can read most answers automatically. You'll still review anything we're unsure about."

The app shows a sample of the guided layout format when the teacher first tries scanning.

---

### Step 3: Confidence Calibration (v0.3+)

After the teacher has used guided layout for a few assessments, the app can show:
> "In your last 3 assessments, 82% of answers were detected automatically. Consider using the EthioGrade printed template for even higher accuracy."

This surfaces the value of the template without forcing it.

---

### Step 4: Template Introduction (v0.4)

Teacher downloads and prints the EthioGrade answer sheet.
First use: app walks through setup and explains alignment markers.
After first successful scan: teacher sees the speed difference.

**What the app should show (first use):**
> "Great — you're using the EthioGrade template. We can detect answers with high confidence and flag only the ones we're unsure about."

---

### Step 5: Template as Default (v0.5+)

Teachers who have completed 5+ assessments with the template see it as the default.
Guided Layout and Manual Entry remain available as fallbacks.

---

## Confidence Messages the App Should Show

These are educational messages that help teachers understand why review is needed, without making the app feel unreliable:

| Situation | App message |
|---|---|
| High confidence detection | ✅ "Detected clearly" |
| Medium confidence | ⚠️ "Please verify this answer" |
| Low confidence / undetected | ❌ "Could not detect — please enter manually" |
| Low light photo | "Photo quality may affect accuracy. Try better lighting." |
| Many low-confidence results | "Consider using the EthioGrade template for better accuracy." |
| First time scanning | "You'll need to confirm every detected answer this time." |

---

## What the App Should Never Say

- "Automatically graded" (without teacher confirmation)
- "AI detected" (without actual AI)
- "100% accurate"
- "Scan any paper perfectly"
- "No review needed"

---

## Printing Access Notes

Many Ethiopian schools have limited printing access. The adoption plan accounts for this:

1. A4 and A5 template sizes should both be supported
2. Template must work on low-quality photocopies (not just original laser prints)
3. Template should be designed for single-color black-and-white printing
4. Alignment markers must be thick enough to survive photocopier degradation
5. Template PDF should be small enough to share via WhatsApp

---

## Rollout Sequence

| Version | What teachers get |
|---|---|
| v0.1 | Manual grading — works today, no barriers |
| v0.2 | Master Scan for answer key — saves phone tapping |
| v0.3 | Guided Layout student scan — some automation, no template needed |
| v0.4 | EthioGrade Template — fast, high-confidence, requires printing |
| v0.5+ | Confidence learning — app improves over time with teacher corrections |
