"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import SkinTypeStep from "./steps/SkinTypeStep"
import ClimateStep from "./steps/ClimateStep"
import ProductsStep from "./steps/ProductsStep"

import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"

const steps = [
  { id: "skin-type", title: "Skin Type", component: SkinTypeStep },
  { id: "climate", title: "Climate", component: ClimateStep },
  { id: "products", title: "Product Preferences", component: ProductsStep },
]

// Initialize Supabase client

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

  // Create refs inside the component
  const stepRefs = {
    'skin-type': useRef<any>(null),
    'climate': useRef<any>(null),
    'products': useRef<any>(null),
  }

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
            <Card className="w-full bg-transparent border-none shadow-none">
              <CardHeader className="bg-transparent">
                <CardTitle>Your Skin Profile</CardTitle>
                <CardDescription>Based on your responses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 bg-transparent">
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
              <CardFooter className="flex flex-col sm:flex-row gap-4 bg-transparent">
                <Button 
                  onClick={() => {
                    setIsComplete(false)
                    setCurrentStep(0)
                    setIsSaved(false)
                    // Reset all form data states
                    setSkinType([])
                    setSkinConcerns([])
                    setClimate([])
                    setPreferences({
                      morningProducts: [],
                      nightProducts: [],
                    })
                    // Reset UI state in each step component
                    stepRefs['skin-type'].current?.reset?.()
                    stepRefs['climate'].current?.reset?.()
                    stepRefs['products'].current?.reset?.()
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
        <h2 className="text-s text-center mb-8 ">Answer a few questions about your skin and current routine, and we'll help you create a personalized skincare routine.</h2>
        <div className="max-w-4xl mx-auto justify-center items-center">
          <Card className="w-full bg-transparent border-none shadow-none">
            <CardHeader className="bg-transparent">
              <div className="flex justify-center items-center gap-6 mt-4">
                {steps.map((step, index) => (
                  <div 
                    key={step.id} 
                    className={`h-2.5 w-20 rounded-full transition-colors duration-300 ${
                      index <= currentStep ? 'bg-pink-500' : 'bg-gray-100'
                    }`}
                  />
                ))}
              </div>
            </CardHeader>
            <CardContent className="bg-transparent">
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
            <CardFooter className="flex justify-between bg-transparent">
              <Button 
                onClick={handlePrevious} 
                disabled={currentStep === 0} 
                variant="outline"
                className="rounded-full border-pink-500 text-pink-500 hover:bg-pink-50 hover:text-pink-600 flex items-center gap-2"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
                Previous
              </Button>
              <Button 
                onClick={handleNextButtonClick}
                variant="outline"
                className="rounded-full border-pink-500 text-pink-500 hover:bg-pink-50 hover:text-pink-600 flex items-center gap-2"
              >
                {currentStep === steps.length - 1 ? "See Results" : "Next"}
                {currentStep !== steps.length - 1 && (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
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

