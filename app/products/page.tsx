'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import dynamic from 'next/dynamic'
import { ChevronLeft, ChevronRight } from "lucide-react"
import { createClient } from '@/utils/supabase/client'

// Dynamically import heavier components
const Header = dynamic(() => import('@/app/components/Header'), { ssr: true })
const Footer = dynamic(() => import('@/app/components/Footer'), { ssr: true })
const ProductCard = dynamic(() => import('@/app/components/ProductCard'))

// Define our product type based on the database schema
interface Product {
  id: string
  brand: string
  name: string
  type: string
  country?: string
  afterUse?: any[] // JSONB array
  ingredients?: any[] // JSONB array
  image_url?: string
  price?: number // Adding this in case you have price data
}

export default function BrowseProducts() {
  const [priceLimit, setPriceLimit] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // For filtering
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSkinType, setSelectedSkinType] = useState('all')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])

  // For pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const productsPerPage = 20
  const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([])

  const router = useRouter()

  // Fetch products from Supabase
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      setError(null)

      try {
        const supabase = createClient()

        const { data, error: supabaseError } = await supabase
          .from('products')
          .select('id, brand, name, type, country, afterUse, ingredients, image_url')

        if (supabaseError) {
          throw supabaseError
        }

        setProducts(data || [])
        setFilteredProducts(data || [])
      } catch (err) {
        console.error('Error fetching products:', err)
        setError('Failed to load products. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Apply filters when any filter changes
  useEffect(() => {
    if (products.length === 0) return

    let filtered = [...products]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.brand.toLowerCase().includes(term)
      )
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      if (selectedCategory.toLowerCase() === 'moisturizer') {
        filtered = filtered.filter(product =>
          product.type.toLowerCase() === 'moisturizer' ||
          product.type.toLowerCase() === 'general moisturizer'
        )
      } else {
        filtered = filtered.filter(product =>
          product.type.toLowerCase() === selectedCategory.toLowerCase()
        )
      }
    }

    // Apply skin type filter
    if (selectedSkinType !== 'all') {
      // Your skin type filtering logic here
    }

    // Apply price filter with single value
    if (priceLimit > 0) {
      filtered = filtered.filter(product =>
        (product.price || 0) <= priceLimit
      )
    }

    setFilteredProducts(filtered)
    setCurrentPage(1)
    setTotalPages(Math.ceil(filtered.length / productsPerPage))
  }, [searchTerm, selectedCategory, selectedSkinType, priceLimit, products])

  // Handle pagination
  useEffect(() => {
    if (filteredProducts.length === 0) {
      setPaginatedProducts([])
      return
    }

    const startIndex = (currentPage - 1) * productsPerPage
    const endIndex = startIndex + productsPerPage
    const currentProducts = filteredProducts.slice(startIndex, endIndex)

    setPaginatedProducts(currentProducts)
  }, [filteredProducts, currentPage, productsPerPage])

  // Handle product card click
  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`)
  }

  // Handle page navigation
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1)
    }
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

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
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="cleanser">Cleanser</SelectItem>
                    <SelectItem value="toner">Toner</SelectItem>
                    <SelectItem value="serum">Serum</SelectItem>
                    <SelectItem value="moisturizer">Moisturizer (All Types)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <h2 className="font-semibold mb-2">Skin Type</h2>
                <Select value={selectedSkinType} onValueChange={setSelectedSkinType}>
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
                <h2 className="font-semibold mb-2">Maximum Price</h2>
                <Slider
                  defaultValue={[0]}
                  max={100}
                  step={1}
                  value={[priceLimit]}
                  onValueChange={(value) => setPriceLimit(value[0])}
                  className="mt-2"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm">$0</span>
                  <span className="text-sm">
                    {priceLimit === 0 ? "No limit" : `$${priceLimit}`}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <div className="mb-6">
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="max-w-md"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4">Loading products...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-500">
                  {error}
                </div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedProducts.length > 0 ? (
                      paginatedProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          id={product.id}
                          name={product.name}
                          brand={product.brand}
                          category={product.type}
                          image={product.image_url || "/placeholder.svg?height=200&width=200"}
                          onClick={() => handleProductClick(product.id)}
                        />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8">
                        No products found matching your criteria. Try adjusting your filters.
                      </div>
                    )}
                  </div>

                  {/* Pagination controls */}
                  {filteredProducts.length > 0 && (
                    <div className="flex justify-center items-center mt-8 space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <div className="flex items-center space-x-1">
                        {/* Show page numbers with ellipsis for large page counts */}
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let pageNum: number;

                          // Logic to determine which page numbers to show
                          if (totalPages <= 5) {
                            // If 5 or fewer pages, show all
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            // If on pages 1-3, show pages 1-5
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            // If on last 3 pages, show last 5 pages
                            pageNum = totalPages - 4 + i;
                          } else {
                            // Otherwise show 2 before and 2 after current page
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              className="w-8 h-8 p-0"
                              onClick={() => goToPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}

                        {/* Show ellipsis if there are more pages */}
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                          <span className="px-2">...</span>
                        )}

                        {/* Always show the last page if there are many pages */}
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                          <Button
                            variant="outline"
                            className="w-8 h-8 p-0"
                            onClick={() => goToPage(totalPages)}
                          >
                            {totalPages}
                          </Button>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Page info */}
                  {filteredProducts.length > 0 && (
                    <div className="text-center text-sm text-gray-500 mt-4">
                      Showing {(currentPage - 1) * productsPerPage + 1} to {Math.min(currentPage * productsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

