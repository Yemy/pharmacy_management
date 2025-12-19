import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PurchaseOrderManagement from './PurchaseOrderManagement';

async function getPurchaseOrderData() {
  const [purchaseOrders, suppliers, medicines, employees] = await Promise.all([
    prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        employee: { include: { user: true } },
        items: {
          include: { medicine: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    }),
    prisma.supplier.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' }
    }),
    prisma.medicine.findMany({
      where: { deletedAt: null },
      include: { category: true },
      orderBy: { name: 'asc' }
    }),
    prisma.employee.findMany({
      where: { deletedAt: null },
      include: { user: true },
      orderBy: { firstName: 'asc' }
    })
  ]);

  return {
    purchaseOrders,
    suppliers,
    medicines,
    employees
  };
}

export default async function PurchaseOrdersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;
  if (!['ADMIN', 'PHARMACIST'].includes(userRole)) {
    redirect('/dashboard');
  }

  const data = await getPurchaseOrderData();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Purchase Orders</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage supplier orders and inventory procurement
        </p>
      </div>

      <PurchaseOrderManagement 
        data={data}
        currentUser={session.user}
      />
    </>
  );
}