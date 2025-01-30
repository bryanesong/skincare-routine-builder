import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"

export default function ProductsStep({ formData, onNext }: { formData: any; onNext: (data: any) => void }) {
  const [preferences, setPreferences] = useState(
    formData.preferences || {
      budget: [50],
      naturalIngredients: false,
      fragranceFree: false,
    },
  )

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  const handleNext = () => {
    onNext({ preferences })
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg flex items-start">
        <Info className="w-6 h-6 text-blue-500 mr-2 flex-shrink-0 mt-1" />
        <p className="text-sm text-blue-700">
          Your product preferences help us recommend items that not only suit your skin type and concerns but also align
          with your values and budget.
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Budget (per product)</Label>
          <Slider
            min={10}
            max={200}
            step={10}
            value={Array.isArray(preferences.budget) ? preferences.budget : [50]}
            onValueChange={(value) => handlePreferenceChange("budget", value)}
          />
          <div className="text-sm text-gray-500">${Array.isArray(preferences.budget) ? preferences.budget[0] : 50}</div>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="natural"
            checked={preferences.naturalIngredients}
            onCheckedChange={(checked) => handlePreferenceChange("naturalIngredients", checked)}
          />
          <Label htmlFor="natural">Prefer natural ingredients</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="fragrance-free"
            checked={preferences.fragranceFree}
            onCheckedChange={(checked) => handlePreferenceChange("fragranceFree", checked)}
          />
          <Label htmlFor="fragrance-free">Prefer fragrance-free products</Label>
        </div>
      </div>
      <Button onClick={handleNext}>Next</Button>
    </div>
  )
}

