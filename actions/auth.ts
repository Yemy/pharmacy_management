"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function signInAction(credentials: any) {
  // Implement sign-in server action
  return { success: false };
}

export async function updateProfile(data: { name: string; email: string; phone: string }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.update({
      where: { id: parseInt(session.user.id as string) },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: parseInt(session.user.id as string),
        action: "UPDATE_PROFILE",
        tableName: "user",
        recordId: user.id,
        changes: data,
      },
    });

    revalidatePath("/profile");
    return { success: true, data: user };
  } catch (error) {
    console.error("Update profile error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update profile" 
    };
  }
}
