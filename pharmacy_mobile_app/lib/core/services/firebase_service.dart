import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter/foundation.dart';

import '../storage/hive_service.dart';

class FirebaseService {
  static FirebaseMessaging? _messaging;
  static FlutterLocalNotificationsPlugin? _localNotifications;
  
  static FirebaseMessaging get messaging {
    _messaging ??= FirebaseMessaging.instance;
    return _messaging!;
  }
  
  static FlutterLocalNotificationsPlugin get localNotifications {
    _localNotifications ??= FlutterLocalNotificationsPlugin();
    return _localNotifications!;
  }
  
  // Initialize Firebase services
  static Future<void> initialize() async {
    try {
      // Initialize Firebase
      await Firebase.initializeApp();
      
      // Initialize FCM
      await _initializeFCM();
      
      // Initialize local notifications
      await _initializeLocalNotifications();
      
      if (kDebugMode) {
        print('🔥 Firebase services initialized successfully');
      }
    } catch (e) {
      if (kDebugMode) {
        print('❌ Firebase initialization error: $e');
      }
    }
  }
  
  // Initialize Firebase Cloud Messaging
  static Future<void> _initializeFCM() async {
    // Request permission for notifications
    NotificationSettings settings = await messaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );
    
    if (kDebugMode) {
      print('🔔 Notification permission status: ${settings.authorizationStatus}');
    }
    
    // Get FCM token
    String? token = await messaging.getToken();
    if (token != null) {
      await HiveService.setSecureData('fcm_token', token);
      if (kDebugMode) {
        print('📱 FCM Token: $token');
      }
    }
    
    // Listen for token refresh
    messaging.onTokenRefresh.listen((newToken) async {
      await HiveService.setSecureData('fcm_token', newToken);
      if (kDebugMode) {
        print('🔄 FCM Token refreshed: $newToken');
      }
      // TODO: Send new token to server
    });
    
    // Handle foreground messages
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
    
    // Handle background messages
    FirebaseMessaging.onBackgroundMessage(_handleBackgroundMessage);
    
    // Handle notification taps
    FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);
    
    // Check for initial message (app opened from notification)
    RemoteMessage? initialMessage = await messaging.getInitialMessage();
    if (initialMessage != null) {
      _handleNotificationTap(initialMessage);
    }
  }
  
  // Initialize local notifications
  static Future<void> _initializeLocalNotifications() async {
    const AndroidInitializationSettings androidSettings = 
        AndroidInitializationSettings('@mipmap/ic_launcher');
    
    const DarwinInitializationSettings iosSettings = 
        DarwinInitializationSettings(
          requestAlertPermission: true,
          requestBadgePermission: true,
          requestSoundPermission: true,
        );
    
    const InitializationSettings settings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );
    
    await localNotifications.initialize(
      settings,
      onDidReceiveNotificationResponse: _handleLocalNotificationTap,
    );
    
    // Create notification channels for Android
    await _createNotificationChannels();
  }
  
  // Create notification channels for Android
  static Future<void> _createNotificationChannels() async {
    const AndroidNotificationChannel orderChannel = AndroidNotificationChannel(
      'order_updates',
      'Order Updates',
      description: 'Notifications about order status changes',
      importance: Importance.high,
    );
    
    const AndroidNotificationChannel stockChannel = AndroidNotificationChannel(
      'stock_alerts',
      'Stock Alerts',
      description: 'Notifications about low stock and expiry warnings',
      importance: Importance.defaultImportance,
    );
    
    const AndroidNotificationChannel promotionChannel = AndroidNotificationChannel(
      'promotions',
      'Promotions',
      description: 'Promotional offers and discounts',
      importance: Importance.low,
    );
    
    await localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(orderChannel);
    
    await localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(stockChannel);
    
    await localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(promotionChannel);
  }
  
  // Handle foreground messages
  static Future<void> _handleForegroundMessage(RemoteMessage message) async {
    if (kDebugMode) {
      print('📨 Foreground message: ${message.notification?.title}');
    }
    
    // Show local notification when app is in foreground
    await _showLocalNotification(message);
  }
  
  // Handle background messages
  static Future<void> _handleBackgroundMessage(RemoteMessage message) async {
    if (kDebugMode) {
      print('📨 Background message: ${message.notification?.title}');
    }
    
    // Handle background message processing
    // This runs in a separate isolate
  }
  
  // Handle notification tap
  static void _handleNotificationTap(RemoteMessage message) {
    if (kDebugMode) {
      print('👆 Notification tapped: ${message.data}');
    }
    
    // Navigate based on notification data
    _navigateFromNotification(message.data);
  }
  
  // Handle local notification tap
  static void _handleLocalNotificationTap(NotificationResponse response) {
    if (kDebugMode) {
      print('👆 Local notification tapped: ${response.payload}');
    }
    
    // Parse payload and navigate
    if (response.payload != null) {
      // TODO: Parse JSON payload and navigate
    }
  }
  
  // Show local notification
  static Future<void> _showLocalNotification(RemoteMessage message) async {
    final notification = message.notification;
    if (notification == null) return;
    
    String channelId = 'default';
    
    // Determine channel based on message data
    final type = message.data['type'];
    switch (type) {
      case 'order_update':
        channelId = 'order_updates';
        break;
      case 'stock_alert':
        channelId = 'stock_alerts';
        break;
      case 'promotion':
        channelId = 'promotions';
        break;
    }
    
    final AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
      channelId,
      channelId.replaceAll('_', ' ').toUpperCase(),
      importance: Importance.high,
      priority: Priority.high,
      icon: '@mipmap/ic_launcher',
    );
    
    const DarwinNotificationDetails iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );
    
    final NotificationDetails details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );
    
    await localNotifications.show(
      message.hashCode,
      notification.title,
      notification.body,
      details,
      payload: message.data.toString(),
    );
  }
  
  // Navigate from notification
  static void _navigateFromNotification(Map<String, dynamic> data) {
    final type = data['type'];
    final id = data['id'];
    
    // TODO: Implement navigation logic based on notification type
    switch (type) {
      case 'order_update':
        // Navigate to order details
        break;
      case 'stock_alert':
        // Navigate to inventory
        break;
      case 'prescription_verified':
        // Navigate to prescriptions
        break;
      case 'promotion':
        // Navigate to catalog or specific medicine
        break;
    }
  }
  
  // Get FCM token
  static Future<String?> getFCMToken() async {
    try {
      return await messaging.getToken();
    } catch (e) {
      if (kDebugMode) {
        print('❌ Error getting FCM token: $e');
      }
      return null;
    }
  }
  
  // Subscribe to topic
  static Future<void> subscribeToTopic(String topic) async {
    try {
      await messaging.subscribeToTopic(topic);
      if (kDebugMode) {
        print('✅ Subscribed to topic: $topic');
      }
    } catch (e) {
      if (kDebugMode) {
        print('❌ Error subscribing to topic $topic: $e');
      }
    }
  }
  
  // Unsubscribe from topic
  static Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await messaging.unsubscribeFromTopic(topic);
      if (kDebugMode) {
        print('✅ Unsubscribed from topic: $topic');
      }
    } catch (e) {
      if (kDebugMode) {
        print('❌ Error unsubscribing from topic $topic: $e');
      }
    }
  }
  
  // Send token to server
  static Future<void> sendTokenToServer(String token) async {
    try {
      // TODO: Implement API call to send token to server
      // await apiClient.updateFCMToken(token);
      if (kDebugMode) {
        print('📤 FCM token sent to server: $token');
      }
    } catch (e) {
      if (kDebugMode) {
        print('❌ Error sending token to server: $e');
      }
    }
  }
}