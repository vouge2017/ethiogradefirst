# Play Store Release Checklist — EthioGrade

## App Configuration
- [ ] Package ID: `com.ethiograde.app`
- [ ] App name: `EthioGrade`
- [ ] Version: `1.0.0` (versionCode: 1)
- [ ] targetSdkVersion: 35
- [ ] minSdkVersion: 26
- [ ] Adaptive icon configured
- [ ] Permissions declared in AndroidManifest.xml (CAMERA, READ_MEDIA_IMAGES)

## Build
- [ ] Release AAB generated via: `eas build --platform android --profile production`
- [ ] Signing keystore created and stored securely (NOT in repo)
- [ ] AAB file size reviewed (aim < 50MB for low-end device support)
- [ ] App tested on physical low-end Android device (2GB RAM)
- [ ] App launches without crash on cold start
- [ ] App works fully offline (airplane mode test)

## Store Listing
- [ ] Short description written (≤80 characters)
- [ ] Full description written (≤4000 characters)
- [ ] Category selected: Education
- [ ] Content rating completed (Everyone)
- [ ] App icon uploaded (512×512 px PNG)
- [ ] Feature graphic uploaded (1024×500 px)
- [ ] At least 2 screenshots per device type uploaded
- [ ] Phone screenshots (min 2, recommended 4–8)

## Policies
- [ ] Privacy Policy URL published and accessible
- [ ] Data Safety form completed
- [ ] No deceptive claims in listing (accuracy, official status)
- [ ] No restricted content

## Testing
- [ ] Internal testing track created
- [ ] At least 2 testers added to internal track
- [ ] AAB uploaded to internal testing
- [ ] Core flows tested: new assessment → scan → review → results → export
- [ ] Offline mode verified
- [ ] Low-confidence detection reviewed correctly

## Final Checklist Before Production
- [ ] All internal testing issues resolved
- [ ] Release notes written
- [ ] Rollout percentage set (start with 20%)
- [ ] Support email configured in Play Console
