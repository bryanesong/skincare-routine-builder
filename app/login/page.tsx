"use client"

import { motion } from 'framer-motion'
import { login, signup } from '@/app/login/action'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"
import Link from "next/link"
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/component'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

async function CheckUser() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/dashboard')
  }
}

export default function LoginPage() {
  
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  CheckUser()

  const handleLogin = async (formData: FormData) => {
    setIsLoading(true)
    setError('')
    
    try {
      const result = await login(formData)
      if (result?.error) {
        setError(result.error)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-50 to-white z-10">
      <div className="p-9">
        <Header />
      </div>
      <main className="flex-grow flex items-center justify-center relative">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat z-20" 
          style={{ 
            backgroundImage: 'url("/background-temp.png")',
            backgroundSize: '100%',
            filter: 'brightness(0.7)'
          }} 
        />
        <div className="absolute inset-0 bg-black/30" />
        
        <div className="container relative mx-auto px-4 z-30 flex-col flex">
          <div className="max-w-md mx-auto">
            <Card className="backdrop-blur-md bg-white/90">
              <CardHeader>
                <CardTitle className="text-center">Welcome Back</CardTitle>
                <CardDescription className="text-gray-500 text-center">
                  Enter your details to sign into your account
                </CardDescription>
              </CardHeader>
              <form action={handleLogin}>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                    />
                  </div>
                  
                  {error && (
                    <div className="text-red-500 text-sm font-medium p-2 bg-red-50 rounded-md">
                      {error}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Logging in...
                      </span>
                    ) : (
                      "Log In"
                    )}
                  </Button>
                  <div className="text-sm text-center w-full">
                    Don't have an account?{' '}
                    <Link href="/signup" className="font-medium text-primary hover:text-primary/80">
                      Sign Up
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}