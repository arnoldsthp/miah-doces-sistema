import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'sb-auth-token',
    storage: {
      getItem: (key) => {
        if (typeof window === 'undefined') return null
        return window.localStorage.getItem(key)
      },
      setItem: (key, value) => {
        if (typeof window === 'undefined') return
        window.localStorage.setItem(key, value)
        // O SEGREDO: Forçamos o cookie a ser gravado manualmente para o servidor ler
        document.cookie = `${key}=${value}; path=/; max-age=31536000; SameSite=Lax; secure`
      },
      removeItem: (key) => {
        if (typeof window === 'undefined') return
        window.localStorage.removeItem(key)
        document.cookie = `${key}=; path=/; max-age=0`
      },
    },
  },
})