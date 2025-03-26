import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getUnifiedProductById } from "@/lib/api/unified"
import ProductDisplay from "@/components/product-display"

// Server-side revalidation
export const revalidate = 3600 // Revalidate every hour

export default async function ProductPage({ params }: { params: { id: string } }) {
  if (!params?.id) {
    notFound()
  }

  try {
    const product = await getUnifiedProductById(params.id)
    
    if (!product) {
      notFound()
    }

    return (
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
        <ProductDisplay product={product} productId={params.id} />
      </Suspense>
    )
  } catch (error) {
    console.error("Error loading product:", error)
    notFound()
  }
}

