'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function NovaVendaPage() {
  const [produtos, setProdutos] = useState<any[]>([])
  const [carrinho, setCarrinho] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [finalizando, setFinalizando] = useState(false)

  // Carrega vitrine (VIEW inventory)
  useEffect(() => {
    async function fetchProdutos() {
      setLoading(true)
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name', { ascending: true })

      if (!error && data) setProdutos(data)
      setLoading(false)
    }
    fetchProdutos()
  }, [])

  // Adicionar ao carrinho
  const adicionarAoCarrinho = (produto: any) => {
    if (produto.stock <= 0) return

    setCarrinho(prev => {
      const itemExiste = prev.find(i => i.id === produto.id)

      if (itemExiste) {
        if (itemExiste.quantidade + 1 > produto.stock) return prev
        return prev.map(i =>
          i.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i
        )
      }

      return [...prev, { ...produto, quantidade: 1, desconto_item: 0 }]
    })
  }

  const aumentarQuantidade = (id: number) => {
    setCarrinho(prev =>
      prev.map(item => {
        if (item.id !== id) return item
        const produto = produtos.find(p => p.id === id)
        if (!produto) return item
        if (item.quantidade + 1 > produto.stock) return item
        return { ...item, quantidade: item.quantidade + 1 }
      })
    )
  }

  const diminuirQuantidade = (id: number) => {
    setCarrinho(prev =>
      prev
        .map(item =>
          item.id === id ? { ...item, quantidade: item.quantidade - 1 } : item
        )
        .filter(item => item.quantidade > 0)
    )
  }

  const atualizarDesconto = (id: any, valor: string) => {
    const desc = parseFloat(valor) || 0
    setCarrinho(prev =>
      prev.map(item =>
        item.id === id ? { ...item, desconto_item: desc } : item
      )
    )
  }

  const removerDoCarrinho = (id: any) => {
    setCarrinho(prev => prev.filter(item => item.id !== id))
  }

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

      alert('Venda finalizada com sucesso!')
      setCarrinho([])
    } catch (err: any) {
      alert('Erro ao gravar venda: ' + err.message)
    } finally {
      setFinalizando(false)
    }
  }

  const totalGeral = carrinho.reduce(
    (acc, item) => acc + ((item.price * item.quantidade) - item.desconto_item),
    0
  )

  if (loading)
    return <div className="p-8 text-center font-bold">Carregando Vitrine...</div>

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-screen bg-gray-50 p-4">
      
      {/* VITRINE */}
      <div className="flex-1">
        <h2 className="text-2xl font-black text-pink-600 mb-6">Vitrine de Doces</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {produtos.map(produto => (
            <button
              key={produto.id}
              disabled={produto.stock <= 0}
              onClick={() => adicionarAoCarrinho(produto)}
              className={`p-4 bg-white border rounded-xl text-left flex flex-col justify-between h-32
                ${produto.stock <= 0 ? 'opacity-30 cursor-not-allowed' : 'hover:border-pink-400'}
              `}
            >
              <p className="font-bold text-sm">{produto.name}</p>
              <div>
                <p className="text-pink-600 font-black">
                  R$ {Number(produto.price).toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">Estoque: {produto.stock}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* COMANDA */}
      <div className="w-full lg:w-[400px] bg-white p-6 rounded-xl shadow-lg">
        <h2 className="font-black mb-4">Comanda</h2>

        <div className="space-y-4">
          {carrinho.map(item => (
            <div key={item.id} className="border-b pb-3">
              <div className="flex justify-between">
                <p className="font-bold text-sm">{item.name}</p>
                <button
                  onClick={() => removerDoCarrinho(item.id)}
                  className="text-red-500 text-xs"
                >
                  Remover
                </button>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => diminuirQuantidade(item.id)}
                  className="w-6 h-6 bg-gray-200 rounded-full"
                >–</button>

                <span className="w-6 text-center">{item.quantidade}</span>

                <button
                  onClick={() => aumentarQuantidade(item.id)}
                  className="w-6 h-6 bg-pink-500 text-white rounded-full"
                >+</button>

                <span className="text-xs text-gray-400 ml-2">
                  x R$ {Number(item.price).toFixed(2)}
                </span>
              </div>

              <input
                type="number"
                value={item.desconto_item}
                onChange={e => atualizarDesconto(item.id, e.target.value)}
                className="w-full mt-2 p-2 border rounded text-sm"
                placeholder="Desconto (R$)"
              />
            </div>
          ))}
        </div>

        <div className="mt-6">
          <p className="font-bold text-right">
            Total: R$ {totalGeral.toFixed(2)}
          </p>

          <button
            onClick={finalizarVenda}
            disabled={finalizando || carrinho.length === 0}
            className="w-full mt-4 py-3 bg-pink-500 text-white font-bold rounded"
          >
            {finalizando ? 'Gravando...' : 'Finalizar Venda'}
          </button>
        </div>
      </div>
    </div>
  )
}
