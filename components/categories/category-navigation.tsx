"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { getAllSubcategoryIds } from "@/lib/categories";

// Category type definitions
interface CategoryProps {
  id: string | number;
  name: string;
  count?: number;
  subcategories?: SubcategoryProps[];
}

interface SubcategoryProps {
  id: string | number;
  name: string;
  count?: number;
}

export function CategoryNavigation({
  categories,
  activeCategory,
  className,
}: {
  categories: CategoryProps[];
  activeCategory?: string | number;
  className?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true once mounted (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Handle active category changes
  useEffect(() => {
    if (!isClient || !activeCategory) return;
    
    // Find which main category contains the active category
    const mainCategory = categories.find((category) =>
      category.subcategories?.some(
        (sub) => sub.id.toString() === activeCategory.toString()
      )
    );
    
    if (mainCategory) {
      setOpenCategories([mainCategory.id.toString()]);
    }
  }, [activeCategory, categories, isClient]);

  // Handle main category click
  const handleMainCategoryClick = (categoryId: string | number) => {
    // Navigate to a view showing all products of this category and its subcategories
    const category = categories.find(cat => cat.id.toString() === categoryId.toString());
    
    if (category && category.subcategories && category.subcategories.length > 0) {
      // If the category has subcategories, get all subcategory IDs
      const subcategoryIds = getAllSubcategoryIds(categoryId, categories);
      
      // Create new URL with all subcategory IDs as parameters
      const params = new URLSearchParams();
      subcategoryIds.forEach(id => params.append("category", id.toString()));
      
      router.push(`/products?${params.toString()}`);
    } else {
      // Single category
      router.push(`/products?category=${categoryId}`);
    }
  };

  // Handle subcategory click
  const handleSubcategoryClick = (subcategoryId: string | number) => {
    // Navigate to a view showing products of this specific subcategory
    router.push(`/products?category=${subcategoryId}`);
  };

  // Handle accordion toggle
  const handleAccordionToggle = (value: string) => {
    if (openCategories.includes(value)) {
      setOpenCategories(openCategories.filter((id) => id !== value));
    } else {
      setOpenCategories([...openCategories, value]);
    }
  };

  // If we're server-side rendering or haven't hydrated yet, return a simple placeholder
  if (!isClient) {
    return <div className={cn("w-full", className)}></div>;
  }

  return (
    <div className={cn("w-full", className)}>
      {categories.map((category) => (
        <div key={category.id} className="border-b last:border-b-0">
          <div className="flex items-center">
            {category.subcategories && category.subcategories.length > 0 ? (
              <button
                onClick={() => handleAccordionToggle(category.id.toString())}
                className="p-2 hover:bg-accent rounded-sm mr-2"
                aria-label={openCategories.includes(category.id.toString()) ? "Collapse" : "Expand"}
              >
                {openCategories.includes(category.id.toString()) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <div className="w-8" /> // Spacer for alignment
            )}
            <button
              onClick={() => handleMainCategoryClick(category.id)}
              className="flex-1 py-3 text-left font-medium hover:underline"
            >
              {category.name}
              {category.count && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({category.count})
                </span>
              )}
            </button>
          </div>

          {category.subcategories && category.subcategories.length > 0 && (
            <div
              className={cn(
                "pl-8 overflow-hidden transition-all",
                openCategories.includes(category.id.toString())
                  ? "max-h-96"
                  : "max-h-0"
              )}
            >
              {category.subcategories.map((subcategory) => (
                <button
                  key={subcategory.id}
                  onClick={() => handleSubcategoryClick(subcategory.id)}
                  className={cn(
                    "block w-full text-left py-2 px-4 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm",
                    activeCategory === subcategory.id.toString()
                      ? "bg-accent text-accent-foreground font-medium"
                      : ""
                  )}
                >
                  {subcategory.name}
                  {subcategory.count && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({subcategory.count})
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Alternative implementation using Accordion component
export function CategoryAccordionNavigation({
  categories,
  activeCategory,
  className,
}: {
  categories: CategoryProps[];
  activeCategory?: string | number;
  className?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true once mounted (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Handle active category changes
  useEffect(() => {
    if (!isClient || !activeCategory) return;
    
    // Find which main category contains the active category
    const mainCategory = categories.find((category) =>
      category.subcategories?.some(
        (sub) => sub.id.toString() === activeCategory.toString()
      )
    );
    
    if (mainCategory) {
      setOpenCategories([mainCategory.id.toString()]);
    }
  }, [activeCategory, categories, isClient]);

  // Handle category click (including handling subcategories)
  const handleCategoryClick = (categoryId: string | number) => {
    // Find the category to check if it has subcategories
    const category = categories.find(cat => cat.id.toString() === categoryId.toString());
    
    if (category && category.subcategories && category.subcategories.length > 0) {
      // If the category has subcategories, get all subcategory IDs
      const subcategoryIds = getAllSubcategoryIds(categoryId, categories);
      
      // Create new URL with all subcategory IDs as parameters
      const params = new URLSearchParams();
      subcategoryIds.forEach(id => params.append("category", id.toString()));
      
      router.push(`/products?${params.toString()}`);
    } else {
      // Single category
      router.push(`/products?category=${categoryId}`);
    }
  };

  // If we're server-side rendering or haven't hydrated yet, return a simple placeholder
  if (!isClient) {
    return <div className={cn("w-full", className)}></div>;
  }

  return (
    <Accordion
      type="multiple"
      value={openCategories}
      onValueChange={setOpenCategories}
      className={cn("w-full", className)}
    >
      {categories.map((category) => (
        <AccordionItem key={category.id} value={category.id.toString()}>
          <div className="flex">
            {category.subcategories && category.subcategories.length > 0 ? (
              <AccordionTrigger className="flex-1 px-0">
                <span className="text-left">
                  {category.name}
                  {category.count && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({category.count})
                    </span>
                  )}
                </span>
              </AccordionTrigger>
            ) : (
              <button
                onClick={() => handleCategoryClick(category.id)}
                className="flex-1 py-4 text-left font-medium hover:underline"
              >
                {category.name}
                {category.count && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({category.count})
                  </span>
                )}
              </button>
            )}
          </div>
          
          {category.subcategories && category.subcategories.length > 0 && (
            <AccordionContent>
              <div className="space-y-1 pl-4">
                <button
                  onClick={() => handleCategoryClick(category.id)}
                  className="w-full text-left py-2 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-sm"
                >
                  Ver todos los productos
                </button>
                {category.subcategories.map((subcategory) => (
                  <button
                    key={subcategory.id}
                    onClick={() => router.push(`/products?category=${subcategory.id}`)}
                    className={cn(
                      "block w-full text-left py-2 px-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm",
                      activeCategory === subcategory.id.toString()
                        ? "bg-accent text-accent-foreground"
                        : ""
                    )}
                  >
                    {subcategory.name}
                    {subcategory.count && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({subcategory.count})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </AccordionContent>
          )}
        </AccordionItem>
      ))}
    </Accordion>
  );
} 