'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function GestaoEstoque() {
  const [item, setItem] = useState('')
  const [categoria, setCategoria] = useState('Insumos')
  const [fornecedor, setFornecedor] = useState('')
  const [quantidade, setQuantidade] = useState(0)
  const [precoUnitario, setPrecoUnitario] = useState(0)
  const [total, setTotal] = useState(0)
  const [metodoPgto, setMetodoPgto] = useState('dinheiro')
  const [vencimento, setVencimento] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    setTotal(quantidade * precoUnitario)
  }, [quantidade, precoUnitario])

  async function salvarEntrada() {
    if (!item || quantidade <= 0) {
      alert("Por favor, preencha o nome do item e a quantidade.")
      return
    }

    setCarregando(true)
    const { error } = await supabase
      .from('entradas_estoque')
      .insert([
        { 
          item, 
          categoria,
          fornecedor, 
          quantidade, 
          preco_unitario: precoUnitario, 
          total, 
          metodo_pagamento: metodoPgto,
          data_vencimento_credito: metodoPgto === 'credito' ? vencimento : null,
          pago: metodoPgto !== 'credito'
        }
      ])

    setCarregando(false)

    if (error) {
      alert('Erro ao salvar: ' + error.message)
    } else {
      alert('✅ Registrado com sucesso no Miah Doces!')
      setItem('')
      setFornecedor('')
    }
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-black">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 font-black">📦 Entrada de Estoque</h1>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1 uppercase text-gray-400">Item / Insumo</label>
              <input value={item} onChange={(e) => setItem(e.target.value)} type="text" className="w-full p-3 bg-gray-50 border rounded-xl text-black" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1 uppercase text-gray-400">Categoria</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full p-3 bg-gray-50 border rounded-xl text-black font-bold">
                <option value="Insumos">Insumos (Ingredientes)</option>
                <option value="Embalagens">Embalagens</option>
                <option value="Limpeza">Material de Limpeza</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1 uppercase text-gray-400">Quantidade</label>
              <input type="number" onChange={(e) => setQuantidade(Number(e.target.value))} className="w-full p-3 bg-gray-50 border rounded-xl text-black" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1 uppercase text-gray-400">Preço Unitário (R$)</label>
              <input type="number" step="0.01" onChange={(e) => setPrecoUnitario(Number(e.target.value))} className="w-full p-3 bg-gray-50 border rounded-xl text-black" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1 uppercase text-gray-400">Pagamento</label>
              <select value={metodoPgto} onChange={(e) => setMetodoPgto(e.target.value)} className="w-full p-3 bg-gray-50 border rounded-xl text-black font-bold">
                <option value="dinheiro">Dinheiro / PIX</option>
                <option value="debito">Débito</option>
                <option value="credito">Crédito</option>
              </select>
            </div>
            {metodoPgto === 'credito' && (
              <div>
                <label className="block text-sm font-bold mb-1 text-red-600 uppercase">Vencimento da Fatura</label>
                <input type="date" onChange={(e) => setVencimento(e.target.value)} className="w-full p-3 bg-red-50 border border-red-200 rounded-xl text-black" />
              </div>
            )}
          </div>

          <div className="p-4 bg-pink-50 rounded-xl border border-pink-100 flex justify-between items-center text-black">
            <span className="text-pink-800 font-bold uppercase text-xs">Total Calculado:</span>
            <span className="text-2xl font-black text-pink-600 font-mono text-black">R$ {total.toFixed(2)}</span>
          </div>

          <button 
            onClick={salvarEntrada}
            disabled={carregando}
            className={`w-full py-4 rounded-xl font-black text-white shadow-lg transition-all ${carregando ? 'bg-gray-400' : 'bg-pink-500 hover:bg-pink-600 active:scale-95'}`}
          >
            {carregando ? 'SALVANDO...' : 'CONFIRMAR REGISTRO'}
          </button>
        </div>
      </div>
    </div>
  )
}