"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartProvider";
import { useState } from "react";

interface Medicine {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  category: {
    name: string;
  } | null;
  totalStock: number;
}

export default function ProductCard({ medicine }: { medicine: Medicine }) {
  const { add } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    setAdding(true);
    add({ medicineId: medicine.id, quantity: 1 });
    setTimeout(() => setAdding(false), 500);
  };

  const inStock = medicine.totalStock > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <Link href={`/shop/product/${medicine.slug}`}>
        <div className="bg-gray-100 dark:bg-gray-700 h-48 rounded-t-lg flex items-center justify-center">
          <span className="text-gray-400 dark:text-gray-500 text-4xl">💊</span>
        </div>
      </Link>
      
      <div className="p-4">
        <Link href={`/shop/product/${medicine.slug}`}>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {medicine.name}
          </h3>
        </Link>
        
        {medicine.category && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{medicine.category.name}</p>
        )}
        
        {medicine.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
            {medicine.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${medicine.price.toFixed(2)}
            </p>
            <p className={`text-xs ${inStock ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {inStock ? `${medicine.totalStock} in stock` : 'Out of stock'}
            </p>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={!inStock || adding}
            className={`p-2 rounded-lg transition-colors ${
              inStock
                ? 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            } ${adding ? 'scale-95' : ''}`}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
