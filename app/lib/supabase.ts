import { createClient } from "@supabase/supabase-js"

const supabaseUrl = null/*process.env.NEXT_PUBLIC_SUPABASE_URL*/
const supabaseAnonKey = null/*process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY*/



if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

