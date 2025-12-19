"use client";

import { useState } from 'react';
import { Order, OrderStatus, User, OrderItem, Medicine, Payment } from '@prisma/client';
import { updateOrderStatus } from '@/actions/order';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Eye, Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

type OrderWithDetails = Order & {
  user: User;
  items: (OrderItem & { medicine: Medicine })[];
  payment: Payment | null;
};

interface OrderManagementProps {
  initialOrders: OrderWithDetails[];
}

const statusConfig = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: Clock },
  PAID: { label: 'Paid', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: CheckCircle },
  PACKED: { label: 'Packed', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', icon: Package },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300', icon: XCircle },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: AlertCircle },
};

export default function OrderManagement({ initialOrders }: OrderManagementProps) {
  const [orders, setOrders] = useState<OrderWithDetails[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  const handleStatusUpdate = async (orderId: number, newStatus: OrderStatus) => {
    setIsUpdating(orderId);
    
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      
      if (result.success) {
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        ));
        toast.success(`Order status updated to ${statusConfig[newStatus].label}`);
      } else {
        toast.error(result.error || 'Failed to update order status');
      }
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const StatusIcon = statusConfig[order.status].icon;
              return (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.user.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{order.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{order.items.length} items</TableCell>
                  <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <Badge className={statusConfig[order.status].color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig[order.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Order Details - #{order.id}</DialogTitle>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium">Customer Information</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedOrder.user.name || 'N/A'}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedOrder.user.email}
                                  </p>
                                  {selectedOrder.user.phone && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {selectedOrder.user.phone}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-medium">Order Information</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Date: {formatDate(selectedOrder.createdAt)}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Total: {formatCurrency(selectedOrder.total)}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-sm">Status:</span>
                                    <Badge className={statusConfig[selectedOrder.status].color}>
                                      {statusConfig[selectedOrder.status].label}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-2">Order Items</h4>
                                <div className="space-y-2">
                                  {selectedOrder.items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                      <div>
                                        <span className="font-medium">{item.medicine.name}</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                          x{item.quantity}
                                        </span>
                                      </div>
                                      <span className="font-medium">
                                        {formatCurrency(item.price * item.quantity)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {selectedOrder.note && (
                                <div>
                                  <h4 className="font-medium">Order Note</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedOrder.note}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Select
                        value={order.status}
                        onValueChange={(value: OrderStatus) => handleStatusUpdate(order.id, value)}
                        disabled={isUpdating === order.id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([status, config]) => (
                            <SelectItem key={status} value={status}>
                              <div className="flex items-center space-x-2">
                                <config.icon className="w-4 h-4" />
                                <span>{config.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No orders found</h3>
          <p className="text-gray-500 dark:text-gray-400">Orders will appear here when customers place them.</p>
        </div>
      )}
    </div>
  );
}