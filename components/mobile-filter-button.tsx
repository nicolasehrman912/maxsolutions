"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { MobileMenu } from "@/components/mobile-menu"
import { usePathname } from "next/navigation"

export function MobileFilterButton() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <Button
        variant="default"
        size="lg"
        className="fixed bottom-4 right-4 shadow-lg rounded-full z-40"
        onClick={() => setIsMenuOpen(true)}
      >
        <Filter className="h-4 w-4 mr-2" />
        Filtros
      </Button>

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        pathname={pathname}
      />
    </>
  )
} 