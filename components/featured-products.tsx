import { ProductGrid } from "@/components/product-grid"
import { getProducts, getProductById } from "@/lib/api/zecat"
import { getCDOProductById } from "@/lib/api/cdo"
import { GenericProduct, CDOProduct } from "@/lib/api/types"
import { FEATURED_PRODUCTS } from "@/MODIFICAR"
import { createCompositeId } from "@/lib/api/unified"

// Helper function to directly fetch a Zecat product by ID
async function fetchZecatProductById(id: number): Promise<GenericProduct | null> {
  try {
    console.log(`Directly fetching Zecat product with ID: ${id}`);
    const product = await getProductById(id.toString());
    return product;
  } catch (error) {
    console.error(`Failed to fetch Zecat product ${id}:`, error);
    return null;
  }
}

async function fetchFeaturedProducts(productIds: number[]): Promise<GenericProduct[]> {
  try {
    console.log("Attempting to fetch Zecat products with IDs:", productIds);
    
    // Instead of bulk fetching with IDs (which may not work properly), 
    // fetch each product individually using the direct endpoint
    const productsPromises = productIds.map(id => fetchZecatProductById(id));
    const products = await Promise.all(productsPromises);
    
    // Filter out any null results
    const validProducts = products.filter(Boolean) as GenericProduct[];
    console.log(`Successfully fetched ${validProducts.length} out of ${productIds.length} Zecat products directly`);
    
    return validProducts;
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

async function fetchCDOProducts(productIds: number[]): Promise<(CDOProduct | null)[]> {
  try {
    console.log("Attempting to fetch CDO products with IDs:", productIds);
    
    // Fetch each CDO product individually and handle errors
    const productsPromises = productIds.map(async (id) => {
      try {
        return await getCDOProductById(id);
      } catch (error) {
        console.error(`Error fetching CDO product ${id}:`, error);
        return null;
      }
    });
    
    const products = await Promise.all(productsPromises);
    console.log(`Fetched ${products.filter(Boolean).length} CDO products out of ${productIds.length} requested`);
    
    return products;
  } catch (error) {
    console.error("Error fetching CDO products:", error);
    return [];
  }
}

export async function FeaturedProducts() {
  // Use featured products directly from configuration
  const featuredProducts = FEATURED_PRODUCTS;
  console.log("Featured products configuration:", featuredProducts);
  
  // Separate products by source
  const zecatProductIds = featuredProducts
    .filter(p => p.source === 'zecat' || !p.source) // Include products with no source specified
    .map(p => p.id);
    
  const cdoProductIds = featuredProducts
    .filter(p => p.source === 'cdo')
    .map(p => p.id);
  
  console.log(`Fetching ${zecatProductIds.length} Zecat products and ${cdoProductIds.length} CDO products`);
  
  // Fetch products from both sources in parallel
  const [zecatProducts, cdoProducts] = await Promise.all([
    zecatProductIds.length > 0 ? fetchFeaturedProducts(zecatProductIds) : [],
    cdoProductIds.length > 0 ? fetchCDOProducts(cdoProductIds) : []
  ]);
  
  console.log(`Successfully fetched ${zecatProducts.length} Zecat products and ${cdoProducts.filter(Boolean).length} CDO products`);
  
  // Transform all products to match our product structure
  const transformedProducts = [
    // Transform Zecat API products
    ...zecatProducts.map((product: GenericProduct) => {
      return {
        id: createCompositeId('zecat', product.id),
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.image_url || "/placeholder.svg?height=400&width=300",
        category: product.families?.[0]?.description || "general",
        isNew: product.stock > 0,
        totalStock: product.products?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0,
        source: 'zecat' as const
      };
    }),
    
    // Add CDO products with actual data
    ...cdoProducts
      .filter(Boolean) // Remove nulls
      .map((product) => {
        // Find the corresponding featured product config
        const featuredProduct = featuredProducts.find(fp => fp.id === product?.id);
        // Use product data for display
        return {
          id: createCompositeId('cdo', product!.id),
          name: product!.name || `Producto ${product!.id}`,
          image: product!.variants?.[0]?.picture?.original || "/placeholder.svg?height=400&width=300",
          category: product!.categories?.[0]?.name || "general",
          isNew: true,
          totalStock: product!.variants?.reduce((sum, v) => sum + (v.stock_available || 0), 0) || 1,
          source: 'cdo' as const
        };
      })
  ];

  console.log(`Transformed ${transformedProducts.length} products total for display`);

  // Sort products according to the order in FEATURED_PRODUCTS
  const sortedProducts = [...transformedProducts].sort((a, b) => {
    // Extract the ID part from the composite ID (e.g., "zecat_123" -> "123")
    const aIdPart = typeof a.id === 'string' ? a.id.split('_')[1] : String(a.id);
    const bIdPart = typeof b.id === 'string' ? b.id.split('_')[1] : String(b.id);
    
    // Find the corresponding featured product config
    const productA = featuredProducts.find(p => String(p.id) === aIdPart);
    const productB = featuredProducts.find(p => String(p.id) === bIdPart);
    
    return (productA?.order || 0) - (productB?.order || 0);
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Productos Destacados</h2>
        <p className="text-muted-foreground max-w-[600px]">
          Descubre nuestra selección de productos promocionales de alta calidad
        </p>
      </div>
      <ProductGrid products={sortedProducts} />
    </section>
  )
}

