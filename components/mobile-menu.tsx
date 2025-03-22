'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Phone, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Array<{ id: string; title: string; url: string }>;
  pathname: string;
}

// Cliente component for search form
function MobileSearchForm({ onClose }: { onClose: () => void }) {
  const searchParams = useSearchParams();
  
  return (
    <form action="/products" method="get" onSubmit={onClose}>
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
  );
}

export function MobileMenu({ isOpen, onClose, categories, pathname }: MobileMenuProps) {
  if (!isOpen) return null;
  
  // Format WhatsApp message
  const message = encodeURIComponent(`Hola, me gustaría solicitar información sobre sus productos.`);
  const whatsappUrl = `https://wa.me/5491124779637?text=${message}`; // Formato correcto con código de país
  
  return (
    <div className="md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 space-y-4">
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
            href="/products" 
            className={pathname.startsWith("/products") ? "font-medium" : ""}
            onClick={onClose}
          >
            Productos
          </Link>
        </nav>
        
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