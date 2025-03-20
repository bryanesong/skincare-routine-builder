'use client'

import React, { useState } from 'react'
import { Button } from "@/app/components/ui/button"
import { PencilIcon, CheckIcon } from "lucide-react"
import Image from 'next/image'
import { useUser } from '@/app/context/user-provider'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Import the styles if any are needed from SkincareRoutineBuildTemplate
// import styles from '...'

interface Product {
    id: string
    product_name: string
    product_type?: string
    image_url?: string
    uniqueId?: string // Added for dnd-kit
}

interface RoutineDisplayProps {
    dayProducts: Product[]
    nightProducts: Product[]
    ownerId: string
    onProductsChange?: (dayProducts: Product[], nightProducts: Product[]) => void
}

// SortableItem component for individual products
function SortableItem({ product, index, isEditing }: {
    product: Product,
    index: number,
    isEditing: boolean
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: product.uniqueId || product.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
        opacity: isDragging ? 0.8 : 1,
        cursor: isEditing ? 'grab' : 'default'
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`border rounded-lg flex items-center mb-2 ${isDragging ? 'shadow-md bg-gray-100' : ''} ${isEditing ? 'bg-gray-50' : ''}`}
            {...(isEditing ? { ...attributes, ...listeners } : {})}
        >
            <div className="flex-shrink-0 w-10 flex justify-center">
                <span className="font-bold text-lg text-gray-500">{index + 1}.</span>
            </div>
            <div className="flex items-center p-4 flex-1">
                <div className="mr-4 flex-shrink-0">
                    <div className="w-12 h-12">
                        {product.image_url ? (
                            <img
                                src={product.image_url}
                                alt={product.product_name}
                                className="w-12 h-12 object-contain rounded-md"
                            />
                        ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No image</span>
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    <p className="font-medium">{product.product_name}</p>
                </div>
            </div>
        </div>
    )
}

export default function RoutineDisplay({
    dayProducts: initialDayProducts,
    nightProducts: initialNightProducts,
    ownerId,
    onProductsChange
}: RoutineDisplayProps) {
    // Ensure all products have uniqueId for dnd-kit
    const addUniqueIds = (products: Product[], prefix: string) => {
        return products.map(product => ({
            ...product,
            uniqueId: product.uniqueId || `${prefix}-${product.id}`
        }))
    }

    const [dayProducts, setDayProducts] = useState<Product[]>(
        addUniqueIds(initialDayProducts || [], 'day')
    )
    const [nightProducts, setNightProducts] = useState<Product[]>(
        addUniqueIds(initialNightProducts || [], 'night')
    )
    const [dayEditMode, setDayEditMode] = useState(false)
    const [nightEditMode, setNightEditMode] = useState(false)
    const { user } = useUser() // Get current user

    const isOwner = user?.id === ownerId

    // Set up sensors for dnd-kit
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // Handle morning routine drag end
    const handleMorningDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setDayProducts((items) => {
                const oldIndex = items.findIndex(item => (item.uniqueId || item.id) === active.id)
                const newIndex = items.findIndex(item => (item.uniqueId || item.id) === over.id)

                const newItems = arrayMove(items, oldIndex, newIndex)

                // Call the callback if provided
                if (onProductsChange) {
                    // Remove uniqueId when sending back to parent
                    const cleanItems = newItems.map(({ uniqueId, ...rest }) => rest)
                    onProductsChange(cleanItems, nightProducts)
                }

                return newItems
            })
        }
    }

    // Handle night routine drag end
    const handleNightDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setNightProducts((items) => {
                const oldIndex = items.findIndex(item => (item.uniqueId || item.id) === active.id)
                const newIndex = items.findIndex(item => (item.uniqueId || item.id) === over.id)

                const newItems = arrayMove(items, oldIndex, newIndex)

                // Call the callback if provided
                if (onProductsChange) {
                    // Remove uniqueId when sending back to parent
                    const cleanItems = newItems.map(({ uniqueId, ...rest }) => rest)
                    onProductsChange(dayProducts, cleanItems)
                }

                return newItems
            })
        }
    }

    // Toggle edit modes
    const toggleDayEditMode = () => setDayEditMode(!dayEditMode)
    const toggleNightEditMode = () => setNightEditMode(!nightEditMode)

    return (
        <div className="space-y-8">
            {/* Day Routine Section */}
            <div className="border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 bg-pink-50">
                    <h2 className="text-lg font-medium text-pink-600">Day Routine</h2>

                    {isOwner && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleDayEditMode}
                            className="text-pink-600 hover:text-pink-700 hover:bg-pink-100"
                        >
                            {dayEditMode ? (
                                <>
                                    <CheckIcon className="h-4 w-4 mr-1" />
                                    Done
                                </>
                            ) : (
                                <>
                                    <PencilIcon className="h-4 w-4 mr-1" />
                                    Edit
                                </>
                            )}
                        </Button>
                    )}
                </div>

                <div className="px-6 py-4">
                    {dayEditMode && (
                        <p className="text-xs text-gray-500 mb-4">Drag and drop products to reorder your routine</p>
                    )}

                    {dayProducts.length > 0 ? (
                        dayEditMode ? (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleMorningDragEnd}
                            >
                                <SortableContext
                                    items={dayProducts.map(item => item.uniqueId || item.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {dayProducts.map((product, index) => (
                                        <SortableItem
                                            key={product.uniqueId || product.id}
                                            product={product}
                                            index={index}
                                            isEditing={dayEditMode}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        ) : (
                            <div className="space-y-2">
                                {dayProducts.map((product, index) => (
                                    <div
                                        key={product.id}
                                        className="border rounded-lg flex items-center"
                                    >
                                        <div className="flex-shrink-0 w-10 flex justify-center">
                                            <span className="font-bold text-lg text-gray-500">{index + 1}.</span>
                                        </div>
                                        <div className="flex items-center p-4 flex-1">
                                            <div className="mr-4 flex-shrink-0">
                                                <div className="w-12 h-12">
                                                    {product.image_url ? (
                                                        <img
                                                            src={product.image_url}
                                                            alt={product.product_name}
                                                            className="w-12 h-12 object-contain rounded-md"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                                                            <span className="text-gray-400 text-xs">No image</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-medium">{product.product_name}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        <div className="p-4 bg-gray-50 rounded-lg text-center">
                            <p className="text-gray-600">No products in your day routine.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Night Routine Section */}
            <div className="border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 bg-indigo-50">
                    <h2 className="text-lg font-medium text-indigo-600">Night Routine</h2>

                    {isOwner && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleNightEditMode}
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100"
                        >
                            {nightEditMode ? (
                                <>
                                    <CheckIcon className="h-4 w-4 mr-1" />
                                    Done
                                </>
                            ) : (
                                <>
                                    <PencilIcon className="h-4 w-4 mr-1" />
                                    Edit
                                </>
                            )}
                        </Button>
                    )}
                </div>

                <div className="px-6 py-4">
                    {nightEditMode && (
                        <p className="text-xs text-gray-500 mb-4">Drag and drop products to reorder your routine</p>
                    )}

                    {nightProducts.length > 0 ? (
                        nightEditMode ? (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleNightDragEnd}
                            >
                                <SortableContext
                                    items={nightProducts.map(item => item.uniqueId || item.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {nightProducts.map((product, index) => (
                                        <SortableItem
                                            key={product.uniqueId || product.id}
                                            product={product}
                                            index={index}
                                            isEditing={nightEditMode}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        ) : (
                            <div className="space-y-2">
                                {nightProducts.map((product, index) => (
                                    <div
                                        key={product.id}
                                        className="border rounded-lg flex items-center"
                                    >
                                        <div className="flex-shrink-0 w-10 flex justify-center">
                                            <span className="font-bold text-lg text-gray-500">{index + 1}.</span>
                                        </div>
                                        <div className="flex items-center p-4 flex-1">
                                            <div className="mr-4 flex-shrink-0">
                                                <div className="w-12 h-12">
                                                    {product.image_url ? (
                                                        <img
                                                            src={product.image_url}
                                                            alt={product.product_name}
                                                            className="w-12 h-12 object-contain rounded-md"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                                                            <span className="text-gray-400 text-xs">No image</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-medium">{product.product_name}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        <div className="p-4 bg-gray-50 rounded-lg text-center">
                            <p className="text-gray-600">No products in your night routine.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 