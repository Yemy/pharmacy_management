"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function updateUserRole(userId: number, roleId: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userRole = (session.user as any).role;
    if (!['ADMIN'].includes(userRole)) {
      throw new Error("Insufficient permissions");
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { roleId },
      include: { role: true },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: parseInt(session.user.id as string),
        action: "UPDATE_USER_ROLE",
        tableName: "user",
        recordId: userId,
        changes: { roleId },
      },
    });

    revalidatePath("/admin/users");
    return { success: true, data: user };
  } catch (error) {
    console.error("Update user role error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update user role" 
    };
  }
}

export async function toggleUserStatus(userId: number, isVerified: boolean) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userRole = (session.user as any).role;
    if (!['ADMIN'].includes(userRole)) {
      throw new Error("Insufficient permissions");
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isVerified },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: parseInt(session.user.id as string),
        action: "TOGGLE_USER_STATUS",
        tableName: "user",
        recordId: userId,
        changes: { isVerified },
      },
    });

    revalidatePath("/admin/users");
    return { success: true, data: user };
  } catch (error) {
    console.error("Toggle user status error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update user status" 
    };
  }
}