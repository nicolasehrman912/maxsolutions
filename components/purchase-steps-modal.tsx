"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function PurchaseStepsModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
    
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  if (!isMounted) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            ¿Cómo comprar en 4 simples pasos?
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Sigue esta guía para realizar tu compra de forma rápida y sencilla
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
              1
            </div>
            <div>
              <h3 className="font-semibold text-lg">Explora nuestro catálogo</h3>
              <p className="text-muted-foreground">
                Navega por nuestras categorías o utiliza la búsqueda para encontrar los productos promocionales perfectos para tu empresa.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
              2
            </div>
            <div>
              <h3 className="font-semibold text-lg">Selecciona tus productos</h3>
              <p className="text-muted-foreground">
                Revisa las opciones disponibles, verifica el stock y elige los artículos que necesitas para tu campaña.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
              3
            </div>
            <div>
              <h3 className="font-semibold text-lg">Contáctanos por WhatsApp</h3>
              <p className="text-muted-foreground">
                Haz clic en el botón de WhatsApp en la página del producto para iniciar una conversación directa con nuestro equipo de ventas.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
              4
            </div>
            <div>
              <h3 className="font-semibold text-lg">Finaliza tu pedido</h3>
              <p className="text-muted-foreground">
                Confirma los detalles de tu compra, método de pago y opciones de envío con nuestro equipo para completar tu pedido.
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)} className="w-full">
            ¡Entendido, vamos a comprar!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 