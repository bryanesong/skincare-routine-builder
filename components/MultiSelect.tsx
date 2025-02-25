"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
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

interface MultiSelectProps {
  options: FilterOption[]
  placeholder: string
  value: FilterOption[]
  onChange: (value: FilterOption[]) => void
  onItemClick: (item: FilterOption) => void
}

export default function MultiSelect({ 
  options, 
  placeholder,
  value,
  onChange,
  onItemClick 
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="min-w-[200px]">
          {value.length === 0 ? placeholder : `${value.length} selected`}
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
                  onItemClick(option)
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
  )
} 