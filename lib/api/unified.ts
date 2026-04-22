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

import { formatCategories, getUnifiedIdsForCategories } from '../categories';

export type UnifiedProduct = (GenericProduct & { source: 'zecat' }) | CDOProduct;
export type UnifiedCategory = (Family & { source: 'zecat' }) | (CDOCategory & { source: 'cdo' });

export interface UnifiedProductsResponse {
  total_pages: number;
  count: number;
  products: UnifiedProduct[];
  source?: 'zecat' | 'cdo' | 'unified';
}

export interface UnifiedFilters {
  page?: number;
  limit?: number;
  source?: 'zecat' | 'cdo' | 'unified';
  categories?: (string | number)[];
  search?: string;
  order?: { price?: 'asc' | 'desc' };
  stock?: number;
}

// Cache en memoria — guarda los 294 productos completos
let cdoCache: { products: CDOProduct[], timestamp: number } | null = null;
const CDO_CACHE_TTL = 4 * 60 * 60 * 1000; // 4 horas

/**
 * Trae TODOS los productos de CDO (las 3 páginas completas) con cache.
 * CDO no devuelve total_pages en su respuesta, así que pedimos las 3 páginas
 * siempre en paralelo. Si alguna viene vacía, simplemente no suma nada.
 */
async function getAllCDOProducts(): Promise<CDOProduct[]> {
  if (cdoCache && Date.now() - cdoCache.timestamp < CDO_CACHE_TTL && cdoCache.products.length > 200) {
    console.log(`[CDO] Using full cache: ${cdoCache.products.length} products`);
    return cdoCache.products;
  }

  try {
    const PAGE_SIZE = 100;
    // CDO tiene ~294 productos en 3 páginas. No confiar en total_pages (CDO no lo devuelve).
    const KNOWN_PAGES = 3;
    console.log(`[CDO] Fetching all ${KNOWN_PAGES} pages in parallel...`);

    const results = await Promise.allSettled(
      Array.from({ length: KNOWN_PAGES }, (_, i) =>
        getCDOProducts({ page_size: PAGE_SIZE, page_number: i + 1 })
      )
    );

    const allProducts: CDOProduct[] = [];
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.products?.length) {
        console.log(`[CDO] Page fulfilled: ${r.value.products.length} products`);
        allProducts.push(...r.value.products);
      } else if (r.status === 'rejected') {
        console.warn('[CDO] Page failed:', r.reason);
      }
    }

    console.log(`[CDO] Total fetched: ${allProducts.length} products`);
    cdoCache = { products: allProducts, timestamp: Date.now() };
    return allProducts;

  } catch (error) {
    console.error('[CDO] getAllCDOProducts error:', error);
    return cdoCache?.products || [];
  }
}

function filterCDOByCategories(products: CDOProduct[], cdoCategoryIds: number[]): CDOProduct[] {
  if (!cdoCategoryIds || cdoCategoryIds.length === 0) return [];
  const catSet = new Set(cdoCategoryIds);
  const filtered = products.filter(p => p.categories?.some(c => catSet.has(c.id)));
  console.log(`[CDO] Filtered by [${cdoCategoryIds.join(',')}]: ${filtered.length}/${products.length} products`);
  return filtered;
}

/** Precio base de un producto CDO (net_price de la primera variante, en USD como float) */
function cdoPrice(p: CDOProduct): number {
  const raw = p.variants?.[0]?.net_price ?? p.variants?.[0]?.list_price ?? '0';
  return parseFloat(raw) || 0;
}

function sortCDOByPrice(products: CDOProduct[]): CDOProduct[] {
  return [...products].sort((a, b) => cdoPrice(a) - cdoPrice(b));
}

export async function getUnifiedProducts(filters: UnifiedFilters = {}): Promise<UnifiedProductsResponse> {
  const TIMEOUT_MS = 30000;
  const allCategories = formatCategories();

  try {
    let zecatFamilyIds: string[] | undefined;
    let cdoCategoryIds: number[] | undefined;
    let categoryHasCDOMapping = true;

    if (filters.categories && filters.categories.length > 0) {
      const { zecatIds, cdoIds, hasCDOMapping } = getUnifiedIdsForCategories(filters.categories, allCategories);
      zecatFamilyIds = zecatIds.length > 0 ? zecatIds : undefined;
      cdoCategoryIds = cdoIds;
      categoryHasCDOMapping = hasCDOMapping;
      console.log(`[unified] Filter: Zecat=[${zecatFamilyIds?.join(',')}] CDO=[${cdoCategoryIds?.join(',')}] hasCDOMapping=${hasCDOMapping}`);
    }

    const shouldFetchCDO = !filters.categories?.length || categoryHasCDOMapping;

    if (filters.source === 'zecat') {
      const response = await getZecatProducts({
        page: filters.page, limit: filters.limit,
        families: zecatFamilyIds, stock: filters.stock,
        name: filters.search, order: filters.order
      });
      const products = response.generic_products.map(p => ({ ...p, source: 'zecat' as const }));
      return { total_pages: response.total_pages || 1, count: response.count || products.length, products, source: 'zecat' };
    }

    if (filters.source === 'cdo') {
      if (!shouldFetchCDO) return { total_pages: 1, count: 0, products: [], source: 'cdo' };
      const allCDO = await getAllCDOProducts();
      const filtered = cdoCategoryIds?.length ? filterCDOByCategories(allCDO, cdoCategoryIds) : allCDO;
      const sorted = sortCDOByPrice(filtered);
      const pageSize = filters.limit || 48;
      const currentPage = filters.page || 1;
      const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
      const start = (currentPage - 1) * pageSize;
      return { total_pages: totalPages, count: sorted.length, products: sorted.slice(start, start + pageSize), source: 'cdo' };
    }

    // Ambas APIs en paralelo
    const makeTimeout = (ms: number) => new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)
    );

    const [zecatResult, cdoResult] = await Promise.allSettled([
      Promise.race([
        getZecatProducts({
          page: 1, limit: 48,
          families: zecatFamilyIds,
          stock: filters.stock,
          name: filters.search,
          order: filters.order
        }),
        makeTimeout(TIMEOUT_MS)
      ]),
      shouldFetchCDO
        ? Promise.race([getAllCDOProducts(), makeTimeout(TIMEOUT_MS)])
        : Promise.resolve([] as CDOProduct[])
    ]);

    if (zecatResult.status === 'rejected') console.warn('[unified] Zecat failed:', zecatResult.reason);
    if (cdoResult.status === 'rejected') console.warn('[unified] CDO failed:', cdoResult.reason);
    if (zecatResult.status === 'rejected' && cdoResult.status === 'rejected') {
      throw new Error('Both APIs failed');
    }

    let zecatProducts: (GenericProduct & { source: 'zecat' })[] = [];
    if (zecatResult.status === 'fulfilled' && zecatResult.value) {
      zecatProducts = ((zecatResult.value as any).generic_products || [])
        .map((p: any) => ({ ...p, source: 'zecat' as const }));
    }

    let cdoProducts: CDOProduct[] = [];
    if (shouldFetchCDO && cdoResult.status === 'fulfilled') {
      const allCDO = cdoResult.value as CDOProduct[];
      let filtered: CDOProduct[];
      if (cdoCategoryIds && cdoCategoryIds.length > 0) {
        filtered = filterCDOByCategories(allCDO, cdoCategoryIds);
      } else if (!filters.categories?.length) {
        filtered = allCDO;
      } else {
        filtered = []; // Con filtro pero sin cdoIds → CDO vacío
      }
      cdoProducts = sortCDOByPrice(filtered);
    }

    // Filtrar Zecat
    let filteredZecat = zecatProducts;
    if (zecatFamilyIds && zecatFamilyIds.length > 0) {
      const catSet = new Set(zecatFamilyIds);
      filteredZecat = zecatProducts.filter(p =>
        p.families?.some((f: Family) => catSet.has(String(f.id)))
      );
    }

    let allProducts = intercalate(filteredZecat, cdoProducts);
    if (filters.search) {
      const term = filters.search.toLowerCase();
      allProducts = allProducts.filter(p => p.name.toLowerCase().includes(term));
    }

    console.log(`[unified] Result: ${allProducts.length} (Zecat=${filteredZecat.length} CDO=${cdoProducts.length})`);

    const pageSize = filters.limit || 48;
    const currentPage = filters.page || 1;
    const totalCount = allProducts.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const validPage = Math.min(currentPage, totalPages);
    const start = (validPage - 1) * pageSize;

    return {
      total_pages: totalPages,
      count: totalCount,
      products: allProducts.slice(start, start + pageSize),
      source: 'unified'
    };

  } catch (error) {
    console.error('[unified] error:', error);
    return { total_pages: 1, count: 0, products: [], source: 'unified' };
  }
}

function intercalate(a: UnifiedProduct[], b: UnifiedProduct[]): UnifiedProduct[] {
  const result: UnifiedProduct[] = [];
  const maxLen = Math.max(a.length, b.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < a.length) result.push(a[i]);
    if (i < b.length) result.push(b[i]);
  }
  return result;
}

export async function getUnifiedProductById(compositeId: string): Promise<UnifiedProduct | null> {
  try {
    const { source, id } = parseCompositeId(compositeId);
    if (source === 'zecat') {
      const product = await getZecatProductById(id);
      return product ? { ...product, source: 'zecat' } : null;
    }
    if (source === 'cdo') {
      const numId = parseInt(id, 10);
      // Buscar en el pool completo (294 productos, 3 páginas)
      const allCDO = await getAllCDOProducts();
      const found = allCDO.find(p => p.id === numId) || allCDO.find(p => p.code === id) || null;
      return found;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function getUnifiedCategories(): Promise<UnifiedCategory[]> {
  try {
    const [zecatData, cdoData] = await Promise.allSettled([
      getZecatFamilies(),
      getCDOCategories()
    ]);
    const zecatCategories = zecatData.status === 'fulfilled' && zecatData.value?.families
      ? zecatData.value.families.map((f: Family) => ({ ...f, source: 'zecat' as const }))
      : [];
    const cdoCategories = cdoData.status === 'fulfilled' && cdoData.value
      ? cdoData.value.map((c: CDOCategory) => ({ ...c, source: 'cdo' as const }))
      : [];
    return [...zecatCategories, ...cdoCategories];
  } catch (error) {
    return [];
  }
}

export function createCompositeId(source: 'zecat' | 'cdo', id: string | number): string {
  return `${source}_${id}`;
}

export function parseCompositeId(compositeId: string): { source: 'zecat' | 'cdo', id: string } {
  const underscoreIndex = compositeId.indexOf('_');
  if (underscoreIndex === -1) throw new Error(`Invalid composite ID: ${compositeId}`);
  const source = compositeId.substring(0, underscoreIndex) as 'zecat' | 'cdo';
  const id = compositeId.substring(underscoreIndex + 1);
  if (source !== 'zecat' && source !== 'cdo') throw new Error(`Invalid source: ${source}`);
  if (!id) throw new Error(`Invalid composite ID: ${compositeId}`);
  return { source, id };
}