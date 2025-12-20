import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../config/app_config.dart';
import '../storage/hive_service.dart';
import '../utils/app_constants.dart';
import '../exceptions/api_exception.dart';

class ApiInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    // Add auth token if available
    final token = await HiveService.getAuthToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    
    // Add device info headers
    options.headers['X-Platform'] = 'mobile';
    options.headers['X-App-Version'] = '1.0.0';
    
    if (kDebugMode) {
      print('🚀 REQUEST: ${options.method} ${options.uri}');
      if (options.data != null) {
        print('📤 DATA: ${options.data}');
      }
      if (options.queryParameters.isNotEmpty) {
        print('🔍 QUERY: ${options.queryParameters}');
      }
    }
    
    super.onRequest(options, handler);
  }
  
  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    if (kDebugMode) {
      print('✅ RESPONSE: ${response.statusCode} ${response.requestOptions.uri}');
      print('📥 DATA: ${response.data}');
    }
    
    super.onResponse(response, handler);
  }
  
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (kDebugMode) {
      print('❌ ERROR: ${err.response?.statusCode} ${err.requestOptions.uri}');
      print('💥 MESSAGE: ${err.message}');
      if (err.response?.data != null) {
        print('📥 ERROR DATA: ${err.response?.data}');
      }
    }
    
    // Handle token expiration
    if (err.response?.statusCode == 401) {
      await _handleUnauthorized(err, handler);
      return;
    }
    
    // Convert DioException to ApiException
    final apiException = _convertToApiException(err);
    handler.reject(DioException(
      requestOptions: err.requestOptions,
      error: apiException,
      type: err.type,
      response: err.response,
    ));
  }
  
  Future<void> _handleUnauthorized(DioException err, ErrorInterceptorHandler handler) async {
    try {
      // Try to refresh token
      final refreshToken = await HiveService.getRefreshToken();
      if (refreshToken != null && refreshToken.isNotEmpty) {
        final success = await _refreshToken(refreshToken);
        if (success) {
          // Retry the original request
          final response = await _retryRequest(err.requestOptions);
          handler.resolve(response);
          return;
        }
      }
      
      // If refresh fails, clear tokens and redirect to login
      await _clearAuthAndRedirect();
      handler.reject(DioException(
        requestOptions: err.requestOptions,
        error: ApiException(
          message: AppConstants.unauthorizedError,
          statusCode: 401,
          type: ApiExceptionType.unauthorized,
        ),
        type: DioExceptionType.badResponse,
        response: err.response,
      ));
    } catch (e) {
      await _clearAuthAndRedirect();
      handler.reject(err);
    }
  }
  
  Future<bool> _refreshToken(String refreshToken) async {
    try {
      final dio = Dio();
      // Use the app config base URL instead of err.requestOptions.baseUrl
      final response = await dio.post(
        '${AppConfig.baseUrl}/auth/refresh',
        data: {'refreshToken': refreshToken},
      );
      
      if (response.statusCode == 200 && response.data['success'] == true) {
        final newToken = response.data['data']['token'];
        final newRefreshToken = response.data['data']['refreshToken'];
        
        // Save new tokens
        await HiveService.setAuthToken(newToken);
        if (newRefreshToken != null) {
          await HiveService.setRefreshToken(newRefreshToken);
        }
        
        return true;
      }
      
      return false;
    } catch (e) {
      if (kDebugMode) {
        print('🔄 Token refresh failed: $e');
      }
      return false;
    }
  }
  
  Future<Response> _retryRequest(RequestOptions requestOptions) async {
    // Add new token to headers
    final newToken = await HiveService.getAuthToken();
    if (newToken != null) {
      requestOptions.headers['Authorization'] = 'Bearer $newToken';
    }
    
    final dio = Dio();
    return await dio.fetch(requestOptions);
  }
  
  Future<void> _clearAuthAndRedirect() async {
    await HiveService.clearAuthTokens();
    await HiveService.clearUserData();
    
    // TODO: Navigate to login screen
    // This would typically be handled by a navigation service
    if (kDebugMode) {
      print('🔐 Auth cleared, should redirect to login');
    }
  }
  
  ApiException _convertToApiException(DioException err) {
    switch (err.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return ApiException(
          message: AppConstants.networkError,
          statusCode: 0,
          type: ApiExceptionType.network,
        );
        
      case DioExceptionType.badResponse:
        final statusCode = err.response?.statusCode ?? 0;
        final responseData = err.response?.data;
        
        String message = AppConstants.serverError;
        if (responseData is Map<String, dynamic>) {
          message = responseData['message'] ?? 
                   responseData['error'] ?? 
                   AppConstants.serverError;
        }
        
        ApiExceptionType type;
        switch (statusCode) {
          case 400:
            type = ApiExceptionType.badRequest;
            message = responseData?['message'] ?? AppConstants.validationError;
            break;
          case 401:
            type = ApiExceptionType.unauthorized;
            message = AppConstants.unauthorizedError;
            break;
          case 403:
            type = ApiExceptionType.forbidden;
            break;
          case 404:
            type = ApiExceptionType.notFound;
            break;
          case 422:
            type = ApiExceptionType.validation;
            message = AppConstants.validationError;
            break;
          case 500:
          default:
            type = ApiExceptionType.server;
            message = AppConstants.serverError;
            break;
        }
        
        return ApiException(
          message: message,
          statusCode: statusCode,
          type: type,
          errors: responseData?['errors'],
        );
        
      case DioExceptionType.cancel:
        return ApiException(
          message: 'Request was cancelled',
          statusCode: 0,
          type: ApiExceptionType.cancel,
        );
        
      case DioExceptionType.unknown:
      default:
        return ApiException(
          message: err.message ?? AppConstants.unknownError,
          statusCode: 0,
          type: ApiExceptionType.unknown,
        );
    }
  }
}