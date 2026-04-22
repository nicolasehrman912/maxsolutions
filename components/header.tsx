"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Phone, Search, Menu, X, ChevronDown } from "lucide-react"
import { useState, Suspense, useEffect } from "react"
import Image from "next/image"
import dynamic from 'next/dynamic'
import { generarUrlWhatsApp } from "@/MODIFICAR"
import { useRouter } from "next/navigation"
import { formatCategories, CategoryData } from "@/lib/categories"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const MobileMenu = dynamic(
  () => import('@/components/mobile-menu').then(mod => mod.MobileMenu),
  { ssr: false }
)

function SearchForm() {
  const searchParams = useSearchParams()
  return (
    <form action="/products" method="get">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        <input
          type="search"
          name="search"
          placeholder="Buscar productos..."
          defaultValue={searchParams?.get('search') || ''}
          autoComplete="off"
          className="w-full pl-9 pr-4 py-2 rounded-md text-sm bg-white/10 border border-white/15 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all font-body"
        />
        <input type="hidden" name="page" value="1" />
      </div>
    </form>
  )
}

function CategoryDropdown({ category }: { category: CategoryData }) {
  const router = useRouter()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 text-sm text-white/75 hover:text-white transition-colors whitespace-nowrap font-body font-medium">
          {category.name}
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 shadow-xl border-border">
        <DropdownMenuItem className="font-semibold text-navy text-sm" onClick={() => router.push(`/products?category=${category.id}`)}>
          Ver todos
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {category.subcategories?.map(sub => (
          <DropdownMenuItem key={sub.id} className="text-sm" onClick={() => router.push(`/products?category=${sub.id}`)}>
            {sub.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DesktopNavigation() {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const router = useRouter()
  useEffect(() => { setCategories(formatCategories()) }, [])
  return (
    <nav className="hidden md:flex items-center gap-6">
      <Link href="/products" className="text-sm text-white/75 hover:text-white transition-colors font-body font-medium whitespace-nowrap">
        Todos los productos
      </Link>
      {categories.filter(c => c.subcategories?.length).slice(0, 4).map(cat => (
        <CategoryDropdown key={cat.id} category={cat} />
      ))}
      {categories.length > 4 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 text-sm text-white/75 hover:text-white transition-colors whitespace-nowrap font-body font-medium">
              Más <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 shadow-xl">
            {categories.slice(4).map(cat => (
              <DropdownMenuItem key={cat.id} className="text-sm" onClick={() => router.push(`/products?category=${cat.id}`)}>
                {cat.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  )
}

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [whatsappUrl, setWhatsappUrl] = useState("#")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setWhatsappUrl(generarUrlWhatsApp('general'))
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full gradient-navy">
      {/* Gold top line */}
      <div className="h-[3px] bg-gold w-full" />

      <div className="container mx-auto px-4">
        <div className="flex h-[68px] items-center gap-6">
          {/* Logo */}
          <a href="/" className="shrink-0">
            <Image src="/logo.png" alt="Max Solutions" width={115} height={46} className="brightness-0 invert" />
          </a>

          {/* Nav */}
          <DesktopNavigation />

          {/* Right side */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="hidden md:block w-[260px]">
              <Suspense fallback={<div className="h-9 rounded-md bg-white/10 animate-pulse w-full" />}>
                <SearchForm />
              </Suspense>
            </div>

            {isMounted ? (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-2 bg-gold hover:bg-gold-light text-white font-semibold text-sm px-5 py-2 rounded-md transition-colors whitespace-nowrap font-body shadow-lg shadow-black/20">
                <Phone className="h-4 w-4" />
                Contactar
              </a>
            ) : (
              <div className="hidden md:block w-28 h-9 rounded-md bg-white/10 animate-pulse" />
            )}

            <button className="md:hidden text-white p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} pathname={pathname} />
    </header>
  )
}

