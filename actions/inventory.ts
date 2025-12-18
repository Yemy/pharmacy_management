"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { inventorySchema, type InventoryInput } from "@/lib/validations";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createInventory(data: InventoryInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userRole = (session.user as any).role;
    if (!['ADMIN', 'PHARMACIST', 'STAFF'].includes(userRole)) {
      throw new Error("Insufficient permissions");
    }

    const validatedData = inventorySchema.parse(data);
    
    const inventory = await prisma.inventory.create({
      data: validatedData,
      include: {
        medicine: true,
        supplier: true,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: parseInt(session.user.id as string),
        action: "CREATE_INVENTORY",
        tableName: "inventory",
        recordId: inventory.id,
        changes: validatedData,
      },
    });

    revalidatePath("/admin/inventory");
    return { success: true, data: inventory };
  } catch (error) {
    console.error("Create inventory error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create inventory" 
    };
  }
}

export async function updateInventory(id: number, data: Partial<InventoryInput>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userRole = (session.user as any).role;
    if (!['ADMIN', 'PHARMACIST', 'STAFF'].includes(userRole)) {
      throw new Error("Insufficient permissions");
    }

    const inventory = await prisma.inventory.update({
      where: { id },
      data,
      include: {
        medicine: true,
        supplier: true,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: parseInt(session.user.id as string),
        action: "UPDATE_INVENTORY",
        tableName: "inventory",
        recordId: inventory.id,
        changes: data,
      },
    });

    revalidatePath("/admin/inventory");
    return { success: true, data: inventory };
  } catch (error) {
    console.error("Update inventory error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update inventory" 
    };
  }
}

export async function checkLowStock() {
  const lowStockThreshold = 10;
  
  const lowStockMedicines = await prisma.medicine.findMany({
    where: {
      inventories: {
        some: {
          quantity: { lte: lowStockThreshold },
          deletedAt: null
        }
      },
      deletedAt: null
    },
    include: {
      inventories: {
        where: { deletedAt: null }
      },
      category: true
    }
  });
  
  return lowStockMedicines;
}