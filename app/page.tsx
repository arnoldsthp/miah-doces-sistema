'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Produto {
  id: string
  nome: string
  preco: number
}

interface ItemCarrinho extends Produto {
  quantidade: number
}

export default function NovaVendaPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [loading, setLoading] = useState(true)

  // Busca produtos do banco de dados
  useEffect(() => {
    async function fetchProdutos() {
      const { data, error } = await supabase.from('produtos').select('*')
      if (!error && data) setProdutos(data)
      setLoading(false)
    }
    fetchProdutos()
  }, [])

  // Adiciona item ao carrinho
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

  // FUNÇÃO DE REMOÇÃO (O que faltava)
  const removerDoCarrinho = (id: string) => {
    setCarrinho(prev => prev.filter(item => item.id !== id))
  }

  const total = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0)

  if (loading) return <div className="p-8 text-center text-black">Carregando produtos...</div>

  return (
    <div className="flex flex-col lg:flex-row gap-6 text-black">
      {/* LISTA DE PRODUTOS */}
      <div className="flex-1">
        <h2 className="text-xl font-bold mb-4 text-pink-600">Produtos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {produtos.map(produto => (
            <button
              key={produto.id}
              onClick={() => adicionarAoCarrinho(produto)}
              className="p-4 bg-white border rounded-xl shadow-sm hover:border-pink-300 transition-all text-left"
            >
              <p className="font-bold text-sm">{produto.nome}</p>
              <p className="text-pink-500 font-medium">R$ {produto.preco.toFixed(2)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* CARRINHO / COMANDA */}
      <div className="w-full lg:w-96 bg-white rounded-2xl shadow-lg border p-6 flex flex-col h-[calc(100vh-140px)]">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          🛒 Comanda Atual
        </h2>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {carrinho.length === 0 ? (
            <p className="text-gray-400 text-center mt-10">Carrinho vazio</p>
          ) : (
            carrinho.map(item => (
              <div key={item.id} className="flex items-center justify-between border-b pb-3 group">
                <div className="flex-1">
                  <p className="font-bold text-sm">{item.nome}</p>
                  <p className="text-xs text-gray-500">
                    {item.quantidade}x R$ {item.preco.toFixed(2)}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <p className="font-bold text-pink-600">
                    R$ {(item.preco * item.quantidade).toFixed(2)}
                  </p>
                  
                  {/* BOTÃO DE LIXEIRA */}
                  <button
                    onClick={() => removerDoCarrinho(item.id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Remover item"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="18" 
                      height="18" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold">Total</span>
            <span className="text-2xl font-black text-pink-600">
              R$ {total.toFixed(2)}
            </span>
          </div>
          
          <button
            disabled={carrinho.length === 0}
            className="w-full py-4 bg-pink-500 text-white font-bold rounded-xl shadow-lg hover:bg-pink-600 disabled:bg-gray-200 transition-all active:scale-95"
          >
            Finalizar Venda
          </button>
        </div>
      </div>
    </div>
  )
}