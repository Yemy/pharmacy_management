"use client";

import { OrderStatus } from "@prisma/client";

const statusConfig = {
  [OrderStatus.PENDING]: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800",
  },
  [OrderStatus.PAID]: {
    label: "Paid",
    className: "bg-blue-100 text-blue-800",
  },
  [OrderStatus.PACKED]: {
    label: "Packed",
    className: "bg-purple-100 text-purple-800",
  },
  [OrderStatus.DELIVERED]: {
    label: "Delivered",
    className: "bg-green-100 text-green-800",
  },
  [OrderStatus.CANCELLED]: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800",
  },
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}