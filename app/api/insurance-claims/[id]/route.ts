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

    const { status, approvedAmount, notes } = await request.json();
    const { id } = await params;
    const claimId = parseInt(id);

    const claim = await prisma.insuranceClaim.update({
      where: { id: claimId },
      data: {
        status,
        approvedAmount,
        notes,
        processedAt: ['APPROVED', 'REJECTED', 'PARTIAL'].includes(status) ? new Date() : undefined
      },
      include: {
        provider: true,
        sale: {
          include: {
            customer: true,
            items: { include: { medicine: true } }
          }
        }
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: parseInt(session.user.id as string),
        action: "UPDATE_INSURANCE_CLAIM",
        tableName: "insuranceClaim",
        recordId: claim.id,
        changes: { status, approvedAmount }
      }
    });

    return NextResponse.json(claim);
  } catch (error) {
    console.error("Update insurance claim error:", error);
    return NextResponse.json(
      { error: "Failed to update insurance claim" },
      { status: 500 }
    );
  }
}