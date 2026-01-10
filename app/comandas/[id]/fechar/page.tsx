'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Item = {
  id: number
  product_name: string
  quantity: number
  original_price: number
  final_price: number
}

export default function FecharComandaPage() {
  const params = useParams()
  const router = useRouter()
  const saleId = Number(params.id)

  const [itens, setItens] = useState<Item[]>([])
  const [total, setTotal] = useState(0)
  const [formaPagamento, setFormaPagamento] = useState('Crédito')
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    setLoading(true)

    const { data: items } = await supabase
      .from('sales_items')
      .select('*')
      .eq('sale_id', saleId)

    const soma = (items || []).reduce((s, i) => s + Number(i.final_price), 0)

    setItens(items || [])
    setTotal(soma)
    setLoading(false)
  }

  async function fechar() {
    setSalvando(true)

    await supabase.from('vendas').update({
      total,
      forma_pagamento: formaPagamento,
      status: 'FECHADA',
      fechado_em: new Date().toISOString()
    }).eq('id', saleId)

    localStorage.removeItem('saleId')
    router.push('/comandas')
  }

  useEffect(() => {
    carregar()
  }, [])

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-black mb-6">Fechar Comanda</h1>

      <div className="bg-white rounded-xl p-6 shadow">
        {itens.map(i => (
          <div key={i.id} className="flex justify-between border-b py-2">
            <span>{i.product_name} x {i.quantity}</span>
            <span>R$ {i.final_price.toFixed(2)}</span>
          </div>
        ))}

        <div className="mt-6 text-right font-black text-xl">
          Total: R$ {total.toFixed(2)}
        </div>

        <div className="mt-6">
          <label className="block text-sm font-bold mb-2">Forma de pagamento</label>
          <select
            value={formaPagamento}
            onChange={e => setFormaPagamento(e.target.value)}
            className="w-full p-3 border rounded"
          >
            <option>Crédito</option>
            <option>Débito</option>
            <option>Dinheiro</option>
            <option>Pix</option>
            <option>Voucher</option>
          </select>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 bg-gray-200 rounded font-bold"
          >
            Voltar
          </button>
          <button
            onClick={fechar}
            disabled={salvando}
            className="flex-1 py-3 bg-pink-500 text-white font-black rounded"
          >
            {salvando ? 'Fechando...' : 'Confirmar Pagamento'}
          </button>
        </div>
      </div>
    </div>
  )
}
