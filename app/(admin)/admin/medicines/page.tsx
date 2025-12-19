import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import MedicineManagement from './MedicineManagement';

async function getMedicines() {
  return await prisma.medicine.findMany({
    where: { deletedAt: null },
    include: {
      category: true,
      inventories: {
        where: { deletedAt: null },
      },
    },
    orderBy: { name: 'asc' },
  });
}

async function getCategories() {
  return await prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: { name: 'asc' },
  });
}

export default async function MedicinesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;
  if (!['ADMIN', 'PHARMACIST'].includes(userRole)) {
    redirect('/dashboard');
  }

  const [medicines, categories] = await Promise.all([
    getMedicines(),
    getCategories(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Medicine Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Add, update, and manage medicines in your inventory
        </p>
      </div>

      <Suspense fallback={<div>Loading medicines...</div>}>
        <MedicineManagement initialMedicines={medicines} categories={categories} />
      </Suspense>
    </div>
  );
}