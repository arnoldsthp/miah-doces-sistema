'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Produto = {
  id: number
  name: string
  price: number
}

type Item = {
  id: string
  product_name: string
  quantity: number
  original_price: number
  final_price: number
}

type Venda = {
  id: number
  cliente: string
  numero_pedido: string
  total: number
}

export default function PDV() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [busca, setBusca] = useState('')
  const [venda, setVenda] = useState<Venda | null>(null)
  const [itens, setItens] = useState<Item[]>([])
  const [cliente, setCliente] = useState('')
  const [comanda, setComanda] = useState('')

  useEffect(() => {
    carregarProdutos()
    carregarVendaAtiva()
  }, [])

  async function carregarProdutos() {
    const { data } = await supabase.from('inventory').select('*').order('name')
    setProdutos(data || [])
  }

  async function carregarVendaAtiva() {
    const id = localStorage.getItem('saleId')
    if (!id) return

    const { data: v } = await supabase.from('vendas').select('*').eq('id', id).single()
    if (!v) return

    setVenda(v)
    setCliente(v.cliente)

    const { data: items } = await supabase.from('sales_items').select('*').eq('sale_id', v.id)
    setItens(items || [])
  }

  async function criarComanda() {
    if (!cliente || !comanda) {
      alert('Informe cliente e comanda')
      return
    }

    const { data, error } = await supabase.rpc('criar_comanda', {
      p_cliente: cliente,
      p_tipo: 'BALCAO',
      p_comanda: Number(comanda)
    })

    if (error) {
      alert(error.message)
      return
    }

    localStorage.setItem('saleId', data.id)
    setVenda(data)
    setItens([])
  }

  async function adicionar(p: Produto) {
    if (!venda) return

    const { data: existente } = await supabase
      .from('sales_items')
      .select('*')
      .eq('sale_id', venda.id)
      .eq('product_name', p.name)
      .maybeSingle()

    if (existente) {
      await supabase.from('sales_items').update({
        quantity: existente.quantity + 1,
        final_price: (existente.quantity + 1) * p.price
      }).eq('id', existente.id)
    } else {
      await supabase.from('sales_items').insert({
        sale_id: venda.id,
        product_name: p.name,
        quantity: 1,
        original_price: p.price,
        discount: 0,
        final_price: p.price
      })
    }

    recarregarItens()
  }

  async function alterar(id: string, delta: number) {
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

    recarregarItens()
  }

  async function recarregarItens() {
    const { data } = await supabase.from('sales_items').select('*').eq('sale_id', venda!.id)
    setItens(data || [])

    const total = (data || []).reduce((s, i) => s + Number(i.final_price), 0)
    await supabase.from('vendas').update({ total }).eq('id', venda!.id)

    const { data: v } = await supabase.from('vendas').select('*').eq('id', venda!.id).single()
    setVenda(v)
  }

  return (
    <div className="flex h-screen p-6 gap-6">

      {/* ESQUERDA */}
      <div className="flex-1">

        {!venda && (
          <div className="bg-white p-4 rounded-xl mb-4">
            <input value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Cliente" className="border p-2 w-full mb-2" />
            <input value={comanda} onChange={e => setComanda(e.target.value)} placeholder="Comanda" className="border p-2 w-full mb-2" />
            <button onClick={criarComanda} className="bg-pink-500 text-white w-full py-3 font-bold rounded">Criar Comanda</button>
          </div>
        )}

        <input placeholder="Buscar produto..." value={busca} onChange={e => setBusca(e.target.value)} className="border p-2 w-full mb-4" />

        <div className="grid grid-cols-3 gap-4">
          {produtos.filter(p => p.name.toLowerCase().includes(busca.toLowerCase())).map(p => (
            <button key={p.id} onClick={() => adicionar(p)} className="bg-white p-4 rounded shadow">
              <p className="font-bold">{p.name}</p>
              <p>R$ {p.price.toFixed(2)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* DIREITA — MINICART */}
      {venda && (
        <div className="w-80 bg-white rounded-xl p-4 shadow">
          <h3 className="font-black mb-2">Pedido {venda.numero_pedido}</h3>

          {itens.map(i => (
            <div key={i.id} className="border-b py-2">
              <p className="font-bold">{i.product_name}</p>
              <div className="flex justify-between items-center">
                <div>
                  <button onClick={() => alterar(i.id, -1)}>-</button>
                  <span className="mx-2">{i.quantity}</span>
                  <button onClick={() => alterar(i.id, 1)}>+</button>
                </div>
                <span>R$ {i.final_price.toFixed(2)}</span>
              </div>
            </div>
          ))}

          <p className="font-black text-right mt-4">Total: R$ {venda.total.toFixed(2)}</p>
        </div>
      )}

    </div>
  )
}
