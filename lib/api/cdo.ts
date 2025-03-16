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
 * Fetch products from CDO API with optional filtering
 */
export async function getCDOProducts(filters: CDOProductFilters = {}): Promise<CDOProductsResponse> {
  // Configuración de reintentos
  const maxRetries = 2;
  const timeout = 8000; // 8 segundos de timeout para productos (puede ser más grande)
  let retries = 0;
  
  while (retries <= maxRetries) {
    try {
      console.time('getCDOProducts');
      
      const queryParams = buildQueryParams(filters);
      const url = `${API_BASE_URL}/products?${queryParams}`;
      
      console.log(`Fetch attempt ${retries + 1}/${maxRetries + 1}: Fetching CDO products`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      // Utilizamos la API de Next.js para cache configurable
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
        // Usar cache con revalidación cada 4 horas
        next: { 
          revalidate: 14400 
        },
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
      
      if (!response.ok) {
        console.warn(`Attempt ${retries + 1}/${maxRetries + 1}: Failed to fetch CDO products: ${response.status}`);
        if (retries === maxRetries) {
          console.error(`All ${maxRetries + 1} attempts failed with status: ${response.status}`);
          console.timeEnd('getCDOProducts');
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
      
      console.log(`Successfully fetched ${productsWithSource.length} CDO products`);
      
      console.timeEnd('getCDOProducts');
      return {
        products: productsWithSource,
        // These properties may not be available in the API response
        total_pages: data.total_pages || Math.ceil(productsWithSource.length / (filters.page_size || 24)),
        current_page: filters.page_number || 1
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`Attempt ${retries + 1}/${maxRetries + 1}: Request timed out after ${timeout}ms`);
      } else {
        console.error(`Attempt ${retries + 1}/${maxRetries + 1}: Error fetching CDO products:`, error);
      }
      
      if (retries === maxRetries) {
        console.error('All retry attempts failed for fetching CDO products');
        console.timeEnd('getCDOProducts');
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
  console.timeEnd('getCDOProducts');
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
    console.log(`Intentando obtener el producto CDO con ID/código: ${id}`);
    
    // Primero intentaremos obtener todos los productos y buscar entre ellos
    // ya que parece que la búsqueda directa por código está fallando con 404
    const url = `${API_BASE_URL}/products?auth_token=${API_TOKEN}&page_size=1000`;
    
    console.log(`Buscando producto en la lista completa: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Error al obtener la lista de productos CDO: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.warn('La API de CDO no devolvió un arreglo de productos');
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
      console.warn(`No se encontró ningún producto CDO con ID/código: ${id}`);
      return null;
    }
    
    console.log(`Producto CDO encontrado exitosamente: ${product.name}`);
    
    // Añadir propiedad de origen
    return {
      ...product,
      source: 'cdo' as const
    };
  } catch (error) {
    console.error(`Error al buscar producto CDO con ID ${id}:`, error);
    return null;
  }
}

/**
 * Get all available product categories from CDO
 */
export async function getCDOCategories(): Promise<CDOCategory[]> {
  // Configuración de reintentos
  const maxRetries = 2;
  const timeout = 5000; // 5 segundos de timeout
  let retries = 0;
  
  while (retries <= maxRetries) {
    try {
      console.time('getCDOCategories');
      
      // Since the API doesn't appear to have a dedicated categories endpoint,
      // we'll fetch a sample of products and extract unique categories
      const url = `${API_BASE_URL}/products?auth_token=${API_TOKEN}&page_size=50`;
      
      console.log(`Fetch attempt ${retries + 1}/${maxRetries + 1}: Fetching CDO categories`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
      
      if (!response.ok) {
        console.warn(`Attempt ${retries + 1}/${maxRetries + 1}: Failed to fetch CDO categories: ${response.status}`);
        if (retries === maxRetries) {
          console.error(`All ${maxRetries + 1} attempts failed with status: ${response.status}`);
          console.timeEnd('getCDOCategories');
          return [];
        }
        // Esperar antes del siguiente reintento (backoff exponencial)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
        retries++;
        continue;
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.warn('CDO API did not return an array for products');
        console.timeEnd('getCDOCategories');
        return [];
      }
      
      // Extract all categories and remove duplicates - optimizado para ser más rápido
      const categories = new Map<number, CDOCategory>();
      
      // Límite para el procesamiento por producto
      const productLimit = Math.min(data.length, 50);
      
      for (let i = 0; i < productLimit; i++) {
        const product = data[i];
        if (Array.isArray(product.categories)) {
          for (const category of product.categories) {
            if (!categories.has(category.id)) {
              categories.set(category.id, category);
            }
          }
        }
      }
      
      const result = Array.from(categories.values());
      console.log(`Successfully extracted ${result.length} CDO categories`);
      
      console.timeEnd('getCDOCategories');
      return result;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`Attempt ${retries + 1}/${maxRetries + 1}: Request timed out after ${timeout}ms`);
      } else {
        console.error(`Attempt ${retries + 1}/${maxRetries + 1}: Error fetching CDO categories:`, error);
      }
      
      if (retries === maxRetries) {
        console.error('All retry attempts failed for fetching CDO categories');
        console.timeEnd('getCDOCategories');
        return [];
      }
      
      // Esperar antes del siguiente reintento (backoff exponencial)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
      retries++;
    }
  }
  
  // Este código nunca debería ejecutarse debido a las comprobaciones anteriores
  console.timeEnd('getCDOCategories');
  return [];
} 