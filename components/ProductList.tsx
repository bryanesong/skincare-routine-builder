'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import ProductCard from './ProductCard'

export default function ProductList() {
  const [priceRange, setPriceRange] = useState([0, 100])

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cleanser">Cleanser</SelectItem>
                  <SelectItem value="toner">Toner</SelectItem>
                  <SelectItem value="serum">Serum</SelectItem>
                  <SelectItem value="moisturizer">Moisturizer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Skin Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="dry">Dry</SelectItem>
                  <SelectItem value="oily">Oily</SelectItem>
                  <SelectItem value="combination">Combination</SelectItem>
                  <SelectItem value="sensitive">Sensitive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Input type="search" placeholder="Search products..." />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium">Price Range: ${priceRange[0]} - ${priceRange[1]}</label>
            <Slider
              defaultValue={[0, 100]}
              max={100}
              step={1}
              value={priceRange}
              onValueChange={setPriceRange}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ProductCard
          name="Gentle Foaming Cleanser"
          brand="SkinCare Co"
          price={24.99}
          rating={4.5}
          reviews={128}
          image="/placeholder.svg?height=200&width=200"
          category="Cleanser"
          skinType={["Normal", "Sensitive"]}
        />
        <ProductCard
          name="Hydrating Toner"
          brand="Pure Beauty"
          price={19.99}
          rating={4.2}
          reviews={85}
          image="/placeholder.svg?height=200&width=200"
          category="Toner"
          skinType={["Dry", "Normal"]}
        />
        <ProductCard
          name="Vitamin C Serum"
          brand="Glow Labs"
          price={45.99}
          rating={4.8}
          reviews={256}
          image="/placeholder.svg?height=200&width=200"
          category="Serum"
          skinType={["All"]}
        />
      </div>
    </div>
  )
}

