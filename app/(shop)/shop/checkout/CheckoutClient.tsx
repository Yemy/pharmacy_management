"use client";

import { useCart } from "@/components/CartProvider";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/actions/order";

interface Medicine {
  id: number;
  name: string;
  price: number;
  category: { name: string } | null;
  inventories: { quantity: number }[];
}

export default function CheckoutClient() {
  const { items, clear } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (items.length === 0) {
      router.push('/shop/cart');
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
        console.error('Failed to fetch medicines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, [items, router]);

  const getOrderItems = () => {
    return items.map(item => {
      const medicine = medicines.find(m => m.id === item.medicineId);
      return {
        medicineId: item.medicineId,
        quantity: item.quantity,
        price: medicine?.price || 0,
        medicine,
      };
    }).filter(item => item.medicine);
  };

  const orderItems = getOrderItems();
  const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmitOrder = async () => {
    if (!session?.user) return;
    
    setSubmitting(true);
    try {
      const result = await createOrder({
        items: orderItems.map(item => ({
          medicineId: item.medicineId,
          quantity: item.quantity,
          price: item.price,
        })),
        note: note || undefined,
      });

      if (result.success && result.data) {
        clear();
        router.push(`/shop/orders/${result.data.id}`);
      } else {
        alert(result.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      alert('Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (orderItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No items to checkout</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Order Details */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {orderItems.map((item) => (
              <div key={item.medicineId} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center">
                    <span className="text-lg">💊</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{item.medicine!.name}</h3>
                    <p className="text-sm text-gray-500">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Order Notes</h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any special instructions or notes..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>
      </div>

      {/* Order Summary & Payment */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>$0.00</span>
            </div>
            <hr />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Name:</strong> {session?.user?.name}</p>
            <p><strong>Email:</strong> {session?.user?.email}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              <strong>Demo Mode:</strong> This is a demonstration. No actual payment will be processed.
            </p>
          </div>
          
          <button
            onClick={handleSubmitOrder}
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}