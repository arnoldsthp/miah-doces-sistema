'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    setIsMenuOpen(false)
  }

  const isLoginPage = pathname === '/login'

  if (isLoginPage) {
    return (
      <html lang="pt-br">
        <body className={`${inter.className} bg-gray-100 text-gray-900`}>
          {children}
        </body>
      </html>
    )
  }

  return (
    <html lang="pt-br">
      <body className={`${inter.className} bg-gray-100 text-gray-900`}>
        <div className="flex flex-col md:flex-row h-screen overflow-hidden">

          {/* TOPO MOBILE */}
          <div className="md:hidden fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 bg-white border-b z-50 shadow-sm">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="font-black text-pink-600 text-xl tracking-tight"
            >
              Miah Marques
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-2xl text-pink-600"
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>

          {/* SIDEBAR */}
          <aside
            className={`
              fixed inset-y-0 left-0 z-40 w-64 bg-white border-r flex flex-col shadow-sm
              transition-transform duration-300
              ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
              md:relative md:translate-x-0
            `}
          >
            {/* LOGO */}
            <div className="p-6 border-b hidden md:block">
              <Link
                href="/"
                className="text-2xl font-black text-pink-600 tracking-tight"
              >
                Miah Marques
              </Link>
              <p className="text-[10px] uppercase font-bold text-gray-400 mt-1">
                Bolos e Salgados
              </p>
            </div>

            {/* MENU */}
            <nav className="flex-1 px-4 space-y-6 overflow-y-auto mt-20 md:mt-6">

              {/* DASHBOARD */}
              <div>
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-3 p-3 rounded-xl font-bold transition ${
                    pathname === '/dashboard'
                      ? 'bg-pink-600 text-white'
                      : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                  }`}
                >
                  📊 <span>Dashboard</span>
                </Link>
              </div>

              {/* VENDAS */}
              <div>
                <p className="text-[11px] font-black uppercase text-gray-400 mb-2 px-2">
                  Vendas
                </p>

                <Link
                  href="/"
                  className={`flex items-center gap-3 p-3 rounded-xl font-bold transition ${
                    pathname === '/'
                      ? 'bg-pink-600 text-white shadow'
                      : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                  }`}
                >
                  🛒 <span>Iniciar Nova Venda</span>
                </Link>

                <MenuLink
                  href="/vendas-analitico"
                  label="Análise de Vendas"
                  icon="📈"
                  pathname={pathname}
                />
                <MenuLink
                  href="/clientes"
                  label="Clientes"
                  icon="👥"
                  pathname={pathname}
                />
                <MenuLink
                  href="/comandas"
                  label="Comandas em Aberto"
                  icon="🧾"
                  pathname={pathname}
                />
              </div>

              {/* GESTÃO */}
              <div>
                <p className="text-[11px] font-black uppercase text-gray-400 mb-2 px-2">
                  Gestão
                </p>

                <MenuLink
                  href="/financeiro/contas-a-pagar"
                  label="Contas a Pagar"
                  icon="💰"
                  pathname={pathname}
                />
                <MenuLink
                  href="/estoque"
                  label="Entrada de Estoque"
                  icon="📦"
                  pathname={pathname}
                />
                <MenuLink
                  href="/financeiro"
                  label="Lançar Despesas"
                  icon="🧾"
                  pathname={pathname}
                />
              </div>
            </nav>

            {/* LOGOUT */}
            <div className="p-4 border-t">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-100 text-gray-500 font-black text-[10px] uppercase hover:bg-red-50 hover:text-red-600 transition"
              >
                🚪 Sair do Sistema
              </button>
            </div>
          </aside>

          {/* OVERLAY MOBILE */}
          {isMenuOpen && (
            <div
              className="fixed inset-0 bg-black/30 z-30 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
          )}

          {/* CONTEÚDO */}
          <main className="flex-1 overflow-y-auto bg-gray-100 pt-20 md:pt-8">
            <div className="p-4 md:p-8">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}

function MenuLink({
  href,
  label,
  icon,
  pathname,
}: {
  href: string
  label: string
  icon: string
  pathname: string
}) {
  const active = pathname === href

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 p-3 rounded-xl font-bold transition ${
        active
          ? 'bg-pink-600 text-white'
          : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
      }`}
    >
      <span>{icon}</span>
      <span className="text-sm">{label}</span>
    </Link>
  )
}
