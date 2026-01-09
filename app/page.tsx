'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const PRODUTOS_LISTA = [
  { id: 1, nome: 'Brigadeiro Gourmet', preco: 5.00, cor: 'bg-pink-100' },
  { id: 2, nome: 'Bolo de Pote', preco: 12.00, cor: 'bg-pink-100' },
  { id: 3, nome: 'Coxinha de Frango', preco: 8.00, cor: 'bg-orange-100' },
  { id: 4, nome: 'Empada de Palmito', preco: 7.50, cor: 'bg-orange-100' },
]

export default function NovoPedido() {
  // Removido o estado 'vendaAtiva' para carregar a tela direto
  const [cliente, setCliente] = useState('C00001-consumidor final')
  const [mesa, setMesa] = useState('')
  const [carrinho, setCarrinho] = useState<any[]>([])
  const [carregando, setCarregando] = useState(false)

  const totalVenda = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0)

  function adicionarAoCarrinho(produto: any) {
    const itemExistente = carrinho.find(item => item.id === produto.id)
    if (itemExistente) {
      setCarrinho(carrinho.map(item => 
        item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
      ))
    } else {
      setCarrinho([...carrinho, { ...produto, quantidade: 1 }])
    }
  }

  function alterarQuantidade(id: number, delta: number) {
    setCarrinho(carrinho.map(item => {
      if (item.id === id) {
        const novaQtd = Math.max(1, item.quantidade + delta)
        return { ...item, quantidade: novaQtd }
      }
      return item
    }))
  }

  function limparPedido() {
    setCarrinho([])
    setMesa('')
    setCliente('C00001-consumidor final')
  }

  async function salvarComanda(status: 'aberta' | 'finalizada') {
    if (!mesa && status === 'aberta') return alert("Informe o número da Mesa ou Comanda!")
    if (carrinho.length === 0) return alert("O carrinho está vazio!")
    
    setCarregando(true)
    const { error } = await supabase.from('vendas').insert([{ 
      items: carrinho, 
      total: totalVenda, 
      cliente, 
      mesa_comanda: mesa || 'BALCÃO',
      status 
    }])

    setCarregando(false)
    if (error) alert(error.message)
    else {
      alert(status === 'aberta' ? '📌 Comanda aberta!' : '✅ Venda finalizada!')
      limparPedido()
    }
  }

  return (
    <div className="flex h-screen bg-white text-black font-sans">
      {/* Lado Esquerdo: Produtos */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Novo Pedido</h1>
          <button onClick={limparPedido} className="text-gray-400 font-bold hover:text-red-500 uppercase text-xs tracking-widest">Limpar Tela</button>
        </div>

        {/* Seleção de Cliente e Mesa */}
        <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Perfil do Cliente</label>
            <div className="flex gap-2">
                <button onClick={() => setCliente('C00001-consumidor final')} className={`flex-1 py-3 rounded-2xl border-2 font-black text-[10px] uppercase transition-all ${cliente.includes('C00001') ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-sm' : 'border-gray-100 text-gray-400'}`}>Consumidor</button>
                <button onClick={() => setCliente('C00002-ifood/99food')} className={`flex-1 py-3 rounded-2xl border-2 font-black text-[10px] uppercase transition-all ${cliente.includes('C00002') ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-sm' : 'border-gray-100 text-gray-400'}`}>Delivery</button>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Mesa / Comanda</label>
            <input 
              placeholder="Ex: 05" 
              value={mesa} 
              onChange={e => setMesa(e.target.value)} 
              className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-2xl font-black text-gray-900 outline-none focus:border-pink-500 transition-all" 
            />
          </div>
        </div>

        {/* Grid de Produtos */}
        <div className="grid grid-cols-3 gap-4">
          {PRODUTOS_LISTA.map((prod) => (
            <button key={prod.id} onClick={() => adicionarAoCarrinho(prod)} className={`${prod.cor} p-8 rounded-[32px] border-2 border-transparent hover:border-pink-500 transition-all text-center shadow-sm hover:shadow-md active:scale-95`}>
              <span className="block font-black text-lg text-gray-800">{prod.nome}</span>
              <span className="block text-pink-600 font-black font-mono mt-1">R$ {prod.preco.toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lado Direito: Carrinho */}
      <div className="w-96 bg-gray-50 border-l border-gray-200 p-8 flex flex-col">
        <h2 className="text-xl font-black mb-6 uppercase tracking-tight">🛒 Itens Selecionados</h2>
        <div className="flex-1 overflow-y-auto space-y-3">
          {carrinho.length === 0 ? (
             <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl p-6 text-center text-gray-300 font-bold uppercase text-xs">O pedido está vazio</div>
          ) : (
            carrinho.map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-3 animate-in slide-in-from-right-2">
                <div className="flex justify-between items-start">
                  <span className="font-black text-xs uppercase text-gray-700 leading-tight">{item.nome}</span>
                  <span className="font-mono font-black text-pink-600 text-xs">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => alterarQuantidade(item.id, -1)} className="w-8 h-8 bg-gray-100 rounded-xl font-black text-lg hover:bg-gray-200">-</button>
                  <span className="font-black text-sm">{item.quantidade}</span>
                  <button onClick={() => alterarQuantidade(item.id, 1)} className="w-8 h-8 bg-gray-100 rounded-xl font-black text-lg hover:bg-gray-200">+</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t-2 border-dashed border-gray-200 pt-6 mt-6">
          <div className="flex justify-between items-end mb-6">
            <span className="text-[10px] font-black uppercase text-gray-400">Total do Pedido</span>
            <span className="text-4xl font-black text-green-600 font-mono italic-none">R$ {totalVenda.toFixed(2)}</span>
          </div>
          
          <div className="space-y-3">
            <button 
              disabled={carregando}
              onClick={() => salvarComanda('aberta')} 
              className="w-full py-4 bg-amber-500 text-white rounded-[20px] font-black shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all active:scale-95 text-xs uppercase"
            >
              {carregando ? 'Salvando...' : 'Manter Comanda Aberta'}
            </button>
            <p className="text-[9px] text-gray-400 text-center font-bold tracking-tight px-4 leading-tight uppercase">
              O pedido aparecerá automaticamente no módulo de Comandas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}