import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import CatalogFilters from "./CatalogFilters";

interface SearchParams {
  search?: string;
  category?: string;
  page?: string;
}

async function getMedicines(searchParams: SearchParams) {
  const search = searchParams?.search;
  const category = searchParams?.category;
  const page = searchParams?.page || "1";
  const pageSize = 12;
  const skip = (parseInt(page) - 1) * pageSize;

  const where: any = {
    deletedAt: null,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (category) {
    where.category = {
      slug: category,
    };
  }

  const [medicines, total, categories] = await Promise.all([
    prisma.medicine.findMany({
      where,
      include: {
        category: true,
        inventories: {
          where: { deletedAt: null },
          select: { quantity: true },
        },
      },
      skip,
      take: pageSize,
      orderBy: { name: 'asc' },
    }),
    prisma.medicine.count({ where }),
    prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    }),
  ]);

  return {
    medicines: medicines.map(medicine => ({
      ...medicine,
      totalStock: medicine.inventories.reduce((sum, inv) => sum + inv.quantity, 0),
    })),
    total,
    totalPages: Math.ceil(total / pageSize),
    currentPage: parseInt(page),
    categories,
  };
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams> | SearchParams;
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const { medicines, total, totalPages, currentPage, categories } = await getMedicines(resolvedSearchParams);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Medicine Catalog</h1>
          <p className="text-gray-600 dark:text-gray-300">Browse our wide selection of medicines and health products</p>
        </div>

        {/* Search and Filters */}
        <CatalogFilters categories={categories} />

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            Showing {medicines.length} of {total} results
          </p>
        </div>

        {/* Products Grid */}
        {medicines.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {medicines.map((medicine) => (
              <ProductCard key={medicine.id} medicine={medicine} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No medicines found matching your criteria.</p>
            <Link
              href="/shop/catalog"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-2 inline-block"
            >
              View all medicines
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={`/shop/catalog?${new URLSearchParams({
                  ...(resolvedSearchParams.search && { search: resolvedSearchParams.search }),
                  ...(resolvedSearchParams.category && { category: resolvedSearchParams.category }),
                  page: page.toString(),
                }).toString()}`}
                className={`px-4 py-2 rounded-lg ${
                  page === currentPage
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {page}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}