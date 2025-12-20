class AppConfig {
  static const String appName = 'MediCare Pharmacy';
  static const String appVersion = '1.0.0';
  
  // Environment Configuration
  static const bool isDevelopment = true;
  static const bool isProduction = false;
  
  // API Configuration - Updated to match your Next.js backend
  static const String apiBaseUrl = isDevelopment 
    ? 'http://10.0.2.2:3000/api'  // Android emulator localhost
    : 'https://your-production-api.com/api';
    
  static const String baseImageUrl = isDevelopment
    ? 'http://10.0.2.2:3000'
    : 'https://your-production-api.com';
  
  // Alternative URLs for different environments
  static const String webBaseUrl = 'http://localhost:3000/api';  // For web/desktop
  static const String physicalDeviceUrl = 'http://192.168.1.100:3000/api';  // Replace with your IP
  
  // Timeouts
  static const int connectTimeout = 30000; // 30 seconds
  static const int receiveTimeout = 30000; // 30 seconds
  static const int sendTimeout = 30000; // 30 seconds
  
  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
  
  // Cache
  static const int cacheMaxAge = 300; // 5 minutes
  static const int maxCacheSize = 50 * 1024 * 1024; // 50MB
  
  // File Upload
  static const int maxFileSize = 5 * 1024 * 1024; // 5MB
  static const List<String> allowedImageTypes = ['jpg', 'jpeg', 'png'];
  static const List<String> allowedDocumentTypes = ['pdf', 'doc', 'docx'];
  
  // Security
  static const String jwtSecretKey = 'your-jwt-secret-key';
  static const int tokenRefreshThreshold = 300; // 5 minutes before expiry
  
  // Firebase
  static const String fcmServerKey = 'your-fcm-server-key';
  
  // Stripe (if using)
  static const String stripePublishableKey = isDevelopment
    ? 'pk_test_your_test_key'
    : 'pk_live_your_live_key';
}