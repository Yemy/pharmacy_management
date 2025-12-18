import { z } from "zod";

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

// Medicine Schemas
export const medicineSchema = z.object({
  name: z.string().min(1, "Medicine name is required"),
  description: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  unit: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  categoryId: z.number().optional(),
});

// Category Schema
export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required"),
});

// Inventory Schema
export const inventorySchema = z.object({
  medicineId: z.number(),
  supplierId: z.number().optional(),
  batchNumber: z.string().optional(),
  quantity: z.number().int().min(0, "Quantity must be non-negative"),
  unitPrice: z.number().positive("Unit price must be positive"),
  expiryDate: z.date().optional(),
});

// Order Schema
export const orderSchema = z.object({
  items: z.array(z.object({
    medicineId: z.number(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
  })),
  note: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type MedicineInput = z.infer<typeof medicineSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type InventoryInput = z.infer<typeof inventorySchema>;
export type OrderInput = z.infer<typeof orderSchema>;