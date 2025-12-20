import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/models/simple_medicine_model.dart';

class CartItem {
  final Medicine medicine;
  final int quantity;
  
  CartItem({
    required this.medicine,
    required this.quantity,
  });
  
  double get totalPrice => medicine.price * quantity;
  
  CartItem copyWith({
    Medicine? medicine,
    int? quantity,
  }) {
    return CartItem(
      medicine: medicine ?? this.medicine,
      quantity: quantity ?? this.quantity,
    );
  }
}

class CartState {
  final List<CartItem> items;
  final bool isLoading;
  
  const CartState({
    required this.items,
    required this.isLoading,
  });
  
  CartState copyWith({
    List<CartItem>? items,
    bool? isLoading,
  }) {
    return CartState(
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
    );
  }
  
  double get totalAmount => items.fold(0.0, (sum, item) => sum + item.totalPrice);
  int get totalItems => items.fold(0, (sum, item) => sum + item.quantity);
  bool get isEmpty => items.isEmpty;
  bool get isNotEmpty => items.isNotEmpty;
}

class CartNotifier extends StateNotifier<CartState> {
  CartNotifier() : super(const CartState(items: [], isLoading: false));
  
  bool isInCart(int medicineId) {
    return state.items.any((item) => item.medicine.id == medicineId);
  }
  
  Future<void> addItem(Medicine medicine, {int quantity = 1}) async {
    state = state.copyWith(isLoading: true);
    
    try {
      final existingIndex = state.items.indexWhere(
        (item) => item.medicine.id == medicine.id,
      );
      
      List<CartItem> updatedItems = List.from(state.items);
      
      if (existingIndex != -1) {
        // Update existing item
        final existingItem = updatedItems[existingIndex];
        updatedItems[existingIndex] = existingItem.copyWith(
          quantity: existingItem.quantity + quantity,
        );
      } else {
        // Add new item
        updatedItems.add(CartItem(medicine: medicine, quantity: quantity));
      }
      
      state = state.copyWith(items: updatedItems, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false);
      rethrow;
    }
  }
  
  Future<void> removeItem(int medicineId) async {
    state = state.copyWith(isLoading: true);
    
    try {
      final updatedItems = state.items
          .where((item) => item.medicine.id != medicineId)
          .toList();
      
      state = state.copyWith(items: updatedItems, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false);
      rethrow;
    }
  }
  
  Future<void> updateQuantity(int medicineId, int quantity) async {
    if (quantity <= 0) {
      await removeItem(medicineId);
      return;
    }
    
    state = state.copyWith(isLoading: true);
    
    try {
      final updatedItems = state.items.map((item) {
        if (item.medicine.id == medicineId) {
          return item.copyWith(quantity: quantity);
        }
        return item;
      }).toList();
      
      state = state.copyWith(items: updatedItems, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false);
      rethrow;
    }
  }
  
  Future<void> clearCart() async {
    state = state.copyWith(isLoading: true);
    
    try {
      state = const CartState(items: [], isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false);
      rethrow;
    }
  }
}

// Provider
final cartProvider = StateNotifierProvider<CartNotifier, CartState>((ref) {
  return CartNotifier();
});

// Computed providers
final cartItemCountProvider = Provider<int>((ref) {
  return ref.watch(cartProvider).totalItems;
});

final cartTotalProvider = Provider<double>((ref) {
  return ref.watch(cartProvider).totalAmount;
});

final cartIsEmptyProvider = Provider<bool>((ref) {
  return ref.watch(cartProvider).isEmpty;
});