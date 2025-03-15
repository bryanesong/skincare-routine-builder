import { createClient } from '@/utils/supabase/component'
import { notFound } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import RoutineToggle from '../../components/RoutineToggle'
import ShareButton from '../../components/ShareButton'
import LikeButton from '../../components/LikeButton'
import AnalyzeButton from '../../components/AnalyzeButton'
import OwnerContent from '../../components/OwnerContent'
import OwnerContentWrapper from '@/app/components/OwnerContent'
import CommentSection from '@/app/components/CommentSection'

// This is a server component (no 'use client' directive)
export default async function RoutineDetail({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Get auth user data
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id

  // This fetches the routine data including comments
  const { data: routine, error } = await supabase
    .from('community_builds')
    .select()  // This includes all fields, including comments
    .eq('shareable_id', params.id)
    .single()

  const { data: json_data, error: json_data_error } = await supabase
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
  const { data: userData } = await supabase
    .from('user_data_personal')
    .select('avatar_url, display_name')
    .eq('id', routine.owner_user_id)
    .single()

  // Use the avatar URL from user_data_personal if available, otherwise fallback to routine.avatar_url
  const avatarUrl = userData?.avatar_url || routine.avatar_url
  const userDisplayName = userData?.display_name || routine.user_name

  const isOwner = userId === routine.owner_user_id

  // Debug the analysis notes
  console.log('Analysis notes direct:', json_data.analysis)
  //console.log('ROUTINE notes:', routine.analysis)

  //console.log('ORIGINAL comments:', routine.comments)

  // Ensure analysis_notes is properly serialized if it's an object
  const serializedAnalysisNotes = routine.analysis_notes
    ? (typeof routine.analysis_notes === 'object'
      ? JSON.stringify(routine.analysis_notes)
      : routine.analysis_notes)
    : null

  //console.log('Serialized analysis notes:', serializedAnalysisNotes)

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
                <h1 className="text-2xl font-bold">{userDisplayName}</h1>
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
            <AnalyzeButton
              routineId={params.id}
              ownerId={routine.owner_user_id}
              existingAnalysis={json_data.analysis}
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