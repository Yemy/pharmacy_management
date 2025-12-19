import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
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

    const {
      supplierId,
      expectedDate,
      items,
      subtotal,
      tax,
      total
    } = await request.json();

    // Validate required fields
    if (!supplierId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Supplier and items are required" },
        { status: 400 }
      );
    }

    // Get current employee
    const employee = await prisma.employee.findUnique({
      where: { userId: parseInt(session.user.id as string) }
    });

    // Generate order number
    const orderCount = await prisma.purchaseOrder.count();
    const orderNumber = `PO-${Date.now()}-${(orderCount + 1).toString().padStart(4, '0')}`;

    // Create purchase order with items
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        orderNumber,
        supplierId,
        employeeId: employee?.id,
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        subtotal,
        tax: tax || 0,
        total,
        items: {
          create: items.map((item: any) => ({
            medicineId: item.medicineId,
            quantityOrdered: item.quantityOrdered,
            unitCost: item.unitCost,
            total: item.total
          }))
        }
      },
      include: {
        supplier: true,
        employee: { include: { user: true } },
        items: { include: { medicine: true } }
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: parseInt(session.user.id as string),
        action: "CREATE_PURCHASE_ORDER",
        tableName: "purchaseOrder",
        recordId: purchaseOrder.id,
        changes: { orderNumber, supplierId, total }
      }
    });

    return NextResponse.json(purchaseOrder);
  } catch (error) {
    console.error("Create purchase order error:", error);
    return NextResponse.json(
      { error: "Failed to create purchase order" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const where: any = {};
    
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [purchaseOrders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          supplier: true,
          employee: { include: { user: true } },
          items: { include: { medicine: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.purchaseOrder.count({ where })
    ]);

    return NextResponse.json({
      purchaseOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get purchase orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase orders" },
      { status: 500 }
    );
  }
}