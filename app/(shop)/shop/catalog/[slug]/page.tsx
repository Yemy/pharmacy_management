import React from 'react'
import { prisma } from '@/lib/prisma'
import AddToCartButton from '@/components/AddToCartButton'

type Props = { params: { slug: string } }

export default async function ProductPage({ params }: Props) {
  const { slug } = params
  const med = await prisma.medicine.findUnique({ where: { slug }, include: { category: true, inventories: true } })
  if (!med) return <div className="p-8">Product not found</div>

  const totalStock = med.inventories.reduce((acc, i) => acc + (i.quantity || 0), 0)

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <h1 className="text-2xl font-bold">{med.name}</h1>
          <p className="mt-4">{med.description}</p>
        </div>
        <aside className="p-4 border rounded">
          <div className="text-lg font-semibold">₱{med.price.toFixed(2)}</div>
          <div className={`mt-2 ${totalStock > 0 ? 'text-green-600' : 'text-red-600'}`}>{totalStock > 0 ? 'In stock' : 'Out of stock'}</div>
          <div className="mt-4">
            <AddToCartButton medicineId={med.id} />
          </div>
        </aside>
      </div>
    </div>
  )
}
