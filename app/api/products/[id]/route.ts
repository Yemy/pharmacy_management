import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam)
  if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const med = await prisma.medicine.findUnique({
    where: { id },
    include: { category: true, inventories: true }
  })

  if (!med) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data: med })
}
