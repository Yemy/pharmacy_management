import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Package, AlertTriangle, Calendar } from "lucide-react";

async function getInventoryData() {
  const [inventory, medicines, suppliers] = await Promise.all([
    prisma.inventory.findMany({
      where: { deletedAt: null },
      include: {
        medicine: true,
        supplier: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.medicine.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    }),
    prisma.supplier.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    }),
  ]);

  return { inventory, medicines, suppliers };
}

export default async function InventoryPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;
  if (!['ADMIN', 'PHARMACIST', 'STAFF'].includes(userRole)) {
    redirect('/dashboard');
  }

  const { inventory, medicines, suppliers } = await getInventoryData();

  // Calculate alerts
  const lowStockItems = inventory.filter(item => item.quantity < 10);
  const expiringSoonItems = inventory.filter(item => 
    item.expiryDate && 
    new Date(item.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600">Track stock levels, batches, and expiry dates</p>
          </div>
          <Link
            href="/admin/inventory/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Stock
          </Link>
        </div>

        {/* Alerts */}
        {(lowStockItems.length > 0 || expiringSoonItems.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {lowStockItems.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-800">Low Stock Alert</h3>
                </div>
                <p className="text-red-700 text-sm">
                  {lowStockItems.length} items are running low on stock (less than 10 units)
                </p>
              </div>
            )}
            
            {expiringSoonItems.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold text-orange-800">Expiry Alert</h3>
                </div>
                <p className="text-orange-700 text-sm">
                  {expiringSoonItems.length} items are expiring within 30 days
                </p>
              </div>
            )}
          </div>
        )}

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medicine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Received
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item) => {
                  const isLowStock = item.quantity < 10;
                  const isExpiringSoon = item.expiryDate && 
                    new Date(item.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                  const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
                  
                  return (
                    <tr key={item.id} className={`hover:bg-gray-50 ${
                      isExpired ? 'bg-red-50' : isExpiringSoon ? 'bg-orange-50' : ''
                    }`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.medicine.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              SKU: {item.medicine.sku || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.batchNumber || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.supplier?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isLowStock 
                            ? 'bg-red-100 text-red-800' 
                            : item.quantity === 0 
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {item.quantity} units
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.expiryDate ? (
                          <span className={
                            isExpired 
                              ? 'text-red-600 font-medium' 
                              : isExpiringSoon 
                                ? 'text-orange-600 font-medium'
                                : ''
                          }>
                            {new Date(item.expiryDate).toLocaleDateString()}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.receivedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {inventory.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory records found</h3>
            <p className="text-gray-500 mb-4">Start by adding stock for your medicines.</p>
            <Link
              href="/admin/inventory/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Stock
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}