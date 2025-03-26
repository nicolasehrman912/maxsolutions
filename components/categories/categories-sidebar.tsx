"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { CategoryAccordionNavigation } from "./category-navigation";
import { formatCategories, CategoryData, getAllSubcategoryIds } from "@/lib/categories";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function CategoriesSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  const categoriesLoadedRef = useRef(false);
  const prevParamsRef = useRef<{
    search: string | null;
    categories: string[];
  }>({ search: null, categories: [] });
  
  // Get the active category from URL if any
  const categoryParam = searchParams?.getAll("category") || [];

  // Set isClient to true once mounted (client-side only)
  useEffect(() => {
    setIsClient(true);
    
    // Load categories only once
    if (!categoriesLoadedRef.current) {
      const loadedCategories = formatCategories();
      setCategories(loadedCategories);
      categoriesLoadedRef.current = true;
    }
  }, []);
  
  // Effect for handling URL parameters
  useEffect(() => {
    if (!isClient) return;
    
    // Get search term from URL
    const search = searchParams?.get("search");
    
    // Get active filters from URL
    const currentCategories = categoryParam || [];
    
    // Only update if values have changed
    const prevSearch = prevParamsRef.current.search;
    const prevCategories = prevParamsRef.current.categories;
    
    // Check if search term has changed
    if (search !== prevSearch) {
      setSearchTerm(search || "");
      prevParamsRef.current.search = search;
    }
    
    // Check if categories have changed
    const categoriesChanged = 
      currentCategories.length !== prevCategories.length ||
      currentCategories.some((cat, i) => cat !== prevCategories[i]);
    
    if (categoriesChanged) {
      setActiveFilters(currentCategories);
      prevParamsRef.current.categories = [...currentCategories];
    }
  }, [searchParams, categoryParam, isClient]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new searchParams
    const params = new URLSearchParams(searchParams?.toString());
    
    // Set search term
    if (searchTerm) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }
    
    // Navigate to products page with search params
    router.push(`${pathname}?${params.toString()}`);
  };

  // Clear all filters
  const clearFilters = () => {
    router.push("/products");
  };

  // Remove a specific filter
  const removeFilter = (filterId: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    
    // Remove the specific category
    const currentCategories = params.getAll("category").filter(id => id !== filterId);
    params.delete("category");
    
    // Add back the remaining categories
    currentCategories.forEach(cat => params.append("category", cat));
    
    router.push(`${pathname}?${params.toString()}`);
  };

  // If we haven't yet hydrated, return a placeholder that matches server output
  if (!isClient) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <h2 className="font-medium">Filtros</h2>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar productos..."
              className="pl-8"
              disabled
            />
          </div>
          <Button type="button" size="sm" disabled>
            Buscar
          </Button>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          {/* Empty placeholder matching server structure */}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h2 className="font-medium">Filtros</h2>
        </div>
        
        {activeFilters.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters} 
            className="h-8 px-2 text-xs"
          >
            Limpiar filtros
          </Button>
        )}
      </div>
      
      <form onSubmit={handleSearch} className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar productos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button type="submit" size="sm">
          Buscar
        </Button>
      </form>
      
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activeFilters.map(filterId => {
            // Find category or subcategory name
            let name = filterId;
            
            for (const category of categories) {
              if (category.id.toString() === filterId) {
                name = category.name;
                break;
              }
              
              if (category.subcategories) {
                const subcategory = category.subcategories.find(
                  sub => sub.id.toString() === filterId
                );
                if (subcategory) {
                  name = subcategory.name;
                  break;
                }
              }
            }
            
            return (
              <div
                key={filterId}
                className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs"
              >
                <span>{name}</span>
                <button
                  type="button"
                  onClick={() => removeFilter(filterId)}
                  className="rounded-full hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      
      <Separator />
      
      <div className="space-y-4">
        <CategoryAccordionNavigation
          categories={categories}
          activeCategory={categoryParam.length === 1 ? categoryParam[0] : undefined}
          className="border-none"
        />
      </div>
    </div>
  );
} 