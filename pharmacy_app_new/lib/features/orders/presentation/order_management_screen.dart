import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';

import '../../../core/network/comprehensive_api_client.dart';
import '../../../core/models/simple_user_model.dart';

class OrderManagementScreen extends ConsumerStatefulWidget {
  const OrderManagementScreen({Key? key}) : super(key: key);
  
  @override
  ConsumerState<OrderManagementScreen> createState() => _OrderManagementScreenState();
}

class _OrderManagementScreenState extends ConsumerState<OrderManagementScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<Order> _orders = [];
  bool _isLoading = false;
  String _selectedStatus = 'all';
  
  final List<String> _statuses = ['PENDING', 'PAID', 'PACKED', 'DELIVERED', 'CANCELLED'];
  
  @override
  void initState() {
    super.initState();
    _loadOrders();
  }
  
  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
  
  Future<void> _loadOrders() async {
    setState(() => _isLoading = true);
    
    try {
      // TODO: Load from API
      // Mock data for now
      _orders = List.generate(20, (index) {
        final user = User(
          id: index + 1,
          email: 'user${index + 1}@example.com',
          name: 'User ${index + 1}',
          role: 'CUSTOMER',
        );
        
        final items = [
          OrderItem(
            id: index * 2 + 1,
            quantity: 2,
            price: 10.0,
            medicine: Medicine(
              id: 1,
              name: 'Paracetamol 500mg',
              slug: 'paracetamol',
              price: 5.0,
              totalStock: 100,
              category: null,
            ),
          ),
          OrderItem(
            id: index * 2 + 2,
            quantity: 1,
            price: 15.0,
            medicine: Medicine(
              id: 2,
              name: 'Amoxicillin 250mg',
              slug: 'amoxicillin',
              price: 15.0,
              totalStock: 50,
              category: null,
            ),
          ),
        ];
        
        return Order(
          id: index + 1,
          status: _statuses[index % _statuses.length],
          total: 25.0 + (index * 5),
          user: user,
          items: items,
          createdAt: DateTime.now().subtract(Duration(days: index)),
        );
      });
      
      setState(() => _isLoading = false);
    } catch (e) {
      setState(() => _isLoading = false);
      _showErrorSnackBar('Failed to load orders: ${e.toString()}');
    }
  }
  
  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
  }
  
  void _showSuccessSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.green),
    );
  }
  
  List<Order> get _filteredOrders {
    var filtered = _orders;
    
    // Filter by status
    if (_selectedStatus != 'all') {
      filtered = filtered.where((order) => order.status == _selectedStatus).toList();
    }
    
    // Filter by search
    if (_searchController.text.isNotEmpty) {
      final query = _searchController.text.toLowerCase();
      filtered = filtered.where((order) =>
        order.id.toString().contains(query) ||
        order.user.name.toLowerCase().contains(query) ||
        order.user.email.toLowerCase().contains(query)
      ).toList();
    }
    
    return filtered..sort((a, b) => b.createdAt.compareTo(a.createdAt));
  }
  
  Color _getStatusColor(String status) {
    switch (status) {
      case 'PENDING':
        return Colors.orange;
      case 'PAID':
        return Colors.blue;
      case 'PACKED':
        return Colors.purple;
      case 'DELIVERED':
        return Colors.green;
      case 'CANCELLED':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
  
  IconData _getStatusIcon(String status) {
    switch (status) {
      case 'PENDING':
        return LucideIcons.clock;
      case 'PAID':
        return LucideIcons.creditCard;
      case 'PACKED':
        return LucideIcons.package;
      case 'DELIVERED':
        return LucideIcons.checkCircle;
      case 'CANCELLED':
        return LucideIcons.xCircle;
      default:
        return LucideIcons.circle;
    }
  }
  
  Future<void> _updateOrderStatus(Order order, String newStatus) async {
    try {
      // TODO: Update via API
      setState(() {
        final index = _orders.indexWhere((o) => o.id == order.id);
        if (index != -1) {
          _orders[index] = Order(
            id: order.id,
            status: newStatus,
            total: order.total,
            user: order.user,
            items: order.items,
            createdAt: order.createdAt,
          );
        }
      });
      _showSuccessSnackBar('Order status updated to $newStatus');
    } catch (e) {
      _showErrorSnackBar('Failed to update order status: ${e.toString()}');
    }
  }
  
  void _showOrderDetails(Order order) {
    showDialog(
      context: context,
      builder: (context) => OrderDetailsDialog(order: order),
    );
  }
  
  void _showStatusUpdateDialog(Order order) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Update Order #${order.id}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Current Status: ${order.status}'),
            SizedBox(height: 16.h),
            Text('Select new status:'),
            SizedBox(height: 8.h),
            ..._statuses.map((status) => ListTile(
              title: Text(status),
              leading: Icon(_getStatusIcon(status), color: _getStatusColor(status)),
              onTap: () {
                Navigator.of(context).pop();
                _updateOrderStatus(order, status);
              },
            )),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Order Management'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw),
            onPressed: _loadOrders,
          ),
        ],
      ),
      body: Column(
        children: [
          // Search and Filter
          Padding(
            padding: EdgeInsets.all(16.w),
            child: Column(
              children: [
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search orders by ID, customer name or email...',
                    prefixIcon: const Icon(LucideIcons.search),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.r),
                    ),
                  ),
                  onChanged: (value) => setState(() {}),
                ),
                SizedBox(height: 12.h),
                DropdownButtonFormField<String>(
                  value: _selectedStatus,
                  decoration: InputDecoration(
                    labelText: 'Filter by Status',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.r),
                    ),
                  ),
                  items: [
                    const DropdownMenuItem(value: 'all', child: Text('All Orders')),
                    ..._statuses.map((status) => DropdownMenuItem(
                      value: status,
                      child: Row(
                        children: [
                          Icon(_getStatusIcon(status), size: 16, color: _getStatusColor(status)),
                          SizedBox(width: 8.w),
                          Text(status),
                        ],
                      ),
                    )),
                  ],
                  onChanged: (value) => setState(() => _selectedStatus = value!),
                ),
              ],
            ),
          ),
          
          // Orders List
          Expanded(
            child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _filteredOrders.isEmpty
                ? _buildEmptyState()
                : ListView.builder(
                    padding: EdgeInsets.all(16.w),
                    itemCount: _filteredOrders.length,
                    itemBuilder: (context, index) {
                      final order = _filteredOrders[index];
                      return _buildOrderCard(order);
                    },
                  ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.shoppingCart, size: 64.sp, color: Colors.grey[400]),
          SizedBox(height: 16.h),
          Text(
            'No orders found',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildOrderCard(Order order) {
    final statusColor = _getStatusColor(order.status);
    final statusIcon = _getStatusIcon(order.status);
    
    return Card(
      margin: EdgeInsets.only(bottom: 12.h),
      child: Padding(
        padding: EdgeInsets.all(16.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  'Order #${order.id}',
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 16,
                  ),
                ),
                const Spacer(),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4.r),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(statusIcon, size: 12.sp, color: statusColor),
                      SizedBox(width: 4.w),
                      Text(
                        order.status,
                        style: TextStyle(
                          color: statusColor,
                          fontSize: 12.sp,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            
            SizedBox(height: 8.h),
            
            Row(
              children: [
                Icon(LucideIcons.user, size: 16.sp, color: Colors.grey[600]),
                SizedBox(width: 4.w),
                Expanded(
                  child: Text(
                    '${order.user.name} (${order.user.email})',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                ),
              ],
            ),
            
            SizedBox(height: 4.h),
            
            Row(
              children: [
                Icon(LucideIcons.calendar, size: 16.sp, color: Colors.grey[600]),
                SizedBox(width: 4.w),
                Text(
                  DateFormat('MMM dd, yyyy - HH:mm').format(order.createdAt),
                  style: TextStyle(color: Colors.grey[600]),
                ),
                const Spacer(),
                Text(
                  '\$${order.total.toStringAsFixed(2)}',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16.sp,
                    color: Theme.of(context).primaryColor,
                  ),
                ),
              ],
            ),
            
            SizedBox(height: 8.h),
            
            Text(
              '${order.items.length} items',
              style: TextStyle(color: Colors.grey[600], fontSize: 12.sp),
            ),
            
            SizedBox(height: 12.h),
            
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _showOrderDetails(order),
                    icon: const Icon(LucideIcons.eye, size: 16),
                    label: const Text('View Details'),
                  ),
                ),
                SizedBox(width: 8.w),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _showStatusUpdateDialog(order),
                    icon: const Icon(LucideIcons.edit, size: 16),
                    label: const Text('Update Status'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class OrderDetailsDialog extends StatelessWidget {
  final Order order;
  
  const OrderDetailsDialog({Key? key, required this.order}) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Order #${order.id} Details'),
      content: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Customer Info
            Text(
              'Customer Information',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 8.h),
            Text('Name: ${order.user.name}'),
            Text('Email: ${order.user.email}'),
            
            SizedBox(height: 16.h),
            
            // Order Info
            Text(
              'Order Information',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 8.h),
            Text('Status: ${order.status}'),
            Text('Date: ${DateFormat('MMM dd, yyyy - HH:mm').format(order.createdAt)}'),
            Text('Total: \$${order.total.toStringAsFixed(2)}'),
            
            SizedBox(height: 16.h),
            
            // Items
            Text(
              'Items (${order.items.length})',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 8.h),
            ...order.items.map((item) => Padding(
              padding: EdgeInsets.only(bottom: 8.h),
              child: Row(
                children: [
                  Expanded(
                    child: Text(item.medicine.name),
                  ),
                  Text('${item.quantity}x'),
                  SizedBox(width: 8.w),
                  Text('\$${item.price.toStringAsFixed(2)}'),
                ],
              ),
            )),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Close'),
        ),
      ],
    );
  }
}