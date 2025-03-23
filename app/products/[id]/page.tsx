import Image from "next/image"
import { notFound } from "next/navigation"
import { getUnifiedProductById, parseCompositeId } from "@/lib/api/unified"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge, badgeVariants } from "@/components/ui/badge"
import { Phone } from "lucide-react"
import { GenericProduct, CDOProduct } from "@/lib/api/types"
import { generarUrlWhatsApp } from "@/MODIFICAR"

// Use a number for revalidate
export const revalidate = 3600 // Revalidate this page every hour

export default async function ProductPage({ params }: { params: { id: string } }) {
  // Await params to handle it asynchronously as required by Next.js 15
  const paramsData = await params;
  
  if (!paramsData || !paramsData.id) {
    notFound();
  }

  try {
    console.log(`Loading product with ID: ${paramsData.id}`);
    
    // Get product using the composite ID (source_id format)
    const product = await getUnifiedProductById(paramsData.id);
    
    if (!product) {
      console.error(`Product with ID ${paramsData.id} not found`);
      notFound();
    }
    
    console.log(`Successfully loaded product: ${product.name} (${product.source})`);
    
    // Generar URL de WhatsApp usando la función centralizada
    const whatsappUrl = generarUrlWhatsApp('producto', {
      nombre: product.name || 'Producto',
      id: paramsData.id || 'N/A'
    });

    // Extract source and raw ID from composite ID
    const { source } = parseCompositeId(paramsData.id);
    
    // Render based on product source
    if (source === 'zecat') {
      // Zecat product rendering
      const zecatProduct = product as GenericProduct & { source: 'zecat' };

    // Ensure product.images exists and has elements
      const hasImages = zecatProduct.images && Array.isArray(zecatProduct.images) && zecatProduct.images.length > 0;
      const firstImageUrl = hasImages ? zecatProduct.images[0].image_url : "/placeholder.svg";
    
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg border">
              <Image
                src={firstImageUrl || "/placeholder.svg"}
                  alt={zecatProduct.name || 'Producto'}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            </div>
              {hasImages && zecatProduct.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                  {zecatProduct.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
                    <Image
                      src={image.image_url || "/placeholder.svg"}
                        alt={`${zecatProduct.name || 'Producto'} - Imagen ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div className="space-y-6">
            <div className="space-y-2">
                {zecatProduct.families && zecatProduct.families.length > 0 && (
                <div>
                    {zecatProduct.families.map((family) => (
                    <a 
                      key={family.id} 
                        href={`/products?search=&category=${family.id}`}
                      className={badgeVariants({ variant: "outline" }) + " mr-2"}
                    >
                      {family.title || 'Categoría'}
                    </a>
                  ))}
                </div>
              )}
                <h1 className="text-3xl font-bold">{zecatProduct.name || 'Producto'}</h1>
            </div>
            
            <div className="pt-2 space-y-4">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button className="w-full" size="lg">
                  <Phone className="mr-2 h-4 w-4" />
                  Contactar por WhatsApp
                </Button>
              </a>
            </div>
            
            {/* Product Information Tabs */}
            <Tabs defaultValue="description" className="mt-8">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="description">Descripción</TabsTrigger>
                <TabsTrigger value="details">Detalles técnicos</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="pt-4">
                <div className="prose max-w-none text-muted-foreground">
                    <p>{zecatProduct.description || 'No hay descripción disponible'}</p>
                </div>
              </TabsContent>
              <TabsContent value="details" className="pt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">ID de Producto</div>
                      <div>{zecatProduct.id || 'N/A'}</div>
                    
                    <div className="font-medium">Categorías</div>
                    <div>
                        {zecatProduct.families && zecatProduct.families.length > 0 
                          ? zecatProduct.families.map((family) => family.description || family.title || 'Categoría').join(', ')
                        : 'Sin categoría'
                      }
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Product Variants Section - if there are multiple variants */}
          {zecatProduct.products && Array.isArray(zecatProduct.products) && zecatProduct.products.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4">Variantes disponibles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {zecatProduct.products.map((variant, index) => (
                <div key={index} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{variant.general_description || 'Variante'}</p>
                    <p className="text-sm text-muted-foreground">
                      {variant.element_description_1 || ''}{' '}
                      {variant.element_description_2 && variant.element_description_2 !== '.' ? variant.element_description_2 : ''}{' '}
                      {variant.element_description_3 || ''}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">
                      SKU: {variant.sku || 'N/A'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      );
    } else {
      // CDO product rendering
      const cdoProduct = product as CDOProduct;
      const hasVariants = cdoProduct.variants && Array.isArray(cdoProduct.variants) && cdoProduct.variants.length > 0;
      const firstVariant = hasVariants ? cdoProduct.variants[0] : null;
      const firstImageUrl = firstVariant?.picture?.original || "/placeholder.svg";
      
      return (
        <div className="container mx-auto px-4 py-12">
          <div className="mb-4 flex items-center gap-2">
            {cdoProduct.code && (
              <Badge variant="outline">Código: {cdoProduct.code}</Badge>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-lg border">
                <Image
                  src={firstImageUrl}
                  alt={cdoProduct.name || 'Producto CDO'}
                  fill
                  className="object-cover"
                  priority
                  sizes="100vw"
                />
              </div>
              {hasVariants && cdoProduct.variants.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {cdoProduct.variants.slice(0, 4).map((variant, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
                      <Image
                        src={variant.picture?.original || "/placeholder.svg"}
                        alt={`${cdoProduct.name || 'Producto'} - Variante ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Details */}
            <div className="space-y-6">
              <div className="space-y-2">
                {cdoProduct.categories && cdoProduct.categories.length > 0 && (
                  <div>
                    {cdoProduct.categories.map((category) => (
                      <a 
                        key={category.id} 
                        href={`/products?search=&category=${category.id}`}
                        className={badgeVariants({ variant: "outline" }) + " mr-2"}
                      >
                        {category.name || 'Categoría'}
                      </a>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold">{cdoProduct.name || 'Producto CDO'}</h1>
                </div>
              </div>
              
              <div className="pt-2 space-y-4">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full" size="lg">
                    <Phone className="mr-2 h-4 w-4" />
                    Contactar por WhatsApp
                  </Button>
                </a>
              </div>
              
              {/* Product Information Tabs */}
              <Tabs defaultValue="description" className="mt-8">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="description">Descripción</TabsTrigger>
                  <TabsTrigger value="details">Detalles técnicos</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="pt-4">
                  <div className="prose max-w-none text-muted-foreground">
                    <p>{cdoProduct.description || 'No hay descripción disponible'}</p>
                  </div>
                </TabsContent>
                <TabsContent value="details" className="pt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="font-medium">ID de Producto</div>
                      <div>{cdoProduct.id || 'N/A'}</div>
                      
                      <div className="font-medium">Código</div>
                      <div>{cdoProduct.code || 'N/A'}</div>
                      
                      <div className="font-medium">Categorías</div>
                      <div>
                        {cdoProduct.categories && cdoProduct.categories.length > 0 
                          ? cdoProduct.categories.map(cat => cat.name).join(', ')
                          : 'Sin categoría'
                        }
                      </div>
                      
                      {cdoProduct.packing && (
                        <>
                          <div className="font-medium">Cantidad por paquete</div>
                          <div>{cdoProduct.packing.quantity || 'N/A'}</div>
                          
                          <div className="font-medium">Dimensiones</div>
                          <div>
                            {cdoProduct.packing.width} x {cdoProduct.packing.height} x {cdoProduct.packing.depth} cm
                          </div>
                          
                          <div className="font-medium">Peso</div>
                          <div>{cdoProduct.packing.weight} kg</div>
                        </>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Icons section if available */}
              {cdoProduct.icons && cdoProduct.icons.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Características</h3>
                  <div className="flex flex-wrap gap-3">
                    {cdoProduct.icons.map((icon) => (
                      <div key={icon.id} className="flex items-center gap-2 text-sm border rounded-md px-2 py-1">
                        <Image
                          src={icon.picture}
                          alt={icon.label}
                          width={16}
                          height={16}
                        />
                        <span>{icon.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Product Variants Section */}
          {hasVariants && (
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-4">Variantes disponibles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cdoProduct.variants.map((variant, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex gap-4">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden">
                        <Image
                          src={variant.picture?.original || "/placeholder.svg"}
                          alt={`${cdoProduct.name} - Color ${variant.color?.name || 'N/A'}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Color: {variant.color?.name || 'N/A'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div 
                                className="w-4 h-4 rounded-full border" 
                                style={{ backgroundColor: variant.color?.hex_code || '#ccc' }}
                              />
                              <p className="text-sm">{variant.color?.hex_code || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Stock: {variant.stock_available || 0}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    notFound();
  }
}

