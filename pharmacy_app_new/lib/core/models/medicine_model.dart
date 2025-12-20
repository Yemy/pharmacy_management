import 'package:json_annotation/json_annotation.dart';
import 'category_model.dart';
import 'inventory_model.dart';

part 'medicine_model.g.dart';

@JsonSerializable()
class Medicine {
  final int id;
  final String name;
  final String slug;
  final String? description;
  final String? usage;
  final String? dosage;
  final String? sideEffects;
  final String? sku;
  final String? barcode;
  final String? unit;
  final double price;
  final int minStock;
  final Category? category;
  final int? categoryId;
  final List<InventoryItem>? inventories;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  const Medicine({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.usage,
    this.dosage,
    this.sideEffects,
    this.sku,
    this.barcode,
    this.unit,
    required this.price,
    required this.minStock,
    this.category,
    this.categoryId,
    this.inventories,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory Medicine.fromJson(Map<String, dynamic> json) => _$MedicineFromJson(json);
  Map<String, dynamic> toJson() => _$MedicineToJson(this);
  
  // Calculate total stock from all inventories
  int get totalStock {
    if (inventories == null || inventories!.isEmpty) return 0;
    return inventories!.fold(0, (sum, inventory) => sum + inventory.quantity);
  }
  
  // Check if medicine is in stock
  bool get isInStock => totalStock > 0;
  
  // Check if medicine is low stock
  bool get isLowStock => totalStock <= minStock;
  
  // Check if medicine is out of stock
  bool get isOutOfStock => totalStock == 0;
  
  // Get stock status
  StockStatus get stockStatus {
    if (isOutOfStock) return StockStatus.outOfStock;
    if (isLowStock) return StockStatus.lowStock;
    return StockStatus.inStock;
  }
  
  // Get stock status color
  String get stockStatusColor {
    switch (stockStatus) {
      case StockStatus.outOfStock:
        return '#F44336'; // Red
      case StockStatus.lowStock:
        return '#FF9800'; // Orange
      case StockStatus.inStock:
        return '#4CAF50'; // Green
    }
  }
  
  // Get stock status text
  String get stockStatusText {
    switch (stockStatus) {
      case StockStatus.outOfStock:
        return 'Out of Stock';
      case StockStatus.lowStock:
        return 'Low Stock';
      case StockStatus.inStock:
        return 'In Stock';
    }
  }
  
  // Check if prescription is required
  bool get requiresPrescription {
    // This would typically be determined by medicine category or specific flag
    // For now, we'll use a simple heuristic based on category name
    if (category?.name.toLowerCase().contains('prescription') == true) {
      return true;
    }
    return false;
  }
  
  // Get formatted price
  String get formattedPrice => '\$${price.toStringAsFixed(2)}';
  
  // Get display unit
  String get displayUnit => unit ?? 'unit';
  
  // Get category name
  String get categoryName => category?.name ?? 'Uncategorized';
  
  // Check if medicine is expiring soon
  bool get isExpiringSoon {
    if (inventories == null || inventories!.isEmpty) return false;
    
    final now = DateTime.now();
    final thirtyDaysFromNow = now.add(const Duration(days: 30));
    
    return inventories!.any((inventory) {
      if (inventory.expiryDate == null) return false;
      return inventory.expiryDate!.isBefore(thirtyDaysFromNow) && 
             inventory.expiryDate!.isAfter(now);
    });
  }
  
  // Check if medicine has expired inventory
  bool get hasExpiredInventory {
    if (inventories == null || inventories!.isEmpty) return false;
    
    final now = DateTime.now();
    return inventories!.any((inventory) {
      if (inventory.expiryDate == null) return false;
      return inventory.expiryDate!.isBefore(now);
    });
  }
  
  // Get earliest expiry date
  DateTime? get earliestExpiryDate {
    if (inventories == null || inventories!.isEmpty) return null;
    
    final validInventories = inventories!
        .where((inventory) => inventory.expiryDate != null)
        .toList();
    
    if (validInventories.isEmpty) return null;
    
    validInventories.sort((a, b) => a.expiryDate!.compareTo(b.expiryDate!));
    return validInventories.first.expiryDate;
  }
  
  Medicine copyWith({
    int? id,
    String? name,
    String? slug,
    String? description,
    String? usage,
    String? dosage,
    String? sideEffects,
    String? sku,
    String? barcode,
    String? unit,
    double? price,
    int? minStock,
    Category? category,
    int? categoryId,
    List<InventoryItem>? inventories,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Medicine(
      id: id ?? this.id,
      name: name ?? this.name,
      slug: slug ?? this.slug,
      description: description ?? this.description,
      usage: usage ?? this.usage,
      dosage: dosage ?? this.dosage,
      sideEffects: sideEffects ?? this.sideEffects,
      sku: sku ?? this.sku,
      barcode: barcode ?? this.barcode,
      unit: unit ?? this.unit,
      price: price ?? this.price,
      minStock: minStock ?? this.minStock,
      category: category ?? this.category,
      categoryId: categoryId ?? this.categoryId,
      inventories: inventories ?? this.inventories,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

enum StockStatus {
  inStock,
  lowStock,
  outOfStock,
}

@JsonSerializable()
class MedicineSearchFilter {
  final String? search;
  final int? categoryId;
  final double? minPrice;
  final double? maxPrice;
  final bool? inStockOnly;
  final bool? prescriptionRequired;
  final String? sortBy;
  final String? sortOrder;
  
  const MedicineSearchFilter({
    this.search,
    this.categoryId,
    this.minPrice,
    this.maxPrice,
    this.inStockOnly,
    this.prescriptionRequired,
    this.sortBy,
    this.sortOrder,
  });
  
  factory MedicineSearchFilter.fromJson(Map<String, dynamic> json) => 
      _$MedicineSearchFilterFromJson(json);
  Map<String, dynamic> toJson() => _$MedicineSearchFilterToJson(this);
  
  MedicineSearchFilter copyWith({
    String? search,
    int? categoryId,
    double? minPrice,
    double? maxPrice,
    bool? inStockOnly,
    bool? prescriptionRequired,
    String? sortBy,
    String? sortOrder,
  }) {
    return MedicineSearchFilter(
      search: search ?? this.search,
      categoryId: categoryId ?? this.categoryId,
      minPrice: minPrice ?? this.minPrice,
      maxPrice: maxPrice ?? this.maxPrice,
      inStockOnly: inStockOnly ?? this.inStockOnly,
      prescriptionRequired: prescriptionRequired ?? this.prescriptionRequired,
      sortBy: sortBy ?? this.sortBy,
      sortOrder: sortOrder ?? this.sortOrder,
    );
  }
  
  bool get hasActiveFilters {
    return search?.isNotEmpty == true ||
           categoryId != null ||
           minPrice != null ||
           maxPrice != null ||
           inStockOnly == true ||
           prescriptionRequired != null;
  }
}