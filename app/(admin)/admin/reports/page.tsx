import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ReportsManagement from './ReportsManagement';

async function getReportsData() {
  const [
    totalOrders,
    totalRevenue,
    totalMedicines,
    totalUsers,
    recentOrders,
    topMedicines,
    monthlyRevenue,
    ordersByStatus
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
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: { medicine: { select: { name: true } } }
        }
      }
    }),
    
    // Top selling medicines
    prisma.orderItem.groupBy({
      by: ['medicineId'],
      _sum: { quantity: true },
      _count: { medicineId: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10
    }),
    
    // Monthly revenue for the last 12 months
    prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        SUM(total) as revenue,
        COUNT(*) as orders
      FROM "Order" 
      WHERE "createdAt" >= NOW() - INTERVAL '12 months'
        AND status IN ('DELIVERED', 'PAID')
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
    `,
    
    // Orders by status
    prisma.order.groupBy({
      by: ['status'],
      _count: { status: true }
    })
  ]);

  // Get medicine names for top medicines
  const medicineIds = topMedicines.map(item => item.medicineId);
  const medicines = await prisma.medicine.findMany({
    where: { id: { in: medicineIds } },
    select: { id: true, name: true, category: { select: { name: true } } }
  });

  const topMedicinesWithNames = topMedicines.map(item => ({
    ...item,
    medicine: medicines.find(m => m.id === item.medicineId)
  }));

  return {
    totalOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    totalMedicines,
    totalUsers,
    recentOrders,
    topMedicines: topMedicinesWithNames,
    monthlyRevenue: monthlyRevenue as any[],
    ordersByStatus
  };
}

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;
  if (!['ADMIN', 'PHARMACIST'].includes(userRole)) {
    redirect('/admin/dashboard');
  }

  const reportsData = await getReportsData();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Business insights and performance metrics
        </p>
      </div>

      <Suspense fallback={<div>Loading reports...</div>}>
        <ReportsManagement data={reportsData} />
      </Suspense>
    </div>
  );
}