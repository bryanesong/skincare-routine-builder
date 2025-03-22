import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/client'
import { notFound } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import RoutineToggle from '../../components/RoutineToggle'
import ShareButton from '../../components/ShareButton'
import LikeButton from '../../components/LikeButton'
import AnalyzeButton from '../../components/AnalyzeButton'
import CommentSection from '@/app/components/CommentSection'
import RoutineDisplay from '../../components/RoutineDisplay'
import DeleteButton from '../../components/DeleteButton'
import EditableDescription from '../../components/EditableDescription'

// This is a server component (no 'use client' directive)
export default async function RoutineDetail({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = await createClient()
  // Get user session client-side
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user

  // This fetches the routine data including comments
  const { data: routine, error } = await supabase
    .from('community_builds')
    .select()  // This includes all fields, including comments
    .eq('shareable_id', params.id)
    .single()

  const { data: json_data, error: json_data_error } = await (await supabase)
    .from('community_builds')
    .select('analysis, comments')
    .eq('shareable_id', params.id)
    .single()

  if (json_data_error || !json_data) {
    console.log('json_data error:', json_data_error)
    return notFound()
  }

  if (error || !routine) {
    return notFound()
  }

  // Fetch user data to get the avatar URL
  const { data: userData } = await (await supabase)
    .from('user_data_personal')
    .select('avatar_url, display_name')
    .eq('id', routine.owner_user_id)
    .single()

  // Use the avatar URL from user_data_personal if available, otherwise fallback to routine.avatar_url
  const avatarUrl = userData?.avatar_url || routine.avatar_url
  const userDisplayName = userData?.display_name || routine.user_name

  // Check if the current user is the owner of the routine
  const isOwner = userId && routine.owner_user_id &&
    userId.toString() === routine.owner_user_id.toString()

  // Debug the analysis notes
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 pt-16">
        <div className="grid grid-cols-3 gap-8">
          {/* Main Content - Left Side (2/3 width) */}
          <div className="col-span-2 bg-white rounded-lg p-8">
            {/* User Info */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>{userDisplayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{userDisplayName}</h1>
                  <p className="text-lg text-gray-600">{routine.routine_name}</p>
                </div>
              </div>

              {/* Delete button - only shown to the owner */}
              <DeleteButton
                shareableId={routine.shareable_id}
                ownerId={routine.owner_user_id}
              />
            </div>

            {/* Skin Type */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Skin Type</h2>
              <div className="flex flex-wrap gap-2">
                {routine.skin_type && routine.skin_type.map((type: string, index: number) => (
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
                <RoutineDisplay
                  dayProducts={routine.day_products || []}
                  nightProducts={routine.night_products || []}
                  ownerId={routine.owner_user_id}
                  shareableId={routine.shareable_id}
                />
              )}
            </div>

            {/* Description */}
            <EditableDescription
              initialDescription={routine.routine_description}
              isOwner={isOwner}
              shareableId={routine.shareable_id}
            />

            {/* Interaction Buttons */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <LikeButton
                buildId={params.id}
                initialLikes={routine.likes_id || []}
              />
              <ShareButton shareableId={routine.shareable_id} />
            </div>
          </div>

          {/* Comments Section - Right Side (1/3 width) */}
          <div className="col-span-1 bg-white rounded-lg p-8">
            <AnalyzeButton
              routineId={params.id}
              ownerId={routine.owner_user_id}
              existingAnalysis={json_data.analysis}
              current_routine={routine}
            />

            <CommentSection
              routineId={params.id}
              comments={json_data.comments}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}