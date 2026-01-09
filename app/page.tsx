'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function NovaVendaPage() {
  const [produtos, setProdutos] = useState<any[]>([])
  const [carrinho, setCarrinho] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  const adicionarAoCarrinho = (produto: any) => {
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

  const total = carrinho.reduce((acc, item) => acc + (item.price * item.quantidade), 0)

  if (loading) return <div className="p-8 text-center text-black font-bold font-inter uppercase tracking-widest">Carregando Miah Doces...</div>

  return (
    <div className="flex flex-col lg:flex-row gap-6 text-black min-h-screen bg-gray-50">
      
      {/* LISTA DE PRODUTOS */}
      <div className="flex-1">
        <h2 className="text-2xl font-black text-pink-600 mb-6 uppercase tracking-tighter">Vitrine de Doces</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {produtos.map(produto => (
            <button
              key={produto.id}
              onClick={() => adicionarAoCarrinho(produto)}
              className="group p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-pink-300 transition-all text-left flex flex-col justify-between h-32 active:scale-95"
            >
              <p className="font-bold text-gray-800 leading-tight uppercase text-[11px] group-hover:text-pink-600 transition-colors">
                {produto.name}
              </p>
              <p className="text-pink-500 font-black text-lg">
                R$ {Number(produto.price).toFixed(2)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* COMANDA / CARRINHO */}
      <div className="w-full lg:w-[400px] bg-white rounded-3xl shadow-xl border border-gray-100 p-6 flex flex-col h-[500px] lg:h-[calc(100vh-120px)] sticky top-24">
        <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
          <span>🛒</span> Comanda
        </h2>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {carrinho.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-10 grayscale">
              <span className="text-6xl mb-2">🧁</span>
              <p className="font-bold text-xs uppercase tracking-widest">Aguardando Pedido</p>
            </div>
          ) : (
            carrinho.map(item => (
              <div key={item.id} className="flex items-center justify-between border-b border-gray-50 pb-3">
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-800 uppercase text-[11px] leading-tight">{item.name}</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-1">
                    {item.quantidade}x R$ {Number(item.price).toFixed(2)}
                  </p>
                </div>
                <p className="font-black text-pink-600 text-sm">
                  R$ {(item.price * item.quantidade).toFixed(2)}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-gray-100 pt-6 mt-4">
          <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Total Geral</span>
            <span className="text-3xl font-black text-pink-600 tracking-tighter">
              R$ {total.toFixed(2)}
            </span>
          </div>
          
          <button
            disabled={carrinho.length === 0}
            className="w-full py-4 bg-pink-500 text-white font-black rounded-2xl shadow-lg shadow-pink-100 hover:bg-pink-600 disabled:bg-gray-200 disabled:shadow-none transition-all active:scale-[0.98] uppercase text-xs tracking-widest"
          >
            Finalizar Venda
          </button>
        </div>
      </div>
    </div>
  )
}