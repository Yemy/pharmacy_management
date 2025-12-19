import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AnalyticsDashboard from './AnalyticsDashboard';

async function getAnalyticsData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    // Current month sales
    currentMonthSales,
    lastMonthSales,
    
    // Daily sales for the last 30 days
    dailySalesReports,
    
    // Top selling medicines
    topMedicines,
    
    // Sales by payment method
    paymentMethodStats,
    
    // Monthly sales for the year
    monthlySales,
    
    // Customer analytics
    customerStats,
    
    // Employee performance
    employeeStats
  ] = await Promise.all([
    // Current month sales
    prisma.sale.aggregate({
      _sum: { total: true },
      _count: true,
      where: {
        createdAt: { gte: startOfMonth }
      }
    }),
    
    // Last month sales
    prisma.sale.aggregate({
      _sum: { total: true },
      _count: true,
      where: {
        createdAt: { 
          gte: startOfLastMonth,
          lte: endOfLastMonth
        }
      }
    }),
    
    // Daily sales reports
    prisma.dailySalesReport.findMany({
      where: {
        date: { gte: last30Days }
      },
      orderBy: { date: 'asc' }
    }),
    
    // Top selling medicines
    prisma.saleItem.groupBy({
      by: ['medicineId'],
      _sum: { quantity: true, total: true },
      _count: true,
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10
    }).then(async (items) => {
      const medicineIds = items.map(item => item.medicineId);
      const medicines = await prisma.medicine.findMany({
        where: { id: { in: medicineIds } },
        include: { category: true }
      });
      
      return items.map(item => ({
        ...item,
        medicine: medicines.find(m => m.id === item.medicineId)
      }));
    }),
    
    // Payment method statistics
    prisma.sale.groupBy({
      by: ['paymentMethod'],
      _sum: { total: true },
      _count: true,
      where: {
        createdAt: { gte: startOfMonth }
      }
    }),
    
    // Monthly sales for the year
    prisma.$queryRaw`
      SELECT 
        EXTRACT(MONTH FROM "createdAt") as month,
        EXTRACT(YEAR FROM "createdAt") as year,
        SUM(total) as total_sales,
        COUNT(*) as transaction_count
      FROM "Sale"
      WHERE "createdAt" >= ${startOfYear}
      GROUP BY EXTRACT(YEAR FROM "createdAt"), EXTRACT(MONTH FROM "createdAt")
      ORDER BY year, month
    `,
    
    // Customer statistics
    prisma.customer.aggregate({
      _count: true,
      _avg: { totalSpent: true, loyaltyPoints: true }
    }),
    
    // Employee performance
    prisma.sale.groupBy({
      by: ['employeeId'],
      _sum: { total: true },
      _count: true,
      where: {
        createdAt: { gte: startOfMonth },
        employeeId: { not: null }
      },
      orderBy: { _sum: { total: 'desc' } }
    }).then(async (sales) => {
      const employeeIds = sales.map(s => s.employeeId).filter(Boolean);
      const employees = await prisma.employee.findMany({
        where: { id: { in: employeeIds as number[] } },
        include: { user: true }
      });
      
      return sales.map(sale => ({
        ...sale,
        employee: employees.find(e => e.id === sale.employeeId)
      }));
    })
  ]);

  return {
    currentMonthSales: {
      total: currentMonthSales._sum.total || 0,
      count: currentMonthSales._count
    },
    lastMonthSales: {
      total: lastMonthSales._sum.total || 0,
      count: lastMonthSales._count
    },
    dailySalesReports,
    topMedicines,
    paymentMethodStats,
    monthlySales: monthlySales as any[],
    customerStats,
    employeeStats
  };
}

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;
  if (!['ADMIN', 'PHARMACIST'].includes(userRole)) {
    redirect('/dashboard');
  }

  const analyticsData = await getAnalyticsData();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sales Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Comprehensive sales data and business intelligence
        </p>
      </div>

      <AnalyticsDashboard data={analyticsData} />
    </>
  );
}