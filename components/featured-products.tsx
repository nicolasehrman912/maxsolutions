import { ProductGrid } from "@/components/product-grid"
import { getProducts } from "@/lib/api/zecat"
import { GenericProduct } from "@/lib/api/types"

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

export async function FeaturedProducts() {
  // Specify the product IDs you want to feature - these are the ONLY products that will show
  const featuredProductIds = [3587, 3627, 3589, 3590, 3591, 3592, 3593, 3594];
  
  // Get ONLY these specific products
  const products = await fetchFeaturedProducts(featuredProductIds);
  
  // Ensure we have exactly the requested products in the right order
  const sortedProducts = [...products].sort((a, b) => {
    const indexA = featuredProductIds.indexOf(parseInt(a.id));
    const indexB = featuredProductIds.indexOf(parseInt(b.id));
    return indexA - indexB;
  });
  
  // Transform ZECAT API products to match our product structure
  const transformedProducts = sortedProducts.map((product: GenericProduct) => ({
    id: parseInt(product.id),
    name: product.name,
    price: product.price,
    image: product.images[0]?.image_url || "/placeholder.svg?height=400&width=300",
    category: product.families[0]?.description || "general",
    isNew: product.stock > 0,
    totalStock: product.stock
  }));

  return (
    <section className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Productos Destacados</h2>
        <p className="text-muted-foreground max-w-[600px]">
          Descubre nuestra selección de productos promocionales de alta calidad
        </p>
      </div>
      <ProductGrid products={transformedProducts} />
    </section>
  )
}

