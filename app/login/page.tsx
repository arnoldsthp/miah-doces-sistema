'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setCarregando(true)
    
    try {
      // 1. Tenta a autenticação
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })
      
      if (error) {
        alert("Dados inválidos: " + error.message)
        setCarregando(false)
      } else if (data.user) {
        // 2. Login deu Status 200! Agora forçamos o navegador a ir para o dashboard
        // Usamos window.location para garantir que o Middleware perceba a nova sessão
        window.location.href = '/dashboard'
      }
    } catch (err) {
      alert("Erro crítico na conexão.")
      setCarregando(false)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-pink-50 text-black font-sans">
      <div className="w-full max-w-sm p-8 bg-white rounded-[40px] shadow-2xl border border-pink-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-pink-600 tracking-tighter italic-none">Miah Doces</h1>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-2">Acesso Restrito</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">E-mail</label>
            <input 
              required
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-pink-200 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Senha</label>
            <input 
              required
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-pink-200 transition-all"
            />
          </div>

          <button 
            disabled={carregando}
            className="w-full py-5 bg-pink-600 text-white rounded-[24px] font-black uppercase shadow-lg shadow-pink-100 hover:bg-pink-700 transition-all active:scale-95 disabled:opacity-50 mt-4 italic-none"
          >
            {carregando ? 'AUTENTICANDO...' : 'ENTRAR NO SISTEMA'}
          </button>
        </form>
      </div>
    </div>
  )
}