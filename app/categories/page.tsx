import { Suspense } from "react";
import { CategoriesClient } from "@/components/categories/categories-client";

export default function CategoriesPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Navegación por Categorías</h1>
          <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-lg font-medium mb-4">Categorías</h2>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="md:col-span-8">
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-lg font-medium mb-4">Cargando datos...</h2>
              <div className="h-64 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <CategoriesClient />
    </Suspense>
  );
} 