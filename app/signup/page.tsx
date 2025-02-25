"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"

import { createClient } from '@/utils/supabase/component'
import SignUpUICard from "../components/SignUpUICard"

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-50 to-white">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-20 border-4 border-blue-500">
        <div className="flex items-center justify-center border-4 border-green-500 h-full flex-col">
          <SignUpUICard/>
        </div>
      </main>
      <Footer />
    </div>
  )
}

