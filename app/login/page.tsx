'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      if (data?.user) {
        setTimeout(() => {
          window.location.href = '/'
        }, 500)
      }
    } catch (err: any) {
      const message = err.message === 'Invalid login credentials' 
        ? 'E-mail ou senha incorretos.' 
        : err.message
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 text-black">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold text-pink-600">Miah Doces</h1>
          <p className="text-gray-500 mt-2 font-medium">Acesse o painel de gestão</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full p-3 border border-gray-300 rounded-lg text-black bg-white focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none transition-all"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 border border-gray-300 rounded-lg text-black bg-white focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none transition-all"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white font-bold bg-pink-500 rounded-lg hover:bg-pink-600 disabled:bg-gray-400 transition-all shadow-md active:scale-[0.98]"
          >
            {loading ? 'Verificando...' : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  )
}