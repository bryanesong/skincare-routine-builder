'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"

interface Product {
  product_id: string[]
  product_name: string[]
}

interface RoutineToggleProps {
  dayProducts: Product
  nightProducts: Product
}

export default function RoutineToggle({ dayProducts, nightProducts }: RoutineToggleProps) {
  const [view, setView] = useState<'both' | 'morning' | 'evening'>('both')

  return (
    <div className="space-y-4">
      <div className="relative p-1 flex bg-gray-100 rounded-full">
        {/* Sliding highlight */}
        <div
          className={`absolute transition-all duration-200 ease-in-out h-10 w-1/3 bg-red-500 rounded-full shadow-md
            ${view === 'both' ? 'left-1' : view === 'morning' ? 'left-1/3' : 'left-2/3'}`}
        />
        
        {/* Buttons */}
        <button
          onClick={() => setView('both')}
          className={`relative flex-1 rounded-full py-2 text-sm font-medium transition-colors
            ${view === 'both' ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
        >
          Both Routines
        </button>
        <button
          onClick={() => setView('morning')}
          className={`relative flex-1 rounded-full py-2 text-sm font-medium transition-colors
            ${view === 'morning' ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
        >
          Morning Only
        </button>
        <button
          onClick={() => setView('evening')}
          className={`relative flex-1 rounded-full py-2 text-sm font-medium transition-colors
            ${view === 'evening' ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
        >
          Evening Only
        </button>
      </div>

      <div className={`grid ${view === 'both' ? 'md:grid-cols-2' : 'grid-cols-1'} gap-8`}>
        {/* Morning Routine */}
        {(view === 'both' || view === 'morning') && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-indigo-600">Morning Routine</h2>
            <ul className="space-y-3">
              {dayProducts.product_name.map((productName: string, index: number) => (
                <li key={dayProducts.product_id[index]} className="flex items-center gap-3">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full"/>
                  <span className="text-lg">{productName}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Evening Routine */}
        {(view === 'both' || view === 'evening') && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-indigo-600">Evening Routine</h2>
            <ul className="space-y-3">
              {nightProducts.product_name.map((productName: string, index: number) => (
                <li key={nightProducts.product_id[index]} className="flex items-center gap-3">
                  <span className="w-3 h-3 bg-indigo-500 rounded-full"/>
                  <span className="text-lg">{productName}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
} 