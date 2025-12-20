import 'package:dio/dio.dart';
import '../config/app_config.dart';
import '../models/simple_api_response.dart';
import '../models/simple_user_model.dart';
import 'dio_client.dart';

class SimpleApiClient {
  final Dio _dio;
  
  SimpleApiClient(this._dio);
  
  // Authentication Endpoints
  Future<ApiResponse<AuthResponse>> login(LoginRequest request) async {
    try {
      final response = await _dio.post('/auth/login', data: request.toJson());
      return ApiResponse<AuthResponse>.fromJson(
        response.data,
        (json) => AuthResponse.fromJson(json as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<AuthResponse>.error(
        message: 'Login failed: ${e.toString()}',
        statusCode: 500,
      );
    }
  }
  
  Future<ApiResponse<AuthResponse>> register(RegisterRequest request) async {
    try {
      final response = await _dio.post('/auth/register', data: request.toJson());
      return ApiResponse<AuthResponse>.fromJson(
        response.data,
        (json) => AuthResponse.fromJson(json as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<AuthResponse>.error(
        message: 'Registration failed: ${e.toString()}',
        statusCode: 500,
      );
    }
  }
  
  Future<ApiResponse<User>> getProfile() async {
    try {
      final response = await _dio.get('/auth/profile');
      return ApiResponse<User>.fromJson(
        response.data,
        (json) => User.fromJson(json as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<User>.error(
        message: 'Failed to get profile: ${e.toString()}',
        statusCode: 500,
      );
    }
  }
  
  Future<ApiResponse<User>> updateProfile(UpdateProfileRequest request) async {
    try {
      final response = await _dio.put('/auth/profile', data: request.toJson());
      return ApiResponse<User>.fromJson(
        response.data,
        (json) => User.fromJson(json as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<User>.error(
        message: 'Failed to update profile: ${e.toString()}',
        statusCode: 500,
      );
    }
  }
  
  Future<ApiResponse<void>> logout() async {
    try {
      await _dio.post('/auth/logout');
      return ApiResponse<void>.success(message: 'Logged out successfully');
    } catch (e) {
      return ApiResponse<void>.error(
        message: 'Logout failed: ${e.toString()}',
        statusCode: 500,
      );
    }
  }
}

// Request Models
class LoginRequest {
  final String email;
  final String password;
  
  LoginRequest({required this.email, required this.password});
  
  Map<String, dynamic> toJson() => {
    'email': email,
    'password': password,
  };
}

class RegisterRequest {
  final String email;
  final String password;
  final String name;
  final String? phone;
  
  RegisterRequest({
    required this.email,
    required this.password,
    required this.name,
    this.phone,
  });
  
  Map<String, dynamic> toJson() => {
    'email': email,
    'password': password,
    'name': name,
    if (phone != null) 'phone': phone,
  };
}

class UpdateProfileRequest {
  final String? name;
  final String? email;
  final String? phone;
  
  UpdateProfileRequest({this.name, this.email, this.phone});
  
  Map<String, dynamic> toJson() => {
    if (name != null) 'name': name,
    if (email != null) 'email': email,
    if (phone != null) 'phone': phone,
  };
}

// Response Models
class AuthResponse {
  final String token;
  final String? refreshToken;
  final User user;
  
  AuthResponse({
    required this.token,
    this.refreshToken,
    required this.user,
  });
  
  factory AuthResponse.fromJson(Map<String, dynamic> json) => AuthResponse(
    token: json['token'] as String,
    refreshToken: json['refreshToken'] as String?,
    user: User.fromJson(json['user'] as Map<String, dynamic>),
  );
  
  Map<String, dynamic> toJson() => {
    'token': token,
    if (refreshToken != null) 'refreshToken': refreshToken,
    'user': user.toJson(),
  };
}