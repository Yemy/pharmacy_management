import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    if (!['ADMIN', 'PHARMACIST'].includes(userRole)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { status } = await request.json();
    const { id } = await params;
    const orderId = parseInt(id);

    const purchaseOrder = await prisma.purchaseOrder.update({
      where: { id: orderId },
      data: {
        status,
        receivedDate: status === 'RECEIVED' ? new Date() : undefined
      },
      include: {
        supplier: true,
        items: { include: { medicine: true } }
      }
    });

    // If order is received, update inventory
    if (status === 'RECEIVED') {
      for (const item of purchaseOrder.items) {
        await prisma.inventory.create({
          data: {
            medicineId: item.medicineId,
            supplierId: purchaseOrder.supplierId,
            quantity: item.quantityOrdered,
            unitPrice: item.unitCost,
            receivedAt: new Date()
          }
        });

        // Update quantity received
        await prisma.purchaseOrderItem.update({
          where: { id: item.id },
          data: { quantityReceived: item.quantityOrdered }
        });
      }
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: parseInt(session.user.id as string),
        action: "UPDATE_PURCHASE_ORDER",
        tableName: "purchaseOrder",
        recordId: purchaseOrder.id,
        changes: { status }
      }
    });

    return NextResponse.json(purchaseOrder);
  } catch (error) {
    console.error("Update purchase order error:", error);
    return NextResponse.json(
      { error: "Failed to update purchase order" },
      { status: 500 }
    );
  }
}