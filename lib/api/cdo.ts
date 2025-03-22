import { 
  CDOProductsResponse, 
  CDOProduct, 
  CDOProductFilters,
  CDOCategory
} from './types';

// Use environment variables for API tokens
const PRODUCTION_API_TOKEN = 'BjHOxUOvHN14RQASURDeDg';

// By default, use production API
const API_TOKEN = PRODUCTION_API_TOKEN;

// API base URLs
const PRODUCTION_API_BASE_URL = 'http://api.argentina.cdopromocionales.com/v2';

// Select the appropriate base URL based on environment
const API_BASE_URL = PRODUCTION_API_BASE_URL;

/**
 * Helper function to build query parameters for API requests
 */
function buildQueryParams(filters: CDOProductFilters = {}): string {
  const params = new URLSearchParams();
  
  // Always include the auth token
  params.append('auth_token', API_TOKEN);
  
  // Add pagination parameters if provided
  if (filters.page_size) params.append('page_size', filters.page_size.toString());
  if (filters.page_number) params.append('page_number', filters.page_number.toString());
  
  // Add category filter if provided
  if (filters.category_id) params.append('category_id', filters.category_id.toString());
  
  // Add search term if provided
  if (filters.search) params.append('search', filters.search);
  
  return params.toString();
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
 * Fetch products from CDO API with optional filtering
 */
export async function getCDOProducts(filters: CDOProductFilters = {}): Promise<CDOProductsResponse> {
  // Configuración de reintentos
  const maxRetries = 2;
  const timeout = 8000; // 8 segundos de timeout para productos (puede ser más grande)
  let retries = 0;
  
  // Check if cache should be disabled
  const disableCache = shouldDisableCache();
  
  while (retries <= maxRetries) {
    try {
      const queryParams = buildQueryParams(filters);
      const url = `${API_BASE_URL}/products?${queryParams}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      // Configure fetch options
      const fetchOptions: RequestInit = {
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      };
      
      // Apply caching strategy based on nocache parameter
      if (!disableCache) {
        // Use cache with revalidation every 4 hours if cache not disabled
        fetchOptions.next = { revalidate: 14400 };
      } else {
        // Force fresh data when nocache is present
        fetchOptions.cache = 'no-store';
        fetchOptions.next = { revalidate: 0 };
      }
      
      // Utilizamos la API de Next.js para cache configurable
      const response = await fetch(url, fetchOptions).finally(() => clearTimeout(timeoutId));
      
      if (!response.ok) {
        if (retries === maxRetries) {
          return {
            products: [],
            total_pages: 1,
            current_page: 1
          };
        }
        // Esperar antes del siguiente reintento (backoff exponencial)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
        retries++;
        continue;
      }
      
      const data = await response.json();
      
      // Add source property to each product
      const productsWithSource = Array.isArray(data) ? data.map(product => ({
        ...product,
        source: 'cdo' as const
      })) : [];
      
      return {
        products: productsWithSource,
        // These properties may not be available in the API response
        total_pages: data.total_pages || Math.ceil(productsWithSource.length / (filters.page_size || 24)),
        current_page: filters.page_number || 1
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request timed out
      }
      
      if (retries === maxRetries) {
        return {
          products: [],
          total_pages: 1,
          current_page: 1
        };
      }
      
      // Esperar antes del siguiente reintento (backoff exponencial)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
      retries++;
    }
  }
  
  // Este código nunca debería ejecutarse debido a las comprobaciones anteriores
  return {
    products: [],
    total_pages: 1,
    current_page: 1
  };
}

/**
 * Get a specific product by ID
 */
export async function getCDOProductById(id: number): Promise<CDOProduct | null> {
  try {
    // Check if cache should be disabled
    const disableCache = shouldDisableCache();
    
    // Primero intentaremos obtener todos los productos y buscar entre ellos
    // ya que parece que la búsqueda directa por código está fallando con 404
    const url = `${API_BASE_URL}/products?auth_token=${API_TOKEN}&page_size=1000`;
    
    // Configure fetch options
    const fetchOptions: RequestInit = {};
    
    // Apply caching strategy based on nocache parameter
    if (disableCache) {
      fetchOptions.cache = 'no-store';
      fetchOptions.next = { revalidate: 0 };
    }
    
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      return null;
    }
    
    // Búsqueda por id numérico
    let product = data.find((p: any) => p.id === id);
    
    // Si no se encuentra por id, intentamos buscar por código
    if (!product) {
      const idStr = String(id);
      product = data.find((p: any) => p.code === idStr);
    }
    
    if (!product) {
      return null;
    }
    
    // Añadir propiedad de origen
    return {
      ...product,
      source: 'cdo' as const
    };
  } catch (error) {
    return null;
  }
}

/**
 * Get all available product categories from CDO
 */
export async function getCDOCategories(): Promise<CDOCategory[]> {
  // Check if cache should be disabled
  const disableCache = shouldDisableCache();
  
  // Verificamos si podemos usar categorías cacheadas en el cliente
  if (!disableCache && typeof window !== 'undefined') {
    try {
      // Importar dinámicamente para evitar errores de SSR
      const { getStoredCategories } = await import('../local-storage');
      const cachedCategories = getStoredCategories('cdo');
      
      if (cachedCategories && cachedCategories.length > 0) {
        return cachedCategories;
      }
    } catch (error) {
      // Error handling is managed by returning empty array at end
    }
  }
  
  // Configuración de reintentos - incrementado para mayor tolerancia a fallos
  const maxRetries = 3; // Incrementado de 2 a 3
  const timeout = 15000; // Aumentado de 8s a 15s para dar más tiempo a la API lenta
  let retries = 0;
  
  while (retries <= maxRetries) {
    try {
      // Since the API doesn't appear to have a dedicated categories endpoint,
      // we'll fetch a sample of products and extract unique categories
      const url = `${API_BASE_URL}/products?auth_token=${API_TOKEN}&page_size=30`; // Reducido de 50 a 30 para acelerar
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      // Configure fetch options
      const fetchOptions: RequestInit = {
        signal: controller.signal,
      };
      
      // Apply caching strategy based on nocache parameter
      if (!disableCache) {
        // Use cache with SWR for regular requests
        fetchOptions.next = { 
          revalidate: 14400,
          tags: ['cdo-categories']
        };
        // Use less time for first request, more for retries
        fetchOptions.cache = retries === 0 ? 'force-cache' : 'no-store';
      } else {
        // Force fresh data when nocache is present
        fetchOptions.cache = 'no-store';
        fetchOptions.next = { revalidate: 0 };
      }
      
      // Intentar recuperar de caché primero con stale-while-revalidate
      const response = await fetch(url, fetchOptions).finally(() => clearTimeout(timeoutId));
      
      if (!response.ok) {
        if (retries === maxRetries) {
          return [];
        }
        // Esperar antes del siguiente reintento (backoff exponencial)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
        retries++;
        continue;
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        return [];
      }
      
      // Extraer solo la primera categoría de cada producto para mejorar rendimiento
      const categories = new Map<number, CDOCategory>();
      
      // Límite para el procesamiento por producto
      const productLimit = Math.min(data.length, 30);
      
      for (let i = 0; i < productLimit; i++) {
        const product = data[i];
        if (Array.isArray(product.categories) && product.categories.length > 0) {
          // Solo usar la primera categoría de cada producto
          const category = product.categories[0];
          if (!categories.has(category.id)) {
            categories.set(category.id, category);
          }
        }
      }
      
      const result = Array.from(categories.values());
      
      // Si llegamos aquí, guardamos la respuesta en caché de manera más agresiva
      if (!disableCache && typeof window !== 'undefined' && result.length > 0) {
        try {
          const { saveCategories } = await import('../local-storage');
          saveCategories('cdo', result);
        } catch (error) {
          // Error accessing localStorage, continue anyway
        }
      }
      
      return result;
    } catch (error) {
      if (retries === maxRetries) {
        // Intentar obtener categorías hardcodeadas/predefinidas como último recurso
        const fallbackCategories: CDOCategory[] = [
          { id: 101, name: 'Escritura' },
          { id: 161, name: 'Tecnología' },
          { id: 131, name: 'Proximos ingresos' },
          { id: 221, name: 'Bolsas, Bolsos, Maletines y Mochilas' }
        ];
        
        // Si estamos en el cliente, guardarlas en localStorage para evitar futuros fallos
        if (!disableCache && typeof window !== 'undefined') {
          try {
            const { saveCategories } = await import('../local-storage');
            saveCategories('cdo', fallbackCategories);
          } catch (error) {
            // Error accessing localStorage, continue anyway
          }
        }
        
        return fallbackCategories;
      }
      
      // Esperar antes del siguiente reintento (backoff exponencial) - incrementado
      const backoffTime = 1500 * Math.pow(2, retries); // Incrementado de 1000ms a 1500ms
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      retries++;
    }
  }
  
  // Este código nunca debería ejecutarse debido a las comprobaciones anteriores
  return [];
} 