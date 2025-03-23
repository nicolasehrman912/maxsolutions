'use client';

import Image from "next/image"
import Link from "next/link"
import { FEATURED_CATEGORIES } from "@/MODIFICAR"
import { useEffect, useState } from "react"
// Remove dynamic imports
// import { getCDOCategories } from "@/lib/api/cdo"
// import { getStoredCategories } from "@/lib/local-storage"

export function CategorySection() {
  // Estado para detectar si estamos en un dispositivo móvil
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si estamos en móvil cuando el componente se monta y si cambia el tamaño de ventana
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // Considerar móvil en menos de 768px
    };
    
    // Verificar inicialmente
    checkIfMobile();
    
    // Agregar listener para cambios de tamaño
    window.addEventListener('resize', checkIfMobile);
    
    // Limpiar listener al desmontar
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

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
            <div className="aspect-[4/3] w-full bg-muted relative">
              {/* Imagen para móvil (se muestra solo cuando isMobile es true) */}
              {isMobile && (
                <Image
                  src={category.mobileImageUrl}
                  alt={category.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              )}
              
              {/* Imagen para escritorio (se muestra solo cuando isMobile es false) */}
              {!isMobile && (
                <Image
                  src={category.desktopImageUrl}
                  alt={category.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              )}
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

