import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';

import '../../../core/network/comprehensive_api_client.dart';

class InventoryManagementScreen extends ConsumerStatefulWidget {
  const InventoryManagementScreen({Key? key}) : super(key: key);
  
  @override
  ConsumerState<InventoryManagementScreen> createState() => _InventoryManagementScreenState();
}

class _InventoryManagementScreenState extends ConsumerState<InventoryManagementScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<InventoryItem> _inventoryItems = [];
  bool _isLoading = false;
  String _selectedTab = 'all';
  
  @override
  void initState() {
    super.initState();
    _loadInventory();
  }
  
  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
  
  Future<void> _loadInventory() async {
    setState(() => _isLoading = true);
    
    try {
      // TODO: Load from API
      // Mock data for now
      _inventoryItems = List.generate(15, (index) {
        final medicine = Medicine(
          id: index + 1,
          name: 'Medicine ${index + 1}',
          slug: 'medicine-${index + 1}',
          price: 10.0 + (index * 2.5),
          totalStock: 100 - (index * 5),
          category: Category(id: 1, name: 'Category', slug: 'category'),
          unit: 'tablet',
        );
        
        return InventoryItem(
          id: index + 1,
          quantity: 100 - (index * 5),
          batchNumber: 'BATCH${(index + 1).toString().padLeft(3, '0')}',
          expiryDate: DateTime.now().add(Duration(days: 30 + (index * 10))),
          medicine: medicine,
        );
      });
      
      setState(() => _isLoading = false);
    } catch (e) {
      setState(() => _isLoading = false);
      _showErrorSnackBar('Failed to load inventory: ${e.toString()}');
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
  
  List<InventoryItem> get _filteredInventoryItems {
    var filtered = _inventoryItems;
    
    // Filter by tab
    if (_selectedTab == 'lowstock') {
      filtered = filtered.where((item) => item.quantity < 20).toList();
    } else if (_selectedTab == 'expiring') {
      final thirtyDaysFromNow = DateTime.now().add(const Duration(days: 30));
      filtered = filtered.where((item) => 
        item.expiryDate != null && item.expiryDate!.isBefore(thirtyDaysFromNow)
      ).toList();
    } else if (_selectedTab == 'expired') {
      final now = DateTime.now();
      filtered = filtered.where((item) => 
        item.expiryDate != null && item.expiryDate!.isBefore(now)
      ).toList();
    }
    
    // Filter by search
    if (_searchController.text.isNotEmpty) {
      final query = _searchController.text.toLowerCase();
      filtered = filtered.where((item) =>
        item.medicine.name.toLowerCase().contains(query) ||
        (item.batchNumber?.toLowerCase().contains(query) ?? false)
      ).toList();
    }
    
    return filtered;
  }
  
  bool _isExpiringSoon(DateTime? expiryDate) {
    if (expiryDate == null) return false;
    final thirtyDaysFromNow = DateTime.now().add(const Duration(days: 30));
    return expiryDate.isBefore(thirtyDaysFromNow) && expiryDate.isAfter(DateTime.now());
  }
  
  bool _isExpired(DateTime? expiryDate) {
    if (expiryDate == null) return false;
    return expiryDate.isBefore(DateTime.now());
  }
  
  void _showAddInventoryDialog() {
    showDialog(
      context: context,
      builder: (context) => const AddInventoryDialog(),
    ).then((result) {
      if (result == true) {
        _loadInventory();
      }
    });
  }
  
  void _showAdjustStockDialog(InventoryItem item) {
    final controller = TextEditingController();
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Adjust Stock - ${item.medicine.name}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Current Stock: ${item.quantity}'),
            SizedBox(height: 16.h),
            TextField(
              controller: controller,
              decoration: const InputDecoration(
                labelText: 'New Quantity',
                hintText: 'Enter new stock quantity',
              ),
              keyboardType: TextInputType.number,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              final newQuantity = int.tryParse(controller.text);
              if (newQuantity != null && newQuantity >= 0) {
                // TODO: Update via API
                setState(() {
                  final index = _inventoryItems.indexWhere((i) => i.id == item.id);
                  if (index != -1) {
                    _inventoryItems[index] = InventoryItem(
                      id: item.id,
                      quantity: newQuantity,
                      batchNumber: item.batchNumber,
                      expiryDate: item.expiryDate,
                      medicine: item.medicine,
                    );
                  }
                });
                Navigator.of(context).pop();
                _showSuccessSnackBar('Stock updated successfully');
              }
            },
            child: const Text('Update'),
          ),
        ],
      ),
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Inventory Management'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.plus),
            onPressed: _showAddInventoryDialog,
          ),
        ],
      ),
      body: Column(
        children: [
          // Search
          Padding(
            padding: EdgeInsets.all(16.w),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search inventory...',
                prefixIcon: const Icon(LucideIcons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8.r),
                ),
              ),
              onChanged: (value) => setState(() {}),
            ),
          ),
          
          // Tabs
          Container(
            height: 48.h,
            padding: EdgeInsets.symmetric(horizontal: 16.w),
            child: Row(
              children: [
                _buildTab('All', 'all'),
                SizedBox(width: 8.w),
                _buildTab('Low Stock', 'lowstock'),
                SizedBox(width: 8.w),
                _buildTab('Expiring', 'expiring'),
                SizedBox(width: 8.w),
                _buildTab('Expired', 'expired'),
              ],
            ),
          ),
          
          // Inventory List
          Expanded(
            child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _filteredInventoryItems.isEmpty
                ? _buildEmptyState()
                : ListView.builder(
                    padding: EdgeInsets.all(16.w),
                    itemCount: _filteredInventoryItems.length,
                    itemBuilder: (context, index) {
                      final item = _filteredInventoryItems[index];
                      return _buildInventoryCard(item);
                    },
                  ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildTab(String label, String value) {
    final isSelected = _selectedTab == value;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedTab = value),
        child: Container(
          padding: EdgeInsets.symmetric(vertical: 8.h),
          decoration: BoxDecoration(
            color: isSelected ? Theme.of(context).primaryColor : Colors.grey[200],
            borderRadius: BorderRadius.circular(8.r),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: isSelected ? Colors.white : Colors.black87,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
              fontSize: 12.sp,
            ),
          ),
        ),
      ),
    );
  }
  
  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.package, size: 64.sp, color: Colors.grey[400]),
          SizedBox(height: 16.h),
          Text(
            'No inventory items found',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildInventoryCard(InventoryItem item) {
    final isLowStock = item.quantity < 20;
    final isExpiringSoon = _isExpiringSoon(item.expiryDate);
    final isExpired = _isExpired(item.expiryDate);
    
    Color statusColor = Colors.green;
    String statusText = 'Good';
    
    if (isExpired) {
      statusColor = Colors.red;
      statusText = 'Expired';
    } else if (isExpiringSoon) {
      statusColor = Colors.orange;
      statusText = 'Expiring Soon';
    } else if (isLowStock) {
      statusColor = Colors.orange;
      statusText = 'Low Stock';
    }
    
    return Card(
      margin: EdgeInsets.only(bottom: 12.h),
      child: Padding(
        padding: EdgeInsets.all(16.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    item.medicine.name,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 16,
                    ),
                  ),
                ),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4.r),
                  ),
                  child: Text(
                    statusText,
                    style: TextStyle(
                      color: statusColor,
                      fontSize: 12.sp,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
            
            SizedBox(height: 8.h),
            
            Row(
              children: [
                Icon(LucideIcons.package, size: 16.sp, color: Colors.grey[600]),
                SizedBox(width: 4.w),
                Text(
                  'Quantity: ${item.quantity}',
                  style: TextStyle(color: Colors.grey[600]),
                ),
                SizedBox(width: 16.w),
                if (item.batchNumber != null) ...[
                  Icon(LucideIcons.hash, size: 16.sp, color: Colors.grey[600]),
                  SizedBox(width: 4.w),
                  Text(
                    'Batch: ${item.batchNumber}',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                ],
              ],
            ),
            
            if (item.expiryDate != null) ...[
              SizedBox(height: 4.h),
              Row(
                children: [
                  Icon(LucideIcons.calendar, size: 16.sp, color: Colors.grey[600]),
                  SizedBox(width: 4.w),
                  Text(
                    'Expires: ${DateFormat('MMM dd, yyyy').format(item.expiryDate!)}',
                    style: TextStyle(
                      color: isExpired ? Colors.red : (isExpiringSoon ? Colors.orange : Colors.grey[600]),
                    ),
                  ),
                ],
              ),
            ],
            
            SizedBox(height: 12.h),
            
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _showAdjustStockDialog(item),
                    icon: const Icon(LucideIcons.edit, size: 16),
                    label: const Text('Adjust Stock'),
                  ),
                ),
                SizedBox(width: 8.w),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      // TODO: View details
                    },
                    icon: const Icon(LucideIcons.eye, size: 16),
                    label: const Text('View Details'),
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

class AddInventoryDialog extends StatefulWidget {
  const AddInventoryDialog({Key? key}) : super(key: key);
  
  @override
  State<AddInventoryDialog> createState() => _AddInventoryDialogState();
}

class _AddInventoryDialogState extends State<AddInventoryDialog> {
  final _formKey = GlobalKey<FormState>();
  final _quantityController = TextEditingController();
  final _batchController = TextEditingController();
  final _unitPriceController = TextEditingController();
  
  Medicine? _selectedMedicine;
  DateTime? _expiryDate;
  
  final List<Medicine> _medicines = [
    Medicine(id: 1, name: 'Paracetamol 500mg', slug: 'paracetamol', price: 5.99, totalStock: 100, category: null),
    Medicine(id: 2, name: 'Amoxicillin 250mg', slug: 'amoxicillin', price: 12.50, totalStock: 50, category: null),
    Medicine(id: 3, name: 'Vitamin D3 1000IU', slug: 'vitamin-d3', price: 8.75, totalStock: 75, category: null),
  ];
  
  @override
  void dispose() {
    _quantityController.dispose();
    _batchController.dispose();
    _unitPriceController.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add Inventory'),
      content: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<Medicine>(
                value: _selectedMedicine,
                decoration: const InputDecoration(labelText: 'Medicine'),
                items: _medicines.map((medicine) => DropdownMenuItem(
                  value: medicine,
                  child: Text(medicine.name),
                )).toList(),
                onChanged: (medicine) => setState(() => _selectedMedicine = medicine),
                validator: (value) => value == null ? 'Please select a medicine' : null,
              ),
              
              SizedBox(height: 16.h),
              
              TextFormField(
                controller: _quantityController,
                decoration: const InputDecoration(labelText: 'Quantity'),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value == null || value.isEmpty) return 'Please enter quantity';
                  if (int.tryParse(value) == null || int.parse(value) <= 0) {
                    return 'Please enter a valid quantity';
                  }
                  return null;
                },
              ),
              
              SizedBox(height: 16.h),
              
              TextFormField(
                controller: _batchController,
                decoration: const InputDecoration(labelText: 'Batch Number (Optional)'),
              ),
              
              SizedBox(height: 16.h),
              
              TextFormField(
                controller: _unitPriceController,
                decoration: const InputDecoration(labelText: 'Unit Price'),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value == null || value.isEmpty) return 'Please enter unit price';
                  if (double.tryParse(value) == null || double.parse(value) <= 0) {
                    return 'Please enter a valid price';
                  }
                  return null;
                },
              ),
              
              SizedBox(height: 16.h),
              
              ListTile(
                title: const Text('Expiry Date (Optional)'),
                subtitle: Text(_expiryDate != null 
                  ? DateFormat('MMM dd, yyyy').format(_expiryDate!)
                  : 'Not set'
                ),
                trailing: const Icon(LucideIcons.calendar),
                onTap: () async {
                  final date = await showDatePicker(
                    context: context,
                    initialDate: DateTime.now().add(const Duration(days: 365)),
                    firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 3650)),
                  );
                  if (date != null) {
                    setState(() => _expiryDate = date);
                  }
                },
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: () {
            if (_formKey.currentState!.validate()) {
              // TODO: Add inventory via API
              Navigator.of(context).pop(true);
            }
          },
          child: const Text('Add'),
        ),
      ],
    );
  }
}