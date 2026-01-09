'use client'
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // "Iniciar Nova Venda" no topo, seguidos pelos outros em ordem alfabética
  const menuItems = [
    { name: 'Iniciar Nova Venda', href: '/', icon: '🛒' }, // Antiga Frente de Caixa
    { name: 'Análise de Vendas', href: '/vendas-analitico', icon: '📈' },
    { name: 'Comandas em Aberto', href: '/comandas', icon: '🧾' },
    { name: 'Contas a Pagar', href: '/contas', icon: '📑' },
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Entrada de Estoque', href: '/estoque', icon: '📦' },
    { name: 'Lançar Despesas', href: '/financeiro', icon: '💸' },
  ]

  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-100 text-black">
          <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
            <div className="p-6 border-b border-gray-50 mb-4">
              <h2 className="text-2xl font-black text-pink-600 tracking-tight">Miah Doces</h2>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest italic-none">Painel de Gestão</p>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${
                    pathname === item.href 
                    ? 'bg-pink-600 text-white shadow-md' // Destaque maior para o item ativo
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
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-50 text-gray-400 font-black text-[10px] uppercase hover:bg-red-50 hover:text-red-600 transition-all italic-none"
              >
                🚪 Sair do Sistema
              </button>
            </div>
          </aside>

          <main className="flex-1 overflow-y-auto bg-gray-50">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}