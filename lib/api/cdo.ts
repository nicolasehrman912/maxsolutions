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
  try {
    const queryParams = buildQueryParams(filters);
    const url = `${API_BASE_URL}/products?${queryParams}`;
    
    console.log(`Fetching CDO products from: ${url}`);
    
    // Utilizamos la API de Next.js para cache configurable
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      // Usar cache con revalidación cada 1 hora
      next: { 
        revalidate: 3600 
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch CDO products: ${response.status}`);
      // Return empty products instead of throwing
      return {
        products: [],
        total_pages: 1,
        current_page: 1
      };
    }
    
    const data = await response.json();
    
    // Add source property to each product
    const productsWithSource = Array.isArray(data) ? data.map(product => ({
      ...product,
      source: 'cdo' as const
    })) : [];
    
    console.log(`Successfully fetched ${productsWithSource.length} CDO products`);
    
    return {
      products: productsWithSource,
      // These properties may not be available in the API response
      total_pages: data.total_pages || Math.ceil(productsWithSource.length / (filters.page_size || 24)),
      current_page: filters.page_number || 1
    };
  } catch (error) {
    console.error('Error fetching CDO products:', error);
    // Return empty products instead of re-throwing
    return {
      products: [],
      total_pages: 1,
      current_page: 1
    };
  }
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
 * Get all categories from the CDO API
 */
export async function getCDOCategories(): Promise<CDOCategory[]> {
  try {
    // Since the API doesn't appear to have a dedicated categories endpoint,
    // we'll fetch a sample of products and extract unique categories
    const url = `${API_BASE_URL}/products?auth_token=${API_TOKEN}&page_size=50`;
    
    console.log(`Fetching CDO categories from: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Failed to fetch CDO products for categories: ${response.status}`);
      // Return empty categories instead of throwing
      return [];
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.warn('CDO API did not return an array for products');
      return [];
    }
    
    // Extract all categories and remove duplicates
    const categories = new Map<number, CDOCategory>();
    
    data.forEach((product: any) => {
      if (Array.isArray(product.categories)) {
        product.categories.forEach((category: CDOCategory) => {
          if (!categories.has(category.id)) {
            categories.set(category.id, category);
          }
        });
      }
    });
    
    const result = Array.from(categories.values());
    console.log(`Successfully extracted ${result.length} CDO categories`);
    
    return result;
  } catch (error) {
    console.error('Error fetching CDO categories:', error);
    // Return empty categories instead of throwing
    return [];
  }
} 