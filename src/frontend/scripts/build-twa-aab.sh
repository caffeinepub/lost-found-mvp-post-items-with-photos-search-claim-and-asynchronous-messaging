#!/bin/bash

# Lost It Find It - Android TWA Build Script
# This script builds the Android App Bundle (.aab) from the checked-in Bubblewrap project

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Lost It Find It - TWA Build Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if we're in the correct directory
if [ ! -d "android-twa" ]; then
    echo -e "${RED}Error: android-twa directory not found${NC}"
    echo "Please run this script from the frontend directory:"
    echo "  cd frontend"
    echo "  ./scripts/build-twa-aab.sh"
    exit 1
fi

# Check if Bubblewrap project exists
if [ ! -d "../bubblewrap" ]; then
    echo -e "${RED}Error: /bubblewrap/ directory not found${NC}"
    echo "The Bubblewrap Android project should be at the repository root."
    exit 1
fi

# Auto-restore AndroidManifest.xml if missing
if [ ! -f "../bubblewrap/app/src/main/AndroidManifest.xml" ]; then
    echo -e "${YELLOW}AndroidManifest.xml not found, restoring from template...${NC}"
    
    TEMPLATE_PATH="android-twa/android-project-files.template/AndroidManifest.xml.template"
    TARGET_PATH="../bubblewrap/app/src/main/AndroidManifest.xml"
    
    if [ ! -f "$TEMPLATE_PATH" ]; then
        echo -e "${RED}Error: Template not found at $TEMPLATE_PATH${NC}"
        exit 1
    fi
    
    # Create parent directories if needed
    mkdir -p "$(dirname "$TARGET_PATH")"
    
    # Copy template to target location
    cp "$TEMPLATE_PATH" "$TARGET_PATH"
    
    echo -e "${GREEN}✓ AndroidManifest.xml restored from template${NC}"
    echo "  Location: $TARGET_PATH"
    echo "  Default package: app.lostitfindit.twa (replace before production build)"
    echo ""
fi

# Verify AndroidManifest.xml now exists
if [ ! -f "../bubblewrap/app/src/main/AndroidManifest.xml" ]; then
    echo -e "${RED}Error: AndroidManifest.xml still not found after restoration attempt${NC}"
    echo ""
    echo "Expected path: /bubblewrap/app/src/main/AndroidManifest.xml"
    echo ""
    echo "Manual restoration steps:"
    echo "  1. Copy the template from frontend/android-twa/android-project-files.template/AndroidManifest.xml.template"
    echo "  2. Place it at /bubblewrap/app/src/main/AndroidManifest.xml"
    echo "  3. Replace the package name placeholder (app.lostitfindit.twa) with your unique package ID"
    echo "  4. Ensure it matches the package_name in frontend/public/.well-known/assetlinks.json"
    echo ""
    echo "For complete instructions, see:"
    echo "  - /bubblewrap/README.md"
    echo "  - frontend/docs/android-twa-bubblewrap-guide.md"
    exit 1
fi

# Check if Android SDK is configured
if [ -z "$ANDROID_HOME" ]; then
    echo -e "${YELLOW}Warning: ANDROID_HOME environment variable is not set${NC}"
    echo "Make sure Android SDK is installed and ANDROID_HOME points to it"
    echo ""
fi

echo -e "${GREEN}Step 1: Validating placeholder replacements...${NC}"

# Check for common placeholders that must be replaced
PLACEHOLDER_ERRORS=0

# Check in bubblewrap/app/build.gradle
if grep -q "YOUR_PRODUCTION_URL_HERE" ../bubblewrap/app/build.gradle 2>/dev/null; then
    echo -e "${RED}✗ Placeholder found: YOUR_PRODUCTION_URL_HERE in bubblewrap/app/build.gradle${NC}"
    PLACEHOLDER_ERRORS=$((PLACEHOLDER_ERRORS + 1))
fi

if grep -q "app.lostitfindit.twa" ../bubblewrap/app/build.gradle 2>/dev/null; then
    echo -e "${YELLOW}⚠ Default package name 'app.lostitfindit.twa' found in bubblewrap/app/build.gradle${NC}"
    echo "  Consider replacing with your own unique package name"
fi

# Check in bubblewrap/app/src/main/AndroidManifest.xml
if grep -q "app.lostitfindit.twa" ../bubblewrap/app/src/main/AndroidManifest.xml 2>/dev/null; then
    echo -e "${YELLOW}⚠ Default package name 'app.lostitfindit.twa' found in bubblewrap/app/src/main/AndroidManifest.xml${NC}"
    echo "  Consider replacing with your own unique package name"
fi

# Check in bubblewrap/app/src/main/res/values/strings.xml
if grep -q "YOUR_PRODUCTION_URL_HERE" ../bubblewrap/app/src/main/res/values/strings.xml 2>/dev/null; then
    echo -e "${RED}✗ Placeholder found: YOUR_PRODUCTION_URL_HERE in bubblewrap/app/src/main/res/values/strings.xml${NC}"
    PLACEHOLDER_ERRORS=$((PLACEHOLDER_ERRORS + 1))
fi

# Check in frontend/public/.well-known/assetlinks.json
if grep -q "REPLACE_WITH_YOUR_SHA256_FINGERPRINT" public/.well-known/assetlinks.json 2>/dev/null; then
    echo -e "${YELLOW}⚠ SHA-256 fingerprint placeholder found in public/.well-known/assetlinks.json${NC}"
    echo "  You can replace this after your first Play Console upload"
fi

if [ $PLACEHOLDER_ERRORS -gt 0 ]; then
    echo ""
    echo -e "${RED}Build cannot proceed: $PLACEHOLDER_ERRORS critical placeholder(s) must be replaced${NC}"
    echo ""
    echo "Required replacements:"
    echo "  1. Replace YOUR_PRODUCTION_URL_HERE with your deployed PWA URL"
    echo "     Files: bubblewrap/app/build.gradle, bubblewrap/app/src/main/res/values/strings.xml"
    echo ""
    echo "  2. (Optional but recommended) Replace app.lostitfindit.twa with your unique package name"
    echo "     Files: bubblewrap/app/build.gradle, bubblewrap/app/src/main/AndroidManifest.xml"
    echo "     Must match: frontend/public/.well-known/assetlinks.json package_name field"
    echo ""
    echo "See /bubblewrap/README.md for complete instructions"
    exit 1
fi

echo -e "${GREEN}✓ Placeholder validation passed${NC}"
echo ""

# Navigate to Bubblewrap project
cd ../bubblewrap

echo -e "${GREEN}Step 2: Building Android App Bundle...${NC}"
echo "This may take a few minutes..."
echo ""

# Build the app bundle using Gradle
if [ -f "gradlew" ]; then
    ./gradlew clean bundleRelease
else
    echo -e "${RED}Error: gradlew not found in /bubblewrap/${NC}"
    echo "The Gradle wrapper should be present in the Bubblewrap project"
    exit 1
fi

echo ""
echo -e "${GREEN}Step 3: Copying output files...${NC}"

# Create output directory if it doesn't exist
mkdir -p ../frontend/android-twa/out

# Find the generated AAB file
AAB_SOURCE="app/build/outputs/bundle/release/app-release.aab"
AAB_DEST="../frontend/android-twa/out/app-release.aab"

if [ -f "$AAB_SOURCE" ]; then
    cp "$AAB_SOURCE" "$AAB_DEST"
    echo -e "${GREEN}✓ Android App Bundle copied to: frontend/android-twa/out/app-release.aab${NC}"
else
    echo -e "${RED}Error: AAB file not found at expected location${NC}"
    echo "Expected: $AAB_SOURCE"
    echo ""
    echo "Looking for AAB in build outputs..."
    find app/build/outputs -name "*.aab" -type f 2>/dev/null || echo "No .aab files found"
    exit 1
fi

# Also copy APK if available (for local testing)
APK_SOURCE="app/build/outputs/apk/release/app-release.apk"
APK_DEST="../frontend/android-twa/out/app-release.apk"

if [ -f "$APK_SOURCE" ]; then
    cp "$APK_SOURCE" "$APK_DEST"
    echo -e "${GREEN}✓ APK copied to: frontend/android-twa/out/app-release.apk (for local testing)${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Build Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Output files:"
echo "  📦 Play Store upload: frontend/android-twa/out/app-release.aab"
if [ -f "$APK_DEST" ]; then
    echo "  📱 Local testing:     frontend/android-twa/out/app-release.apk"
fi
echo ""
echo "Next steps:"
echo "  1. Upload app-release.aab to Google Play Console"
echo "  2. Obtain SHA-256 fingerprint from Play Console (App Integrity)"
echo "  3. Update frontend/public/.well-known/assetlinks.json with fingerprint"
echo "  4. Deploy updated assetlinks.json to your production PWA URL"
echo ""
echo "For detailed instructions, see:"
echo "  frontend/docs/android-twa-bubblewrap-guide.md"
echo ""
