#!/bin/bash

# Lost It Find It - Restore Bubblewrap AndroidManifest.xml
# This script restores the AndroidManifest.xml from the template when missing

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

TEMPLATE_PATH="android-twa/android-project-files.template/AndroidManifest.xml.template"
TARGET_PATH="../bubblewrap/app/src/main/AndroidManifest.xml"

# Check if we're in the correct directory
if [ ! -d "android-twa" ]; then
    echo "Error: android-twa directory not found"
    echo "Please run this script from the frontend directory:"
    echo "  cd frontend"
    echo "  ./scripts/restore-bubblewrap-manifest.sh"
    exit 1
fi

# Check if template exists
if [ ! -f "$TEMPLATE_PATH" ]; then
    echo "Error: Template not found at $TEMPLATE_PATH"
    exit 1
fi

# Check if target already exists
if [ -f "$TARGET_PATH" ]; then
    echo -e "${YELLOW}AndroidManifest.xml already exists at $TARGET_PATH${NC}"
    echo "No restoration needed."
    exit 0
fi

# Create parent directories if needed
mkdir -p "$(dirname "$TARGET_PATH")"

# Copy template to target location
cp "$TEMPLATE_PATH" "$TARGET_PATH"

echo -e "${GREEN}✓ AndroidManifest.xml restored from template${NC}"
echo "  Location: $TARGET_PATH"
echo ""
echo "Note: The default package name 'app.lostitfindit.twa' is preserved."
echo "Replace it with your unique package ID before building for production."
echo "It must match the package_name in frontend/public/.well-known/assetlinks.json"
echo ""
