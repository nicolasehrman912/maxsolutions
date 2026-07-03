import type { MetadataRoute } from "next"
import { getUnifiedProducts, createCompositeId } from "@/lib/api/unified"

const BASE = "https://www.maxsolutionsmerchandising.com"

// Regenerar el sitemap una vez por día
export const revalidate = 86400

const CATEGORY_SLUGS = [
  "apparel", "writing", "bolsos", "technology", "drinkware",
  "hogar-tiempo-libre", "gorros", "paraguas", "llaveros",
  "deportes", "agro", "packaging", "kits-y-sets",
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Rutas de categoría indexables (coinciden con /products/categoria/[slug])
  const categoryUrls: MetadataRoute.Sitemap = CATEGORY_SLUGS.map((slug) => ({
    url: `${BASE}/products/categoria/${slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  // URLs de productos (el mejor contenido del sitio). Si la API falla, seguimos sin ellas.
  let productUrls: MetadataRoute.Sitemap = []
  try {
    const pages = [1, 2, 3, 4, 5]
    const responses = await Promise.all(
      pages.map((page) =>
        getUnifiedProducts({ page, limit: 100 }).catch(() => ({ products: [] as any[] }))
      )
    )
    const seen = new Set<string>()
    productUrls = responses
      .flatMap((r) => r.products ?? [])
      .map((p: any) => createCompositeId(p.source, p.id))
      .filter((id) => {
        if (seen.has(id)) return false
        seen.add(id)
        return true
      })
      .map((id) => ({
        url: `${BASE}/products/${id}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
  } catch {
    // sin productos en el sitemap; categorías y home siguen presentes
  }

  return [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/products`, changeFrequency: "daily", priority: 0.9 },
    ...categoryUrls,
    ...productUrls,
  ]
}
