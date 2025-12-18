"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { orderSchema, type OrderInput } from "@/lib/validations";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderStatus } from "@prisma/client";

export async function createOrder(data: OrderInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const validatedData = orderSchema.parse(data);
    
    // Calculate total
    const total = validatedData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: parseInt((session.user as any).id as string),
          total,
          note: validatedData.note,
          status: OrderStatus.PENDING,
        },
      });

      // Create order items
      await tx.orderItem.createMany({
        data: validatedData.items.map(item => ({
          orderId: newOrder.id,
          medicineId: item.medicineId,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      // Update inventory (reduce stock)
      for (const item of validatedData.items) {
        const inventories = await tx.inventory.findMany({
          where: {
            medicineId: item.medicineId,
            quantity: { gt: 0 },
            deletedAt: null,
          },
          orderBy: { expiryDate: 'asc' }, // FIFO - use items expiring first
        });

        let remainingQuantity = item.quantity;
        for (const inventory of inventories) {
          if (remainingQuantity <= 0) break;
          
          const deductQuantity = Math.min(inventory.quantity, remainingQuantity);
          await tx.inventory.update({
            where: { id: inventory.id },
            data: { quantity: inventory.quantity - deductQuantity },
          });
          
          remainingQuantity -= deductQuantity;
        }

        if (remainingQuantity > 0) {
          throw new Error(`Insufficient stock for medicine ID ${item.medicineId}`);
        }
      }

      return newOrder;
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: parseInt((session.user as any).id as string),
        action: "CREATE_ORDER",
        tableName: "order",
        recordId: order.id,
        changes: { total, itemCount: validatedData.items.length },
      },
    });

    revalidatePath("/orders");
    revalidatePath("/admin/orders");
    return { success: true, data: order };
  } catch (error) {
    console.error("Create order error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create order" 
    };
  }
}

export async function updateOrderStatus(orderId: number, status: OrderStatus) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userRole = (session.user as any).role;
    if (!['ADMIN', 'PHARMACIST', 'STAFF'].includes(userRole)) {
      throw new Error("Insufficient permissions");
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: { medicine: true }
        },
        user: true,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: parseInt((session.user as any).id as string),
        action: "UPDATE_ORDER_STATUS",
        tableName: "order",
        recordId: order.id,
        changes: { status },
      },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/orders");
    return { success: true, data: order };
  } catch (error) {
    console.error("Update order status error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update order status" 
    };
  }
}
