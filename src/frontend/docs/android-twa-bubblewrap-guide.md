# Android TWA Build Guide - Lost It Find It

This guide provides step-by-step instructions for building an Android App Bundle (.aab) from the Lost It Find It PWA using the checked-in Bubblewrap project.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Understanding the TWA Architecture](#understanding-the-twa-architecture)
3. [Initial Setup](#initial-setup)
4. [Configuring Placeholders](#configuring-placeholders)
5. [Building the App Bundle](#building-the-app-bundle)
6. [Digital Asset Links Verification](#digital-asset-links-verification)
7. [Testing Locally](#testing-locally)
8. [Preparing for Play Store Upload](#preparing-for-play-store-upload)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have the following installed:

### Required Software

1. **Node.js** (v16 or later)
   ```bash
   node --version
   ```

2. **Java Development Kit (JDK)** (v11 or later)
   ```bash
   java -version
   ```

3. **Android SDK** (via Android Studio or command-line tools)
   - Android SDK Build-Tools (version 33.0.0 or later)
   - Android SDK Platform 33 (API level 33)
   - Set `ANDROID_HOME` environment variable

### Verify Installation

