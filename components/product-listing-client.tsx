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
  // Use a state to track if component is mounted instead of "isClient"
  const [isMounted, setIsMounted] = useState(false);
  
  // Set mounted state once component is mounted on client
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Función para construir la URL de paginación con múltiples categorías
  const buildPaginationUrl = (pageNum: number) => {
    // Create URLSearchParams to handle parameters properly
    const params = new URLSearchParams();
    
    // Add page parameter
    params.set('page', pageNum.toString());
    
    // Add category parameters
    if (Array.isArray(categoryParam)) {
      categoryParam.forEach(cat => {
        params.append('category', cat);
      });
    } else if (categoryParam) {
      params.set('category', categoryParam);
    }
    
    // Add search parameter if it exists
    if (search) {
      params.set('search', search);
    }
    
    return `/products?${params.toString()}`;
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

  // Create pagination links
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

  // Return null during SSR to prevent hydration mismatch
  if (typeof window === 'undefined') {
    return null;
  }

  // If current page is greater than total pages and total pages > 0, redirect to the last page
  useEffect(() => {
    if (isMounted && totalPages > 0 && currentPage > totalPages) {
      window.location.href = buildPaginationUrl(totalPages);
    }
  }, [isMounted, currentPage, totalPages]);

  // The client-side only render 
  return (
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
              No hay productos que coincidan con las categorías seleccionadas.
              {isMounted && " Intenta con otras categorías o busca términos más generales."}
            </p>
            {isMounted && (
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
} 