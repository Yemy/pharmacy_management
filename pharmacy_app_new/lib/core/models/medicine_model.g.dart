// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'medicine_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Medicine _$MedicineFromJson(Map<String, dynamic> json) => Medicine(
      id: (json['id'] as num).toInt(),
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
      minStock: (json['minStock'] as num).toInt(),
      category: json['category'] == null
          ? null
          : Category.fromJson(json['category'] as Map<String, dynamic>),
      categoryId: (json['categoryId'] as num?)?.toInt(),
      inventories: (json['inventories'] as List<dynamic>?)
          ?.map((e) => InventoryItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$MedicineToJson(Medicine instance) => <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'slug': instance.slug,
      'description': instance.description,
      'usage': instance.usage,
      'dosage': instance.dosage,
      'sideEffects': instance.sideEffects,
      'sku': instance.sku,
      'barcode': instance.barcode,
      'unit': instance.unit,
      'price': instance.price,
      'minStock': instance.minStock,
      'category': instance.category,
      'categoryId': instance.categoryId,
      'inventories': instance.inventories,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
    };

MedicineSearchFilter _$MedicineSearchFilterFromJson(
        Map<String, dynamic> json) =>
    MedicineSearchFilter(
      search: json['search'] as String?,
      categoryId: (json['categoryId'] as num?)?.toInt(),
      minPrice: (json['minPrice'] as num?)?.toDouble(),
      maxPrice: (json['maxPrice'] as num?)?.toDouble(),
      inStockOnly: json['inStockOnly'] as bool?,
      prescriptionRequired: json['prescriptionRequired'] as bool?,
      sortBy: json['sortBy'] as String?,
      sortOrder: json['sortOrder'] as String?,
    );

Map<String, dynamic> _$MedicineSearchFilterToJson(
        MedicineSearchFilter instance) =>
    <String, dynamic>{
      'search': instance.search,
      'categoryId': instance.categoryId,
      'minPrice': instance.minPrice,
      'maxPrice': instance.maxPrice,
      'inStockOnly': instance.inStockOnly,
      'prescriptionRequired': instance.prescriptionRequired,
      'sortBy': instance.sortBy,
      'sortOrder': instance.sortOrder,
    };
