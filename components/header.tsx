"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Phone, Search, Menu, X } from "lucide-react"
import { useState, Suspense } from "react"
import Image from "next/image"
import dynamic from 'next/dynamic'
import { Input } from "@/components/ui/input"
import { generarUrlWhatsApp } from "@/MODIFICAR"

// Create a client-only mobile menu component
const MobileMenu = dynamic(
  () => import('@/components/mobile-menu').then(mod => mod.MobileMenu),
  { ssr: false } // Never render on server
)

// Client component for the search form
function SearchForm() {
  const searchParams = useSearchParams()
  
  return (
    <form action="/products" method="get" className="flex-1">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          name="search"
          placeholder="Buscar productos..."
          defaultValue={searchParams?.get('search') || ''}
          className="w-full pl-9 pr-4"
          autoComplete="off"
        />
        <input type="hidden" name="page" value="1" />
      </div>
    </form>
  )
}

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Usar la función generarUrlWhatsApp para obtener la URL de WhatsApp
  const whatsappUrl = generarUrlWhatsApp('general')

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left section with logo only */}
          <div className="flex items-center">
            <a href="/" className="font-bold text-xl shrink-0">
              <Image src="/logo.png" alt="ZECAT Promocionales" width={100} height={100} />
            </a>
          </div>
          
          {/* Center section with navigation link and search */}
          <div className="hidden md:flex items-center w-full max-w-xl mx-auto">
            <Link 
              href="/products" 
              className={`mr-6 ${pathname.startsWith("/products") ? "font-medium whitespace-nowrap" : "whitespace-nowrap"}`}
            >
              Productos
            </Link>
            
            <Suspense fallback={
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  disabled
                  placeholder="Cargando..."
                  className="w-full pl-9 pr-4"
                />
              </div>
            }>
              <SearchForm />
            </Suspense>
          </div>
          
          {/* Right section with contact button */}
          <div className="flex items-center">
            {/* Contact button */}
            <div className="hidden md:block">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  Contactar
                </Button>
              </a>
            </div>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Client-only mobile menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        categories={[]}
        pathname={pathname}
      />
    </header>
  )
}

