"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge, badgeVariants } from "@/components/ui/badge"
import { Phone } from "lucide-react"
import { GenericProduct, CDOProduct } from "@/lib/api/types"
import { generarUrlWhatsApp } from "@/MODIFICAR"
import { parseCompositeId } from "@/lib/api/unified"
import { UnifiedProduct } from "@/lib/types"

interface ProductDisplayProps {
  product: UnifiedProduct;
  productId: string;
}

export default function ProductDisplay({ product, productId }: ProductDisplayProps) {
  const [whatsappUrl, setWhatsappUrl] = useState("#")
  const [source, setSource] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    setIsMounted(true)
    const { source: productSource } = parseCompositeId(productId)
    setSource(productSource)
    setWhatsappUrl(generarUrlWhatsApp('producto', { 
      nombre: product.name,
      id: productId
    }))
  }, [product.name, productId])

  if (source === 'zecat') {
    const zecatProduct = product as unknown as GenericProduct & { source: 'zecat' }
    const hasImages = zecatProduct.images && Array.isArray(zecatProduct.images) && zecatProduct.images.length > 0
    const images = hasImages ? zecatProduct.images : []
    const selectedImageUrl = hasImages && selectedImageIndex < images.length 
      ? images[selectedImageIndex].image_url 
      : "/placeholder.svg"
    
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg border">
              <Image
                src={selectedImageUrl}
                alt={zecatProduct.name || 'Producto'}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            </div>
            {hasImages && zecatProduct.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {zecatProduct.images.slice(0, 5).map((image, index) => (
                  <div 
                    key={index} 
                    className={`relative aspect-square overflow-hidden rounded-md border cursor-pointer ${selectedImageIndex === index ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
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
              {isMounted ? (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full" size="lg">
                    <Phone className="mr-2 h-4 w-4" />
                    Contactar por WhatsApp
                  </Button>
                </a>
              ) : (
                <Button className="w-full" size="lg" disabled>
                  <Phone className="mr-2 h-4 w-4" />
                  Contactar por WhatsApp
                </Button>
              )}
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
                    <div className="font-medium">Referencia</div>
                    <div>Z-{zecatProduct.id || 'N/A'}</div>
                    
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
    )
  } else {
    const cdoProduct = product as unknown as CDOProduct
    const hasVariants = cdoProduct.variants && Array.isArray(cdoProduct.variants) && cdoProduct.variants.length > 0
    const variants = hasVariants ? cdoProduct.variants : []
    const selectedVariant = hasVariants && selectedImageIndex < variants.length 
      ? variants[selectedImageIndex] 
      : (hasVariants ? variants[0] : null)
    const selectedImageUrl = selectedVariant?.picture?.original || "/placeholder.svg"
    
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
                src={selectedImageUrl}
                alt={cdoProduct.name || 'Producto CDO'}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            </div>
            {hasVariants && cdoProduct.variants.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {cdoProduct.variants.slice(0, 5).map((variant, index) => (
                  <div 
                    key={index} 
                    className={`relative aspect-square overflow-hidden rounded-md border cursor-pointer ${selectedImageIndex === index ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
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
              {isMounted ? (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full" size="lg">
                    <Phone className="mr-2 h-4 w-4" />
                    Contactar por WhatsApp
                  </Button>
                </a>
              ) : (
                <Button className="w-full" size="lg" disabled>
                  <Phone className="mr-2 h-4 w-4" />
                  Contactar por WhatsApp
                </Button>
              )}
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
                    <div className="font-medium">Referencia</div>
                    <div>C-{cdoProduct.id || 'N/A'}</div>
                    
                    <div className="font-medium">Código</div>
                    <div>{cdoProduct.code || 'N/A'}</div>
                    
                    <div className="font-medium">Categorías</div>
                    <div>
                      {cdoProduct.categories && cdoProduct.categories.length > 0 
                        ? cdoProduct.categories.map((cat) => cat.name || 'Categoría').join(', ')
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
        {hasVariants && cdoProduct.variants.length > 1 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4">Variantes disponibles</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cdoProduct.variants.map((variant, index) => (
                <div 
                  key={index} 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedImageIndex === index ? 'border-primary bg-primary/5' : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <div className="flex flex-col items-center">
                    <div className="relative w-16 h-16 mb-2">
                      <Image
                        src={variant.picture?.original || "/placeholder.svg"}
                        alt={`${cdoProduct.name || 'Producto'} - ${String(variant.color) || `Variante ${index + 1}`}`}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <p className="text-sm font-medium text-center">{String(variant.color) || `Variante ${index + 1}`}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
} 