# Pharmacy Plus Mobile App - Complete Setup Guide

## 🚀 Quick Start

### Prerequisites
- Flutter SDK 3.10.0 or later
- Dart SDK (included with Flutter)
- Android Studio or VS Code
- Git

### 1. Install Flutter

#### Windows
```bash
# Download Flutter SDK from https://flutter.dev/docs/get-started/install/windows
# Extract to C:\flutter
# Add C:\flutter\bin to PATH
```

#### macOS
```bash
# Using Homebrew
brew install flutter

# Or download from https://flutter.dev/docs/get-started/install/macos
```

#### Linux
```bash
# Download Flutter SDK
wget https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.16.0-stable.tar.xz
tar xf flutter_linux_3.16.0-stable.tar.xz
export PATH="$PATH:`pwd`/flutter/bin"
```

### 2. Verify Installation
```bash
flutter doctor
```

### 3. Clone and Setup Project
```bash
# Navigate to the project directory
cd pharmacy_mobile_app

# Install dependencies
flutter pub get

# Generate code
flutter packages pub run build_runner build

# Run the app
flutter run
```

## 📱 Platform Setup

### Android Setup

#### 1. Install Android Studio
- Download from [Android Studio](https://developer.android.com/studio)
- Install Android SDK and tools

#### 2. Configure Android SDK
```bash
flutter config --android-sdk /path/to/android/sdk
```

#### 3. Accept Android Licenses
```bash
flutter doctor --android-licenses
```

#### 4. Create Virtual Device (Optional)
- Open Android Studio
- Go to Tools > AVD Manager
- Create Virtual Device
- Choose device and system image
- Start emulator

### iOS Setup (macOS only)

#### 1. Install Xcode
```bash
# From App Store or
xcode-select --install
```

#### 2. Install CocoaPods
```bash
sudo gem install cocoapods
```

#### 3. Setup iOS Simulator
```bash
open -a Simulator
```

## 🔧 Development Environment

### VS Code Setup
1. Install Flutter extension
2. Install Dart extension
3. Configure settings:

```json
{
  "dart.flutterSdkPath": "/path/to/flutter",
  "dart.previewFlutterUiGuides": true,
  "dart.previewFlutterUiGuidesCustomTracking": true
}
```

### Android Studio Setup
1. Install Flutter plugin
2. Install Dart plugin
3. Configure Flutter SDK path

## 🔥 Firebase Configuration

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project: "Pharmacy Plus"
3. Enable Google Analytics (optional)

### 2. Add Android App
1. Click "Add app" → Android
2. Package name: `com.pharmacy.plus`
3. Download `google-services.json`
4. Place in `android/app/google-services.json`

### 3. Add iOS App (Optional)
1. Click "Add app" → iOS
2. Bundle ID: `com.pharmacy.plus`
3. Download `GoogleService-Info.plist`
4. Place in `ios/Runner/GoogleService-Info.plist`

### 4. Enable Services
- **Cloud Messaging**: For push notifications
- **Analytics**: For app analytics (optional)
- **Crashlytics**: For crash reporting (optional)

## 🌐 API Configuration

### 1. Update API Endpoints
Edit `lib/core/config/app_config.dart`:

```dart
// For Android Emulator
static const String baseUrl = 'http://10.0.2.2:3000/api';

// For iOS Simulator
static const String baseUrl = 'http://localhost:3000/api';

// For Physical Device (replace with your IP)
static const String baseUrl = 'http://192.168.1.100:3000/api';

// For Production
static const String baseUrl = 'https://your-api-domain.com/api';
```

### 2. Start Your Next.js Backend
```bash
# In your Next.js project directory
npm run dev
# or
yarn dev
```

### 3. Test API Connection
The app will automatically test the connection on startup.

## 🏃‍♂️ Running the App

### Method 1: Using Scripts
```bash
# Make script executable (Linux/macOS)
chmod +x run_app.sh

# Run the app
./run_app.sh

# Or specify device
./run_app.sh chrome
./run_app.sh android
```

### Method 2: Flutter Commands
```bash
# List available devices
flutter devices

# Run on specific device
flutter run -d chrome
flutter run -d android
flutter run -d ios

# Run with hot reload
flutter run --hot
```

### Method 3: IDE
- **VS Code**: Press F5 or use Command Palette → "Flutter: Launch Emulator"
- **Android Studio**: Click Run button or Shift+F10

## 🔍 Troubleshooting

### Common Issues

#### 1. "Flutter not found"
```bash
# Add Flutter to PATH
export PATH="$PATH:/path/to/flutter/bin"

# Verify
which flutter
```

#### 2. "Android SDK not found"
```bash
# Set Android SDK path
flutter config --android-sdk /path/to/android/sdk

# Verify
flutter doctor
```

#### 3. "No devices available"
```bash
# Check connected devices
flutter devices

# Start emulator
flutter emulators --launch <emulator_id>

# Or run on web
flutter run -d chrome
```

#### 4. "Build failed"
```bash
# Clean and rebuild
flutter clean
flutter pub get
flutter run
```

#### 5. "API connection failed"
- Check if Next.js backend is running
- Verify API URL in `app_config.dart`
- Check network connectivity
- For emulator, use `10.0.2.2` instead of `localhost`

#### 6. "Firebase not configured"
- Ensure `google-services.json` is in `android/app/`
- Ensure `GoogleService-Info.plist` is in `ios/Runner/`
- Run `flutter clean` and rebuild

### Performance Issues

#### 1. Slow build times
```bash
# Enable build cache
flutter config --build-dir=build

# Use release mode for testing
flutter run --release
```

#### 2. Large app size
```bash
# Build optimized APK
flutter build apk --split-per-abi

# Analyze bundle size
flutter build apk --analyze-size
```

## 📊 Development Workflow

### 1. Code Generation
```bash
# Generate models and API clients
flutter packages pub run build_runner build

# Watch for changes
flutter packages pub run build_runner watch
```

### 2. Testing
```bash
# Run unit tests
flutter test

# Run integration tests
flutter test integration_test/

# Run with coverage
flutter test --coverage
```

### 3. Code Quality
```bash
# Analyze code
flutter analyze

# Format code
flutter format .

# Check for unused dependencies
flutter pub deps
```

### 4. Building
```bash
# Debug build
flutter build apk --debug

# Release build
flutter build apk --release

# iOS build (macOS only)
flutter build ios --release
```

## 🎯 Features Status

### ✅ Implemented
- [x] Authentication (Login/Register)
- [x] Role-based navigation
- [x] Theme switching (Light/Dark)
- [x] Medicine catalog with search/filters
- [x] Shopping cart functionality
- [x] Local storage (Hive)
- [x] API integration setup
- [x] Firebase configuration
- [x] Push notifications setup

### 🚧 In Development
- [ ] Order management
- [ ] Prescription upload
- [ ] Payment integration
- [ ] Real-time notifications
- [ ] Offline support

### 📋 Planned
- [ ] Barcode scanning
- [ ] Medicine reminders
- [ ] Advanced analytics
- [ ] Multi-language support

## 🔐 Security Considerations

### 1. API Security
- JWT tokens stored in secure storage
- Automatic token refresh
- Request/response encryption

### 2. Local Storage
- Sensitive data encrypted
- Secure key management
- Data validation

### 3. Network Security
- HTTPS enforcement
- Certificate pinning (production)
- Request signing

## 📱 Testing on Devices

### Android
1. Enable Developer Options
2. Enable USB Debugging
3. Connect via USB
4. Run `flutter run`

### iOS (macOS only)
1. Connect iPhone/iPad
2. Trust computer
3. Run `flutter run`

### Web
```bash
flutter run -d chrome
```

## 🚀 Deployment

### Android Play Store
1. Build release APK/AAB
2. Sign with release key
3. Upload to Play Console
4. Configure store listing

### iOS App Store (macOS only)
1. Build iOS release
2. Archive in Xcode
3. Upload to App Store Connect
4. Submit for review

### Web Deployment
```bash
flutter build web
# Deploy build/web/ to hosting service
```

## 📞 Support

### Getting Help
- Check Flutter documentation: https://flutter.dev/docs
- Stack Overflow: https://stackoverflow.com/questions/tagged/flutter
- Flutter Discord: https://discord.gg/flutter
- GitHub Issues: Create issue in repository

### Common Resources
- [Flutter Cookbook](https://flutter.dev/docs/cookbook)
- [Dart Language Tour](https://dart.dev/guides/language/language-tour)
- [Material Design](https://material.io/design)
- [Firebase Documentation](https://firebase.google.com/docs)

## 🎉 You're Ready!

Your Pharmacy Plus mobile app is now set up and ready for development. The app includes:

- 🔐 Secure authentication system
- 🎨 Beautiful Material 3 UI
- 🛒 Shopping cart functionality
- 🔍 Advanced search and filters
- 🌙 Dark/Light theme support
- 📱 Push notifications
- 🏗️ Clean architecture
- 🔄 State management with Riverpod

Start developing and building amazing features for your pharmacy management system!