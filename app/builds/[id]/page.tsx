import { createClient } from '@/utils/supabase/component'
import { notFound } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import RoutineToggle from '../../components/RoutineToggle'
import ShareButton from '../../components/ShareButton'
import LikeButton from '../../components/LikeButton'

// This is a server component (no 'use client' directive)
export default async function RoutineDetail({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  const { data: routine, error } = await supabase
    .from('community_builds')
    .select()
    .eq('shareable_id', params.id)
    .single()

  if (error || !routine) {
    return notFound()
  }

  // Fetch user data to get the avatar URL
  const { data: userData } = await supabase
    .from('user_data_personal')
    .select('avatar_url')
    .eq('id', routine.owner_user_id)
    .single()

  // Use the avatar URL from user_data_personal if available, otherwise fallback to routine.avatar_url
  const avatarUrl = userData?.avatar_url || routine.avatar_url
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 pt-16">
        <div className="grid grid-cols-3 gap-8">
          {/* Main Content - Left Side (2/3 width) */}
          <div className="col-span-2 bg-white rounded-lg p-8">
            {/* User Info */}
            <div className="flex items-center gap-4 mb-8">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>{routine.user_name}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{routine.user_name}</h1>
                <p className="text-lg text-gray-600">{routine.routine_name}</p>
              </div>
            </div>

            {/* Skin Type */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Skin Type</h2>
              <div className="flex flex-wrap gap-2">
                {routine.skin_type.map((type: string, index: number) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* Routines */}
            <div className="mb-8">
              {(!routine.day_products || routine.day_products.length === 0) && 
               (!routine.night_products || routine.night_products.length === 0) ? (
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-600">No products have been added to this routine yet.</p>
                </div>
              ) : (
                <RoutineToggle 
                  dayProducts={routine.day_products || []}
                  nightProducts={routine.night_products || []}
                />
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Routine Description</h2>
              <p className="text-gray-600">{routine.routine_description}</p>
            </div>

            {/* Interaction Buttons */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <LikeButton 
                buildId={params.id} 
                initialLikes={routine.likes_id || []} 
                likesCount={routine.likes || 0} 
              />
              <ShareButton shareableId={params.id} />
            </div>
          </div>

          {/* Comments Section - Right Side (1/3 width) */}
          <div className="col-span-1 bg-white rounded-lg p-8">
            <h2 className="text-lg font-semibold mb-4">Comments</h2>
            <div className="space-y-4">
              {Object.values(routine.comments || {}).flat().map((comment: string, index: number) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600">{comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}