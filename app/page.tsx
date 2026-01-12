'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Produto = {
  id: number
  name: string
  price: number
  stock: number
}

type Item = {
  id: number
  product_name: string
  quantity: number
  original_price: number
  final_price: number
}

type Comanda = {
  id: number
  numero_pedido: string
  comanda_numero: number
  cliente: string
  tipo: string
  total: number
}

export default function NovoPedidoPage() {
  const router = useRouter()

  const [produtos, setProdutos] = useState<Produto[]>([])
  const [busca, setBusca] = useState('')
  const [comanda, setComanda] = useState<Comanda | null>(null)
  const [itens, setItens] = useState<Item[]>([])
  const [cliente, setCliente] = useState('')
  const [tipo, setTipo] = useState('BALCAO')
  const [numeroComanda, setNumeroComanda] = useState('')

  // --------------------
  // INIT
  // --------------------
  useEffect(() => {
    carregarVitrine()
    carregarComandaAtiva()
  }, [])

  async function carregarVitrine() {
    const { data } = await supabase.from('inventory').select('*').order('name')
    setProdutos(data || [])
  }

  async function carregarComandaAtiva() {
    const id = localStorage.getItem('saleId')
    if (!id) return

    const { data: venda } = await supabase.from('vendas').select('*').eq('id', id).single()
    if (!venda) return

    setComanda(venda)
    const { data: items } = await supabase.from('sales_items').select('*').eq('sale_id', venda.id)
    setItens(items || [])
  }

  // --------------------
  // COMANDA
  // --------------------
  async function criarComanda() {
    if (!numeroComanda) {
      alert('Informe o número da comanda')
      return
    }

    const { data, error } = await supabase.rpc('criar_comanda', {
      p_cliente: cliente || 'Consumidor Final',
      p_tipo: tipo,
      p_comanda: Number(numeroComanda)
    })

    if (error) {
      alert(error.message)
      return
    }

    localStorage.setItem('saleId', data.id)
    setComanda(data)
    setItens([])
  }

  // --------------------
  // ITENS
  // --------------------
  async function adicionar(produto: Produto) {
    if (!comanda) {
      alert('Crie a comanda primeiro')
      return
    }

    const { data: existente } = await supabase
      .from('sales_items')
      .select('*')
      .eq('sale_id', comanda.id)
      .eq('product_name', produto.name)
      .single()

    if (existente) {
      await supabase.from('sales_items').update({
        quantity: existente.quantity + 1,
        final_price: (existente.quantity + 1) * produto.price
      }).eq('id', existente.id)
    } else {
      await supabase.from('sales_items').insert({
        sale_id: comanda.id,
        product_name: produto.name,
        quantity: 1,
        original_price: produto.price,
        discount: 0,
        final_price: produto.price
      })
    }

    await recarregarItens()
  }

  async function alterarQuantidade(id: number, delta: number) {
    const item = itens.find(i => i.id === id)
    if (!item) return

    const nova = item.quantity + delta

    if (nova <= 0) {
      await supabase.from('sales_items').delete().eq('id', id)
    } else {
      await supabase.from('sales_items').update({
        quantity: nova,
        final_price: nova * item.original_price
      }).eq('id', id)
    }

    await recarregarItens()
  }

  async function recarregarItens() {
    const { data } = await supabase.from('sales_items').select('*').eq('sale_id', comanda!.id)
    setItens(data || [])

    const total = (data || []).reduce((s, i) => s + Number(i.final_price), 0)
    await supabase.from('vendas').update({ total }).eq('id', comanda!.id)

    const { data: vendaAtual } = await supabase.from('vendas').select('*').eq('id', comanda!.id).single()
    setComanda(vendaAtual)
  }

  // --------------------
  // AÇÕES
  // --------------------
  function novaComanda() {
    localStorage.removeItem('saleId')
    setComanda(null)
    setItens([])
    setNumeroComanda('')
    setCliente('')
  }

  function fecharComanda() {
    router.push(`/comandas/${comanda!.id}/fechar`)
  }

  // --------------------
  // FILTRO
  // --------------------
  const produtosFiltrados = produtos.filter(p =>
    p.name.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-gray-50">

      {/* VITRINE */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-black mb-4">Novo Pedido</h1>

        {!comanda && (
          <div className="bg-white p-4 rounded-xl mb-6 space-y-2">
            <input placeholder="Cliente" value={cliente} onChange={e => setCliente(e.target.value)} className="border p-2 w-full" />
            <input placeholder="Comanda" value={numeroComanda} onChange={e => setNumeroComanda(e.target.value)} className="border p-2 w-full" />
            <button onClick={criarComanda} className="w-full bg-pink-500 text-white py-3 font-bold rounded">
              Criar Comanda
            </button>
          </div>
        )}

        <input
          placeholder="Buscar produto..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="border p-2 w-full mb-4"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {produtosFiltrados.map(p => (
            <button
              key={p.id}
              onClick={() => adicionar(p)}
              className="bg-white p-4 rounded-xl shadow hover:border-pink-500 border"
            >
              <p className="font-bold text-sm">{p.name}</p>
              <p className="text-pink-600 font-black">R$ {p.price.toFixed(2)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* MINICART */}
      {comanda && (
        <div className="w-[380px] bg-white p-6 shadow-xl flex flex-col">
          <p className="font-black">Pedido: {comanda.numero_pedido}</p>
          <p className="text-sm mb-4">Comanda: {comanda.comanda_numero}</p>

          <div className="flex-1 overflow-y-auto space-y-3">
            {itens.map(i => (
              <div key={i.id} className="border-b pb-2">
                <p className="font-bold">{i.product_name}</p>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
                    <button onClick={() => alterarQuantidade(i.id, -1)} className="px-2 bg-gray-200">–</button>
                    <span>{i.quantity}</span>
                    <button onClick={() => alterarQuantidade(i.id, 1)} className="px-2 bg-pink-500 text-white">+</button>
                  </div>
                  <p className="font-bold">R$ {i.final_price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 font-black text-lg text-right">
            Total: R$ {Number(comanda.total || 0).toFixed(2)}
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={novaComanda} className="flex-1 py-3 bg-gray-200 font-bold rounded">
              Nova Comanda
            </button>
            <button onClick={fecharComanda} className="flex-1 py-3 bg-pink-500 text-white font-black rounded">
              Fechar Comanda
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
