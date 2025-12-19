import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import SettingsManagement from './SettingsManagement';

async function getSystemSettings() {
  // Get system statistics and settings
  const [
    totalUsers,
    totalMedicines,
    totalOrders,
    totalRevenue,
    recentActivity
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.medicine.count({ where: { deletedAt: null } }),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ['DELIVERED', 'PAID'] } }
    }),
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } }
      }
    })
  ]);

  return {
    totalUsers,
    totalMedicines,
    totalOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    recentActivity
  };
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;
  if (!['ADMIN'].includes(userRole)) {
    redirect('/dashboard');
  }

  const systemData = await getSystemSettings();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage system configuration and preferences
        </p>
      </div>

      <SettingsManagement systemData={systemData} />
    </div>
  );
}