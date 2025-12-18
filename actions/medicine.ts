"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { medicineSchema, categorySchema, type MedicineInput, type CategoryInput } from "@/lib/validations";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createMedicine(data: MedicineInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userRole = (session.user as any).role;
    if (!['ADMIN', 'PHARMACIST'].includes(userRole)) {
      throw new Error("Insufficient permissions");
    }

    const validatedData = medicineSchema.parse(data);
    
    // Generate slug from name
    const slug = validatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const medicine = await prisma.medicine.create({
      data: {
        ...validatedData,
        slug,
      },
      include: {
        category: true,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: parseInt(session.user.id as string),
        action: "CREATE_MEDICINE",
        tableName: "medicine",
        recordId: medicine.id,
        changes: validatedData,
      },
    });

    revalidatePath("/admin/medicines");
    revalidatePath("/shop/catalog");
    return { success: true, data: medicine };
  } catch (error) {
    console.error("Create medicine error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create medicine" 
    };
  }
}

export async function updateMedicine(id: number, data: Partial<MedicineInput>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userRole = (session.user as any).role;
    if (!['ADMIN', 'PHARMACIST'].includes(userRole)) {
      throw new Error("Insufficient permissions");
    }

    // Update slug if name is being changed
    const updateData = { ...data };
    if (data.name) {
      updateData.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const medicine = await prisma.medicine.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: parseInt(session.user.id as string),
        action: "UPDATE_MEDICINE",
        tableName: "medicine",
        recordId: medicine.id,
        changes: data,
      },
    });

    revalidatePath("/admin/medicines");
    revalidatePath("/shop/catalog");
    return { success: true, data: medicine };
  } catch (error) {
    console.error("Update medicine error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update medicine" 
    };
  }
}

export async function deleteMedicine(id: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userRole = (session.user as any).role;
    if (!['ADMIN'].includes(userRole)) {
      throw new Error("Insufficient permissions");
    }

    await prisma.medicine.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: parseInt(session.user.id as string),
        action: "DELETE_MEDICINE",
        tableName: "medicine",
        recordId: id,
      },
    });

    revalidatePath("/admin/medicines");
    revalidatePath("/shop/catalog");
    return { success: true };
  } catch (error) {
    console.error("Delete medicine error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete medicine" 
    };
  }
}

export async function createCategory(data: CategoryInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userRole = (session.user as any).role;
    if (!['ADMIN', 'PHARMACIST'].includes(userRole)) {
      throw new Error("Insufficient permissions");
    }

    const validatedData = categorySchema.parse(data);
    
    const category = await prisma.category.create({
      data: validatedData,
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: parseInt(session.user.id as string),
        action: "CREATE_CATEGORY",
        tableName: "category",
        recordId: category.id,
        changes: validatedData,
      },
    });

    revalidatePath("/admin/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Create category error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create category" 
    };
  }
}