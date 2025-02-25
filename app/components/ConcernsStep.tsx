import { useState } from "react"
import { Checkbox } from "../components/ui/checkbox"
import { Label } from "../components/ui/label"
import { Button } from "../components/ui/button"
import { Info } from "lucide-react"

const skinConcerns = [
  { value: "acne", label: "Acne" },
  { value: "aging", label: "Aging" },
  { value: "dryness", label: "Dryness" },
  { value: "dullness", label: "Dullness" },
  { value: "uneven-texture", label: "Uneven Texture" },
  { value: "hyperpigmentation", label: "Hyperpigmentation" },
]

export default function ConcernsStep({ formData, onNext }: { formData: any; onNext: (data: any) => void }) {
  const [concerns, setConcerns] = useState<string[]>(formData.concerns || [])

  const handleConcernChange = (concern: string) => {
    setConcerns((prev) => (prev.includes(concern) ? prev.filter((c) => c !== concern) : [...prev, concern]))
  }

  const handleNext = () => {
    if (concerns.length > 0) {
      onNext({ concerns })
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg flex items-start">
        <Info className="w-6 h-6 text-blue-500 mr-2 flex-shrink-0 mt-1" />
        <p className="text-sm text-blue-700">
          Identifying your specific skin concerns helps in targeting problem areas and selecting products with the right
          active ingredients to address these issues.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {skinConcerns.map((concern) => (
          <div key={concern.value} className="flex items-center space-x-2">
            <Checkbox
              id={concern.value}
              checked={concerns.includes(concern.value)}
              onCheckedChange={() => handleConcernChange(concern.value)}
            />
            <Label htmlFor={concern.value}>{concern.label}</Label>
          </div>
        ))}
      </div>
      <Button onClick={handleNext} disabled={concerns.length === 0}>
        Next
      </Button>
    </div>
  )
}

