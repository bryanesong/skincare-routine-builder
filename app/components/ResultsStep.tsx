import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import Link from "next/link"

export default function ResultsStep({ formData }: { formData: any }) {
  // This is a placeholder for the actual routine generation logic
  const generateRoutine = (data: any) => {
    return [
      { step: "Cleanse", product: "Gentle Foaming Cleanser" },
      { step: "Tone", product: "Balancing Toner" },
      { step: "Treat", product: "Vitamin C Serum" },
      { step: "Moisturize", product: "Hydrating Gel Cream" },
      { step: "Protect", product: "Broad Spectrum SPF 50" },
    ]
  }

  const routine = generateRoutine(formData)

  return (
    <div className="space-y-6">
      <p className="text-lg text-center">
        Based on your skin type, concerns, and preferences, here's your personalized skincare routine:
      </p>
      <div className="space-y-4">
        {routine.map((item, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{item.step}</CardTitle>
              <CardDescription>Step {index + 1}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{item.product}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-center space-x-4">
        <Button asChild>
          <Link href="/products">Shop Products</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/builds">Save Routine</Link>
        </Button>
      </div>
    </div>
  )
}

