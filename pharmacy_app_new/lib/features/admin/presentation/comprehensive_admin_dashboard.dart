import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../../core/network/comprehensive_api_client.dart';
import '../../../shared/providers/auth_provider.dart';

class ComprehensiveAdminDashboard extends ConsumerStatefulWidget {
  const ComprehensiveAdminDashboard({Key? key}) : super(key: key);
  
  @override
  ConsumerState<ComprehensiveAdminDashboard> createState() => _ComprehensiveAdminDashboardState();
}

class _ComprehensiveAdminDashboardState extends ConsumerState<ComprehensiveAdminDashboard> {
  DashboardStats? _dashboardStats;
  bool _isLoading = true;
  String? _error;
  
  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }
  
  Future<void> _loadDashboardData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    
    try {
      // TODO: Replace with actual API call
      // final apiClient = ComprehensiveApiClient(DioClient.instance);
      // final response = await apiClient.getDashboardStats();
      
      // Mock data for now - replace with actual API response
      await Future.delayed(const Duration(seconds: 1));
      
      _dashboardStats = DashboardStats(
        totalOrders: 1247,
        totalRevenue: 45678.90,
        totalMedicines: 892,
        totalUsers: 156,
        recentOrders: [], // Mock recent orders
        lowStockMedicines: [], // Mock low stock medicines
        expiringMedicines: [], // Mock expiring medicines
        pendingPrescriptions: 23,
      );
      
      setState(() {
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }
  
  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Dashboard',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            Text(
              'Welcome back, ${user?.displayName ?? 'Admin'}',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.bell),
            onPressed: () {
              // TODO: Show notifications
            },
          ),
          IconButton(
            icon: const Icon(LucideIcons.settings),
            onPressed: () => context.go('/admin/settings'),
          ),
        ],
      ),
      body: _isLoading
        ? const Center(child: CircularProgressIndicator())
        : _error != null
          ? _buildErrorState()
          : _buildDashboardContent(),
    );
  }
  
  Widget _buildErrorState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            LucideIcons.alertTriangle,
            size: 64.sp,
            color: Colors.red,
          ),
          SizedBox(height: 16.h),
          Text(
            'Failed to load dashboard',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          SizedBox(height: 8.h),
          Text(
            _error!,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 24.h),
          ElevatedButton(
            onPressed: _loadDashboardData,
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }
  
  Widget _buildDashboardContent() {
    return RefreshIndicator(
      onRefresh: _loadDashboardData,
      child: SingleChildScrollView(
        padding: EdgeInsets.all(16.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Key Metrics Cards
            _buildKeyMetrics(),
            
            SizedBox(height: 24.h),
            
            // Alert Cards
            _buildAlertCards(),
            
            SizedBox(height: 24.h),
            
            // Charts Section
            _buildChartsSection(),
            
            SizedBox(height: 24.h),
            
            // Recent Activity
            _buildRecentActivity(),
            
            SizedBox(height: 24.h),
            
            // Quick Actions
            _buildQuickActions(),
          ],
        ),
      ),
    );
  }
  
  Widget _buildKeyMetrics() {
    final stats = _dashboardStats!;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Key Metrics',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        SizedBox(height: 16.h),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          crossAxisSpacing: 16.w,
          mainAxisSpacing: 16.h,
          childAspectRatio: 1.5,
          children: [
            _buildMetricCard(
              title: 'Total Revenue',
              value: '\$${stats.totalRevenue.toStringAsFixed(2)}',
              icon: LucideIcons.dollarSign,
              color: Colors.blue,
              trend: '+12.5%',
              trendUp: true,
            ),
            _buildMetricCard(
              title: 'Total Orders',
              value: '${stats.totalOrders}',
              icon: LucideIcons.shoppingCart,
              color: Colors.green,
              trend: '+8.2%',
              trendUp: true,
            ),
            _buildMetricCard(
              title: 'Medicines',
              value: '${stats.totalMedicines}',
              icon: LucideIcons.pill,
              color: Colors.purple,
              trend: '+2.1%',
              trendUp: true,
            ),
            _buildMetricCard(
              title: 'Users',
              value: '${stats.totalUsers}',
              icon: LucideIcons.users,
              color: Colors.orange,
              trend: '+15.3%',
              trendUp: true,
            ),
          ],
        ),
      ],
    );
  }
  
  Widget _buildMetricCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
    required String trend,
    required bool trendUp,
  }) {
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
                  child: Icon(
                    icon,
                    color: color,
                    size: 20.sp,
                  ),
                ),
                const Spacer(),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
                  decoration: BoxDecoration(
                    color: trendUp ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4.r),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        trendUp ? LucideIcons.trendingUp : LucideIcons.trendingDown,
                        size: 12.sp,
                        color: trendUp ? Colors.green : Colors.red,
                      ),
                      SizedBox(width: 2.w),
                      Text(
                        trend,
                        style: TextStyle(
                          fontSize: 10.sp,
                          color: trendUp ? Colors.green : Colors.red,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: 12.h),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
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
  
  Widget _buildAlertCards() {
    final stats = _dashboardStats!;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Alerts & Notifications',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        SizedBox(height: 16.h),
        Row(
          children: [
            Expanded(
              child: _buildAlertCard(
                title: 'Low Stock',
                count: stats.lowStockMedicines.length,
                subtitle: 'medicines need restocking',
                icon: LucideIcons.alertTriangle,
                color: Colors.red,
                onTap: () => context.go('/admin/medicines?tab=lowstock'),
              ),
            ),
            SizedBox(width: 16.w),
            Expanded(
              child: _buildAlertCard(
                title: 'Expiring Soon',
                count: stats.expiringMedicines.length,
                subtitle: 'medicines expiring',
                icon: LucideIcons.calendar,
                color: Colors.orange,
                onTap: () => context.go('/admin/medicines?tab=expiring'),
              ),
            ),
          ],
        ),
        SizedBox(height: 16.h),
        Row(
          children: [
            Expanded(
              child: _buildAlertCard(
                title: 'Pending Prescriptions',
                count: stats.pendingPrescriptions,
                subtitle: 'awaiting verification',
                icon: LucideIcons.fileText,
                color: Colors.blue,
                onTap: () => context.go('/admin/prescriptions'),
              ),
            ),
            SizedBox(width: 16.w),
            Expanded(
              child: _buildAlertCard(
                title: 'New Orders',
                count: 12, // Mock data
                subtitle: 'orders today',
                icon: LucideIcons.shoppingBag,
                color: Colors.green,
                onTap: () => context.go('/admin/orders'),
              ),
            ),
          ],
        ),
      ],
    );
  }
  
  Widget _buildAlertCard({
    required String title,
    required int count,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8.r),
        child: Container(
          padding: EdgeInsets.all(16.w),
          decoration: BoxDecoration(
            border: Border.all(color: color.withOpacity(0.2)),
            borderRadius: BorderRadius.circular(8.r),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(
                    icon,
                    color: color,
                    size: 20.sp,
                  ),
                  SizedBox(width: 8.w),
                  Expanded(
                    child: Text(
                      title,
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: color,
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 12.h),
              Text(
                '$count',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
              SizedBox(height: 4.h),
              Text(
                subtitle,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildChartsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Sales Analytics',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        SizedBox(height: 16.h),
        Card(
          child: Padding(
            padding: EdgeInsets.all(16.w),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      'Revenue Trend (Last 7 Days)',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const Spacer(),
                    TextButton(
                      onPressed: () => context.go('/admin/reports'),
                      child: const Text('View Details'),
                    ),
                  ],
                ),
                SizedBox(height: 16.h),
                SizedBox(
                  height: 200.h,
                  child: LineChart(
                    LineChartData(
                      gridData: FlGridData(show: false),
                      titlesData: FlTitlesData(
                        leftTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            reservedSize: 40.w,
                            getTitlesWidget: (value, meta) {
                              return Text(
                                '\$${(value / 1000).toStringAsFixed(0)}k',
                                style: TextStyle(fontSize: 10.sp),
                              );
                            },
                          ),
                        ),
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            getTitlesWidget: (value, meta) {
                              const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                              if (value.toInt() >= 0 && value.toInt() < days.length) {
                                return Text(
                                  days[value.toInt()],
                                  style: TextStyle(fontSize: 10.sp),
                                );
                              }
                              return const Text('');
                            },
                          ),
                        ),
                        rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
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
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
  
  Widget _buildRecentActivity() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              'Recent Activity',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const Spacer(),
            TextButton(
              onPressed: () => context.go('/admin/orders'),
              child: const Text('View All'),
            ),
          ],
        ),
        SizedBox(height: 16.h),
        Card(
          child: Column(
            children: [
              _buildActivityItem(
                icon: LucideIcons.shoppingCart,
                title: 'New order #1247',
                subtitle: 'John Doe - \$45.99',
                time: '2 minutes ago',
                color: Colors.green,
              ),
              _buildActivityItem(
                icon: LucideIcons.pill,
                title: 'Medicine added',
                subtitle: 'Paracetamol 500mg',
                time: '15 minutes ago',
                color: Colors.blue,
              ),
              _buildActivityItem(
                icon: LucideIcons.fileText,
                title: 'Prescription verified',
                subtitle: 'Patient: Jane Smith',
                time: '1 hour ago',
                color: Colors.purple,
              ),
              _buildActivityItem(
                icon: LucideIcons.alertTriangle,
                title: 'Low stock alert',
                subtitle: 'Aspirin - 5 units left',
                time: '2 hours ago',
                color: Colors.red,
              ),
            ],
          ),
        ),
      ],
    );
  }
  
  Widget _buildActivityItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required String time,
    required Color color,
  }) {
    return Padding(
      padding: EdgeInsets.all(16.w),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(8.w),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8.r),
            ),
            child: Icon(
              icon,
              color: color,
              size: 16.sp,
            ),
          ),
          SizedBox(width: 12.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                SizedBox(height: 2.h),
                Text(
                  subtitle,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          Text(
            time,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Colors.grey[500],
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildQuickActions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Quick Actions',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        SizedBox(height: 16.h),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          crossAxisSpacing: 16.w,
          mainAxisSpacing: 16.h,
          childAspectRatio: 2.5,
          children: [
            _buildQuickActionCard(
              title: 'POS System',
              icon: LucideIcons.scan,
              color: Colors.blue,
              onTap: () => context.go('/admin/pos'),
            ),
            _buildQuickActionCard(
              title: 'Add Medicine',
              icon: LucideIcons.plus,
              color: Colors.green,
              onTap: () => context.go('/admin/medicines/add'),
            ),
            _buildQuickActionCard(
              title: 'Manage Orders',
              icon: LucideIcons.package,
              color: Colors.orange,
              onTap: () => context.go('/admin/orders'),
            ),
            _buildQuickActionCard(
              title: 'View Reports',
              icon: LucideIcons.barChart3,
              color: Colors.purple,
              onTap: () => context.go('/admin/reports'),
            ),
          ],
        ),
      ],
    );
  }
  
  Widget _buildQuickActionCard({
    required String title,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8.r),
        child: Padding(
          padding: EdgeInsets.all(16.w),
          child: Row(
            children: [
              Container(
                padding: EdgeInsets.all(8.w),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8.r),
                ),
                child: Icon(
                  icon,
                  color: color,
                  size: 20.sp,
                ),
              ),
              SizedBox(width: 12.w),
              Expanded(
                child: Text(
                  title,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              Icon(
                LucideIcons.chevronRight,
                size: 16.sp,
                color: Colors.grey[400],
              ),
            ],
          ),
        ),
      ),
    );
  }
}