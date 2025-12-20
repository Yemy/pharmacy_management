#!/bin/bash

echo "🔧 Fixing Android build issues..."

# Navigate to project directory
cd "$(dirname "$0")"

# Clean Flutter
echo "Cleaning Flutter..."
flutter clean

# Remove problematic files
echo "Removing problematic files..."
rm -rf android/.gradle
rm -rf android/app/build
rm -rf android/build

# Get dependencies
echo "Getting dependencies..."
flutter pub get

# Try to run
echo "Attempting to run the app..."
flutter run

echo "✅ Fix script completed!"