'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Item = {
  id: number
  product_name: string
  quantity: number
  original_price: number
  discount: number
  final_price: number
}

type Comanda = {
  id: number
  cliente: string
  numero_pedido: string
  comanda_numero: number
  status: string
  total: number
}

export default function DetalheComandaPage() {
  const params = useParams()
  const router = useRouter()
  const saleId = Number(params.id)

  const [comanda, setComanda] = useState<Comanda | null>(null)
  const [itens, setItens] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  async function carregar() {
    setLoading(true)

    const { data: venda } = await supabase
      .from('vendas')
      .select('*')
      .eq('id', saleId)
      .single()

    const { data: items } = await supabase
      .from('sales_items')
      .select('*')
      .eq('sale_id', saleId)

    setComanda(venda)
    setItens(items || [])
    setLoading(false)
  }

  async function atualizarQuantidade(id: number, nova: number) {
    if (nova <= 0) {
      await supabase.from('sales_items').delete().eq('id', id)
    } else {
      const item = itens.find(i => i.id === id)
      if (!item) return

      await supabase.from('sales_items').update({
        quantity: nova,
        final_price: (item.original_price * nova) - item.discount
      }).eq('id', id)
    }

    await recalcularTotal()
    carregar()
  }

  async function recalcularTotal() {
    const { data } = await supabase
      .from('sales_items')
      .select('final_price')
      .eq('sale_id', saleId)

    const total = (data || []).reduce((s, i) => s + Number(i.final_price), 0)

    await supabase.from('vendas').update({ total }).eq('id', saleId)
  }

  async function fecharComanda() {
    router.push(`/comandas/${saleId}/fechar`)
  }

  useEffect(() => {
    carregar()
  }, [])

  if (loading || !comanda) {
    return <div className="p-8 font-bold">Carregando comanda...</div>
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-black mb-2">Comanda {comanda.comanda_numero}</h1>
      <p className="text-sm text-gray-500 mb-6">{comanda.numero_pedido} — {comanda.cliente}</p>

      <div className="bg-white rounded-xl shadow p-6">
        {itens.map(i => (
          <div key={i.id} className="flex justify-between items-center border-b py-3">
            <div>
              <p className="font-bold">{i.product_name}</p>
              <p className="text-xs text-gray-400">
                R$ {i.original_price.toFixed(2)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => atualizarQuantidade(i.id, i.quantity - 1)} className="px-3 py-1 bg-gray-200 rounded">–</button>
              <span className="w-6 text-center">{i.quantity}</span>
              <button onClick={() => atualizarQuantidade(i.id, i.quantity + 1)} className="px-3 py-1 bg-pink-500 text-white rounded">+</button>
            </div>

            <p className="font-bold">
              R$ {i.final_price.toFixed(2)}
            </p>
          </div>
        ))}

        <div className="mt-6 text-right font-black text-lg">
          Total: R$ {Number(comanda.total || 0).toFixed(2)}
        </div>

        <div className="flex gap-4 mt-6">
          <button onClick={() => router.push('/comandas')} className="flex-1 py-3 bg-gray-200 rounded-xl font-bold">
            Voltar
          </button>
          <button onClick={fecharComanda} className="flex-1 py-3 bg-pink-500 text-white rounded-xl font-black">
            Fechar Comanda
          </button>
        </div>
      </div>
    </div>
  )
}
