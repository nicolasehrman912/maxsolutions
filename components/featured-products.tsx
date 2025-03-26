import { ProductGrid } from "@/components/product-grid"
import { getProducts } from "@/lib/api/zecat"
import { getCDOProductById } from "@/lib/api/cdo"
import { GenericProduct, CDOProduct } from "@/lib/api/types"
import { FEATURED_PRODUCTS } from "@/MODIFICAR"
import { createCompositeId } from "@/lib/api/unified"

async function fetchFeaturedProducts(productIds: number[]): Promise<GenericProduct[]> {
  try {
    // First try to fetch only specified products
    const response = await getProducts({ 
      ids: productIds,
      limit: productIds.length * 2 // Set limit high enough to get all IDs
    });
    
    // Extra safety: explicitly filter to ONLY include products with IDs in our list
    const filteredProducts = response.generic_products.filter(product => 
      productIds.includes(parseInt(product.id))
    );
    
    console.log(`Filtered to ${filteredProducts.length} specific products from ${response.generic_products.length} returned products`);
    
    return filteredProducts;
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

async function fetchCDOProducts(productIds: number[]): Promise<(CDOProduct | null)[]> {
  try {
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
  
  // Separate products by source
  const zecatProductIds = featuredProducts
    .filter(p => p.source !== 'cdo')
    .map(p => p.id);
    
  const cdoProductIds = featuredProducts
    .filter(p => p.source === 'cdo')
    .map(p => p.id);
  
  // Fetch products from both sources in parallel
  const [zecatProducts, cdoProducts] = await Promise.all([
    zecatProductIds.length > 0 ? fetchFeaturedProducts(zecatProductIds) : [],
    cdoProductIds.length > 0 ? fetchCDOProducts(cdoProductIds) : []
  ]);
  
  // Transform all products to match our product structure
  const transformedProducts = [
    // Transform Zecat API products
    ...zecatProducts.map((product: GenericProduct) => {
      return {
        id: createCompositeId('zecat', product.id),
        name: product.name,
        price: product.price,
        image: product.images[0]?.image_url || "/placeholder.svg?height=400&width=300",
        category: product.families[0]?.description || "general",
        isNew: product.stock > 0,
        totalStock: product.stock,
        source: 'zecat' as const
      };
    }),
    
    // Add CDO products with actual data
    ...cdoProducts
      .filter(Boolean) // Remove nulls
      .map((product) => {
        const featuredProduct = featuredProducts.find(fp => fp.id === product?.id);
        return {
          id: createCompositeId('cdo', product!.id),
          name: product!.name || featuredProduct?.description || `Producto ${product!.id}`,
          image: product!.variants?.[0]?.picture?.original || "/placeholder.svg?height=400&width=300",
          category: product!.categories?.[0]?.name || "general",
          isNew: true,
          totalStock: product!.variants?.reduce((sum, v) => sum + (v.stock_available || 0), 0) || 1,
          source: 'cdo' as const
        };
      })
  ];

  // Sort products according to the order in FEATURED_PRODUCTS
  const sortedProducts = [...transformedProducts].sort((a, b) => {
    const productA = featuredProducts.find(p => {
      const idPart = typeof a.id === 'string' ? a.id.split('_')[1] : a.id.toString();
      return p.id.toString() === idPart;
    });
    
    const productB = featuredProducts.find(p => {
      const idPart = typeof b.id === 'string' ? b.id.split('_')[1] : b.id.toString();
      return p.id.toString() === idPart;
    });
    
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

