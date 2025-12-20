import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/storage/hive_service.dart';

enum AppThemeMode {
  light,
  dark,
  system,
}

class ThemeState {
  final AppThemeMode themeMode;
  final bool isLoading;
  
  const ThemeState({
    required this.themeMode,
    required this.isLoading,
  });
  
  ThemeState copyWith({
    AppThemeMode? themeMode,
    bool? isLoading,
  }) {
    return ThemeState(
      themeMode: themeMode ?? this.themeMode,
      isLoading: isLoading ?? this.isLoading,
    );
  }
  
  ThemeMode get flutterThemeMode {
    switch (themeMode) {
      case AppThemeMode.light:
        return ThemeMode.light;
      case AppThemeMode.dark:
        return ThemeMode.dark;
      case AppThemeMode.system:
        return ThemeMode.system;
    }
  }
}

class ThemeNotifier extends StateNotifier<ThemeState> {
  ThemeNotifier() : super(const ThemeState(
    themeMode: AppThemeMode.system,
    isLoading: false,
  )) {
    _loadThemeMode();
  }
  
  Future<void> _loadThemeMode() async {
    state = state.copyWith(isLoading: true);
    
    try {
      final savedTheme = HiveService.getThemeMode();
      final themeMode = _stringToThemeMode(savedTheme);
      
      state = state.copyWith(
        themeMode: themeMode,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        themeMode: AppThemeMode.system,
        isLoading: false,
      );
    }
  }
  
  Future<void> setThemeMode(AppThemeMode themeMode) async {
    state = state.copyWith(themeMode: themeMode);
    
    try {
      await HiveService.setThemeMode(_themeModeToString(themeMode));
    } catch (e) {
      // Handle error silently, theme will revert on app restart
    }
  }
  
  void toggleTheme() {
    final currentMode = state.themeMode;
    AppThemeMode newMode;
    
    switch (currentMode) {
      case AppThemeMode.light:
        newMode = AppThemeMode.dark;
        break;
      case AppThemeMode.dark:
        newMode = AppThemeMode.system;
        break;
      case AppThemeMode.system:
        newMode = AppThemeMode.light;
        break;
    }
    
    setThemeMode(newMode);
  }
  
  AppThemeMode _stringToThemeMode(String themeString) {
    switch (themeString.toLowerCase()) {
      case 'light':
        return AppThemeMode.light;
      case 'dark':
        return AppThemeMode.dark;
      case 'system':
      default:
        return AppThemeMode.system;
    }
  }
  
  String _themeModeToString(AppThemeMode themeMode) {
    switch (themeMode) {
      case AppThemeMode.light:
        return 'light';
      case AppThemeMode.dark:
        return 'dark';
      case AppThemeMode.system:
        return 'system';
    }
  }
}

// Providers
final themeProvider = StateNotifierProvider<ThemeNotifier, ThemeState>((ref) {
  return ThemeNotifier();
});

final currentThemeModeProvider = Provider<ThemeMode>((ref) {
  return ref.watch(themeProvider).flutterThemeMode;
});

final isDarkModeProvider = Provider<bool>((ref) {
  final themeState = ref.watch(themeProvider);
  
  if (themeState.themeMode == AppThemeMode.dark) {
    return true;
  } else if (themeState.themeMode == AppThemeMode.light) {
    return false;
  } else {
    // System mode - check system brightness
    return WidgetsBinding.instance.platformDispatcher.platformBrightness == Brightness.dark;
  }
});