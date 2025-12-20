import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models/medicine_model.dart';
import '../../core/storage/hive_service.dart';

class CartItem {
  final Medicine medicine;
  final int quantity;
  final double price;
  
  const CartItem({
    required this.medicine,
    required this.quantity,
    required this.price,
  });
  
  double get total => price * quantity;
  
  CartItem copyWith({
    Medicine? medicine,
    int? quantity,
    double? price,
  }) {
    return CartItem(
      medicine: medicine ?? this.medicine,
      quantity: quantity ?? this.quantity,
      price: price ?? this.price,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'medicineId': medicine.id,
      'medicineName': medicine.name,
      'quantity': quantity,
      'price': price,
      'medicine': medicine.toJson(),
    };
  }
  
  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      medicine: Medicine.fromJson(json['medicine']),
      quantity: json['quantity'],
      price: json['price'].toDouble(),
    );
  }
}

class CartState {
  final List<CartItem> items;
  final bool isLoading;
  final String? error;
  
  const CartState({
    required this.items,
    required this.isLoading,
    this.error,
  });
  
  CartState copyWith({
    List<CartItem>? items,
    bool? isLoading,
    String? error,
  }) {
    return CartState(
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
  
  double get subtotal => items.fold(0.0, (sum, item) => sum + item.total);
  
  double get tax => subtotal * 0.1; // 10% tax
  
  double get total => subtotal + tax;
  
  int get totalItems => items.fold(0, (sum, item) => sum + item.quantity);
  
  bool get isEmpty => items.isEmpty;
  
  bool get isNotEmpty => items.isNotEmpty;
}

class CartNotifier extends StateNotifier<CartState> {
  CartNotifier() : super(const CartState(
    items: [],
    isLoading: false,
  )) {
    _loadCartFromStorage();
  }
  
  Future<void> _loadCartFromStorage() async {
    state = state.copyWith(isLoading: true);
    
    try {
      final cartData = HiveService.getCartItems();
      final items = cartData.map((item) => CartItem.fromJson(item)).toList();
      
      state = state.copyWith(
        items: items,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        items: [],
        isLoading: false,
        error: 'Failed to load cart',
      );
    }
  }
  
  Future<void> _saveCartToStorage() async {
    try {
      final cartData = state.items.map((item) => item.toJson()).toList();
      await HiveService.setCartItems(cartData);
    } catch (e) {
      // Handle error silently
    }
  }
  
  Future<void> addItem(Medicine medicine, {int quantity = 1}) async {
    final existingIndex = state.items.indexWhere(
      (item) => item.medicine.id == medicine.id,
    );
    
    List<CartItem> updatedItems;
    
    if (existingIndex != -1) {
      // Update existing item
      final existingItem = state.items[existingIndex];
      final updatedItem = existingItem.copyWith(
        quantity: existingItem.quantity + quantity,
      );
      
      updatedItems = List.from(state.items);
      updatedItems[existingIndex] = updatedItem;
    } else {
      // Add new item
      final newItem = CartItem(
        medicine: medicine,
        quantity: quantity,
        price: medicine.price,
      );
      
      updatedItems = [...state.items, newItem];
    }
    
    state = state.copyWith(items: updatedItems);
    await _saveCartToStorage();
  }
  
  Future<void> removeItem(int medicineId) async {
    final updatedItems = state.items.where(
      (item) => item.medicine.id != medicineId,
    ).toList();
    
    state = state.copyWith(items: updatedItems);
    await _saveCartToStorage();
  }
  
  Future<void> updateQuantity(int medicineId, int quantity) async {
    if (quantity <= 0) {
      await removeItem(medicineId);
      return;
    }
    
    final updatedItems = state.items.map((item) {
      if (item.medicine.id == medicineId) {
        return item.copyWith(quantity: quantity);
      }
      return item;
    }).toList();
    
    state = state.copyWith(items: updatedItems);
    await _saveCartToStorage();
  }
  
  Future<void> clearCart() async {
    state = state.copyWith(items: []);
    await HiveService.clearCart();
  }
  
  bool isInCart(int medicineId) {
    return state.items.any((item) => item.medicine.id == medicineId);
  }
  
  int getQuantity(int medicineId) {
    final item = state.items.firstWhere(
      (item) => item.medicine.id == medicineId,
      orElse: () => CartItem(
        medicine: Medicine(
          id: 0,
          name: '',
          slug: '',
          price: 0,
          minStock: 0,
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        ),
        quantity: 0,
        price: 0,
      ),
    );
    
    return item.quantity;
  }
  
  void clearError() {
    state = state.copyWith(error: null);
  }
}

// Providers
final cartProvider = StateNotifierProvider<CartNotifier, CartState>((ref) {
  return CartNotifier();
});

final cartItemsProvider = Provider<List<CartItem>>((ref) {
  return ref.watch(cartProvider).items;
});

final cartTotalProvider = Provider<double>((ref) {
  return ref.watch(cartProvider).total;
});

final cartItemCountProvider = Provider<int>((ref) {
  return ref.watch(cartProvider).totalItems;
});

final cartIsEmptyProvider = Provider<bool>((ref) {
  return ref.watch(cartProvider).isEmpty;
});