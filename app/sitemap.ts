import type { MetadataRoute } from "next"

const BASE = "https://www.maxsolutionsmerchandising.com"

const CATEGORY_SLUGS = [
  "apparel", "writing", "bolsos", "technology", "drinkware",
  "hogar-tiempo-libre", "gorros", "paraguas", "llaveros",
  "deportes", "agro", "packaging", "kits-y-sets",
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categoryUrls: MetadataRoute.Sitemap = CATEGORY_SLUGS.map((slug) => ({
    url: `${BASE}/products?category=${slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/products`, changeFrequency: "daily", priority: 0.9 },
    ...categoryUrls,
  ]
}
