# Android TWA Project - Required Placeholders

This document lists all placeholders that MUST be replaced before building the Android TWA project for Play Store upload.

## Critical: Package Name Consistency

**The Android package name (applicationId) MUST match the `package_name` in `frontend/public/.well-known/assetlinks.json`**

This is required for Digital Asset Links verification, which allows the TWA to open without browser UI.

---

## 1. Android Package Name (applicationId)

**Current Placeholder**: `app.lostitfindit.twa`

**Where to Replace**:
- `/bubblewrap/app/src/main/AndroidManifest.xml` → `package` attribute (canonical location)
- `frontend/android-twa/twa-manifest.template.json` → `packageId` field
- `frontend/public/.well-known/assetlinks.json` → `package_name` field
- Android project `build.gradle` → `applicationId` (after project generation)

**Format**: Reverse domain notation (e.g., `com.yourcompany.lostitfindit`)

**Requirements**:
- Must be unique across Google Play Store
- Must match exactly in all locations
- Cannot be changed after first Play Store upload

**How to Edit**:
1. Open `/bubblewrap/app/src/main/AndroidManifest.xml`
2. Change the `package` attribute in the `<manifest>` tag
3. Ensure the same value is used in `assetlinks.json` and `build.gradle`

---

## 2. Production PWA URL

**Current Placeholder**: `https://YOUR_PRODUCTION_URL_HERE`

**Where to Replace**:
- `frontend/android-twa/twa-manifest.template.json` → `host` field
- `frontend/android-twa/twa-manifest.template.json` → `iconUrl` field
- `frontend/android-twa/twa-manifest.template.json` → `maskableIconUrl` field
- `frontend/android-twa/twa-manifest.template.json` → `webManifestUrl` field

**Example**: `https://lostitfindit.ic0.app` or your custom domain

**Requirements**:
- Must be HTTPS
- Must be the actual deployed URL where your PWA is accessible
- Must serve the PWA manifest at `/manifest.webmanifest`
- Must serve Digital Asset Links at `/.well-known/assetlinks.json`

---

## 3. SHA-256 Certificate Fingerprint

**Current Placeholder**: `REPLACE_WITH_YOUR_SHA256_FINGERPRINT`

**Where to Replace**:
- `frontend/public/.well-known/assetlinks.json` → `sha256_cert_fingerprints` array

**How to Obtain**:

### Option A: From Google Play Console (Recommended for Production)
1. Upload your app to Play Console (internal test track is fine)
2. Go to: Release → Setup → App Integrity
3. Copy the SHA-256 certificate fingerprint from "App signing key certificate"
4. Paste into `assetlinks.json`

### Option B: From Local Keystore (For Testing)
