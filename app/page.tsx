'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Produto {
  id: string | number
  name: string
  price: number
}

interface ItemCarrinho extends Produto {
  quantidade: number
}

export default function NovaVendaPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [loading, setLoading] = useState(true)

  // 1. Busca os produtos (Voltei para a forma simples que funcionava)
  useEffect(() => {
    async function fetchProdutos() {
      setLoading(true)
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name', { ascending: true })

      if (!error && data) {
        setProdutos(data)
      }
      setLoading(false)
    }
    fetchProdutos()
  }, [])

  // 2. Adiciona item
  const adicionarAoCarrinho = (produto: Produto) => {
    setCarrinho(prev => {
      const itemExiste = prev.find(item => item.id === produto.id)
      if (itemExiste) {
        return prev.map(item =>
          item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
        )
      }
      return [...prev, { ...produto, quantidade: 1 }]
    })
  }

  // 3. REMOVE ITEM (A lixeira que você pediu)
  const removerDoCarrinho = (id: string | number) => {
    setCarrinho(prev => prev.filter(item => item.id !== id))
  }

  const total = carrinho.reduce((acc, item) => acc + item.price * item.quantidade, 0)

  if (loading) return <div className="p-8 text-center text-black font-bold tracking-tight">Carregando Miah Doces...</div>

  return (
    <div className="flex flex-col lg:flex-row gap-6 text-black min-h-[calc(100vh-120px)]">
      
      {/* VITRINE DE PRODUTOS */}
      <div className="flex-1 px-2 md:px-0">
        <h2 className="text-2xl font-black text-pink-600 mb-6 tracking-tighter">Vitrine de Doces</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {produtos.map(produto => (
            <button
              key={produto.id}
              onClick={() => adicionarAoCarrinho(produto)}
              className="group p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-pink-300 transition-all text-left flex flex-col justify-between h-32 active:scale-95"
            >
              <p className="font-bold text-gray-800 leading-tight group-hover:text-pink-600 line-clamp-2 uppercase text-xs">
                {produto.name}
              </p>
              <p className="text-pink-500 font-black text-lg">
                R$ {Number(produto.price).toFixed(2)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* COMANDA COM LIXEIRA */}
      <div className="w-full lg:w-[400px] bg-white rounded-3xl shadow-xl border border-gray-100 p-6 flex flex-col h-[500px] lg:h-auto lg:max-h-[85vh] sticky bottom-0 lg:top-24">
        <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
          <span>🛒</span> Comanda
        </h2>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {carrinho.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-10">
              <span className="text-6xl">🧁</span>
            </div>
          ) : (
            carrinho.map(item => (
              <div key={item.id} className="flex items-center justify-between group animate-in slide-in-from-right-2">
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-800 uppercase text-[11px] leading-tight">{item.name}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    {item.quantidade}x R$ {Number(item.price).toFixed(2)}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <p className="font-black text-pink-600 text-sm whitespace-nowrap">
                    R$ {(item.price * item.quantidade).toFixed(2)}
                  </p>
                  
                  {/* BOTÃO LIXEIRA */}
                  <button
                    onClick={() => removerDoCarrinho(item.id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-gray-100 pt-6 mt-4">
          <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Total</span>
            <span className="text-3xl font-black text-pink-600">
              R$ {total.toFixed(2)}
            </span>
          </div>
          
          <button
            disabled={carrinho.length === 0}
            className="w-full py-4 bg-pink-500 text-white font-black rounded-2xl shadow-lg hover:bg-pink-600 transition-all active:scale-[0.98]"
          >
            FINALIZAR VENDA
          </button>
        </div>
      </div>
    </div>
  )
}