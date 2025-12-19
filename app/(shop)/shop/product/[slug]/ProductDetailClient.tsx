"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { ArrowLeft, ShoppingCart, Package, Shield, Clock } from "lucide-react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sku: string | null;
  price: number;
  unit: string | null;
  category: {
    name: string;
  } | null;
  totalStock: number;
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    setAdding(true);
    add({ medicineId: product.id, quantity });
    setTimeout(() => setAdding(false), 500);
  };

  const inStock = product.totalStock > 0;
  const maxQuantity = Math.min(product.totalStock, 10); // Limit to 10 per order

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/shop/catalog"
          className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="bg-gray-100 dark:bg-gray-700 h-96 rounded-lg flex items-center justify-center">
            <span className="text-8xl">💊</span>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            {product.category && (
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                {product.category.name}
              </p>
            )}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {product.name}
            </h1>
            {product.description && (
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          {/* Product Details */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">SKU:</span>
              <span className="font-medium text-gray-900 dark:text-white">{product.sku || 'N/A'}</span>
            </div>
            {product.unit && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Unit:</span>
                <span className="font-medium text-gray-900 dark:text-white">{product.unit}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Availability:</span>
              <span className={`font-medium ${inStock ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {inStock ? `${product.totalStock} in stock` : 'Out of stock'}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="border-t border-b py-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-bold text-blue-600">
                ${product.price.toFixed(2)}
              </span>
              {product.unit && (
                <span className="text-gray-500">per {product.unit}</span>
              )}
            </div>
          </div>

          {/* Add to Cart */}
          {inStock && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Quantity:
                </label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding}
                className={`w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 ${
                  adding ? 'scale-95' : ''
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
              </button>
            </div>
          )}

          {!inStock && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">Currently out of stock</p>
              <p className="text-red-600 text-sm mt-1">
                Please check back later or contact us for availability.
              </p>
            </div>
          )}

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
            <div className="text-center">
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Genuine Medicine</p>
              <p className="text-xs text-gray-500">100% Authentic</p>
            </div>
            <div className="text-center">
              <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Secure Packaging</p>
              <p className="text-xs text-gray-500">Safe Delivery</p>
            </div>
            <div className="text-center">
              <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Fast Delivery</p>
              <p className="text-xs text-gray-500">Within 24 Hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}