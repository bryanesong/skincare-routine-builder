import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import { Slider } from "../../components/ui/slider"
import { Switch } from "../../components/ui/switch"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Info } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { createClient } from '@/utils/supabase/client'

const placeholder_image = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXxZR0_1ISIJx_T4oB5-5OJVSNgSMFLe8eCw&s'

interface Product {
    id: string
    brand: string
    name: string
    type: string
    image_url?: string
    ingredients?: any[]
    afterUse?: any[]
    country?: string
}

interface ProductsStepProps {
    formData: any;
    onNext: (data: any) => void;
}

const ProductsStep = forwardRef<any, ProductsStepProps>((props, ref) => {
    const { formData, onNext } = props
    const [preferences, setPreferences] = useState(
        formData.preferences || {
            budget: [50],
            naturalIngredients: false,
            fragranceFree: false,
        },
    )
    const [showMorningSearch, setShowMorningSearch] = useState(false)
    const [showNightSearch, setShowNightSearch] = useState(false)
    const [morningSearchTerm, setMorningSearchTerm] = useState("")
    const [nightSearchTerm, setNightSearchTerm] = useState("")
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
    const [morningProducts, setMorningProducts] = useState<Product[]>([])
    const [nightProducts, setNightProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const searchProducts = async () => {
            const searchTerm = showMorningSearch ? morningSearchTerm : nightSearchTerm

            if (searchTerm.length === 0) {
                setFilteredProducts([])
                return
            }

            setIsLoading(true)
            setError(null)

            try {
                const supabase = createClient()

                const { data, error } = await supabase
                    .from('products')
                    .select('id, brand, name, type, image_url')
                    .or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,type.ilike.%${searchTerm}%`)
                    .limit(10)

                if (error) throw error

                const transformedProducts = data.map(product => ({
                    ...product,
                    imageUrl: product.image_url || placeholder_image,
                    routine: 'both'
                }))

                setFilteredProducts(transformedProducts)
            } catch (err) {
                console.error('Error fetching products:', err)
                setError('Failed to load products')
                setFilteredProducts([])
            } finally {
                setIsLoading(false)
            }
        }

        const timeoutId = setTimeout(searchProducts, 300)

        return () => clearTimeout(timeoutId)
    }, [morningSearchTerm, nightSearchTerm, showMorningSearch, showNightSearch])

    const handlePreferenceChange = (key: string, value: any) => {
        setPreferences((prev) => ({ ...prev, [key]: value }))
    }

    const handleNext = () => {
        onNext({ preferences })
    }

    const handleRoutineClick = (routine: 'morning' | 'night') => {
        if (routine === 'morning') {
            setShowMorningSearch(!showMorningSearch)
            setShowNightSearch(false)
        } else {
            setShowNightSearch(!showNightSearch)
            setShowMorningSearch(false)
        }
    }

    const handleProductSelect = (product: Product) => {
        if (showMorningSearch) {
            setMorningProducts([...morningProducts, product])
            setMorningSearchTerm('')
        } else {
            setNightProducts([...nightProducts, product])
            setNightSearchTerm('')
        }
        setFilteredProducts([])
    }

    const handleDragEnd = (result: any, routineType: 'morning' | 'night') => {
        if (!result.destination) return

        const items = routineType === 'morning' ? [...morningProducts] : [...nightProducts]
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)

        if (routineType === 'morning') {
            setMorningProducts(items)
        } else {
            setNightProducts(items)
        }
    }

    const ProductList = ({ items, routineType }: { items: Product[], routineType: 'morning' | 'night' }) => (
        <Droppable droppableId={`${routineType}-list`}>
            {(provided) => (
                <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="w-full max-w-md mt-4"
                >
                    {items.map((item, index) => (
                        <Draggable
                            key={`${item.id}-${index}`}
                            draggableId={`${item.id}-${index}`}
                            index={index}
                        >
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="flex items-center gap-3 p-3 mb-2 bg-white border rounded-md shadow-sm"
                                >
                                    <span className="flex items-center justify-center w-6 h-6 text-sm font-medium text-gray-500 bg-gray-100 rounded-full">
                                        {index + 1}
                                    </span>
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-10 h-10 rounded-md object-cover"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-sm text-gray-500">{item.type}</div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const newItems = routineType === 'morning'
                                                ? morningProducts.filter((_, i) => i !== index)
                                                : nightProducts.filter((_, i) => i !== index)
                                            routineType === 'morning'
                                                ? setMorningProducts(newItems)
                                                : setNightProducts(newItems)
                                        }}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    )

    useImperativeHandle(ref, () => ({
        getData: () => ({
            morningProducts,
            nightProducts
        })
    }))

    return (
        <div className="space-y-6 text-center">
            <div className="max-w-4xl mx-auto">
                <p className="font-bold text-lg">
                    Now, tell us about your current routine:
                </p>
                <p className="text-gray-400 italic text-sm transition-colors">
                    Click the tabs below to specify your routine, if it applies.
                </p>

                <div className="flex flex-col items-center gap-6">
                    <div className="flex justify-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => handleRoutineClick('morning')}
                            className={`w-40 ${showMorningSearch ? 'ring-2 ring-blue-500' : ''}`}
                        >
                            Morning Routine
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleRoutineClick('night')}
                            className={`w-40 ${showNightSearch ? 'ring-2 ring-blue-500' : ''}`}
                        >
                            Night Routine
                        </Button>
                    </div>

                    {(showMorningSearch || showNightSearch) && (
                        <div className="relative w-80">
                            <input
                                type="text"
                                placeholder={`Search ${showMorningSearch ? 'morning' : 'night'} routine products...`}
                                value={showMorningSearch ? morningSearchTerm : nightSearchTerm}
                                onChange={(e) => showMorningSearch
                                    ? setMorningSearchTerm(e.target.value)
                                    : setNightSearchTerm(e.target.value)
                                }
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            {isLoading && (
                                <div className="absolute right-3 top-2.5">
                                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}

                            {error && (
                                <div className="absolute w-full mt-1 bg-red-50 border border-red-200 rounded-md p-2 text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            {filteredProducts.length > 0 && !isLoading && (
                                <div className="absolute w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto z-10">
                                    {filteredProducts.map((product) => (
                                        <button
                                            key={product.id}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 flex items-center gap-3"
                                            onClick={() => handleProductSelect(product)}
                                        >
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-10 h-10 rounded-md object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = placeholder_image
                                                }}
                                            />
                                            <div>
                                                <div className="font-medium">{product.brand} {product.name}</div>
                                                <div className="text-sm text-gray-500">{product.type}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {(morningProducts.length > 0 || nightProducts.length > 0) && (
                    <DragDropContext onDragEnd={(result) => handleDragEnd(result, showMorningSearch ? 'morning' : 'night')}>
                        <div className="mt-8 flex justify-center gap-8">
                            <div className={`w-96 ${!morningProducts.length ? 'opacity-50' : ''}`}>
                                <h3 className="text-lg font-medium mb-3">Morning Routine Order:</h3>
                                {morningProducts.length > 0 ? (
                                    <ProductList items={morningProducts} routineType="morning" />
                                ) : (
                                    <div className="p-4 border-2 border-dashed rounded-md text-gray-400">
                                        No morning products added
                                    </div>
                                )}
                            </div>

                            <div className={`w-96 ${!nightProducts.length ? 'opacity-50' : ''}`}>
                                <h3 className="text-lg font-medium mb-3">Night Routine Order:</h3>
                                {nightProducts.length > 0 ? (
                                    <ProductList items={nightProducts} routineType="night" />
                                ) : (
                                    <div className="p-4 border-2 border-dashed rounded-md text-gray-400">
                                        No night products added
                                    </div>
                                )}
                            </div>
                        </div>
                    </DragDropContext>
                )}
            </div>
        </div>
    );
})

ProductsStep.displayName = 'ProductsStep'

export default ProductsStep

