import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

async function getProduct(slug: string) {
  const medicine = await prisma.medicine.findUnique({
    where: { 
      slug,
      deletedAt: null,
    },
    include: {
      category: true,
      inventories: {
        where: { deletedAt: null },
        select: { quantity: true },
      },
    },
  });

  if (!medicine) {
    return null;
  }

  return {
    ...medicine,
    totalStock: medicine.inventories.reduce((sum, inv) => sum + inv.quantity, 0),
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const product = await getProduct(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ProductDetailClient product={product} />
      </div>
    </div>
  );
}