import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import POSSystem from './POSSystem';

async function getPOSData() {
  const [medicines, customers, employees] = await Promise.all([
    // Get available medicines with stock
    prisma.medicine.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
        inventories: {
          where: { 
            deletedAt: null,
            quantity: { gt: 0 }
          }
        }
      }
    }),
    
    // Get customers for quick lookup
    prisma.customer.findMany({
      where: { deletedAt: null },
      orderBy: { firstName: 'asc' },
      take: 100 // Limit for performance
    }),
    
    // Get active employees
    prisma.employee.findMany({
      where: { 
        status: 'ACTIVE',
        deletedAt: null 
      },
      include: { user: true }
    })
  ]);

  // Calculate available stock for each medicine
  const medicinesWithStock = medicines.map(medicine => ({
    ...medicine,
    availableStock: medicine.inventories.reduce((sum, inv) => sum + inv.quantity, 0)
  })).filter(medicine => medicine.availableStock > 0);

  return {
    medicines: medicinesWithStock,
    customers,
    employees
  };
}

export default async function POSPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;
  if (!['ADMIN', 'PHARMACIST', 'STAFF'].includes(userRole)) {
    redirect('/dashboard');
  }

  const posData = await getPOSData();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Point of Sale</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Process in-store sales and manage transactions
        </p>
      </div>

      <POSSystem 
        medicines={posData.medicines}
        customers={posData.customers}
        employees={posData.employees}
        currentUser={session.user}
      />
    </>
  );
}