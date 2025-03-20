'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { Button } from "@/app/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface Product {
    id: string
    brand: string
    name: string
    type: string
    country?: string
    afterUse?: any[]
    ingredients?: any[]
    image_url?: string
}

export default function ProductDetail() {
    const params = useParams()
    const productId = params.id as string
    const router = useRouter()

    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchProduct() {
            setLoading(true)
            setError(null)

            try {
                const supabase = createClient()

                const { data, error: supabaseError } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', productId)
                    .single()

                if (supabaseError) {
                    throw supabaseError
                }

                setProduct(data)
            } catch (err) {
                console.error('Error fetching product:', err)
                setError('Failed to load product details. Please try again.')
            } finally {
                setLoading(false)
            }
        }

        if (productId) {
            fetchProduct()
        }
    }, [productId])

    const handleBack = () => {
        router.back()
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow pt-16 container mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4">Loading product details...</p>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow pt-16 container mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <p className="text-red-500">{error || 'Product not found'}</p>
                        <Button onClick={handleBack} className="mt-4" variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow pt-16">
                <div className="container mx-auto px-4 py-8">
                    <Button onClick={handleBack} variant="outline" className="mb-6">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
                    </Button>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="relative h-[400px] md:h-[500px] bg-gray-100 rounded-lg overflow-hidden">
                            {product.image_url ? (
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-contain"
                                    onError={(e) => {
                                        e.currentTarget.src = "/placeholder.svg?height=400&width=400"
                                    }}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-400">No image available</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="mb-8">
                                <p className="text-lg text-gray-600 uppercase">{product.brand}</p>
                                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                                <p className="text-xl mb-4">{product.type}</p>
                                {product.country && (
                                    <p className="text-gray-600">Origin: {product.country}</p>
                                )}
                            </div>

                            {product.ingredients && product.ingredients.length > 0 && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {product.ingredients.map((ingredient, index) => (
                                            <li key={index} className="text-gray-700">{ingredient}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {product.afterUse && product.afterUse.length > 0 && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold mb-2">After Use Effects</h2>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {product.afterUse.map((effect, index) => (
                                            <li key={index} className="text-gray-700">{effect}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
} 