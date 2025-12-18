import { prisma } from "@/lib/prisma";
import CartClient from "./CartClient";

async function getCartMedicines(medicineIds: number[]) {
  if (medicineIds.length === 0) return [];
  
  return await prisma.medicine.findMany({
    where: {
      id: { in: medicineIds },
      deletedAt: null,
    },
    include: {
      category: true,
      inventories: {
        where: { deletedAt: null },
        select: { quantity: true },
      },
    },
  });
}

export default async function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        <CartClient />
      </div>
    </div>
  );
}