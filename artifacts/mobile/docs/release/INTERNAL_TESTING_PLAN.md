# Internal Testing Plan — EthioGrade

## Objective
Verify that core grading flows work correctly on real devices before publishing to the Play Store.

## Devices to Test On
- At least one low-end Android device (2GB RAM, Android 8.0+)
- At least one mid-range Android device (4GB RAM, Android 11+)
- Test in both landscape lock and portrait orientation

## Test Accounts
No accounts required — app works without login.

## Core Test Scenarios

### 1. App Launch
- [ ] App launches without crash
- [ ] Splash screen displays correctly
- [ ] Home screen shows "No assessments yet" on first launch

### 2. New Assessment — Quick Mode
- [ ] Tap "New" on home screen
- [ ] Enter assessment title
- [ ] Select question count (10, 20, 40)
- [ ] Optionally enter expected paper count
- [ ] Fill in all answers in the answer key
- [ ] Tap "Start Scanning"

### 3. Scan Paper
- [ ] Camera permission dialog appears and works
- [ ] Take photo with camera
- [ ] Processing animation plays
- [ ] App navigates to Review screen

### 4. Import from Gallery
- [ ] Gallery permission dialog appears and works
- [ ] Select image from gallery
- [ ] Processing animation plays
- [ ] App navigates to Review screen

### 5. Review Screen
- [ ] Captured image is displayed
- [ ] All detected answers are shown
- [ ] Issues are listed (if any)
- [ ] Teacher can tap any bubble to correct an answer
- [ ] "Uncertain" answers are highlighted
- [ ] Score preview updates as corrections are made
- [ ] "Retake" returns to scan screen
- [ ] "Confirm Result" saves and returns to scan screen

### 6. Multiple Papers
- [ ] Scan 3+ papers in a row
- [ ] Each paper gets a unique label (Paper 1, 2, 3...)
- [ ] All results appear in Results screen

### 7. Results Screen
- [ ] Class average calculates correctly
- [ ] Pass rate calculates correctly
- [ ] Pending papers show in yellow section
- [ ] Reviewed papers show in Results section
- [ ] Score bars render correctly

### 8. CSV Export
- [ ] Tap Export CSV
- [ ] Android Share sheet appears
- [ ] Share to Gmail or Files
- [ ] CSV file contains correct data (answer key row, per-paper scores)

### 9. Offline Mode
- [ ] Enable airplane mode
- [ ] Create new assessment
- [ ] Scan paper (import from gallery)
- [ ] Review and confirm
- [ ] View results
- [ ] Export CSV via Share
- [ ] Confirm everything works without internet

### 10. App Restart Persistence
- [ ] Close app completely
- [ ] Reopen app
- [ ] Verify saved assessments appear on home screen
- [ ] Open a saved assessment
- [ ] Verify all papers and results are intact

### 11. Delete Assessment
- [ ] Long-press or tap delete on home screen card
- [ ] Confirm deletion dialog
- [ ] Assessment is removed

## Known Limitations to Note During Testing
- OMR detection is simulated in this build; real CV integration is a future phase
- Detection results require teacher review — do not use without reviewing
- Poor lighting will affect real OMR accuracy
- GradeFlow Bubble 20 template only
