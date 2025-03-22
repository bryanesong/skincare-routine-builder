'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { Button } from "./ui/button"
import { createClient } from '@/utils/supabase/client'
import { useUser } from '../context/user-provider'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "./ui/alert-dialog"

export default function LikeButton({
  buildId,
  initialLikes = [],
}: {
  buildId: string,
  initialLikes?: string[],
}) {
  const { user } = useUser()
  const router = useRouter()
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  // Check if the current user has liked this build
  useEffect(() => {
    if (user && likes) {
      setIsLiked(likes.includes(user.id))
    }
  }, [user, likes])

  // console.log('Has user liked:', isLiked)
  // console.log('Likes:', likes)

  const handleLike = async () => {
    // If not logged in, show login dialog instead of direct redirect
    if (!user) {
      setShowLoginDialog(true)
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      // If already liked, remove the like
      if (isLiked) {
        const newLikes = likes.filter(id => id !== user.id)

        const { error } = await supabase
          .from('community_builds')
          .update({
            likes_id: newLikes,
          })
          .eq('shareable_id', buildId)

        if (error) {
          console.error('Supabase update error:', error.message, error.details)
        } else {
          setLikes(newLikes)
          setIsLiked(false)
        }
      }
      // Otherwise, add the like
      else {
        const newLikes = [...likes, user.id]

        const { error } = await supabase
          .from('community_builds')
          .update({
            likes_id: newLikes,
          })
          .eq('shareable_id', buildId)

        if (error) {
          console.error('Supabase update error:', error.message, error.details)
        } else {
          setLikes(newLikes)
          setIsLiked(true)
        }
      }
    } catch (error) {
      console.error('Error updating like:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginRedirect = () => {
    setShowLoginDialog(false)
    router.push('/login?redirect=' + encodeURIComponent(`/builds/${buildId}`))
  }

  return (
    <>
      <Button
        variant="ghost"
        size="lg"
        className={`flex-1 transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
        onClick={handleLike}
        disabled={isLoading}
      >
        <Heart className={`h-5 w-5 mr-2 ${isLiked ? 'fill-red-500' : ''}`} />
        {likes.length} {likes.length === 1 ? 'Like' : 'Likes'}
      </Button>

      {/* Login Dialog */}
      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign in required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to be signed in to like a skincare routine. Would you like to sign in now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLoginRedirect}>
              Sign In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 