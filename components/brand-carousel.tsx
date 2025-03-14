"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

const brands = [
  {
    name: "Hydra",
    logo: "/logo/hydra.png"
  },
  {
    name: "La Baule",
    logo: "/logo/la-baule.png"
  },
  {
    name: "Laguiole",
    logo: "/logo/laguiole.png"
  },
  {
    name: "Slazenger",
    logo: "/logo/slazenger.png"
  },
  {
    name: "Sols",
    logo: "/logo/sols.png"
  },
  {
    name: "Tahg",
    logo: "/logo/tahg.png"
  }
]

export function BrandCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Solo correr efectos después de la hidratación
  useEffect(() => {
    setIsMounted(true)
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % brands.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Solo desplazar después de la hidratación
    if (!isMounted) return
    
    if (carouselRef.current) {
      const scrollAmount = currentIndex * (carouselRef.current.scrollWidth / brands.length)
      carouselRef.current.scrollTo({
        left: scrollAmount,
        behavior: "smooth",
      })
    }
  }, [currentIndex, isMounted])

  return (
    <section className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Nuestras Marcas</h2>
        <p className="text-muted-foreground max-w-[600px]">
          Colaboramos con marcas premium para ofrecerte la mejor calidad
        </p>
      </div>

      <div className="relative overflow-hidden">
        <div
          ref={carouselRef}
          className="flex space-x-6 py-4 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {brands.map((brand, index) => (
            <Card key={index} className="flex-shrink-0 w-[200px]">
              <CardContent className="flex items-center justify-center p-6 h-[100px]">
                <div className="relative w-full h-full">
                  <Image src={brand.logo || "/placeholder.svg"} alt={brand.name} fill className="object-contain" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </section>
  )
}

