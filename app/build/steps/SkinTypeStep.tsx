import { useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"

const skinTypes = [
    { value: "normal", label: "Normal" },
    { value: "dry", label: "Dry" },
    { value: "oily", label: "Oily" },
    { value: "combination", label: "Combination" },
    { value: "sensitive", label: "Sensitive" },
]

export default function SkinTypeStep({ formData, onNext }: { formData: any; onNext: (data: any) => void }) {
    const [skinType, setSkinType] = useState(formData.skinType || "")

    const handleNext = () => {
        if (skinType) {
            onNext({ skinType })
        }
    }

    return (
        <div className="space-y-6 bg-blue-500">
            <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                <Info className="w-6 h-6 text-blue-500 mr-2 flex-shrink-0 mt-1" />
                <p className="text-sm text-blue-700">
                    Understanding your skin type is crucial for selecting the right products. Different skin types have different
                    needs and react differently to various ingredients.
                </p>
            </div>
            <RadioGroup value={skinType} onValueChange={setSkinType}>
                {skinTypes.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={type.value} id={type.value} />
                        <Label htmlFor={type.value}>{type.label}</Label>
                    </div>
                ))}
            </RadioGroup>
            <Button onClick={handleNext} disabled={!skinType}>
                Next
            </Button>
        </div>
    )
}

