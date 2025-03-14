"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function CategorySectionSkeleton() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-2">
        <Skeleton className="h-8 w-[300px]" />
        <Skeleton className="h-4 w-[500px]" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-lg" />
        ))}
      </div>
      <div className="flex justify-center">
        <Skeleton className="h-10 w-[200px]" />
      </div>
    </section>
  )
} 