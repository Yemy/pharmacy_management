import 'package:hive_flutter/hive_flutter.dart';

class HiveService {
  // Box names
  static const String authBox = 'auth_box';
  static const String settingsBox = 'settings_box';
  static const String cacheBox = 'cache_box';
  static const String cartBox = 'cart_box';
  
  // Initialize Hive and open boxes
  static Future<void> init() async {
    await Hive.initFlutter();
    
    // Open all required boxes
    await Hive.openBox(authBox);
    await Hive.openBox(settingsBox);
    await Hive.openBox(cacheBox);
    await Hive.openBox(cartBox);
  }
  
  // Get a specific box
  static Future<Box> getBox(String boxName) async {
    if (!Hive.isBoxOpen(boxName)) {
      return await Hive.openBox(boxName);
    }
    return Hive.box(boxName);
  }
  
  // Auth related methods
  static Future<void> saveAuthToken(String token) async {
    final box = await getBox(authBox);
    await box.put('auth_token', token);
  }
  
  static Future<String?> getAuthToken() async {
    final box = await getBox(authBox);
    return box.get('auth_token') as String?;
  }
  
  static Future<void> saveRefreshToken(String token) async {
    final box = await getBox(authBox);
    await box.put('refresh_token', token);
  }
  
  static Future<String?> getRefreshToken() async {
    final box = await getBox(authBox);
    return box.get('refresh_token') as String?;
  }
  
  static Future<void> saveUserData(Map<String, dynamic> userData) async {
    final box = await getBox(authBox);
    await box.put('user_data', userData);
  }
  
  static Future<Map<String, dynamic>?> getUserData() async {
    final box = await getBox(authBox);
    final userData = box.get('user_data');
    if (userData is Map) {
      return Map<String, dynamic>.from(userData);
    }
    return null;
  }
  
  static Future<void> clearAuthData() async {
    final box = await getBox(authBox);
    await box.clear();
  }
  
  // Settings related methods
  static Future<void> saveSetting(String key, dynamic value) async {
    final box = await getBox(settingsBox);
    await box.put(key, value);
  }
  
  static Future<T?> getSetting<T>(String key, {T? defaultValue}) async {
    final box = await getBox(settingsBox);
    return box.get(key, defaultValue: defaultValue) as T?;
  }
  
  // Cache related methods
  static Future<void> cacheData(String key, dynamic data, {Duration? expiry}) async {
    final box = await getBox(cacheBox);
    final cacheItem = {
      'data': data,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
      'expiry': expiry?.inMilliseconds,
    };
    await box.put(key, cacheItem);
  }
  
  static Future<T?> getCachedData<T>(String key) async {
    final box = await getBox(cacheBox);
    final cacheItem = box.get(key);
    
    if (cacheItem is Map) {
      final timestamp = cacheItem['timestamp'] as int?;
      final expiry = cacheItem['expiry'] as int?;
      
      if (timestamp != null && expiry != null) {
        final now = DateTime.now().millisecondsSinceEpoch;
        if (now - timestamp > expiry) {
          // Cache expired, remove it
          await box.delete(key);
          return null;
        }
      }
      
      return cacheItem['data'] as T?;
    }
    
    return null;
  }
  
  static Future<void> clearCache() async {
    final box = await getBox(cacheBox);
    await box.clear();
  }
  
  // Cart related methods
  static Future<void> saveCartItems(List<Map<String, dynamic>> items) async {
    final box = await getBox(cartBox);
    await box.put('cart_items', items);
  }
  
  static Future<List<Map<String, dynamic>>> getCartItems() async {
    final box = await getBox(cartBox);
    final items = box.get('cart_items', defaultValue: <Map<String, dynamic>>[]);
    if (items is List) {
      return items.cast<Map<String, dynamic>>();
    }
    return <Map<String, dynamic>>[];
  }
  
  static Future<void> clearCart() async {
    final box = await getBox(cartBox);
    await box.delete('cart_items');
  }
  
  // General utility methods
  static Future<void> clearAllData() async {
    await clearAuthData();
    await clearCache();
    await clearCart();
    
    final settingsBox = await getBox(HiveService.settingsBox);
    await settingsBox.clear();
  }
  
  static Future<void> closeAllBoxes() async {
    await Hive.close();
  }
}