"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type Product = {
  id: number
  name: string
  price: number
  image: string
  category: string
  isNew: boolean
  quantity?: number
}

type CartContextType = {
  cartItems: Product[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<Product[]>([])

  // Load cart from localStorage on client side
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cartItems))
    }
  }, [cartItems])

  const addToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id)

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item,
        )
      } else {
        return [...prevItems, { ...product, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (productId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId))

    // If cart is empty after removal, clear localStorage
    if (cartItems.length === 1) {
      localStorage.removeItem("cart")
    }
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) return

    setCartItems((prevItems) => prevItems.map((item) => (item.id === productId ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem("cart")
  }

  const totalItems = cartItems.reduce((total, item) => total + (item.quantity || 1), 0)

  const subtotal = cartItems.reduce((total, item) => total + item.price * (item.quantity || 1), 0)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

