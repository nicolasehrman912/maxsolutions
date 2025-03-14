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
  try {
    // If source is specified, only fetch from that source
    if (filters.source === 'zecat') {
      const zecatFilters = mapUnifiedToZecatFilters(filters);
      const response = await getZecatProducts(zecatFilters);
      
      return {
        total_pages: response.total_pages,
        count: response.count,
        products: response.generic_products.map(product => ({ ...product, source: 'zecat' as const })),
        source: 'zecat'
      };
    }
    
    if (filters.source === 'cdo') {
      const cdoFilters = mapUnifiedToCDOFilters(filters);
      const response = await getCDOProducts(cdoFilters);
      
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
      // Using Promise.allSettled to handle potential failures in either API
      const [zecatResult, cdoResult] = await Promise.allSettled([
        getZecatProducts(mapUnifiedToZecatFilters(filters)),
        getCDOProducts(mapUnifiedToCDOFilters(filters))
      ]);
      
      // Process Zecat results (if successful)
      const zecatProducts = zecatResult.status === 'fulfilled' 
        ? zecatResult.value.generic_products.map(product => ({ 
            ...product, 
            source: 'zecat' as const 
          }))
        : [];
        
      // Process CDO results (if successful)
      const cdoProducts = cdoResult.status === 'fulfilled'
        ? cdoResult.value.products
        : [];
      
      // Combine and paginate results
      const allProducts = [...zecatProducts, ...cdoProducts];
      const pageSize = filters.limit || 20;
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
    } catch (error) {
      // If fetching from both APIs fails, fall back to just Zecat
      console.error('Error fetching from both APIs:', error);
      const zecatFilters = mapUnifiedToZecatFilters(filters);
      const response = await getZecatProducts(zecatFilters);
      
      return {
        total_pages: response.total_pages,
        count: response.count,
        products: response.generic_products.map(product => ({ ...product, source: 'zecat' as const })),
        source: 'zecat'
      };
    }
  } catch (error) {
    console.error('Critical error in getUnifiedProducts:', error);
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
        console.log(`Trying to fetch CDO product with code: ${idStr}`);
        const products = await getCDOProducts({ page_size: 1000 });
        const matchingProduct = products.products.find(p => p.code === idStr);
        if (matchingProduct) {
          console.log(`Found CDO product with code: ${idStr}`);
          return matchingProduct;
        }
      }
      
      return product;
    }
    
    throw new Error(`Invalid source: ${source}. Expected "zecat" or "cdo".`);
  } catch (error) {
    console.error(`Error fetching unified product with ID ${compositeId}:`, error);
    return null;
  }
}

/**
 * Get all categories from both APIs
 */
export async function getUnifiedCategories(): Promise<UnifiedCategory[]> {
  try {
    // Using Promise.allSettled to handle potential failures in either API
    const [zecatResult, cdoResult] = await Promise.allSettled([
      getZecatFamilies(),
      getCDOCategories()
    ]);
    
    // Process Zecat categories (if successful)
    const zecatCategories = zecatResult.status === 'fulfilled'
      ? zecatResult.value.families.map(family => ({
          ...family,
          source: 'zecat' as const
        }))
      : [];
    
    // Process CDO categories (if successful)  
    const cdoCategoriesWithSource = cdoResult.status === 'fulfilled'
      ? cdoResult.value.map(category => ({
          ...category,
          source: 'cdo' as const
        }))
      : [];
    
    return [...zecatCategories, ...cdoCategoriesWithSource];
  } catch (error) {
    console.error('Error fetching unified categories:', error);
    // Return empty categories in case of a critical error
    return [];
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