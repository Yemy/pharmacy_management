"use client";

import { useState } from "react";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatus } from "@/actions/order";
import { ChevronDown, Eye } from "lucide-react";

interface Order {
  id: number;
  status: OrderStatus;
  total: number;
  user: {
    name: string | null;
    email: string;
  };
  items: Array<{
    medicine: {
      name: string;
    };
    quantity: number;
    price: number;
  }>;
}

const statusFlow = {
  [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [OrderStatus.PACKED, OrderStatus.CANCELLED],
  [OrderStatus.PACKED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

export default function OrderActions({ order }: { order: Order }) {
  const [updating, setUpdating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const availableStatuses = statusFlow[order.status] || [];

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    setUpdating(true);
    setShowDropdown(false);
    
    try {
      const result = await updateOrderStatus(order.id, newStatus);
      if (!result.success) {
        alert(result.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Status update error:', error);
      alert('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        className="text-blue-600 hover:text-blue-900 p-1"
        title="View Order Details"
      >
        <Eye className="w-4 h-4" />
      </button>

      {availableStatuses.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={updating}
            className="flex items-center text-gray-600 hover:text-gray-900 p-1 disabled:opacity-50"
            title="Update Status"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border py-1 z-50">
              {availableStatuses.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}