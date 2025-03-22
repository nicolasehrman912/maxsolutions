"use client"

import Link from "next/link"
import { memo, useMemo } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type Product = {
  id: string | number // Changed to support composite IDs
  name: string
  price?: number
  image: string
  category: string
  isNew: boolean
  totalStock?: number
  source?: 'zecat' | 'cdo' // Added source property
}

export function ProductGrid({ products }: { products: Product[] }) {
  // Memoize products to prevent unnecessary re-renders
  const memoizedProducts = useMemo(() => products, [products]);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {memoizedProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

// Memoized ProductCard to prevent re-renders when props don't change
const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  // Format WhatsApp message for product inquiry
  const message = encodeURIComponent(`Hola, estoy interesado en el producto "${product.name}" (ID: ${product.id}). ¿Podrías proporcionarme más información?`);
  const whatsappUrl = `https://wa.me/5491124779637?text=${message}`; // Formato correcto con código de país

  return (
    <Card className="overflow-hidden group">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden">
          {/* Use standard img tag for better performance */}
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            loading="lazy"
            className="object-cover w-full h-full transition-transform group-hover:scale-105"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/products/${product.id}`} className="hover:underline">
          <h3 className="font-medium">{product.name}</h3>
        </Link>
        <p className="text-sm text-muted-foreground mt-1">{product.category}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full">
          <Button className="w-full" size="sm">
            <Phone className="h-4 w-4 mr-2" />
            Contactar
          </Button>
        </a>
      </CardFooter>
    </Card>
  )
})

