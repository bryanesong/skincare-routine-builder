'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import { Search } from "lucide-react"

interface BuildsSearchBarProps {
    initialValue?: string
    placeholder?: string
    onSearch?: (searchTerm: string) => void // Optional callback for direct handling
}

export default function BuildsSearchBar({
    initialValue = '',
    placeholder = "Search builds by name, products, skin concerns...",
    onSearch
}: BuildsSearchBarProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [searchTerm, setSearchTerm] = useState(initialValue)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // If onSearch prop is provided, use it (useful for Pages Router or custom handling)
        if (onSearch) {
            onSearch(searchTerm)
            return
        }

        // Create a new URLSearchParams object
        const params = new URLSearchParams()

        // Preserve existing query parameters
        searchParams.forEach((value, key) => {
            if (key !== 'search') { // Skip the old search param
                params.append(key, value)
            }
        })

        // Update or remove the search parameter
        if (searchTerm) {
            params.set('search', searchTerm)
        }

        // Navigate with updated search params
        router.push(`/builds?${params.toString()}`)
    }

    return (
        <form onSubmit={handleSubmit} className="w-full mb-6">
            <div className="relative flex items-center">
                <Input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-12 focus-visible:ring-offset-0"
                />
                <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 h-full rounded-l-none"
                >
                    <Search className="h-4 w-4" />
                </Button>
            </div>
        </form>
    )
} 