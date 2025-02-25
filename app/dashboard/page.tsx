import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Link from 'next/link'
import { Button } from '../components/ui/button'

export default async function Dashboard() {

    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="mx-auto py-6"></div>
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">Welcome to Your Dashboard {data.user.email}</h1>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Your Skincare Routines</h2>
                            <Button asChild>
                                <Link href="/build">Create New Routine</Link>
                            </Button>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Saved Products</h2>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
} 