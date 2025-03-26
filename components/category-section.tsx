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
  // Estado para rastrear si el componente está montado en el cliente
  const [isMounted, setIsMounted] = useState(false);

  // Detectar si estamos en móvil y marcar como montado cuando el componente se monta
  useEffect(() => {
    setIsMounted(true);
    
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

  // Función para renderizar las imágenes de categoría de manera consistente
  const renderCategoryImage = (category: typeof FEATURED_CATEGORIES[0]) => {
    // Usar la imagen de escritorio como fallback inicial para SSR y durante la hidratación
    const imageUrl = isMounted && isMobile ? category.mobileImageUrl : category.desktopImageUrl;
    
    return (
      <Image
        src={imageUrl}
        alt={category.name}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 50vw, 25vw"
      />
    );
  };

  // Crear URL con todos los IDs de subcategorías para cada categoría
  const buildCategoryUrl = (category: typeof FEATURED_CATEGORIES[0]) => {
    const params = new URLSearchParams();
    
    // Si la categoría tiene subcategorías definidas, incluirlas como parámetros
    if (category.subcategories && category.subcategories.length > 0) {
      category.subcategories.forEach(subCatId => {
        params.append('category', subCatId.toString());
      });
    } else {
      // Si no tiene subcategorías, usar el ID de la categoría principal
      params.append('category', category.id.toString());
    }
    
    // Agregar el término de búsqueda como el nombre de la categoría para mejorar resultados
    params.append('search', category.name);
    
    return `/products?${params.toString()}`;
  };

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
            href={buildCategoryUrl(category)}
            className="group flex flex-col overflow-hidden rounded-lg border hover:shadow-md transition-all"
          >
            <div className="aspect-[4/3] w-full bg-muted relative">
              {renderCategoryImage(category)}
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

