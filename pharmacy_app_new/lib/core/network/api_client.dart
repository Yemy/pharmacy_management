import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:json_annotation/json_annotation.dart';

import '../config/app_config.dart';
import '../models/api_response.dart';
import '../models/user_model.dart';
import '../models/medicine_model.dart';
import '../models/category_model.dart';
import '../models/order_model.dart';
import '../models/prescription_model.dart';
import '../models/inventory_model.dart';
import '../models/dashboard_model.dart';

part 'api_client.g.dart';

@RestApi(baseUrl: AppConfig.baseUrl)
abstract class ApiClient {
  factory ApiClient(Dio dio, {String baseUrl}) = _ApiClient;
  
  // Authentication Endpoints
  @POST('/auth/login')
  Future<ApiResponse<AuthResponse>> login(@Body() LoginRequest request);
  
  @POST('/auth/register')
  Future<ApiResponse<AuthResponse>> register(@Body() RegisterRequest request);
  
  @POST('/auth/refresh')
  Future<ApiResponse<AuthResponse>> refreshToken(@Body() RefreshTokenRequest request);
  
  @POST('/auth/logout')
  Future<ApiResponse<void>> logout();
  
  @GET('/auth/profile')
  Future<ApiResponse<User>> getProfile();
  
  @PUT('/auth/profile')
  Future<ApiResponse<User>> updateProfile(@Body() UpdateProfileRequest request);
  
  // Medicine Endpoints
  @GET('/medicines')
  Future<ApiResponse<PaginatedResponse<Medicine>>> getMedicines(
    @Query('page') int page,
    @Query('limit') int limit,
    @Query('search') String? search,
    @Query('categoryId') int? categoryId,
    @Query('sortBy') String? sortBy,
    @Query('sortOrder') String? sortOrder,
  );
  
  @GET('/medicines/{id}')
  Future<ApiResponse<Medicine>> getMedicine(@Path('id') int id);
  
  @GET('/medicines/slug/{slug}')
  Future<ApiResponse<Medicine>> getMedicineBySlug(@Path('slug') String slug);
  
  @POST('/medicines')
  Future<ApiResponse<Medicine>> createMedicine(@Body() CreateMedicineRequest request);
  
  @PUT('/medicines/{id}')
  Future<ApiResponse<Medicine>> updateMedicine(
    @Path('id') int id,
    @Body() UpdateMedicineRequest request,
  );
  
  @DELETE('/medicines/{id}')
  Future<ApiResponse<void>> deleteMedicine(@Path('id') int id);
  
  @GET('/medicines/low-stock')
  Future<ApiResponse<List<Medicine>>> getLowStockMedicines();
  
  @GET('/medicines/expiring')
  Future<ApiResponse<List<InventoryItem>>> getExpiringMedicines(
    @Query('days') int? days,
  );
  
  @GET('/medicines/expired')
  Future<ApiResponse<List<InventoryItem>>> getExpiredMedicines();
  
  // Category Endpoints
  @GET('/categories')
  Future<ApiResponse<List<Category>>> getCategories();
  
  @GET('/categories/{id}')
  Future<ApiResponse<Category>> getCategory(@Path('id') int id);
  
  @POST('/categories')
  Future<ApiResponse<Category>> createCategory(@Body() CreateCategoryRequest request);
  
  @PUT('/categories/{id}')
  Future<ApiResponse<Category>> updateCategory(
    @Path('id') int id,
    @Body() UpdateCategoryRequest request,
  );
  
  @DELETE('/categories/{id}')
  Future<ApiResponse<void>> deleteCategory(@Path('id') int id);
  
  // Order Endpoints
  @GET('/orders')
  Future<ApiResponse<PaginatedResponse<Order>>> getOrders(
    @Query('page') int page,
    @Query('limit') int limit,
    @Query('status') String? status,
    @Query('userId') int? userId,
  );
  
  @GET('/orders/{id}')
  Future<ApiResponse<Order>> getOrder(@Path('id') int id);
  
  @POST('/orders')
  Future<ApiResponse<Order>> createOrder(@Body() CreateOrderRequest request);
  
  @PUT('/orders/{id}/status')
  Future<ApiResponse<Order>> updateOrderStatus(
    @Path('id') int id,
    @Body() UpdateOrderStatusRequest request,
  );
  
  @DELETE('/orders/{id}')
  Future<ApiResponse<void>> cancelOrder(@Path('id') int id);
  
  // Prescription Endpoints
  @GET('/prescriptions')
  Future<ApiResponse<PaginatedResponse<Prescription>>> getPrescriptions(
    @Query('page') int page,
    @Query('limit') int limit,
    @Query('verified') bool? verified,
  );
  
  @GET('/prescriptions/{id}')
  Future<ApiResponse<Prescription>> getPrescription(@Path('id') int id);
  
  @POST('/prescriptions')
  @MultiPart()
  Future<ApiResponse<Prescription>> uploadPrescription(
    @Part() File file,
    @Part('orderId') int? orderId,
  );
  
  @PUT('/prescriptions/{id}/verify')
  Future<ApiResponse<Prescription>> verifyPrescription(
    @Path('id') int id,
    @Body() VerifyPrescriptionRequest request,
  );
  
  @DELETE('/prescriptions/{id}')
  Future<ApiResponse<void>> deletePrescription(@Path('id') int id);
  
  // Inventory Endpoints
  @GET('/inventory')
  Future<ApiResponse<PaginatedResponse<InventoryItem>>> getInventory(
    @Query('page') int page,
    @Query('limit') int limit,
    @Query('medicineId') int? medicineId,
    @Query('supplierId') int? supplierId,
  );
  
  @GET('/inventory/{id}')
  Future<ApiResponse<InventoryItem>> getInventoryItem(@Path('id') int id);
  
  @POST('/inventory')
  Future<ApiResponse<InventoryItem>> addInventory(@Body() AddInventoryRequest request);
  
  @PUT('/inventory/{id}')
  Future<ApiResponse<InventoryItem>> updateInventory(
    @Path('id') int id,
    @Body() UpdateInventoryRequest request,
  );
  
  @DELETE('/inventory/{id}')
  Future<ApiResponse<void>> deleteInventory(@Path('id') int id);
  
  // Dashboard Endpoints
  @GET('/dashboard/stats')
  Future<ApiResponse<DashboardStats>> getDashboardStats();
  
  @GET('/dashboard/sales-chart')
  Future<ApiResponse<List<SalesChartData>>> getSalesChart(
    @Query('period') String period,
    @Query('startDate') String? startDate,
    @Query('endDate') String? endDate,
  );
  
  @GET('/dashboard/top-medicines')
  Future<ApiResponse<List<TopMedicine>>> getTopMedicines(
    @Query('limit') int? limit,
  );
  
  // User Management Endpoints
  @GET('/users')
  Future<ApiResponse<PaginatedResponse<User>>> getUsers(
    @Query('page') int page,
    @Query('limit') int limit,
    @Query('role') String? role,
    @Query('search') String? search,
  );
  
  @GET('/users/{id}')
  Future<ApiResponse<User>> getUser(@Path('id') int id);
  
  @PUT('/users/{id}/role')
  Future<ApiResponse<User>> updateUserRole(
    @Path('id') int id,
    @Body() UpdateUserRoleRequest request,
  );
  
  @PUT('/users/{id}/status')
  Future<ApiResponse<User>> updateUserStatus(
    @Path('id') int id,
    @Body() UpdateUserStatusRequest request,
  );
  
  // Reports Endpoints
  @GET('/reports/sales')
  Future<ApiResponse<SalesReport>> getSalesReport(
    @Query('startDate') String startDate,
    @Query('endDate') String endDate,
    @Query('groupBy') String? groupBy,
  );
  
  @GET('/reports/inventory')
  Future<ApiResponse<InventoryReport>> getInventoryReport();
  
  @GET('/reports/export')
  Future<Response<List<int>>> exportReport(
    @Query('type') String type,
    @Query('format') String format,
    @Query('startDate') String? startDate,
    @Query('endDate') String? endDate,
  );
}

// Request Models
@JsonSerializable()
class LoginRequest {
  final String email;
  final String password;
  
  LoginRequest({required this.email, required this.password});
  
  factory LoginRequest.fromJson(Map<String, dynamic> json) => _$LoginRequestFromJson(json);
  Map<String, dynamic> toJson() => _$LoginRequestToJson(this);
}

@JsonSerializable()
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
  
  factory RegisterRequest.fromJson(Map<String, dynamic> json) => _$RegisterRequestFromJson(json);
  Map<String, dynamic> toJson() => _$RegisterRequestToJson(this);
}

@JsonSerializable()
class RefreshTokenRequest {
  final String refreshToken;
  
  RefreshTokenRequest({required this.refreshToken});
  
  factory RefreshTokenRequest.fromJson(Map<String, dynamic> json) => _$RefreshTokenRequestFromJson(json);
  Map<String, dynamic> toJson() => _$RefreshTokenRequestToJson(this);
}

@JsonSerializable()
class UpdateProfileRequest {
  final String? name;
  final String? email;
  final String? phone;
  
  UpdateProfileRequest({this.name, this.email, this.phone});
  
  factory UpdateProfileRequest.fromJson(Map<String, dynamic> json) => _$UpdateProfileRequestFromJson(json);
  Map<String, dynamic> toJson() => _$UpdateProfileRequestToJson(this);
}

@JsonSerializable()
class CreateMedicineRequest {
  final String name;
  final String? description;
  final String? usage;
  final String? dosage;
  final String? sideEffects;
  final String? sku;
  final String? barcode;
  final String? unit;
  final double price;
  final int minStock;
  final int? categoryId;
  
  CreateMedicineRequest({
    required this.name,
    this.description,
    this.usage,
    this.dosage,
    this.sideEffects,
    this.sku,
    this.barcode,
    this.unit,
    required this.price,
    required this.minStock,
    this.categoryId,
  });
  
  factory CreateMedicineRequest.fromJson(Map<String, dynamic> json) => _$CreateMedicineRequestFromJson(json);
  Map<String, dynamic> toJson() => _$CreateMedicineRequestToJson(this);
}

@JsonSerializable()
class UpdateMedicineRequest {
  final String? name;
  final String? description;
  final String? usage;
  final String? dosage;
  final String? sideEffects;
  final String? sku;
  final String? barcode;
  final String? unit;
  final double? price;
  final int? minStock;
  final int? categoryId;
  
  UpdateMedicineRequest({
    this.name,
    this.description,
    this.usage,
    this.dosage,
    this.sideEffects,
    this.sku,
    this.barcode,
    this.unit,
    this.price,
    this.minStock,
    this.categoryId,
  });
  
  factory UpdateMedicineRequest.fromJson(Map<String, dynamic> json) => _$UpdateMedicineRequestFromJson(json);
  Map<String, dynamic> toJson() => _$UpdateMedicineRequestToJson(this);
}

@JsonSerializable()
class CreateCategoryRequest {
  final String name;
  
  CreateCategoryRequest({required this.name});
  
  factory CreateCategoryRequest.fromJson(Map<String, dynamic> json) => _$CreateCategoryRequestFromJson(json);
  Map<String, dynamic> toJson() => _$CreateCategoryRequestToJson(this);
}

@JsonSerializable()
class UpdateCategoryRequest {
  final String name;
  
  UpdateCategoryRequest({required this.name});
  
  factory UpdateCategoryRequest.fromJson(Map<String, dynamic> json) => _$UpdateCategoryRequestFromJson(json);
  Map<String, dynamic> toJson() => _$UpdateCategoryRequestToJson(this);
}

@JsonSerializable()
class CreateOrderRequest {
  final List<OrderItemRequest> items;
  final String? note;
  
  CreateOrderRequest({required this.items, this.note});
  
  factory CreateOrderRequest.fromJson(Map<String, dynamic> json) => _$CreateOrderRequestFromJson(json);
  Map<String, dynamic> toJson() => _$CreateOrderRequestToJson(this);
}

@JsonSerializable()
class OrderItemRequest {
  final int medicineId;
  final int quantity;
  final double price;
  
  OrderItemRequest({
    required this.medicineId,
    required this.quantity,
    required this.price,
  });
  
  factory OrderItemRequest.fromJson(Map<String, dynamic> json) => _$OrderItemRequestFromJson(json);
  Map<String, dynamic> toJson() => _$OrderItemRequestToJson(this);
}

@JsonSerializable()
class UpdateOrderStatusRequest {
  final String status;
  
  UpdateOrderStatusRequest({required this.status});
  
  factory UpdateOrderStatusRequest.fromJson(Map<String, dynamic> json) => _$UpdateOrderStatusRequestFromJson(json);
  Map<String, dynamic> toJson() => _$UpdateOrderStatusRequestToJson(this);
}

@JsonSerializable()
class VerifyPrescriptionRequest {
  final bool verified;
  
  VerifyPrescriptionRequest({required this.verified});
  
  factory VerifyPrescriptionRequest.fromJson(Map<String, dynamic> json) => _$VerifyPrescriptionRequestFromJson(json);
  Map<String, dynamic> toJson() => _$VerifyPrescriptionRequestToJson(this);
}

@JsonSerializable()
class AddInventoryRequest {
  final int medicineId;
  final int? supplierId;
  final String? batchNumber;
  final int quantity;
  final double unitPrice;
  final String? expiryDate;
  
  AddInventoryRequest({
    required this.medicineId,
    this.supplierId,
    this.batchNumber,
    required this.quantity,
    required this.unitPrice,
    this.expiryDate,
  });
  
  factory AddInventoryRequest.fromJson(Map<String, dynamic> json) => _$AddInventoryRequestFromJson(json);
  Map<String, dynamic> toJson() => _$AddInventoryRequestToJson(this);
}

@JsonSerializable()
class UpdateInventoryRequest {
  final int? quantity;
  final double? unitPrice;
  final String? expiryDate;
  final String? batchNumber;
  
  UpdateInventoryRequest({
    this.quantity,
    this.unitPrice,
    this.expiryDate,
    this.batchNumber,
  });
  
  factory UpdateInventoryRequest.fromJson(Map<String, dynamic> json) => _$UpdateInventoryRequestFromJson(json);
  Map<String, dynamic> toJson() => _$UpdateInventoryRequestToJson(this);
}

@JsonSerializable()
class UpdateUserRoleRequest {
  final int roleId;
  
  UpdateUserRoleRequest({required this.roleId});
  
  factory UpdateUserRoleRequest.fromJson(Map<String, dynamic> json) => _$UpdateUserRoleRequestFromJson(json);
  Map<String, dynamic> toJson() => _$UpdateUserRoleRequestToJson(this);
}

@JsonSerializable()
class UpdateUserStatusRequest {
  final bool isVerified;
  
  UpdateUserStatusRequest({required this.isVerified});
  
  factory UpdateUserStatusRequest.fromJson(Map<String, dynamic> json) => _$UpdateUserStatusRequestFromJson(json);
  Map<String, dynamic> toJson() => _$UpdateUserStatusRequestToJson(this);
}

// Response Models
@JsonSerializable()
class AuthResponse {
  final String token;
  final String? refreshToken;
  final User user;
  
  AuthResponse({
    required this.token,
    this.refreshToken,
    required this.user,
  });
  
  factory AuthResponse.fromJson(Map<String, dynamic> json) => _$AuthResponseFromJson(json);
  Map<String, dynamic> toJson() => _$AuthResponseToJson(this);
}

@JsonSerializable()
class PaginatedResponse<T> {
  final List<T> data;
  final int total;
  final int page;
  final int limit;
  final int totalPages;
  final bool hasNext;
  final bool hasPrev;
  
  PaginatedResponse({
    required this.data,
    required this.total,
    required this.page,
    required this.limit,
    required this.totalPages,
    required this.hasNext,
    required this.hasPrev,
  });
  
  factory PaginatedResponse.fromJson(Map<String, dynamic> json, T Function(Object? json) fromJsonT) {
    return PaginatedResponse<T>(
      data: (json['data'] as List).map((item) => fromJsonT(item)).toList(),
      total: json['total'] as int,
      page: json['page'] as int,
      limit: json['limit'] as int,
      totalPages: json['totalPages'] as int,
      hasNext: json['hasNext'] as bool,
      hasPrev: json['hasPrev'] as bool,
    );
  }
  
  Map<String, dynamic> toJson(Object Function(T value) toJsonT) => {
    'data': data.map((item) => toJsonT(item)).toList(),
    'total': total,
    'page': page,
    'limit': limit,
    'totalPages': totalPages,
    'hasNext': hasNext,
    'hasPrev': hasPrev,
  };
}