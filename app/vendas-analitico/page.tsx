'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Venda = {
  numero_pedido: string
  cliente: string
  forma_pagamento: string | null
  desconto_total: number
}

type ItemAnalitico = {
  id: string
  created_at: string
  product_name: string
  quantity: number
  original_price: number
  final_price: number
  discount: number
  vendas: Venda[]   // ← Supabase SEMPRE retorna array
}

type Filtro = 'hoje' | 'ontem' | '7d' | '15d' | '30d'

export default function VendasAnaliticoPage() {
  const [itens, setItens] = useState<ItemAnalitico[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<Filtro>('hoje')

  function calcularPeriodo(f: Filtro) {
    const hoje = new Date()
    const inicio = new Date()

    if (f === 'hoje') inicio.setHours(0, 0, 0, 0)
    if (f === 'ontem') {
      inicio.setDate(hoje.getDate() - 1)
      inicio.setHours(0, 0, 0, 0)
      hoje.setDate(hoje.getDate() - 1)
      hoje.setHours(23, 59, 59, 999)
    }
    if (f === '7d') inicio.setDate(hoje.getDate() - 7)
    if (f === '15d') inicio.setDate(hoje.getDate() - 15)
    if (f === '30d') inicio.setDate(hoje.getDate() - 30)

    return {
      inicio: inicio.toISOString(),
      fim: hoje.toISOString()
    }
  }

  async function carregar() {
    setLoading(true)

    const { inicio, fim } = calcularPeriodo(filtro)

    const { data, error } = await supabase
      .from('sales_items')
      .select(`
        id,
        created_at,
        product_name,
        quantity,
        original_price,
        final_price,
        discount,
        vendas (
          numero_pedido,
          cliente,
          forma_pagamento,
          desconto_total
        )
      `)
      .gte('created_at', inicio)
      .lte('created_at', fim)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro Supabase:', error)
      setItens([])
    } else {
      setItens((data || []) as ItemAnalitico[])
    }

    setLoading(false)
  }

  useEffect(() => {
    carregar()
  }, [filtro])

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-black">
      <h1 className="text-3xl font-black text-pink-600 mb-6">
        Análise de Vendas por Item
      </h1>

      {/* FILTROS */}
      <div className="flex gap-2 bg-white p-2 rounded-full w-fit shadow mb-6">
        {[
          ['hoje', 'HOJE'],
          ['ontem', 'ONTEM'],
          ['7d', '7D'],
          ['15d', '15D'],
          ['30d', '30D']
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setFiltro(k as Filtro)}
            className={`px-6 py-2 rounded-full font-bold ${
              filtro === k ? 'bg-pink-500 text-white' : 'text-gray-400'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {loading && <div className="font-bold">Carregando...</div>}

      {!loading && (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 uppercase text-xs">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Pedido</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Produto</th>
                <th className="p-3 text-center">Qtd</th>
                <th className="p-3">Preço</th>
                <th className="p-3 text-red-500">Desc.</th>
                <th className="p-3 text-green-600">Total</th>
                <th className="p-3">Pagamento</th>
              </tr>
            </thead>
            <tbody>
              {itens.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-400 font-bold">
                    Nenhuma venda encontrada
                  </td>
                </tr>
              )}

              {itens.map(item => {
                const venda = item.vendas?.[0]   // ← agora pegamos o primeiro

                const descontoUnit =
                  venda?.desconto_total && item.quantity
                    ? Number(venda.desconto_total) / item.quantity
                    : 0

                return (
                  <tr key={item.id} className="border-b">
                    <td className="p-3">
                      {new Date(item.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-3">{venda?.numero_pedido}</td>
                    <td className="p-3">{venda?.cliente?.toUpperCase()}</td>
                    <td className="p-3 font-bold">{item.product_name}</td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3">R$ {Number(item.original_price).toFixed(2)}</td>
                    <td className="p-3 text-red-600">
                      - R$ {descontoUnit.toFixed(2)}
                    </td>
                    <td className="p-3 text-green-700 font-bold">
                      R$ {Number(item.final_price).toFixed(2)}
                    </td>
                    <td className="p-3">{venda?.forma_pagamento || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
