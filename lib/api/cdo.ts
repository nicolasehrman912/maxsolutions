import { 
  CDOProductsResponse, 
  CDOProduct, 
  CDOProductFilters,
  CDOCategory
} from './types';

const CDO_TOKEN = process.env.NEXT_PUBLIC_CDO_API_TOKEN || 'upsMlcOa12EV07IwbAvvlA';
const CDO_DIRECT_URL = 'http://api.argentina.cdopromocionales.com/v2';

/**
 * Construye la URL correcta según el entorno:
 * - Servidor: llama directo a CDO (sin restricciones de CORS/HTTP)
 * - Cliente: llama al proxy local para evitar bloqueo del browser
 */
function buildUrl(filters: CDOProductFilters = {}): string {
  const params = new URLSearchParams();

  if (typeof window === 'undefined') {
    // SERVIDOR — llamada directa a CDO con auth_token en URL
    params.set('auth_token', CDO_TOKEN);
    if (filters.page_size) params.set('page_size', filters.page_size.toString());
    if (filters.page_number) params.set('page_number', filters.page_number.toString());
    if (filters.category_id) params.set('category_id', filters.category_id.toString());
    if (filters.search) params.set('search', filters.search);
    return `${CDO_DIRECT_URL}/products?${params.toString()}`;
  } else {
    // CLIENTE — usa el proxy local
    if (filters.page_size) params.set('page_size', filters.page_size.toString());
    if (filters.page_number) params.set('page_number', filters.page_number.toString());
    if (filters.category_id) params.set('category_id', filters.category_id.toString());
    if (filters.search) params.set('search', filters.search);
    return `/api/cdo-proxy${params.toString() ? `?${params.toString()}` : ''}`;
  }
}

/**
 * Fetch products from CDO API
 */
export async function getCDOProducts(filters: CDOProductFilters = {}): Promise<CDOProductsResponse> {
  const maxRetries = 2;
  const timeout = 12000;
  let retries = 0;

  while (retries <= maxRetries) {
    try {
      const url = buildUrl(filters);
      console.log(`[CDO] Fetching: ${url.split('?')[0]} (${typeof window === 'undefined' ? 'server' : 'client'})`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 14400 }
      }).finally(() => clearTimeout(timeoutId));

      if (!response.ok) {
        console.warn(`[CDO] API responded ${response.status} (attempt ${retries + 1})`);
        if (retries === maxRetries) {
          return { products: [], total_pages: 1, current_page: 1 };
        }
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retries)));
        retries++;
        continue;
      }

      const data = await response.json();

      // CDO devuelve array directo o objeto con .products
      const rawProducts = Array.isArray(data)
        ? data
        : Array.isArray(data.products)
          ? data.products
          : [];

      console.log(`[CDO] Got ${rawProducts.length} products`);

      const productsWithSource: CDOProduct[] = rawProducts.map((product: any) => ({
        ...product,
        source: 'cdo' as const
      }));

      return {
        products: productsWithSource,
        total_pages: data.total_pages || Math.ceil(productsWithSource.length / (filters.page_size || 24)),
        current_page: filters.page_number || 1
      };

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`[CDO] Timeout (attempt ${retries + 1})`);
      } else {
        console.error(`[CDO] Fetch error (attempt ${retries + 1}):`, error);
      }

      if (retries === maxRetries) {
        return { products: [], total_pages: 1, current_page: 1 };
      }

      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retries)));
      retries++;
    }
  }

  return { products: [], total_pages: 1, current_page: 1 };
}

/**
 * Obtiene un producto CDO por ID
 */
export async function getCDOProductById(id: number): Promise<CDOProduct | null> {
  try {
    const url = buildUrl({ page_size: 500 });
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 14400 }
    });

    if (!response.ok) return null;

    const data = await response.json();
    const rawProducts = Array.isArray(data) ? data : data.products || [];

    const product = rawProducts.find((p: any) => p.id === id) ||
                    rawProducts.find((p: any) => p.code === String(id));

    if (!product) return null;

    return { ...product, source: 'cdo' as const };
  } catch (error) {
    console.error(`[CDO] Error fetching product ${id}:`, error);
    return null;
  }
}

/**
 * Obtiene categorías de CDO
 */
export async function getCDOCategories(): Promise<CDOCategory[]> {
  try {
    const url = buildUrl({ page_size: 50 });
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 14400, tags: ['cdo-categories'] }
    });

    if (!response.ok) return [];

    const data = await response.json();
    const rawProducts = Array.isArray(data) ? data : data.products || [];

    const categoriesMap = new Map<number, CDOCategory>();
    for (const product of rawProducts) {
      if (Array.isArray(product.categories)) {
        for (const cat of product.categories) {
          if (cat.id && !categoriesMap.has(cat.id)) {
            categoriesMap.set(cat.id, cat);
          }
        }
      }
    }

    return Array.from(categoriesMap.values());
  } catch (error) {
    console.error('[CDO] Error fetching categories:', error);
    return [];
  }
}