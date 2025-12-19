import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import InventoryManagement from './InventoryManagement';

async function getInventory() {
  return await prisma.inventory.findMany({
    where: { deletedAt: null },
    include: {
      medicine: {
        include: { category: true }
      },
      supplier: true
    },
    orderBy: { expiryDate: 'asc' }
  });
}

async function getMedicines() {
  return await prisma.medicine.findMany({
    where: { deletedAt: null },
    include: { category: true },
    orderBy: { name: 'asc' }
  });
}

async function getSuppliers() {
  return await prisma.supplier.findMany({
    where: { deletedAt: null },
    orderBy: { name: 'asc' }
  });
}

export default async function InventoryPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;
  if (!['ADMIN', 'PHARMACIST', 'STAFF'].includes(userRole)) {
    redirect('/admin/dashboard');
  }

  const [inventory, medicines, suppliers] = await Promise.all([
    getInventory(),
    getMedicines(),
    getSuppliers()
  ]);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage stock levels, batches, and expiry dates
        </p>
      </div>

      <Suspense fallback={<div>Loading inventory...</div>}>
        <InventoryManagement 
          initialInventory={inventory} 
          medicines={medicines}
          suppliers={suppliers}
        />
      </Suspense>
    </>
  );
}