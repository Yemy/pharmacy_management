// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'inventory_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

InventoryItem _$InventoryItemFromJson(Map<String, dynamic> json) =>
    InventoryItem(
      id: (json['id'] as num).toInt(),
      medicine: json['medicine'] == null
          ? null
          : Medicine.fromJson(json['medicine'] as Map<String, dynamic>),
      medicineId: (json['medicineId'] as num).toInt(),
      supplier: json['supplier'] == null
          ? null
          : Supplier.fromJson(json['supplier'] as Map<String, dynamic>),
      supplierId: (json['supplierId'] as num?)?.toInt(),
      batchNumber: json['batchNumber'] as String?,
      quantity: (json['quantity'] as num).toInt(),
      unitPrice: (json['unitPrice'] as num).toDouble(),
      expiryDate: json['expiryDate'] == null
          ? null
          : DateTime.parse(json['expiryDate'] as String),
      receivedAt: DateTime.parse(json['receivedAt'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$InventoryItemToJson(InventoryItem instance) =>
    <String, dynamic>{
      'id': instance.id,
      'medicine': instance.medicine,
      'medicineId': instance.medicineId,
      'supplier': instance.supplier,
      'supplierId': instance.supplierId,
      'batchNumber': instance.batchNumber,
      'quantity': instance.quantity,
      'unitPrice': instance.unitPrice,
      'expiryDate': instance.expiryDate?.toIso8601String(),
      'receivedAt': instance.receivedAt.toIso8601String(),
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
    };

Supplier _$SupplierFromJson(Map<String, dynamic> json) => Supplier(
      id: (json['id'] as num).toInt(),
      name: json['name'] as String,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      contactInfo: json['contactInfo'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$SupplierToJson(Supplier instance) => <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'email': instance.email,
      'phone': instance.phone,
      'contactInfo': instance.contactInfo,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
    };

InventoryAlert _$InventoryAlertFromJson(Map<String, dynamic> json) =>
    InventoryAlert(
      id: (json['id'] as num).toInt(),
      type: json['type'] as String,
      message: json['message'] as String,
      medicine: json['medicine'] == null
          ? null
          : Medicine.fromJson(json['medicine'] as Map<String, dynamic>),
      inventory: json['inventory'] == null
          ? null
          : InventoryItem.fromJson(json['inventory'] as Map<String, dynamic>),
      createdAt: DateTime.parse(json['createdAt'] as String),
      isRead: json['isRead'] as bool,
    );

Map<String, dynamic> _$InventoryAlertToJson(InventoryAlert instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': instance.type,
      'message': instance.message,
      'medicine': instance.medicine,
      'inventory': instance.inventory,
      'createdAt': instance.createdAt.toIso8601String(),
      'isRead': instance.isRead,
    };
