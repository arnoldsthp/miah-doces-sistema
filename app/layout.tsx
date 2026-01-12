'use client'
import { Inter } from "next/font/google"
import "./globals.css"
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import Link from "next/link"
import { supabase } from '@/lib/supabase'

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    setIsMenuOpen(false)
  }

  const menuItems = [
    { name: 'Iniciar Nova Venda', href: '/', icon: '🛒', fixed: true },

    { name: 'Análise de Vendas', href: '/vendas-analitico', icon: '📈' },
    { name: 'Clientes', href: '/clientes', icon: '👥' },
    { name: 'Comandas em Aberto', href: '/comandas', icon: '🧾' },
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Entrada de Estoque', href: '/estoque', icon: '📦' },
    { name: 'Financeiro', href: '/financeiro', icon: '💸' },
  ]

  const orderedMenu = [
    menuItems.find(i => i.fixed),
    ...menuItems.filter(i => !i.fixed).sort((a, b) => a.name.localeCompare(b.name))
  ].filter(Boolean)

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
        <div className="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden text-black">

          {/* TOPO MOBILE */}
          <div className="md:hidden fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 bg-white border-b border-gray-200 z-50 shadow-sm">
            <Link 
              href="/" 
              onClick={() => setIsMenuOpen(false)}
              className="font-black text-pink-600 text-xl tracking-tighter"
            >
              Miah Doces
            </Link>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="p-2 text-2xl text-pink-600 focus:outline-none"
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>

          {/* SIDEBAR */}
          <aside className={`
            fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm transition-transform duration-300
            ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            md:relative md:translate-x-0
          `}>
            <div className="p-6 border-b border-gray-50 mb-4 hidden md:block">
              <Link href="/" className="text-2xl font-black text-pink-600 tracking-tight">
                Miah Doces
              </Link>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1">
                Painel de Gestão
              </p>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-20 md:mt-0">
              {orderedMenu.map((item: any) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
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

            <div className="p-4 border-t border-gray-100">
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-50 text-gray-400 font-black text-[10px] uppercase hover:bg-red-50 hover:text-red-600 transition-all"
              >
                🚪 Sair do Sistema
              </button>
            </div>
          </aside>

          {/* OVERLAY MOBILE */}
          {isMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/20 z-30 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
          )}

          {/* CONTEÚDO */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>

        </div>
      </body>
    </html>
  )
}
