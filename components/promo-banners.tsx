"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

const PROMO_BANNERS = [
  {
    id: "banner-1",
    title: "Sector Agro",
    subtitle: "Productos promocionales para el campo",
    cta: "Ver productos",
    href: "/products/categoria/agro",
    image: "/banner-agro.webp",
    bgColor: "from-[#1a2f4a] to-[#0d1f33]",
    accent: "hsl(38 72% 47%)",
  },
  {
    id: "banner-2",
    title: "Merch mundialista",
    subtitle: "Merchandising para grandes eventos",
    cta: "Ver productos",
    href: "/products/categoria/deportes",
    image: "/banner-mundial.webp",
    bgColor: "from-[#2a1a0a] to-[#1a0f05]",
    accent: "hsl(38 72% 55%)",
  },
  {
    id: "banner-3",
    title: "Kits & Sets",
    subtitle: "Conjuntos armados y listos para regalar",
    cta: "Explorar",
    href: "/products/categoria/kits-y-sets",
    image: "/banner-kits.webp",
    bgColor: "from-[#0f2a1a] to-[#071a10]",
    accent: "hsl(38 72% 47%)",
  },
]

export function PromoBanners() {
  return (
    <section className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PROMO_BANNERS.map((banner) => (
          <Link
            key={banner.id}
            href={banner.href}
            className="group relative overflow-hidden rounded-lg card-lift"
            style={{ aspectRatio: '4/3' }}
          >
            {banner.image ? (
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${banner.bgColor}`}>
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: banner.accent }} />

            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <h3 className="font-display font-bold text-white text-xl leading-tight mb-1">
                {banner.title}
              </h3>
              <p className="text-white/65 text-sm font-body mb-4">
                {banner.subtitle}
              </p>
              <div
                className="inline-flex items-center gap-2 text-sm font-semibold font-body transition-all group-hover:gap-3"
                style={{ color: banner.accent }}
              >
                {banner.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
