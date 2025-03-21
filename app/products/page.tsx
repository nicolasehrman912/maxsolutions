import { ProductGrid } from "@/components/product-grid"
import { getUnifiedProducts, getUnifiedCategories, createCompositeId, UnifiedCategory } from "@/lib/api/unified"
import { Family } from "@/lib/api/types"
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
import { XCircle } from "lucide-react"

export const dynamic = 'force-dynamic'; // Forzar renderizado dinámico para los filtros
export const revalidate = 14400 // Revalidar esta página cada 4 horas

type SearchParams = {
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
  // Await searchParams to handle it asynchronously as required by Next.js 15
  const paramsData = await searchParams;
  
  // Parse search parameters
  const page = paramsData.page ? parseInt(paramsData.page) : 1;
  // Reducir el límite para cargar más rápido inicialmente
  const limit = paramsData.limit ? parseInt(paramsData.limit) : 16;
  
  // Get category filter
  const categoryParam = paramsData.category;
  // Handle both single category string and array of categories
  const categories = categoryParam 
    ? Array.isArray(categoryParam) 
      ? categoryParam // If already an array
      : [categoryParam] // If single string, convert to array
    : undefined;
  
  // Always filter for products with stock, unless explicitly looking for no-stock products
  const stockParam = paramsData.stock;
  // Default stock filter to 1 (only products with stock) unless stock=0 is explicitly requested
  const stock = stockParam === '0' ? 0 : (stockParam ? parseInt(stockParam) : 1);
  
  // Get search term
  const search = paramsData.search;
  
  // El filtro de fuente ya no es necesario
  const source = undefined; // Ya no utilizamos el filtro de fuente
  
  try {
    // No esperamos a que las categorías se carguen antes de mostrar la página
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
            
            <form action="/products" method="get">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="search"
                    name="search"
                    placeholder="Buscar productos..."
                    defaultValue={search || ''}
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Aplicar Filtros
                </Button>
                
                {/* Envolver CategoriesSection en Suspense para no bloquear la página */}
                <Suspense fallback={
                  <div className="space-y-2 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <div className="h-4 w-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                }>
                  <CategoriesSection 
                    categoryParam={categoryParam}
                  />
                </Suspense>
                
                {/* Mantener otros parámetros existentes que no estén controlados por inputs visibles */}
                {page > 1 && <input type="hidden" name="page" value={page} />}
                {limit !== 16 && <input type="hidden" name="limit" value={limit} />}
                {stockParam === '0' && <input type="hidden" name="stock" value="0" />}
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
                categoryParam={categoryParam}
                stock={stock} 
                search={search}
              />
            </Suspense>
          </div>
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

// Componente separado para categorías - carga independiente
async function CategoriesSection({ categoryParam }: { categoryParam?: string | string[] }) {
  try {
    // Obtener categorías unificadas - ahora optimizado con mejor caché
    const allCategories = await getUnifiedCategories();
    
    // Convertir categoryParam a array para manejar múltiples casos
    const selectedCategories = Array.isArray(categoryParam) 
      ? categoryParam 
      : categoryParam ? [categoryParam] : [];
    
    // Function to get category name consistently
    const getCategoryName = (category: UnifiedCategory) => {
      return category.source === 'zecat' 
        ? ((category as any).title || (category as any).description || 'Categoría') 
        : ((category as any).name || 'Categoría');
    };
    
    // Ordenar categorías alfabéticamente para mejor usabilidad
    const sortedCategories = [...allCategories].sort((a, b) => {
      const nameA = getCategoryName(a);
      const nameB = getCategoryName(b);
      return nameA.localeCompare(nameB);
    });
    
    if (sortedCategories.length === 0) {
      return null;
    }
    
    return (
      <Accordion type="single" collapsible className="w-full" defaultValue={selectedCategories.length > 0 ? "all-categories" : undefined}>
        <AccordionItem value="all-categories">
          <AccordionTrigger className="text-sm">
            Categorías
            {selectedCategories.length > 0 && (
              <span className="ml-2 text-xs rounded-full bg-primary text-primary-foreground px-2 py-1">
                {selectedCategories.length}
              </span>
            )}
          </AccordionTrigger>
          <AccordionContent>
            {selectedCategories.length > 0 && (
              <div className="mb-3 pb-3 border-b text-xs text-muted-foreground">
                <p className="font-bold mb-1">Categorías seleccionadas:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedCategories.map(catId => {
                    // Find the corresponding category to display its name
                    const category = sortedCategories.find(c => c.id.toString() === catId);
                    const categoryName = category ? getCategoryName(category) : catId;
                    
                    return (
                      <span key={catId} className="px-2 py-1 bg-muted rounded-full text-xs">
                        {categoryName}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* All categories displayed together */}
            <div className="space-y-2">
              {sortedCategories.map((category) => {
                const categoryId = category.id.toString();
                const categoryName = getCategoryName(category);
                
                return (
                  <div key={`${category.source}-${categoryId}`} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`category-${category.source}-${categoryId}`}
                      name="category"
                      value={categoryId}
                      defaultChecked={selectedCategories.includes(categoryId)}
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
  } catch (error) {
    console.error('Error al cargar las categorías:', error);
    
    // Fallback UI para cuando hay un error con las categorías
    return (
      <div className="text-sm text-muted-foreground rounded-md p-3 bg-muted">
        <p>No se pudieron cargar las categorías en este momento.</p>
        <a href="/products" className="text-primary hover:underline mt-2 inline-block">
          Recargar filtros
        </a>
      </div>
    );
  }
}

// Componente separado para productos con paginación - carga independiente
async function ProductListingWithPagination({ 
  page, 
  limit,
  categories,
  categoryParam,
  stock,
  search
}: { 
  page: number, 
  limit: number,
  categories?: string[],
  categoryParam?: string | string[],
  stock?: number,
  search?: string
}) {
  // Optimización: Configurar un timeout para evitar esperas infinitas
  const MAX_TIMEOUT = 5000; // 5 segundos máximo de espera
  
  try {
    // Usar Promise.race para implementar un timeout
    const productsPromise = getUnifiedProducts({
      page,
      limit,
      categories,
      stock,
      search,
      source: undefined
    });
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout obteniendo productos")), MAX_TIMEOUT);
    });
    
    const productsResponse = await Promise.race([
      productsPromise,
      timeoutPromise
    ]) as Awaited<ReturnType<typeof getUnifiedProducts>>;
    
    // Optimización: Simplificar el mapeo de productos para reducir el procesamiento
    const products = productsResponse.products.map(product => {
      // Variables comunes para ambos tipos de productos
      let id, name, image, category, totalStock = 0;
      
      if (product.source === 'zecat') {
        // Procesamiento mínimo para productos Zecat
        id = createCompositeId('zecat', product.id);
        name = product.name;
        image = product.images?.[0]?.image_url || "/placeholder.svg?height=400&width=300";
        category = product.families?.[0]?.description || "general";
        totalStock = product.products?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
      } else {
        // Procesamiento mínimo para productos CDO
        id = createCompositeId('cdo', product.id);
        name = product.name;
        image = product.variants?.[0]?.picture?.original || "/placeholder.svg?height=400&width=300";
        category = product.categories?.[0]?.name || "general";
        totalStock = product.variants?.reduce((sum, v) => sum + (v.stock_available || 0), 0) || 0;
      }
      
      // Retornar objeto con estructura mínima necesaria
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
    
    // Get total pages and product count
    const totalPages = productsResponse.total_pages;
    const totalProducts = productsResponse.count;
    
    // Función auxiliar para construir la URL de paginación con múltiples categorías
    const buildPaginationUrl = (pageNum: number) => {
      let url = `/products?page=${pageNum}`;
      
      // Agregar categorías seleccionadas
      if (Array.isArray(categoryParam)) {
        categoryParam.forEach(cat => {
          url += `&category=${cat}`;
        });
      } else if (categoryParam) {
        url += `&category=${categoryParam}`;
      }
      
      // Agregar término de búsqueda si existe
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      return url;
    };
    
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
            <p className="text-muted-foreground mb-2">No se encontraron productos que coincidan con los criterios.</p>
            {categoryParam && (
              <p className="text-muted-foreground mb-6">
                Prueba seleccionando diferentes categorías o quitando algunos filtros.
              </p>
            )}
            <a href="/products?search=">
              <Button variant="outline">Ver todos los productos</Button>
            </a>
          </div>
        )}
        
        {/* Pagination Controls - Simplified */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {page > 1 && (
              <a href={buildPaginationUrl(page - 1)}>
                <Button variant="outline">Anterior</Button>
              </a>
            )}
            
            <span className="flex items-center px-4 py-2 border rounded-md">
              Página {page} de {totalPages}
            </span>
            
            {page < totalPages && (
              <a href={buildPaginationUrl(page + 1)}>
                <Button variant="outline">Siguiente</Button>
              </a>
            )}
          </div>
        )}
      </>
    );
  } catch (error) {
    console.error('Error cargando productos:', error);
    
    // Proporcionar una respuesta rápida en caso de error
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-2">Tiempo de respuesta excedido.</p>
        <p className="text-muted-foreground mb-6">
          La búsqueda de productos está tomando más tiempo del esperado.
        </p>
        <a href="/products?limit=8">
          <Button variant="outline">Intentar con menos productos</Button>
        </a>
      </div>
    );
  }
}

