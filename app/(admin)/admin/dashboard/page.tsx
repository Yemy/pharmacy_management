import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  DollarSign 
} from "lucide-react";

async function getDashboardStats() {
  const [
    totalMedicines,
    totalUsers,
    totalOrders,
    lowStockCount,
    expiringSoonCount,
    todayRevenue
  ] = await Promise.all([
    prisma.medicine.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.order.count(),
    prisma.inventory.count({
      where: {
        quantity: { lt: 10 },
        deletedAt: null
      }
    }),
    prisma.inventory.count({
      where: {
        expiryDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        },
        deletedAt: null
      }
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        },
        status: { in: ['PAID', 'PACKED', 'DELIVERED'] }
      }
    })
  ]);

  return {
    totalMedicines,
    totalUsers,
    totalOrders,
    lowStockCount,
    expiringSoonCount,
    todayRevenue: todayRevenue._sum.total || 0
  };
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;
  if (!['ADMIN', 'PHARMACIST', 'STAFF'].includes(userRole)) {
    redirect('/dashboard');
  }

  const stats = await getDashboardStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {session.user.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Medicines</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalMedicines}</p>
              </div>
              <Package className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <Users className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="w-12 h-12 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-3xl font-bold text-gray-900">${stats.todayRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-12 h-12 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-3xl font-bold text-red-600">{stats.lowStockCount}</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-3xl font-bold text-orange-600">{stats.expiringSoonCount}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <a
            href="/admin/medicines"
            className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            <Package className="w-8 h-8 mx-auto mb-2" />
            <span className="font-medium">Manage Medicines</span>
          </a>
          <a
            href="/admin/inventory"
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-center"
          >
            <TrendingUp className="w-8 h-8 mx-auto mb-2" />
            <span className="font-medium">Inventory</span>
          </a>
          <a
            href="/admin/orders"
            className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors text-center"
          >
            <ShoppingCart className="w-8 h-8 mx-auto mb-2" />
            <span className="font-medium">Orders</span>
          </a>
          <a
            href="/admin/users"
            className="bg-yellow-600 text-white p-4 rounded-lg hover:bg-yellow-700 transition-colors text-center"
          >
            <Users className="w-8 h-8 mx-auto mb-2" />
            <span className="font-medium">Users</span>
          </a>
        </div>

        {/* Alerts */}
        {(stats.lowStockCount > 0 || stats.expiringSoonCount > 0) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Attention Required</h3>
            <ul className="space-y-1 text-yellow-700">
              {stats.lowStockCount > 0 && (
                <li>• {stats.lowStockCount} items are running low on stock</li>
              )}
              {stats.expiringSoonCount > 0 && (
                <li>• {stats.expiringSoonCount} items are expiring within 30 days</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}