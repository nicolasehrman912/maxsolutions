import { 
  FamiliesResponse, 
  GenericProduct, 
  GenericProductsResponse, 
  ProductFilters
} from './types';

const API_BASE_URL = 'https://api.zecatdifapro.com';

/**
 * Helper function to build query parameters for API requests
 */
function buildQueryParams(filters: ProductFilters): string {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.stock) params.append('stock', filters.stock.toString());
  if (filters.name) params.append('name', filters.name);
  
  if (filters.order?.price) {
    params.append('order[price]', filters.order.price);
  }
  
  if (filters.families && filters.families.length > 0) {
    filters.families.forEach(familyId => {
      params.append('families[]', familyId);
    });
  }
  
  return params.toString();
}

/**
 * Fetch families (categories)
 */
export async function getFamilies(): Promise<FamiliesResponse> {
  // Configuración de reintentos
  const maxRetries = 2;
  const timeout = 5000; // 5 segundos de timeout
  let retries = 0;
  
  while (retries <= maxRetries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(`${API_BASE_URL}/family/`, {
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
      
      if (!response.ok) {
        console.warn(`Attempt ${retries + 1}/${maxRetries + 1}: Failed to fetch families: ${response.status}`);
        if (retries === maxRetries) {
          throw new Error(`Failed to fetch families: ${response.status}`);
        }
        // Esperar antes del siguiente reintento (backoff exponencial)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
        retries++;
        continue;
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`Attempt ${retries + 1}/${maxRetries + 1}: Request timed out after ${timeout}ms`);
      } else {
        console.error(`Attempt ${retries + 1}/${maxRetries + 1}: Error fetching families:`, error);
      }
      
      if (retries === maxRetries) {
        console.error('All retry attempts failed for fetching families');
        throw error;
      }
      
      // Esperar antes del siguiente reintento (backoff exponencial)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
      retries++;
    }
  }
  
  // Este código nunca debería ejecutarse debido a las comprobaciones anteriores
  throw new Error('Failed to fetch families after maximum retries');
}

/**
 * Fetch products with optional filtering
 */
export async function getProducts(filters: ProductFilters = {}): Promise<GenericProductsResponse> {
  try {
    const queryParams = buildQueryParams(filters);
    const url = `${API_BASE_URL}/generic_product${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

/**
 * Search products by name (autocomplete)
 */
export async function searchProducts(name: string): Promise<GenericProductsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/generic_product/autocomplete?name=${encodeURIComponent(name)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to search products: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
}

/**
 * Get specific product by ID
 */
export async function getProductById(id: string): Promise<GenericProduct> {
  try {
    // First try to get the product details directly
    const response = await fetch(`${API_BASE_URL}/generic_product/${id}`);
    
    if (!response.ok) {
      // If we can't get the product directly, search for it in the product list
      console.log(`Direct product fetch failed for ID ${id}, trying to find it in the product list`);
      const productsResponse = await fetch(`${API_BASE_URL}/generic_product?limit=1000`);
      
      if (!productsResponse.ok) {
        throw new Error(`Failed to fetch products: ${productsResponse.status}`);
      }
      
      const data = await productsResponse.json();
      const product = data.generic_products.find((p: any) => p.id === id);
      
      if (!product) {
        throw new Error(`Product with ID ${id} not found in product list`);
      }
      
      return product;
    }
    
    // Get product data from direct endpoint
    const product = await response.json();
    
    // Check the structure of the response
    console.log(`Product response structure:`, Object.keys(product));
    
    // The API might return the product directly or it might be nested
    // Handle different possible response structures
    if (product.id === id) {
      // Product data is directly in the response
      return product;
    } else if (product.generic_product && typeof product.generic_product === 'object') {
      // If generic_product is a single object and not an array
      if (!Array.isArray(product.generic_product)) {
        return product.generic_product;
      }
      
      // If it's an array, find the matching product
      const foundProduct = product.generic_product.find((p: any) => p.id === id);
      if (foundProduct) {
        return foundProduct;
      }
    }
    
    // If we couldn't find the product in the expected structure, throw an error
    console.error(`Unexpected API response structure for product ${id}:`, product);
    throw new Error(`Could not find product with ID ${id} in API response`);
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error;
  }
} 