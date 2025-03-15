'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useUser } from '@/app/context/user-provider'
import { createClient } from '@/utils/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Button } from "@/app/components/ui/button"
import { Textarea } from "@/app/components/ui/textarea"
import { formatDistanceToNow } from 'date-fns'

interface Comment {
    id: string;
    user_id: string;
    user_name: string;
    avatar_url?: string;
    text: string;
    created_at: string;
}

interface CommentsData {
    [key: string]: Comment; // Using comment ID as the key
}

interface CommentSectionProps {
    routineId: string;
    comments: CommentsData | null | any;
}

export default function CommentSection({ routineId, comments = null }: CommentSectionProps) {
    const { user } = useUser()
    const [newComment, setNewComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [allComments, setAllComments] = useState<Comment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    // Process comments when they are received or changed
    useEffect(() => {
        setIsLoading(true)
        setError(null)

        try {
            // Handle different possible formats of comments data
            if (!comments) {
                setAllComments([])
            } else if (Array.isArray(comments)) {
                // If comments is already an array
                setAllComments(
                    [...comments].sort((a, b) =>
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    )
                )
            } else if (typeof comments === 'object') {
                // If comments is an object (JSONB from PostgreSQL)
                const commentsArray = Object.values(comments) as Comment[]
                setAllComments(
                    [...commentsArray].sort((a, b) =>
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    )
                )
            } else {
                // If comments is in an unexpected format
                console.error('Unexpected comments format:', comments)
                setError('Unable to load comments due to unexpected format')
                setAllComments([])
            }
        } catch (err) {
            console.error('Error processing comments:', err)
            setError('Error loading comments')
            setAllComments([])
        } finally {
            setIsLoading(false)
        }
    }, [comments])

    // Fetch comments if they weren't provided or to refresh them
    const refreshComments = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const { data: routineData, error: routineError } = await supabase
                .from('community_builds')
                .select('comments')
                .eq('shareable_id', routineId)
                .single()

            if (routineError) throw routineError

            const fetchedComments = routineData.comments

            if (!fetchedComments) {
                setAllComments([])
            } else if (typeof fetchedComments === 'object') {
                const commentsArray = Object.values(fetchedComments) as Comment[]
                setAllComments(
                    [...commentsArray].sort((a, b) =>
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    )
                )
            }
        } catch (err) {
            console.error('Error fetching comments:', err)
            setError('Failed to load comments')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmitComment = async (e: FormEvent) => {
        e.preventDefault()

        if (!user || !newComment.trim()) return

        setIsSubmitting(true)

        try {
            // Get user data
            const { data: userData } = await supabase
                .from('user_data_personal')
                .select('display_name, avatar_url')
                .eq('id', user.id)
                .single()

            const userName = userData?.display_name || user.email || 'Anonymous'

            // Create new comment object
            const commentId = crypto.randomUUID()
            const newCommentObj: Comment = {
                id: commentId,
                user_id: user.id,
                user_name: userName,
                avatar_url: userData?.avatar_url,
                text: newComment.trim(),
                created_at: new Date().toISOString()
            }

            // Get the current comments
            const { data: currentData, error: fetchError } = await supabase
                .from('community_builds')
                .select('comments')
                .eq('shareable_id', routineId)
                .single()

            if (fetchError) throw fetchError

            // Create updated comments object
            const currentComments = currentData.comments || {}
            const updatedComments = {
                ...currentComments,
                [commentId]: newCommentObj
            }

            // Update the database with the new comments object
            const { error: updateError } = await supabase
                .from('community_builds')
                .update({ comments: updatedComments })
                .eq('shareable_id', routineId)

            if (updateError) throw updateError

            // Update local state
            setAllComments([newCommentObj, ...allComments])
            setNewComment('')
        } catch (error) {
            console.error('Error adding comment:', error)
            alert('Failed to add comment. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Comments</h2>
                <button
                    onClick={refreshComments}
                    className="text-sm text-blue-600 hover:text-blue-800"
                    disabled={isLoading}
                >
                    Refresh
                </button>
            </div>

            {/* Comment input area */}
            {user ? (
                <form onSubmit={handleSubmitComment} className="mb-6">
                    <div className="flex items-start gap-3 mb-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.user_metadata?.avatar_url} />
                            <AvatarFallback>{user.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 min-h-[80px] resize-none"
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={isSubmitting || !newComment.trim()}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isSubmitting ? 'Posting...' : 'Comment'}
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="bg-gray-50 p-4 rounded-lg mb-6 text-center">
                    <p className="text-gray-600">Please sign in to leave a comment</p>
                </div>
            )}

            {/* Loading state */}
            {isLoading && (
                <div className="text-center py-4">
                    <p className="text-gray-600">Loading comments...</p>
                </div>
            )}

            {/* Error state */}
            {error && (
                <div className="bg-red-50 p-4 rounded-lg mb-6 text-center">
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={refreshComments}
                        className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Comments list */}
            {!isLoading && !error && (
                <div className="space-y-6">
                    {allComments.length > 0 ? (
                        allComments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                    <AvatarImage src={comment.avatar_url} />
                                    <AvatarFallback>{comment.user_name[0]?.toUpperCase() || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm">{comment.user_name}</span>
                                        <span className="text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 text-sm whitespace-pre-line">{comment.text}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <p className="text-gray-600">No comments yet. Be the first to comment!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
} 