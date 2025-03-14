"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function ProductsPageSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  )
}

function ProductCardSkeleton() {
  return (
    <div className="border rounded-md overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <div className="pt-2">
          <Skeleton className="h-8 w-full mt-2" />
        </div>
      </div>
    </div>
  )
} 