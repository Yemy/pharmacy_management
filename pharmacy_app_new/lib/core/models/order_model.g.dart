// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Order _$OrderFromJson(Map<String, dynamic> json) => Order(
      id: (json['id'] as num).toInt(),
      user: json['user'] == null
          ? null
          : User.fromJson(json['user'] as Map<String, dynamic>),
      userId: (json['userId'] as num).toInt(),
      total: (json['total'] as num).toDouble(),
      status: $enumDecode(_$OrderStatusEnumMap, json['status']),
      items: (json['items'] as List<dynamic>)
          .map((e) => OrderItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      prescription: json['prescription'] == null
          ? null
          : Prescription.fromJson(json['prescription'] as Map<String, dynamic>),
      payment: json['payment'] == null
          ? null
          : Payment.fromJson(json['payment'] as Map<String, dynamic>),
      note: json['note'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$OrderToJson(Order instance) => <String, dynamic>{
      'id': instance.id,
      'user': instance.user,
      'userId': instance.userId,
      'total': instance.total,
      'status': _$OrderStatusEnumMap[instance.status]!,
      'items': instance.items,
      'prescription': instance.prescription,
      'payment': instance.payment,
      'note': instance.note,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
    };

const _$OrderStatusEnumMap = {
  OrderStatus.pending: 'PENDING',
  OrderStatus.paid: 'PAID',
  OrderStatus.packed: 'PACKED',
  OrderStatus.delivered: 'DELIVERED',
  OrderStatus.cancelled: 'CANCELLED',
  OrderStatus.rejected: 'REJECTED',
};

OrderItem _$OrderItemFromJson(Map<String, dynamic> json) => OrderItem(
      id: (json['id'] as num).toInt(),
      orderId: (json['orderId'] as num).toInt(),
      medicine: json['medicine'] == null
          ? null
          : Medicine.fromJson(json['medicine'] as Map<String, dynamic>),
      medicineId: (json['medicineId'] as num).toInt(),
      quantity: (json['quantity'] as num).toInt(),
      price: (json['price'] as num).toDouble(),
    );

Map<String, dynamic> _$OrderItemToJson(OrderItem instance) => <String, dynamic>{
      'id': instance.id,
      'orderId': instance.orderId,
      'medicine': instance.medicine,
      'medicineId': instance.medicineId,
      'quantity': instance.quantity,
      'price': instance.price,
    };

Payment _$PaymentFromJson(Map<String, dynamic> json) => Payment(
      id: (json['id'] as num).toInt(),
      orderId: (json['orderId'] as num).toInt(),
      amount: (json['amount'] as num).toDouble(),
      status: $enumDecode(_$PaymentStatusEnumMap, json['status']),
      provider: json['provider'] as String?,
      transactionId: json['transactionId'] as String?,
      metadata: json['metadata'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );

Map<String, dynamic> _$PaymentToJson(Payment instance) => <String, dynamic>{
      'id': instance.id,
      'orderId': instance.orderId,
      'amount': instance.amount,
      'status': _$PaymentStatusEnumMap[instance.status]!,
      'provider': instance.provider,
      'transactionId': instance.transactionId,
      'metadata': instance.metadata,
      'createdAt': instance.createdAt.toIso8601String(),
    };

const _$PaymentStatusEnumMap = {
  PaymentStatus.pending: 'PENDING',
  PaymentStatus.succeeded: 'SUCCEEDED',
  PaymentStatus.failed: 'FAILED',
  PaymentStatus.refunded: 'REFUNDED',
};
