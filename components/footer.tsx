"use client"

import Link from "next/link"
import Image from "next/image"
import { Instagram, Mail, Phone } from "lucide-react"
import { generarUrlWhatsApp } from "@/MODIFICAR"
import { useState, useEffect } from "react"

export function Footer() {
  const [whatsappUrl, setWhatsappUrl] = useState("#")
  useEffect(() => { setWhatsappUrl(generarUrlWhatsApp('general')) }, [])

  return (
    <footer className="gradient-navy">
      <div className="h-[3px] bg-gold" />

      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">

          {/* Col 1 - Brand */}
          <div>
            <Image src="/logo.png" alt="Max Solutions" width={120} height={48} className="brightness-0 invert mb-5" />
            <p className="text-white/50 text-sm font-body leading-relaxed max-w-xs">
              Soluciones de merchandising corporativo. Diseñamos y producimos artículos promocionales personalizados para potenciar tu marca.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="https://instagram.com/maxsolutionsmerchandising" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-md bg-white/8 hover:bg-gold/20 border border-white/12 hover:border-gold/30 flex items-center justify-center transition-all">
                <Instagram className="h-4 w-4 text-white/60" />
              </a>
              <a href="mailto:contacto.maxsolutions@gmail.com"
                className="w-9 h-9 rounded-md bg-white/8 hover:bg-gold/20 border border-white/12 hover:border-gold/30 flex items-center justify-center transition-all">
                <Mail className="h-4 w-4 text-white/60" />
              </a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-md bg-white/8 hover:bg-gold/20 border border-white/12 hover:border-gold/30 flex items-center justify-center transition-all">
                <Phone className="h-4 w-4 text-white/60" />
              </a>
            </div>
          </div>

          {/* Col 2 - Links */}
          <div>
            <h4 className="text-white font-display font-semibold text-xs uppercase tracking-widest mb-5">Catálogo</h4>
            <ul className="space-y-3">
              {[
                ['Todos los productos', '/products'],
                ['Apparel', '/products/categoria/apparel'],
                ['Escritura', '/products/categoria/writing'],
                ['Tecnología', '/products/categoria/technology'],
                ['Drinkware', '/products/categoria/drinkware'],
                ['Bolsos y Mochilas', '/products/categoria/bolsos'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-white/50 hover:text-gold text-sm font-body transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 - Contact */}
          <div>
            <h4 className="text-white font-display font-semibold text-xs uppercase tracking-widest mb-5">Contacto</h4>
            <ul className="space-y-4">
              <li>
                <a href="mailto:contacto.maxsolutions@gmail.com" className="flex items-start gap-3 text-white/50 hover:text-gold text-sm font-body transition-colors">
                  <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                  contacto.maxsolutions@gmail.com
                </a>
              </li>
              <li>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/50 hover:text-gold text-sm font-body transition-colors">
                  <Phone className="h-4 w-4 shrink-0" />
                  WhatsApp Business
                </a>
              </li>
              <li>
                <a href="https://instagram.com/maxsolutionsmerchandising" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/50 hover:text-gold text-sm font-body transition-colors">
                  <Instagram className="h-4 w-4 shrink-0" />
                  @maxsolutionsmerchandising
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-white/8 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-white/30 text-xs font-body">
            © {new Date().getFullYear()} Max Solutions. Todos los derechos reservados.
          </p>
          <p className="text-white/20 text-xs font-body">
            Desarrollado por{' '}
            <a href="https://www.linkedin.com/in/nicolas-ehrman-aa8219243" target="_blank" rel="noopener noreferrer" className="hover:text-white/40 transition-colors">
              Nicolas Ehrman
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
