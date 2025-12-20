import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../core/models/simple_medicine_model.dart';
import '../../../shared/widgets/simple_custom_text_field.dart';
import '../../../shared/providers/simple_cart_provider.dart';

class CatalogScreen extends ConsumerStatefulWidget {
  const CatalogScreen({Key? key}) : super(key: key);
  
  @override
  ConsumerState<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends ConsumerState<CatalogScreen> {
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  
  // Mock data - replace with actual providers
  List<Medicine> _medicines = [];
  List<Category> _categories = [];
  bool _isLoading = false;
  String _searchQuery = '';
  Category? _selectedCategory;
  bool _inStockOnly = false;
  String _sortBy = 'name';
  
  @override
  void initState() {
    super.initState();
    _loadMockData();
    _scrollController.addListener(_onScroll);
  }
  
  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }
  
  void _loadMockData() {
    // Mock categories
    _categories = [
      Category(
        id: 1,
        name: 'Pain Relief',
        slug: 'pain-relief',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
      Category(
        id: 2,
        name: 'Antibiotics',
        slug: 'antibiotics',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
      Category(
        id: 3,
        name: 'Vitamins',
        slug: 'vitamins',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
    ];
    
    // Mock medicines
    _medicines = [
      Medicine(
        id: 1,
        name: 'Paracetamol 500mg',
        slug: 'paracetamol-500mg',
        description: 'Pain relief and fever reducer',
        usage: 'For headaches, muscle aches, and fever',
        dosage: '1-2 tablets every 4-6 hours',
        price: 5.99,
        minStock: 50,
        category: _categories[0],
        categoryId: 1,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
      Medicine(
        id: 2,
        name: 'Amoxicillin 250mg',
        slug: 'amoxicillin-250mg',
        description: 'Antibiotic for bacterial infections',
        usage: 'Treats various bacterial infections',
        dosage: '1 capsule 3 times daily',
        price: 12.50,
        minStock: 30,
        category: _categories[1],
        categoryId: 2,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
      Medicine(
        id: 3,
        name: 'Vitamin D3 1000IU',
        slug: 'vitamin-d3-1000iu',
        description: 'Vitamin D supplement',
        usage: 'Supports bone health and immune system',
        dosage: '1 tablet daily with food',
        price: 8.75,
        minStock: 100,
        category: _categories[2],
        categoryId: 3,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
    ];
  }
  
  void _onScroll() {
    if (_scrollController.position.pixels == _scrollController.position.maxScrollExtent) {
      // Load more medicines (pagination)
      _loadMoreMedicines();
    }
  }
  
  void _loadMoreMedicines() {
    // TODO: Implement pagination
  }
  
  void _onSearchChanged(String query) {
    setState(() {
      _searchQuery = query;
    });
    // TODO: Implement debounced search
  }
  
  void _showFilterDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
      ),
      builder: (context) => _buildFilterSheet(),
    );
  }
  
  List<Medicine> get _filteredMedicines {
    List<Medicine> filtered = List.from(_medicines);
    
    // Search filter
    if (_searchQuery.isNotEmpty) {
      filtered = filtered.where((medicine) =>
        medicine.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
        medicine.description?.toLowerCase().contains(_searchQuery.toLowerCase()) == true
      ).toList();
    }
    
    // Category filter
    if (_selectedCategory != null) {
      filtered = filtered.where((medicine) =>
        medicine.categoryId == _selectedCategory!.id
      ).toList();
    }
    
    // In stock filter
    if (_inStockOnly) {
      filtered = filtered.where((medicine) => medicine.isInStock).toList();
    }
    
    // Sort
    switch (_sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.compareTo(b.name));
        break;
      case 'price_low':
        filtered.sort((a, b) => a.price.compareTo(b.price));
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price.compareTo(a.price));
        break;
    }
    
    return filtered;
  }
  
  @override
  Widget build(BuildContext context) {
    final filteredMedicines = _filteredMedicines;
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Medicine Catalog'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterDialog,
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: EdgeInsets.all(16.w),
            child: CustomTextField(
              controller: _searchController,
              hintText: 'Search medicines...',
              prefixIcon: Icons.search,
              onChanged: _onSearchChanged,
            ),
          ),
          
          // Categories
          if (_categories.isNotEmpty) ...[
            SizedBox(
              height: 50.h,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: EdgeInsets.symmetric(horizontal: 16.w),
                itemCount: _categories.length + 1,
                itemBuilder: (context, index) {
                  if (index == 0) {
                    return _buildCategoryChip(null, 'All');
                  }
                  final category = _categories[index - 1];
                  return _buildCategoryChip(category, category.name);
                },
              ),
            ),
            SizedBox(height: 16.h),
          ],
          
          // Results Count
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.w),
            child: Row(
              children: [
                Text(
                  '${filteredMedicines.length} medicines found',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey[600],
                  ),
                ),
                const Spacer(),
                if (_selectedCategory != null || _inStockOnly || _searchQuery.isNotEmpty)
                  TextButton(
                    onPressed: _clearFilters,
                    child: const Text('Clear filters'),
                  ),
              ],
            ),
          ),
          
          // Medicine List
          Expanded(
            child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : filteredMedicines.isEmpty
                ? _buildEmptyState()
                : ListView.builder(
                    controller: _scrollController,
                    padding: EdgeInsets.all(16.w),
                    itemCount: filteredMedicines.length,
                    itemBuilder: (context, index) {
                      final medicine = filteredMedicines[index];
                      return _buildMedicineCard(medicine);
                    },
                  ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildCategoryChip(Category? category, String label) {
    final isSelected = _selectedCategory?.id == category?.id;
    
    return Padding(
      padding: EdgeInsets.only(right: 8.w),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (selected) {
          setState(() {
            _selectedCategory = selected ? category : null;
          });
        },
        backgroundColor: Colors.grey[100],
        selectedColor: Theme.of(context).primaryColor.withOpacity(0.2),
        checkmarkColor: Theme.of(context).primaryColor,
      ),
    );
  }
  
  Widget _buildMedicineCard(Medicine medicine) {
    final isInCart = ref.watch(cartProvider.notifier).isInCart(medicine.id);
    
    return Card(
      margin: EdgeInsets.only(bottom: 16.h),
      child: InkWell(
        onTap: () {
          // TODO: Navigate to medicine detail
        },
        borderRadius: BorderRadius.circular(12.r),
        child: Padding(
          padding: EdgeInsets.all(16.w),
          child: Row(
            children: [
              // Medicine Image Placeholder
              Container(
                width: 80.w,
                height: 80.w,
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(8.r),
                ),
                child: Icon(
                  Icons.medication,
                  size: 40.sp,
                  color: Colors.grey[400],
                ),
              ),
              
              SizedBox(width: 16.w),
              
              // Medicine Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      medicine.name,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    
                    if (medicine.description != null) ...[
                      SizedBox(height: 4.h),
                      Text(
                        medicine.description!,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.grey[600],
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                    
                    SizedBox(height: 8.h),
                    
                    Row(
                      children: [
                        Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: 8.w,
                            vertical: 4.h,
                          ),
                          decoration: BoxDecoration(
                            color: Theme.of(context).primaryColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(4.r),
                          ),
                          child: Text(
                            medicine.categoryName,
                            style: TextStyle(
                              fontSize: 10.sp,
                              color: Theme.of(context).primaryColor,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        
                        const Spacer(),
                        
                        Text(
                          medicine.formattedPrice,
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            color: Theme.of(context).primaryColor,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              
              // Add to Cart Button
              IconButton(
                onPressed: () async {
                  await ref.read(cartProvider.notifier).addItem(medicine);
                  
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('${medicine.name} added to cart'),
                        duration: const Duration(seconds: 2),
                        action: SnackBarAction(
                          label: 'View Cart',
                          onPressed: () {
                            // TODO: Navigate to cart
                          },
                        ),
                      ),
                    );
                  }
                },
                icon: Icon(
                  isInCart ? Icons.shopping_cart : Icons.add_shopping_cart,
                  color: isInCart 
                    ? Theme.of(context).primaryColor 
                    : Theme.of(context).primaryColor,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildFilterSheet() {
    return StatefulBuilder(
      builder: (context, setSheetState) {
        return Container(
          padding: EdgeInsets.all(24.w),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    'Filters',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Spacer(),
                  TextButton(
                    onPressed: () {
                      _clearFilters();
                      setSheetState(() {});
                    },
                    child: const Text('Clear All'),
                  ),
                ],
              ),
              
              SizedBox(height: 24.h),
              
              // Sort By
              Text(
                'Sort By',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: 8.h),
              
              Wrap(
                spacing: 8.w,
                children: [
                  _buildSortChip('Name', 'name', setSheetState),
                  _buildSortChip('Price: Low to High', 'price_low', setSheetState),
                  _buildSortChip('Price: High to Low', 'price_high', setSheetState),
                ],
              ),
              
              SizedBox(height: 24.h),
              
              // Availability
              SwitchListTile(
                title: const Text('In Stock Only'),
                subtitle: const Text('Show only available medicines'),
                value: _inStockOnly,
                onChanged: (value) {
                  setSheetState(() {
                    _inStockOnly = value;
                  });
                  setState(() {
                    _inStockOnly = value;
                  });
                },
                activeColor: Theme.of(context).primaryColor,
              ),
              
              SizedBox(height: 24.h),
              
              // Apply Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: const Text('Apply Filters'),
                ),
              ),
              
              SizedBox(height: MediaQuery.of(context).viewInsets.bottom),
            ],
          ),
        );
      },
    );
  }
  
  Widget _buildSortChip(String label, String value, StateSetter setSheetState) {
    final isSelected = _sortBy == value;
    
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) {
          setSheetState(() {
            _sortBy = value;
          });
          setState(() {
            _sortBy = value;
          });
        }
      },
      backgroundColor: Colors.grey[100],
      selectedColor: Theme.of(context).primaryColor.withOpacity(0.2),
      checkmarkColor: Theme.of(context).primaryColor,
    );
  }
  
  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search_off,
            size: 64.sp,
            color: Colors.grey[400],
          ),
          SizedBox(height: 16.h),
          Text(
            'No medicines found',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: Colors.grey[600],
            ),
          ),
          SizedBox(height: 8.h),
          Text(
            'Try adjusting your search or filters',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.grey[500],
            ),
          ),
        ],
      ),
    );
  }
  
  void _clearFilters() {
    setState(() {
      _searchQuery = '';
      _selectedCategory = null;
      _inStockOnly = false;
      _sortBy = 'name';
      _searchController.clear();
    });
  }
}