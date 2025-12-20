import 'package:json_annotation/json_annotation.dart';
import 'user_model.dart';
import 'medicine_model.dart';
import 'prescription_model.dart';

part 'order_model.g.dart';

@JsonSerializable()
class Order {
  final int id;
  final User? user;
  final int userId;
  final double total;
  final OrderStatus status;
  final List<OrderItem> items;
  final Prescription? prescription;
  final Payment? payment;
  final String? note;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  const Order({
    required this.id,
    this.user,
    required this.userId,
    required this.total,
    required this.status,
    required this.items,
    this.prescription,
    this.payment,
    this.note,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory Order.fromJson(Map<String, dynamic> json) => _$OrderFromJson(json);
  Map<String, dynamic> toJson() => _$OrderToJson(this);
  
  // Get formatted total
  String get formattedTotal => '\$${total.toStringAsFixed(2)}';
  
  // Get total items count
  int get totalItems => items.fold(0, (sum, item) => sum + item.quantity);
  
  // Get status color
  String get statusColor {
    switch (status) {
      case OrderStatus.pending:
        return '#FF9800'; // Orange
      case OrderStatus.paid:
        return '#2196F3'; // Blue
      case OrderStatus.packed:
        return '#9C27B0'; // Purple
      case OrderStatus.delivered:
        return '#4CAF50'; // Green
      case OrderStatus.cancelled:
      case OrderStatus.rejected:
        return '#F44336'; // Red
    }
  }
  
  // Get status text
  String get statusText {
    switch (status) {
      case OrderStatus.pending:
        return 'Pending';
      case OrderStatus.paid:
        return 'Paid';
      case OrderStatus.packed:
        return 'Packed';
      case OrderStatus.delivered:
        return 'Delivered';
      case OrderStatus.cancelled:
        return 'Cancelled';
      case OrderStatus.rejected:
        return 'Rejected';
    }
  }
  
  // Check if order can be cancelled
  bool get canBeCancelled {
    return status == OrderStatus.pending || status == OrderStatus.paid;
  }
  
  // Check if order is completed
  bool get isCompleted {
    return status == OrderStatus.delivered;
  }
  
  // Check if order is active
  bool get isActive {
    return status != OrderStatus.delivered && 
           status != OrderStatus.cancelled && 
           status != OrderStatus.rejected;
  }
  
  // Check if prescription is required
  bool get requiresPrescription {
    return items.any((item) => item.medicine?.requiresPrescription == true);
  }
  
  // Check if prescription is uploaded
  bool get hasPrescription => prescription != null;
  
  // Check if prescription is verified
  bool get isPrescriptionVerified => prescription?.verified == true;
  
  Order copyWith({
    int? id,
    User? user,
    int? userId,
    double? total,
    OrderStatus? status,
    List<OrderItem>? items,
    Prescription? prescription,
    Payment? payment,
    String? note,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Order(
      id: id ?? this.id,
      user: user ?? this.user,
      userId: userId ?? this.userId,
      total: total ?? this.total,
      status: status ?? this.status,
      items: items ?? this.items,
      prescription: prescription ?? this.prescription,
      payment: payment ?? this.payment,
      note: note ?? this.note,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

@JsonSerializable()
class OrderItem {
  final int id;
  final int orderId;
  final Medicine? medicine;
  final int medicineId;
  final int quantity;
  final double price;
  
  const OrderItem({
    required this.id,
    required this.orderId,
    this.medicine,
    required this.medicineId,
    required this.quantity,
    required this.price,
  });
  
  factory OrderItem.fromJson(Map<String, dynamic> json) => _$OrderItemFromJson(json);
  Map<String, dynamic> toJson() => _$OrderItemToJson(this);
  
  // Get total price for this item
  double get total => price * quantity;
  
  // Get formatted total
  String get formattedTotal => '\$${total.toStringAsFixed(2)}';
  
  // Get formatted unit price
  String get formattedPrice => '\$${price.toStringAsFixed(2)}';
  
  // Get medicine name
  String get medicineName => medicine?.name ?? 'Unknown Medicine';
  
  OrderItem copyWith({
    int? id,
    int? orderId,
    Medicine? medicine,
    int? medicineId,
    int? quantity,
    double? price,
  }) {
    return OrderItem(
      id: id ?? this.id,
      orderId: orderId ?? this.orderId,
      medicine: medicine ?? this.medicine,
      medicineId: medicineId ?? this.medicineId,
      quantity: quantity ?? this.quantity,
      price: price ?? this.price,
    );
  }
}

@JsonSerializable()
class Payment {
  final int id;
  final int orderId;
  final double amount;
  final PaymentStatus status;
  final String? provider;
  final String? transactionId;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;
  
  const Payment({
    required this.id,
    required this.orderId,
    required this.amount,
    required this.status,
    this.provider,
    this.transactionId,
    this.metadata,
    required this.createdAt,
  });
  
  factory Payment.fromJson(Map<String, dynamic> json) => _$PaymentFromJson(json);
  Map<String, dynamic> toJson() => _$PaymentToJson(this);
  
  // Get formatted amount
  String get formattedAmount => '\$${amount.toStringAsFixed(2)}';
  
  // Get status color
  String get statusColor {
    switch (status) {
      case PaymentStatus.pending:
        return '#FF9800'; // Orange
      case PaymentStatus.succeeded:
        return '#4CAF50'; // Green
      case PaymentStatus.failed:
        return '#F44336'; // Red
      case PaymentStatus.refunded:
        return '#9E9E9E'; // Grey
    }
  }
  
  // Get status text
  String get statusText {
    switch (status) {
      case PaymentStatus.pending:
        return 'Pending';
      case PaymentStatus.succeeded:
        return 'Succeeded';
      case PaymentStatus.failed:
        return 'Failed';
      case PaymentStatus.refunded:
        return 'Refunded';
    }
  }
}

enum OrderStatus {
  @JsonValue('PENDING')
  pending,
  @JsonValue('PAID')
  paid,
  @JsonValue('PACKED')
  packed,
  @JsonValue('DELIVERED')
  delivered,
  @JsonValue('CANCELLED')
  cancelled,
  @JsonValue('REJECTED')
  rejected,
}

enum PaymentStatus {
  @JsonValue('PENDING')
  pending,
  @JsonValue('SUCCEEDED')
  succeeded,
  @JsonValue('FAILED')
  failed,
  @JsonValue('REFUNDED')
  refunded,
}