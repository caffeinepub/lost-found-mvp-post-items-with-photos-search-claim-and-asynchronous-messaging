# Lost It Find It - Android Trusted Web Activity (TWA) Project

This directory contains documentation and templates for the Android TWA project. The actual, inspectable Android Studio project is committed at the repository root: `/bubblewrap/`

## Overview

A Trusted Web Activity (TWA) is a way to package your Progressive Web App (PWA) as an Android application. This project uses [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) to generate the Android project structure.

## Important: Developer Placeholders

**Before building, you MUST replace the following placeholders in `/bubblewrap/`:**

1. **Android Package Name** (applicationId): Currently set to `app.lostitfindit.twa`
   - Must match the `package_name` in `frontend/public/.well-known/assetlinks.json`
   - Choose a unique reverse-domain format (e.g., `com.yourcompany.lostitfindit`)
   - **Location to edit**: `/bubblewrap/app/src/main/AndroidManifest.xml` (package attribute)

2. **Production PWA URL**: Replace `YOUR_PRODUCTION_URL_HERE` with your actual deployed PWA URL
   - This is the URL where your PWA is hosted (e.g., `https://lostitfindit.ic0.app`)

3. **SHA-256 Certificate Fingerprint**: Replace `REPLACE_WITH_YOUR_SHA256_FINGERPRINT`
   - Required in both `frontend/public/.well-known/assetlinks.json` and the Android signing configuration
   - Obtained from your Play Console signing certificate or local keystore

4. **Keystore Details** (for local builds):
   - Keystore file path
   - Keystore password
   - Key alias
   - Key password

See `/bubblewrap/README.md` and `android-project-files.template/PLACEHOLDERS.md` for complete reference.

## AndroidManifest.xml Location

The canonical AndroidManifest.xml file for the TWA is located at:
**`/bubblewrap/app/src/main/AndroidManifest.xml`**

This is where you should inspect and edit the Android package name to ensure it matches your `frontend/public/.well-known/assetlinks.json` configuration.

### Restoring Missing Manifest

If the manifest is missing (e.g., after a fresh clone or if it was accidentally deleted), it will be **automatically restored** when you run the build script:

