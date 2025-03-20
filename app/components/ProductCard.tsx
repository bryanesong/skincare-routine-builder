'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductCardProps {
  id: string
  name: string
  brand: string
  category: string
  image: string
  onClick: () => void
}

export default function ProductCard({
  id,
  name,
  brand,
  category,
  image,
  onClick
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <div
      className="border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
      onClick={onClick}
    >
      <div className="h-48 relative bg-gray-100">
        {!imageError ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span>No image</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-500 uppercase">{brand}</p>
        <h3 className="font-medium text-lg mb-1">{name}</h3>
        <p className="text-sm text-gray-600">{category}</p>
      </div>
    </div>
  )
}

