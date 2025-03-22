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
  const cacheKey = `products-${JSON.stringify(filters)}`;
  
  try {
    // Intento de obtener datos del cache primero si el cache no está deshabilitado
    if (!disableCache && typeof window !== 'undefined') {
      try {
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          // Verificar si los datos en caché son recientes (menos de 5 minutos)
          const cacheTime = parsedData.timestamp;
          const now = Date.now();
          if (now - cacheTime < 5 * 60 * 1000) { // 5 minutos
            console.log('Returning cached products data');
            return parsedData.data;
          }
        }
      } catch (e) {
        console.error('Error accessing cache:', e);
      }
    }
    
    // Limitar el tamaño de página para no sobrecargar las APIs
    const limitedFilters = {
      ...filters,
      limit: Math.min(filters.limit || 16, 24) // Limitar a un máximo de 24 productos por página para mejor rendimiento
    };
    
    // Timeout más corto para fallar más rápido
    const TIMEOUT_MS = 3500; // 3.5 segundos
    
    // Si source es específico, solo buscar en esa fuente
    if (filters.source === 'zecat' || filters.source === 'cdo') {
      let result: UnifiedProductsResponse;
      
      // Establecer un timeout para cualquier fuente específica
      const timeout = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout fetching from ${filters.source}`)), TIMEOUT_MS)
      );
      
      if (filters.source === 'zecat') {
        const zecatFilters = mapUnifiedToZecatFilters(limitedFilters);
        const response = await Promise.race([getZecatProducts(zecatFilters), timeout]);
        
        // Procesar respuesta de Zecat
        const products = response.generic_products.map(product => ({ 
          ...product, 
          source: 'zecat' as const 
        }));
        
        // Aplicar filtros de categoría si es necesario
        let finalProducts = products;
        if (filters.categories && filters.categories.length > 0) {
          const categoryIds = new Set(filters.categories.map(cat => String(cat)));
          finalProducts = products.filter(product => 
            product.families?.some(family => categoryIds.has(String(family.id)))
          );
        }
        
        result = {
          total_pages: Math.ceil(finalProducts.length / (filters.limit || 16)),
          count: finalProducts.length,
          products: finalProducts,
          source: 'zecat'
        };
      } else {
        // Source es CDO
        const cdoFilters = mapUnifiedToCDOFilters(limitedFilters);
        const response = await Promise.race([getCDOProducts(cdoFilters), timeout]);
        
        // Procesar respuesta de CDO
        let finalProducts = response.products;
        if (filters.categories && filters.categories.length > 1) {
          const categoryIds = new Set(filters.categories.map(cat => String(cat)));
          finalProducts = response.products.filter(product => 
            product.categories?.some(category => categoryIds.has(String(category.id)))
          );
        }
        
        result = {
          total_pages: Math.ceil(finalProducts.length / (filters.limit || 16)),
          count: finalProducts.length,
          products: finalProducts,
          source: 'cdo'
        };
      }
      
      // Guardar en caché el resultado
      if (!disableCache && typeof window !== 'undefined') {
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            data: result,
            timestamp: Date.now()
          }));
        } catch (e) {
          console.error('Error saving to cache:', e);
        }
      }
      
      return result;
    }
    
    // Si no hay fuente específica, buscar en ambas APIs
    // Timeout reducido para ambas fuentes
    const timeout = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout fetching products')), TIMEOUT_MS)
    );
    
    // Usar Promise.allSettled para manejar fallos en cualquier API
    const [zecatResult, cdoResult] = await Promise.allSettled([
      Promise.race([getZecatProducts(mapUnifiedToZecatFilters(limitedFilters)), timeout]) as Promise<any>,
      Promise.race([getCDOProducts(mapUnifiedToCDOFilters(limitedFilters)), timeout]) as Promise<any>
    ]);
    
    // Mostrar advertencia si alguna API falló
    if (zecatResult.status === 'rejected') {
      console.warn('Failed to fetch Zecat products:', zecatResult.reason);
    }
    if (cdoResult.status === 'rejected') {
      console.warn('Failed to fetch CDO products:', cdoResult.reason);
    }
    
    // Fallar rápido si ambas APIs fallan
    if (zecatResult.status === 'rejected' && cdoResult.status === 'rejected') {
      throw new Error('Failed to fetch products from both APIs');
    }
    
    // Procesar resultados de Zecat (si tuvo éxito)
    const zecatProducts = zecatResult.status === 'fulfilled' 
      ? zecatResult.value.generic_products.map((product: any) => ({ 
          ...product, 
          source: 'zecat' as const 
        }))
      : [];
      
    // Procesar resultados de CDO (si tuvo éxito)
    const cdoProducts = cdoResult.status === 'fulfilled'
      ? cdoResult.value.products
      : [];
    
    // Optimización: Filtrar productos por categoría de manera más eficiente
    let filteredZecatProducts = zecatProducts;
    let filteredCdoProducts = cdoProducts;
    
    if (filters.categories && filters.categories.length > 0) {
      const categoryIdsSet = new Set(filters.categories.map(cat => String(cat)));
      
      // Filtrar productos Zecat
      filteredZecatProducts = zecatProducts.filter((product: GenericProduct & { source: 'zecat' }) => 
        product.families?.some((family: Family) => categoryIdsSet.has(String(family.id)))
      );
      
      // Filtrar productos CDO
      filteredCdoProducts = cdoProducts.filter((product: CDOProduct) => 
        product.categories?.some((category: CDOCategory) => categoryIdsSet.has(String(category.id)))
      );
    }
    
    // Combinar productos filtrados
    const allProducts = [...filteredZecatProducts, ...filteredCdoProducts];
    
    // Aplicar paginación
    const pageSize = filters.limit || 16;
    const currentPage = filters.page || 1;
    
    // Calcular páginas totales
    const totalCount = allProducts.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    
    // Paginar resultados combinados
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedProducts = allProducts.slice(startIndex, startIndex + pageSize);
    
    // Crear respuesta unificada
    const result = {
      total_pages: totalPages,
      count: totalCount,
      products: paginatedProducts,
      source: 'unified' as const
    };
    
    // Guardar en caché el resultado
    if (!disableCache && typeof window !== 'undefined') {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          data: result,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.error('Error saving to cache:', e);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching unified products:', error);
    
    // Intentar devolver datos en caché como fallback, incluso si están vencidos
    if (typeof window !== 'undefined') {
      try {
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          console.log('Using expired cache as fallback after error');
          return JSON.parse(cachedData).data;
        }
      } catch (e) {
        console.error('Error accessing fallback cache:', e);
      }
    }
    
    // Si todo falla, devolver lista vacía
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