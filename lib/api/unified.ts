import { 
  getProducts as getZecatProducts,
  getProductById as getZecatProductById,
  getFamilies as getZecatFamilies
} from './zecat';

import {
  getCDOProducts,
  getCDOProductById,
  getCDOCategories
} from './cdo';

import type {
  GenericProduct,
  CDOProduct,
  ProductFilters,
  CDOProductFilters,
  Family,
  CDOCategory
} from './types';

// Define a unified product type that can be either a Zecat or CDO product
export type UnifiedProduct = (GenericProduct & { source: 'zecat' }) | CDOProduct;

// Define a unified category type
export type UnifiedCategory = (Family & { source: 'zecat' }) | (CDOCategory & { source: 'cdo' });

// Define a unified response type
export interface UnifiedProductsResponse {
  total_pages: number;
  count: number;
  products: UnifiedProduct[];
  source?: 'zecat' | 'cdo' | 'unified';
}

// Define unified filters
export interface UnifiedFilters {
  page?: number;
  limit?: number;
  source?: 'zecat' | 'cdo' | 'unified';
  categories?: (string | number)[];
  search?: string;
  order?: {
    price?: 'asc' | 'desc';
  };
  stock?: number;
}

/**
 * Helper function to check if cache should be disabled based on URL
 * Updated for better SSR compatibility
 */
function shouldDisableCache(): boolean {
  // Always safely return false during SSR or when window access is problematic
  if (typeof window === 'undefined') return false;
  
  // Use a try/catch to safely handle URL parsing
  try {
    // Create a separate function to make this more resilient to hydration issues
    const checkCacheParam = () => {
      const url = new URL(window.location.href);
      return url.searchParams.has('nocache');
    };
    
    // Only execute the function if we're in the browser
    return typeof window !== 'undefined' ? checkCacheParam() : false;
  } catch (e) {
    // If there's any issue, default to not disabling cache
    return false;
  }
}

/**
 * Convert unified filters to Zecat-specific filters
 */
function mapUnifiedToZecatFilters(unified: UnifiedFilters): ProductFilters {
  return {
    page: unified.page,
    limit: unified.limit,
    families: unified.categories?.map(cat => String(cat)),
    stock: unified.stock,
    name: unified.search,
    order: unified.order
  };
}

/**
 * Convert unified filters to CDO-specific filters
 */
function mapUnifiedToCDOFilters(unified: UnifiedFilters): CDOProductFilters {
  // Nota: La API de CDO solo admite una categoría a la vez,
  // así que tomamos la primera si hay múltiples
  return {
    page_number: unified.page,
    page_size: unified.limit,
    category_id: unified.categories?.[0] ? Number(unified.categories[0]) : undefined,
    search: unified.search
  };
}

/**
 * Get products from both APIs or a specific one based on the 'source' filter
 */
export async function getUnifiedProducts(filters: UnifiedFilters = {}): Promise<UnifiedProductsResponse> {
  // Check if cache should be disabled
  const disableCache = shouldDisableCache();
  
  try {
    // Limitar el tamaño de página para no sobrecargar las APIs
    const limitedFilters = {
      ...filters,
      limit: Math.min(filters.limit || 16, 50) // Limitar a un máximo de 50 productos por página
    };
    
    // If source is specified, only fetch from that source
    if (filters.source === 'zecat') {
      const zecatFilters = mapUnifiedToZecatFilters(limitedFilters);
      
      const response = await getZecatProducts(zecatFilters);
      
      // Si se está filtrando por categorías, verificar que los productos realmente
      // pertenezcan a las categorías seleccionadas
      if (filters.categories && filters.categories.length > 0) {
        const categoryIds = filters.categories.map(cat => String(cat));
        
        // Filtrar productos por categoría - optimizado para reducir iteraciones
        const filteredProducts = response.generic_products.filter(product => 
          product.families && product.families.some(family => 
            categoryIds.includes(String(family.id))
          )
        );
        
        // Si después de filtrar no hay productos, devolver lista vacía
        if (filteredProducts.length === 0) {
          return {
            total_pages: 1,
            count: 0,
            products: [],
            source: 'zecat'
          };
        }
        
        // Devolver solo los productos filtrados
        return {
          total_pages: Math.ceil(filteredProducts.length / (filters.limit || 20)),
          count: filteredProducts.length,
          products: filteredProducts.map(product => ({ ...product, source: 'zecat' as const })),
          source: 'zecat'
        };
      }
      
      return {
        total_pages: response.total_pages,
        count: response.count,
        products: response.generic_products.map(product => ({ ...product, source: 'zecat' as const })),
        source: 'zecat'
      };
    }
    
    if (filters.source === 'cdo') {
      const cdoFilters = mapUnifiedToCDOFilters(limitedFilters);
      
      const response = await getCDOProducts(cdoFilters);
      
      // Si se está filtrando por múltiples categorías, necesitamos filtrar manualmente
      // ya que la API de CDO solo puede filtrar por una categoría
      if (filters.categories && filters.categories.length > 1) {
        const categoryIds = filters.categories.map(cat => String(cat));
        
        // Filtrar productos que coincidan con alguna de las categorías seleccionadas
        const filteredProducts = response.products.filter(product => 
          product.categories && product.categories.some(category => 
            categoryIds.includes(String(category.id))
          )
        );
        
        // Si después de filtrar no hay productos, devolver lista vacía
        if (filteredProducts.length === 0) {
          return {
            total_pages: 1,
            count: 0,
            products: [],
            source: 'cdo'
          };
        }
        
        // Devolver solo los productos filtrados
        return {
          total_pages: Math.ceil(filteredProducts.length / (filters.limit || 20)),
          count: filteredProducts.length,
          products: filteredProducts,
          source: 'cdo'
        };
      }
      
      return {
        total_pages: response.total_pages || 1,
        count: response.products.length,
        products: response.products,
        source: 'cdo'
      };
    }
    
    // If no source specified, fetch from both and combine results
    // This approach ensures no ID conflicts by using the source property
    try {
      // Configuración de timeout para Promise.race
      const timeout = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout fetching products')), 8000)
      );
      
      // Using Promise.allSettled to handle potential failures in either API
      const [zecatResult, cdoResult] = await Promise.allSettled([
        Promise.race([getZecatProducts(mapUnifiedToZecatFilters(limitedFilters)), timeout]) as Promise<any>,
        Promise.race([getCDOProducts(mapUnifiedToCDOFilters(limitedFilters)), timeout]) as Promise<any>
      ]);
      
      // Fallar rápido si ambas APIs fallan
      if (zecatResult.status === 'rejected' && cdoResult.status === 'rejected') {
        throw new Error('Failed to fetch products from both APIs');
      }
      
      // Process Zecat results (if successful)
      const zecatProducts = zecatResult.status === 'fulfilled' 
        ? zecatResult.value.generic_products.map((product: any) => ({ 
            ...product, 
            source: 'zecat' as const 
          }))
        : [];
        
      // Process CDO results (if successful)
      const cdoProducts = cdoResult.status === 'fulfilled'
        ? cdoResult.value.products
        : [];
      
      // Si hay filtros de categoría, filtrar de manera más eficiente
      if (filters.categories && filters.categories.length > 0) {
        const categoryIds = filters.categories.map(cat => String(cat));
        
        // Set para búsqueda más rápida de categorías
        const categoryIdsSet = new Set(categoryIds);
        
        // Filtrar productos de Zecat por categoría (families) - optimizado
        const filteredZecatProducts = zecatProducts.filter((product: GenericProduct & { source: 'zecat' }) => {
          // Para productos Zecat, verificar si tienen familias que coincidan
          return product.families?.some((family: Family) => 
            categoryIdsSet.has(String(family.id))
          );
        });
        
        // Filtrar productos de CDO por categoría - optimizado
        const filteredCdoProducts = cdoProducts.filter((product: CDOProduct) => {
          // Para productos CDO, verificar si tienen categorías que coincidan
          return product.categories?.some((category: CDOCategory) =>
            categoryIdsSet.has(String(category.id))
          );
        });
        
        // Combinar los productos filtrados
        const allProducts = [...filteredZecatProducts, ...filteredCdoProducts];
        
        // Si después de aplicar el filtro no hay productos, devolver lista vacía
        if (allProducts.length === 0) {
          return {
            total_pages: 1,
            count: 0,
            products: [],
            source: 'unified'
          };
        }
        
        const pageSize = filters.limit || 16;
        const currentPage = filters.page || 1;
        
        // Calculate total pages across both APIs
        const totalCount = allProducts.length;
        const totalPages = Math.ceil(totalCount / pageSize);
        
        // Paginate the combined results
        const startIndex = (currentPage - 1) * pageSize;
        const paginatedProducts = allProducts.slice(startIndex, startIndex + pageSize);
        
        return {
          total_pages: totalPages,
          count: totalCount,
          products: paginatedProducts,
          source: 'unified'
        };
      } else {
        // Si no hay filtros de categoría, combinar y paginar directamente
        const allProducts = [...zecatProducts, ...cdoProducts];
        
        const pageSize = filters.limit || 16;
        const currentPage = filters.page || 1;
        
        // Calculate total pages across both APIs
        const totalCount = allProducts.length;
        const totalPages = Math.ceil(totalCount / pageSize);
        
        // Paginate the combined results
        const startIndex = (currentPage - 1) * pageSize;
        const paginatedProducts = allProducts.slice(startIndex, startIndex + pageSize);
        
        return {
          total_pages: totalPages,
          count: totalCount,
          products: paginatedProducts,
          source: 'unified'
        };
      }
    } catch (error) {
      // If fetching from both APIs fails, fall back to just one source
      
      // Intentar con Zecat primero
      try {
        const zecatFilters = mapUnifiedToZecatFilters(limitedFilters);
        const response = await getZecatProducts(zecatFilters);
        
        return {
          total_pages: response.total_pages,
          count: response.count,
          products: response.generic_products.map(product => ({ ...product, source: 'zecat' as const })),
          source: 'zecat'
        };
      } catch (zecatError) {
        // Si Zecat falla, intentar con CDO
        try {
          const cdoFilters = mapUnifiedToCDOFilters(limitedFilters);
          const response = await getCDOProducts(cdoFilters);
          
          return {
            total_pages: response.total_pages || 1,
            count: response.products.length,
            products: response.products,
            source: 'cdo'
          };
        } catch (cdoError) {
          // Si los dos fallbacks fallan, lanzar el error original
          throw error;
        }
      }
    }
  } catch (error) {
    // Return empty results in case of a critical error
    return {
      total_pages: 1,
      count: 0,
      products: [],
      source: 'unified'
    };
  }
}

/**
 * Get a product by ID from either API
 * The ID string format is: "{source}_{id}" (e.g., "zecat_123" or "cdo_456")
 */
export async function getUnifiedProductById(compositeId: string): Promise<UnifiedProduct | null> {
  try {
    const [source, idStr] = compositeId.split('_');
    
    if (!source || !idStr) {
      throw new Error(`Invalid product ID format: ${compositeId}. Expected format: "{source}_{id}"`);
    }
    
    if (source === 'zecat') {
      const product = await getZecatProductById(idStr);
      return product ? { ...product, source: 'zecat' } : null;
    } 
    
    if (source === 'cdo') {
      // For CDO, the idStr could be a numeric ID or a code
      // If it's numeric, we can use it directly
      // If it's a product code (alphanumeric), we'll pass it as is
      let id: number;
      
      // Check if the ID is purely numeric
      if (/^\d+$/.test(idStr)) {
        id = parseInt(idStr, 10);
        if (isNaN(id)) {
          throw new Error(`Invalid CDO product ID: ${idStr}. Expected a number or valid product code.`);
        }
      } else {
        // If it contains letters, it's likely a product code, so we'll convert it to a number
        // since our getCDOProductById now handles both numeric IDs and codes
        id = parseInt(idStr, 10) || 0; // Use 0 as a fallback if parsing fails
      }
      
      // Use the ID to fetch the product
      const product = await getCDOProductById(id);
      
      // If we couldn't find a product with the ID and the ID looks like a code (contains letters),
      // we'll try to search for it in the product list by code
      if (!product && !/^\d+$/.test(idStr)) {
        const products = await getCDOProducts({ page_size: 1000 });
        const matchingProduct = products.products.find(p => p.code === idStr);
        if (matchingProduct) {
          return matchingProduct;
        }
      }
      
      return product;
    }
    
    throw new Error(`Invalid source: ${source}. Expected "zecat" or "cdo".`);
  } catch (error) {
    return null;
  }
}

/**
 * Get all categories from both APIs - updated to load all categories at once
 */
export async function getUnifiedCategories(): Promise<UnifiedCategory[]> {
  try {
    // Check if cache should be disabled
    const disableCache = shouldDisableCache();
    
    console.log('[getUnifiedCategories] Starting to fetch categories, cache disabled:', disableCache);
    
    // If cache isn't disabled, try getting both categories from cache
    if (!disableCache && typeof window !== 'undefined') {
      try {
        const { getStoredCategories } = await import('../local-storage');
        const zecatCategories = getStoredCategories('zecat');
        const cdoCategories = getStoredCategories('cdo');
        
        console.log('[getUnifiedCategories] Cache check - zecat categories:', zecatCategories?.length || 0);
        console.log('[getUnifiedCategories] Cache check - cdo categories:', cdoCategories?.length || 0);
        
        // Only use cache if we have BOTH category sets
        if (zecatCategories && cdoCategories && 
            Array.isArray(zecatCategories) && Array.isArray(cdoCategories) && 
            zecatCategories.length > 0 && cdoCategories.length > 0) {
          
          const zecatWithSource = zecatCategories.map((category: Family) => ({
            ...category,
            source: 'zecat' as const
          }));
          
          const cdoWithSource = cdoCategories.map((category: CDOCategory) => ({
            ...category,
            source: 'cdo' as const
          }));
          
          console.log('[getUnifiedCategories] Returning cached categories - total:', zecatWithSource.length + cdoWithSource.length);
          
          return [...zecatWithSource, ...cdoWithSource];
        }
      } catch (error) {
        console.error('[getUnifiedCategories] Error accessing cached categories:', error);
        // Error accessing localStorage, continue with API fetch
      }
    }
    
    console.log('[getUnifiedCategories] Cache not available or disabled, fetching from APIs');
    
    // Configure timeout for API requests
    const timeout = 15000; // 15 seconds
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout fetching categories')), timeout)
    );
    
    // Fetch from both APIs concurrently
    const [zecatResult, cdoResult] = await Promise.allSettled([
      Promise.race([getZecatFamilies(), timeoutPromise]),
      Promise.race([getCDOCategories(), timeoutPromise])
    ]);
    
    console.log('[getUnifiedCategories] API results received - zecat status:', zecatResult.status);
    console.log('[getUnifiedCategories] API results received - cdo status:', cdoResult.status);
    
    // Process Zecat categories
    const zecatCategories = zecatResult.status === 'fulfilled' && zecatResult.value?.families
      ? zecatResult.value.families.map((family: Family) => ({
          ...family,
          source: 'zecat' as const
        }))
      : [];
    
    // Process CDO categories
    const cdoCategoriesWithSource = cdoResult.status === 'fulfilled' && cdoResult.value
      ? cdoResult.value.map((category: CDOCategory) => ({
          ...category,
          source: 'cdo' as const
        }))
      : [];
    
    console.log('[getUnifiedCategories] Processed categories - zecat count:', zecatCategories.length);
    console.log('[getUnifiedCategories] Processed categories - cdo count:', cdoCategoriesWithSource.length);
    
    // Combine all categories
    const allCategories = [...zecatCategories, ...cdoCategoriesWithSource];
    
    // If we have categories from both sources, cache them
    if (zecatCategories.length > 0 && cdoCategoriesWithSource.length > 0 && 
        !disableCache && typeof window !== 'undefined') {
      try {
        const { saveCategories } = await import('../local-storage');
        saveCategories('zecat', zecatResult.status === 'fulfilled' ? (zecatResult.value?.families ?? []) : []);
        saveCategories('cdo', cdoResult.status === 'fulfilled' ? (cdoResult.value ?? []) : []);
        console.log('[getUnifiedCategories] Categories cached successfully');
      } catch (error) {
        console.error('[getUnifiedCategories] Error saving categories to cache:', error);
        // Silently handle storage errors
      }
    }
    
    // If we have any categories, return them
    if (allCategories.length > 0) {
      console.log('[getUnifiedCategories] Returning combined categories - total:', allCategories.length);
      return allCategories;
    }
    
    console.warn('[getUnifiedCategories] No categories found, using fallback');
    
    // If all APIs failed, use fallback categories
    return [
      { id: '101', title: 'Escritura', source: 'zecat' as const } as Family & { source: 'zecat' },
      { id: '161', title: 'Tecnología', source: 'zecat' as const } as Family & { source: 'zecat' },
      { id: '131', title: 'Proximos ingresos', source: 'zecat' as const } as Family & { source: 'zecat' },
      { id: '221', title: 'Bolsas y Mochilas', source: 'zecat' as const } as Family & { source: 'zecat' }
    ];
  } catch (error) {
    console.error('[getUnifiedCategories] Unexpected error:', error);
    
    // Return fallback categories in case of error
    return [
      { id: '101', title: 'Escritura', source: 'zecat' as const } as Family & { source: 'zecat' },
      { id: '161', title: 'Tecnología', source: 'zecat' as const } as Family & { source: 'zecat' },
      { id: '131', title: 'Proximos ingresos', source: 'zecat' as const } as Family & { source: 'zecat' },
      { id: '221', title: 'Bolsas y Mochilas', source: 'zecat' as const } as Family & { source: 'zecat' }
    ];
  }
}

/**
 * Helper function to create a composite ID from source and ID
 */
export function createCompositeId(source: 'zecat' | 'cdo', id: string | number): string {
  return `${source}_${id}`;
}

/**
 * Helper function to extract source and ID from composite ID
 */
export function parseCompositeId(compositeId: string): { source: 'zecat' | 'cdo', id: string } {
  const [source, id] = compositeId.split('_');
  
  if (source !== 'zecat' && source !== 'cdo') {
    throw new Error(`Invalid source: ${source}. Expected "zecat" or "cdo".`);
  }
  
  if (!id) {
    throw new Error(`Invalid composite ID: ${compositeId}. Expected format: "{source}_{id}".`);
  }
  
  return { source, id };
} 