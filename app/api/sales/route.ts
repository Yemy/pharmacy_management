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
    if (!['ADMIN', 'PHARMACIST', 'STAFF'].includes(userRole)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const {
      customerId,
      items,
      subtotal,
      tax,
      discount,
      total,
      paymentMethod,
      paymentRef,
      type = 'PHYSICAL'
    } = await request.json();

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Sale items are required" },
        { status: 400 }
      );
    }

    // Get current employee
    const employee = await prisma.employee.findUnique({
      where: { userId: parseInt(session.user.id as string) }
    });

    // Generate sale number
    const saleCount = await prisma.sale.count();
    const saleNumber = `SALE-${Date.now()}-${(saleCount + 1).toString().padStart(4, '0')}`;

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the sale
      const sale = await tx.sale.create({
        data: {
          saleNumber,
          type,
          customerId,
          employeeId: employee?.id,
          subtotal,
          tax,
          discount,
          total,
          paymentMethod,
          paymentRef,
        }
      });

      // Create sale items and update inventory
      for (const item of items) {
        // Create sale item
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            medicineId: item.medicineId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            total: item.total
          }
        });

        // Update inventory (FIFO - First In, First Out)
        let remainingQuantity = item.quantity;
        const inventories = await tx.inventory.findMany({
          where: {
            medicineId: item.medicineId,
            quantity: { gt: 0 },
            deletedAt: null
          },
          orderBy: { receivedAt: 'asc' } // FIFO
        });

        for (const inventory of inventories) {
          if (remainingQuantity <= 0) break;

          const deductQuantity = Math.min(remainingQuantity, inventory.quantity);
          
          await tx.inventory.update({
            where: { id: inventory.id },
            data: { quantity: inventory.quantity - deductQuantity }
          });

          remainingQuantity -= deductQuantity;
        }

        if (remainingQuantity > 0) {
          throw new Error(`Insufficient stock for ${item.medicineId}`);
        }
      }

      // Update customer loyalty points if customer exists
      if (customerId) {
        const loyaltyPoints = Math.floor(total / 10); // 1 point per $10 spent
        await tx.customer.update({
          where: { id: customerId },
          data: {
            loyaltyPoints: { increment: loyaltyPoints },
            totalSpent: { increment: total }
          }
        });
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: parseInt(session.user.id as string),
          action: "CREATE_SALE",
          tableName: "sale",
          recordId: sale.id,
          changes: { saleNumber, total, paymentMethod }
        }
      });

      return sale;
    });

    // Update daily sales report
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.dailySalesReport.upsert({
      where: { date: today },
      update: {
        totalSales: { increment: total },
        totalTransactions: { increment: 1 },
        cashSales: paymentMethod === 'CASH' ? { increment: total } : undefined,
        cardSales: paymentMethod === 'CARD' ? { increment: total } : undefined,
        insuranceSales: paymentMethod === 'INSURANCE' ? { increment: total } : undefined,
        totalTax: { increment: tax },
        totalDiscount: { increment: discount },
        netSales: { increment: total - tax }
      },
      create: {
        date: today,
        totalSales: total,
        totalTransactions: 1,
        cashSales: paymentMethod === 'CASH' ? total : 0,
        cardSales: paymentMethod === 'CARD' ? total : 0,
        insuranceSales: paymentMethod === 'INSURANCE' ? total : 0,
        totalTax: tax,
        totalDiscount: discount,
        netSales: total - tax
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Create sale error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create sale" },
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
    if (!['ADMIN', 'PHARMACIST', 'STAFF'].includes(userRole)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};
    
    if (type) {
      where.type = type;
    }
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          customer: true,
          employee: {
            include: { user: true }
          },
          items: {
            include: { medicine: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.sale.count({ where })
    ]);

    return NextResponse.json({
      sales,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get sales error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}