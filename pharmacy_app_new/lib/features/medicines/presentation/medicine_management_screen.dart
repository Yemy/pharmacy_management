import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../../core/network/comprehensive_api_client.dart';

class MedicineManagementScreen extends ConsumerStatefulWidget {
  const MedicineManagementScreen({Key? key}) : super(key: key);
  
  @override
  ConsumerState<MedicineManagementScreen> createState() => _MedicineManagementScreenState();
}

class _MedicineManagementScreenState extends ConsumerState<MedicineManagementScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<Medicine> _medicines = [];
  List<Category> _categories = [];
  bool _isLoading = false;
  String _selectedTab = 'all';
  int? _selectedCategoryId;
  
  @override
  void initState() {
    super.initState();
    _loadData();
  }
  
  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
  
  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    
    try {
      // TODO: Load from API
      // Mock data for now
      _medicines = List.generate(20, (index) => Medicine(
        id: index + 1,
        name: 'Medicine ${index + 1}',
        slug: 'medicine-${index + 1}',
        description: 'Description for medicine ${index + 1}',
        price: 10.0 + (index * 2.5),
        totalStock: 100 - (index * 3),
        category: Category(id: (index % 3) + 1, name: 'Category ${(index % 3) + 1}', slug: 'cat-${(index % 3) + 1}'),
        unit: 'tablet',
        barcode: '123456789${index.toString().padLeft(4, '0')}',
      ));
      
      _categories = [
        Category(id: 1, name: 'Pain Relief', slug: 'pain-relief'),
        Category(id: 2, name: 'Antibiotics', slug: 'antibiotics'),
        Category(id: 3, name: 'Vitamins', slug: 'vitamins'),
      ];
      
      setState(() => _isLoading = false);
    } catch (e) {
      setState(() => _isLoading = false);
      _showErrorSnackBar('Failed to load medicines: ${e.toString()}');
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
  
  List<Medicine> get _filteredMedicines {
    var filtered = _medicines;
    
    // Filter by tab
    if (_selectedTab == 'lowstock') {
      filtered = filtered.where((m) => m.totalStock < 20).toList();
    } else if (_selectedTab == 'outofstock') {
      filtered = filtered.where((m) => m.totalStock == 0).toList();
    }
    
    // Filter by category
    if (_selectedCategoryId != null) {
      filtered = filtered.where((m) => m.category?.id == _selectedCategoryId).toList();
    }
    
    // Filter by search
    if (_searchController.text.isNotEmpty) {
      final query = _searchController.text.toLowerCase();
      filtered = filtered.where((m) =>
        m.name.toLowerCase().contains(query) ||
        (m.barcode?.contains(query) ?? false)
      ).toList();
    }
    
    return filtered;
  }
  
  Future<void> _deleteMedicine(Medicine medicine) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Medicine'),
        content: Text('Are you sure you want to delete ${medicine.name}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    
    if (confirmed == true) {
      // TODO: Delete via API
      setState(() {
        _medicines.removeWhere((m) => m.id == medicine.id);
      });
      _showSuccessSnackBar('Medicine deleted successfully');
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Medicine Management'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.plus),
            onPressed: () => context.push('/admin/medicines/add'),
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
                    hintText: 'Search medicines...',
                    prefixIcon: const Icon(LucideIcons.search),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.r),
                    ),
                  ),
                  onChanged: (value) => setState(() {}),
                ),
                SizedBox(height: 12.h),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<int?>(
                        value: _selectedCategoryId,
                        decoration: InputDecoration(
                          labelText: 'Category',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8.r),
                          ),
                        ),
                        items: [
                          const DropdownMenuItem(value: null, child: Text('All Categories')),
                          ..._categories.map((cat) => DropdownMenuItem(
                            value: cat.id,
                            child: Text(cat.name),
                          )),
                        ],
                        onChanged: (value) => setState(() => _selectedCategoryId = value),
                      ),
                    ),
                  ],
                ),
              ],
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
                _buildTab('Out of Stock', 'outofstock'),
              ],
            ),
          ),
          
          // Medicine List
          Expanded(
            child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _filteredMedicines.isEmpty
                ? _buildEmptyState()
                : ListView.builder(
                    padding: EdgeInsets.all(16.w),
                    itemCount: _filteredMedicines.length,
                    itemBuilder: (context, index) {
                      final medicine = _filteredMedicines[index];
                      return _buildMedicineCard(medicine);
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
          Icon(LucideIcons.pill, size: 64.sp, color: Colors.grey[400]),
          SizedBox(height: 16.h),
          Text(
            'No medicines found',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildMedicineCard(Medicine medicine) {
    final isLowStock = medicine.totalStock < 20;
    final isOutOfStock = medicine.totalStock == 0;
    
    return Card(
      margin: EdgeInsets.only(bottom: 12.h),
      child: ListTile(
        leading: Container(
          width: 48.w,
          height: 48.w,
          decoration: BoxDecoration(
            color: Colors.grey[100],
            borderRadius: BorderRadius.circular(8.r),
          ),
          child: Icon(LucideIcons.pill, color: Colors.grey[400]),
        ),
        title: Text(
          medicine.name,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(medicine.categoryName),
            Row(
              children: [
                Text(
                  'Stock: ${medicine.totalStock}',
                  style: TextStyle(
                    color: isOutOfStock ? Colors.red : (isLowStock ? Colors.orange : Colors.green),
                    fontWeight: FontWeight.w500,
                  ),
                ),
                SizedBox(width: 8.w),
                Text('•'),
                SizedBox(width: 8.w),
                Text(medicine.formattedPrice),
              ],
            ),
          ],
        ),
        trailing: PopupMenuButton(
          itemBuilder: (context) => [
            PopupMenuItem(
              child: Row(
                children: [
                  const Icon(LucideIcons.edit, size: 16),
                  SizedBox(width: 8.w),
                  const Text('Edit'),
                ],
              ),
              onTap: () => context.push('/admin/medicines/edit/${medicine.id}'),
            ),
            PopupMenuItem(
              child: Row(
                children: [
                  const Icon(LucideIcons.trash2, size: 16, color: Colors.red),
                  SizedBox(width: 8.w),
                  const Text('Delete', style: TextStyle(color: Colors.red)),
                ],
              ),
              onTap: () => _deleteMedicine(medicine),
            ),
          ],
        ),
      ),
    );
  }
}
