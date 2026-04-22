"use client"

import Image from "next/image"

const clients = [
  { name: "Nikon",       logo: "/logo/nikon.png" },
  { name: "Tigre",       logo: "/logo/tigre.png" },
  { name: "VL",          logo: "/logo/vl.png" },
  { name: "KTL",         logo: "/logo/ktl.jpg" },
  { name: "Multipoint",  logo: "/logo/multipoint.png" },
  { name: "Banchero",    logo: "/logo/banchero.svg" },
  { name: "Lesko",       logo: "/logo/lesko.jpg" },
  { name: "Fecofar",     logo: "/logo/logo fecofar.gif" },
  { name: "Madic",       logo: "/logo/Logo madic.png" },
  { name: "OpenFarma",   logo: "/logo/logo openfarma.webp" },
  { name: "ITBA",        logo: "/logo/LOGO-ITBA-1024x701.jpg" },
  { name: "TIP Travel",  logo: "/logo/Logo-Tip-Travel_-Final_-02-768x767.jpg" },
]

const allClients = [...clients, ...clients, ...clients]

export function ClientsSection() {
  return (
    <section className="py-16 bg-[#f7f8fa] border-t border-border">
      <div className="container mx-auto px-4 mb-12">
        <div className="text-center">
          <span className="section-label mb-2 block">Confianza empresarial</span>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-navy">
            Empresas que confían en nosotros
          </h2>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="flex animate-scroll-left gap-16 w-max py-4">
          {allClients.map((client, i) => (
            <div
              key={`${client.name}-${i}`}
              className="flex items-center justify-center shrink-0 hover:scale-105 transition-transform duration-300"
              style={{ width: '180px', height: '80px' }}
            >
              <Image
                src={client.logo}
                alt={client.name}
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
