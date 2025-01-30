"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import SkinTypeStep from "./steps/SkinTypeStep"
import ClimateStep from "./steps/ClimateStep"
import ProductsStep from "./steps/ProductsStep"
import ResultsStep from "./steps/ResultsStep"
import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"
import { createClient } from '@supabase/supabase-js'

const steps = [
  { id: "skin-type", title: "Skin Type", component: SkinTypeStep },
  { id: "climate", title: "Climate", component: ClimateStep },
  { id: "products", title: "Product Preferences", component: ProductsStep },
]

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface FormData {
  skinType: string[];
  skinConcerns: string[];
  climate: string[];
  preferences: {
    morningProducts: string[];
    nightProducts: string[];
  };
}

interface StepComponentProps {
  formData: any;
  onNext: (data: any) => void;
  ref: React.RefObject<any>;
}

export default function BuildPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const [skinType, setSkinType] = useState<string[]>([])
  const [skinConcerns, setSkinConcerns] = useState<string[]>([])
  const [climate, setClimate] = useState<string[]>([])
  const [preferences, setPreferences] = useState<{
    morningProducts: string[];
    nightProducts: string[];
  }>({
    morningProducts: [],
    nightProducts: [],
  })


  const CurrentStepComponent = steps[currentStep].component

  // Remove the empty handleNext({}) call from the Next button
  // and create a ref to store the child component's data
  const childDataRef = useRef<any>(null)

  const handleNext = (data: any) => {
    console.log("data before setFormData", data)
    console.log("test for skintype", data.skinType)

    // Chain the state updates using callbacks
    const updateStates = () => {
      if (data.skinType) {
        console.log("setting skin type")
        setSkinType(data.skinType)
      }
      if (data.skinConcerns) {
        console.log("setting skin concerns")
        setSkinConcerns(data.skinConcerns)
      }
      if (data.climate) {
        setClimate(data.climate)
      }
      if (data.preferences) {
        setPreferences(data.preferences)
      }

      // Move this inside the callback to ensure it runs after state updates
      if (currentStep === steps.length - 1) {
        setIsComplete(true)
      } else {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
      }
    }

    // Execute the state updates
    updateStates()
  }

  // Update handleNextButtonClick to directly call handleNext with current step data
  const handleNextButtonClick = () => {
    console.log('current state of data:', skinType)
    console.log("current state of data-skinConcerns", skinConcerns)
    console.log("current state of data-climate", climate)
    console.log("current state of data-preferences", preferences)

    const currentStepData = childDataRef.current?.getData?.()
    console.log("Step ID:", steps[currentStep].id)
    console.log("Raw currentStepData:", currentStepData)

    // Remove the early return for the last step
    if (!currentStepData) {
      console.log('No data received from current step')
      return
    }

    let updatedData = {}
    switch (steps[currentStep].id) {
      case 'skin-type':
        updatedData = { skinType: currentStepData.skinType, skinConcerns: currentStepData.skinConcerns }
        break
      case 'climate':
        updatedData = { climate: currentStepData.climate }
        break
      case 'products':
        updatedData = { 
          preferences: {
            morningProducts: currentStepData.morningProducts,
            nightProducts: currentStepData.nightProducts
          }
        }
        break
    }

    handleNext(updatedData)
    // Move setIsComplete after handling the data
    if (currentStep === steps.length - 1) {
      setIsComplete(true)
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }


  if (isComplete) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-50 to-white">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-20">
          <h1 className="text-4xl font-bold text-center mb-8 text-pink-800">Your Personalized Skincare Routine</h1>
          <div className="max-w-2xl mx-auto">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Your Skin Profile</CardTitle>
                <CardDescription>Based on your responses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Skin Type</h3>
                  <ul className="list-disc pl-5">
                    {skinType.map((type: string) => (
                      <li key={type}>{type}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Skin Concerns</h3>
                  <ul className="list-disc pl-5">
                    {skinConcerns.map((concern: string) => (
                      <li key={concern}>{concern}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Climate</h3>
                  <ul className="list-disc pl-5">
                    {climate.map((climateItem: string) => (
                      <li key={climateItem}>{climateItem}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Current Routine</h3>
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(preferences, null, 2)}
                  </pre>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => {
                    setIsComplete(false)
                    setCurrentStep(0)
                    setIsSaved(false)
                  }}
                  variant="outline"
                >
                  Start Over
                </Button>
                <Button
                  onClick={() => {}}
                  disabled={isSaving || isSaved}
                  className="w-full sm:w-auto"
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Saving...
                    </span>
                  ) : isSaved ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Saved to Profile
                    </span>
                  ) : (
                    "Save to Profile"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-50 to-white">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-center mb-8 text-pink-800">Build Your Perfect Skincare Routine</h1>
        <div className="max-w-2xl mx-auto">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{steps[currentStep].title}</CardTitle>
              <CardDescription>
                Step {currentStep + 1} of {steps.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }} 
                  transition={{ duration: 0.3 }}
                >
                  <CurrentStepComponent 
                    ref={childDataRef}
                    formData={{
                      skinType,
                      skinConcerns,
                      climate,
                      preferences
                    }}
                    onNext={handleNext} 
                  />
                </motion.div>
              </AnimatePresence>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={handlePrevious} disabled={currentStep === 0} variant="outline">
                Previous
              </Button>
              <Button 
                onClick={handleNextButtonClick}
                variant={currentStep === steps.length - 1 ? "default" : "outline"}
              >
                {currentStep === steps.length - 1 ? "See Results" : "Next"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

