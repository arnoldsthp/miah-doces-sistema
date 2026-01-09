'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Dashboard() {
  const [periodo, setPeriodo] = useState('hoje')
  const [metricas, setMetricas] = useState({ vendas: 0, canceladas: 0, abertas: 0 })

  async function carregarDados() {
    let dataInicio = new Date()
    dataInicio.setHours(0, 0, 0, 0)
    if (periodo === 'ontem') dataInicio.setDate(dataInicio.getDate() - 1)
    else if (periodo === '7d') dataInicio.setDate(dataInicio.getDate() - 7)
    else if (periodo === '15d') dataInicio.setDate(dataInicio.getDate() - 15)
    else if (periodo === '30d') dataInicio.setDate(dataInicio.getDate() - 30)

    const { data: vendasData } = await supabase.from('vendas').select('*').gte('created_at', dataInicio.toISOString())

    setMetricas({
      vendas: vendasData?.filter(v => v.status === 'finalizada').reduce((acc, v) => acc + parseFloat(v.total || 0), 0) || 0,
      canceladas: vendasData?.filter(v => v.status === 'cancelada').reduce((acc, v) => acc + parseFloat(v.total || 0), 0) || 0,
      abertas: vendasData?.filter(v => v.status === 'aberta').reduce((acc, v) => acc + parseFloat(v.total || 0), 0) || 0
    })
  }

  useEffect(() => { carregarDados() }, [periodo])

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-black font-sans">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] mt-1">Miah Doces - Visão Geral</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
          {['hoje', 'ontem', '7d', '15d', '30d'].map((p) => (
            <button key={p} onClick={() => setPeriodo(p)} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${periodo === p ? 'bg-pink-600 text-white shadow-md' : 'text-gray-400'}`}>{p.toUpperCase()}</button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/vendas-analitico" className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-green-500 hover:scale-105 transition-transform">
          <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Vendas Finalizadas</span>
          <span className="text-3xl font-black text-green-600 font-mono italic-none">R$ {metricas.vendas.toFixed(2)}</span>
          <p className="text-[9px] text-blue-500 font-bold mt-2 uppercase underline">Ver Relatório →</p>
        </Link>

        <Link href="/comandas" className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-amber-500 hover:scale-105 transition-transform">
          <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Comandas em Aberto</span>
          <span className="text-3xl font-black text-amber-600 font-mono italic-none">R$ {metricas.abertas.toFixed(2)}</span>
          <p className="text-[9px] text-blue-500 font-bold mt-2 uppercase underline">Ir para Comandas →</p>
        </Link>

        <Link href="/vendas-analitico" className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-red-500 hover:scale-105 transition-transform">
          <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Vendas Canceladas</span>
          <span className="text-3xl font-black text-red-600 font-mono italic-none">R$ {metricas.canceladas.toFixed(2)}</span>
          <p className="text-[9px] text-blue-500 font-bold mt-2 uppercase underline">Ver Cancelamentos →</p>
        </Link>
      </div>
    </div>
  )
}