import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Link from 'next/link'
import { Button } from '../components/ui/button'
import ProfilePhotoSelector from '@/app/components/ProfilePhotoSelector'
import DashboardContent from './DashboardContent'

export default async function Dashboard() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        redirect('/login')
    }

    const { data: userData, error: userDataError } = await supabase
        .from('user_data_personal')
        .select('*')
        .eq('id', data.user.id)
        .single()

    if (userDataError) {
        console.error('Error fetching user data:', userDataError)
    }

    return (
        <DashboardContent userData={userData} />
    )
} 