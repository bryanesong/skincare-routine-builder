"use client"

import React from 'react'
import { Check, ChevronsUpDown, X } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/app/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover"
import { cn } from "@/lib/utils"

type FilterOption = {
  value: string
  label: string
}

export default function MultiSelect({ 
  options, 
  placeholder,
  value,
  onChange,
  onItemClick,
}: { 
  options: FilterOption[]
  placeholder: string
  value: FilterOption[]
  onChange: (value: FilterOption[]) => void
  onItemClick?: (item: FilterOption) => void
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="min-w-[200px] justify-between"
          >
            {value.length === 0
              ? placeholder
              : `${value.length} selected`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    onChange(
                      value.some(item => item.value === option.value)
                        ? value.filter(item => item.value !== option.value)
                        : [...value, option]
                    )
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.some(item => item.value === option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map(item => {
            const option = options.find(opt => opt.value === item.value)
            return (
              <span
                key={item.value}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-sm cursor-pointer hover:bg-primary/20"
                onClick={() => onItemClick?.(item)}
              >
                {option?.label}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(value.filter(val => val.value !== option?.value))
                  }}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
} 