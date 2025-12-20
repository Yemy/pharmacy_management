import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../../core/network/comprehensive_api_client.dart';
import '../../../shared/providers/auth_provider.dart';

class ComprehensivePOSSystem extends ConsumerStatefulWidget {
  const ComprehensivePOSSystem({Key? key}) : super(key: key);
  
  @override
  ConsumerState<ComprehensivePOSSystem> createState() => _ComprehensivePOSSystemState();
}

class _ComprehensivePOSSystemState extends ConsumerState<ComprehensivePOSSystem> {
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _paymentRefController = TextEditingController();
  
  List<Medicine> _medicines = [];
  List<Customer> _customers = [];
  List<CartItem> _cart = [];
  Customer? _selectedCustomer;
  String _paymentMethod = 'CASH';
  double _discount = 0.0;
  double _tax = 8.5;
  bool _isLoading = false;
  bool _showScanner = false;
  
  MobileScannerController? _scannerController;
  
  @override
  void initState() {
    super.initState();
    _loadData();
  }
  
  @override
  void dispose() {
    _searchController.dispose();
    _paymentRefController.dispose();
    _scannerController?.dispose();
    super.dispose();
  }
  
  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    
    try {
      // TODO: Load medicines and customers from API
      // Mock data for now
      _medicines = [
        Medicine(
          id: 1,
          name: 'Paracetamol 500mg',
          slug: 'paracetamol-500mg',
          price: 5.99,
          totalStock: 100,
          barcode: '1234567890123',
          unit: 'tablet',
          category: Category(id: 1, name: 'Pain Relief', slug: 'pain-relief'),
        ),
        Medicine(
          id: 2,
          name: 'Amoxicillin 250mg',
          slug: 'amoxicillin-250mg',
          price: 12.50,
          totalStock: 50,
          barcode: '2345678901234',
          unit: 'capsule',
          category: Category(id: 2, name: 'Antibiotics', slug: 'antibiotics'),
        ),
        Medicine(
          id: 3,
          name: 'Vitamin D3 1000IU',
          slug: 'vitamin-d3-1000iu',
          price: 8.75,
          totalStock: 75,
          barcode: '3456789012345',
          unit: 'tablet',
          category: Category(id: 3, name: 'Vitamins', slug: 'vitamins'),
        ),
      ];
      
      _customers = [
        Customer(
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1234567890',
          email: 'john.doe@email.com',
          loyaltyPoints: 150,
        ),
        Customer(
          id: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+1234567891',
          email: 'jane.smith@email.com',
          loyaltyPoints: 200,
        ),
      ];
      
      setState(() => _isLoading = false);
    } catch (e) {
      setState(() => _isLoading = false);
      _showErrorSnackBar('Failed to load data: ${e.toString()}');
    }
  }
  
  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }
  
  void _showSuccessSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
      ),
    );
  }
  
  List<Medicine> get _filteredMedicines {
    if (_searchController.text.isEmpty) return _medicines;
    
    final query = _searchController.text.toLowerCase();
    return _medicines.where((medicine) =>
      medicine.name.toLowerCase().contains(query) ||
      medicine.categoryName.toLowerCase().contains(query) ||
      (medicine.barcode?.contains(query) ?? false)
    ).toList();
  }
  
  double get _subtotal => _cart.fold(0.0, (sum, item) => sum + item.total);
  double get _discountAmount => (_subtotal * _discount) / 100;
  double get _taxableAmount => _subtotal - _discountAmount;
  double get _taxAmount => (_taxableAmount * _tax) / 100;
  double get _total => _taxableAmount + _taxAmount;
  
  void _addToCart(Medicine medicine) {
    final existingIndex = _cart.indexWhere((item) => item.medicine.id == medicine.id);
    
    if (existingIndex != -1) {
      final existingItem = _cart[existingIndex];
      if (existingItem.quantity >= medicine.totalStock) {
        _showErrorSnackBar('Only ${medicine.totalStock} units available');
        return;
      }
      _updateQuantity(medicine.id, existingItem.quantity + 1);
    } else {
      setState(() {
        _cart.add(CartItem(
          medicine: medicine,
          quantity: 1,
          unitPrice: medicine.price,
          discount: 0.0,
          total: medicine.price,
        ));
      });
    }
  }
  
  void _updateQuantity(int medicineId, int newQuantity) {
    if (newQuantity <= 0) {
      _removeFromCart(medicineId);
      return;
    }
    
    setState(() {
      final index = _cart.indexWhere((item) => item.medicine.id == medicineId);
      if (index != -1) {
        final item = _cart[index];
        final quantity = newQuantity.clamp(1, item.medicine.totalStock);
        final total = (item.unitPrice * quantity) - ((item.unitPrice * quantity * item.discount) / 100);
        _cart[index] = CartItem(
          medicine: item.medicine,
          quantity: quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          total: total,
        );
      }
    });
  }
  
  void _updateItemDiscount(int medicineId, double discount) {
    setState(() {
      final index = _cart.indexWhere((item) => item.medicine.id == medicineId);
      if (index != -1) {
        final item = _cart[index];
        final total = (item.unitPrice * item.quantity) - ((item.unitPrice * item.quantity * discount) / 100);
        _cart[index] = CartItem(
          medicine: item.medicine,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: discount,
          total: total,
        );
      }
    });
  }
  
  void _removeFromCart(int medicineId) {
    setState(() {
      _cart.removeWhere((item) => item.medicine.id == medicineId);
    });
  }
  
  void _clearCart() {
    setState(() {
      _cart.clear();
      _selectedCustomer = null;
      _discount = 0.0;
      _paymentRefController.clear();
    });
  }
  
  void _startScanning() {
    setState(() {
      _showScanner = true;
      _scannerController = MobileScannerController();
    });
  }
  
  void _stopScanning() {
    setState(() {
      _showScanner = false;
    });
    _scannerController?.dispose();
    _scannerController = null;
  }
  
  void _onBarcodeDetected(BarcodeCapture capture) {
    final barcode = capture.barcodes.first.rawValue;
    if (barcode != null) {
      _stopScanning();
      
      // Find medicine by barcode
      final medicine = _medicines.firstWhere(
        (m) => m.barcode == barcode,
        orElse: () => throw Exception('Medicine not found'),
      );
      
      try {
        _addToCart(medicine);
        _showSuccessSnackBar('Added ${medicine.name} to cart');
      } catch (e) {
        // Search by barcode in search field
        _searchController.text = barcode;
        _showErrorSnackBar('Medicine not found. Searching...');
      }
    }
  }
  
  Future<void> _processSale() async {
    if (_cart.isEmpty) {
      _showErrorSnackBar('Cart is empty');
      return;
    }
    
    if (_paymentMethod != 'CASH' && _paymentRefController.text.isEmpty) {
      _showErrorSnackBar('Payment reference is required');
      return;
    }
    
    setState(() => _isLoading = true);
    
    try {
      final saleRequest = CreateSaleRequest(
        customerId: _selectedCustomer?.id,
        items: _cart.map((item) => SaleItemRequest(
          medicineId: item.medicine.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          total: item.total,
        )).toList(),
        subtotal: _subtotal,
        tax: _taxAmount,
        discount: _discountAmount,
        total: _total,
        paymentMethod: _paymentMethod,
        paymentRef: _paymentRefController.text.isNotEmpty ? _paymentRefController.text : null,
        type: 'PHYSICAL',
      );
      
      // TODO: Call API to create sale
      // final apiClient = ComprehensiveApiClient(DioClient.instance);
      // final response = await apiClient.createSale(saleRequest);
      
      // Mock success for now
      await Future.delayed(const Duration(seconds: 1));
      
      _showSuccessSnackBar('Sale completed successfully!');
      _clearCart();
      
      // TODO: Print receipt
      _printReceipt();
      
    } catch (e) {
      _showErrorSnackBar('Failed to process sale: ${e.toString()}');
    } finally {
      setState(() => _isLoading = false);
    }
  }
  
  void _printReceipt() {
    // TODO: Implement receipt printing
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Receipt'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Sale completed successfully!'),
            SizedBox(height: 16.h),
            Text('Total: \$${_total.toStringAsFixed(2)}'),
            Text('Payment: $_paymentMethod'),
            if (_selectedCustomer != null)
              Text('Customer: ${_selectedCustomer!.firstName} ${_selectedCustomer!.lastName}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              // TODO: Implement actual printing
            },
            child: const Text('Print'),
          ),
        ],
      ),
    );
  }
  
  @override
  Widget build(BuildContext context) {
    if (_showScanner) {
      return _buildScannerView();
    }
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('POS System'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.scan),
            onPressed: _startScanning,
          ),
        ],
      ),
      body: _isLoading
        ? const Center(child: CircularProgressIndicator())
        : Row(
            children: [
              // Left side - Product selection
              Expanded(
                flex: 2,
                child: _buildProductSelection(),
              ),
              
              // Right side - Cart and checkout
              Expanded(
                flex: 1,
                child: _buildCartAndCheckout(),
              ),
            ],
          ),
    );
  }
  
  Widget _buildScannerView() {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan Barcode'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: _stopScanning,
        ),
      ),
      body: MobileScanner(
        controller: _scannerController,
        onDetect: _onBarcodeDetected,
      ),
    );
  }
  
  Widget _buildProductSelection() {
    return Column(
      children: [
        // Search bar
        Padding(
          padding: EdgeInsets.all(16.w),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search medicines by name, category, or barcode...',
                    prefixIcon: const Icon(LucideIcons.search),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.r),
                    ),
                  ),
                  onChanged: (value) => setState(() {}),
                ),
              ),
              SizedBox(width: 8.w),
              ElevatedButton.icon(
                onPressed: _startScanning,
                icon: const Icon(LucideIcons.scan),
                label: const Text('Scan'),
              ),
            ],
          ),
        ),
        
        // Medicine grid
        Expanded(
          child: GridView.builder(
            padding: EdgeInsets.all(16.w),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 16.w,
              mainAxisSpacing: 16.h,
              childAspectRatio: 0.8,
            ),
            itemCount: _filteredMedicines.length,
            itemBuilder: (context, index) {
              final medicine = _filteredMedicines[index];
              return _buildMedicineCard(medicine);
            },
          ),
        ),
      ],
    );
  }
  
  Widget _buildMedicineCard(Medicine medicine) {
    return Card(
      child: InkWell(
        onTap: () => _addToCart(medicine),
        borderRadius: BorderRadius.circular(8.r),
        child: Padding(
          padding: EdgeInsets.all(12.w),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Medicine icon
              Container(
                width: double.infinity,
                height: 60.h,
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(8.r),
                ),
                child: Icon(
                  LucideIcons.pill,
                  size: 32.sp,
                  color: Colors.grey[400],
                ),
              ),
              
              SizedBox(height: 8.h),
              
              // Medicine name
              Text(
                medicine.name,
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              
              SizedBox(height: 4.h),
              
              // Category
              Container(
                padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
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
              
              // Price and stock
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    medicine.formattedPrice,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: Theme.of(context).primaryColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    'Stock: ${medicine.totalStock}',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildCartAndCheckout() {
    return Container(
      decoration: BoxDecoration(
        border: Border(
          left: BorderSide(color: Colors.grey[300]!),
        ),
      ),
      child: Column(
        children: [
          // Customer selection
          _buildCustomerSelection(),
          
          // Cart items
          Expanded(
            child: _buildCartItems(),
          ),
          
          // Checkout section
          _buildCheckoutSection(),
        ],
      ),
    );
  }
  
  Widget _buildCustomerSelection() {
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(color: Colors.grey[300]!),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Customer',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const Spacer(),
              TextButton.icon(
                onPressed: _showAddCustomerDialog,
                icon: const Icon(LucideIcons.userPlus),
                label: const Text('Add'),
              ),
            ],
          ),
          
          SizedBox(height: 8.h),
          
          DropdownButtonFormField<Customer>(
            value: _selectedCustomer,
            decoration: InputDecoration(
              hintText: 'Select customer (optional)',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.r),
              ),
            ),
            items: _customers.map((customer) => DropdownMenuItem(
              value: customer,
              child: Text('${customer.firstName} ${customer.lastName}'),
            )).toList(),
            onChanged: (customer) {
              setState(() {
                _selectedCustomer = customer;
              });
            },
          ),
          
          if (_selectedCustomer != null) ...[
            SizedBox(height: 8.h),
            Container(
              padding: EdgeInsets.all(8.w),
              decoration: BoxDecoration(
                color: Colors.blue.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8.r),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${_selectedCustomer!.firstName} ${_selectedCustomer!.lastName}',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  if (_selectedCustomer!.phone != null)
                    Text(
                      _selectedCustomer!.phone!,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  Text(
                    'Loyalty Points: ${_selectedCustomer!.loyaltyPoints}',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).primaryColor,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
  
  Widget _buildCartItems() {
    if (_cart.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              LucideIcons.shoppingCart,
              size: 64.sp,
              color: Colors.grey[400],
            ),
            SizedBox(height: 16.h),
            Text(
              'Cart is empty',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: Colors.grey[600],
              ),
            ),
            SizedBox(height: 8.h),
            Text(
              'Add medicines to get started',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey[500],
              ),
            ),
          ],
        ),
      );
    }
    
    return Column(
      children: [
        Container(
          padding: EdgeInsets.all(16.w),
          child: Row(
            children: [
              Text(
                'Cart (${_cart.length} items)',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const Spacer(),
              TextButton(
                onPressed: _clearCart,
                child: const Text('Clear All'),
              ),
            ],
          ),
        ),
        
        Expanded(
          child: ListView.builder(
            itemCount: _cart.length,
            itemBuilder: (context, index) {
              final item = _cart[index];
              return _buildCartItem(item);
            },
          ),
        ),
      ],
    );
  }
  
  Widget _buildCartItem(CartItem item) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 16.w, vertical: 4.h),
      padding: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(8.r),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  item.medicine.name,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              IconButton(
                onPressed: () => _removeFromCart(item.medicine.id),
                icon: const Icon(LucideIcons.trash2),
                iconSize: 16.sp,
                color: Colors.red,
              ),
            ],
          ),
          
          SizedBox(height: 8.h),
          
          Row(
            children: [
              // Quantity controls
              Row(
                children: [
                  IconButton(
                    onPressed: () => _updateQuantity(item.medicine.id, item.quantity - 1),
                    icon: const Icon(LucideIcons.minus),
                    iconSize: 16.sp,
                  ),
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey[300]!),
                      borderRadius: BorderRadius.circular(4.r),
                    ),
                    child: Text(
                      '${item.quantity}',
                      style: Theme.of(context).textTheme.titleSmall,
                    ),
                  ),
                  IconButton(
                    onPressed: () => _updateQuantity(item.medicine.id, item.quantity + 1),
                    icon: const Icon(LucideIcons.plus),
                    iconSize: 16.sp,
                  ),
                ],
              ),
              
              const Spacer(),
              
              // Total
              Text(
                '\$${item.total.toStringAsFixed(2)}',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).primaryColor,
                ),
              ),
            ],
          ),
          
          // Discount input
          Row(
            children: [
              Text(
                'Discount (%):',
                style: Theme.of(context).textTheme.bodySmall,
              ),
              SizedBox(width: 8.w),
              SizedBox(
                width: 60.w,
                child: TextField(
                  decoration: InputDecoration(
                    hintText: '0',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(4.r),
                    ),
                    contentPadding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                  ),
                  keyboardType: TextInputType.number,
                  onChanged: (value) {
                    final discount = double.tryParse(value) ?? 0.0;
                    _updateItemDiscount(item.medicine.id, discount);
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
  
  Widget _buildCheckoutSection() {
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(color: Colors.grey[300]!),
        ),
      ),
      child: Column(
        children: [
          // Payment method
          DropdownButtonFormField<String>(
            value: _paymentMethod,
            decoration: InputDecoration(
              labelText: 'Payment Method',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.r),
              ),
            ),
            items: const [
              DropdownMenuItem(value: 'CASH', child: Text('Cash')),
              DropdownMenuItem(value: 'CARD', child: Text('Card')),
              DropdownMenuItem(value: 'INSURANCE', child: Text('Insurance')),
            ],
            onChanged: (value) {
              setState(() {
                _paymentMethod = value!;
              });
            },
          ),
          
          if (_paymentMethod != 'CASH') ...[
            SizedBox(height: 12.h),
            TextField(
              controller: _paymentRefController,
              decoration: InputDecoration(
                labelText: _paymentMethod == 'CARD' ? 'Card Transaction ID' : 'Insurance Claim Number',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8.r),
                ),
              ),
            ),
          ],
          
          SizedBox(height: 12.h),
          
          // Discount
          TextField(
            decoration: InputDecoration(
              labelText: 'Overall Discount (%)',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.r),
              ),
            ),
            keyboardType: TextInputType.number,
            onChanged: (value) {
              setState(() {
                _discount = double.tryParse(value) ?? 0.0;
              });
            },
          ),
          
          SizedBox(height: 12.h),
          
          // Tax
          TextField(
            decoration: InputDecoration(
              labelText: 'Tax Rate (%)',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.r),
              ),
            ),
            keyboardType: TextInputType.number,
            onChanged: (value) {
              setState(() {
                _tax = double.tryParse(value) ?? 8.5;
              });
            },
          ),
          
          SizedBox(height: 16.h),
          
          // Totals
          Column(
            children: [
              _buildTotalRow('Subtotal:', '\$${_subtotal.toStringAsFixed(2)}'),
              if (_discount > 0)
                _buildTotalRow('Discount (${_discount.toStringAsFixed(1)}%):', '-\$${_discountAmount.toStringAsFixed(2)}', isDiscount: true),
              _buildTotalRow('Tax (${_tax.toStringAsFixed(1)}%):', '\$${_taxAmount.toStringAsFixed(2)}'),
              Divider(thickness: 2),
              _buildTotalRow('Total:', '\$${_total.toStringAsFixed(2)}', isTotal: true),
            ],
          ),
          
          SizedBox(height: 16.h),
          
          // Process sale button
          SizedBox(
            width: double.infinity,
            height: 48.h,
            child: ElevatedButton(
              onPressed: _cart.isEmpty || _isLoading ? null : _processSale,
              child: _isLoading
                ? const CircularProgressIndicator(color: Colors.white)
                : Text('Complete Sale - \$${_total.toStringAsFixed(2)}'),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildTotalRow(String label, String value, {bool isDiscount = false, bool isTotal = false}) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 2.h),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
            ),
          ),
          Text(
            value,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
              color: isDiscount ? Colors.red : (isTotal ? Theme.of(context).primaryColor : null),
            ),
          ),
        ],
      ),
    );
  }
  
  void _showAddCustomerDialog() {
    final firstNameController = TextEditingController();
    final lastNameController = TextEditingController();
    final phoneController = TextEditingController();
    final emailController = TextEditingController();
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add New Customer'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: firstNameController,
              decoration: const InputDecoration(labelText: 'First Name'),
            ),
            SizedBox(height: 8.h),
            TextField(
              controller: lastNameController,
              decoration: const InputDecoration(labelText: 'Last Name'),
            ),
            SizedBox(height: 8.h),
            TextField(
              controller: phoneController,
              decoration: const InputDecoration(labelText: 'Phone'),
              keyboardType: TextInputType.phone,
            ),
            SizedBox(height: 8.h),
            TextField(
              controller: emailController,
              decoration: const InputDecoration(labelText: 'Email'),
              keyboardType: TextInputType.emailAddress,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (firstNameController.text.isNotEmpty && lastNameController.text.isNotEmpty) {
                // TODO: Create customer via API
                final newCustomer = Customer(
                  id: _customers.length + 1,
                  firstName: firstNameController.text,
                  lastName: lastNameController.text,
                  phone: phoneController.text.isNotEmpty ? phoneController.text : null,
                  email: emailController.text.isNotEmpty ? emailController.text : null,
                  loyaltyPoints: 0,
                );
                
                setState(() {
                  _customers.add(newCustomer);
                  _selectedCustomer = newCustomer;
                });
                
                Navigator.of(context).pop();
                _showSuccessSnackBar('Customer added successfully');
              }
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }
}

// Cart Item Model
class CartItem {
  final Medicine medicine;
  final int quantity;
  final double unitPrice;
  final double discount;
  final double total;
  
  CartItem({
    required this.medicine,
    required this.quantity,
    required this.unitPrice,
    required this.discount,
    required this.total,
  });
}