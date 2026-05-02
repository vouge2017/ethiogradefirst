# Known Limitations — EthioGrade v1.0.0

## Template Support
- Only the **GradeFlow Bubble 20 v1** template is supported in this release
- Other bubble sheet formats are not recognized
- Non-standard paper sizes or layouts may produce incorrect detections

## Detection Accuracy
- Detection results are **never final without teacher review**
- Poor scan conditions reduce accuracy:
  - Low lighting or harsh shadows
  - Glare from flash or window light
  - Blurry or out-of-focus photos
  - Wrinkled, folded, or damaged sheets
  - Misaligned sheets (not flat)
- The app flags uncertain answers for teacher correction — always review flagged items

## Grading Scope
- Only **objective / multiple-choice** questions (A–E) are supported
- **Essay and short-answer grading is not supported** in this release
- Fill-in-the-blank and matching questions are not supported

## Scale
- Designed for classroom-scale use (up to ~60 papers per assessment)
- Very large batches may be slower on low-end devices

## Platform
- Android only (this release)
- iOS is not targeted for this release
- No web or desktop version

## No Student Database
- The Quick Assessment mode does not require student registration
- Student names are not linked to papers in this release
- Papers are labeled numerically (Paper 1, Paper 2, etc.)

## No Cloud Sync
- All data is stored locally on the device
- Clearing app data or uninstalling will delete all saved assessments
- No backup or sync between devices

## Export Format
- CSV export only
- No PDF export in this release
- Share sheet behavior depends on apps installed on the device

## Permission Notes
- Camera and photo library permissions are required for scanning
- Denying permissions will disable scan functionality
- Permissions can be granted from Android Settings > Apps > EthioGrade > Permissions
