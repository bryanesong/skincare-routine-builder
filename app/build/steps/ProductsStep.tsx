import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import { Slider } from "../../components/ui/slider"
import { Switch } from "../../components/ui/switch"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Info } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

const placeholder_image = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXxZR0_1ISIJx_T4oB5-5OJVSNgSMFLe8eCw&s'
// Add this mock data at the top of the file
const MOCK_PRODUCTS = [
    { id: 1, name: "Gentle Foaming Cleanser", type: "Cleanser", routine: "both", imageUrl: placeholder_image },
    { id: 2, name: "Vitamin C Serum", type: "Serum", routine: "morning", imageUrl: placeholder_image },
    { id: 3, name: "Hydrating Moisturizer SPF 30", type: "Moisturizer", routine: "morning", imageUrl: placeholder_image },
    { id: 4, name: "Retinol Night Cream", type: "Cream", routine: "night", imageUrl: placeholder_image },
    { id: 5, name: "Niacinamide Serum", type: "Serum", routine: "both", imageUrl: placeholder_image },
    { id: 6, name: "AHA/BHA Exfoliant", type: "Exfoliant", routine: "night", imageUrl: placeholder_image },
]

interface Product {
    id: number
    name: string
    type: string
    routine: string
    imageUrl: string
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
    const [filteredProducts, setFilteredProducts] = useState<typeof MOCK_PRODUCTS>([])
    const [morningProducts, setMorningProducts] = useState<Product[]>([])
    const [nightProducts, setNightProducts] = useState<Product[]>([])

    useEffect(() => {
        const searchTerm = showMorningSearch ? morningSearchTerm : nightSearchTerm
        const routine = showMorningSearch ? 'morning' : 'night'
        
        if (searchTerm.length > 0) {
            const filtered = MOCK_PRODUCTS.filter(product => 
                (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.type.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (product.routine === routine || product.routine === 'both')
            )
            setFilteredProducts(filtered)
        } else {
            setFilteredProducts([])
        }
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
            setShowNightSearch(false) // Close night search if open
        } else {
            setShowNightSearch(!showNightSearch)
            setShowMorningSearch(false) // Close morning search if open
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
                                        src={item.imageUrl} 
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

    // This exposes the getData method to the parent component
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
                            
                            {filteredProducts.length > 0 && (
                                <div className="absolute w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto z-10">
                                    {filteredProducts.map((product) => (
                                        <button
                                            key={product.id}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                                            onClick={() => handleProductSelect(product)}
                                        >
                                            <div className="font-medium">{product.name}</div>
                                            <div className="text-sm text-gray-500">{product.type}</div>
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

