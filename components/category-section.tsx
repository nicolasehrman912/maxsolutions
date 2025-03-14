import Link from "next/link"
import Image from "next/image"
import { getCDOCategories } from "@/lib/api/cdo"

// Usamos categorías predefinidas para asegurar que son importantes
const FEATURED_CATEGORIES = [
  { id: 101, name: 'Escritura' },
  { id: 161, name: 'Tecnología' },
  { id: 131, name: 'Oficina y Negocios' },
  { id: 221, name: 'Bolsas, Bolsos, Maletines y Mochilas' }
];

async function fetchCategories() {
  try {
    // Obtener categorías de CDO en lugar de Zecat
    const cdoCategories = await getCDOCategories();
    // Filtramos para mostrar solo las categorías destacadas que queremos
    const featuredCategories = FEATURED_CATEGORIES.map(featured => {
      // Buscamos la categoría real en las categorías obtenidas de la API
      const found = cdoCategories.find(cat => cat.id === featured.id);
      // Si la encontramos, la usamos; si no, usamos la predefinida
      return found || featured;
    });
    return featuredCategories;
  } catch (error) {
    console.error("Error fetching CDO categories:", error);
    // Si hay un error, devolvemos las categorías predefinidas
    return FEATURED_CATEGORIES;
  }
}

export async function CategorySection() {
  const categories = await fetchCategories();
  
  return (
    <section className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Categorías Destacadas</h2>
        <p className="text-muted-foreground max-w-[600px]">
          Explora nuestras categorías de productos promocionales
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {categories.map((category) => (
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

