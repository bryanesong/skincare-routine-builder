'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/utils/supabase/component'
import { User } from '@supabase/supabase-js'

// Define the context type
type UserContextType = {
  user: User | null
  isLoading: boolean
  error: Error | null
  refreshUser: () => Promise<void>
}

// Create the context with default values
const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  error: null,
  refreshUser: async () => {}
})

// Hook to use the user context
export const useUser = () => useContext(UserContext)

// Provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const supabase = createClient()
  
  // Function to fetch the current user
  const fetchUser = async () => {
    try {
      setIsLoading(true)
      
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        throw error
      }
      
      setUser(user)
    } catch (err) {
      console.error('Error fetching user:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch user'))
    } finally {
      setIsLoading(false)
    }
  }
  
  // Fetch user on mount
  useEffect(() => {
    fetchUser()
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  // Function to manually refresh the user data
  const refreshUser = async () => {
    await fetchUser()
  }
  
  const value = {
    user,
    isLoading,
    error,
    refreshUser
  }
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
} 