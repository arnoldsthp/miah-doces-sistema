'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// Estrutura exata da sua tabela 'inventory'
interface Produto {
  id: string | number
  name: string    // Nome correto da coluna
  price: number   // Nome correto da coluna
}

interface ItemCarrinho extends Produto {
  quantidade: number
}

export default function NovaVendaPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // 1. Busca produtos usando os nomes corretos: inventory, name, price
  useEffect(() => {
    async function fetchProdutos() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('inventory') // Nome da sua tabela
          .select('id, name, price')
          .order('name', { ascending: true })

        if (error) {
          console.error("Erro Supabase:", error)
          setErrorMessage(`Erro ao carregar: ${error.message}`)
          return
        }

        if (data) {
          setProdutos(data)
        }
      } catch (err: any) {
        setErrorMessage("Falha na conexão com o banco.")
      } finally {
        setLoading(false)
      }
    }
    fetchProdutos()
  }, [])

  // 2. Funções do Carrinho
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

  const removerDoCarrinho = (id: string | number) => {
    setCarrinho(prev => prev.filter(item => item.id !== id))
  }

  const total = carrinho.reduce((acc, item) => acc + item.price * item.quantidade, 0)

  if (loading) return <div className="p-8 text-center text-black font-bold">Carregando estoque da Miah Doces...</div>
  
  if (errorMessage) return (
    <div className="p-8 text-center">
      <p className="text-red-500 font-bold">{errorMessage}</p>
    </div>
  )

  return (
    <div className="flex flex-col lg:flex-row gap-6 text-black min-h-[calc(100vh-120px)]">
      
      {/* LISTA DE PRODUTOS */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6 px-2 md:px-0">
          <h2 className="text-2xl font-black text-pink-600">Vitrine de Doces</h2>
          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase">
            {produtos.length} Itens
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {produtos.map(produto => (
            <button
              key={produto.id}
              onClick={() => adicionarAoCarrinho(produto)}
              className="group p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-pink-300 hover:shadow-md transition-all text-left flex flex-col justify-between h-32 active:scale-95"
            >
              <p className="font-bold text-gray-800 leading-tight group-hover:text-pink-600 transition-colors line-clamp-2">
                {produto.name}
              </p>
              <p className="text-pink-500 font-black text-lg">
                R$ {Number(produto.price).toFixed(2)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* CARRINHO / COMANDA */}
      <div className="w-full lg:w-[400px] bg-white rounded-3xl shadow-xl border border-gray-100 p-6 flex flex-col h-[500px] lg:h-auto lg:max-h-[85vh] sticky bottom-0 lg:top-24">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">🛒</span>
          <h2 className="text-xl font-black text-gray-800">Comanda</h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {carrinho.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-20">
              <span className="text-5xl mb-2">🧁</span>
              <p className="font-bold">Selecione os doces</p>
            </div>
          ) : (
            carrinho.map(item => (
              <div key={item.id} className="flex items-center justify-between group">
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-800">{item.name}</p>
                  <p className="text-xs font-bold text-gray-400">
                    {item.quantidade}x R$ {Number(item.price).toFixed(2)}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 md:gap-4">
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
            className="w-full py-4 bg-pink-500 text-white font-black rounded-2xl shadow-lg hover:bg-pink-600 disabled:bg-gray-200 transition-all active:scale-[0.98]"
          >
            FINALIZAR VENDA
          </button>
        </div>
      </div>
    </div>
  )
}