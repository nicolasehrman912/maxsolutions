"use client"

import Image from "next/image"

const brands = [
  { name: "Hydra",     logo: "/logo/hydra.png" },
  { name: "La Baule",  logo: "/logo/la-baule.png" },
  { name: "Laguiole", logo: "/logo/laguiole.png" },
  { name: "Slazenger", logo: "/logo/slazenger.png" },
  { name: "Sols",      logo: "/logo/sols.png" },
  { name: "Tahg",      logo: "/logo/tahg.png" },
]

const allBrands = [...brands, ...brands, ...brands]

export function BrandCarousel() {
  return (
    <section className="py-16 bg-white border-t border-border">
      <div className="container mx-auto px-4 mb-12">
        <div className="text-center">
          <span className="section-label mb-2 block">Nuestras marcas</span>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-navy">
            Trabajamos con las mejores marcas
          </h2>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="flex animate-scroll-left gap-16 w-max py-4">
          {allBrands.map((brand, i) => (
            <div
              key={`${brand.name}-${i}`}
              className="flex items-center justify-center shrink-0 hover:scale-105 transition-transform duration-300"
              style={{ width: '180px', height: '80px' }}
            >
              <Image
                src={brand.logo}
                alt={brand.name}
                width={140}
                height={64}
                className="object-contain max-h-16 w-auto"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
