# ChakaBnB Android APK Build Script
# Run from: c:\Users\denni\OneDrive\Documents\WebDev\ChakaBnB\mobile
# Usage: .\build-apk.ps1
# To bump version before building: .\build-apk.ps1 -BumpVersion

param(
    [switch]$BumpVersion
)

$JAVA_HOME = "C:\Users\denni\Downloads\Compressed\java-21-openjdk-21.0.4.0.7-1.win.jdk.x86_64\java-21-openjdk-21.0.4.0.7-1.win.jdk.x86_64"
$BUILD_DIR = "C:\tmp\chakabnb\mobile"
$SOURCE_DIR = $PSScriptRoot
$APP_JSON = "$SOURCE_DIR\app.json"

# Read version from app.json
$appConfig = Get-Content $APP_JSON | ConvertFrom-Json
$version = $appConfig.expo.version
$versionCode = $appConfig.expo.android.versionCode

# Bump version if requested
if ($BumpVersion) {
    $parts = $version -split '\.'
    $parts[2] = [int]$parts[2] + 1
    $version = $parts -join '.'
    $versionCode = $versionCode + 1
    $appConfig.expo.version = $version
    $appConfig.expo.android.versionCode = $versionCode
    $appConfig | ConvertTo-Json -Depth 10 | Set-Content $APP_JSON -Encoding UTF8
    Write-Host "==> Bumped version to $version (versionCode: $versionCode)" -ForegroundColor Yellow
}

Write-Host "==> Building ChakaBnB v$version (versionCode: $versionCode)" -ForegroundColor Cyan

# Sync source files (excluding large/generated folders)
Write-Host "==> Syncing project files to short build path..." -ForegroundColor Cyan
robocopy $SOURCE_DIR $BUILD_DIR /MIR /XD node_modules android ios dist .expo .git /XF "*.apk" /NFL /NDL /NJH /NJS

# Install dependencies
Write-Host "==> Installing npm dependencies..." -ForegroundColor Cyan
npm install --prefix $BUILD_DIR

# Write local.properties for Android SDK
Set-Content "$BUILD_DIR\android\local.properties" -Encoding ASCII -Value "sdk.dir=C\:\\Users\\denni\\AppData\\Local\\Android\\Sdk"

# Run Expo prebuild
Write-Host "==> Running Expo prebuild..." -ForegroundColor Cyan
Push-Location $BUILD_DIR
npx expo prebuild --platform android --no-install 2>&1 | Where-Object { $_ -notmatch "^env:" }
Pop-Location

# Write local.properties again (prebuild may clear it)
Set-Content "$BUILD_DIR\android\local.properties" -Encoding ASCII -Value "sdk.dir=C\:\\Users\\denni\\AppData\\Local\\Android\\Sdk"

# Run Gradle build
Write-Host "==> Building APK with Gradle..." -ForegroundColor Cyan
$env:JAVA_HOME = $JAVA_HOME
Push-Location "$BUILD_DIR\android"
.\gradlew assembleRelease
Pop-Location

# Copy APK back with versioned name
$APK_SRC = "$BUILD_DIR\android\app\build\outputs\apk\release\app-release.apk"
$APK_NAME = "ChakaBnB-v$version.apk"
$APK_DEST = "$SOURCE_DIR\$APK_NAME"

if (Test-Path $APK_SRC) {
    # Remove old APKs
    Get-ChildItem "$SOURCE_DIR\ChakaBnB-v*.apk" | Remove-Item -Force
    Copy-Item $APK_SRC -Destination $APK_DEST -Force
    $size = [math]::Round((Get-Item $APK_DEST).Length / 1MB, 1)
    Write-Host ""
    Write-Host "SUCCESS: $APK_NAME is ready ($size MB)" -ForegroundColor Green
} else {
    Write-Host "FAILED: Build failed - APK not found." -ForegroundColor Red
    exit 1
}
