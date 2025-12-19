import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import OrderManagement from './OrderManagement';

async function getOrders() {
  return await prisma.order.findMany({
    include: {
      user: true,
      items: {
        include: {
          medicine: true,
        },
      },
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;
  if (!['ADMIN', 'PHARMACIST', 'STAFF'].includes(userRole)) {
    redirect('/dashboard');
  }

  const orders = await getOrders();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage customer orders and update their status
        </p>
      </div>

      <Suspense fallback={<div>Loading orders...</div>}>
        <OrderManagement initialOrders={orders} />
      </Suspense>
    </div>
  );
}