# ChakaBnB Mobile — Command Reference

## Build APK

```powershell
# From project root (ChakaBnB folder):

# Build APK (same version)
.\mobile\build-apk.ps1

# Build APK + bump patch version (e.g. 1.0.0 -> 1.0.1)
.\mobile\build-apk.ps1 -BumpVersion
```

Output: `mobile\ChakaBnB-v{version}.apk`

---

## Expo Dev Server

```powershell
cd mobile
npx expo start          # Start dev server (scan QR with Expo Go)
npx expo start --clear  # Clear cache and start
```

---

## Install / Update Dependencies

```powershell
cd mobile
npm install             # Install all deps
npm install <package>   # Add a new package
npx expo install <pkg>  # Add Expo-compatible package (preferred)
```

---

## Expo Prebuild (Regenerate Android/iOS Native Folders)

```powershell
cd mobile
npx expo prebuild --platform android --clean
```

---

## Gradle (Manual, from mobile\android)

```powershell
$env:JAVA_HOME="C:\Users\denni\Downloads\Compressed\java-21-openjdk-21.0.4.0.7-1.win.jdk.x86_64\java-21-openjdk-21.0.4.0.7-1.win.jdk.x86_64"
cd mobile\android
.\gradlew assembleRelease   # Build release APK
.\gradlew clean             # Clean build cache
```

---

## Version Management

Edit `mobile\app.json`:
- `version` — displayed version (e.g. `"1.0.1"`)
- `android.versionCode` — integer, must increment every Play Store upload

---

## Git

```powershell
git add .
git commit -m "your message"
git push
```

---

## Notes

- Always build from `C:\tmp\chakabnb\mobile` (handled automatically by `build-apk.ps1`)
  to avoid Windows 260-char path limit
- Java 21 path: `C:\Users\denni\Downloads\Compressed\java-21-openjdk-21.0.4.0.7-1.win.jdk.x86_64\...`
- Android SDK path: `C:\Users\denni\AppData\Local\Android\Sdk`
- Long paths are enabled in Windows registry (`LongPathsEnabled = 1`)
