---
description: how to build the Android APK for ChakaBnB mobile
---

## Build Android APK

This project uses a short build path (`C:\tmp\chakabnb\mobile`) to avoid
the Windows 260-character path limit with CMake/ninja.

// turbo
1. From the `mobile` folder, run the build script:
```powershell
.\build-apk.ps1
```

This script will:
- Sync project files to `C:\tmp\chakabnb\mobile` using robocopy
- Run `npm install` in the short path
- Run `npx expo prebuild --platform android --no-install`
- Build the APK with `./gradlew assembleRelease`
- Copy the finished `app-release.apk` back into this `mobile` folder

The APK will appear at:
```
c:\Users\denni\OneDrive\Documents\WebDev\ChakaBnB\mobile\app-release.apk
```

## Requirements
- Java 21 must be at: `C:\Users\denni\Downloads\Compressed\java-21-openjdk-21.0.4.0.7-1.win.jdk.x86_64\...`
- Android SDK must be at: `C:\Users\denni\AppData\Local\Android\Sdk`
