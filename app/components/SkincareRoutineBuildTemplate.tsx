import { CardContent } from "./ui/card"
import { useState, useEffect } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable item component
const SortableItem = ({ id, product, index, isNight = false }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="flex items-center gap-3 p-3 mb-2 bg-white border rounded-md shadow-sm cursor-grab active:cursor-grabbing"
    >
      <span className={`flex items-center justify-center w-6 h-6 text-sm font-medium ${isNight ? 'text-purple-500 bg-purple-100' : 'text-blue-500 bg-blue-100'} rounded-full`}>
        {index + 1}
      </span>
      <img 
        src={product.imageUrl} 
        alt={product.name}
        className="w-10 h-10 rounded-md object-cover"
      />
      <div className="flex-1">
        <div className="font-medium">{product.name}</div>
        <div className="text-sm text-gray-500">{product.type}</div>
      </div>
    </div>
  );
};

export default function SkincareRoutineBuildTemplate({
  skinType, 
  skinConcerns, 
  climate, 
  preferences,
  onRoutineChange
}: {
  skinType: string[], 
  skinConcerns: string[], 
  climate: string[], 
  preferences: {morningProducts: any[], nightProducts: any[]},
  onRoutineChange?: (morningProducts: any[], nightProducts: any[]) => void
}) {
    // Predefined color arrays for each section
    const skinTypeColors = ["bg-[#093C74]", "bg-[#83B0E1]", "bg-[#EAF4F4]"];
    const skinConcernColors = ["bg-pink-500", "bg-pink-400", "bg-rose-500", "bg-red-400", "bg-red-500"];
    const climateColors = ["bg-green-500", "bg-green-400", "bg-emerald-500", "bg-teal-500", "bg-cyan-500"];
     
    // State to manage the ordered products
    const [morningProducts, setMorningProducts] = useState<any[]>([]);
    const [nightProducts, setNightProducts] = useState<any[]>([]);
    
    // Update state when preferences change
    useEffect(() => {
        if (preferences?.morningProducts) {
            // Add a unique identifier to each product to handle duplicates
            const morningWithUniqueIds = preferences.morningProducts.map((product, index) => ({
                ...product,
                uniqueId: `morning-${product.id}-${index}`
            }));
            setMorningProducts(morningWithUniqueIds);
        }
        if (preferences?.nightProducts) {
            // Add a unique identifier to each product to handle duplicates
            const nightWithUniqueIds = preferences.nightProducts.map((product, index) => ({
                ...product,
                uniqueId: `night-${product.id}-${index}`
            }));
            setNightProducts(nightWithUniqueIds);
        }
    }, [preferences]);
    
    // Notify parent component when routines change
    useEffect(() => {
        if (onRoutineChange && morningProducts.length > 0 && nightProducts.length > 0) {
            // Strip out the uniqueId before sending back to parent
            const cleanMorningProducts = morningProducts.map(({ uniqueId, ...product }) => product);
            const cleanNightProducts = nightProducts.map(({ uniqueId, ...product }) => product);
            
            onRoutineChange(cleanMorningProducts, cleanNightProducts);
        }
    }, [morningProducts, nightProducts, onRoutineChange]);
    
    // Set up sensors for drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    
    // Handle morning routine reordering
    const handleMorningDragEnd = (event) => {
        const { active, over } = event;
        
        if (active.id !== over.id) {
            setMorningProducts((items) => {
                const oldIndex = items.findIndex(item => item.uniqueId === active.id);
                const newIndex = items.findIndex(item => item.uniqueId === over.id);
                
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };
    
    // Handle night routine reordering
    const handleNightDragEnd = (event) => {
        const { active, over } = event;
        
        if (active.id !== over.id) {
            setNightProducts((items) => {
                const oldIndex = items.findIndex(item => item.uniqueId === active.id);
                const newIndex = items.findIndex(item => item.uniqueId === over.id);
                
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return (
        <CardContent className="space-y-6 bg-transparent">
            <div>
                <h3 className="font-semibold mb-2">Skin Type</h3>
                <ul className="flex flex-wrap gap-2">
                    {skinType.map((type: string, index: number) => (
                        <li key={type} className="flex items-center">
                            <span className={`inline-block w-3 h-3 rounded-full ${skinTypeColors[index % skinTypeColors.length]} mr-2`}></span>
                            {type}
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h3 className="font-semibold mb-2">Skin Concerns</h3>
                <ul className="flex flex-wrap gap-2">
                    {skinConcerns.map((concern: string, index: number) => (
                        <li key={concern} className="flex items-center">
                            <span className={`inline-block w-3 h-3 rounded-full ${skinConcernColors[index % skinConcernColors.length]} mr-2`}></span>
                            {concern}
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h3 className="font-semibold mb-2">Climate</h3>
                <ul className="flex flex-wrap gap-2">
                    {climate.map((climateItem: string, index: number) => (
                        <li key={climateItem} className="flex items-center">
                            <span className={`inline-block w-3 h-3 rounded-full ${climateColors[index % climateColors.length]} mr-2`}></span>
                            {climateItem}
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h3 className="font-semibold mb-2">Current Routine</h3>
                <p className="text-xs text-gray-500 mb-4">Drag and drop products to reorder your routine</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-sm font-medium mb-2">Morning Routine</h4>
                        <div className="min-h-[100px] p-2 border border-dashed border-gray-200 rounded-lg">
                            {morningProducts.length > 0 ? (
                                <DndContext 
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleMorningDragEnd}
                                >
                                    <SortableContext 
                                        items={morningProducts.map(item => item.uniqueId)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {morningProducts.map((product, index) => (
                                            <SortableItem 
                                                key={product.uniqueId}
                                                id={product.uniqueId}
                                                product={product}
                                                index={index}
                                                isNight={false}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            ) : (
                                <div className="text-center py-4 text-gray-400 text-sm">
                                    No morning products yet
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-sm font-medium mb-2">Night Routine</h4>
                        <div className="min-h-[100px] p-2 border border-dashed border-gray-200 rounded-lg">
                            {nightProducts.length > 0 ? (
                                <DndContext 
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleNightDragEnd}
                                >
                                    <SortableContext 
                                        items={nightProducts.map(item => item.uniqueId)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {nightProducts.map((product, index) => (
                                            <SortableItem 
                                                key={product.uniqueId}
                                                id={product.uniqueId}
                                                product={product}
                                                index={index}
                                                isNight={true}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            ) : (
                                <div className="text-center py-4 text-gray-400 text-sm">
                                    No night products yet
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CardContent>
    )
}

