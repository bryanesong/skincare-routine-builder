"use client"

import { motion } from 'framer-motion'
import { login, signup } from '@/app/login/action'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"
import Link from "next/link"
import { redirect } from 'next/navigation'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from '@/utils/supabase/component'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

async function CheckUser() {
  const supabase = createClientComponentClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/dashboard')
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  // Correct initialization of Supabase client
  const supabase = createClient()

  // Handle auth status change from Header component
  const handleAuthChange = (userId: string | null) => {
    setIsLoggedIn(!!userId)
    setIsLoading(false)

    // Optional: Redirect if already logged in
    if (userId) {
      router.push('/dashboard')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // Prevent default form submission behavior

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      // Successful login
      router.push('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred')
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'github' | 'facebook') => {
    try {
      setOauthLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
      })
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      console.error('OAuth login error:', err)
      setError('An unexpected error occurred during OAuth login')
    } finally {
      setOauthLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-50 to-white z-10">
      <div className="p-9">
        <Header onAuthChange={handleAuthChange} />
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

        <div className="container relative mx-auto px-4 z-30">
          <div className="max-w-xl mx-auto flex-1">
            <Card className="space-y-4 backdrop-blur-md bg-white/90 shadow-md bg-white">
              <CardHeader className="">
                <CardTitle className="text-center">Welcome Back</CardTitle>
                <CardDescription className="text-gray-500 text-center">
                  Enter your details to sign into your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Social login buttons */}
                <div className="mb-10">
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleOAuthLogin('google')}
                      disabled={oauthLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-md py-2.5 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      <img
                        src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
                        alt="Google logo"
                        className="h-5 w-5"
                      />
                      <span>Continue with Google</span>
                    </button>

                    {/* <button
                    onClick={() => handleOAuthLogin('facebook')}
                    disabled={oauthLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#1877F2] rounded-md py-2.5 px-4 text-sm font-medium text-white hover:bg-[#166FE5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2] transition-colors"
                  >
                    <img 
                      src="https://static.xx.fbcdn.net/rsrc.php/yD/r/d4ZIVX-5C-b.ico" 
                      alt="Facebook logo" 
                      className="h-5 w-5" 
                    />
                    <span>Continue with Facebook</span>
                  </button> */}
                  </div>
                </div>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <Button
                      type="submit"
                      className="w-full"
                    >
                      Sign in
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}