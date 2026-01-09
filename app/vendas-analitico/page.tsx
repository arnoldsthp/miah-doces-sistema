'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'

export default function VendasAnalitico() {
  const [periodo, setPeriodo] = useState('hoje')
  const [statusFiltro, setStatusFiltro] = useState('todos')
  const [vendas, setVendas] = useState<any[]>([])
  const [vendaSelecionada, setVendaSelecionada] = useState<any>(null)

  async function carregarVendas() {
    let dataInicio = new Date()
    dataInicio.setHours(0, 0, 0, 0)
    if (periodo === 'ontem') dataInicio.setDate(dataInicio.getDate() - 1)
    else if (periodo === '7d') dataInicio.setDate(dataInicio.getDate() - 7)
    else if (periodo === '15d') dataInicio.setDate(dataInicio.getDate() - 15)
    else if (periodo === '30d') dataInicio.setDate(dataInicio.getDate() - 30)

    let query = supabase.from('vendas').select('*').gte('created_at', dataInicio.toISOString())
    
    if (statusFiltro !== 'todos') {
      query = query.eq('status', statusFiltro)
    }

    const { data } = await query.order('created_at', { ascending: false })
    setVendas(data || [])
  }

  function exportarExcel() {
    const dadosExcel = vendas.map(v => ({
      Data: new Date(v.created_at).toLocaleDateString('pt-BR'),
      Status: v.status.toUpperCase(),
      Pagamento: v.metodo_pagamento || '---',
      Local: v.mesa_comanda || 'BALCÃO',
      Total: parseFloat(v.total)
    }))
    const ws = XLSX.utils.json_to_sheet(dadosExcel)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Vendas")
    XLSX.writeFile(wb, `Relatorio_Miah_${periodo}_${statusFiltro}.xlsx`)
  }

  useEffect(() => { carregarVendas() }, [periodo, statusFiltro])

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-black">
      <header className="mb-8 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Análise de Vendas</h1>
          <button onClick={exportarExcel} className="bg-green-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-green-100">📥 Exportar Excel</button>
        </div>

        <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <div className="space-y-2">
            <p className="text-[9px] font-black text-gray-400 uppercase ml-1">Período</p>
            <div className="flex bg-gray-50 p-1 rounded-xl">
              {['hoje', 'ontem', '7d', '15d', '30d'].map((p) => (
                <button key={p} onClick={() => setPeriodo(p)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase ${periodo === p ? 'bg-pink-600 text-white' : 'text-gray-400'}`}>{p}</button>
              ))}
            </div>
          </div>

          <div className="space-y-2 border-l pl-4">
            <p className="text-[9px] font-black text-gray-400 uppercase ml-1">Filtrar Status</p>
            <div className="flex bg-gray-50 p-1 rounded-xl">
              {['todos', 'finalizada', 'aberta', 'cancelada'].map((s) => (
                <button key={s} onClick={() => setStatusFiltro(s)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase ${statusFiltro === s ? 'bg-gray-800 text-white' : 'text-gray-400'}`}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-[10px] font-black uppercase text-gray-400">
            <tr>
              <th className="p-4">Data/Hora</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4">Pagamento</th>
              <th className="p-4">Mesa/Cliente</th>
              <th className="p-4 text-right">Total</th>
              <th className="p-4 text-center">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {vendas.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50 transition-all">
                <td className="p-4 text-xs font-bold">{new Date(v.created_at).toLocaleDateString('pt-BR')} <br/><span className="text-[10px] text-gray-400 font-normal">{new Date(v.created_at).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</span></td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${v.status === 'finalizada' ? 'bg-green-100 text-green-700' : v.status === 'cancelada' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{v.status}</span>
                </td>
                <td className="p-4 text-[10px] font-black text-gray-400 uppercase">{v.metodo_pagamento || '---'}</td>
                <td className="p-4 font-bold text-xs uppercase">{v.mesa_comanda} <br/><span className="text-[9px] text-gray-400 font-normal italic-none">{v.cliente}</span></td>
                <td className="p-4 text-right font-black font-mono">R$ {parseFloat(v.total).toFixed(2)}</td>
                <td className="p-4 text-center"><button onClick={() => setVendaSelecionada(v)} className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase hover:bg-pink-600 hover:text-white transition-all">Detalhes</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {vendaSelecionada && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-8 bg-gray-50 border-b flex justify-between items-center"><h2 className="font-black uppercase tracking-tight">Detalhes da Venda</h2><button onClick={() => setVendaSelecionada(null)} className="text-gray-400 font-bold text-2xl">×</button></div>
            <div className="p-8">
              {vendaSelecionada.items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between py-2 border-b border-gray-50 text-sm"><span><strong className="text-pink-600 font-black">{item.quantidade}x</strong> {item.nome}</span><span className="font-mono font-bold">R$ {(item.preco * item.quantidade).toFixed(2)}</span></div>
              ))}
              <div className="mt-6 flex justify-between items-center"><span className="font-black text-gray-400 uppercase text-[10px]">Total</span><span className="text-2xl font-black text-green-600 font-mono italic-none">R$ {parseFloat(vendaSelecionada.total).toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}