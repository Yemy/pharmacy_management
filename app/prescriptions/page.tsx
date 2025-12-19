import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PrescriptionManager from './PrescriptionManager';

async function getUserPrescriptions(userId: number) {
  return await prisma.prescription.findMany({
    where: { userId },
    include: {
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

export default async function PrescriptionsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login?callbackUrl=/prescriptions');
  }

  const prescriptions = await getUserPrescriptions(parseInt(session.user.id as string));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Prescriptions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Upload and manage your medical prescriptions
          </p>
        </div>

        <PrescriptionManager initialPrescriptions={prescriptions} />
      </div>
    </div>
  );
}