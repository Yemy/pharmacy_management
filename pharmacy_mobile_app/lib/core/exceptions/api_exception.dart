enum ApiExceptionType {
  network,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  validation,
  server,
  cancel,
  unknown,
}

class ApiException implements Exception {
  final String message;
  final int statusCode;
  final ApiExceptionType type;
  final Map<String, dynamic>? errors;
  
  const ApiException({
    required this.message,
    required this.statusCode,
    required this.type,
    this.errors,
  });
  
  @override
  String toString() {
    return 'ApiException: $message (Status: $statusCode, Type: $type)';
  }
  
  bool get isNetworkError => type == ApiExceptionType.network;
  bool get isUnauthorized => type == ApiExceptionType.unauthorized;
  bool get isValidationError => type == ApiExceptionType.validation;
  bool get isServerError => type == ApiExceptionType.server;
  
  String get userFriendlyMessage {
    switch (type) {
      case ApiExceptionType.network:
        return 'Please check your internet connection and try again.';
      case ApiExceptionType.unauthorized:
        return 'Your session has expired. Please login again.';
      case ApiExceptionType.forbidden:
        return 'You don\'t have permission to perform this action.';
      case ApiExceptionType.notFound:
        return 'The requested resource was not found.';
      case ApiExceptionType.validation:
        return 'Please check your input and try again.';
      case ApiExceptionType.server:
        return 'Server error occurred. Please try again later.';
      case ApiExceptionType.cancel:
        return 'Request was cancelled.';
      case ApiExceptionType.badRequest:
      case ApiExceptionType.unknown:
      default:
        return message.isNotEmpty ? message : 'An unexpected error occurred.';
    }
  }
}