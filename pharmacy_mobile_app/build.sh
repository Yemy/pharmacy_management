#!/bin/bash

# Pharmacy Plus Mobile App Build Script

set -e

echo "🏗️  Building Pharmacy Plus Mobile App..."

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
    exit 1
fi

print_status "Flutter version:"
flutter --version

# Clean previous builds
print_status "Cleaning previous builds..."
flutter clean

# Get dependencies
print_status "Getting dependencies..."
flutter pub get

# Generate code
print_status "Generating code..."
flutter packages pub run build_runner build --delete-conflicting-outputs

# Analyze code
print_status "Analyzing code..."
flutter analyze

# Run tests
print_status "Running tests..."
flutter test

# Check build target
BUILD_TARGET=${1:-"all"}

case $BUILD_TARGET in
    "android")
        print_status "Building for Android..."
        
        # Build APK
        print_status "Building APK..."
        flutter build apk --release
        
        # Build App Bundle
        print_status "Building App Bundle..."
        flutter build appbundle --release
        
        print_success "Android build completed!"
        print_status "APK location: build/app/outputs/flutter-apk/app-release.apk"
        print_status "App Bundle location: build/app/outputs/bundle/release/app-release.aab"
        ;;
        
    "ios")
        print_status "Building for iOS..."
        
        if [[ "$OSTYPE" != "darwin"* ]]; then
            print_error "iOS build is only supported on macOS"
            exit 1
        fi
        
        flutter build ios --release
        
        print_success "iOS build completed!"
        print_status "iOS build location: build/ios/iphoneos/Runner.app"
        ;;
        
    "web")
        print_status "Building for Web..."
        
        flutter build web --release
        
        print_success "Web build completed!"
        print_status "Web build location: build/web/"
        ;;
        
    "all")
        print_status "Building for all platforms..."
        
        # Android
        print_status "Building Android APK..."
        flutter build apk --release
        
        print_status "Building Android App Bundle..."
        flutter build appbundle --release
        
        # iOS (only on macOS)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            print_status "Building iOS..."
            flutter build ios --release
        else
            print_warning "Skipping iOS build (not on macOS)"
        fi
        
        # Web
        print_status "Building Web..."
        flutter build web --release
        
        print_success "All builds completed!"
        ;;
        
    *)
        print_error "Invalid build target: $BUILD_TARGET"
        print_status "Usage: $0 [android|ios|web|all]"
        exit 1
        ;;
esac

# Build summary
print_success "🎉 Build process completed successfully!"
print_status "Build artifacts are available in the build/ directory"

# Optional: Open build directory
if command -v open &> /dev/null; then
    read -p "Open build directory? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open build/
    fi
fi