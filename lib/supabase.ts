import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'sb-auth-token', // Nome exato que o proxy busca
    cookieOptions: {
      name: 'sb-auth-token',
      lifetime: 60 * 60 * 24 * 7, // 7 dias
      domain: '', // Deixe vazio para pegar o domínio atual da Vercel
      path: '/',
      sameSite: 'lax',
    }
  }
})