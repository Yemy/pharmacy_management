import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'
import { z } from 'zod'
import fs from 'fs'

const OrderSchema = z.object({
  items: z.array(z.object({ medicineId: z.number(), quantity: z.number().min(1) })),
  note: z.string().optional(),
  prescriptionId: z.number().optional()
})

export async function POST(req: Request) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = OrderSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors }, { status: 400 })

  const userId = Number(token.sub)

  // Transaction: create order, order items, payment mock, and decrement inventory
  const result = await prisma.$transaction(async (tx) => {
    // verify stock availability
    for (const it of parsed.data.items) {
      const total = await tx.inventory.aggregate({
        where: { medicineId: it.medicineId, deletedAt: null },
        _sum: { quantity: true }
      })
      const available = total._sum.quantity ?? 0
      if (available < it.quantity) throw new Error(`Insufficient stock for medicine ${it.medicineId}`)
    }

    const order = await tx.order.create({
      data: { userId, total: 0, status: 'PENDING', note: parsed.data.note }
    })

    let totalAmount = 0

    for (const it of parsed.data.items) {
      const med = await tx.medicine.findUnique({ where: { id: it.medicineId } })
      const price = med?.price ?? 0
      totalAmount += price * it.quantity

      await tx.orderItem.create({ data: { orderId: order.id, medicineId: it.medicineId, quantity: it.quantity, price } })

      // decrement inventory (FIFO by expiryDate)
      let qtyToTake = it.quantity
      const inventories = await tx.inventory.findMany({ where: { medicineId: it.medicineId, deletedAt: null, quantity: { gt: 0 } }, orderBy: { expiryDate: 'asc' } })
      for (const inv of inventories) {
        if (qtyToTake <= 0) break
        const take = Math.min(inv.quantity, qtyToTake)
        await tx.inventory.update({ where: { id: inv.id }, data: { quantity: inv.quantity - take } })
        qtyToTake -= take
      }
    }

    // update order total
    await tx.order.update({ where: { id: order.id }, data: { total: totalAmount } })

    // create mock payment record
    const payment = await tx.payment.create({ data: { orderId: order.id, amount: totalAmount, status: 'PENDING', provider: 'mock' } })

    return { orderId: order.id, total: totalAmount, paymentId: payment.id }
  })

  return NextResponse.json({ data: result })
}
