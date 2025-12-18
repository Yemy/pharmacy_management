import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit, Trash2, Package } from "lucide-react";

async function getMedicines() {
  return await prisma.medicine.findMany({
    where: { deletedAt: null },
    include: {
      category: true,
      inventories: {
        where: { deletedAt: null },
        select: { quantity: true },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export default async function MedicinesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;
  if (!['ADMIN', 'PHARMACIST', 'STAFF'].includes(userRole)) {
    redirect('/dashboard');
  }

  const medicines = await getMedicines();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Medicine Management</h1>
            <p className="text-gray-600">Manage your medicine inventory</p>
          </div>
          <Link
            href="/admin/medicines/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Medicine
          </Link>
        </div>

        {/* Medicines Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medicine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {medicines.map((medicine) => {
                  const totalStock = medicine.inventories.reduce((sum, inv) => sum + inv.quantity, 0);
                  const isLowStock = totalStock < 10;
                  
                  return (
                    <tr key={medicine.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {medicine.name}
                          </div>
                          {medicine.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {medicine.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {medicine.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${medicine.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isLowStock 
                            ? 'bg-red-100 text-red-800' 
                            : totalStock === 0 
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {totalStock} units
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {medicine.sku || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/admin/inventory?medicine=${medicine.id}`}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Manage Inventory"
                          >
                            <Package className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/medicines/${medicine.id}/edit`}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Edit Medicine"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete Medicine"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {medicines.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No medicines found</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first medicine.</p>
            <Link
              href="/admin/medicines/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Medicine
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}