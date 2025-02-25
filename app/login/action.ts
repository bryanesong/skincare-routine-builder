'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Get form data
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Return the error message to the client
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Please verify your email before logging in' }
    }
    return { error: error.message }
  }

  // Redirect on successful login
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error, data: authData } = await supabase.auth.signUp(data)

  if (error) {
    console.error('Signup error:', error)
    redirect('/error')
  }
  console.log('auth data:', authData)
  console.log('user uuid:', authData?.user?.id)


  // Insert user data into the user_data_personal table
  if (authData.user) {
    const { data, error } = await supabase
      .from('user_data_personal')
      .insert([
        { id: authData.user.id, display_name: formData.get('display_name') as string },
      ])
      .select()

    console.log('user data:', data)
    if (error) {
      console.error('Error inserting user data:', error);
      redirect('/error');
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}