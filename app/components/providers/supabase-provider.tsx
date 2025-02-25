// 'use client'

// import { createContext, useContext, useState } from 'react'
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// const Context = createContext(null)

// export default function SupabaseProvider({ children }) {
//   const [supabase] = useState(() => createClientComponentClient())

//   return (
//     <Context.Provider value={{ supabase }}>
//       {children}
//     </Context.Provider>
//   )
// }

// export const useSupabase = () => {
//   const context = useContext(Context)
//   if (context === null) {
//     throw new Error('useSupabase must be used within a SupabaseProvider')
//   }
//   return context
// } 