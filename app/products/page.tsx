import { ProductGrid } from "@/components/product-grid"
import { getUnifiedProducts, getUnifiedCategories, createCompositeId } from "@/lib/api/unified"
import { Suspense } from "react"
import { Filter, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { ProductsPageSkeleton } from "@/components/skeletons/products-page-skeleton"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = 'force-dynamic'; // Forzar renderizado dinámico para los filtros
export const revalidate = 3600 // Revalidate this page every hour

type SearchParams = {
  page?: string
  limit?: string
  category?: string
  stock?: string
  search?: string
  source?: string
}

export default async function ProductsPage({ 
  searchParams 
}: { 
  searchParams: SearchParams 
}) {
  // Await searchParams to handle it asynchronously as required by Next.js 15
  const paramsData = await searchParams;
  
  // Parse search parameters
  const page = paramsData.page ? parseInt(paramsData.page) : 1;
  // Reducir el límite para cargar más rápido inicialmente
  const limit = paramsData.limit ? parseInt(paramsData.limit) : 16;
  
  // Get category filter
  const categoryParam = paramsData.category;
  const categories = categoryParam ? [categoryParam] : undefined;
  
  // Always filter for products with stock, unless explicitly looking for no-stock products
  const stockParam = paramsData.stock;
  // Default stock filter to 1 (only products with stock) unless stock=0 is explicitly requested
  const stock = stockParam === '0' ? 0 : (stockParam ? parseInt(stockParam) : 1);
  
  // Get search term
  const search = paramsData.search;
  
  // El filtro de fuente ya no es necesario
  const source = undefined; // Ya no utilizamos el filtro de fuente
  
  try {
    console.log('Starting to fetch products and categories');
    
    // Fetch products and categories in parallel with loading states
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters sidebar */}
          <div className="w-full md:w-64 space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <h2 className="font-medium">Filtros</h2>
              </div>
            </div>
            
            <form>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="search"
                    name="search"
                    placeholder="Buscar productos..."
                    defaultValue={search || ''}
                  />
                </div>
                
                {/* Categorías - Suspense para carga asíncrona */}
                <Suspense fallback={
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                }>
                  <CategoriesSection categoryParam={categoryParam} />
                </Suspense>
                
                <Button type="submit" className="w-full">
                  Aplicar Filtros
                </Button>
              </div>
            </form>
          </div>
          
          {/* Products grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Productos</h1>
              {/* Count se mostrará después de cargar */}
            </div>
            
            <Suspense fallback={<ProductsPageSkeleton />}>
              <ProductListingWithPagination 
                page={page} 
                limit={limit} 
                categories={categories} 
                stock={stock} 
                search={search}
              />
            </Suspense>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error in products page:', error);
    
    // Fallback UI for errors
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">No se pudieron cargar los productos</h1>
          <p className="text-muted-foreground mb-6">
            Lo sentimos, hubo un problema al cargar los productos. Por favor, inténtalo de nuevo más tarde.
          </p>
          <a href="/products">
            <Button>Reintentar</Button>
          </a>
        </div>
      </div>
    );
  }
}

// Componente separado para categorías - carga independiente
async function CategoriesSection({ categoryParam }: { categoryParam?: string }) {
  const allCategories = await getUnifiedCategories();
  
  // Ordenar alfabéticamente todas las categorías unificadas
  const allCategoriesSorted = [...allCategories].sort((a, b) => {
    const nameA = a.source === 'zecat' 
      ? ((a as any).title || (a as any).description || 'Categoría') 
      : ((a as any).name || 'Categoría');
    const nameB = b.source === 'zecat' 
      ? ((b as any).title || (b as any).description || 'Categoría') 
      : ((b as any).name || 'Categoría');
    return nameA.localeCompare(nameB);
  });
  
  if (allCategoriesSorted.length === 0) {
    return null;
  }
  
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="all-categories">
        <AccordionTrigger className="text-sm">Categorías</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 pt-1">
            {allCategoriesSorted.map((category) => {
              const categoryId = category.id.toString();
              const categoryName = category.source === 'zecat' 
                ? ((category as any).title || (category as any).description || 'Categoría') 
                : ((category as any).name || 'Categoría');
              
              return (
                <div key={`${category.source}-${categoryId}`} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`category-${category.source}-${categoryId}`}
                    name="category"
                    value={categoryId}
                    defaultChecked={categoryParam === categoryId}
                  />
                  <label
                    htmlFor={`category-${category.source}-${categoryId}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {categoryName}
                  </label>
                </div>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

// Componente separado para productos con paginación - carga independiente
async function ProductListingWithPagination({ 
  page, 
  limit,
  categories,
  stock,
  search
}: { 
  page: number, 
  limit: number,
  categories?: string[],
  stock?: number,
  search?: string
}) {
  const productsResponse = await getUnifiedProducts({
    page,
    limit,
    categories,
    stock,
    search,
    source: undefined
  });
  
  // Transform API products to match our product structure
  const products = productsResponse.products.map(product => {
    if (product.source === 'zecat') {
      // Handle Zecat products
      const totalStock = product.products && Array.isArray(product.products)
        ? product.products.reduce((sum, variant) => sum + (variant.stock || 0), 0)
        : 0;
        
      return {
        id: createCompositeId('zecat', product.id),
        name: product.name,
        image: product.images[0]?.image_url || "/placeholder.svg?height=400&width=300",
        category: product.families[0]?.description || "general",
        isNew: totalStock > 0,
        totalStock: totalStock,
        source: 'zecat' as const
      };
    } else {
      // Handle CDO products
      const firstVariant = product.variants && product.variants.length > 0 
        ? product.variants[0] 
        : null;
      
      const totalStock = product.variants && Array.isArray(product.variants)
        ? product.variants.reduce((sum, variant) => sum + (variant.stock_available || 0), 0)
        : 0;
      
      return {
        id: createCompositeId('cdo', product.id),
        name: product.name,
        image: firstVariant?.picture?.original || "/placeholder.svg?height=400&width=300",
        category: product.categories[0]?.name || "general",
        isNew: totalStock > 0,
        totalStock: totalStock,
        source: 'cdo' as const
      };
    }
  });
  
  // Get total pages and product count
  const totalPages = productsResponse.total_pages;
  const totalProducts = productsResponse.count;
  
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {totalProducts} productos encontrados
        </p>
      </div>
      
      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron productos que coincidan con los criterios.</p>
        </div>
      )}
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <a href={`/products?page=${page - 1}${categoryParam ? `&category=${categoryParam}` : ''}${search ? `&search=${encodeURIComponent(search || '')}` : ''}`}>
              <Button variant="outline">Anterior</Button>
            </a>
          )}
          
          <span className="flex items-center px-4 py-2 border rounded-md">
            Página {page} de {totalPages}
          </span>
          
          {page < totalPages && (
            <a href={`/products?page=${page + 1}${categoryParam ? `&category=${categoryParam}` : ''}${search ? `&search=${encodeURIComponent(search || '')}` : ''}`}>
              <Button variant="outline">Siguiente</Button>
            </a>
          )}
        </div>
      )}
    </>
  );
}

