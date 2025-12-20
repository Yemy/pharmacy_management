import 'package:json_annotation/json_annotation.dart';
import 'medicine_model.dart';

part 'inventory_model.g.dart';

@JsonSerializable()
class InventoryItem {
  final int id;
  final Medicine? medicine;
  final int medicineId;
  final Supplier? supplier;
  final int? supplierId;
  final String? batchNumber;
  final int quantity;
  final double unitPrice;
  final DateTime? expiryDate;
  final DateTime receivedAt;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  const InventoryItem({
    required this.id,
    this.medicine,
    required this.medicineId,
    this.supplier,
    this.supplierId,
    this.batchNumber,
    required this.quantity,
    required this.unitPrice,
    this.expiryDate,
    required this.receivedAt,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory InventoryItem.fromJson(Map<String, dynamic> json) => _$InventoryItemFromJson(json);
  Map<String, dynamic> toJson() => _$InventoryItemToJson(this);
  
  // Get formatted unit price
  String get formattedUnitPrice => '\$${unitPrice.toStringAsFixed(2)}';
  
  // Get total value
  double get totalValue => unitPrice * quantity;
  
  // Get formatted total value
  String get formattedTotalValue => '\$${totalValue.toStringAsFixed(2)}';
  
  // Check if expired
  bool get isExpired {
    if (expiryDate == null) return false;
    return expiryDate!.isBefore(DateTime.now());
  }
  
  // Check if expiring soon (within 30 days)
  bool get isExpiringSoon {
    if (expiryDate == null) return false;
    final now = DateTime.now();
    final thirtyDaysFromNow = now.add(const Duration(days: 30));
    return expiryDate!.isBefore(thirtyDaysFromNow) && expiryDate!.isAfter(now);
  }
  
  // Get days until expiry
  int? get daysUntilExpiry {
    if (expiryDate == null) return null;
    final now = DateTime.now();
    return expiryDate!.difference(now).inDays;
  }
  
  // Get expiry status
  ExpiryStatus get expiryStatus {
    if (isExpired) return ExpiryStatus.expired;
    if (isExpiringSoon) return ExpiryStatus.expiringSoon;
    return ExpiryStatus.valid;
  }
  
  // Get expiry status color
  String get expiryStatusColor {
    switch (expiryStatus) {
      case ExpiryStatus.expired:
        return '#F44336'; // Red
      case ExpiryStatus.expiringSoon:
        return '#FF9800'; // Orange
      case ExpiryStatus.valid:
        return '#4CAF50'; // Green
    }
  }
  
  // Get expiry status text
  String get expiryStatusText {
    switch (expiryStatus) {
      case ExpiryStatus.expired:
        return 'Expired';
      case ExpiryStatus.expiringSoon:
        return 'Expiring Soon';
      case ExpiryStatus.valid:
        return 'Valid';
    }
  }
  
  // Get formatted expiry date
  String get formattedExpiryDate {
    if (expiryDate == null) return 'No expiry date';
    return '${expiryDate!.day}/${expiryDate!.month}/${expiryDate!.year}';
  }
  
  // Get formatted received date
  String get formattedReceivedDate {
    return '${receivedAt.day}/${receivedAt.month}/${receivedAt.year}';
  }
  
  // Get medicine name
  String get medicineName => medicine?.name ?? 'Unknown Medicine';
  
  // Get supplier name
  String get supplierName => supplier?.name ?? 'Unknown Supplier';
  
  InventoryItem copyWith({
    int? id,
    Medicine? medicine,
    int? medicineId,
    Supplier? supplier,
    int? supplierId,
    String? batchNumber,
    int? quantity,
    double? unitPrice,
    DateTime? expiryDate,
    DateTime? receivedAt,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return InventoryItem(
      id: id ?? this.id,
      medicine: medicine ?? this.medicine,
      medicineId: medicineId ?? this.medicineId,
      supplier: supplier ?? this.supplier,
      supplierId: supplierId ?? this.supplierId,
      batchNumber: batchNumber ?? this.batchNumber,
      quantity: quantity ?? this.quantity,
      unitPrice: unitPrice ?? this.unitPrice,
      expiryDate: expiryDate ?? this.expiryDate,
      receivedAt: receivedAt ?? this.receivedAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

@JsonSerializable()
class Supplier {
  final int id;
  final String name;
  final String? email;
  final String? phone;
  final String? contactInfo;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  const Supplier({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    this.contactInfo,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory Supplier.fromJson(Map<String, dynamic> json) => _$SupplierFromJson(json);
  Map<String, dynamic> toJson() => _$SupplierToJson(this);
  
  Supplier copyWith({
    int? id,
    String? name,
    String? email,
    String? phone,
    String? contactInfo,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Supplier(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      contactInfo: contactInfo ?? this.contactInfo,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
  
  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Supplier && other.id == id;
  }
  
  @override
  int get hashCode => id.hashCode;
}

enum ExpiryStatus {
  valid,
  expiringSoon,
  expired,
}

@JsonSerializable()
class InventoryAlert {
  final int id;
  final String type;
  final String message;
  final Medicine? medicine;
  final InventoryItem? inventory;
  final DateTime createdAt;
  final bool isRead;
  
  const InventoryAlert({
    required this.id,
    required this.type,
    required this.message,
    this.medicine,
    this.inventory,
    required this.createdAt,
    required this.isRead,
  });
  
  factory InventoryAlert.fromJson(Map<String, dynamic> json) => _$InventoryAlertFromJson(json);
  Map<String, dynamic> toJson() => _$InventoryAlertToJson(this);
  
  // Get alert type color
  String get typeColor {
    switch (type.toLowerCase()) {
      case 'low_stock':
        return '#FF9800'; // Orange
      case 'out_of_stock':
        return '#F44336'; // Red
      case 'expiring':
        return '#FF5722'; // Deep Orange
      case 'expired':
        return '#9C27B0'; // Purple
      default:
        return '#2196F3'; // Blue
    }
  }
  
  // Get alert type icon
  String get typeIcon {
    switch (type.toLowerCase()) {
      case 'low_stock':
        return '⚠️';
      case 'out_of_stock':
        return '❌';
      case 'expiring':
        return '⏰';
      case 'expired':
        return '🚫';
      default:
        return 'ℹ️';
    }
  }
  
  // Get formatted created date
  String get formattedCreatedDate {
    final now = DateTime.now();
    final difference = now.difference(createdAt);
    
    if (difference.inDays > 0) {
      return '${difference.inDays} day${difference.inDays == 1 ? '' : 's'} ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} hour${difference.inHours == 1 ? '' : 's'} ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} minute${difference.inMinutes == 1 ? '' : 's'} ago';
    } else {
      return 'Just now';
    }
  }
}