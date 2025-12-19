"use client";

import { OrderStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Package, Truck, XCircle, AlertCircle } from 'lucide-react';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusConfig = {
  PENDING: { 
    label: 'Pending', 
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800', 
    icon: Clock 
  },
  PAID: { 
    label: 'Paid', 
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800', 
    icon: CheckCircle 
  },
  PACKED: { 
    label: 'Packed', 
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800', 
    icon: Package 
  },
  DELIVERED: { 
    label: 'Delivered', 
    className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800', 
    icon: Truck 
  },
  CANCELLED: { 
    label: 'Cancelled', 
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800', 
    icon: XCircle 
  },
  REJECTED: { 
    label: 'Rejected', 
    className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800', 
    icon: AlertCircle 
  },
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}