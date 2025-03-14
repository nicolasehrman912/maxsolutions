"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Phone, ShoppingBag, Search, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useMemo } from "react"
import Image from "next/image"

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  const categories = useMemo(() => [
    { id: '101', title: 'Escritura', url: '/products?search=&category=101' },
    { id: '161', title: 'Tecnología', url: '/products?search=&category=161' },
    { id: '131', title: 'Oficina', url: '/products?search=&category=131' },
    { id: '221', title: 'Bolsos', url: '/products?search=&category=221' },
  ], []);

  return (
    <header suppressHydrationWarning className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="/" className="font-bold text-xl">
            <Image src="/logo.png" alt="ZECAT Promocionales" width={100} height={100} />
          </a>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a 
              href="/" 
              className={pathname === "/" ? "font-medium" : ""}
            >
              Inicio
            </a>
            <Link 
              href="/products" 
              className={pathname.startsWith("/products") && !pathname.includes("?") ? "font-medium" : ""}
            >
              Productos
            </Link>
            {categories.map((category) => (
              <Link 
                key={category.id} 
                href={category.url}
                className={pathname.includes(`category=${category.id}`) ? "font-medium" : ""}
              >
                {category.title}
              </Link>
            ))}
          </nav>
          
          {/* Mobile menu button - solo renderiza después de la hidratación */}
          <button 
            className="md:hidden" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isClient && (mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            ))}
            {!isClient && <Menu className="h-6 w-6" />}
          </button>
          
          {/* Contact button */}
          <div className="hidden md:flex items-center gap-4">
            <a href="https://1134207313" target="_blank" rel="noopener noreferrer">
              <Button size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Contactar
              </Button>
            </a>
          </div>
        </div>
      </div>
      
      {/* Mobile menu - solo renderiza después de la hidratación */}
      {isClient && mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <nav className="flex flex-col space-y-4">
              <a 
                href="/" 
                className={pathname === "/" ? "font-medium" : ""}
                onClick={() => setMobileMenuOpen(false)}
              >
                Inicio
              </a>
              <Link 
                href="/products" 
                className={pathname.startsWith("/products") && !pathname.includes("?") ? "font-medium" : ""}
                onClick={() => setMobileMenuOpen(false)}
              >
                Productos
              </Link>
              {categories.map((category) => (
                <Link 
                  key={category.id} 
                  href={category.url}
                  className={pathname.includes(`category=${category.id}`) ? "font-medium" : ""}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category.title}
                </Link>
              ))}
            </nav>
            <div className="pt-4 border-t">
              <a href="https://1134207313" target="_blank" rel="noopener noreferrer">
                <Button className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Contactar por WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

