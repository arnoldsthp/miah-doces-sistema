'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Produto = {
  id: number
  name: string
  price: number
  stock: number
}

type Comanda = {
  id: number
  cliente: string
  numero_pedido: string
  comanda_numero: number
}

export default function NovoPedidoPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [comanda, setComanda] = useState<Comanda | null>(null)
  const [cliente, setCliente] = useState('')
  const [tipo, setTipo] = useState<'BALCAO' | 'DELIVERY'>('BALCAO')
  const [comandaNumero, setComandaNumero] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarVitrine()
    carregarComandaAtiva()
  }, [])

  async function carregarVitrine() {
    const { data } = await supabase.from('inventory').select('*').order('name')
    setProdutos(data || [])
    setLoading(false)
  }

  async function carregarComandaAtiva() {
    const id = localStorage.getItem('saleId')
    if (!id) return

    const { data } = await supabase.from('vendas').select('*').eq('id', id).single()
    if (data) setComanda(data)
  }

  async function criarComanda() {
    if (!comandaNumero) {
      alert('Informe o número da comanda')
      return
    }

    const { data, error } = await supabase.rpc('criar_comanda', {
      p_cliente: cliente || 'Consumidor Final',
      p_tipo: tipo,
      p_comanda: Number(comandaNumero)
    })

    if (error) {
      alert(error.message)
      return
    }

    localStorage.setItem('saleId', data.id)
    setComanda(data)
  }

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

    await recalcularTotal()
  }

  async function recalcularTotal() {
    const { data } = await supabase.from('sales_items').select('final_price').eq('sale_id', comanda!.id)
    const total = (data || []).reduce((s, i) => s + Number(i.final_price), 0)
    await supabase.from('vendas').update({ total }).eq('id', comanda!.id)
  }

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="flex p-6 gap-6 bg-gray-50 min-h-screen">
      
      <div className="flex-1">
        <h1 className="text-2xl font-black mb-4">Novo Pedido</h1>

        {!comanda && (
          <div className="bg-white p-4 rounded-xl mb-6">
            <input placeholder="Cliente" value={cliente} onChange={e => setCliente(e.target.value)} className="border p-2 w-full mb-2" />
            <input placeholder="Comanda" value={comandaNumero} onChange={e => setComandaNumero(e.target.value)} className="border p-2 w-full mb-2" />
            <button onClick={criarComanda} className="w-full bg-pink-500 text-white py-3 font-bold rounded">
              Criar Comanda
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {produtos.map(p => (
            <button key={p.id} onClick={() => adicionar(p)} className="bg-white p-4 rounded-xl">
              <p className="font-bold">{p.name}</p>
              <p>R$ {p.price.toFixed(2)}</p>
            </button>
          ))}
        </div>
      </div>

      {comanda && (
        <div className="w-[350px] bg-white p-4 rounded-xl shadow">
          <p className="font-bold">Pedido: {comanda.numero_pedido}</p>
          <p>Comanda: {comanda.comanda_numero}</p>
        </div>
      )}

    </div>
  )
}
