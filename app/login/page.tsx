'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setCarregando(true)
    
    const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
    })
    
    if (error) {
      alert("Erro ao entrar: " + error.message)
      setCarregando(false)
    } else {
      router.push('/dashboard') // Redireciona para o dashboard após o login
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 text-black font-sans">
      <div className="w-full max-w-sm p-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-pink-600 tracking-tighter">Miah Doces</h1>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-2">Painel Administrativo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">E-mail de acesso</label>
            <input 
              required
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="exemplo@email.com"
              className="w-full p-4 bg-white border-2 border-gray-100 rounded-2xl font-bold outline-none focus:border-pink-500 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Senha secreta</label>
            <input 
              required
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-4 bg-white border-2 border-gray-100 rounded-2xl font-bold outline-none focus:border-pink-500 transition-all"
            />
          </div>

          <button 
            disabled={carregando}
            className="w-full py-5 bg-pink-600 text-white rounded-[24px] font-black uppercase shadow-lg shadow-pink-100 hover:bg-pink-700 transition-all active:scale-95 disabled:opacity-50 mt-4"
          >
            {carregando ? 'Verificando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <p className="text-center text-[10px] text-gray-400 mt-8 font-medium">
          Esqueceu a senha? Contate o administrador.
        </p>
      </div>
    </div>
  )
}