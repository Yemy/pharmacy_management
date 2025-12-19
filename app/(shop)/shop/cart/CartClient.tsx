"use client";

import { useCart } from "@/components/CartProvider";
import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Medicine {
  id: number;
  name: string;
  slug: string;
  price: number;
  category: { name: string } | null;
  inventories: { quantity: number }[];
}

export default function CartClient() {
  const { items, remove, clear, updateQuantity } = useCart();
  const { data: session } = useSession();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (items.length === 0) {
      setMedicines([]);
      setLoading(false);
      return;
    }

    const fetchMedicines = async () => {
      try {
        const response = await fetch('/api/medicines/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ medicineIds: items.map(item => item.medicineId) }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setMedicines(data);
        }
      } catch (error) {
        console.error('Failed to fetch cart medicines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, [items]);

  const incrementQuantity = (medicineId: number) => {
    const currentItem = items.find(item => item.medicineId === medicineId);
    if (currentItem) {
      updateQuantity(medicineId, currentItem.quantity + 1);
    }
  };

  const decrementQuantity = (medicineId: number) => {
    const currentItem = items.find(item => item.medicineId === medicineId);
    if (currentItem) {
      updateQuantity(medicineId, currentItem.quantity - 1);
    }
  };

  const getCartItemsWithMedicines = () => {
    return items.map(item => {
      const medicine = medicines.find(m => m.id === item.medicineId);
      const totalStock = medicine?.inventories.reduce((sum, inv) => sum + inv.quantity, 0) || 0;
      return {
        ...item,
        medicine,
        totalStock,
        subtotal: medicine ? medicine.price * item.quantity : 0,
      };
    }).filter(item => item.medicine);
  };

  const cartItems = getCartItemsWithMedicines();
  const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Add some medicines to get started</p>
        <Link
          href="/shop/catalog"
          className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          Browse Medicines
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Cart Items ({cartItems.length})</h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {cartItems.map((item) => (
              <div key={item.medicineId} className="p-6 flex items-center space-x-4">
                <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💊</span>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{item.medicine!.name}</h3>
                  {item.medicine!.category && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.medicine!.category.name}</p>
                  )}
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    ${item.medicine!.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.totalStock} available
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => decrementQuantity(item.medicineId)}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  
                  <span className="w-12 text-center font-medium text-gray-900 dark:text-white">{item.quantity}</span>
                  
                  <button
                    onClick={() => incrementQuantity(item.medicineId)}
                    disabled={item.quantity >= item.totalStock}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">${item.subtotal.toFixed(2)}</p>
                  <button
                    onClick={() => remove(item.medicineId)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 mt-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Shipping</span>
              <span className="text-green-600 dark:text-green-400">Free</span>
            </div>
            <hr className="border-gray-200 dark:border-gray-700" />
            <div className="flex justify-between font-semibold text-lg text-gray-900 dark:text-white">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {session?.user ? (
            <Link
              href="/shop/checkout"
              className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-center block font-medium"
            >
              Proceed to Checkout
            </Link>
          ) : (
            <div className="space-y-2">
              <Link
                href="/login?callbackUrl=/shop/cart"
                className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-center block font-medium"
              >
                Login to Checkout
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                New customer?{" "}
                <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Create account
                </Link>
              </p>
            </div>
          )}

          <button
            onClick={clear}
            className="w-full mt-4 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium transition-colors"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}