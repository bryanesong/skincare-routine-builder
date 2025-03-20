'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Button } from "@/app/components/ui/button"
import { PencilIcon, CheckIcon } from "lucide-react"
import Image from 'next/image'

interface Product {
  id: string
  product_name: string
  product_type?: string
  image_url?: string
}

interface RoutineToggleProps {
  dayProducts: Product[]
  nightProducts: Product[]
  onProductsChange?: (dayProducts: Product[], nightProducts: Product[]) => void
  readOnly?: boolean
}

export default function RoutineToggle({
  dayProducts: initialDayProducts,
  nightProducts: initialNightProducts,
  onProductsChange,
  readOnly = false
}: RoutineToggleProps) {
  const [dayProducts, setDayProducts] = useState(initialDayProducts)
  const [nightProducts, setNightProducts] = useState(initialNightProducts)
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState("day")

  const handleDragEnd = (result: any) => {
    if (!editMode) return

    const { source, destination } = result

    // Dropped outside the list
    if (!destination) return

    // Handle products reordering based on active tab
    if (activeTab === 'day') {
      const newDayProducts = Array.from(dayProducts)
      const [removed] = newDayProducts.splice(source.index, 1)
      newDayProducts.splice(destination.index, 0, removed)

      setDayProducts(newDayProducts)
      if (onProductsChange) {
        onProductsChange(newDayProducts, nightProducts)
      }
    } else {
      const newNightProducts = Array.from(nightProducts)
      const [removed] = newNightProducts.splice(source.index, 1)
      newNightProducts.splice(destination.index, 0, removed)

      setNightProducts(newNightProducts)
      if (onProductsChange) {
        onProductsChange(dayProducts, newNightProducts)
      }
    }
  }

  const toggleEditMode = () => {
    setEditMode(!editMode)
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Tabs
        defaultValue="day"
        onValueChange={(value) => setActiveTab(value)}
      >
        <div className="flex items-center justify-between px-6 pt-4">
          <TabsList>
            <TabsTrigger value="day" className="px-4 py-2">Day Routine</TabsTrigger>
            <TabsTrigger value="night" className="px-4 py-2">Night Routine</TabsTrigger>
          </TabsList>

          {!readOnly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleEditMode}
              className="text-gray-500 hover:text-gray-700"
            >
              {editMode ? (
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

        <DragDropContext onDragEnd={handleDragEnd}>
          <TabsContent value="day" className="px-6 py-4">
            {editMode ? (
              <Droppable droppableId="day-products">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {dayProducts.map((product, index) => (
                      <Draggable
                        key={product.id}
                        draggableId={product.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="border rounded-lg flex items-center bg-gray-50"
                          >
                            <div className="flex-shrink-0 w-10 flex justify-center">
                              <span className="font-bold text-lg text-gray-500">{index + 1}.</span>
                            </div>
                            <div className="flex items-center p-4 flex-1">
                              <div className="mr-4 flex-shrink-0">
                                <div className="w-12 h-12 relative">
                                  {product.image_url ? (
                                    <Image
                                      src={product.image_url}
                                      alt={product.product_name}
                                      fill
                                      style={{ objectFit: 'contain' }}
                                      className="rounded-md"
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
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {dayProducts.length === 0 && (
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-gray-600">No products in your day routine.</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            ) : (
              <div className="space-y-4">
                {dayProducts.map((product, index) => (
                  <div key={product.id} className="border rounded-lg flex items-center">
                    <div className="flex-shrink-0 w-10 flex justify-center">
                      <span className="font-bold text-lg text-gray-500">{index + 1}.</span>
                    </div>
                    <div className="flex items-center p-4 flex-1">
                      <div className="mr-4 flex-shrink-0">
                        <div className="w-12 h-12 relative">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.product_name}
                              fill
                              style={{ objectFit: 'contain' }}
                              className="rounded-md"
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
                {dayProducts.length === 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-600">No products in your day routine.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="night" className="px-6 py-4">
            {editMode ? (
              <Droppable droppableId="night-products">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {nightProducts.map((product, index) => (
                      <Draggable
                        key={product.id}
                        draggableId={product.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="border rounded-lg flex items-center bg-gray-50"
                          >
                            <div className="flex-shrink-0 w-10 flex justify-center">
                              <span className="font-bold text-lg text-gray-500">{index + 1}.</span>
                            </div>
                            <div className="flex items-center p-4 flex-1">
                              <div className="mr-4 flex-shrink-0">
                                <div className="w-12 h-12 relative">
                                  {product.image_url ? (
                                    <Image
                                      src={product.image_url}
                                      alt={product.product_name}
                                      fill
                                      style={{ objectFit: 'contain' }}
                                      className="rounded-md"
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
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {nightProducts.length === 0 && (
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-gray-600">No products in your night routine.</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            ) : (
              <div className="space-y-4">
                {nightProducts.map((product, index) => (
                  <div key={product.id} className="border rounded-lg flex items-center">
                    <div className="flex-shrink-0 w-10 flex justify-center">
                      <span className="font-bold text-lg text-gray-500">{index + 1}.</span>
                    </div>
                    <div className="flex items-center p-4 flex-1">
                      <div className="mr-4 flex-shrink-0">
                        <div className="w-12 h-12 relative">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.product_name}
                              fill
                              style={{ objectFit: 'contain' }}
                              className="rounded-md"
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
                {nightProducts.length === 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-600">No products in your night routine.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </DragDropContext>
      </Tabs>
    </div>
  )
} 