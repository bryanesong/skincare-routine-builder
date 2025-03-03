'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { Button } from "./ui/button"
import { createClient } from '@/utils/supabase/component'
import { useUser } from '../context/user-provider'
import { useRouter } from 'next/navigation'

export default function LikeButton({ 
  buildId, 
  initialLikes = [], 
  likesCount = 0 
}: { 
  buildId: string, 
  initialLikes?: string[], 
  likesCount?: number 
}) {
  const { user } = useUser()
  const router = useRouter()
  const [likes, setLikes] = useState(initialLikes)
  const [count, setCount] = useState(likesCount)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Check if the current user has liked this build
  useEffect(() => {
    if (user && likes) {
      setIsLiked(likes.includes(user.id))
    }
  }, [user, likes])
  
  const handleLike = async () => {
    // If not logged in, redirect to login page
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(`/builds/${buildId}`))
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
            likes: count - 1
          })
          .eq('shareable_id', buildId)
        
        if (!error) {
          setLikes(newLikes)
          setCount(prev => prev - 1)
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
            likes: count + 1
          })
          .eq('shareable_id', buildId)
        
        if (!error) {
          setLikes(newLikes)
          setCount(prev => prev + 1)
          setIsLiked(true)
        }
      }
    } catch (error) {
      console.error('Error updating like:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Button 
      variant="ghost" 
      size="lg" 
      className={`flex-1 transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
      onClick={handleLike}
      disabled={isLoading}
    >
      <Heart className={`h-5 w-5 mr-2 ${isLiked ? 'fill-red-500' : ''}`} />
      {count} {count === 1 ? 'Like' : 'Likes'}
    </Button>
  )
} 