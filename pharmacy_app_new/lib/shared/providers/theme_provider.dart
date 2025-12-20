import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../../core/storage/hive_service.dart';

// Theme mode provider
final themeModeProvider = StateNotifierProvider<ThemeModeNotifier, ThemeMode>((ref) {
  return ThemeModeNotifier();
});

// Current theme mode provider (for easy access)
final currentThemeModeProvider = Provider<ThemeMode>((ref) {
  return ref.watch(themeModeProvider);
});

// Is dark mode provider (for easy boolean access)
final isDarkModeProvider = Provider<bool>((ref) {
  final themeMode = ref.watch(themeModeProvider);
  return themeMode == ThemeMode.dark;
});

class ThemeModeNotifier extends StateNotifier<ThemeMode> {
  static const String _themeModeKey = 'theme_mode';
  
  ThemeModeNotifier() : super(ThemeMode.system) {
    _loadThemeMode();
  }
  
  Future<void> _loadThemeMode() async {
    try {
      final box = await HiveService.getBox(HiveService.settingsBox);
      final themeModeString = box.get(_themeModeKey, defaultValue: 'system') as String;
      
      switch (themeModeString) {
        case 'light':
          state = ThemeMode.light;
          break;
        case 'dark':
          state = ThemeMode.dark;
          break;
        default:
          state = ThemeMode.system;
          break;
      }
    } catch (e) {
      // If there's an error loading, default to system
      state = ThemeMode.system;
    }
  }
  
  Future<void> setThemeMode(ThemeMode themeMode) async {
    try {
      final box = await HiveService.getBox(HiveService.settingsBox);
      
      String themeModeString;
      switch (themeMode) {
        case ThemeMode.light:
          themeModeString = 'light';
          break;
        case ThemeMode.dark:
          themeModeString = 'dark';
          break;
        default:
          themeModeString = 'system';
          break;
      }
      
      await box.put(_themeModeKey, themeModeString);
      state = themeMode;
    } catch (e) {
      // If there's an error saving, still update the state
      state = themeMode;
    }
  }
  
  Future<void> toggleTheme() async {
    final newThemeMode = state == ThemeMode.light ? ThemeMode.dark : ThemeMode.light;
    await setThemeMode(newThemeMode);
  }
}