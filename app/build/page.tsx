"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import SkinTypeStep from "./steps/SkinTypeStep"
import ClimateStep from "./steps/ClimateStep"
import ProductsStep from "./steps/ProductsStep"

import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import SkincareRoutineBuildTemplate from "../components/SkincareRoutineBuildTemplate"
import { redirect } from "next/navigation"
import { v4 as uuidv4 } from 'uuid'

// Generate a user-friendly shareable ID based on a UUID
function generateShareableId(uuid: string, length = 8) {
  // Remove hyphens from the UUID
  const cleanUuid = uuid.replace(/-/g, '');
  
  // Convert the UUID to a base-36 string (using 0-9 and a-z)
  // This will make it more compact
  const base36 = BigInt('0x' + cleanUuid).toString(36).toUpperCase();
  
  // Take the first 'length' characters to keep it short
  // Add a prefix to make it clear this is a shareable ID
  return 'SR-' + base36.substring(0, length);
}

const steps = [
  { id: "skin-type", title: "Skin Type", component: SkinTypeStep },
  { id: "climate", title: "Climate", component: ClimateStep },
  { id: "products", title: "Product Preferences", component: ProductsStep },
]

// Initialize Supabase client
const supabase = createClientComponentClient()

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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userDisplayName, setUserDisplayName] = useState<string>("Guest")
  const [routineName, setRoutineName] = useState<string>("Guest's Skin Routine")
  const [isEditingTitle, setIsEditingTitle] = useState(false)

  const [currentRoutineName, setCurrentRoutineName] = useState<string | null>(null)

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

  // Check if user is authenticated and fetch display name
  useEffect(() => {
    async function checkAuth() {
      try {
        console.log("AUTH CHECK - checking if user is authenticated",isAuthenticated)
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession()
        const currentUserId = session?.user?.id || null
        
        // Update authentication state and user ID
        setIsAuthenticated(!!session)
        setUserId(currentUserId)
        
        console.log("Auth check - User ID:", currentUserId, "Is authenticated:", !!session)
        
        // Fetch user display name if authenticated
        if (currentUserId) {
          const { data, error } = await supabase
            .from('user_data_personal')
            .select('display_name')
            .eq('user_id', currentUserId)
            .single()
          
          if (data && !error) {
            const name = data.display_name || "User"
            console.log("Found user display name:", name)
            setUserDisplayName(name)
            setRoutineName(`${name}'s Routine`)
          } else {
            console.error("Error fetching user display name:", error)
            setRoutineName("My Custom Routine")
          }
        } else {
          console.log("No user ID found, using guest title")
          setRoutineName("Guest's Skin Routine")
        }
      } catch (err) {
        console.error("Error in authentication check:", err)
        setRoutineName("Guest's Skin Routine")
      }
    }
    
    checkAuth()
  }, []) // Empty dependency array to run only on mount

  const saveToProfile = async () => {
    console.log("saveToProfile - userId",userId,'routine name:',routineName)
    if (!userId || !isAuthenticated) {
      console.log("User not authenticated")
      return
    }
    
    try {
      setIsSaving(true)
      
      // Prepare the data to be saved - remove the id field to let Supabase generate it
      const routineId = uuidv4();
      const shareableId = generateShareableId(routineId);
      const routineData = {
        id: routineId,
        shareable_id: shareableId,
        owner_user_id: userId,
        skin_type: skinType,
        skin_concerns: skinConcerns,
        climate: climate,
        day_products: preferences.morningProducts,
        night_products: preferences.nightProducts,
        routine_name: routineName, // Use the editable routine name
        routine_description: `A personalized routine for ${skinType.join(', ')} skin with focus on ${skinConcerns.join(', ')}.`,
        comments: {},
        likes_id: [],
      }
      
      // Insert the data into the community_builds table
      const { data, error } = await supabase
        .from('community_builds')
        .insert(routineData)
        .select()
      
      if (error) {
        console.error("Error saving routine:", error)
        alert(`Error saving routine: ${error.message}`)
        throw error
      }
      
      console.log("Routine saved successfully:", data)
      setIsSaved(true)
      redirect(`/builds/${shareableId}`)
    } catch (error) {
      console.error("Failed to save routine:", error)
    } finally {
      setIsSaving(false)
    }

  }

  const handleNext = (data: any) => {
    console.log("handlenext userId",userId)
    console.log("data before setFormData", data)
    console.log("test for skintype", data.skinType)
    console.log("checking if user is authenticated2- userid:",userId)

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
    console.log("userId",userId)
    if (userId){
      console.log("userId is not null, calling handleNext")
      setIsAuthenticated(true)
      setUserDisplayName(`${userDisplayName}'s Routine`)
    }
    // console.log('current state of data:', skinType)
    // console.log("current state of data-skinConcerns", skinConcerns)
    // console.log("current state of data-climate", climate)
    // console.log("current state of data-preferences", preferences)

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
        <Header onAuthChange={(id) => setUserId(id)} />
        <main className="flex-grow container mx-auto px-4 py-20">
          <h1 className="text-4xl font-bold text-center mb-8 text-pink-800">Your Personalized Skincare Routine</h1>
          <div className="max-w-2xl mx-auto">
            <Card className="w-full bg-transparent border-2 shadow-md bg-white">
              <CardHeader className="bg-transparent">
                <div className="flex items-center justify-between">
                  {isEditingTitle ? (
                    <div className="flex items-center w-full">
                      <input
                        type="text"
                        value={routineName}
                        onChange={(e) => setRoutineName(e.target.value)}
                        className="flex-grow mr-2 p-2 text-xl font-semibold border border-pink-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                        autoFocus
                      />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setIsEditingTitle(false)}
                        className="text-pink-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </Button>
                    </div>
                  ) : (
                    <>
                      <CardTitle>{routineName}</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsEditingTitle(true)}
                        className="text-pink-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </Button>
                    </>
                  )}
                </div>
                <CardDescription>Based on your responses</CardDescription>
              </CardHeader>
              <SkincareRoutineBuildTemplate 
                skinType={skinType} 
                skinConcerns={skinConcerns} 
                climate={climate} 
                preferences={{morningProducts: preferences.morningProducts, nightProducts: preferences.nightProducts}} 
                onRoutineChange={(morningProducts, nightProducts) => {
                  // Only update state if the values have actually changed
                  const morningChanged = JSON.stringify(morningProducts) !== JSON.stringify(preferences.morningProducts);
                  const nightChanged = JSON.stringify(nightProducts) !== JSON.stringify(preferences.nightProducts);
                  
                  if (morningChanged || nightChanged) {
                    setPreferences({
                      morningProducts: morningProducts,
                      nightProducts: nightProducts
                    });
                  }
                }} />
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
                  onClick={() => {saveToProfile()}}
                  disabled={isSaving || isSaved || !isAuthenticated}
                  className="w-full sm:w-auto"
                  title={!isAuthenticated ? "Sign in to save to profile" : ""}
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
              {!isAuthenticated && (
                <div className="text-center mt-4 text-sm text-gray-600">
                  <p>Sign in to save your routine to your profile</p>
                  <Button 
                    variant="link" 
                    className="text-pink-500 hover:text-pink-700"
                    onClick={() => window.location.href = '/login'}
                  >
                    Sign in
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-50 to-white">
      <Header onAuthChange={(id) => setUserId(id)} />
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

