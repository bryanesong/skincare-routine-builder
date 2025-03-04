'use client'

import { useState } from 'react'

interface Product {
  product_id: string[]
  product_name: string[]
  product_image: string[]
}

interface RoutineToggleProps {
  dayProducts: Array<{
    id: number;
    name: string;  // This is an array of strings, not product_name
    type: string;
    routine: string;
    imageUrl: string;
  }>;
  nightProducts: Array<{
    id: number;
    name: string;  // This is an array of strings, not product_name
    type: string;
    routine: string;
    imageUrl: string;
  }>;
}

export default function RoutineToggle({ dayProducts, nightProducts }: RoutineToggleProps) {
  const [view, setView] = useState<'both' | 'morning' | 'evening'>('both')

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {/* Toggle Container - Made smaller with max-w and centered */}
        <div className="relative p-1 flex bg-gray-100 rounded-full max-w-md">
          {/* Sliding highlight - Adjusted left positions */}
          <div
            className={`absolute transition-all duration-200 ease-in-out h-10 w-1/3 bg-red-500 rounded-full shadow-md
              ${view === 'both' ? 'left-1' : view === 'morning' ? 'translate-x-full' : 'translate-x-[200%]'}`}
          />
          
          {/* Buttons */}
          <button
            onClick={() => setView('both')}
            className={`relative flex-1 rounded-full py-2 text-sm font-medium transition-colors
              ${view === 'both' ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Both
          </button>
          <button
            onClick={() => setView('morning')}
            className={`relative flex-1 rounded-full py-2 text-sm font-medium transition-colors
              ${view === 'morning' ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Day
          </button>
          <button
            onClick={() => setView('evening')}
            className={`relative flex-1 rounded-full py-2 text-sm font-medium transition-colors
              ${view === 'evening' ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Night
          </button>
        </div>

        <div className={`grid ${view === 'both' ? 'md:grid-cols-2' : 'grid-cols-1'} gap-8`}>
          {/* Morning Routine */}
          {(view === 'both' || view === 'morning') && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-indigo-600">Morning Routine</h2>
              <ul className="space-y-3">
                {dayProducts.map((product, index) => (
                  <li key={index} className="flex items-center gap-3 p-3 border rounded-lg shadow-sm">
                    <span className="font-medium text-gray-500 min-w-[1.5rem]">{index + 1}.</span>
                    {product.imageUrl && (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name[0] || 'Product'}
                        className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                      />
                    )}
                    <span className="text-lg truncate flex-1">{product.name}</span>
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
                {nightProducts.map((product, index) => (
                  <li key={index} className="flex items-center gap-3 p-3 border rounded-lg shadow-sm">
                    <span className="font-medium text-gray-500 min-w-[1.5rem]">{index + 1}.</span>
                    {product.imageUrl && (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name[0] || 'Product'}
                        className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                      />
                    )}
                    <span className="text-lg truncate flex-1">{product.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 