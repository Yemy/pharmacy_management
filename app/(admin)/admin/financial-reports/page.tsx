import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import FinancialReportsManagement from './FinancialReportsManagement';

async function getFinancialData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const last12Months = new Date(now.getFullYear() - 1, now.getMonth(), 1);

  const [
    monthlyRevenue,
    yearlyRevenue,
    expenseData,
    profitLossData,
    cashFlowData,
    taxData
  ] = await Promise.all([
    // Monthly revenue breakdown
    prisma.$queryRaw`
      SELECT 
        EXTRACT(MONTH FROM "createdAt") as month,
        EXTRACT(YEAR FROM "createdAt") as year,
        SUM(total) as revenue,
        SUM(tax) as tax_collected,
        COUNT(*) as transactions,
        AVG(total) as avg_transaction
      FROM "Sale"
      WHERE "createdAt" >= ${last12Months}
      GROUP BY EXTRACT(YEAR FROM "createdAt"), EXTRACT(MONTH FROM "createdAt")
      ORDER BY year, month
    `,
    
    // Yearly totals
    prisma.sale.aggregate({
      _sum: { total: true, tax: true, discount: true },
      _count: true,
      where: { createdAt: { gte: startOfYear } }
    }),
    
    // Expense data (purchase orders as expenses)
    prisma.purchaseOrder.aggregate({
      _sum: { total: true },
      _count: true,
      where: { 
        createdAt: { gte: startOfYear },
        status: 'RECEIVED'
      }
    }),
    
    // Profit/Loss calculation
    prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', s."createdAt") as month,
        SUM(s.total) as revenue,
        COALESCE(SUM(po.total), 0) as expenses,
        SUM(s.total) - COALESCE(SUM(po.total), 0) as profit
      FROM "Sale" s
      LEFT JOIN "PurchaseOrder" po ON DATE_TRUNC('month', s."createdAt") = DATE_TRUNC('month', po."createdAt")
        AND po.status = 'RECEIVED'
      WHERE s."createdAt" >= ${startOfYear}
      GROUP BY DATE_TRUNC('month', s."createdAt")
      ORDER BY month
    `,
    
    // Cash flow by payment method
    prisma.sale.groupBy({
      by: ['paymentMethod'],
      _sum: { total: true },
      _count: true,
      where: { createdAt: { gte: startOfMonth } }
    }),
    
    // Tax data
    prisma.sale.aggregate({
      _sum: { tax: true },
      where: { createdAt: { gte: startOfYear } }
    })
  ]);

  return {
    monthlyRevenue: monthlyRevenue as any,
    yearlyRevenue,
    expenseData,
    profitLossData: profitLossData as any,
    cashFlowData,
    taxData
  };
}

export default async function FinancialReportsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;
  if (!['ADMIN', 'PHARMACIST'].includes(userRole)) {
    redirect('/dashboard');
  }

  const data = await getFinancialData();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Reports</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Comprehensive financial analysis and reporting
        </p>
      </div>

      <FinancialReportsManagement 
        data={data}
        currentUser={session.user}
      />
    </>
  );
}