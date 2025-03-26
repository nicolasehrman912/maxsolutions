"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/product-grid";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  image: string;
  category: string;
  isNew: boolean;
  totalStock: number;
  source: string;
}

interface ProductListingClientProps {
  products: Product[];
  totalPages: number;
  totalProducts: number;
  currentPage: number;
  categoryParam?: string | string[];
  search?: string;
}

export default function ProductListingClient({
  products,
  totalPages,
  totalProducts,
  currentPage,
  categoryParam,
  search
}: ProductListingClientProps) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Función para construir la URL de paginación con múltiples categorías
  const buildPaginationUrl = (pageNum: number) => {
    let url = `/products?page=${pageNum}`;
    
    // Agregar categorías seleccionadas
    if (Array.isArray(categoryParam)) {
      categoryParam.forEach(cat => {
        url += `&category=${cat}`;
      });
    } else if (categoryParam) {
      url += `&category=${categoryParam}`;
    }
    
    // Agregar término de búsqueda si existe
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    
    return url;
  };

  // Pagination pages to display
  const getPaginationPages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    } else if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    } else if (currentPage >= totalPages - 2) {
      return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
    }
  };

  // Server/client consistent rendering
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const paginationPages = getPaginationPages();
    
    return (
      <div className="flex justify-center mt-8 gap-1">
        {currentPage > 1 && (
          <Link href={buildPaginationUrl(currentPage - 1)}>
            <Button variant="outline" size="sm">
              Anterior
            </Button>
          </Link>
        )}
        
        {paginationPages.map(pageNumber => (
          <Link 
            key={pageNumber} 
            href={buildPaginationUrl(pageNumber)}
            aria-current={currentPage === pageNumber ? "page" : undefined}
          >
            <Button 
              variant={currentPage === pageNumber ? "default" : "outline"} 
              size="sm"
            >
              {pageNumber}
            </Button>
          </Link>
        ))}
        
        {currentPage < totalPages && (
          <Link href={buildPaginationUrl(currentPage + 1)}>
            <Button variant="outline" size="sm">
              Siguiente
            </Button>
          </Link>
        )}
      </div>
    );
  };

  // Shared content for both server and client rendering
  const renderContent = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {totalProducts} productos encontrados
        </p>
      </div>
      
      {products.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <div className="max-w-sm mx-auto">
            <h3 className="text-lg font-semibold mb-2">No se encontraron productos</h3>
            <p className="text-muted-foreground mb-4">
              No hay productos que coincidan con los filtros seleccionados.
              {isClient && " Intenta con otros filtros o busca términos más generales."}
            </p>
            {isClient && (
              <Link href="/products">
                <Button variant="outline">Ver todos los productos</Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          <ProductGrid products={products} />
          {renderPagination()}
        </>
      )}
    </>
  );

  // Use the same structure for both server and client rendering to avoid hydration errors
  return renderContent();
} 