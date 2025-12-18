"use client"
import React, { useState } from 'react'
import { useCart } from './CartProvider'

export default function AddToCartButton({ medicineId, defaultQty = 1 }: { medicineId: number; defaultQty?: number }) {
  const { add } = useCart()
  const [qty, setQty] = useState(defaultQty)
  const [added, setAdded] = useState(false)

  function handleAdd() {
    add({ medicineId, quantity: qty })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="flex items-center gap-2">
      <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value || 1))} className="w-16 rounded border px-2 py-1" />
      <button onClick={handleAdd} className="bg-primary text-primary-foreground px-3 py-1 rounded">{added ? 'Added' : 'Add'}</button>
    </div>
  )
}
