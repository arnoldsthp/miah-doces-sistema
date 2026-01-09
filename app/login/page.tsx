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
      // 1. Tenta a autenticação com o Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      if (data?.user) {
        console.log("Autenticado com sucesso!")
        
        // 2. O "Pulo do Gato": Forçamos o navegador a recarregar a página 
        // no Dashboard para que os cookies sejam lidos corretamente.
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 500)
      }
    } catch (err: any) {
      // Tradução amigável de erros comuns
      const message = err.message === 'Invalid login credentials' 
        ? 'E-mail ou senha incorretos.' 
        : err.message
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold text-pink-600">Miah Doces</h1>
          <p className="text-gray-500 mt-2">Acesse o painel de pedidos</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none transition-all"
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none transition-all"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white font-bold bg-pink-500 rounded-lg hover:bg-pink-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]"
          >
            {loading ? 'Verificando...' : 'Entrar no Sistema'}
          </button>
        </form>
        
        <p className="mt-8 text-center text-xs text-gray-400">
          &copy; 2026 Miah Doces - Gestão de Confeitaria
        </p>
      </div>
    </div>
  )
}