'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function NovaVendaPage() {
  const [produtos, setProdutos] = useState<any[]>([])
  const [carrinho, setCarrinho] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [finalizando, setFinalizando] = useState(false)

  // 1. Busca os produtos usando os nomes que funcionam: inventory, name, price
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

  // 2. Adiciona item ao carrinho com campo de desconto inicializado em 0
  const adicionarAoCarrinho = (produto: any) => {
    setCarrinho(prev => {
      const itemExiste = prev.find(item => item.id === produto.id)
      if (itemExiste) {
        return prev.map(item =>
          item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
        )
      }
      return [...prev, { ...produto, quantidade: 1, desconto_item: 0 }]
    })
  }

  // 3. Atualiza o desconto apenas daquele item específico
  const atualizarDesconto = (id: any, valor: string) => {
    const desc = parseFloat(valor) || 0
    setCarrinho(prev => prev.map(item => 
      item.id === id ? { ...item, desconto_item: desc } : item
    ))
  }

  const removerDoCarrinho = (id: any) => {
    setCarrinho(prev => prev.filter(item => item.id !== id))
  }

  // 4. Grava a venda detalhada no banco de dados
  const finalizarVenda = async () => {
    if (carrinho.length === 0) return
    setFinalizando(true)

    try {
      const itensParaSalvar = carrinho.map(item => ({
        product_name: item.name,
        quantity: item.quantidade,
        original_price: item.price,
        discount: item.desconto_item,
        final_price: (item.price * item.quantidade) - item.desconto_item
      }))

      const { error } = await supabase.from('sales_items').insert(itensParaSalvar)
      if (error) throw error

      alert("Venda registrada com sucesso!")
      setCarrinho([])
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message)
    } finally {
      setFinalizando(false)
    }
  }

  const totalGeral = carrinho.reduce((acc, item) => 
    acc + ((item.price * item.quantidade) - (item.desconto_item || 0)), 0
  )

  if (loading) return <div className="p-8 text-center text-black font-bold uppercase tracking-widest font-inter">Carregando Miah Doces...</div>

  return (
    <div className="flex flex-col lg:flex-row gap-6 text-black min-h-screen bg-gray-50">
      
      {/* VITRINE - Restaurada com os nomes corretos */}
      <div className="flex-1 px-2 md:px-0">
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

      {/* COMANDA COM CAMPO DE DESCONTO POR ITEM */}
      <div className="w-full lg:w-[450px] bg-white rounded-3xl shadow-xl border border-gray-100 p-6 flex flex-col h-auto lg:h-[calc(100vh-120px)] sticky top-24">
        <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
          <span>🛒</span> Comanda
        </h2>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {carrinho.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-10 grayscale">
              <span className="text-6xl mb-2">🧁</span>
              <p className="font-bold text-xs uppercase tracking-widest text-center text-black">Aguardando Pedido</p>
            </div>
          ) : (
            carrinho.map(item => (
              <div key={item.id} className="border-b border-gray-100 pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 text-black">
                    <p className="font-bold text-sm uppercase text-[11px] leading-tight">{item.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-1">
                      {item.quantidade}x R$ {Number(item.price).toFixed(2)}
                    </p>
                  </div>
                  <button onClick={() => removerDoCarrinho(item.id)} className="text-gray-300 hover:text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>

                <div className="flex items-center gap-4 mt-2">
                  <div className="flex-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Desconto (R$)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={item.desconto_item}
                      onChange={(e) => atualizarDesconto(item.id, e.target.value)}
                      className="w-full p-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-black focus:ring-1 focus:ring-pink-300 outline-none"
                    />
                  </div>
                  <div className="text-right">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Subtotal</label>
                    <p className="font-black text-pink-600 text-sm">
                      R$ {((item.price * item.quantidade) - (item.desconto_item || 0)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-gray-100 pt-6 mt-4">
          <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Total com Descontos</span>
            <span className="text-3xl font-black text-pink-600 tracking-tighter">
              R$ {totalGeral.toFixed(2)}
            </span>
          </div>
          
          <button
            onClick={finalizarVenda}
            disabled={carrinho.length === 0 || finalizando}
            className="w-full py-4 bg-pink-500 text-white font-black rounded-2xl shadow-lg hover:bg-pink-600 disabled:bg-gray-200 transition-all active:scale-[0.98] uppercase text-xs tracking-widest"
          >
            {finalizando ? 'Gravando...' : 'Finalizar Venda'}
          </button>
        </div>
      </div>
    </div>
  )
}