'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ContasAPagar() {
  const [contas, setContas] = useState<any[]>([])
  const [contaParaEditar, setContaParaEditar] = useState<any>(null)
  
  // Pegamos a data de hoje no formato YYYY-MM-DD para comparar corretamente
  const hoje = new Date().toISOString().split('T')[0]

  async function carregarContas() {
    const { data } = await supabase
      .from('despesas_fixas')
      .select('*')
      .order('pago', { ascending: true }) // Pendentes primeiro
      .order('data_vencimento', { ascending: true })
    setContas(data || [])
  }

  async function salvarAlteracoes(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase
      .from('despesas_fixas')
      .update({
        descricao: contaParaEditar.descricao,
        fornecedor: contaParaEditar.fornecedor,
        valor: parseFloat(contaParaEditar.valor),
        data_vencimento: contaParaEditar.data_vencimento,
        forma_pagamento: contaParaEditar.forma_pagamento,
        pago: contaParaEditar.pago 
      })
      .eq('id', contaParaEditar.id)

    if (error) alert("Erro ao atualizar: " + error.message)
    else {
      setContaParaEditar(null)
      carregarContas()
    }
  }

  async function alternarStatusRapido(id: number, statusAtual: boolean) {
    const { error } = await supabase
      .from('despesas_fixas')
      .update({ pago: !statusAtual })
      .eq('id', id)
    
    if (!error) carregarContas()
  }

  useEffect(() => { carregarContas() }, [])

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-black font-sans">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-red-600 tracking-tight uppercase italic-none">📑 Contas a Pagar</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Status automático por vencimento</p>
        </div>
      </header>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b text-[10px] font-black uppercase text-gray-400">
            <tr>
              <th className="p-4">Vencimento</th>
              <th className="p-4">Descrição/Fornecedor</th>
              <th className="p-4 text-right">Valor</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {contas.map((c) => {
              // Lógica de definição de status
              let statusLabel = ""
              let statusColor = ""

              if (c.pago) {
                statusLabel = "PAGO"
                statusColor = "bg-green-100 text-green-700"
              } else if (c.data_vencimento < hoje) {
                statusLabel = "VENCIDO"
                statusColor = "bg-red-600 text-white shadow-md animate-pulse"
              } else {
                statusLabel = "A VENCER"
                statusColor = "bg-amber-100 text-amber-700"
              }

              return (
                <tr key={c.id} className={`hover:bg-gray-50 transition-all ${c.pago ? 'opacity-50' : ''}`}>
                  <td className={`p-4 font-bold ${!c.pago && c.data_vencimento < hoje ? 'text-red-600' : 'text-gray-900'}`}>
                    {new Date(c.data_vencimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                  </td>
                  <td className="p-4">
                    <p className="font-bold uppercase text-gray-800 leading-tight">{c.descricao}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase">{c.fornecedor || '---'}</p>
                  </td>
                  <td className="p-4 text-right font-black font-mono text-red-600">
                    R$ {parseFloat(c.valor || 0).toFixed(2)}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => alternarStatusRapido(c.id, c.pago)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all min-w-[90px] ${statusColor}`}
                    >
                      {statusLabel}
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => setContaParaEditar(c)}
                      className="bg-gray-100 p-2.5 rounded-xl hover:bg-gray-200 transition-all text-lg"
                    >
                      ✏️
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EDIÇÃO */}
      {contaParaEditar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={salvarAlteracoes} className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-xl font-black uppercase mb-6 text-gray-900 italic-none">Editar Lançamento</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Descrição</label>
                <input required value={contaParaEditar.descricao || ''} onChange={e => setContaParaEditar({...contaParaEditar, descricao: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-red-100 uppercase text-xs" />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">O pagamento já foi feito?</label>
                <div className="flex gap-2">
                    <button type="button" onClick={() => setContaParaEditar({...contaParaEditar, pago: true})} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase border-2 transition-all ${contaParaEditar.pago ? 'bg-green-600 border-green-600 text-white' : 'border-gray-100 text-gray-400'}`}>SIM (PAGO)</button>
                    <button type="button" onClick={() => setContaParaEditar({...contaParaEditar, pago: false})} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase border-2 transition-all ${!contaParaEditar.pago ? 'bg-red-600 border-red-600 text-white' : 'border-gray-100 text-gray-400'}`}>NÃO (PENDENTE)</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Valor (R$)</label>
                  <input required type="number" step="0.01" value={contaParaEditar.valor || 0} onChange={e => setContaParaEditar({...contaParaEditar, valor: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-black outline-none focus:ring-2 focus:ring-red-100 font-mono" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Vencimento</label>
                  <input required type="date" value={contaParaEditar.data_vencimento || ''} onChange={e => setContaParaEditar({...contaParaEditar, data_vencimento: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-red-100 text-xs" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button type="button" onClick={() => setContaParaEditar(null)} className="flex-1 font-black uppercase text-[10px] text-gray-400">Voltar</button>
              <button type="submit" className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black uppercase shadow-lg shadow-red-100 hover:bg-red-700 transition-all italic-none">Salvar Alterações</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}