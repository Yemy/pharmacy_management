// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'dashboard_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

DashboardStats _$DashboardStatsFromJson(Map<String, dynamic> json) =>
    DashboardStats(
      totalOrders: (json['totalOrders'] as num).toInt(),
      pendingOrders: (json['pendingOrders'] as num).toInt(),
      completedOrders: (json['completedOrders'] as num).toInt(),
      totalRevenue: (json['totalRevenue'] as num).toDouble(),
      todayRevenue: (json['todayRevenue'] as num).toDouble(),
      totalMedicines: (json['totalMedicines'] as num).toInt(),
      lowStockMedicines: (json['lowStockMedicines'] as num).toInt(),
      outOfStockMedicines: (json['outOfStockMedicines'] as num).toInt(),
      expiringMedicines: (json['expiringMedicines'] as num).toInt(),
      totalCustomers: (json['totalCustomers'] as num).toInt(),
      activeCustomers: (json['activeCustomers'] as num).toInt(),
      totalPrescriptions: (json['totalPrescriptions'] as num).toInt(),
      pendingPrescriptions: (json['pendingPrescriptions'] as num).toInt(),
    );

Map<String, dynamic> _$DashboardStatsToJson(DashboardStats instance) =>
    <String, dynamic>{
      'totalOrders': instance.totalOrders,
      'pendingOrders': instance.pendingOrders,
      'completedOrders': instance.completedOrders,
      'totalRevenue': instance.totalRevenue,
      'todayRevenue': instance.todayRevenue,
      'totalMedicines': instance.totalMedicines,
      'lowStockMedicines': instance.lowStockMedicines,
      'outOfStockMedicines': instance.outOfStockMedicines,
      'expiringMedicines': instance.expiringMedicines,
      'totalCustomers': instance.totalCustomers,
      'activeCustomers': instance.activeCustomers,
      'totalPrescriptions': instance.totalPrescriptions,
      'pendingPrescriptions': instance.pendingPrescriptions,
    };

SalesChartData _$SalesChartDataFromJson(Map<String, dynamic> json) =>
    SalesChartData(
      date: json['date'] as String,
      sales: (json['sales'] as num).toDouble(),
      orders: (json['orders'] as num).toInt(),
    );

Map<String, dynamic> _$SalesChartDataToJson(SalesChartData instance) =>
    <String, dynamic>{
      'date': instance.date,
      'sales': instance.sales,
      'orders': instance.orders,
    };

TopMedicine _$TopMedicineFromJson(Map<String, dynamic> json) => TopMedicine(
      id: (json['id'] as num).toInt(),
      name: json['name'] as String,
      totalSold: (json['totalSold'] as num).toInt(),
      totalRevenue: (json['totalRevenue'] as num).toDouble(),
      category: json['category'] as String?,
    );

Map<String, dynamic> _$TopMedicineToJson(TopMedicine instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'totalSold': instance.totalSold,
      'totalRevenue': instance.totalRevenue,
      'category': instance.category,
    };

SalesReport _$SalesReportFromJson(Map<String, dynamic> json) => SalesReport(
      period: json['period'] as String,
      startDate: DateTime.parse(json['startDate'] as String),
      endDate: DateTime.parse(json['endDate'] as String),
      totalSales: (json['totalSales'] as num).toDouble(),
      totalOrders: (json['totalOrders'] as num).toInt(),
      totalItems: (json['totalItems'] as num).toInt(),
      averageOrderValue: (json['averageOrderValue'] as num).toDouble(),
      dailySales: (json['dailySales'] as List<dynamic>)
          .map((e) => SalesChartData.fromJson(e as Map<String, dynamic>))
          .toList(),
      topMedicines: (json['topMedicines'] as List<dynamic>)
          .map((e) => TopMedicine.fromJson(e as Map<String, dynamic>))
          .toList(),
      salesByCategory: (json['salesByCategory'] as Map<String, dynamic>).map(
        (k, e) => MapEntry(k, (e as num).toDouble()),
      ),
    );

Map<String, dynamic> _$SalesReportToJson(SalesReport instance) =>
    <String, dynamic>{
      'period': instance.period,
      'startDate': instance.startDate.toIso8601String(),
      'endDate': instance.endDate.toIso8601String(),
      'totalSales': instance.totalSales,
      'totalOrders': instance.totalOrders,
      'totalItems': instance.totalItems,
      'averageOrderValue': instance.averageOrderValue,
      'dailySales': instance.dailySales,
      'topMedicines': instance.topMedicines,
      'salesByCategory': instance.salesByCategory,
    };

InventoryReport _$InventoryReportFromJson(Map<String, dynamic> json) =>
    InventoryReport(
      totalMedicines: (json['totalMedicines'] as num).toInt(),
      totalStock: (json['totalStock'] as num).toInt(),
      totalValue: (json['totalValue'] as num).toDouble(),
      lowStockCount: (json['lowStockCount'] as num).toInt(),
      outOfStockCount: (json['outOfStockCount'] as num).toInt(),
      expiringCount: (json['expiringCount'] as num).toInt(),
      expiredCount: (json['expiredCount'] as num).toInt(),
      items: (json['items'] as List<dynamic>)
          .map((e) => InventoryReportItem.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$InventoryReportToJson(InventoryReport instance) =>
    <String, dynamic>{
      'totalMedicines': instance.totalMedicines,
      'totalStock': instance.totalStock,
      'totalValue': instance.totalValue,
      'lowStockCount': instance.lowStockCount,
      'outOfStockCount': instance.outOfStockCount,
      'expiringCount': instance.expiringCount,
      'expiredCount': instance.expiredCount,
      'items': instance.items,
    };

InventoryReportItem _$InventoryReportItemFromJson(Map<String, dynamic> json) =>
    InventoryReportItem(
      id: (json['id'] as num).toInt(),
      name: json['name'] as String,
      category: json['category'] as String,
      currentStock: (json['currentStock'] as num).toInt(),
      minStock: (json['minStock'] as num).toInt(),
      unitPrice: (json['unitPrice'] as num).toDouble(),
      totalValue: (json['totalValue'] as num).toDouble(),
      status: json['status'] as String,
      nearestExpiry: json['nearestExpiry'] == null
          ? null
          : DateTime.parse(json['nearestExpiry'] as String),
    );

Map<String, dynamic> _$InventoryReportItemToJson(
        InventoryReportItem instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'category': instance.category,
      'currentStock': instance.currentStock,
      'minStock': instance.minStock,
      'unitPrice': instance.unitPrice,
      'totalValue': instance.totalValue,
      'status': instance.status,
      'nearestExpiry': instance.nearestExpiry?.toIso8601String(),
    };
