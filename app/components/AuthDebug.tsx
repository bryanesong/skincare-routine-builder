'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function AuthDebug() {
    const [authInfo, setAuthInfo] = useState<any>(null)

    useEffect(() => {
        async function checkAuth() {
            const supabase = createClient()
            const { data, error } = await supabase.auth.getSession()
            setAuthInfo({ data, error })
        }
        checkAuth()
    }, [])

    if (!authInfo) return <div>Loading auth state...</div>

    return (
        <div className="text-xs p-2 bg-gray-100 rounded mb-4">
            <div>Auth Debug:</div>
            {authInfo.data?.session ? (
                <div className="text-green-600">
                    Logged in as: {authInfo.data.session.user.email}
                    <br />
                    User ID: {authInfo.data.session.user.id}
                </div>
            ) : (
                <div className="text-red-600">
                    Not logged in or session expired.
                    {authInfo.error && (
                        <div>Error: {authInfo.error.message}</div>
                    )}
                </div>
            )}
        </div>
    )
} 