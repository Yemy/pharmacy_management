"use client";

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Eye,
  ArrowRight,
  FileText,
  Clock
} from 'lucide-react';

interface DashboardData {
  totalOrders: number;
  totalRevenue: number;
  totalMedicines: number;
  totalUsers: number;
  recentOrders: any[];
  lowStockMedicines: any[];
  expiringMedicines: any[];
  pendingPrescriptions: number;
}

interface AdminDashboardProps {
  data: DashboardData;
  userRole: string;
}

export default function AdminDashboard({ data, userRole }: AdminDashboardProps) {
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
    }).format(new Date(date));
  };

  const getDaysUntilExpiry = (expiryDate: Date) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      PAID: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      PACKED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[status as keyof typeof colors] || colors.PENDING;
  };

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(data.totalRevenue)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalOrders}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
              <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalMedicines}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Medicines</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-lg">
              <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalUsers}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="font-medium text-red-900 dark:text-red-100">Low Stock Alert</h3>
              </div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
                {data.lowStockMedicines.length}
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">medicines need restocking</p>
            </div>
            <Link href="/admin/medicines?tab=lowstock">
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20">
                View All
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <h3 className="font-medium text-yellow-900 dark:text-yellow-100">Expiring Soon</h3>
              </div>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                {data.expiringMedicines.length}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">medicines expiring in 30 days</p>
            </div>
            <Link href="/admin/medicines?tab=expiring">
              <Button variant="outline" size="sm" className="text-yellow-600 border-yellow-200 hover:bg-yellow-50 dark:text-yellow-400 dark:border-yellow-800 dark:hover:bg-yellow-900/20">
                View All
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-medium text-blue-900 dark:text-blue-100">Pending Prescriptions</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {data.pendingPrescriptions}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">awaiting verification</p>
            </div>
            <Link href="/admin/prescriptions">
              <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20">
                Review
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
            <Link href="/admin/orders">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {order.user.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {order.user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/orders`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Low Stock Medicines */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Low Stock Medicines</h3>
            <Link href="/admin/inventory">
              <Button variant="outline" size="sm">
                Manage Stock
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {data.lowStockMedicines.map((medicine) => (
              <div key={medicine.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {medicine.name}
                  </div>
                  {medicine.category && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {medicine.category.name}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="font-medium text-red-600 dark:text-red-400">
                      {medicine.currentStock} left
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Min: {medicine.minStock}
                  </div>
                </div>
              </div>
            ))}
            {data.lowStockMedicines.length === 0 && (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                All medicines are well stocked
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expiring Medicines */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Medicines Expiring Soon</h3>
          <Link href="/admin/medicines?tab=expiring">
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Days Left</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.expiringMedicines.map((inventory) => {
                const daysLeft = getDaysUntilExpiry(inventory.expiryDate);
                const isUrgent = daysLeft <= 7;
                
                return (
                  <TableRow key={inventory.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {inventory.medicine.name}
                        </div>
                        {inventory.medicine.category && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {inventory.medicine.category.name}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-white">
                      {inventory.batchNumber || 'N/A'}
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-white">
                      {inventory.quantity}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-900 dark:text-white">
                          {formatDate(inventory.expiryDate)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                        {daysLeft} days
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={isUrgent 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                        }
                      >
                        {isUrgent ? (
                          <>
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Urgent
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Warning
                          </>
                        )}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {data.expiringMedicines.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No medicines expiring in the next 30 days
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/orders">
            <Button variant="outline" className="w-full justify-start">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Manage Orders
            </Button>
          </Link>
          <Link href="/admin/medicines">
            <Button variant="outline" className="w-full justify-start">
              <Package className="w-4 h-4 mr-2" />
              Add Medicine
            </Button>
          </Link>
          <Link href="/admin/inventory">
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="w-4 h-4 mr-2" />
              Update Stock
            </Button>
          </Link>
          <Link href="/admin/reports">
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Reports
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}