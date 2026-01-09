'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LancarDespesa() {
  const [descricao, setDescricao] = useState('')
  const [fornecedor, setFornecedor] = useState('')
  const [valor, setValor] = useState('')
  const [data, setData] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('Pix') // Estado inicial
  const [carregando, setCarregando] = useState(false)

  async function salvarDespesa(e: React.FormEvent) {
    e.preventDefault()
    if (!descricao || !valor || !data) return alert("Preencha os campos obrigatórios!")
    
    setCarregando(true)

    const { error } = await supabase.from('despesas_fixas').insert([{ 
      descricao, 
      fornecedor, 
      valor: parseFloat(valor), 
      data_vencimento: data,
      forma_pagamento: formaPagamento, // Enviando a forma de pagamento
      pago: false 
    }])

    setCarregando(false)
    if (error) alert(error.message)
    else {
      alert("✅ Despesa lançada com sucesso!")
      setDescricao(''); setFornecedor(''); setValor(''); setData('');
    }
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-black flex items-center justify-center font-sans">
      <form onSubmit={salvarDespesa} className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 w-full max-w-md">
        <h1 className="text-3xl font-black mb-6 text-gray-900 tracking-tight uppercase italic-none">Lançar Despesa</h1>
        
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1 italic-none">Descrição</label>
            <input required value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex: Aluguel, Internet, Insumos" className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-red-100" />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1 italic-none">Fornecedor</label>
            <input value={fornecedor} onChange={e => setFornecedor(e.target.value)} placeholder="Ex: Enel, Mercado Central" className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-red-100" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1 italic-none">Valor (R$)</label>
              <input required type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)} placeholder="0,00" className="w-full p-4 bg-gray-50 rounded-2xl border-none font-black outline-none focus:ring-2 focus:ring-red-100 font-mono" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1 italic-none">Vencimento</label>
              <input required type="date" value={data} onChange={e => setData(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-red-100 text-xs uppercase" />
            </div>
          </div>

          {/* Seleção de Forma de Pagamento */}
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-2 block italic-none">Forma de Pagamento</label>
            <div className="grid grid-cols-2 gap-2">
              {['Pix', 'Dinheiro', 'Débito', 'Crédito'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFormaPagamento(item)}
                  className={`py-3 rounded-xl font-black text-[10px] uppercase transition-all border-2 ${
                    formaPagamento === item 
                    ? 'border-red-500 bg-red-50 text-red-600' 
                    : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <button disabled={carregando} className="w-full py-5 bg-red-600 text-white rounded-[24px] font-black uppercase shadow-lg shadow-red-100 hover:bg-red-700 transition-all mt-6 active:scale-95 italic-none">
            {carregando ? 'SALVANDO...' : 'CADASTRAR CONTA'}
          </button>
        </div>
      </form>
    </div>
  )
}