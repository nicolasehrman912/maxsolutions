'use client';

import Link from "next/link"
// Remove dynamic imports
// import { useEffect, useState } from "react"
// import { getCDOCategories } from "@/lib/api/cdo"
// import { getStoredCategories } from "@/lib/local-storage"

// Static categories
const FEATURED_CATEGORIES = [
  { id: 101, name: 'Escritura' },
  { id: 161, name: 'Tecnología' },
  { id: 131, name: 'Proximos ingresos' },
  { id: 221, name: 'Bolsas, Bolsos, Maletines y Mochilas' }
];

export function CategorySection() {
  // No state or effects needed for static content
  return (
    <section className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Categorías Destacadas</h2>
        <p className="text-muted-foreground max-w-[600px]">
          Explora nuestras categorías de productos promocionales
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {FEATURED_CATEGORIES.map((category) => (
          <Link 
            key={category.id} 
            href={`/products?search=&category=${category.id}`}
            className="group flex flex-col overflow-hidden rounded-lg border hover:shadow-md transition-all"
          >
            <div className="aspect-[4/3] w-full bg-muted relative flex items-center justify-center p-4">
              {/* CDO no tiene iconos, mostrar un emoji relacionado */}
              <div className="text-4xl">
                {category.id === 101 ? "✏️" : 
                 category.id === 161 ? "💻" : 
                 category.id === 131 ? "📎" : 
                 category.id === 221 ? "👜" : "🎁"}
              </div>
            </div>
            <div className="p-3 text-center">
              <h3 className="text-sm font-semibold">{category.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {`Ver productos de ${category.name}`}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div className="text-center">
        <Link href="/products?search=">
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            Ver todas las categorías
          </button>
        </Link>
      </div>
    </section>
  )
}

