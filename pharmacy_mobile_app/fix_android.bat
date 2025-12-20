@echo off
echo 🔧 Fixing Android build issues...

REM Navigate to project directory
cd /d "%~dp0"

REM Clean Flutter
echo Cleaning Flutter...
flutter clean

REM Remove problematic directories
echo Removing problematic files...
if exist "android\.gradle" rmdir /s /q "android\.gradle"
if exist "android\app\build" rmdir /s /q "android\app\build"
if exist "android\build" rmdir /s /q "android\build"

REM Get dependencies
echo Getting dependencies...
flutter pub get

REM Try to run
echo Attempting to run the app...
flutter run

echo ✅ Fix script completed!
pause