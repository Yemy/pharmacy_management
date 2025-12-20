import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../config/app_config.dart';
import '../storage/hive_service.dart';

class DioClient {
  static Dio? _instance;
  
  static Dio get instance {
    _instance ??= _createDio();
    return _instance!;
  }
  
  static Dio _createDio() {
    final dio = Dio(BaseOptions(
      baseURL: AppConfig.apiBaseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      sendTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));
    
    // Add interceptors
    dio.interceptors.add(_AuthInterceptor());
    
    if (kDebugMode) {
      dio.interceptors.add(LogInterceptor(
        requestBody: true,
        responseBody: true,
        requestHeader: true,
        responseHeader: false,
        error: true,
      ));
    }
    
    return dio;
  }
  
  static void resetInstance() {
    _instance = null;
  }
}

class _AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    // Add auth token to requests
    final token = await HiveService.getAuthToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    
    handler.next(options);
  }
  
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    // Handle 401 errors (unauthorized)
    if (err.response?.statusCode == 401) {
      // Try to refresh token
      final refreshToken = await HiveService.getRefreshToken();
      if (refreshToken != null) {
        try {
          final dio = Dio();
          final response = await dio.post(
            '${AppConfig.apiBaseUrl}/auth/refresh',
            data: {'refreshToken': refreshToken},
          );
          
          if (response.statusCode == 200) {
            final newToken = response.data['token'] as String?;
            if (newToken != null) {
              await HiveService.saveAuthToken(newToken);
              
              // Retry the original request
              final requestOptions = err.requestOptions;
              requestOptions.headers['Authorization'] = 'Bearer $newToken';
              
              final retryResponse = await DioClient.instance.fetch(requestOptions);
              handler.resolve(retryResponse);
              return;
            }
          }
        } catch (e) {
          // Refresh failed, clear auth data
          await HiveService.clearAuthData();
        }
      } else {
        // No refresh token, clear auth data
        await HiveService.clearAuthData();
      }
    }
    
    handler.next(err);
  }
}