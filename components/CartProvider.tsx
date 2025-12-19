"use client"
import React, { createContext, useContext, useEffect, useState } from 'react'

type CartItem = { medicineId: number; quantity: number }

type CartContextValue = {
  items: CartItem[]
  add: (item: CartItem) => void
  remove: (medicineId: number) => void
  updateQuantity: (medicineId: number, quantity: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cart')
      if (raw) setItems(JSON.parse(raw))
    } catch (e) {}
  }, [])

  useEffect(() => {
    try { localStorage.setItem('cart', JSON.stringify(items)) } catch (e) {}
  }, [items])

  const add = (item: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.medicineId === item.medicineId)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx].quantity += item.quantity
        return copy
      }
      return [...prev, item]
    })
  }

  const remove = (medicineId: number) => setItems((prev) => prev.filter((p) => p.medicineId !== medicineId))
  
  const updateQuantity = (medicineId: number, quantity: number) => {
    if (quantity <= 0) {
      remove(medicineId)
      return
    }
    
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.medicineId === medicineId)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx].quantity = quantity
        return copy
      }
      return [...prev, { medicineId, quantity }]
    })
  }
  
  const clear = () => setItems([])

  return (
    <CartContext.Provider value={{ items, add, remove, updateQuantity, clear }}>
      {children}
    </CartContext.Provider>
  )
}
