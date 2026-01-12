'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Item = {
  id: string
  created_at: string
  product_name: string
  quantity: number
  original_price: number
  final_price: number
  discount: number | null
  vendas: {
    numero_pedido: string
    cliente: string
    forma_pagamento: string | null
    desconto_total: number | null
  }
}

const filtros = [
  { key: 'hoje', label: 'HOJE', dias: 0 },
  { key: 'ontem', label: 'ONTEM', dias: 1 },
  { key: '7d', label: '7D', dias: 7 },
  { key: '15d', label: '15D', dias: 15 },
  { key: '30d', label: '30D', dias: 30 },
]

export default function VendasAnaliticoPage() {
  const [itens, setItens] = useState<Item[]>([])
  const [filtro, setFiltro] = useState('hoje')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    carregar()
  }, [filtro])

  async function carregar() {
    setLoading(true)

    const filtroAtual = filtros.find(f => f.key === filtro)!

    let inicio = new Date()
    inicio.setHours(0, 0, 0, 0)

    if (filtroAtual.dias > 0) {
      inicio.setDate(inicio.getDate() - filtroAtual.dias)
    }

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
        sale_id,
        vendas (
          numero_pedido,
          cliente,
          forma_pagamento,
          desconto_total
        )
      `)
      .gte('created_at', inicio.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro Supabase:', error)
      setItens([])
    } else {
      setItens(data || [])
    }

    setLoading(false)
  }

  function descontoPorItem(item: Item) {
    const total = item.vendas?.desconto_total || 0
    if (!total) return 0

    return total / item.quantity
  }

  function exportarExcel() {
    const header = [
      'Data',
      'Pedido',
      'Cliente',
      'Produto',
      'Qtd',
      'Preço',
      'Desconto',
      'Total',
      'Pagamento',
    ]

    const linhas = itens.map(i => [
      new Date(i.created_at).toLocaleString('pt-BR'),
      i.vendas?.numero_pedido,
      i.vendas?.cliente?.toUpperCase(),
      i.product_name,
      i.quantity,
      i.original_price,
      descontoPorItem(i).toFixed(2),
      i.final_price,
      i.vendas?.forma_pagamento || '',
    ])

    const csv = [header, ...linhas].map(l => l.join(';')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'vendas.csv'
    a.click()
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black text-pink-600">
          Análise de Vendas por Item
        </h1>

        <button
          onClick={exportarExcel}
          className="bg-green-500 text-white px-4 py-2 rounded font-bold"
        >
          Exportar Excel
        </button>
      </div>

      <div className="flex gap-2 mb-6 bg-white p-2 rounded-full shadow w-fit">
        {filtros.map(f => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`px-4 py-2 rounded-full font-bold ${
              filtro === f.key
                ? 'bg-pink-500 text-white'
                : 'text-gray-400'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="font-bold text-center mt-20">Carregando…</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Pedido</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Produto</th>
                <th className="p-3">Qtd</th>
                <th className="p-3">Preço</th>
                <th className="p-3 text-red-500">Desc.</th>
                <th className="p-3 text-green-600">Total</th>
                <th className="p-3">Pagamento</th>
              </tr>
            </thead>
            <tbody>
              {itens.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-400">
                    Nenhuma venda encontrada
                  </td>
                </tr>
              )}

              {itens.map(i => (
                <tr key={i.id} className="border-b">
                  <td className="p-3">
                    {new Date(i.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td className="p-3">{i.vendas?.numero_pedido}</td>
                  <td className="p-3 font-bold">
                    {i.vendas?.cliente?.toUpperCase()}
                  </td>
                  <td className="p-3">{i.product_name}</td>
                  <td className="p-3 text-center">{i.quantity}</td>
                  <td className="p-3">
                    R$ {Number(i.original_price).toFixed(2)}
                  </td>
                  <td className="p-3 text-red-500">
                    R$ {descontoPorItem(i).toFixed(2)}
                  </td>
                  <td className="p-3 text-green-600 font-bold">
                    R$ {Number(i.final_price).toFixed(2)}
                  </td>
                  <td className="p-3">
                    {i.vendas?.forma_pagamento || ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
