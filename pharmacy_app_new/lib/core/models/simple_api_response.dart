class ApiResponse<T> {
  final bool success;
  final String? message;
  final T? data;
  final Map<String, dynamic>? errors;
  final int? statusCode;
  
  const ApiResponse({
    required this.success,
    this.message,
    this.data,
    this.errors,
    this.statusCode,
  });
  
  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object? json) fromJsonT,
  ) {
    return ApiResponse<T>(
      success: json['success'] as bool? ?? true,
      message: json['message'] as String?,
      data: json['data'] != null ? fromJsonT(json['data']) : null,
      errors: json['errors'] as Map<String, dynamic>?,
      statusCode: json['statusCode'] as int?,
    );
  }
  
  Map<String, dynamic> toJson(Object? Function(T value) toJsonT) => {
    'success': success,
    if (message != null) 'message': message,
    if (data != null) 'data': toJsonT(data as T),
    if (errors != null) 'errors': errors,
    if (statusCode != null) 'statusCode': statusCode,
  };
  
  // Success response
  factory ApiResponse.success({
    T? data,
    String? message,
  }) {
    return ApiResponse<T>(
      success: true,
      data: data,
      message: message,
      statusCode: 200,
    );
  }
  
  // Error response
  factory ApiResponse.error({
    required String message,
    Map<String, dynamic>? errors,
    int? statusCode,
  }) {
    return ApiResponse<T>(
      success: false,
      message: message,
      errors: errors,
      statusCode: statusCode,
    );
  }
  
  bool get isSuccess => success;
  bool get isError => !success;
  bool get hasData => data != null;
  bool get hasErrors => errors != null && errors!.isNotEmpty;
}