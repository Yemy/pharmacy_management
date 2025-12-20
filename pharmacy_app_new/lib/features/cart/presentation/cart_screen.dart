import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../shared/providers/cart_provider.dart';
import '../../../shared/widgets/loading_button.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({Key? key}) : super(key: key);
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartState = ref.watch(cartProvider);
    final cartItems = cartState.items;
    
    return Scaffold(
      appBar: AppBar(
        title: Text('Shopping Cart (${cartState.totalItems})'),
        actions: [
          if (cartItems.isNotEmpty)
            TextButton(
              onPressed: () => _showClearCartDialog(context, ref),
              child: const Text('Clear All'),
            ),
        ],
      ),
      body: cartState.isLoading
        ? const Center(child: CircularProgressIndicator())
        : cartItems.isEmpty
          ? _buildEmptyCart(context)
          : Column(
              children: [
                // Cart Items
                Expanded(
                  child: ListView.builder(
                    padding: EdgeInsets.all(16.w),
                    itemCount: cartItems.length,
                    itemBuilder: (context, index) {
                      final item = cartItems[index];
                      return _buildCartItem(context, ref, item);
                    },
                  ),
                ),
                
                // Cart Summary
                _buildCartSummary(context, ref, cartState),
              ],
            ),
    );
  }
  
  Widget _buildEmptyCart(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.shopping_cart_outlined,
            size: 80.sp,
            color: Colors.grey[400],
          ),
          SizedBox(height: 24.h),
          Text(
            'Your cart is empty',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: Colors.grey[600],
            ),
          ),
          SizedBox(height: 8.h),
          Text(
            'Add some medicines to get started',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.grey[500],
            ),
          ),
          SizedBox(height: 32.h),
          ElevatedButton(
            onPressed: () {
              // TODO: Navigate to catalog
            },
            child: const Text('Browse Medicines'),
          ),
        ],
      ),
    );
  }
  
  Widget _buildCartItem(BuildContext context, WidgetRef ref, CartItem item) {
    return Card(
      margin: EdgeInsets.only(bottom: 16.h),
      child: Padding(
        padding: EdgeInsets.all(16.w),
        child: Row(
          children: [
            // Medicine Image
            Container(
              width: 60.w,
              height: 60.w,
              decoration: BoxDecoration(
                color: Colors.grey[200],
                borderRadius: BorderRadius.circular(8.r),
              ),
              child: Icon(
                Icons.medication,
                size: 30.sp,
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
                    item.medicine.name,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  
                  SizedBox(height: 4.h),
                  
                  Text(
                    item.medicine.categoryName,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.grey[600],
                    ),
                  ),
                  
                  SizedBox(height: 8.h),
                  
                  Row(
                    children: [
                      Text(
                        '\$${item.price.toStringAsFixed(2)}',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: Theme.of(context).primaryColor,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      
                      const Spacer(),
                      
                      Text(
                        'Total: \$${item.total.toStringAsFixed(2)}',
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            
            SizedBox(width: 16.w),
            
            // Quantity Controls
            Column(
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      onPressed: () {
                        if (item.quantity > 1) {
                          ref.read(cartProvider.notifier).updateQuantity(
                            item.medicine.id,
                            item.quantity - 1,
                          );
                        }
                      },
                      icon: const Icon(Icons.remove_circle_outline),
                      iconSize: 24.sp,
                    ),
                    
                    Container(
                      width: 40.w,
                      alignment: Alignment.center,
                      child: Text(
                        '${item.quantity}',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    
                    IconButton(
                      onPressed: () {
                        ref.read(cartProvider.notifier).updateQuantity(
                          item.medicine.id,
                          item.quantity + 1,
                        );
                      },
                      icon: const Icon(Icons.add_circle_outline),
                      iconSize: 24.sp,
                    ),
                  ],
                ),
                
                TextButton(
                  onPressed: () {
                    ref.read(cartProvider.notifier).removeItem(item.medicine.id);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('${item.medicine.name} removed from cart'),
                        duration: const Duration(seconds: 2),
                      ),
                    );
                  },
                  child: Text(
                    'Remove',
                    style: TextStyle(
                      color: Colors.red,
                      fontSize: 12.sp,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildCartSummary(BuildContext context, WidgetRef ref, CartState cartState) {
    return Container(
      padding: EdgeInsets.all(24.w),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: Column(
        children: [
          // Summary Rows
          _buildSummaryRow(
            context,
            'Subtotal',
            '\$${cartState.subtotal.toStringAsFixed(2)}',
          ),
          
          SizedBox(height: 8.h),
          
          _buildSummaryRow(
            context,
            'Tax (10%)',
            '\$${cartState.tax.toStringAsFixed(2)}',
          ),
          
          SizedBox(height: 8.h),
          
          Divider(color: Colors.grey[300]),
          
          SizedBox(height: 8.h),
          
          _buildSummaryRow(
            context,
            'Total',
            '\$${cartState.total.toStringAsFixed(2)}',
            isTotal: true,
          ),
          
          SizedBox(height: 24.h),
          
          // Checkout Button
          SizedBox(
            width: double.infinity,
            child: LoadingButton(
              onPressed: () => _proceedToCheckout(context, ref),
              isLoading: false,
              text: 'Proceed to Checkout',
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildSummaryRow(
    BuildContext context,
    String label,
    String value, {
    bool isTotal = false,
  }) {
    return Row(
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
            fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        const Spacer(),
        Text(
          value,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
            fontWeight: FontWeight.bold,
            color: isTotal ? Theme.of(context).primaryColor : null,
          ),
        ),
      ],
    );
  }
  
  void _showClearCartDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear Cart'),
        content: const Text('Are you sure you want to remove all items from your cart?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              ref.read(cartProvider.notifier).clearCart();
              Navigator.of(context).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Cart cleared'),
                  duration: Duration(seconds: 2),
                ),
              );
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Clear'),
          ),
        ],
      ),
    );
  }
  
  void _proceedToCheckout(BuildContext context, WidgetRef ref) {
    // TODO: Implement checkout flow
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Checkout feature coming soon'),
        duration: Duration(seconds: 2),
      ),
    );
  }
}