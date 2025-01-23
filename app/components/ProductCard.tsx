import Image from 'next/image'
import { Card, CardContent, CardFooter } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Star } from 'lucide-react'

interface ProductCardProps {
  name: string
  brand: string
  price: number
  rating: number
  reviews: number
  image: string
  category: string
  skinType: string[]
}

export default function ProductCard({
  name,
  brand,
  price,
  rating,
  reviews,
  image,
  category,
  skinType
}: ProductCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in">
      <div className="relative h-48">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="text-sm text-gray-500">{brand}</div>
          <h3 className="font-semibold">{name}</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="ml-1 text-sm font-medium">{rating}</span>
            </div>
            <span className="text-sm text-gray-500">({reviews} reviews)</span>
          </div>
          <div className="text-sm space-x-2">
            <span className="font-medium">{category}</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-500">{skinType.join(", ")}</span>
          </div>
          <div className="font-bold text-lg">${price.toFixed(2)}</div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full">Add to Routine</Button>
      </CardFooter>
    </Card>
  )
}

