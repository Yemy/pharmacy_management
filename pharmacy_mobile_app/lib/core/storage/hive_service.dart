import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../utils/app_constants.dart';

class HiveService {
  static const FlutterSecureStorage _secureStorage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
  );
  
  static late Box _authBox;
  static late Box _userBox;
  static late Box _cartBox;
  static late Box _settingsBox;
  static late Box _cacheBox;
  
  static Future<void> init() async {
    // Initialize Hive boxes
    _authBox = await Hive.openBox(AppConstants.authBox);
    _userBox = await Hive.openBox(AppConstants.userBox);
    _cartBox = await Hive.openBox(AppConstants.cartBox);
    _settingsBox = await Hive.openBox(AppConstants.settingsBox);
    _cacheBox = await Hive.openBox(AppConstants.cacheBox);
  }
  
  // Secure Storage Methods (for sensitive data like tokens)
  static Future<void> setSecureData(String key, String value) async {
    await _secureStorage.write(key: key, value: value);
  }
  
  static Future<String?> getSecureData(String key) async {
    return await _secureStorage.read(key: key);
  }
  
  static Future<void> deleteSecureData(String key) async {
    await _secureStorage.delete(key: key);
  }
  
  static Future<void> clearSecureStorage() async {
    await _secureStorage.deleteAll();
  }
  
  // Auth Box Methods
  static Future<void> setAuthToken(String token) async {
    await setSecureData(AppConstants.tokenKey, token);
  }
  
  static Future<String?> getAuthToken() async {
    return await getSecureData(AppConstants.tokenKey);
  }
  
  static Future<void> setRefreshToken(String token) async {
    await setSecureData(AppConstants.refreshTokenKey, token);
  }
  
  static Future<String?> getRefreshToken() async {
    return await getSecureData(AppConstants.refreshTokenKey);
  }
  
  static Future<void> clearAuthTokens() async {
    await deleteSecureData(AppConstants.tokenKey);
    await deleteSecureData(AppConstants.refreshTokenKey);
  }
  
  // User Box Methods
  static Future<void> setUserData(Map<String, dynamic> userData) async {
    await _userBox.put(AppConstants.userKey, userData);
  }
  
  static Map<String, dynamic>? getUserData() {
    final data = _userBox.get(AppConstants.userKey);
    return data != null ? Map<String, dynamic>.from(data) : null;
  }
  
  static Future<void> clearUserData() async {
    await _userBox.delete(AppConstants.userKey);
  }
  
  // Settings Box Methods
  static Future<void> setThemeMode(String themeMode) async {
    await _settingsBox.put(AppConstants.themeKey, themeMode);
  }
  
  static String getThemeMode() {
    return _settingsBox.get(AppConstants.themeKey, defaultValue: 'system');
  }
  
  static Future<void> setLanguage(String languageCode) async {
    await _settingsBox.put(AppConstants.languageKey, languageCode);
  }
  
  static String getLanguage() {
    return _settingsBox.get(AppConstants.languageKey, defaultValue: 'en');
  }
  
  static Future<void> setOnboardingCompleted(bool completed) async {
    await _settingsBox.put(AppConstants.onboardingKey, completed);
  }
  
  static bool getOnboardingCompleted() {
    return _settingsBox.get(AppConstants.onboardingKey, defaultValue: false);
  }
  
  // Cart Box Methods
  static Future<void> setCartItems(List<Map<String, dynamic>> items) async {
    await _cartBox.put(AppConstants.cartKey, items);
  }
  
  static List<Map<String, dynamic>> getCartItems() {
    final items = _cartBox.get(AppConstants.cartKey, defaultValue: <Map<String, dynamic>>[]);
    return List<Map<String, dynamic>>.from(items);
  }
  
  static Future<void> addCartItem(Map<String, dynamic> item) async {
    final items = getCartItems();
    
    // Check if item already exists
    final existingIndex = items.indexWhere((cartItem) => 
      cartItem['medicineId'] == item['medicineId']);
    
    if (existingIndex != -1) {
      // Update quantity if item exists
      items[existingIndex]['quantity'] = 
        (items[existingIndex]['quantity'] ?? 0) + (item['quantity'] ?? 1);
    } else {
      // Add new item
      items.add(item);
    }
    
    await setCartItems(items);
  }
  
  static Future<void> removeCartItem(int medicineId) async {
    final items = getCartItems();
    items.removeWhere((item) => item['medicineId'] == medicineId);
    await setCartItems(items);
  }
  
  static Future<void> updateCartItemQuantity(int medicineId, int quantity) async {
    final items = getCartItems();
    final index = items.indexWhere((item) => item['medicineId'] == medicineId);
    
    if (index != -1) {
      if (quantity <= 0) {
        items.removeAt(index);
      } else {
        items[index]['quantity'] = quantity;
      }
      await setCartItems(items);
    }
  }
  
  static Future<void> clearCart() async {
    await _cartBox.delete(AppConstants.cartKey);
  }
  
  // Wishlist Methods
  static Future<void> setWishlistItems(List<int> medicineIds) async {
    await _userBox.put(AppConstants.wishlistKey, medicineIds);
  }
  
  static List<int> getWishlistItems() {
    final items = _userBox.get(AppConstants.wishlistKey, defaultValue: <int>[]);
    return List<int>.from(items);
  }
  
  static Future<void> addToWishlist(int medicineId) async {
    final items = getWishlistItems();
    if (!items.contains(medicineId)) {
      items.add(medicineId);
      await setWishlistItems(items);
    }
  }
  
  static Future<void> removeFromWishlist(int medicineId) async {
    final items = getWishlistItems();
    items.remove(medicineId);
    await setWishlistItems(items);
  }
  
  // Search History Methods
  static Future<void> addSearchHistory(String query) async {
    final history = getSearchHistory();
    
    // Remove if already exists
    history.remove(query);
    
    // Add to beginning
    history.insert(0, query);
    
    // Keep only last 10 searches
    if (history.length > 10) {
      history.removeRange(10, history.length);
    }
    
    await _userBox.put(AppConstants.searchHistoryKey, history);
  }
  
  static List<String> getSearchHistory() {
    final history = _userBox.get(AppConstants.searchHistoryKey, defaultValue: <String>[]);
    return List<String>.from(history);
  }
  
  static Future<void> clearSearchHistory() async {
    await _userBox.delete(AppConstants.searchHistoryKey);
  }
  
  // Cache Methods
  static Future<void> setCacheData(String key, dynamic data, {Duration? expiry}) async {
    final cacheItem = {
      'data': data,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
      'expiry': expiry?.inMilliseconds,
    };
    await _cacheBox.put(key, cacheItem);
  }
  
  static dynamic getCacheData(String key) {
    final cacheItem = _cacheBox.get(key);
    if (cacheItem == null) return null;
    
    final timestamp = cacheItem['timestamp'] as int;
    final expiry = cacheItem['expiry'] as int?;
    
    if (expiry != null) {
      final now = DateTime.now().millisecondsSinceEpoch;
      if (now - timestamp > expiry) {
        // Cache expired
        _cacheBox.delete(key);
        return null;
      }
    }
    
    return cacheItem['data'];
  }
  
  static Future<void> clearCache() async {
    await _cacheBox.clear();
  }
  
  // Clear all data
  static Future<void> clearAllData() async {
    await clearSecureStorage();
    await _authBox.clear();
    await _userBox.clear();
    await _cartBox.clear();
    await _settingsBox.clear();
    await _cacheBox.clear();
  }
}