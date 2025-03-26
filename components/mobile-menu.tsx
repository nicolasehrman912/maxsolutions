"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Phone, Search, ChevronRight, X, Home, Grid, Filter } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

// Client component for search form
function MobileSearchForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search") as string;
    if (search) {
      router.push(`/products?search=${encodeURIComponent(search)}`);
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        name="search"
        placeholder="Buscar productos..."
        defaultValue={searchTerm}
        className="w-full pl-9 pr-4 bg-white"
        autoComplete="off"
      />
    </form>
  );
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
}

export function MobileMenu({ isOpen, onClose, pathname }: MobileMenuProps) {
  const router = useRouter();
  const [whatsappUrl, setWhatsappUrl] = useState<string>("#");
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [categories, setCategories] = useState<CategoryData[]>([]);

  useEffect(() => {
    const loadData = () => {
      setIsMounted(true);
      setWhatsappUrl(generarUrlWhatsApp('general'));
      const loadedCategories = formatCategories();
      setCategories(loadedCategories);
    };

    loadData();
  }, []);

  const handleCategoryClick = (categoryId: string | number) => {
    router.push(`/products?category=${categoryId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="sticky top-0 z-40 flex items-center justify-between p-4 border-b bg-white shadow-sm">
          <h2 className="text-lg font-semibold">Menú</h2>
          <button onClick={onClose} className="p-2">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b bg-white">
          {isMounted ? (
            <MobileSearchForm onClose={onClose} />
          ) : (
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                disabled
                placeholder="Cargando..."
                className="w-full pl-9 pr-4 bg-white"
              />
            </div>
          )}
        </div>

        {/* Tabs for Navigation and Filters */}
        <Tabs defaultValue="navigation" className="flex-1 bg-white">
          <div className="sticky top-[57px] z-30 bg-white border-b shadow-sm">
            <TabsList className="w-full justify-start rounded-none border-b bg-white">
              <TabsTrigger value="navigation" className="flex-1 data-[state=active]:bg-white">
                <Home className="h-4 w-4 mr-2" />
                Navegación
              </TabsTrigger>
              <TabsTrigger value="filters" className="flex-1 data-[state=active]:bg-white">
                <Filter className="h-4 w-4 mr-2" />
                Categorías
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 bg-white">
            <TabsContent value="navigation" className="m-0 p-4 pb-24 bg-white">
              <nav className="space-y-2">
                <Link
                  href="/"
                  className={`block p-2 rounded-lg hover:bg-gray-50 ${
                    pathname === "/" ? "bg-gray-50" : ""
                  }`}
                  onClick={onClose}
                >
                  Inicio
                </Link>
                <Link
                  href="/products"
                  className={`block p-2 rounded-lg hover:bg-gray-50 ${
                    pathname.startsWith("/products") ? "bg-gray-50" : ""
                  }`}
                  onClick={onClose}
                >
                  Todos los Productos
                </Link>
              </nav>
            </TabsContent>

            <TabsContent value="filters" className="m-0 p-4 pb-24 bg-white">
              {isMounted ? (
                <div className="space-y-4">
                  <Accordion type="multiple" className="w-full">
                    {categories.map((category) => (
                      <AccordionItem key={category.id} value={category.id.toString()} className="border-b bg-white">
                        <div className="flex items-center bg-white">
                          {category.subcategories && category.subcategories.length > 0 ? (
                            <AccordionTrigger className="flex-1 py-2 px-0 hover:bg-gray-50">
                              <span className="text-sm">{category.name}</span>
                            </AccordionTrigger>
                          ) : (
                            <button
                              onClick={() => handleCategoryClick(category.id)}
                              className="flex items-center justify-between w-full py-3 text-sm text-left hover:bg-gray-50"
                            >
                              <span>{category.name}</span>
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        
                        {category.subcategories && category.subcategories.length > 0 && (
                          <AccordionContent className="bg-white">
                            <div className="pl-4 space-y-2 py-1">
                              <button
                                onClick={() => handleCategoryClick(category.id)}
                                className="flex items-center justify-between w-full py-2 text-sm text-left font-medium hover:bg-gray-50"
                              >
                                <span>Ver todos los productos</span>
                                <ChevronRight className="h-4 w-4" />
                              </button>
                              
                              {category.subcategories.map((subcategory) => (
                                <button
                                  key={subcategory.id}
                                  onClick={() => handleCategoryClick(subcategory.id)}
                                  className="flex items-center justify-between w-full py-2 text-sm text-left hover:bg-gray-50"
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
              ) : (
                <div className="p-4">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-100 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-100 rounded w-2/3"></div>
                  </div>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
} 