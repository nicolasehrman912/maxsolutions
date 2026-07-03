import { getUnifiedProducts, createCompositeId } from "@/lib/api/unified"
import { Suspense } from "react"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductsPageSkeleton } from "@/components/skeletons/products-page-skeleton"
import { CategoriesSidebar } from "@/components/categories/categories-sidebar"
import ProductListingClient from "@/components/product-listing-client"
import { MobileFilterButton } from "@/components/mobile-filter-button"

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: "Catálogo de Merchandising Personalizado | Max Solutions",
  description:
    "Explorá +1.000 artículos promocionales con logo: drinkware, apparel, tecnología, escritura y kits. Cotizá por WhatsApp con stock en tiempo real.",
  alternates: { canonical: "https://www.maxsolutionsmerchandising.com/products" },
}

interface SearchParams {
  page?: string
  limit?: string
  category?: string | string[]
  stock?: string
  search?: string
  source?: string
}

export default async function ProductsPage({ 
  searchParams 
}: { 
  searchParams: SearchParams 
}) {
  const params = await searchParams;
  
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 48;
  const search = params.search;

  const categoryParam = params.category;
  const categories = categoryParam
    ? Array.isArray(categoryParam)
      ? categoryParam
      : [categoryParam]
    : undefined;

  // Categoría especial "kits-y-sets": busca por nombre "set" en ambas APIs
  const isKitsYSets = categories?.includes("kits-y-sets");
  const effectiveCategories = isKitsYSets ? undefined : categories;
  const effectiveSearch = isKitsYSets ? "set" : search;

  const MAX_TIMEOUT = 30000;

  try {
    let productsResponse;
    try {
      const productsPromise = getUnifiedProducts({
        page,
        limit,
        categories: effectiveCategories,
        search: effectiveSearch,
        order: { price: 'asc' },
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout obteniendo productos")), MAX_TIMEOUT);
      });

      productsResponse = await Promise.race([
        productsPromise,
        timeoutPromise
      ]) as Awaited<ReturnType<typeof getUnifiedProducts>>;
    } catch (error) {
      console.error('Error fetching products:', error);
      productsResponse = { products: [], count: 0, total_pages: 0 };
    }

    const products = productsResponse.products.map(product => {
      let id, name, image, category, totalStock = 0;
      let price: number | undefined;
      let cdoListPrice: string | undefined;

      if (product.source === 'zecat') {
        id = createCompositeId('zecat', product.id);
        name = product.name;
        image = product.images?.[0]?.image_url || "/placeholder.svg";
        category = product.families?.[0]?.description || "general";
        totalStock = product.products?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
        price = (product as any).price ?? (product as any).unit_price ?? undefined;
      } else {
        id = createCompositeId('cdo', product.id);
        name = product.name;
        image = product.variants?.[0]?.picture?.original || "/placeholder.svg";
        category = product.categories?.[0]?.name || "general";
        totalStock = product.variants?.reduce((sum, v) => sum + (v.stock_available || 0), 0) || 0;
        cdoListPrice = product.variants?.[0]?.list_price ?? undefined;
      }

      return {
        id,
        name,
        image,
        category,
        isNew: totalStock > 0,
        totalStock,
        source: product.source,
        price,
        cdoListPrice,
      };
    });

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <Suspense fallback={
              <div className="space-y-4 animate-pulse">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-6 bg-gray-200 rounded w-3/4" />
                ))}
              </div>
            }>
              <CategoriesSidebar />
            </Suspense>
          </div>

          {/* Productos */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold font-display text-navy">Productos</h1>
            </div>

            <Suspense fallback={<ProductsPageSkeleton />}>
              <ProductListingClient
                products={products}
                totalPages={productsResponse.total_pages}
                totalProducts={productsResponse.count}
                currentPage={page}
                categoryParam={categoryParam}
                search={search}
              />
            </Suspense>
          </div>
        </div>

        <div className="md:hidden">
          <MobileFilterButton />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading products page:', error);
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center bg-background border rounded-lg p-8 shadow-sm">
          <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h1 className="text-xl font-bold mb-2">Error al cargar productos</h1>
          <p className="text-muted-foreground mb-6">
            No se pudieron cargar los productos. Por favor intentá nuevamente.
          </p>
          <div className="flex justify-center gap-4">
            <a href="/"><Button variant="outline">Volver al inicio</Button></a>
            <a href="/products"><Button>Reintentar</Button></a>
          </div>
        </div>
      </div>
    );
  }
}
