import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const q = url.searchParams.get('q') || undefined
  const category = url.searchParams.get('category') || undefined

  const where: any = { deletedAt: null }
  if (q) where.name = { contains: q, mode: 'insensitive' }
  if (category) where.category = { slug: category }

  const medicines = await prisma.medicine.findMany({
    where,
    include: { category: true, inventories: true },
    orderBy: { createdAt: 'desc' },
    take: 50
  })

  return NextResponse.json({ data: medicines })
}

export async function POST(request: Request) {
  // Create medicine - protected by middleware (admin)
  const body = await request.json()
  const { name, slug, description, price, categoryId } = body

  const med = await prisma.medicine.create({
    data: { name, slug, description, price: Number(price), categoryId }
  })

  return NextResponse.json({ data: med })
}
