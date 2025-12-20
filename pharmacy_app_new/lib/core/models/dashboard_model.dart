import 'package:json_annotation/json_annotation.dart';

part 'dashboard_model.g.dart';

@JsonSerializable()
class DashboardStats {
  final int totalOrders;
  final int pendingOrders;
  final int completedOrders;
  final double totalRevenue;
  final double todayRevenue;
  final int totalMedicines;
  final int lowStockMedicines;
  final int outOfStockMedicines;
  final int expiringMedicines;
  final int totalCustomers;
  final int activeCustomers;
  final int totalPrescriptions;
  final int pendingPrescriptions;
  
  const DashboardStats({
    required this.totalOrders,
    required this.pendingOrders,
    required this.completedOrders,
    required this.totalRevenue,
    required this.todayRevenue,
    required this.totalMedicines,
    required this.lowStockMedicines,
    required this.outOfStockMedicines,
    required this.expiringMedicines,
    required this.totalCustomers,
    required this.activeCustomers,
    required this.totalPrescriptions,
    required this.pendingPrescriptions,
  });
  
  factory DashboardStats.fromJson(Map<String, dynamic> json) => _$DashboardStatsFromJson(json);
  Map<String, dynamic> toJson() => _$DashboardStatsToJson(this);
  
  // Get formatted total revenue
  String get formattedTotalRevenue => '\$${totalRevenue.toStringAsFixed(2)}';
  
  // Get formatted today revenue
  String get formattedTodayRevenue => '\$${todayRevenue.toStringAsFixed(2)}';
  
  // Get order completion rate
  double get orderCompletionRate {
    if (totalOrders == 0) return 0.0;
    return (completedOrders / totalOrders) * 100;
  }
  
  // Get stock health percentage
  double get stockHealthPercentage {
    if (totalMedicines == 0) return 100.0;
    final healthyStock = totalMedicines - lowStockMedicines - outOfStockMedicines;
    return (healthyStock / totalMedicines) * 100;
  }
  
  // Get customer activity rate
  double get customerActivityRate {
    if (totalCustomers == 0) return 0.0;
    return (activeCustomers / totalCustomers) * 100;
  }
  
  // Get prescription processing rate
  double get prescriptionProcessingRate {
    if (totalPrescriptions == 0) return 100.0;
    final processedPrescriptions = totalPrescriptions - pendingPrescriptions;
    return (processedPrescriptions / totalPrescriptions) * 100;
  }
}

@JsonSerializable()
class SalesChartData {
  final String date;
  final double sales;
  final int orders;
  
  const SalesChartData({
    required this.date,
    required this.sales,
    required this.orders,
  });
  
  factory SalesChartData.fromJson(Map<String, dynamic> json) => _$SalesChartDataFromJson(json);
  Map<String, dynamic> toJson() => _$SalesChartDataToJson(this);
  
  // Get formatted sales
  String get formattedSales => '\$${sales.toStringAsFixed(2)}';
  
  // Get average order value
  double get averageOrderValue {
    if (orders == 0) return 0.0;
    return sales / orders;
  }
  
  // Get formatted average order value
  String get formattedAverageOrderValue => '\$${averageOrderValue.toStringAsFixed(2)}';
}

@JsonSerializable()
class TopMedicine {
  final int id;
  final String name;
  final int totalSold;
  final double totalRevenue;
  final String? category;
  
  const TopMedicine({
    required this.id,
    required this.name,
    required this.totalSold,
    required this.totalRevenue,
    this.category,
  });
  
  factory TopMedicine.fromJson(Map<String, dynamic> json) => _$TopMedicineFromJson(json);
  Map<String, dynamic> toJson() => _$TopMedicineToJson(this);
  
  // Get formatted total revenue
  String get formattedTotalRevenue => '\$${totalRevenue.toStringAsFixed(2)}';
  
  // Get average price per unit
  double get averagePrice {
    if (totalSold == 0) return 0.0;
    return totalRevenue / totalSold;
  }
  
  // Get formatted average price
  String get formattedAveragePrice => '\$${averagePrice.toStringAsFixed(2)}';
}

@JsonSerializable()
class SalesReport {
  final String period;
  final DateTime startDate;
  final DateTime endDate;
  final double totalSales;
  final int totalOrders;
  final int totalItems;
  final double averageOrderValue;
  final List<SalesChartData> dailySales;
  final List<TopMedicine> topMedicines;
  final Map<String, double> salesByCategory;
  
  const SalesReport({
    required this.period,
    required this.startDate,
    required this.endDate,
    required this.totalSales,
    required this.totalOrders,
    required this.totalItems,
    required this.averageOrderValue,
    required this.dailySales,
    required this.topMedicines,
    required this.salesByCategory,
  });
  
  factory SalesReport.fromJson(Map<String, dynamic> json) => _$SalesReportFromJson(json);
  Map<String, dynamic> toJson() => _$SalesReportToJson(this);
  
  // Get formatted total sales
  String get formattedTotalSales => '\$${totalSales.toStringAsFixed(2)}';
  
  // Get formatted average order value
  String get formattedAverageOrderValue => '\$${averageOrderValue.toStringAsFixed(2)}';
  
  // Get formatted period
  String get formattedPeriod {
    final start = '${startDate.day}/${startDate.month}/${startDate.year}';
    final end = '${endDate.day}/${endDate.month}/${endDate.year}';
    return '$start - $end';
  }
  
  // Get average items per order
  double get averageItemsPerOrder {
    if (totalOrders == 0) return 0.0;
    return totalItems / totalOrders;
  }
}

@JsonSerializable()
class InventoryReport {
  final int totalMedicines;
  final int totalStock;
  final double totalValue;
  final int lowStockCount;
  final int outOfStockCount;
  final int expiringCount;
  final int expiredCount;
  final List<InventoryReportItem> items;
  
  const InventoryReport({
    required this.totalMedicines,
    required this.totalStock,
    required this.totalValue,
    required this.lowStockCount,
    required this.outOfStockCount,
    required this.expiringCount,
    required this.expiredCount,
    required this.items,
  });
  
  factory InventoryReport.fromJson(Map<String, dynamic> json) => _$InventoryReportFromJson(json);
  Map<String, dynamic> toJson() => _$InventoryReportToJson(this);
  
  // Get formatted total value
  String get formattedTotalValue => '\$${totalValue.toStringAsFixed(2)}';
  
  // Get stock health percentage
  double get stockHealthPercentage {
    if (totalMedicines == 0) return 100.0;
    final healthyStock = totalMedicines - lowStockCount - outOfStockCount;
    return (healthyStock / totalMedicines) * 100;
  }
  
  // Get expiry risk percentage
  double get expiryRiskPercentage {
    if (totalMedicines == 0) return 0.0;
    return ((expiringCount + expiredCount) / totalMedicines) * 100;
  }
}

@JsonSerializable()
class InventoryReportItem {
  final int id;
  final String name;
  final String category;
  final int currentStock;
  final int minStock;
  final double unitPrice;
  final double totalValue;
  final String status;
  final DateTime? nearestExpiry;
  
  const InventoryReportItem({
    required this.id,
    required this.name,
    required this.category,
    required this.currentStock,
    required this.minStock,
    required this.unitPrice,
    required this.totalValue,
    required this.status,
    this.nearestExpiry,
  });
  
  factory InventoryReportItem.fromJson(Map<String, dynamic> json) => _$InventoryReportItemFromJson(json);
  Map<String, dynamic> toJson() => _$InventoryReportItemToJson(this);
  
  // Get formatted unit price
  String get formattedUnitPrice => '\$${unitPrice.toStringAsFixed(2)}';
  
  // Get formatted total value
  String get formattedTotalValue => '\$${totalValue.toStringAsFixed(2)}';
  
  // Get status color
  String get statusColor {
    switch (status.toLowerCase()) {
      case 'in_stock':
        return '#4CAF50'; // Green
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
  
  // Get formatted nearest expiry
  String get formattedNearestExpiry {
    if (nearestExpiry == null) return 'No expiry date';
    return '${nearestExpiry!.day}/${nearestExpiry!.month}/${nearestExpiry!.year}';
  }
}