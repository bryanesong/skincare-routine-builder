'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from "../components/ui/button"
import { Menu, User, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/component'
import { useUser } from '../context/user-provider'

interface HeaderProps {
  onAuthChange?: (userId: string | null) => void;
}

export default function Header({ onAuthChange }: HeaderProps = {}) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [userProfilePhoto, setUserProfilePhoto] = useState<string | null>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)

  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  
  // Use the user context instead of local state
  const { user, isLoading } = useUser()

  // Notify parent component about auth changes (only when user changes)
  useEffect(() => {
    if (onAuthChange) {
      onAuthChange(user?.id || null)
    }
  }, [user, onAuthChange])

  // Fetch user profile photo only once when user is available and profile hasn't been loaded
  useEffect(() => {
    if (!user || profileLoaded) return;

    const fetchUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('user_data_personal')
          .select('avatar_url')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching profile photo:', error)
        } else {
          setUserProfilePhoto(data?.avatar_url ?? null)
        }
        
        // Mark profile as loaded to prevent additional fetches
        setProfileLoaded(true)
      } catch (profileException) {
        console.error('Exception fetching profile data:', profileException)
        setProfileLoaded(true) // Still mark as loaded to prevent retry loops
      }
    }

    fetchUserProfile()
  }, [user, supabase, profileLoaded])

  // Set up realtime subscription for profile changes - only once per user session
  useEffect(() => {
    if (!user) return;

    // Create a unique channel name
    const channelName = `profile-changes-${user.id}`

    let channel;

    try {
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_data_personal',
            filter: `id=eq.${user.id}`
          },
          (payload) => {
            // Only update if the avatar_url has changed
            if (payload.new['avatar_url'] !== userProfilePhoto) {
              setUserProfilePhoto(payload.new['avatar_url'])
            }
          }
        )
        .subscribe()
    } catch (channelError) {
      console.error('Error setting up realtime channel:', channelError)
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [user, supabase]) // Removed userProfilePhoto dependency to prevent re-subscriptions

  // Handle scroll events
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
                      src={userProfilePhoto}
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
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === item.href ? 'text-primary' : 'text-gray-600'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
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

