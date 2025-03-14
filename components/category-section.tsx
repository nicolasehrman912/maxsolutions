import Link from "next/link"
import Image from "next/image"
import { getFamilies } from "@/lib/api/zecat"

async function fetchCategories() {
  try {
    const response = await getFamilies();
    return response.families;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function CategorySection() {
  const categories = await fetchCategories();
  
  // Take just the first 4 categories for the display
  const displayCategories = categories.slice(0, 4);

  return (
    <section className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Categorías Destacadas</h2>
        <p className="text-muted-foreground max-w-[600px]">
          Explora nuestras categorías de productos promocionales
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {displayCategories.map((category) => (
          <Link 
            key={category.id} 
            href={`/products?family=${category.id}`}
            className="group flex flex-col overflow-hidden rounded-lg border hover:shadow-md transition-all"
          >
            <div className="aspect-[4/3] w-full bg-muted relative flex items-center justify-center p-4">
              {category.icon_url && (
                <Image
                  src={category.icon_url}
                  alt={category.description}
                  className="object-contain transition-transform group-hover:scale-105"
                  width={120}
                  height={90}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              )}
            </div>
            <div className="p-3 text-center">
              <h3 className="text-sm font-semibold">{category.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {category.description || 'Ver productos'}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div className="text-center">
        <Link href="/products">
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            Ver todas las categorías
          </button>
        </Link>
      </div>
    </section>
  )
}

