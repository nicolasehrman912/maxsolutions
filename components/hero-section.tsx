import Image from "next/image"

// Imágenes para el carrusel
const BANNER_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1560258018-c7db7645254e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
    alt: "Productos promocionales",
  },
  {
    url: "https://placehold.co/1000x400",
    alt: "Artículos personalizados",
  },
  {
    url: "https://placehold.co/1000x400",
    alt: "Material promocional",
  },
]

export function HeroSection() {
  return (
    <div className="w-full relative h-[500px] overflow-hidden">
      {BANNER_IMAGES.map((image, index) => (
        <div 
          key={index}
          className="carousel-slide"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/60 to-zinc-900/40 z-10" />
          <Image
            src={image.url}
            alt={image.alt}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
          />
        </div>
      ))}
    </div>
  )
}

