import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import InsuranceClaimsManagement from './InsuranceClaimsManagement';

async function getInsuranceClaimsData() {
  const [claims, providers, sales] = await Promise.all([
    prisma.insuranceClaim.findMany({
      include: {
        provider: true,
        sale: {
          include: {
            customer: true,
            items: { include: { medicine: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    }),
    prisma.insuranceProvider.findMany({
      orderBy: { name: 'asc' }
    }),
    prisma.sale.findMany({
      where: {
        paymentMethod: 'INSURANCE',
        insurance: null // Sales without claims
      },
      include: {
        customer: true,
        items: { include: { medicine: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
  ]);

  return {
    claims,
    providers,
    sales
  };
}

export default async function InsuranceClaimsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;
  if (!['ADMIN', 'PHARMACIST'].includes(userRole)) {
    redirect('/dashboard');
  }

  const data = await getInsuranceClaimsData();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Insurance Claims</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage insurance claims and provider relationships
        </p>
      </div>

      <InsuranceClaimsManagement 
        data={data}
        currentUser={session.user}
      />
    </>
  );
}