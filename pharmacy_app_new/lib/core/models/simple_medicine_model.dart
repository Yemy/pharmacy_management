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
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory Medicine.fromJson(Map<String, dynamic> json) => Medicine(
    id: json['id'] as int,
    name: json['name'] as String,
    slug: json['slug'] as String,
    description: json['description'] as String?,
    usage: json['usage'] as String?,
    dosage: json['dosage'] as String?,
    sideEffects: json['sideEffects'] as String?,
    sku: json['sku'] as String?,
    barcode: json['barcode'] as String?,
    unit: json['unit'] as String?,
    price: (json['price'] as num).toDouble(),
    minStock: json['minStock'] as int,
    category: json['category'] != null ? Category.fromJson(json['category'] as Map<String, dynamic>) : null,
    categoryId: json['categoryId'] as int?,
    createdAt: DateTime.parse(json['createdAt'] as String),
    updatedAt: DateTime.parse(json['updatedAt'] as String),
  );
  
  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'slug': slug,
    if (description != null) 'description': description,
    if (usage != null) 'usage': usage,
    if (dosage != null) 'dosage': dosage,
    if (sideEffects != null) 'sideEffects': sideEffects,
    if (sku != null) 'sku': sku,
    if (barcode != null) 'barcode': barcode,
    if (unit != null) 'unit': unit,
    'price': price,
    'minStock': minStock,
    if (category != null) 'category': category!.toJson(),
    if (categoryId != null) 'categoryId': categoryId,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
  };
  
  String get formattedPrice => '\$${price.toStringAsFixed(2)}';
  String get categoryName => category?.name ?? 'Uncategorized';
  bool get isInStock => true; // Mock implementation
  bool get requiresPrescription => false; // Mock implementation
}

class Category {
  final int id;
  final String name;
  final String slug;
  final String? description;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  const Category({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory Category.fromJson(Map<String, dynamic> json) => Category(
    id: json['id'] as int,
    name: json['name'] as String,
    slug: json['slug'] as String,
    description: json['description'] as String?,
    createdAt: DateTime.parse(json['createdAt'] as String),
    updatedAt: DateTime.parse(json['updatedAt'] as String),
  );
  
  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'slug': slug,
    if (description != null) 'description': description,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
  };
}