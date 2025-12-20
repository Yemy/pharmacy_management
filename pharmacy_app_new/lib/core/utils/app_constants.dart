class AppConstants {
  // App Info
  static const String appName = 'MediCare Pharmacy';
  static const String appTagline = 'Your Health, Our Priority';
  
  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userKey = 'user_data';
  static const String themeKey = 'theme_mode';
  static const String languageKey = 'language_code';
  static const String onboardingKey = 'onboarding_completed';
  static const String cartKey = 'cart_items';
  static const String wishlistKey = 'wishlist_items';
  static const String searchHistoryKey = 'search_history';
  
  // Hive Box Names
  static const String authBox = 'auth_box';
  static const String userBox = 'user_box';
  static const String cartBox = 'cart_box';
  static const String settingsBox = 'settings_box';
  static const String cacheBox = 'cache_box';
  
  // API Endpoints
  static const String loginEndpoint = '/auth/login';
  static const String registerEndpoint = '/auth/register';
  static const String refreshTokenEndpoint = '/auth/refresh';
  static const String logoutEndpoint = '/auth/logout';
  static const String profileEndpoint = '/auth/profile';
  
  static const String medicinesEndpoint = '/medicines';
  static const String categoriesEndpoint = '/categories';
  static const String ordersEndpoint = '/orders';
  static const String cartEndpoint = '/cart';
  static const String prescriptionsEndpoint = '/prescriptions';
  static const String inventoryEndpoint = '/inventory';
  static const String dashboardEndpoint = '/dashboard';
  static const String reportsEndpoint = '/reports';
  static const String usersEndpoint = '/users';
  
  // User Roles
  static const String adminRole = 'ADMIN';
  static const String pharmacistRole = 'PHARMACIST';
  static const String staffRole = 'STAFF';
  static const String customerRole = 'CUSTOMER';
  
  // Order Status
  static const String pendingStatus = 'PENDING';
  static const String paidStatus = 'PAID';
  static const String packedStatus = 'PACKED';
  static const String deliveredStatus = 'DELIVERED';
  static const String cancelledStatus = 'CANCELLED';
  static const String rejectedStatus = 'REJECTED';
  
  // Payment Status
  static const String paymentPending = 'PENDING';
  static const String paymentSucceeded = 'SUCCEEDED';
  static const String paymentFailed = 'FAILED';
  static const String paymentRefunded = 'REFUNDED';
  
  // Notification Types
  static const String orderUpdateNotification = 'order_update';
  static const String stockAlertNotification = 'stock_alert';
  static const String expiryWarningNotification = 'expiry_warning';
  static const String promotionNotification = 'promotion';
  
  // Error Messages
  static const String networkError = 'Network connection error. Please check your internet connection.';
  static const String serverError = 'Server error. Please try again later.';
  static const String unauthorizedError = 'Session expired. Please login again.';
  static const String validationError = 'Please check your input and try again.';
  static const String unknownError = 'An unexpected error occurred. Please try again.';
  
  // Success Messages
  static const String loginSuccess = 'Login successful';
  static const String registerSuccess = 'Registration successful';
  static const String orderPlacedSuccess = 'Order placed successfully';
  static const String profileUpdatedSuccess = 'Profile updated successfully';
  static const String prescriptionUploadedSuccess = 'Prescription uploaded successfully';
  
  // Validation
  static const int minPasswordLength = 8;
  static const int maxNameLength = 50;
  static const int maxDescriptionLength = 500;
  static const int maxQuantity = 999;
  
  // UI Constants
  static const double defaultPadding = 16.0;
  static const double smallPadding = 8.0;
  static const double largePadding = 24.0;
  static const double defaultRadius = 12.0;
  static const double smallRadius = 8.0;
  static const double largeRadius = 16.0;
  
  // Animation Durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 300);
  static const Duration longAnimation = Duration(milliseconds: 500);
  
  // Debounce Duration
  static const Duration searchDebounce = Duration(milliseconds: 500);
  static const Duration apiDebounce = Duration(milliseconds: 300);
}