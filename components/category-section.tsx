"use client"

import Image from "next/image"
import Link from "next/link"
import { FEATURED_CATEGORIES } from "@/MODIFICAR"
import { ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"

/**
 * Mapeo de ID de categoría featured → slug de URL
 */
const CATEGORY_ID_TO_SLUG: Record<string, string> = {
  "apparel":    "apparel",
  "writing":    "writing",
  "technology": "technology",
  "drinkware":  "drinkware",
  "bolsos":     "bolsos",
  "hogar-tiempo-libre": "hogar-tiempo-libre",
  "gorros":     "gorros",
  "paraguas":   "paraguas",
  "llaveros":   "llaveros",
  "deportes":   "deportes",
  "agro":       "agro",
  "packaging":  "packaging",
}

export function CategorySection() {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => { setIsMounted(true) }, [])

  const buildCategoryUrl = (category: typeof FEATURED_CATEGORIES[0]) => {
    const id = category.id.toString()
    // Usar slug si existe (ruta indexable), sino usar el ID directo como query
    const slug = CATEGORY_ID_TO_SLUG[id]
    return slug ? `/products/categoria/${slug}` : `/products?category=${id}`
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <span className="section-label mb-2 block">Nuestro catálogo</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy">
            Explorá por categoría
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {FEATURED_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={buildCategoryUrl(category)}
              className="group relative overflow-hidden block bg-muted"
              style={{ aspectRatio: '3/4' }}
            >
              <Image
                src={category.desktopImageUrl}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                <h3 className="font-display font-bold text-white text-lg md:text-xl leading-tight mb-1">
                  {category.name}
                </h3>
                <div className="flex items-center gap-1.5 text-white/65 text-xs font-body transition-all duration-300 group-hover:text-gold-light group-hover:gap-2.5">
                  <span>Ver productos</span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 border-2 border-navy text-navy hover:bg-navy hover:text-white font-semibold px-10 py-3 transition-all text-sm font-body tracking-widest uppercase"
          >
            Ver todas las categorías
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
