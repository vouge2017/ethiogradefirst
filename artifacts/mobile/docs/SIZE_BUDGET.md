# EthioGrade — Mobile App Size Budget

## Target

**Android release APK: under 35 MB**

Ethiopian teachers often have devices with limited storage. A large app creates a barrier to adoption. The app must stay lean.

---

## Current Major Dependencies

| Package | Purpose | Size Impact |
|---|---|---|
| expo ~54 | App framework | Medium (tree-shaken) |
| react-native 0.81.5 | UI runtime | Medium |
| expo-router ~6 | Navigation | Low |
| @expo-google-fonts/inter | Typography | Low (~2 MB fonts) |
| @expo/vector-icons | Icons (Feather subset) | Low |
| react-native-reanimated ~4.1.1 | Animations | Medium |
| react-native-svg 15.12.1 | Grade distribution chart | Low |
| react-native-gesture-handler | Swipe gestures | Low |
| react-native-safe-area-context | Screen insets | Low |
| react-native-screens | Navigation | Low |
| react-native-keyboard-controller | Keyboard handling | Low |
| @react-native-async-storage/async-storage | Offline storage | Low |
| expo-haptics | Haptic feedback | Very low |
| expo-image-picker | Camera / gallery (future scanning) | Medium |
| expo-font | Font loading | Very low |
| expo-splash-screen | Splash screen | Very low |
| expo-linear-gradient | UI gradients | Very low |
| @tanstack/react-query | Data fetching | Low |

---

## Dependencies with Size Risk

### expo-image-picker (~17.0.9) — Already installed

**Risk:** Medium
**Size impact:** Adds camera permission handling and image library bindings.
**Status:** Already included. Not yet used in production flow (scan screen disabled).
**Action:** Keep — will be needed for Master Scan in v0.2. Do not remove.

### react-native-reanimated (~4.1.1) — Already installed

**Risk:** Medium
**Size impact:** C++ worklet runtime adds ~2–4 MB to the native bundle.
**Status:** Already included and used for animations.
**Action:** Keep — already paid the size cost.

---

## Dependencies to Avoid Without Approval

| Package | Reason to avoid |
|---|---|
| react-native-mlkit | ML Kit bundles are 10–30 MB. Wait until v0.3+. |
| @tensorflow/tfjs-react-native | TF.js bundle is 15–50 MB. Not acceptable. |
| react-native-opencv | C++ OpenCV is 20–40 MB. Not acceptable for v0.1–v0.2. |
| expo-camera (direct) | Larger than expo-image-picker. Stick with image-picker. |
| react-native-vision-camera | Very powerful but large. Evaluate at v0.3. |
| Any OCR cloud SDK | Would require internet. Violates offline-first rule. |

---

## Rules Before Adding Any New Dependency

1. **Check the size impact first.** Run a release build locally before merging.
2. **Check offline-first compatibility.** If it requires internet, it cannot be a core dependency.
3. **Check tree-shaking.** Does the package support ESM/tree-shaking? If not, the full bundle is included.
4. **Check Android and iOS.** Some packages have asymmetric size impact.
5. **Get approval** before adding any package over 2 MB estimated impact.

---

## Release Build Size Check

To check the current APK size:

```bash
# From Expo EAS Build
eas build --platform android --profile preview

# For local build (requires Android SDK)
cd android
./gradlew assembleRelease
# Check: android/app/build/outputs/apk/release/app-release.apk
```

Current release build size: **Not yet measured** (no EAS build has been run).
Estimated based on dependency audit: **15–25 MB** (within target).

---

## Future Scanning Size Plan

| Version | New Dependency | Estimated Size Add |
|---|---|---|
| v0.2 | expo-image-picker (already installed) | 0 MB additional |
| v0.3 | OCR / text detection (TBD) | TBD — evaluate at design time |
| v0.4 | Geometric detection library (lightweight JS) | < 1 MB estimated |
| v0.6 | Computer vision model (TBD) | TBD — may require EAS split APK |
| v1.0 | AI inference (TBD) | TBD — likely server-side to protect size |

---

## Recommendation

The current dependency set is conservative and within the 35 MB target. No size-related action is needed in v0.1.

Before v0.3, evaluate `react-native-vision-camera` and an OCR library in an isolated test build to measure real size impact before committing.
