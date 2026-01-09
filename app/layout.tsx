'use client'
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false) // Controle do menu no celular

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    setIsMenuOpen(false)
  }

  const menuItems = [
    { name: 'Iniciar Nova Venda', href: '/', icon: '🛒' },
    { name: 'Análise de Vendas', href: '/vendas-analitico', icon: '📈' },
    { name: 'Comandas em Aberto', href: '/comandas', icon: '🧾' },
    { name: 'Contas a Pagar', href: '/contas', icon: '📑' },
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Entrada de Estoque', href: '/estoque', icon: '📦' },
    { name: 'Lançar Despesas', href: '/financeiro', icon: '💸' },
  ]

  // Se estiver na página de login, não mostra a barra lateral
  const isLoginPage = pathname === '/login'

  if (isLoginPage) {
    return (
      <html lang="pt-br">
        <body className={inter.className}>{children}</body>
      </html>
    )
  }

  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <div className="flex flex-col md:flex-row h-screen bg-gray-100 text-black overflow-hidden">
          
          {/* HEADER MOBILE - Aparece só no celular */}
          <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 z-50">
            <h2 className="text-xl font-black text-pink-600">Miah Doces</h2>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-pink-600 text-2xl"
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>

          {/* ASIDE (BARRA LATERAL) - Adaptável */}
          <aside className={`
            fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm transition-transform duration-300
            ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            md:relative md:translate-x-0
          `}>
            <div className="p-6 border-b border-gray-50 mb-4 hidden md:block">
              <h2 className="text-2xl font-black text-pink-600 tracking-tight">Miah Doces</h2>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Painel de Gestão</p>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-16 md:mt-0">
              {menuItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  onClick={() => setIsMenuOpen(false)} // Fecha o menu ao clicar (mobile)
                  className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${
                    pathname === item.href 
                    ? 'bg-pink-600 text-white shadow-md' 
                    : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span> 
                  <span className="text-sm">{item.name}</span>
                </Link>
              ))}
            </nav>

            <div className="p-4 mt-auto border-t border-gray-100">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-50 text-gray-400 font-black text-[10px] uppercase hover:bg-red-50 hover:text-red-600 transition-all"
              >
                🚪 Sair do Sistema
              </button>
            </div>
          </aside>

          {/* OVERLAY - Clica fora para fechar o menu no celular */}
          {isMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/20 z-30 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
          )}

          {/* CONTEÚDO PRINCIPAL */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8">
            <div className="max-w-full overflow-x-hidden">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}