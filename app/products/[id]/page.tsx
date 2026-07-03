import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getUnifiedProductById, parseCompositeId } from "@/lib/api/unified"
import ProductDisplay from "@/components/product-display"
import type { Metadata } from "next"
import type { GenericProduct, CDOProduct } from "@/lib/api/types"

export const revalidate = 3600

const BASE = "https://www.maxsolutionsmerchandising.com"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const product = await getUnifiedProductById(params.id)
    if (!product) return { title: "Producto no encontrado | Max Solutions" }

    const name = product.name || "Producto"
    const desc = ((product as any).description || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 155)

    let image: string | undefined
    if (product.source === "zecat") {
      image = (product as GenericProduct).images?.[0]?.image_url
    } else {
      image = (product as CDOProduct).variants?.[0]?.picture?.original
    }

    return {
      title: `${name} Personalizado con Logo | Max Solutions`,
      description: desc || `${name} personalizado con tu logo. Cotizá por WhatsApp.`,
      alternates: { canonical: `${BASE}/products/${params.id}` },
      openGraph: {
        title: `${name} | Max Solutions`,
        description: desc || `${name} personalizado con tu logo.`,
        images: image ? [image] : [],
        type: "website",
        locale: "es_AR",
      },
    }
  } catch {
    return { title: "Max Solutions" }
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  if (!params?.id) {
    notFound()
  }

  try {
    const product = await getUnifiedProductById(params.id)

    if (!product) {
      notFound()
    }

    // JSON-LD para rich results de Google
    let productImage: string | undefined
    let productPrice: string | undefined
    let productStock = 0
    if (product.source === "zecat") {
      const p = product as GenericProduct
      productImage = p.images?.[0]?.image_url
      productPrice = String((p as any).price || (p as any).unit_price || 0)
      productStock = p.products?.reduce((s: number, v: any) => s + (v.stock || 0), 0) || 0
    } else {
      const p = product as CDOProduct
      productImage = p.variants?.[0]?.picture?.original
      productPrice = p.variants?.[0]?.list_price || "0"
      productStock = p.variants?.reduce((s: number, v: any) => s + (v.stock_available || 0), 0) || 0
    }

    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      image: productImage ? [productImage] : [],
      description: (product as any).description || product.name,
      sku: params.id,
      brand: { "@type": "Brand", name: "Max Solutions" },
      offers: {
        "@type": "Offer",
        priceCurrency: "ARS",
        price: productPrice,
        availability:
          productStock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        url: `https://www.maxsolutionsmerchandising.com/products/${params.id}`,
      },
    }

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-12">
            <div className="flex justify-center items-center h-80">
              <div className="animate-pulse space-y-8 w-full max-w-2xl">
                <div className="h-72 bg-muted rounded-lg"></div>
                <div className="space-y-4">
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                  <div className="h-32 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <ProductDisplay product={product as any} productId={params.id} />
      </Suspense>
      </>
    )
  } catch (error) {
    console.error("Error loading product:", error)
    notFound()
  }
}

