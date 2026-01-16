'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'

type LinhaVenda = {
  data: string
  pedido: string
  cliente: string
  produto: string
  qtd: number
  preco: number
  desc: number
  total: number
  totalAposDesconto: number
  pagamento: string
  status: string
}

type Filtro = 'HOJE' | 'ONTEM' | '7D' | '15D' | '30D'

function getDateRange(filtro: Filtro) {
  const inicio = new Date()
  const fim = new Date()

  fim.setHours(23, 59, 59, 999)

  switch (filtro) {
    case 'HOJE':
      inicio.setHours(0, 0, 0, 0)
      break
    case 'ONTEM':
      inicio.setDate(inicio.getDate() - 1)
      inicio.setHours(0, 0, 0, 0)
      fim.setDate(fim.getDate() - 1)
      break
    case '7D':
      inicio.setDate(inicio.getDate() - 6)
      inicio.setHours(0, 0, 0, 0)
      break
    case '15D':
      inicio.setDate(inicio.getDate() - 14)
      inicio.setHours(0, 0, 0, 0)
      break
    case '30D':
      inicio.setDate(inicio.getDate() - 29)
      inicio.setHours(0, 0, 0, 0)
      break
  }

  return {
    dataInicial: inicio.toISOString(),
    dataFinal: fim.toISOString(),
  }
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase()
  const base = 'px-2 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap'

  if (s === 'FECHADA') {
    return <span className={`${base} bg-green-100 text-green-700`}>FECHADA</span>
  }

  if (s === 'CANCELADA') {
    return <span className={`${base} bg-red-100 text-red-700`}>CANCELADA</span>
  }

  return <span className={`${base} bg-yellow-100 text-yellow-800`}>{s}</span>
}

export default function VendasAnaliticoPage() {
  const [filtro, setFiltro] = useState<Filtro>('HOJE')
  const [linhas, setLinhas] = useState<LinhaVenda[]>([])
  const [loading, setLoading] = useState(false)

  async function carregar() {
    setLoading(true)

    const { dataInicial, dataFinal } = getDateRange(filtro)
    const dataIni = dataInicial.split('T')[0]
    const dataFim = dataFinal.split('T')[0]

    const { data, error } = await supabase
      .from('sales_items')
      .select(`
        created_at,
        product_name,
        quantity,
        original_price,
        final_price,
        vendas (
          numero_pedido,
          cliente,
          forma_pagamento,
          total,
          status
        )
      `)
      .gte('created_at::date', dataIni)
      .lte('created_at::date', dataFim)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    const agrupado: Record<string, any[]> = {}

    ;(data || []).forEach((row: any) => {
      const pedido = row.vendas.numero_pedido
      if (!agrupado[pedido]) agrupado[pedido] = []
      agrupado[pedido].push(row)
    })

    const linhasCalculadas: LinhaVenda[] = []

    Object.values(agrupado).forEach((itens) => {
      const totalBruto = itens.reduce(
        (s, i) => s + i.original_price * i.quantity,
        0
      )

      const totalLiquido = Number(itens[0].vendas.total || 0)
      const descontoTotal = Number((totalBruto - totalLiquido).toFixed(2))
      const qtdLinhas = itens.length

      const base = Number((descontoTotal / qtdLinhas).toFixed(2))
      const resto = Number((descontoTotal - base * qtdLinhas).toFixed(2))

      itens.forEach((row, index) => {
        let descLinha = base
        if (index === 0 && resto !== 0) {
          descLinha = Number((descLinha + resto).toFixed(2))
        }

        const brutoLinha = row.original_price * row.quantity
        const totalApos = Number((brutoLinha - descLinha).toFixed(2))

        linhasCalculadas.push({
          data: row.created_at,
          pedido: row.vendas.numero_pedido,
          cliente: row.vendas.cliente,
          produto: row.product_name,
          qtd: row.quantity,
          preco: row.original_price,
          desc: descLinha,
          total: row.final_price,
          totalAposDesconto: totalApos,
          pagamento: row.vendas.forma_pagamento,
          status: row.vendas.status,
        })
      })
    })

    setLinhas(linhasCalculadas)
    setLoading(false)
  }

  useEffect(() => {
    carregar()
  }, [filtro])

  function exportarExcel() {
    const ws = XLSX.utils.json_to_sheet(linhas)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Vendas')
    XLSX.writeFile(wb, 'vendas-analitico.xlsx')
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-black text-gray-800 mb-6">
        Análise de Vendas por Item
      </h1>

      <div className="flex gap-3 mb-6 items-center">
        {(['HOJE', 'ONTEM', '7D', '15D', '30D'] as Filtro[]).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-full font-semibold ${
              filtro === f
                ? 'bg-pink-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {f}
          </button>
        ))}

        <button
          onClick={exportarExcel}
          className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg font-semibold"
        >
          Exportar Excel
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-[13px]">
          <thead className="bg-gray-100 border-b">
            <tr>
              {[
                'DATA',
                'PEDIDO',
                'STATUS',
                'CLIENTE',
                'PRODUTO',
                'QTD',
                'PREÇO',
                'TOTAL',
                'DESCONTO',
                'TOTAL FINAL',
                'MEIO PGTO',
              ].map((h) => (
                <th
                  key={h}
                  className="p-4 text-left font-semibold text-gray-700 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={11} className="p-6 text-center text-gray-500">
                  Carregando…
                </td>
              </tr>
            )}

            {!loading &&
              linhas.map((row, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap text-gray-800">
                    {new Date(row.data).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap font-medium text-gray-800">
                    {row.pedido}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <StatusBadge status={row.status} />
                  </td>
                  <td
                    className="px-3 py-4 whitespace-nowrap truncate max-w-[200px] font-medium text-gray-800"
                    title={row.cliente}
                  >
                    {row.cliente}
                  </td>
                  <td
                    className="px-3 py-4 whitespace-nowrap truncate max-w-[260px] font-medium text-gray-800"
                    title={row.produto}
                  >
                    {row.produto}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-center text-gray-800">
                    {row.qtd}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-gray-800">
                    {row.preco.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-gray-800">
                    {row.total.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-gray-800">
                    {row.desc.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap font-bold text-gray-900">
                    {row.totalAposDesconto.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-gray-800">
                    {row.pagamento}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
