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

  // Only run effects after hydration completes
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Only start carousel after hydration
  useEffect(() => {
    if (!isMounted) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % brands.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [isMounted])

  // Only scroll after hydration completes
  useEffect(() => {
    if (!isMounted || !carouselRef.current) return
    
    const scrollAmount = currentIndex * (carouselRef.current.scrollWidth / brands.length)
    carouselRef.current.scrollTo({
      left: scrollAmount,
      behavior: "smooth",
    })
  }, [currentIndex, isMounted])

  // Return static markup during SSR
  if (!isMounted) {
    return (
      <div className="relative overflow-hidden">
        <div className="flex gap-8 py-8" ref={carouselRef}>
          {brands.slice(0, 3).map((brand) => (
            <Card key={brand.name} className="shrink-0">
              <CardContent className="flex h-[120px] w-[200px] items-center justify-center p-6">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={120}
                  height={60}
                  className="object-contain"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden">
      <div className="flex gap-8 py-8" ref={carouselRef}>
        {brands.map((brand) => (
          <Card key={brand.name} className="shrink-0">
            <CardContent className="flex h-[120px] w-[200px] items-center justify-center p-6">
              <Image
                src={brand.logo}
                alt={brand.name}
                width={120}
                height={60}
                className="object-contain"
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

