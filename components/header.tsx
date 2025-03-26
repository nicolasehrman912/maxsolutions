"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Phone, Search, Menu, X, ChevronDown } from "lucide-react"
import { useState, Suspense, useEffect } from "react"
import Image from "next/image"
import dynamic from 'next/dynamic'
import { Input } from "@/components/ui/input"
import { generarUrlWhatsApp } from "@/MODIFICAR"
import { useRouter } from "next/navigation"
import { formatCategories, CategoryData, SubcategoryData } from "@/lib/categories"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

// Desktop category dropdown menu
function CategoryDropdown({ category }: { category: CategoryData }) {
  const router = useRouter();
  
  const handleCategoryClick = (categoryId: string | number) => {
    router.push(`/products?category=${categoryId}`);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 text-sm whitespace-nowrap">
          {category.name}
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem 
          className="font-medium"
          onClick={() => handleCategoryClick(category.id)}
        >
          Ver todos los productos
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {category.subcategories?.map((subcategory) => (
          <DropdownMenuItem 
            key={subcategory.id}
            onClick={() => handleCategoryClick(subcategory.id)}
          >
            {subcategory.name}
            {subcategory.count && (
              <span className="ml-auto text-xs text-muted-foreground">
                ({subcategory.count})
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Desktop navigation menu
function DesktopNavigation() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  
  useEffect(() => {
    // Load categories
    const loadedCategories = formatCategories();
    setCategories(loadedCategories);
  }, []);
  
  // Handle category click (for categories without subcategories)
  const handleCategoryClick = (e: React.MouseEvent, categoryId: string | number) => {
    e.preventDefault();
    router.push(`/products?category=${categoryId}`);
  };
  
  return (
    <nav className="hidden md:flex items-center gap-6 text-sm">
      <Link 
        href="/products" 
        className={pathname.startsWith("/products") && !pathname.includes("?") ? "font-medium" : ""}
      >
        Todos los Productos
      </Link>
      
      {/* Only show first 4 categories with subcategories in the main nav to avoid overflow */}
      {categories
        .filter(cat => cat.subcategories && cat.subcategories.length > 0)
        .slice(0, 4)
        .map(category => (
          <CategoryDropdown key={category.id} category={category} />
        ))}
      
      {/* More dropdown for other categories */}
      {categories.length > 4 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 text-sm whitespace-nowrap">
              Más categorías
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {categories
              .filter((_, index) => index >= 4)
              .map(category => (
                <DropdownMenuItem 
                  key={category.id}
                  onClick={(e) => {
                    if (category.subcategories && category.subcategories.length > 0) {
                      e.preventDefault();
                      router.push(`/products?category=${category.id}`);
                    }
                  }}
                >
                  {category.name}
                  {category.count && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      ({category.count})
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  );
}

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [whatsappUrl, setWhatsappUrl] = useState("#")
  const [isMounted, setIsMounted] = useState(false)
  
  // Update WhatsApp URL after hydration
  useEffect(() => {
    setIsMounted(true)
    setWhatsappUrl(generarUrlWhatsApp('general'))
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left section with logo and navigation */}
          <div className="flex items-center gap-6">
            <a href="/" className="font-bold text-xl shrink-0">
              <Image src="/logo.png" alt="ZECAT Promocionales" width={100} height={100} />
            </a>
            
            {/* Desktop Navigation */}
            <DesktopNavigation />
          </div>
          
          {/* Right section with search and contact */}
          <div className="flex items-center gap-4">
            {/* Search (only on desktop) */}
            <div className="hidden md:block w-[300px]">
              <Suspense fallback={
                <div className="relative">
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
          
            {/* Contact button */}
            <div className="hidden md:block">
              {isMounted ? (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Contactar
                  </Button>
                </a>
              ) : (
                <Button size="sm" disabled>
                  <Phone className="h-4 w-4 mr-2" />
                  Contactar
                </Button>
              )}
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
        pathname={pathname}
      />
    </header>
  )
}

