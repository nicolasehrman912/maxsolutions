"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function PurchaseStepsModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  
  // Detectar si es un dispositivo móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])
  
  useEffect(() => {
    setIsMounted(true)
    
    // Verificar en localStorage si el usuario ya vio el popup
    // Solo ejecutar en el lado del cliente
    if (typeof window !== 'undefined') {
      const hasSeenModal = localStorage.getItem('hasSeenPurchaseGuide')
      
      // Mostrar el modal solo si el usuario no lo ha visto antes
      if (!hasSeenModal) {
        const timer = setTimeout(() => {
          setIsOpen(true)
        }, 1000)
        
        return () => clearTimeout(timer)
      }
    }
  }, [])
  
  // Función para cerrar el modal y guardar en localStorage
  const handleClose = () => {
    // Guardar en localStorage que el usuario ya vio el popup
    // Solo ejecutar en el lado del cliente
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasSeenPurchaseGuide', 'true')
    }
    setIsOpen(false)
  }
  
  // Función para manejar el gesto de deslizamiento
  useEffect(() => {
    if (!dialogRef.current || !isMobile) return
    
    let startY = 0
    let currentY = 0
    
    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      currentY = e.touches[0].clientY
      const diff = currentY - startY
      
      // Si estamos deslizando hacia abajo y estamos en la parte superior del contenido
      if (diff > 50 && dialogRef.current && dialogRef.current.scrollTop <= 0) {
        e.preventDefault()
        handleClose() // Usar handleClose para guardar en localStorage
      }
    }
    
    const element = dialogRef.current
    element.addEventListener('touchstart', handleTouchStart)
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
    }
  }, [isMobile, isOpen])
  
  if (!isMounted) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        ref={dialogRef}
        className={`
          w-[92vw] max-h-[90vh] sm:max-w-[600px] rounded-lg
          ${isMobile ? 
            'py-4 px-4 overflow-y-auto' : 
            'py-6 px-6 overflow-y-auto'
          }
        `}
      >
        {/* Indicador de deslizamiento solo visible en móviles */}
        {isMobile && (
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4 -mt-1"></div>
        )}
        
        {/* Botón de cerrar personalizado más grande y visible */}
        <DialogClose className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-full bg-muted p-2 w-8 h-8 flex items-center justify-center hover:bg-muted-foreground/20 z-50" onClick={handleClose}>
          <X className="h-5 w-5" />
          <span className="sr-only">Cerrar</span>
        </DialogClose>
        
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold text-center">
            ¿Cómo comprar en 4 simples pasos?
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Sigue esta guía para realizar tu compra de forma rápida y sencilla
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-5 sm:py-6 sm:space-y-6 overflow-y-auto">
          <div className="flex gap-3 sm:gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
              1
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg">Explora nuestro catálogo</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Navega por nuestras categorías o utiliza la búsqueda para encontrar los productos promocionales perfectos para tu empresa.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 sm:gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
              2
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg">Selecciona tus productos</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Revisa las opciones disponibles, verifica el stock y elige los artículos que necesitas para tu campaña.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 sm:gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
              3
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg">Contáctanos por WhatsApp</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Haz clic en el botón de WhatsApp en la página del producto para iniciar una conversación directa con nuestro equipo de ventas.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 sm:gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
              4
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg">Finaliza tu pedido</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Confirma los detalles de tu compra, método de pago y opciones de envío con nuestro equipo para completar tu pedido.
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter className="mt-2 sm:mt-4">
          <Button onClick={handleClose} className="w-full py-5 text-base sm:py-6">
            ¡Entendido, vamos a comprar!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 