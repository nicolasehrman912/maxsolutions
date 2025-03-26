import { ProductGrid } from "@/components/product-grid"
import { getUnifiedProducts, getUnifiedCategories, createCompositeId, UnifiedCategory } from "@/lib/api/unified"
import { Family } from "@/lib/api/types"
import { Suspense } from "react"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductsPageSkeleton } from "@/components/skeletons/products-page-skeleton"
import { CategoriesSidebar } from "@/components/categories/categories-sidebar"
import { formatCategories, getAllSubcategoryIds } from "@/lib/categories"
import ProductListingClient from "@/components/product-listing-client"
import { MobileFilterButton } from "@/components/mobile-filter-button"

export const dynamic = 'force-dynamic'; // Forzar renderizado dinámico para los filtros
export const revalidate = 3600; // Revalidar esta página cada hora

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
  // Await searchParams before accessing its properties
  const params = await searchParams;
  
  // Parse search parameters
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 16;
  
  // Get category filter
  const categoryParam = params.category;
  // Handle both single category string and array of categories
  const categories = categoryParam 
    ? Array.isArray(categoryParam) 
      ? categoryParam // If already an array
      : [categoryParam] // If single string, convert to array
    : undefined;
  
  // Always show all products regardless of stock status
  const stock = undefined;
  
  // Get search term
  const search = params.search;
  
  // Source is no longer needed
  const source = undefined;
  
  try {
    // Check if selected category is a main category that has subcategories
    let categoriesForSearch = categories;
    
    if (categoryParam && !Array.isArray(categoryParam)) {
      // Load categories data
      const categoriesData = formatCategories();
      
      // Find the category
      const category = categoriesData.find(cat => cat.id.toString() === categoryParam);
      
      // If it's a main category with subcategories, search for all subcategories
      if (category && category.subcategories && category.subcategories.length > 0) {
        categoriesForSearch = getAllSubcategoryIds(categoryParam, categoriesData).map(id => id.toString());
      }
    }
    
    // Get products with a timeout
    const MAX_TIMEOUT = 5000; // 5 seconds max wait time
    
    let productsResponse;
    try {
      const productsPromise = getUnifiedProducts({
        page,
        limit,
        categories: categoriesForSearch,
        stock,
        search,
        source
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
    
    // Map products to simplified format for client component
    const products = productsResponse.products.map(product => {
      // Common variables for both product types
      let id, name, image, category, totalStock = 0;
      
      if (product.source === 'zecat') {
        // Minimal processing for Zecat products
        id = createCompositeId('zecat', product.id);
        name = product.name;
        image = product.images?.[0]?.image_url || "/placeholder.svg?height=400&width=300";
        category = product.families?.[0]?.description || "general";
        totalStock = product.products?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
      } else {
        // Minimal processing for CDO products
        id = createCompositeId('cdo', product.id);
        name = product.name;
        image = product.variants?.[0]?.picture?.original || "/placeholder.svg?height=400&width=300";
        category = product.categories?.[0]?.name || "general";
        totalStock = product.variants?.reduce((sum, v) => sum + (v.stock_available || 0), 0) || 0;
      }
      
      // Return object with minimal necessary structure
      return {
        id,
        name,
        image,
        category,
        isNew: totalStock > 0,
        totalStock,
        source: product.source
      };
    });
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar - Hidden on mobile */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <Suspense fallback={
              <div className="space-y-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-5 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
                <div className="h-px bg-gray-200 w-full my-4"></div>
                <div className="space-y-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex flex-col space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="pl-4 space-y-1">
                        {[...Array(3)].map((_, j) => (
                          <div key={j} className="h-4 bg-gray-200 rounded w-2/3"></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            }>
              <CategoriesSidebar />
            </Suspense>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Productos</h1>
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

        {/* Floating Filter Button - Only visible on mobile */}
        <div className="md:hidden">
          <MobileFilterButton />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading products page:', error);
    
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center bg-background border rounded-lg p-8 shadow-sm">
          <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h1 className="text-xl font-bold mb-2">Error al cargar productos</h1>
          <p className="text-muted-foreground mb-6">
            No se pudieron cargar los productos en este momento. Por favor intenta nuevamente más tarde.
          </p>
          <div className="flex justify-center gap-4">
            <a href="/">
              <Button variant="outline">Volver al inicio</Button>
            </a>
            <a href="/products">
              <Button>Reintentar</Button>
            </a>
          </div>
        </div>
      </div>
    );
  }
}

