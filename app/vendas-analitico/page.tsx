'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function VendasAnaliticoPage() {
  const [vendasItens, setVendasItens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVendas() {
      setLoading(true)
      const { data, error } = await supabase
        .from('sales_items')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setVendasItens(data)
      }
      setLoading(false)
    }
    fetchVendas()
  }, [])

  if (loading) return <div className="p-8 text-center text-black font-bold uppercase tracking-widest">Gerando Relatório...</div>

  return (
    <div className="p-4 md:p-8 text-black min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-black text-pink-600 mb-8 uppercase tracking-tighter">Histórico Analítico por Item</h2>
        
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-[10px] font-black uppercase text-gray-400">Data</th>
                  <th className="p-4 text-[10px] font-black uppercase text-gray-400">Produto</th>
                  <th className="p-4 text-[10px] font-black uppercase text-gray-400 text-center">Qtd</th>
                  <th className="p-4 text-[10px] font-black uppercase text-gray-400">Preço Tabela</th>
                  <th className="p-4 text-[10px] font-black uppercase text-gray-400 text-red-500">Desconto</th>
                  <th className="p-4 text-[10px] font-black uppercase text-gray-400 text-green-600">Total Pago</th>
                </tr>
              </thead>
              <tbody>
                {vendasItens.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">Sem vendas registradas</td>
                  </tr>
                ) : (
                  vendasItens.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-[11px] font-bold text-gray-500">
                        {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.created_at))}
                      </td>
                      <td className="p-4 text-[11px] font-black text-gray-800 uppercase">{item.product_name}</td>
                      <td className="p-4 text-[11px] font-bold text-gray-600 text-center">{item.quantity}</td>
                      <td className="p-4 text-[11px] font-bold text-gray-600">R$ {Number(item.original_price).toFixed(2)}</td>
                      <td className="p-4 text-[11px] font-bold text-red-500">- R$ {Number(item.discount).toFixed(2)}</td>
                      <td className="p-4 text-[11px] font-black text-green-600">R$ {Number(item.final_price).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}