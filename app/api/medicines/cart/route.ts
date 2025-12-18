import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { medicineIds } = await request.json();

    if (!Array.isArray(medicineIds) || medicineIds.length === 0) {
      return NextResponse.json([]);
    }

    const medicines = await prisma.medicine.findMany({
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

    return NextResponse.json(medicines);
  } catch (error) {
    console.error("Cart medicines API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch medicines" },
      { status: 500 }
    );
  }
}