"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import SkinTypeStep from "./steps/SkinTypeStep"
import ConcernsStep from "./steps/ConcernsStep"
import ProductsStep from "./steps/ProductsStep"
import ResultsStep from "./steps/ResultsStep"
import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"

const steps = [
  { id: "skin-type", title: "Skin Type", component: SkinTypeStep },
  { id: "concerns", title: "Skin Concerns", component: ConcernsStep },
  { id: "products", title: "Product Preferences", component: ProductsStep },
  { id: "results", title: "Your Routine", component: ResultsStep },
]

export default function BuildPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    skinType: "",
    concerns: [],
    preferences: {},
  })

  const CurrentStepComponent = steps[currentStep].component

  const handleNext = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-50 to-white">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
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
                  <CurrentStepComponent formData={formData} onNext={handleNext} />
                </motion.div>
              </AnimatePresence>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={handlePrevious} disabled={currentStep === 0} variant="outline">
                Previous
              </Button>
              {currentStep < steps.length - 1 && <Button onClick={() => handleNext({})}>Next</Button>}
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

