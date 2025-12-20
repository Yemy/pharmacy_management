#!/bin/bash

# Pharmacy Plus Mobile App Run Script

set -e

echo "🚀 Starting Pharmacy Plus Mobile App..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Flutter is installed
if ! command -v flutter &> /dev/null; then
    print_error "Flutter is not installed or not in PATH"
    print_status "Please install Flutter from: https://flutter.dev/docs/get-started/install"
    exit 1
fi

print_status "Flutter version:"
flutter --version

# Check Flutter doctor
print_status "Running Flutter doctor..."
flutter doctor

# Get dependencies
print_status "Getting dependencies..."
flutter pub get

# Generate code if needed
if [ -f "pubspec.yaml" ] && grep -q "build_runner" pubspec.yaml; then
    print_status "Generating code..."
    flutter packages pub run build_runner build --delete-conflicting-outputs
fi

# Check for connected devices
print_status "Checking for connected devices..."
DEVICES=$(flutter devices --machine | jq -r '.[].id' 2>/dev/null || flutter devices | grep -E "^[a-zA-Z0-9]" | wc -l)

if [ -z "$DEVICES" ] || [ "$DEVICES" = "0" ]; then
    print_warning "No devices found!"
    print_status "Available options:"
    print_status "1. Connect an Android device via USB"
    print_status "2. Start an Android emulator"
    print_status "3. Start iOS Simulator (macOS only)"
    print_status "4. Run on Chrome (flutter run -d chrome)"
    
    read -p "Do you want to run on Chrome? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Running on Chrome..."
        flutter run -d chrome
        exit 0
    else
        print_error "Please connect a device or start an emulator and try again"
        exit 1
    fi
fi

# Show available devices
print_status "Available devices:"
flutter devices

# Run the app
TARGET_DEVICE=${1:-""}

if [ -n "$TARGET_DEVICE" ]; then
    print_status "Running on device: $TARGET_DEVICE"
    flutter run -d "$TARGET_DEVICE"
else
    print_status "Running on default device..."
    flutter run
fi

print_success "App started successfully!"
print_status "Press 'r' to hot reload, 'R' to hot restart, 'q' to quit"