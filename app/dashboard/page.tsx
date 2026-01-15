'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Metricas = {
  vendas: number
  canceladas: number
  abertas: number
  credito: number
  debito: number
  pix: number
  dinheiro: number
  descontos: number
  qtd_vendas: number
}

export default function Dashboard() {
  const [periodo, setPeriodo] = useState<'hoje' | 'ontem' | '7d' | '15d' | '30d'>('hoje')
  const [de, setDe] = useState<string | null>(null)
  const [ate, setAte] = useState<string | null>(null)

  const [metricas, setMetricas] = useState<Metricas>({
    vendas: 0,
    canceladas: 0,
    abertas: 0,
    credito: 0,
    debito: 0,
    pix: 0,
    dinheiro: 0,
    descontos: 0,
    qtd_vendas: 0
  })

  function calcularIntervalo() {
    if (de && ate) {
      return {
        inicio: new Date(de + 'T00:00:00'),
        fim: new Date(ate + 'T23:59:59.999')
      }
    }

    const agora = new Date()

    if (periodo === 'hoje') {
      const inicio = new Date()
      inicio.setHours(0, 0, 0, 0)
      return { inicio, fim: agora }
    }

    if (periodo === 'ontem') {
      const inicio = new Date()
      inicio.setDate(inicio.getDate() - 1)
      inicio.setHours(0, 0, 0, 0)

      const fim = new Date()
      fim.setDate(fim.getDate() - 1)
      fim.setHours(23, 59, 59, 999)

      return { inicio, fim }
    }

    const inicio = new Date()
    inicio.setHours(0, 0, 0, 0)

    if (periodo === '7d') inicio.setDate(inicio.getDate() - 6)
    if (periodo === '15d') inicio.setDate(inicio.getDate() - 14)
    if (periodo === '30d') inicio.setDate(inicio.getDate() - 29)

    return { inicio, fim: agora }
  }

  async function carregarDados() {
    const { inicio, fim } = calcularIntervalo()

    const { data, error } = await supabase
  .rpc('dashboard_financeiro', {
    data_inicio: new Date(inicio).toISOString(),
    data_fim: new Date(fim).toISOString()
  })

    if (error || !data || data.length === 0) return

    const r = data[0]

    setMetricas({
      vendas: r.total_vendas || 0,
      canceladas: r.total_cancelado || 0,
      abertas: 0,
      credito: r.credito || 0,
      debito: r.debito || 0,
      pix: r.pix || 0,
      dinheiro: r.dinheiro || 0,
      descontos: r.total_descontos || 0,
      qtd_vendas: r.qtd_vendas || 0
    })
  }

  useEffect(() => {
    carregarDados()
  }, [periodo, de, ate])

  const ticketMedio =
    metricas.qtd_vendas > 0 ? metricas.vendas / metricas.qtd_vendas : 0

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-black">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black">Dashboard</h1>
          <p className="text-gray-400 text-xs">Miah Doces - Visão Geral</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-white p-1 rounded-xl shadow">
            {['hoje', 'ontem', '7d', '15d', '30d'].map(p => (
              <button
                key={p}
                onClick={() => {
                  setPeriodo(p as any)
                  setDe(null)
                  setAte(null)
                }}
                className={`px-4 py-2 text-xs font-black rounded-lg ${periodo === p ? 'bg-pink-600 text-white' : 'text-gray-400'}`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow">
            <input type="date" value={de || ''} onChange={e => setDe(e.target.value)} className="text-xs border p-1 rounded" />
            <span className="text-xs">até</span>
            <input type="date" value={ate || ''} onChange={e => setAte(e.target.value)} className="text-xs border p-1 rounded" />
          </div>
        </div>
      </header>

      {/* CARDS PRINCIPAIS */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <Card titulo="Vendas Finalizadas" valor={metricas.vendas} cor="green" />
        <Card titulo="Vendas Canceladas" valor={metricas.canceladas} cor="red" />
        <Card titulo="Total de Descontos" valor={metricas.descontos} cor="amber" />
        <Card titulo="Ticket Médio" valor={ticketMedio} cor="gray" />
      </div>

      {/* FORMAS DE PAGAMENTO */}
      <div className="grid grid-cols-4 gap-6">
        <Card titulo="Crédito" valor={metricas.credito} />
        <Card titulo="Débito" valor={metricas.debito} />
        <Card titulo="Pix" valor={metricas.pix} />
        <Card titulo="Dinheiro" valor={metricas.dinheiro} />
      </div>
    </div>
  )
}

function Card({ titulo, valor, cor = 'gray' }: { titulo: string; valor: number; cor?: string }) {
  const cores: any = {
    green: 'border-green-500 text-green-600',
    red: 'border-red-500 text-red-600',
    amber: 'border-amber-500 text-amber-600',
    gray: 'border-gray-300 text-gray-800'
  }

  return (
    <div className={`bg-white p-6 rounded-3xl shadow-sm border-l-4 ${cores[cor]}`}>
      <span className="text-xs font-bold uppercase text-gray-400">{titulo}</span>
      <div className="text-3xl font-black mt-2">R$ {valor.toFixed(2)}</div>
    </div>
  )
}
