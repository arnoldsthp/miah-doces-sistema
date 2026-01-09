'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ComandasEmAberto() {
  const [comandas, setComandas] = useState<any[]>([])
  const [comandaSelecionada, setComandaSelecionada] = useState<any>(null)
  const [modoModal, setModoModal] = useState<'detalhes' | 'pagamento'>('detalhes')
  const [metodo, setMetodo] = useState('Pix')
  const [carregando, setCarregando] = useState(false)

  async function carregarComandas() {
    const { data } = await supabase
      .from('vendas')
      .select('*')
      .eq('status', 'aberta')
      .order('created_at', { ascending: false })
    setComandas(data || [])
  }

  async function finalizarComanda(id: number) {
    if (carregando) return
    setCarregando(true)
    
    const { error } = await supabase
      .from('vendas')
      .update({ 
        status: 'finalizada', 
        metodo_pagamento: metodo 
      })
      .eq('id', id)

    setCarregando(false)
    if (error) {
      alert("Erro ao fechar comanda: " + error.message)
    } else {
      alert(`✅ Comanda fechada! Pago via ${metodo}`)
      setComandaSelecionada(null)
      carregarComandas()
    }
  }

  useEffect(() => { carregarComandas() }, [])

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-black font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-amber-600 tracking-tight">🧾 Comandas em Aberto</h1>
        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Gerenciamento de mesas e consumo</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {comandas.length === 0 ? (
          <div className="col-span-full p-20 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold uppercase text-xs">Nenhuma comanda aberta</p>
          </div>
        ) : (
          comandas.map((c) => (
            <div key={c.id} className="bg-white p-6 rounded-[32px] shadow-sm border-t-8 border-amber-500">
              <div className="mb-4">
                <h3 className="text-2xl font-black text-gray-900">{c.mesa_comanda}</h3>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{c.cliente}</p>
              </div>
              
              <div className="text-xl font-black text-green-600 font-mono mb-4">R$ {Number(c.total).toFixed(2)}</div>
              
              <div className="grid grid-cols-2 gap-2 border-t border-gray-50 pt-4">
                <button 
                  onClick={() => { setComandaSelecionada(c); setModoModal('detalhes'); }} 
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-[9px] font-black py-2.5 rounded-xl transition-colors uppercase"
                >
                  Detalhes
                </button>
                <button 
                  onClick={() => { setComandaSelecionada(c); setModoModal('pagamento'); setMetodo('Pix'); }} 
                  className="bg-gray-900 hover:bg-pink-600 text-white text-[9px] font-black py-2.5 rounded-xl transition-colors uppercase"
                >
                  Fechar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL ÚNICO COM DOIS MODOS */}
      {comandaSelecionada && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 bg-gray-50 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black uppercase text-gray-900 tracking-tight">
                  {modoModal === 'detalhes' ? 'Itens da Comanda' : 'Finalizar Conta'}
                </h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase">{comandaSelecionada.mesa_comanda} • {comandaSelecionada.cliente}</p>
              </div>
              <button onClick={() => setComandaSelecionada(null)} className="text-gray-400 hover:text-black font-black text-2xl">×</button>
            </div>
            
            <div className="p-8">
              {modoModal === 'detalhes' ? (
                /* MODO DETALHES */
                <div className="space-y-3 mb-8">
                  {comandaSelecionada.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
                      <span className="text-xs font-bold text-gray-700">
                        <span className="text-pink-600 font-black mr-2">{item.quantidade}x</span> {item.nome}
                      </span>
                      <span className="font-mono font-black text-gray-900 text-xs">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-dashed flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-gray-400">Subtotal</span>
                    <span className="text-xl font-black text-green-600 font-mono">R$ {Number(comandaSelecionada.total).toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                /* MODO PAGAMENTO */
                <div className="mb-6">
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-4 tracking-widest text-center">Forma de Pagamento</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Pix', 'Dinheiro', 'Débito', 'Crédito'].map((item) => (
                      <button
                        key={item}
                        onClick={() => setMetodo(item)}
                        className={`py-4 rounded-2xl font-black text-xs uppercase transition-all border-2 ${
                          metodo === item 
                          ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-sm' 
                          : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {modoModal === 'detalhes' ? (
                  <button 
                    onClick={() => setModoModal('pagamento')} 
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm shadow-lg hover:bg-pink-600 transition-all uppercase"
                  >
                    Ir para Pagamento
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => setModoModal('detalhes')} 
                      className="flex-1 py-4 text-xs font-black text-gray-400 uppercase"
                    >
                      Voltar
                    </button>
                    <button 
                      onClick={() => finalizarComanda(comandaSelecionada.id)}
                      disabled={carregando}
                      className="flex-[2] py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black text-sm shadow-lg transition-all"
                    >
                      {carregando ? '...' : 'CONFIRMAR R$ ' + Number(comandaSelecionada.total).toFixed(2)}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}