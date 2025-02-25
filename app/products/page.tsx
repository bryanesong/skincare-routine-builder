'use client'

import { useState } from 'react'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { Slider } from "../components/ui/slider"
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import ProductCard from '@/app/components/ProductCard'

export default function BrowseProducts() {
  const [priceRange, setPriceRange] = useState([0, 100])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 text-center animate-fade-in">Browse Products</h1>
          <div className="grid lg:grid-cols-[250px_1fr] gap-8">
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="font-semibold mb-2">Category</h2>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="cleanser">Cleanser</SelectItem>
                    <SelectItem value="toner">Toner</SelectItem>
                    <SelectItem value="serum">Serum</SelectItem>
                    <SelectItem value="moisturizer">Moisturizer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <h2 className="font-semibold mb-2">Skin Type</h2>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Skin Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Skin Types</SelectItem>
                    <SelectItem value="dry">Dry</SelectItem>
                    <SelectItem value="oily">Oily</SelectItem>
                    <SelectItem value="combination">Combination</SelectItem>
                    <SelectItem value="sensitive">Sensitive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <h2 className="font-semibold mb-2">Price Range</h2>
                <Slider
                  defaultValue={[0, 100]}
                  max={100}
                  step={1}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mt-2"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm">${priceRange[0]}</span>
                  <span className="text-sm">${priceRange[1]}+</span>
                </div>
              </div>
              <Button className="w-full">Apply Filters</Button>
            </div>
            <div>
              <div className="mb-6">
                <Input type="search" placeholder="Search products..." className="max-w-md" />
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: "Gentle Foaming Cleanser", brand: "SkinCare Co", price: 24.99, rating: 4.5, reviews: 128, image: "/placeholder.svg?height=200&width=200", category: "Cleanser", skinType: ["Normal", "Sensitive"] },
                  { name: "Hydrating Toner", brand: "Pure Beauty", price: 19.99, rating: 4.2, reviews: 85, image: "/placeholder.svg?height=200&width=200", category: "Toner", skinType: ["Dry", "Normal"] },
                  { name: "Vitamin C Serum", brand: "Glow Labs", price: 45.99, rating: 4.8, reviews: 256, image: "/placeholder.svg?height=200&width=200", category: "Serum", skinType: ["All"] },
                  { name: "Moisturizing Cream", brand: "Hydra Plus", price: 32.99, rating: 4.6, reviews: 178, image: "/placeholder.svg?height=200&width=200", category: "Moisturizer", skinType: ["Dry", "Normal", "Combination"] },
                  { name: "Oil-Free Moisturizer", brand: "Clear Skin", price: 28.99, rating: 4.3, reviews: 112, image: "/placeholder.svg?height=200&width=200", category: "Moisturizer", skinType: ["Oily", "Combination"] },
                  { name: "Exfoliating Toner", brand: "Renew You", price: 22.99, rating: 4.4, reviews: 95, image: "/placeholder.svg?height=200&width=200", category: "Toner", skinType: ["Normal", "Oily"] },
                ].map((product, index) => (
                  <ProductCard key={index} {...product} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

