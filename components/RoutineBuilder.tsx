'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

export default function RoutineBuilder() {
  const router = useRouter()
  const [skinType, setSkinType] = useState('')
  const [concerns, setConcerns] = useState<string[]>([])

  const handleConcernChange = (concern: string) => {
    setConcerns(prev => 
      prev.includes(concern) 
        ? prev.filter(c => c !== concern)
        : [...prev, concern]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams({ skinType, concerns: concerns.join(',') })
    router.push(`/routine/results?${params.toString()}`)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Tell us about your skin</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>What's your skin type?</Label>
            <RadioGroup value={skinType} onValueChange={setSkinType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dry" id="dry" />
                <Label htmlFor="dry">Dry</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="oily" id="oily" />
                <Label htmlFor="oily">Oily</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="combination" id="combination" />
                <Label htmlFor="combination">Combination</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="normal" />
                <Label htmlFor="normal">Normal</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label>What are your main skin concerns? (Select all that apply)</Label>
            <div className="grid grid-cols-2 gap-2">
              {['Acne', 'Aging', 'Dryness', 'Dullness', 'Uneven texture', 'Hyperpigmentation'].map((concern) => (
                <div key={concern} className="flex items-center space-x-2">
                  <Checkbox 
                    id={concern} 
                    checked={concerns.includes(concern)}
                    onCheckedChange={() => handleConcernChange(concern)}
                  />
                  <Label htmlFor={concern}>{concern}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">Build My Routine</Button>
        </CardFooter>
      </form>
    </Card>
  )
}

