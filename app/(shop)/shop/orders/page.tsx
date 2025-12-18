import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OrderStatusBadge from "@/app/(admin)/admin/orders/OrderStatusBadge";
import { Package, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";

async function getUserOrders(userId: number) {
  return await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          medicine: true,
        },
      },
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login?callbackUrl=/shop/orders');
  }

  const orders = await getUserOrders(parseInt(session.user.id as string));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600">Track your order history and status</p>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <Package className="w-6 h-6 text-gray-400" />
                    <div>
                      <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mt-4 md:mt-0">
                    <div className="text-right">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-lg font-semibold">{order.total.toFixed(2)}</span>
                      </div>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Items ({order.items.length})
                  </h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gray-100 w-10 h-10 rounded-lg flex items-center justify-center">
                            <span className="text-lg">💊</span>
                          </div>
                          <div>
                            <p className="font-medium">{item.medicine.name}</p>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity} × ${item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <p className="font-medium">
                          ${(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {order.note && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Order Notes</h4>
                    <p className="text-gray-600 text-sm">{order.note}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <Link
              href="/shop/catalog"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Medicines
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}