import { notFound } from "next/navigation"
import { getUnifiedProducts } from "@/lib/api/unified"
import { Suspense } from "react"
import { CategoriesSidebar } from "@/components/categories/categories-sidebar"
import ProductListingClient from "@/components/product-listing-client"
import { ClientOnly } from "@/components/client-only"
import { ProductsPageSkeleton } from "@/components/skeletons/products-page-skeleton"
import type { Metadata } from "next"

const BASE = "https://www.maxsolutionsmerchandising.com"

const CATEGORIES: Record<string, {
  name: string
  title: string
  description: string
  intro: string
}> = {
  drinkware: {
    name: "Drinkware",
    title: "Botellas y Termos Personalizados con Logo",
    description:
      "Botellas térmicas, termos, jarros y vasos personalizados con tu marca. Serigrafía, láser y UV rotativo. Stock real y cotización por WhatsApp.",
    intro:
      "Las botellas y termos personalizados son el artículo promocional más valorado en regalos corporativos. Mantienen bebidas frías o calientes por horas y ponen tu logo en el escritorio de cada cliente, todos los días.",
  },
  apparel: {
    name: "Apparel",
    title: "Indumentaria Corporativa Personalizada",
    description:
      "Remeras, buzos, camperas y gorras con tu logo. Bordado y estampa para equipos, eventos y campañas.",
    intro:
      "La indumentaria corporativa personalizada refuerza la identidad de tu marca en cada interacción. Remeras, chombas, buzos y camperas con bordado o estampa de alta durabilidad para uniformes, eventos y kits de bienvenida.",
  },
  writing: {
    name: "Escritura",
    title: "Lapiceras y Cuadernos Personalizados para Empresas",
    description:
      "Bolígrafos, cuadernos y agendas con logo. El clásico del merchandising corporativo, desde bajas cantidades.",
    intro:
      "Los artículos de escritura personalizados son el clásico infaltable del merchandising corporativo. Bolígrafos, cuadernos y agendas con tu logo tienen altísima frecuencia de uso y larga vida útil.",
  },
  technology: {
    name: "Tecnología",
    title: "Merchandising Tecnológico con Logo",
    description:
      "Cargadores, auriculares, parlantes y accesorios tech personalizados para regalos corporativos de alto impacto.",
    intro:
      "El merchandising tecnológico es el regalo corporativo con mayor percepción de valor. Cargadores portátiles, auriculares, parlantes bluetooth y accesorios tech personalizados con tu marca.",
  },
  bolsos: {
    name: "Bolsos y Mochilas",
    title: "Mochilas y Bolsos Personalizados para Empresas",
    description:
      "Mochilas, bolsos, tote bags y carry-on con tu marca. Ideales para kits de onboarding y eventos.",
    intro:
      "Las mochilas y bolsos personalizados son los productos con mayor visibilidad de marca: cada vez que tu cliente sale a la calle, tu logo viaja con él. Ideales para kits de incorporación y eventos masivos.",
  },
  "kits-y-sets": {
    name: "Kits & Sets",
    title: "Kits Corporativos Personalizados y Listos para Regalar",
    description:
      "Kits de bienvenida, onboarding y fin de año armados y personalizados con tu logo. Conjuntos listos para entregar.",
    intro:
      "Los kits corporativos personalizados combinan varios artículos en un solo regalo de alto impacto. Perfectos para onboarding, fin de año y eventos: llegás listo para entregar, con tu identidad en cada detalle.",
  },
  agro: {
    name: "Sector Agro",
    title: "Merchandising para el Sector Agropecuario",
    description:
      "Productos promocionales para el campo: gorras, termos, mates y kits para expos rurales y fuerza de venta agro.",
    intro:
      "El merchandising para el sector agropecuario necesita productos resistentes y funcionales. Gorras, termos, mates y kits especialmente seleccionados para expos rurales, ferias y equipos de venta del campo.",
  },
  deportes: {
    name: "Deportes",
    title: "Merchandising Deportivo y Mundial 2026 para Empresas",
    description:
      "Productos promocionales deportivos con tu logo: botellas, gorras y kits para activaciones y campañas.",
    intro:
      "El merchandising deportivo conecta tu marca con la pasión de tus clientes. Botellas, gorras, remeras y kits personalizados para activaciones, campañas y el Mundial 2026.",
  },
  gorros: {
    name: "Gorros",
    title: "Gorras y Gorros Corporativos Personalizados",
    description:
      "Gorras y gorros con bordado de tu logo. Alta visibilidad de marca para eventos, uniformes y regalos.",
    intro:
      "Las gorras y gorros corporativos personalizados son artículos de alta visibilidad. Con bordado de tu logo, se usan en eventos, al aire libre y en el día a día.",
  },
  paraguas: {
    name: "Paraguas",
    title: "Paraguas Corporativos Personalizados con Logo",
    description:
      "Paraguas con tu logo: clásicos, plegables y de golf. Gran visibilidad de marca en cada día de lluvia.",
    intro:
      "Los paraguas personalizados son uno de los artículos con mayor visibilidad en espacios públicos. Tu logo se destaca en cada día de lluvia, con opciones clásicas, plegables y de golf.",
  },
  llaveros: {
    name: "Llaveros",
    title: "Llaveros Corporativos Personalizados",
    description:
      "Llaveros con tu logo en distintos materiales. El complemento ideal para kits y regalos de bajo costo.",
    intro:
      "Los llaveros personalizados son el complemento perfecto para kits corporativos. Alta frecuencia de uso y costo accesible para grandes volúmenes.",
  },
  packaging: {
    name: "Packaging",
    title: "Packaging Personalizado para Regalos Corporativos",
    description:
      "Cajas, bolsas y packaging con tu marca para presentar tus regalos corporativos con identidad propia.",
    intro:
      "El packaging personalizado eleva la percepción de cualquier regalo corporativo. Cajas, bolsas y envolturas con tu logo para una presentación profesional e impactante.",
  },
  "hogar-tiempo-libre": {
    name: "Hogar y Tiempo Libre",
    title: "Artículos para el Hogar y Tiempo Libre Personalizados",
    description:
      "Artículos de bazar, cocina, coolers y productos para tiempo libre personalizados con tu marca.",
    intro:
      "Los artículos para el hogar y tiempo libre personalizados acompañan a tus clientes en su vida cotidiana. Presencia de marca en cada momento del día.",
  },
}

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const c = CATEGORIES[params.slug]
  if (!c) return {}
  return {
    title: `${c.title} | Max Solutions`,
    description: c.description,
    alternates: {
      canonical: `${BASE}/products/categoria/${params.slug}`,
    },
    openGraph: {
      title: `${c.title} | Max Solutions`,
      description: c.description,
      locale: "es_AR",
      type: "website",
    },
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const c = CATEGORIES[params.slug]
  if (!c) notFound()

  // Fetch inicial server-side para que Google vea el contenido
  const isKitsYSets = params.slug === "kits-y-sets"
  const productsResponse = await getUnifiedProducts({
    page: 1,
    limit: 48,
    categories: isKitsYSets ? undefined : [params.slug],
    search: isKitsYSets ? "set" : undefined,
    order: { price: "asc" },
  }).catch(() => ({ products: [], count: 0, total_pages: 1 }))

  const products = productsResponse.products.map((product) => {
    if (product.source === "zecat") {
      return {
        id: `zecat_${product.id}`,
        name: product.name,
        image: (product as any).images?.[0]?.image_url || "/placeholder.svg",
        category: (product as any).families?.[0]?.description || "general",
        isNew: (product as any).stock > 0,
        totalStock: (product as any).products?.reduce((s: number, v: any) => s + (v.stock || 0), 0) || 0,
        source: "zecat" as const,
        price: (product as any).price ?? (product as any).unit_price ?? undefined,
      }
    } else {
      return {
        id: `cdo_${product.id}`,
        name: product.name,
        image: (product as any).variants?.[0]?.picture?.original || "/placeholder.svg",
        category: (product as any).categories?.[0]?.name || "general",
        isNew: true,
        totalStock: (product as any).variants?.reduce((s: number, v: any) => s + (v.stock_available || 0), 0) || 0,
        source: "cdo" as const,
        cdoListPrice: (product as any).variants?.[0]?.list_price ?? undefined,
      }
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="hidden md:block w-64 flex-shrink-0">
          <Suspense fallback={<div className="space-y-4 animate-pulse">{[...Array(8)].map((_, i) => <div key={i} className="h-6 bg-gray-200 rounded w-3/4" />)}</div>}>
            <CategoriesSidebar />
          </Suspense>
        </div>

        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-bold font-display text-navy">{c.title}</h1>
            <p className="text-muted-foreground text-sm mt-2 max-w-2xl">{c.intro}</p>
          </div>

          <Suspense fallback={<ProductsPageSkeleton />}>
            <ClientOnly>
              <ProductListingClient
                products={products}
                totalPages={productsResponse.total_pages}
                totalProducts={productsResponse.count}
                currentPage={1}
                categoryParam={params.slug}
              />
            </ClientOnly>
          </Suspense>
        </div>
      </div>
    </div>
  )
}
