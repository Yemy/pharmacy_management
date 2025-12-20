import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../config/app_config.dart';
import '../storage/hive_service.dart';
import '../utils/app_constants.dart';
import 'api_interceptor.dart';

class DioClient {
  static Dio? _dio;
  
  static Dio get instance {
    _dio ??= _createDio();
    return _dio!;
  }
  
  static Dio _createDio() {
    final dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.baseUrl,
        connectTimeout: Duration(milliseconds: AppConfig.connectTimeout),
        receiveTimeout: Duration(milliseconds: AppConfig.receiveTimeout),
        sendTimeout: Duration(milliseconds: AppConfig.sendTimeout),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        responseType: ResponseType.json,
      ),
    );
    
    // Add interceptors
    dio.interceptors.add(ApiInterceptor());
    
    // Add logging interceptor in debug mode
    if (kDebugMode) {
      dio.interceptors.add(
        LogInterceptor(
          requestBody: true,
          responseBody: true,
          requestHeader: true,
          responseHeader: false,
          error: true,
          logPrint: (object) {
            if (kDebugMode) {
              print('🌐 API: $object');
            }
          },
        ),
      );
    }
    
    return dio;
  }
  
  static void updateBaseUrl(String newBaseUrl) {
    _dio?.options.baseUrl = newBaseUrl;
  }
  
  static void addAuthToken(String token) {
    _dio?.options.headers['Authorization'] = 'Bearer $token';
  }
  
  static void removeAuthToken() {
    _dio?.options.headers.remove('Authorization');
  }
  
  static void dispose() {
    _dio?.close();
    _dio = null;
  }
}