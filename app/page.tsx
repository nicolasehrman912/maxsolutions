import { FeaturedProducts } from "@/components/featured-products"
import { HeroSection } from "@/components/hero-section"
import { CategorySection } from "@/components/category-section"
import { BrandCarousel } from "@/components/brand-carousel"
import { PurchaseStepsModal } from "@/components/purchase-steps-modal"
import { ClientsSection } from "@/components/clients-section"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <div className="container px-4 py-12 mx-auto space-y-16">
        <CategorySection />
        <FeaturedProducts />
        <BrandCarousel />
        <ClientsSection />
      </div>
      
      {/* Purchase steps popup */}
      <PurchaseStepsModal />
    </div>
  )
}

