import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:jwt_decoder/jwt_decoder.dart';

import '../../core/models/user_model.dart';
import '../../core/storage/hive_service.dart';
import '../../core/network/dio_client.dart';
import '../../core/network/api_client.dart';
import '../../core/exceptions/api_exception.dart';

// Auth State
class AuthState {
  final bool isAuthenticated;
  final bool isLoading;
  final User? user;
  final String? error;
  
  const AuthState({
    required this.isAuthenticated,
    required this.isLoading,
    this.user,
    this.error,
  });
  
  AuthState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    User? user,
    String? error,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      user: user ?? this.user,
      error: error,
    );
  }
}

// Auth Provider
class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient _apiClient;
  
  AuthNotifier(this._apiClient) : super(const AuthState(
    isAuthenticated: false,
    isLoading: false,
  )) {
    _initializeAuth();
  }
  
  Future<void> _initializeAuth() async {
    state = state.copyWith(isLoading: true);
    
    try {
      final token = await HiveService.getAuthToken();
      if (token != null && token.isNotEmpty) {
        // Check if token is valid and not expired
        if (!JwtDecoder.isExpired(token)) {
          // Add token to API client
          DioClient.addAuthToken(token);
          
          // Get user profile
          final response = await _apiClient.getProfile();
          if (response.isSuccess && response.data != null) {
            state = state.copyWith(
              isAuthenticated: true,
              isLoading: false,
              user: response.data,
            );
            return;
          }
        }
        
        // Token is expired or invalid, clear it
        await _clearAuthData();
      }
      
      state = state.copyWith(
        isAuthenticated: false,
        isLoading: false,
      );
    } catch (e) {
      await _clearAuthData();
      state = state.copyWith(
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to initialize authentication',
      );
    }
  }
  
  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final response = await _apiClient.login(
        LoginRequest(email: email, password: password),
      );
      
      if (response.isSuccess && response.data != null) {
        final authData = response.data!;
        
        // Save tokens
        await HiveService.setAuthToken(authData.token);
        if (authData.refreshToken != null) {
          await HiveService.setRefreshToken(authData.refreshToken!);
        }
        
        // Save user data
        await HiveService.setUserData(authData.user.toJson());
        
        // Add token to API client
        DioClient.addAuthToken(authData.token);
        
        state = state.copyWith(
          isAuthenticated: true,
          isLoading: false,
          user: authData.user,
        );
        
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response.message ?? 'Login failed',
        );
        return false;
      }
    } catch (e) {
      String errorMessage = 'Login failed';
      if (e is ApiException) {
        errorMessage = e.userFriendlyMessage;
      }
      
      state = state.copyWith(
        isLoading: false,
        error: errorMessage,
      );
      return false;
    }
  }
  
  Future<bool> register({
    required String email,
    required String password,
    required String name,
    String? phone,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final response = await _apiClient.register(
        RegisterRequest(
          email: email,
          password: password,
          name: name,
          phone: phone,
        ),
      );
      
      if (response.isSuccess && response.data != null) {
        final authData = response.data!;
        
        // Save tokens
        await HiveService.setAuthToken(authData.token);
        if (authData.refreshToken != null) {
          await HiveService.setRefreshToken(authData.refreshToken!);
        }
        
        // Save user data
        await HiveService.setUserData(authData.user.toJson());
        
        // Add token to API client
        DioClient.addAuthToken(authData.token);
        
        state = state.copyWith(
          isAuthenticated: true,
          isLoading: false,
          user: authData.user,
        );
        
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response.message ?? 'Registration failed',
        );
        return false;
      }
    } catch (e) {
      String errorMessage = 'Registration failed';
      if (e is ApiException) {
        errorMessage = e.userFriendlyMessage;
      }
      
      state = state.copyWith(
        isLoading: false,
        error: errorMessage,
      );
      return false;
    }
  }
  
  Future<void> logout() async {
    state = state.copyWith(isLoading: true);
    
    try {
      // Call logout API
      await _apiClient.logout();
    } catch (e) {
      // Continue with logout even if API call fails
    }
    
    await _clearAuthData();
    
    state = const AuthState(
      isAuthenticated: false,
      isLoading: false,
    );
  }
  
  Future<bool> updateProfile({
    String? name,
    String? email,
    String? phone,
  }) async {
    if (state.user == null) return false;
    
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final response = await _apiClient.updateProfile(
        UpdateProfileRequest(
          name: name,
          email: email,
          phone: phone,
        ),
      );
      
      if (response.isSuccess && response.data != null) {
        final updatedUser = response.data!;
        
        // Update stored user data
        await HiveService.setUserData(updatedUser.toJson());
        
        state = state.copyWith(
          isLoading: false,
          user: updatedUser,
        );
        
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response.message ?? 'Profile update failed',
        );
        return false;
      }
    } catch (e) {
      String errorMessage = 'Profile update failed';
      if (e is ApiException) {
        errorMessage = e.userFriendlyMessage;
      }
      
      state = state.copyWith(
        isLoading: false,
        error: errorMessage,
      );
      return false;
    }
  }
  
  Future<void> _clearAuthData() async {
    await HiveService.clearAuthTokens();
    await HiveService.clearUserData();
    DioClient.removeAuthToken();
  }
  
  void clearError() {
    state = state.copyWith(error: null);
  }
}

// Providers
final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(DioClient.instance);
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AuthNotifier(apiClient);
});

// Computed providers
final currentUserProvider = Provider<User?>((ref) {
  return ref.watch(authProvider).user;
});

final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isAuthenticated;
});

final isLoadingProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isLoading;
});

final authErrorProvider = Provider<String?>((ref) {
  return ref.watch(authProvider).error;
});