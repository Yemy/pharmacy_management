import 'package:dio/dio.dart';
import '../config/app_config.dart';
import '../models/simple_api_response.dart';
import '../models/simple_user_model.dart';
import 'dio_client.dart';

class ComprehensiveApiClient {
  final Dio _dio;
  
  ComprehensiveApiClient(this._dio);
  
  // ==================== AUTHENTICATION ====================
  
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
  
  // ==================== MEDICINES ====================
  
  Future<ApiResponse<PaginatedResponse<Medicine>>> getMedicines({
    int page = 1,
    int limit = 20,
    String? search,
    int? categoryId,
    String? sortBy,
    String? sortOrder,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
        if (search != null) 'search': search,
        if (categoryId != null) 'categoryId': categoryId,
        if (sortBy != null) 'sortBy': sortBy,
        if (sortOrder != null) 'sortOrder': sortOrder,
      };
      
      final response = await _dio.get('/medicines', queryParameters: queryParams);
      return ApiResponse<PaginatedResponse<Medicine>>.fromJson(
        response.data,
        (json) => PaginatedResponse<Medicine>.fromJson(
          json as Map<String, dynamic>,
          (item) => Medicine.fromJson(item as Map<String, dynamic>),
        ),
      );
    } catch (e) {
      return ApiResponse<PaginatedResponse<Medicine>>.error(
        message: 'Failed to fetch medicines: ${e.toString()}',
        statusCode: 500,
      );
    }
  }
  
  Future<ApiResponse<Medicine>> getMedicine(int id) async {
    try {
      final response = await _dio.get('/medicines/$id');
      return ApiResponse<Medicine>.fromJson(
        response.data,
        (json) => Medicine.fromJson(json as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<Medicine>.error(
        message: 'Failed to fetch medicine: ${e.toString()}',
        statusCode: 500,
      );
    }
  }
  
  Future<ApiResponse<Medicine>> getMedicineBySlug(String slug) async {
    try {
      final response = await _dio.get('/medicines/slug/$slug');
      return ApiResponse<Medicine>.fromJson(
        response.data,
        (json) => Medicine.fromJson(json as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<Medicine>.error(
        message: 'Failed to fetch medicine: ${e.toString()}',
        statusCode: 500,
      );
    }
  }
  
  Future<ApiResponse<Medicine>> createMedicine(CreateMedicineRequest request) async {
    try {
      final response = await _dio.post('/medicines', data: request.toJson());
      return ApiResponse<Medicine>.fromJson(
        response.data,
        (json) => Medicine.fromJson(json as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<Medicine>.error(
        message: 'Failed to create medicine: ${e.toString()}',
        statusCode: 500,
      );
    }
  }
  
  Future<ApiResponse<Medicine>> updateMedicine(int id, UpdateMedicineRequest request) async {
    try {
      final response = await _dio.put('/medicines/$id', data: request.toJson());
      return ApiResponse<Medicine>.fromJson(
        response.data,
        (json) => Medicine.fromJson(json as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<Medicine>.error(
        message: 'Failed to update medicine: ${e.toString()}',
        statusCode: 500,
      );
    }
  }
  
  Future<ApiResponse<void>> deleteMedicine(int id) async {
    try {
      await _dio.delete('/medicines/$id');
      return ApiResponse<void>.success(message: 'Medicine deleted successfully');
    } catch (e) {
      return ApiResponse<void>.error(
        message: 'Failed to delete medicine: ${e.toString()}',
        statusCode: 500,
      );
    }
  }
  
  // ==================== CATEGORIES ====================
  
  Future<ApiResponse<List<Category>>> getCategories() async {
    try {
      final response = await _dio.get('/categories');
      return ApiResponse<List<Category>>.fromJson(
        response.data,
        (json) => (json as List).map((item) => Category.fromJson(item as Map<String, dynamic>)).toList(),
      );
    } catch (e) {
      return ApiResponse<List<Category>>.error(
        message: 'Failed to fetch categories: ${e.toString()}',
        statusCode: 500,
      );
    }
  }
  
  // ==================== ORDERS ====================
  
  Future<ApiResponse<PaginatedResponse<Order>>> getOrders({
    int page = 1,
    int limit = 20,
    String? status,
    int? userId,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
        if (status != null) 'status': status,
        if (userId != null) 'userId': userId,
      };
      
      final response = await _dio.get('/orders', queryParameters: queryParams);
      return ApiResponse<PaginatedResponse<Order>>.fromJson(
        response.data,
        (json) => PaginatedResponse<Order>.fromJson(
          json as Map<String, dynamic>,
          (item) => Order.fromJson(item as Map<String, dynamic>),
        ),
      );
    } catch (e) {
      return ApiResponse<PaginatedResponse<Order>>.error(
        message: 'Failed to fetch orders: ${e.toString()}',
        statusCode: 500,
      );
    }
  }
  
  Future<ApiResponse<Order>> getOrder(int id) async {
    try {
      final response = await _dio.get('/orders/$id');
      return ApiResponse<Order>.fromJson(
        response.data,
        (json) => Order.fromJson(json as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<Order>.error(
        message: 'Failed to fetch order: ${e.toString()}',
        statusCode: 500,
      );
    }
  }
  
  Future<ApiResponse<Order>> createOrder(CreateOrderRequest request) async {
    try {
      final response = await _dio.post('/orders', data: request.toJson());
      return ApiResponse<Order>.fromJson(
        response.data,
        (json) => Order.fromJson(json as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<Order>.error(
        message: 'Failed to create order: ${e.toString()}',
        statusCode: 500,
      );
    }
  }
  
  Future<ApiResponse<Order>> updateOrderStatus(int id, String status) async {
    try {
      final response = await _dio.put('/orders/$id/status', data: {'status': status});
      return ApiResponse<Order>.fromJson(
        response.data,
        (json) => Order.fromJson(json as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<Order>.error(
        message: 'Failed to update order status: ${e.toString()}',
        statusCode: 500,
      );
    }
  }
  
  // ==================== INVENTORY ====================
  
  Future<ApiResponse<PaginatedResponse<InventoryItem>>> getInventory({
    int page = 1,
    int limit = 20,
    int? medicineId,
    int? supplierId,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
        if (medicineId != null) 'medicineId': medicineId,
        if (supplierId != null) 'supplierId': supplierId,
      };
      
      final response = await _dio.get('/inventory', queryParameters: queryParams);
      return ApiResponse<PaginatedResponse<InventoryItem>>.fromJson(
        response.data,
        (json) => PaginatedResponse<InventoryItem>.fromJson(
          json as Map<String, dynamic>,
          (item) => InventoryItem.fromJson(item as Map<String, dynamic>),
        ),
      );
    } catch (e) {
      return ApiResponse<PaginatedResponse<InventoryItem>>.error(
        message: 'Failed to fetch inventory: ${e.toString()}',
        statusCode: 500,
      );
    }
  }
  
  Future<ApiResponse<InventoryItem>> addInventory(AddInventoryRequest request) async {
    try {
      final response = await _dio.post('/inventory', data: request.toJson());
      return ApiResponse<InventoryItem>.fromJson(
        response.data,
        (json) => InventoryItem.fromJson(json as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<InventoryItem>.error(
        message: 'Failed to add inventory: ${e.toString()}',
        statusCode: 500,
      );
    }
  }
  
  // ==================== DASHBOARD ====================
  
  Future<ApiResponse<DashboardStats>> getDashboardStats() async {
    try {
      final response = await _dio.get('/dashboard/stats');
      return ApiResponse<DashboardStats>.fromJson(
        response.data,
        (json) => DashboardStats.fromJson(json as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<DashboardStats>.error(
        message: 'Failed to fetch dashboard stats: ${e.toString()}',
        statusCode: 500,
      );
    }
  }
  
  // ==================== POS SYSTEM ====================
  
  Future<ApiResponse<Sale>> createSale(CreateSaleRequest request) async {
    try {
      final response = await _dio.post('/sales', data: request.toJson());
      return ApiResponse<Sale>.fromJson(
        response.data,
        (json) => Sale.fromJson(json as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<Sale>.error(
        message: 'Failed to create sale: ${e.toString()}',
        statusCode: 500,
      );
    }
  }
  
  Future<ApiResponse<List<Customer>>> getCustomers() async {
    try {
      final response = await _dio.get('/customers');
      return ApiResponse<List<Customer>>.fromJson(
        response.data,
        (json) => (json as List).map((item) => Customer.fromJson(item as Map<String, dynamic>)).toList(),
      );
    } catch (e) {
      return ApiResponse<List<Customer>>.error(
        message: 'Failed to fetch customers: ${e.toString()}',
        statusCode: 500,
      );
    }
  }
  
  Future<ApiResponse<Customer>> createCustomer(CreateCustomerRequest request) async {
    try {
      final response = await _dio.post('/customers', data: request.toJson());
      return ApiResponse<Customer>.fromJson(
        response.data,
        (json) => Customer.fromJson(json as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<Customer>.error(
        message: 'Failed to create customer: ${e.toString()}',
        statusCode: 500,
      );
    }
  }
  
  // ==================== PRESCRIPTIONS ====================
  
  Future<ApiResponse<PaginatedResponse<Prescription>>> getPrescriptions({
    int page = 1,
    int limit = 20,
    bool? verified,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
        if (verified != null) 'verified': verified,
      };
      
      final response = await _dio.get('/prescriptions', queryParameters: queryParams);
      return ApiResponse<PaginatedResponse<Prescription>>.fromJson(
        response.data,
        (json) => PaginatedResponse<Prescription>.fromJson(
          json as Map<String, dynamic>,
          (item) => Prescription.fromJson(item as Map<String, dynamic>),
        ),
      );
    } catch (e) {
      return ApiResponse<PaginatedResponse<Prescription>>.error(
        message: 'Failed to fetch prescriptions: ${e.toString()}',
        statusCode: 500,
      );
    }
  }
  
  Future<ApiResponse<Prescription>> uploadPrescription(String filePath, {int? orderId}) async {
    try {
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(filePath),
        if (orderId != null) 'orderId': orderId,
      });
      
      final response = await _dio.post('/prescriptions', data: formData);
      return ApiResponse<Prescription>.fromJson(
        response.data,
        (json) => Prescription.fromJson(json as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<Prescription>.error(
        message: 'Failed to upload prescription: ${e.toString()}',
        statusCode: 500,
      );
    }
  }
  
  Future<ApiResponse<Prescription>> verifyPrescription(int id, bool verified) async {
    try {
      final response = await _dio.put('/prescriptions/$id/verify', data: {'verified': verified});
      return ApiResponse<Prescription>.fromJson(
        response.data,
        (json) => Prescription.fromJson(json as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<Prescription>.error(
        message: 'Failed to verify prescription: ${e.toString()}',
        statusCode: 500,
      );
    }
  }
}

// ==================== REQUEST MODELS ====================

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
  
  Map<String, dynamic> toJson() => {
    'name': name,
    if (description != null) 'description': description,
    if (usage != null) 'usage': usage,
    if (dosage != null) 'dosage': dosage,
    if (sideEffects != null) 'sideEffects': sideEffects,
    if (sku != null) 'sku': sku,
    if (barcode != null) 'barcode': barcode,
    if (unit != null) 'unit': unit,
    'price': price,
    'minStock': minStock,
    if (categoryId != null) 'categoryId': categoryId,
  };
}

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
  
  Map<String, dynamic> toJson() => {
    if (name != null) 'name': name,
    if (description != null) 'description': description,
    if (usage != null) 'usage': usage,
    if (dosage != null) 'dosage': dosage,
    if (sideEffects != null) 'sideEffects': sideEffects,
    if (sku != null) 'sku': sku,
    if (barcode != null) 'barcode': barcode,
    if (unit != null) 'unit': unit,
    if (price != null) 'price': price,
    if (minStock != null) 'minStock': minStock,
    if (categoryId != null) 'categoryId': categoryId,
  };
}

class CreateOrderRequest {
  final List<OrderItemRequest> items;
  final String? note;
  
  CreateOrderRequest({required this.items, this.note});
  
  Map<String, dynamic> toJson() => {
    'items': items.map((item) => item.toJson()).toList(),
    if (note != null) 'note': note,
  };
}

class OrderItemRequest {
  final int medicineId;
  final int quantity;
  final double price;
  
  OrderItemRequest({
    required this.medicineId,
    required this.quantity,
    required this.price,
  });
  
  Map<String, dynamic> toJson() => {
    'medicineId': medicineId,
    'quantity': quantity,
    'price': price,
  };
}

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
  
  Map<String, dynamic> toJson() => {
    'medicineId': medicineId,
    if (supplierId != null) 'supplierId': supplierId,
    if (batchNumber != null) 'batchNumber': batchNumber,
    'quantity': quantity,
    'unitPrice': unitPrice,
    if (expiryDate != null) 'expiryDate': expiryDate,
  };
}

class CreateSaleRequest {
  final int? customerId;
  final List<SaleItemRequest> items;
  final double subtotal;
  final double tax;
  final double discount;
  final double total;
  final String paymentMethod;
  final String? paymentRef;
  final String type;
  
  CreateSaleRequest({
    this.customerId,
    required this.items,
    required this.subtotal,
    required this.tax,
    required this.discount,
    required this.total,
    required this.paymentMethod,
    this.paymentRef,
    required this.type,
  });
  
  Map<String, dynamic> toJson() => {
    if (customerId != null) 'customerId': customerId,
    'items': items.map((item) => item.toJson()).toList(),
    'subtotal': subtotal,
    'tax': tax,
    'discount': discount,
    'total': total,
    'paymentMethod': paymentMethod,
    if (paymentRef != null) 'paymentRef': paymentRef,
    'type': type,
  };
}

class SaleItemRequest {
  final int medicineId;
  final int quantity;
  final double unitPrice;
  final double discount;
  final double total;
  
  SaleItemRequest({
    required this.medicineId,
    required this.quantity,
    required this.unitPrice,
    required this.discount,
    required this.total,
  });
  
  Map<String, dynamic> toJson() => {
    'medicineId': medicineId,
    'quantity': quantity,
    'unitPrice': unitPrice,
    'discount': discount,
    'total': total,
  };
}

class CreateCustomerRequest {
  final String firstName;
  final String lastName;
  final String? phone;
  final String? email;
  
  CreateCustomerRequest({
    required this.firstName,
    required this.lastName,
    this.phone,
    this.email,
  });
  
  Map<String, dynamic> toJson() => {
    'firstName': firstName,
    'lastName': lastName,
    if (phone != null) 'phone': phone,
    if (email != null) 'email': email,
  };
}

// ==================== RESPONSE MODELS ====================

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

// Placeholder models - these would be defined in separate files
class Medicine {
  final int id;
  final String name;
  final String slug;
  final String? description;
  final double price;
  final int totalStock;
  final Category? category;
  final String? unit;
  final String? barcode;
  
  Medicine({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    required this.price,
    required this.totalStock,
    this.category,
    this.unit,
    this.barcode,
  });
  
  factory Medicine.fromJson(Map<String, dynamic> json) => Medicine(
    id: json['id'] as int,
    name: json['name'] as String,
    slug: json['slug'] as String,
    description: json['description'] as String?,
    price: (json['price'] as num).toDouble(),
    totalStock: json['totalStock'] as int,
    category: json['category'] != null ? Category.fromJson(json['category'] as Map<String, dynamic>) : null,
    unit: json['unit'] as String?,
    barcode: json['barcode'] as String?,
  );
  
  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'slug': slug,
    if (description != null) 'description': description,
    'price': price,
    'totalStock': totalStock,
    if (category != null) 'category': category!.toJson(),
    if (unit != null) 'unit': unit,
    if (barcode != null) 'barcode': barcode,
  };
  
  String get formattedPrice => '\$${price.toStringAsFixed(2)}';
  String get categoryName => category?.name ?? 'Uncategorized';
  bool get isInStock => totalStock > 0;
}

class Category {
  final int id;
  final String name;
  final String slug;
  
  Category({
    required this.id,
    required this.name,
    required this.slug,
  });
  
  factory Category.fromJson(Map<String, dynamic> json) => Category(
    id: json['id'] as int,
    name: json['name'] as String,
    slug: json['slug'] as String,
  );
  
  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'slug': slug,
  };
}

class Order {
  final int id;
  final String status;
  final double total;
  final User user;
  final List<OrderItem> items;
  final DateTime createdAt;
  
  Order({
    required this.id,
    required this.status,
    required this.total,
    required this.user,
    required this.items,
    required this.createdAt,
  });
  
  factory Order.fromJson(Map<String, dynamic> json) => Order(
    id: json['id'] as int,
    status: json['status'] as String,
    total: (json['total'] as num).toDouble(),
    user: User.fromJson(json['user'] as Map<String, dynamic>),
    items: (json['items'] as List).map((item) => OrderItem.fromJson(item as Map<String, dynamic>)).toList(),
    createdAt: DateTime.parse(json['createdAt'] as String),
  );
  
  Map<String, dynamic> toJson() => {
    'id': id,
    'status': status,
    'total': total,
    'user': user.toJson(),
    'items': items.map((item) => item.toJson()).toList(),
    'createdAt': createdAt.toIso8601String(),
  };
}

class OrderItem {
  final int id;
  final int quantity;
  final double price;
  final Medicine medicine;
  
  OrderItem({
    required this.id,
    required this.quantity,
    required this.price,
    required this.medicine,
  });
  
  factory OrderItem.fromJson(Map<String, dynamic> json) => OrderItem(
    id: json['id'] as int,
    quantity: json['quantity'] as int,
    price: (json['price'] as num).toDouble(),
    medicine: Medicine.fromJson(json['medicine'] as Map<String, dynamic>),
  );
  
  Map<String, dynamic> toJson() => {
    'id': id,
    'quantity': quantity,
    'price': price,
    'medicine': medicine.toJson(),
  };
}

class InventoryItem {
  final int id;
  final int quantity;
  final String? batchNumber;
  final DateTime? expiryDate;
  final Medicine medicine;
  
  InventoryItem({
    required this.id,
    required this.quantity,
    this.batchNumber,
    this.expiryDate,
    required this.medicine,
  });
  
  factory InventoryItem.fromJson(Map<String, dynamic> json) => InventoryItem(
    id: json['id'] as int,
    quantity: json['quantity'] as int,
    batchNumber: json['batchNumber'] as String?,
    expiryDate: json['expiryDate'] != null ? DateTime.parse(json['expiryDate'] as String) : null,
    medicine: Medicine.fromJson(json['medicine'] as Map<String, dynamic>),
  );
  
  Map<String, dynamic> toJson() => {
    'id': id,
    'quantity': quantity,
    if (batchNumber != null) 'batchNumber': batchNumber,
    if (expiryDate != null) 'expiryDate': expiryDate!.toIso8601String(),
    'medicine': medicine.toJson(),
  };
}

class DashboardStats {
  final int totalOrders;
  final double totalRevenue;
  final int totalMedicines;
  final int totalUsers;
  final List<Order> recentOrders;
  final List<Medicine> lowStockMedicines;
  final List<InventoryItem> expiringMedicines;
  final int pendingPrescriptions;
  
  DashboardStats({
    required this.totalOrders,
    required this.totalRevenue,
    required this.totalMedicines,
    required this.totalUsers,
    required this.recentOrders,
    required this.lowStockMedicines,
    required this.expiringMedicines,
    required this.pendingPrescriptions,
  });
  
  factory DashboardStats.fromJson(Map<String, dynamic> json) => DashboardStats(
    totalOrders: json['totalOrders'] as int,
    totalRevenue: (json['totalRevenue'] as num).toDouble(),
    totalMedicines: json['totalMedicines'] as int,
    totalUsers: json['totalUsers'] as int,
    recentOrders: (json['recentOrders'] as List).map((item) => Order.fromJson(item as Map<String, dynamic>)).toList(),
    lowStockMedicines: (json['lowStockMedicines'] as List).map((item) => Medicine.fromJson(item as Map<String, dynamic>)).toList(),
    expiringMedicines: (json['expiringMedicines'] as List).map((item) => InventoryItem.fromJson(item as Map<String, dynamic>)).toList(),
    pendingPrescriptions: json['pendingPrescriptions'] as int,
  );
  
  Map<String, dynamic> toJson() => {
    'totalOrders': totalOrders,
    'totalRevenue': totalRevenue,
    'totalMedicines': totalMedicines,
    'totalUsers': totalUsers,
    'recentOrders': recentOrders.map((item) => item.toJson()).toList(),
    'lowStockMedicines': lowStockMedicines.map((item) => item.toJson()).toList(),
    'expiringMedicines': expiringMedicines.map((item) => item.toJson()).toList(),
    'pendingPrescriptions': pendingPrescriptions,
  };
}

class Sale {
  final int id;
  final String saleNumber;
  final double total;
  final DateTime createdAt;
  
  Sale({
    required this.id,
    required this.saleNumber,
    required this.total,
    required this.createdAt,
  });
  
  factory Sale.fromJson(Map<String, dynamic> json) => Sale(
    id: json['id'] as int,
    saleNumber: json['saleNumber'] as String,
    total: (json['total'] as num).toDouble(),
    createdAt: DateTime.parse(json['createdAt'] as String),
  );
  
  Map<String, dynamic> toJson() => {
    'id': id,
    'saleNumber': saleNumber,
    'total': total,
    'createdAt': createdAt.toIso8601String(),
  };
}

class Customer {
  final int id;
  final String firstName;
  final String lastName;
  final String? phone;
  final String? email;
  final int loyaltyPoints;
  
  Customer({
    required this.id,
    required this.firstName,
    required this.lastName,
    this.phone,
    this.email,
    required this.loyaltyPoints,
  });
  
  factory Customer.fromJson(Map<String, dynamic> json) => Customer(
    id: json['id'] as int,
    firstName: json['firstName'] as String,
    lastName: json['lastName'] as String,
    phone: json['phone'] as String?,
    email: json['email'] as String?,
    loyaltyPoints: json['loyaltyPoints'] as int? ?? 0,
  );
  
  Map<String, dynamic> toJson() => {
    'id': id,
    'firstName': firstName,
    'lastName': lastName,
    if (phone != null) 'phone': phone,
    if (email != null) 'email': email,
    'loyaltyPoints': loyaltyPoints,
  };
}

class Prescription {
  final int id;
  final String? imageUrl;
  final bool verified;
  final DateTime createdAt;
  
  Prescription({
    required this.id,
    this.imageUrl,
    required this.verified,
    required this.createdAt,
  });
  
  factory Prescription.fromJson(Map<String, dynamic> json) => Prescription(
    id: json['id'] as int,
    imageUrl: json['imageUrl'] as String?,
    verified: json['verified'] as bool,
    createdAt: DateTime.parse(json['createdAt'] as String),
  );
  
  Map<String, dynamic> toJson() => {
    'id': id,
    if (imageUrl != null) 'imageUrl': imageUrl,
    'verified': verified,
    'createdAt': createdAt.toIso8601String(),
  };
}