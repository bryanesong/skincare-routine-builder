'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from "../components/ui/button"
import { Menu, User, Settings, LogOut } from 'lucide-react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/component'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userProfilePhoto, setUserProfilePhoto] = useState<string | null>(null)

  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    console.log('Auth effect running')

    const getUser = async () => {
      console.log('Header Getting user...')
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          console.error('Header Error fetching user:', error)
          return
        }
        console.log('Header Fetched user:', user)
        setUser(user)
        if (!user) {
          console.error('User not found')
          return
        }
        const { data, error: profileError } = await supabase
          .from('user_data_personal')
          .select('avatar_url')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile photo:', profileError)
          return
        } else {
          console.log('Setting initial avatar_url:', data?.avatar_url)
          setUserProfilePhoto(data?.avatar_url ?? null)
        }

      } catch (error) {
        console.error('Header Exception fetching user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session)
      setUser(session?.user ?? null)
      if (!session?.user) {
        setUserProfilePhoto(null)
      }
      setIsLoading(false)
    })

    return () => {
    }
  }, [supabase])

  // Separate useEffect for realtime subscription to ensure it runs when user changes
  useEffect(() => {
    if (!user) return
    
    console.log('Setting up realtime subscription for user:', user.id)
    
    // Create a unique channel name
    const channelName = `profile-changes-${user.id}-${Date.now()}`
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'user_data_personal',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('Realtime update received:', payload)
          console.log('real time data avatar_url received:', payload.new['avatar_url'])
          // Directly update from payload for immediate feedback
          setUserProfilePhoto(payload.new['avatar_url'])
        }
      )
      .subscribe((status) => {
        console.log(`Realtime subscription status for ${user.id}:`, status)
        if (status !== 'SUBSCRIBED') {
          console.error('Failed to subscribe to realtime updates')
        }
      })

    // Fetch the current avatar_url to ensure we have the latest
    const fetchCurrentAvatar = async () => {
      const { data, error } = await supabase
        .from('user_data_personal')
        .select('avatar_url')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching current avatar:', error)
        return
      }

      if (data && data.avatar_url !== userProfilePhoto) {
        console.log('Updated avatar from fetch:', data.avatar_url)
        setUserProfilePhoto(data.avatar_url)
      }
    }

    fetchCurrentAvatar()

    return () => {
      console.log('Cleaning up realtime subscription for:', channelName)
      supabase.removeChannel(channel)
    }
  }, [user, supabase]) // Remove userProfilePhoto dependency to prevent re-subscriptions

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { href: '/builds', label: 'Community Builds' },
    { href: '/products', label: 'Browse Products' },
    { href: '/about', label: 'About' },
  ]

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setIsUserMenuOpen(false)
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-primary transition-colors hover:text-primary/80">
            BuildMySkincare
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === item.href ? 'text-primary' : 'text-gray-600'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-4">
            {isLoading ? (
              <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full" />
            ) : !user ? (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/build">Start Building</Link>
                </Button>
              </>
            ) : (
              <div className="relative">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  {userProfilePhoto ? (
                    <img
                      src={userProfilePhoto ?? undefined}
                      alt={user.user_metadata?.full_name || user.email}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  <span>{user.user_metadata?.full_name || user.email}</span>
                </Button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <button
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu />
          </Button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t animate-fade-in">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {isLoading ? (
              <div className="w-full h-8 animate-pulse bg-gray-200 rounded" />
            ) : !user ? (
              <>
                <Button asChild variant="ghost" className="justify-start">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild className="justify-start">
                  <Link href="/build">Start Building</Link>
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

