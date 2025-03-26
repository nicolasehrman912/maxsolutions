"use client";

import { useEffect, useState } from "react";
import { CategoryData } from "@/lib/categories";
import { CategoryAccordionNavigation } from "@/components/categories/category-navigation";
import { CategoriesSidebar } from "@/components/categories/categories-sidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CategoriesClient() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>();
  const [viewType, setViewType] = useState<"accordion" | "sidebar">("accordion");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch categories from API endpoint
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle category click for debugging
  const handleCategoryClick = (category: CategoryData | null) => {
    if (category) {
      setActiveCategory(category.id.toString());
    } else {
      setActiveCategory(undefined);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Navegación por Categorías</h1>
        <p className="text-muted-foreground">
          Esta página permite visualizar y probar el sistema de navegación por categorías.
        </p>

        <div className="flex gap-2 mt-4">
          <Button
            variant={viewType === "accordion" ? "default" : "outline"}
            onClick={() => setViewType("accordion")}
          >
            Ver Acordeón
          </Button>
          <Button
            variant={viewType === "sidebar" ? "default" : "outline"}
            onClick={() => setViewType("sidebar")}
          >
            Ver Sidebar
          </Button>
          <Link href="/products">
            <Button variant="secondary">Ver Productos</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-4 space-y-6">
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-lg font-medium mb-4">Categorías</h2>
            {loading ? (
              <div className="space-y-2 animate-pulse">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 bg-muted rounded"></div>
                ))}
              </div>
            ) : viewType === "accordion" ? (
              <CategoryAccordionNavigation
                categories={categories}
                activeCategory={activeCategory}
              />
            ) : (
              <CategoriesSidebar />
            )}
          </div>
        </div>

        <div className="md:col-span-8 space-y-6">
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-lg font-medium mb-4">Datos de Categorías</h2>
            <div className="max-h-[600px] overflow-auto">
              {loading ? (
                <div className="h-64 bg-muted rounded animate-pulse"></div>
              ) : (
                <pre className="text-xs">
                  {JSON.stringify(categories, null, 2)}
                </pre>
              )}
            </div>
          </div>

          {activeCategory && (
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-lg font-medium mb-4">Categoría Seleccionada</h2>
              <p className="text-muted-foreground mb-2">
                ID: <span className="font-mono">{activeCategory}</span>
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveCategory(undefined)}
              >
                Limpiar Selección
              </Button>
            </div>
          )}

          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-lg font-medium mb-4">Información de Uso</h2>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium">Categorías Principales</h3>
                <p className="text-muted-foreground">
                  Al hacer clic en una categoría principal, se mostrarán todos los productos de esa categoría y sus subcategorías.
                </p>
              </div>
              <div>
                <h3 className="font-medium">Subcategorías</h3>
                <p className="text-muted-foreground">
                  Al hacer clic en una subcategoría, se mostrarán solo los productos de esa subcategoría específica.
                </p>
              </div>
              <div>
                <h3 className="font-medium">Implementación</h3>
                <p className="text-muted-foreground">
                  La navegación se ha implementado usando un sistema de acordeón con Next.js, Tailwind CSS y Radix UI para una experiencia fluida y accesible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 