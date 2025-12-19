import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PrescriptionManagement from './PrescriptionManagement';

async function getPrescriptions() {
  return await prisma.prescription.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true }
      },
      order: {
        include: {
          items: {
            include: { medicine: true }
          }
        }
      }
    },
    orderBy: { uploadedAt: 'desc' }
  });
}

export default async function AdminPrescriptionsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;
  if (!['ADMIN', 'PHARMACIST'].includes(userRole)) {
    redirect('/admin/dashboard');
  }

  const prescriptions = await getPrescriptions();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Prescription Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Review and verify customer prescriptions
        </p>
      </div>

      <Suspense fallback={<div>Loading prescriptions...</div>}>
        <PrescriptionManagement initialPrescriptions={prescriptions} />
      </Suspense>
    </div>
  );
}