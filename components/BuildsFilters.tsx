"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import MultiSelect from "@/components/MultiSelect"

type FilterOption = {
  value: string
  label: string
}

interface BuildsFiltersProps {
  skinTypes: FilterOption[]
  climateTypes: FilterOption[]
  skinConcerns: FilterOption[]
  onFiltersChange: (filters: {
    skinTypes: string[]
    climateTypes: string[]
    skinConcerns: string[]
  }) => void
}

export default function BuildsFilters({ 
  skinTypes, 
  climateTypes, 
  skinConcerns,
  onFiltersChange 
}: BuildsFiltersProps) {
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<FilterOption[]>([])
  const [selectedClimates, setSelectedClimates] = useState<FilterOption[]>([])
  const [selectedConcerns, setSelectedConcerns] = useState<FilterOption[]>([])

  const handleFiltersUpdate = (
    newSkinTypes = selectedSkinTypes,
    newClimates = selectedClimates,
    newConcerns = selectedConcerns
  ) => {
    onFiltersChange?.({
      skinTypes: newSkinTypes.map(type => type.value),
      climateTypes: newClimates.map(climate => climate.value),
      skinConcerns: newConcerns.map(concern => concern.value)
    })
  }

  const updateSkinTypes = (newValue: FilterOption[]) => {
    setSelectedSkinTypes(newValue)
    handleFiltersUpdate(newValue)
  }

  const updateClimates = (newValue: FilterOption[]) => {
    setSelectedClimates(newValue)
    handleFiltersUpdate(undefined, newValue)
  }

  const updateConcerns = (newValue: FilterOption[]) => {
    setSelectedConcerns(newValue)
    handleFiltersUpdate(undefined, undefined, newValue)
  }

  const handleItemClick = (item: FilterOption) => {
    console.log('Clicked item:', item)
    // Add any click handling logic here
  }

  return (
    <div className="mb-8 space-y-4">
      <Input
        type="search"
        placeholder="Search routines..."
        className="w-full max-w-2xl mx-auto"
      />
      <div className="flex flex-wrap gap-4 justify-center">
        <MultiSelect
          options={skinTypes}
          placeholder="Skin Type"
          value={selectedSkinTypes}
          onChange={updateSkinTypes}
          onItemClick={handleItemClick}
        />
        <MultiSelect
          options={climateTypes}
          placeholder="Climate"
          value={selectedClimates}
          onChange={updateClimates}
          onItemClick={handleItemClick}
        />
        <MultiSelect
          options={skinConcerns}
          placeholder="Skin Concerns"
          value={selectedConcerns}
          onChange={updateConcerns}
          onItemClick={handleItemClick}
        />
      </div>
      
      {/* Display selected filters */}
      <div className="flex flex-wrap gap-2 justify-center">
        {selectedSkinTypes.map(type => (
          <span key={type.value} className="px-3 py-1 bg-primary/10 rounded-full text-sm">
            {type.label}
          </span>
        ))}
        {selectedClimates.map(climate => (
          <span key={climate.value} className="px-3 py-1 bg-primary/10 rounded-full text-sm">
            {climate.label}
          </span>
        ))}
        {selectedConcerns.map(concern => (
          <span key={concern.value} className="px-3 py-1 bg-primary/10 rounded-full text-sm">
            {concern.label}
          </span>
        ))}
      </div>
    </div>
  )
} 