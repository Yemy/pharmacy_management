"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function uploadPrescription(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const file = formData.get('file') as File;
    if (!file) {
      throw new Error("No file provided");
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Invalid file type. Please upload JPG, PNG, or PDF files only.");
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size must be less than 5MB");
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'prescriptions');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `prescription_${session.user.id}_${timestamp}.${extension}`;
    const filepath = join(uploadsDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Save to database
    const prescription = await prisma.prescription.create({
      data: {
        userId: parseInt(session.user.id as string),
        filePath: `/uploads/prescriptions/${filename}`,
        verified: false,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: parseInt(session.user.id as string),
        action: "UPLOAD_PRESCRIPTION",
        tableName: "prescription",
        recordId: prescription.id,
        changes: { filename, fileSize: file.size },
      },
    });

    revalidatePath("/prescriptions");
    return { success: true, data: prescription };
  } catch (error) {
    console.error("Upload prescription error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to upload prescription" 
    };
  }
}

export async function deletePrescription(id: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Check if prescription belongs to user
    const prescription = await prisma.prescription.findUnique({
      where: { id },
    });

    if (!prescription) {
      throw new Error("Prescription not found");
    }

    if (prescription.userId !== parseInt(session.user.id as string)) {
      throw new Error("Unauthorized to delete this prescription");
    }

    // Delete from database
    await prisma.prescription.delete({
      where: { id },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: parseInt(session.user.id as string),
        action: "DELETE_PRESCRIPTION",
        tableName: "prescription",
        recordId: id,
      },
    });

    revalidatePath("/prescriptions");
    return { success: true };
  } catch (error) {
    console.error("Delete prescription error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete prescription" 
    };
  }
}

export async function verifyPrescription(id: number, verified: boolean) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userRole = (session.user as any).role;
    if (!['ADMIN', 'PHARMACIST'].includes(userRole)) {
      throw new Error("Insufficient permissions");
    }

    const prescription = await prisma.prescription.update({
      where: { id },
      data: { verified },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: parseInt(session.user.id as string),
        action: "VERIFY_PRESCRIPTION",
        tableName: "prescription",
        recordId: id,
        changes: { verified },
      },
    });

    revalidatePath("/admin/prescriptions");
    revalidatePath("/prescriptions");
    return { success: true, data: prescription };
  } catch (error) {
    console.error("Verify prescription error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to verify prescription" 
    };
  }
}