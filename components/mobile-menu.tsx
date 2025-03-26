'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Phone, Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { generarUrlWhatsApp } from "@/MODIFICAR";
import { formatCategories, CategoryData } from "@/lib/categories";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
}

// Client component for search form
function MobileSearchForm({ onClose }: { onClose: () => void }) {
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    setIsClient(true);
    setSearchTerm(searchParams?.get("search") || "");
  }, [searchParams]);
  
  if (!isClient) {
    return (
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          disabled
          placeholder="Buscar productos..."
          className="w-full pl-9 pr-4"
        />
      </div>
    );
  }
  
  return (
    <form action="/products" method="get" onSubmit={onClose}>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          name="search"
          placeholder="Buscar productos..."
          defaultValue={searchTerm}
          className="w-full pl-9 pr-4"
          autoComplete="off"
        />
        <input type="hidden" name="page" value="1" />
      </div>
    </form>
  );
}

// Mobile category navigation component
function MobileCategoryNavigation({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    // Load categories
    const loadedCategories = formatCategories();
    setCategories(loadedCategories);
  }, []);
  
  // Handle main category click
  const handleMainCategoryClick = (categoryId: string | number) => {
    router.push(`/products?category=${categoryId}`);
    onClose();
  };
  
  // Handle subcategory click
  const handleSubcategoryClick = (subcategoryId: string | number) => {
    router.push(`/products?category=${subcategoryId}`);
    onClose();
  };
  
  // Return a placeholder during server-side rendering
  if (!isClient) {
    return <div className="space-y-2"></div>;
  }
  
  return (
    <div className="space-y-2">
      <h3 className="font-medium text-sm mb-2">Categorías</h3>
      <Accordion type="multiple" className="w-full">
        {categories.map((category) => (
          <AccordionItem key={category.id} value={category.id.toString()} className="border-b">
            <div className="flex items-center">
              {category.subcategories && category.subcategories.length > 0 ? (
                <AccordionTrigger className="flex-1 py-2 px-0">
                  <span className="text-sm">{category.name}</span>
                </AccordionTrigger>
              ) : (
                <button
                  onClick={() => handleMainCategoryClick(category.id)}
                  className="flex items-center justify-between w-full py-3 text-sm text-left"
                >
                  <span>{category.name}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {category.subcategories && category.subcategories.length > 0 && (
              <AccordionContent>
                <div className="pl-4 space-y-2 py-1">
                  <button
                    onClick={() => handleMainCategoryClick(category.id)}
                    className="flex items-center justify-between w-full py-2 text-sm text-left font-medium"
                  >
                    <span>Ver todos los productos</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  
                  {category.subcategories.map((subcategory) => (
                    <button
                      key={subcategory.id}
                      onClick={() => handleSubcategoryClick(subcategory.id)}
                      className="flex items-center justify-between w-full py-2 text-sm text-left"
                    >
                      <span>{subcategory.name}</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </AccordionContent>
            )}
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export function MobileMenu({ isOpen, onClose, pathname }: MobileMenuProps) {
  if (!isOpen) return null;
  
  // Usar la función generarUrlWhatsApp para obtener la URL de WhatsApp
  const whatsappUrl = generarUrlWhatsApp('general');
  
  return (
    <div className="md:hidden fixed inset-0 z-50 bg-background overflow-y-auto pb-20">
      <div className="container mx-auto px-4 py-4 space-y-6">
        {/* Search Bar */}
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
          <MobileSearchForm onClose={onClose} />
        </Suspense>
        
        <nav className="flex flex-col space-y-4">
          <Link 
            href="/" 
            className={pathname === "/" ? "font-medium" : ""}
            onClick={onClose}
          >
            Inicio
          </Link>
          <Link 
            href="/products" 
            className={pathname.startsWith("/products") ? "font-medium" : ""}
            onClick={onClose}
          >
            Todos los Productos
          </Link>
        </nav>
        
        {/* Category Navigation */}
        <div className="pt-4 border-t">
          <MobileCategoryNavigation onClose={onClose} />
        </div>
        
        <div className="pt-4 border-t">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button className="w-full">
              <Phone className="h-4 w-4 mr-2" />
              Contactar por WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
} 