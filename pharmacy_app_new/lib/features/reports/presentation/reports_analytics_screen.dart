import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';

class ReportsAnalyticsScreen extends ConsumerStatefulWidget {
  const ReportsAnalyticsScreen({Key? key}) : super(key: key);
  
  @override
  ConsumerState<ReportsAnalyticsScreen> createState() => _ReportsAnalyticsScreenState();
}

class _ReportsAnalyticsScreenState extends ConsumerState<ReportsAnalyticsScreen> {
  String _selectedPeriod = '7days';
  String _selectedReport = 'sales';
  bool _isLoading = false;
  
  final List<String> _periods = ['7days', '30days', '90days', '1year'];
  final List<String> _reportTypes = ['sales', 'inventory', 'customers', 'medicines'];
  
  @override
  void initState() {
    super.initState();
    _loadReportData();
  }
  
  Future<void> _loadReportData() async {
    setState(() => _isLoading = true);
    
    try {
      // TODO: Load actual report data from API
      await Future.delayed(const Duration(seconds: 1));
      setState(() => _isLoading = false);
    } catch (e) {
      setState(() => _isLoading = false);
      _showErrorSnackBar('Failed to load report data: ${e.toString()}');
    }
  }
  
  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Reports & Analytics'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.download),
            onPressed: _exportReport,
          ),
        ],
      ),
      body: Column(
        children: [
          // Filters
          _buildFilters(),
          
          // Content
          Expanded(
            child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _buildReportContent(),
          ),
        ],
      ),
    );
  }
  
  Widget _buildFilters() {
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        border: Border(bottom: BorderSide(color: Colors.grey[300]!)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _selectedReport,
                  decoration: const InputDecoration(labelText: 'Report Type'),
                  items: _reportTypes.map((type) => DropdownMenuItem(
                    value: type,
                    child: Text(_getReportTypeLabel(type)),
                  )).toList(),
                  onChanged: (value) {
                    setState(() => _selectedReport = value!);
                    _loadReportData();
                  },
                ),
              ),
              SizedBox(width: 16.w),
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _selectedPeriod,
                  decoration: const InputDecoration(labelText: 'Time Period'),
                  items: _periods.map((period) => DropdownMenuItem(
                    value: period,
                    child: Text(_getPeriodLabel(period)),
                  )).toList(),
                  onChanged: (value) {
                    setState(() => _selectedPeriod = value!);
                    _loadReportData();
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
  
  Widget _buildReportContent() {
    switch (_selectedReport) {
      case 'sales':
        return _buildSalesReport();
      case 'inventory':
        return _buildInventoryReport();
      case 'customers':
        return _buildCustomersReport();
      case 'medicines':
        return _buildMedicinesReport();
      default:
        return _buildSalesReport();
    }
  }
  
  Widget _buildSalesReport() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(16.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Summary Cards
          Row(
            children: [
              Expanded(child: _buildSummaryCard('Total Sales', '\$12,450', Colors.blue, LucideIcons.dollarSign)),
              SizedBox(width: 16.w),
              Expanded(child: _buildSummaryCard('Orders', '245', Colors.green, LucideIcons.shoppingCart)),
            ],
          ),
          
          SizedBox(height: 16.h),
          
          Row(
            children: [
              Expanded(child: _buildSummaryCard('Avg Order', '\$50.82', Colors.orange, LucideIcons.trendingUp)),
              SizedBox(width: 16.w),
              Expanded(child: _buildSummaryCard('Growth', '+15.3%', Colors.purple, LucideIcons.barChart3)),
            ],
          ),
          
          SizedBox(height: 24.h),
          
          // Sales Chart
          Card(
            child: Padding(
              padding: EdgeInsets.all(16.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Sales Trend',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  SizedBox(height: 16.h),
                  SizedBox(
                    height: 200.h,
                    child: LineChart(_buildSalesLineChart()),
                  ),
                ],
              ),
            ),
          ),
          
          SizedBox(height: 16.h),
          
          // Top Products
          Card(
            child: Padding(
              padding: EdgeInsets.all(16.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Top Selling Products',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  SizedBox(height: 16.h),
                  ...List.generate(5, (index) => _buildTopProductItem(
                    'Medicine ${index + 1}',
                    '${150 - (index * 20)} units',
                    '\$${(1500 - (index * 200)).toStringAsFixed(2)}',
                  )),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildInventoryReport() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(16.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Summary Cards
          Row(
            children: [
              Expanded(child: _buildSummaryCard('Total Items', '892', Colors.blue, LucideIcons.package)),
              SizedBox(width: 16.w),
              Expanded(child: _buildSummaryCard('Low Stock', '23', Colors.red, LucideIcons.alertTriangle)),
            ],
          ),
          
          SizedBox(height: 16.h),
          
          Row(
            children: [
              Expanded(child: _buildSummaryCard('Expiring Soon', '12', Colors.orange, LucideIcons.calendar)),
              SizedBox(width: 16.w),
              Expanded(child: _buildSummaryCard('Total Value', '\$45,230', Colors.green, LucideIcons.dollarSign)),
            ],
          ),
          
          SizedBox(height: 24.h),
          
          // Inventory Status Chart
          Card(
            child: Padding(
              padding: EdgeInsets.all(16.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Inventory Status',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  SizedBox(height: 16.h),
                  SizedBox(
                    height: 200.h,
                    child: PieChart(_buildInventoryPieChart()),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildCustomersReport() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(16.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Summary Cards
          Row(
            children: [
              Expanded(child: _buildSummaryCard('Total Customers', '1,245', Colors.blue, LucideIcons.users)),
              SizedBox(width: 16.w),
              Expanded(child: _buildSummaryCard('New Customers', '89', Colors.green, LucideIcons.userPlus)),
            ],
          ),
          
          SizedBox(height: 16.h),
          
          Row(
            children: [
              Expanded(child: _buildSummaryCard('Avg Spend', '\$125.50', Colors.orange, LucideIcons.dollarSign)),
              SizedBox(width: 16.w),
              Expanded(child: _buildSummaryCard('Retention', '78%', Colors.purple, LucideIcons.repeat)),
            ],
          ),
          
          SizedBox(height: 24.h),
          
          // Customer Growth Chart
          Card(
            child: Padding(
              padding: EdgeInsets.all(16.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Customer Growth',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  SizedBox(height: 16.h),
                  SizedBox(
                    height: 200.h,
                    child: BarChart(_buildCustomerBarChart()),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildMedicinesReport() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(16.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Summary Cards
          Row(
            children: [
              Expanded(child: _buildSummaryCard('Total Medicines', '892', Colors.blue, LucideIcons.pill)),
              SizedBox(width: 16.w),
              Expanded(child: _buildSummaryCard('Categories', '15', Colors.green, LucideIcons.grid3x3)),
            ],
          ),
          
          SizedBox(height: 16.h),
          
          Row(
            children: [
              Expanded(child: _buildSummaryCard('Most Popular', 'Paracetamol', Colors.orange, LucideIcons.star)),
              SizedBox(width: 16.w),
              Expanded(child: _buildSummaryCard('Avg Price', '\$12.45', Colors.purple, LucideIcons.dollarSign)),
            ],
          ),
          
          SizedBox(height: 24.h),
          
          // Category Distribution
          Card(
            child: Padding(
              padding: EdgeInsets.all(16.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Category Distribution',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  SizedBox(height: 16.h),
                  ...List.generate(5, (index) => _buildCategoryItem(
                    'Category ${index + 1}',
                    '${150 - (index * 20)} medicines',
                    (80 - (index * 10)) / 100,
                  )),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildSummaryCard(String title, String value, Color color, IconData icon) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: EdgeInsets.all(8.w),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8.r),
                  ),
                  child: Icon(icon, color: color, size: 20.sp),
                ),
                const Spacer(),
                Icon(LucideIcons.trendingUp, size: 16.sp, color: Colors.green),
              ],
            ),
            SizedBox(height: 12.h),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            SizedBox(height: 4.h),
            Text(
              title,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildTopProductItem(String name, String quantity, String revenue) {
    return Padding(
      padding: EdgeInsets.only(bottom: 12.h),
      child: Row(
        children: [
          Container(
            width: 40.w,
            height: 40.w,
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(8.r),
            ),
            child: Icon(LucideIcons.pill, color: Colors.grey[400]),
          ),
          SizedBox(width: 12.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.w600)),
                Text(quantity, style: TextStyle(color: Colors.grey[600], fontSize: 12.sp)),
              ],
            ),
          ),
          Text(
            revenue,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: Theme.of(context).primaryColor,
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildCategoryItem(String name, String count, double percentage) {
    return Padding(
      padding: EdgeInsets.only(bottom: 12.h),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(name, style: const TextStyle(fontWeight: FontWeight.w600)),
              Text(count, style: TextStyle(color: Colors.grey[600])),
            ],
          ),
          SizedBox(height: 4.h),
          LinearProgressIndicator(
            value: percentage,
            backgroundColor: Colors.grey[200],
            valueColor: AlwaysStoppedAnimation<Color>(Theme.of(context).primaryColor),
          ),
        ],
      ),
    );
  }
  
  LineChartData _buildSalesLineChart() {
    return LineChartData(
      gridData: FlGridData(show: false),
      titlesData: FlTitlesData(
        leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
        rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
        topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
        bottomTitles: AxisTitles(
          sideTitles: SideTitles(
            showTitles: true,
            getTitlesWidget: (value, meta) {
              const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
              if (value.toInt() >= 0 && value.toInt() < days.length) {
                return Text(days[value.toInt()], style: TextStyle(fontSize: 10.sp));
              }
              return const Text('');
            },
          ),
        ),
      ),
      borderData: FlBorderData(show: false),
      lineBarsData: [
        LineChartBarData(
          spots: [
            const FlSpot(0, 3000),
            const FlSpot(1, 4500),
            const FlSpot(2, 3800),
            const FlSpot(3, 5200),
            const FlSpot(4, 4800),
            const FlSpot(5, 6100),
            const FlSpot(6, 5500),
          ],
          isCurved: true,
          color: Theme.of(context).primaryColor,
          barWidth: 3,
          dotData: FlDotData(show: false),
          belowBarData: BarAreaData(
            show: true,
            color: Theme.of(context).primaryColor.withOpacity(0.1),
          ),
        ),
      ],
    );
  }
  
  PieChartData _buildInventoryPieChart() {
    return PieChartData(
      sections: [
        PieChartSectionData(
          value: 70,
          title: 'In Stock',
          color: Colors.green,
          radius: 60,
        ),
        PieChartSectionData(
          value: 20,
          title: 'Low Stock',
          color: Colors.orange,
          radius: 60,
        ),
        PieChartSectionData(
          value: 10,
          title: 'Out of Stock',
          color: Colors.red,
          radius: 60,
        ),
      ],
    );
  }
  
  BarChartData _buildCustomerBarChart() {
    return BarChartData(
      alignment: BarChartAlignment.spaceAround,
      maxY: 100,
      barTouchData: BarTouchData(enabled: false),
      titlesData: FlTitlesData(
        leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
        rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
        topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
        bottomTitles: AxisTitles(
          sideTitles: SideTitles(
            showTitles: true,
            getTitlesWidget: (value, meta) {
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
              if (value.toInt() >= 0 && value.toInt() < months.length) {
                return Text(months[value.toInt()], style: TextStyle(fontSize: 10.sp));
              }
              return const Text('');
            },
          ),
        ),
      ),
      borderData: FlBorderData(show: false),
      barGroups: List.generate(6, (index) => BarChartGroupData(
        x: index,
        barRods: [
          BarChartRodData(
            toY: 20 + (index * 10).toDouble(),
            color: Theme.of(context).primaryColor,
            width: 20,
            borderRadius: BorderRadius.circular(4),
          ),
        ],
      )),
    );
  }
  
  String _getReportTypeLabel(String type) {
    switch (type) {
      case 'sales':
        return 'Sales Report';
      case 'inventory':
        return 'Inventory Report';
      case 'customers':
        return 'Customer Report';
      case 'medicines':
        return 'Medicine Report';
      default:
        return type;
    }
  }
  
  String _getPeriodLabel(String period) {
    switch (period) {
      case '7days':
        return 'Last 7 Days';
      case '30days':
        return 'Last 30 Days';
      case '90days':
        return 'Last 90 Days';
      case '1year':
        return 'Last Year';
      default:
        return period;
    }
  }
  
  void _exportReport() {
    // TODO: Implement report export functionality
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Export functionality coming soon!'),
        backgroundColor: Colors.blue,
      ),
    );
  }
}