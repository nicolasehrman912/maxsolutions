"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"

const VIDEO_SRC = "/video/hero.mp4" // video principal del hero
const IMAGE_SRC = "/hero.jpg"       // foto de respaldo si no hay video

export function HeroSection() {
  const [videoError, setVideoError] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  const hasVideo = VIDEO_SRC && !videoError
  const hasImage = IMAGE_SRC && !hasVideo

  return (
    <section className="relative w-full overflow-hidden" style={{ height: 'calc(100vh - 71px)', minHeight: '560px', maxHeight: '900px' }}>

      {hasVideo && (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoError(true)}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      )}

      {hasImage && (
        <Image
          src={IMAGE_SRC}
          alt="Hero background"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
      )}

      {!hasVideo && !hasImage && (
        <div className="absolute inset-0 gradient-navy">
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
              backgroundSize: '32px 32px',
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-[55%] hidden lg:block"
            style={{
              background: 'linear-gradient(108deg, transparent 15%, rgba(180,130,40,0.07) 100%)',
              borderLeft: '1px solid rgba(180,130,40,0.18)',
              clipPath: 'polygon(5% 0, 100% 0, 100% 100%, 0% 100%)',
            }}
          />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      <div className="relative z-10 h-full flex flex-col justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-xl">
            <span className="section-label mb-5 block animate-fade-up">
              Merchandising corporativo
            </span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6 animate-fade-up-delay-1">
              <span className="sr-only">Merchandising corporativo y regalos empresariales: </span>
              Tu marca,<br />en cada<br />
              <span className="text-gold">detalle.</span>
            </h1>
            <p className="text-white/65 text-lg leading-relaxed mb-8 font-body font-light max-w-md animate-fade-up-delay-2">
              Más de 1.000 productos personalizados para eventos, regalos corporativos y campañas de branding.
            </p>
            <div className="flex flex-wrap gap-3 animate-fade-up-delay-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-white font-semibold px-7 py-3.5 rounded-sm transition-colors text-sm font-body shadow-lg shadow-black/30 tracking-wide"
              >
                Ver catálogo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white/80 hover:text-white font-medium px-7 py-3.5 rounded-sm transition-all text-sm font-body tracking-wide"
              >
                Conocer más
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 opacity-50">
        <div className="w-px h-10 bg-white animate-pulse" />
        <span className="text-white text-[10px] font-body tracking-[0.2em] uppercase">Scroll</span>
      </div>
    </section>
  )
}
