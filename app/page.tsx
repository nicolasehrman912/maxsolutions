import { FeaturedProducts } from "@/components/featured-products"
import { HeroSection } from "@/components/hero-section"
import { CategorySection } from "@/components/category-section"
import { BrandCarousel } from "@/components/brand-carousel"
import { PurchaseStepsModal } from "@/components/purchase-steps-modal"
import { ClientsSection } from "@/components/clients-section"
import { PromoBanners } from "@/components/promo-banners"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Merchandising Corporativo y Regalos Empresariales | Max Solutions",
  description:
    "Más de 1.000 productos promocionales personalizados con tu logo: botellas, mochilas, cuadernos y kits corporativos. Envíos a toda Argentina. Pedí tu cotización.",
  openGraph: {
    title: "Merchandising Corporativo y Regalos Empresariales | Max Solutions",
    description:
      "Más de 1.000 productos promocionales personalizados con tu logo. Envíos a toda Argentina.",
    url: "https://www.maxsolutionsmerchandising.com",
    siteName: "Max Solutions",
    locale: "es_AR",
    type: "website",
    images: ["https://www.maxsolutionsmerchandising.com/logo.png"],
  },
  alternates: { canonical: "https://www.maxsolutionsmerchandising.com" },
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* 1 — Hero banner grande */}
      <HeroSection />

      {/* 2 — 3 banners estilo SimpleStore */}
      <PromoBanners />

      {/* 3 — Categorías 4 cards iguales estilo LV */}
      <CategorySection />

      {/* 4 — Productos destacados */}
      <section className="py-16 bg-[#f9f9f9]">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <span className="section-label mb-2 block">Selección especial</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy">
              Productos destacados
            </h2>
          </div>
          <FeaturedProducts />
        </div>
      </section>

      {/* 5 — Empresas que confían en nosotros */}
      <ClientsSection />

      {/* 6 — Marcas con las que trabajamos */}
      <BrandCarousel />

      {/* 7 — Footer está en layout */}

      <PurchaseStepsModal />
    </div>
  )
}
