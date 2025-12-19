import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminDashboard from './AdminDashboard';

async function getDashboardData() {
  const [
    totalOrders,
    totalRevenue,
    totalMedicines,
    totalUsers,
    recentOrders,
    lowStockMedicines,
    expiringMedicines,
    pendingPrescriptions
  ] = await Promise.all([
    // Total orders
    prisma.order.count(),
    
    // Total revenue
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ['DELIVERED', 'PAID'] } }
    }),
    
    // Total medicines
    prisma.medicine.count({ where: { deletedAt: null } }),
    
    // Total users
    prisma.user.count({ where: { deletedAt: null } }),
    
    // Recent orders
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { medicine: { select: { name: true } } } }
      }
    }),
    
    // Low stock medicines - using the same logic as medicine management
    prisma.medicine.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        inventories: {
          where: {
            deletedAt: null,
            quantity: { gt: 0 },
          },
        },
        category: { select: { name: true } }
      },
    }).then(medicines => {
      return medicines.filter(medicine => {
        const totalStock = medicine.inventories.reduce((sum, inv) => sum + inv.quantity, 0);
        return totalStock <= medicine.minStock;
      }).slice(0, 5);
    }),
    
    // Expiring medicines
    prisma.inventory.findMany({
      where: {
        expiryDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          gte: new Date()
        },
        quantity: { gt: 0 },
        deletedAt: null
      },
      include: {
        medicine: {
          include: { category: true }
        }
      },
      orderBy: { expiryDate: 'asc' },
      take: 5
    }),
    
    // Pending prescriptions
    prisma.prescription.count({
      where: { verified: false }
    })
  ]);

  return {
    totalOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    totalMedicines,
    totalUsers,
    recentOrders,
    lowStockMedicines: lowStockMedicines.map(medicine => ({
      ...medicine,
      currentStock: medicine.inventories.reduce((sum, inv) => sum + inv.quantity, 0)
    })),
    expiringMedicines,
    pendingPrescriptions
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;
  if (!['ADMIN', 'PHARMACIST', 'STAFF'].includes(userRole)) {
    redirect('/dashboard');
  }

  const dashboardData = await getDashboardData();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome back, {session.user.name || session.user.email}
        </p>
      </div>

      <Suspense fallback={<div>Loading dashboard...</div>}>
        <AdminDashboard data={dashboardData} userRole={userRole} />
      </Suspense>
    </>
  );
}