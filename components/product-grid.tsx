"use client"

import Link from "next/link"
import { memo, useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone } from "lucide-react"
import { generarUrlWhatsApp } from "@/MODIFICAR"
import { useExchangeRate } from "@/hooks/use-exchange-rate"

type Product = {
  id: string | number
  name: string
  price?: number
  image: string
  category: string
  isNew: boolean
  totalStock?: number
  source?: 'zecat' | 'cdo'
  cdoListPrice?: string
}

export function ProductGrid({ products }: { products: Product[] }) {
  const memoizedProducts = useMemo(() => products, [products]);
  const { convertUSDtoARS, loading: rateLoading } = useExchangeRate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {memoizedProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          convertUSDtoARS={convertUSDtoARS}
          rateLoading={rateLoading}
        />
      ))}
    </div>
  )
}

const ProductCard = memo(function ProductCard({
  product,
  convertUSDtoARS,
  rateLoading
}: {
  product: Product
  convertUSDtoARS: (usd: number | string) => number | null
  rateLoading: boolean
}) {
  const [whatsappUrl, setWhatsappUrl] = useState("#");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setWhatsappUrl(generarUrlWhatsApp('producto', {
      nombre: product.name,
      id: product.id
    }));
  }, [product.id, product.name]);

  // Calcular precio
  let formattedPrice: string | null = null;
  if (product.source === 'zecat' && product.price && product.price > 0) {
    formattedPrice = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(product.price);
  } else if (product.source === 'cdo' && product.cdoListPrice) {
    const arsPrice = convertUSDtoARS(product.cdoListPrice);
    if (arsPrice && arsPrice > 0) {
      formattedPrice = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0,
      }).format(arsPrice);
    }
  }

  // Stock
  const stock = product.totalStock ?? 0;
  const hasStock = stock > 0;
  const stockFormatted = new Intl.NumberFormat('es-AR').format(stock);

  return (
    <Card className="overflow-hidden group flex flex-col">
      <Link href={`/products/${product.id}`} legacyBehavior={false}>
        <div className="relative aspect-square overflow-hidden cursor-pointer">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            loading="lazy"
            className="object-cover w-full h-full transition-transform group-hover:scale-105"
          />
          {/* Badge de stock en la imagen */}
          {!hasStock && (
            <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-medium px-2 py-1 rounded">
              Sin stock
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4 flex-1">
        <Link href={`/products/${product.id}`} legacyBehavior={false}>
          <h3 className="font-medium cursor-pointer hover:underline leading-snug">{product.name}</h3>
        </Link>
        <p className="text-sm text-muted-foreground mt-1">{product.category}</p>

        {/* PRECIO */}
        {formattedPrice ? (
          <div className="mt-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Desde</p>
            <p className="text-lg font-bold text-foreground">{formattedPrice}</p>
            <p className="text-xs text-muted-foreground">sin personalización</p>
          </div>
        ) : rateLoading && product.source === 'cdo' ? (
          <div className="mt-3 h-10 animate-pulse bg-muted rounded" />
        ) : null}

        {/* STOCK */}
        <div className="mt-2 flex items-center gap-1.5">
          <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${hasStock ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-muted-foreground">
            {hasStock ? `${stockFormatted} unidades disponibles` : 'Sin stock'}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {isMounted ? (
          <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button className="w-full" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              Contactar
            </Button>
          </Link>
        ) : (
          <Button className="w-full" size="sm" disabled>
            <Phone className="h-4 w-4 mr-2" />
            Contactar
          </Button>
        )}
      </CardFooter>
    </Card>
  )
})
