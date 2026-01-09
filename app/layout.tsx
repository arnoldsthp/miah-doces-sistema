'use client'
import { Inter } from "next/font/google";
import "./globals.css";
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import Link from "next/link";
import { supabase } from '@/lib/supabase'

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
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
        <div className="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden">
          
          {/* TOPO MOBILE */}
          <div className="md:hidden flex items-center justify-between p-4 bg-white border-b z-50">
            <span className="font-bold text-pink-600 text-lg">Miah Doces</span>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-2xl">
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>

          {/* MENU LATERAL (SIDEBAR) */}
          <aside className={`
            fixed inset-y-0 left-0 z-40 w-64 bg-white border-r flex flex-col transition-transform duration-300
            ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            md:relative md:translate-x-0
          `}>
            <div className="p-6 border-b hidden md:block">
              <h2 className="text-2xl font-black text-pink-600">Miah Doces</h2>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${
                    pathname === item.href ? 'bg-pink-600 text-white' : 'text-gray-500 hover:bg-pink-50'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm">{item.name}</span>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t">
              <button onClick={handleLogout} className="w-full p-3 rounded-xl bg-gray-50 text-gray-400 font-bold text-xs uppercase hover:bg-red-50 hover:text-red-600 transition-all">
                🚪 Sair
              </button>
            </div>
          </aside>

          {/* OVERLAY MOBILE */}
          {isMenuOpen && (
            <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={() => setIsMenuOpen(false)} />
          )}

          {/* CONTEÚDO PRINCIPAL */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}