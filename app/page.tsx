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
  cliente_id: string
  numero_pedido: string
  total: number
}

function gerarCodigoCliente() {
  return 'C' + Date.now()
}

export default function PDV() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [busca, setBusca] = useState('')
  const [venda, setVenda] = useState<Venda | null>(null)
  const [itens, setItens] = useState<Item[]>([])
  const [cliente, setCliente] = useState('')
  const [comanda, setComanda] = useState('')

  const [modalFechar, setModalFechar] = useState(false)
  const [descontoRaw, setDescontoRaw] = useState('')
  const [forma, setForma] = useState('')

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

    // Buscar cliente pelo nome
    const { data: encontrados, error: erroBusca } = await supabase
      .from('clientes')
      .select('*')
      .eq('nome', cliente)
      .limit(1)

    if (erroBusca) {
      alert('Erro ao buscar cliente')
      return
    }

    let clienteId: string

    if (encontrados && encontrados.length > 0) {
      clienteId = encontrados[0].id
    } else {
      const { data: novo, error: erroNovo } = await supabase
        .from('clientes')
        .insert({
          codigo: gerarCodigoCliente(),
          nome: cliente
        })
        .select()
        .single()

      if (erroNovo) {
        alert('Erro ao criar cliente: ' + erroNovo.message)
        return
      }

      clienteId = novo.id
    }

    const { data, error } = await supabase.rpc('criar_comanda', {
      p_cliente: cliente,
      p_cliente_id: clienteId,
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

  function novaComanda() {
    localStorage.removeItem('saleId')
    setVenda(null)
    setItens([])
    setCliente('')
    setComanda('')
  }

  async function cancelarComanda() {
    if (!venda) return
    await supabase.from('sales_items').delete().eq('sale_id', venda.id)
    await supabase.from('vendas').update({ status: 'cancelada' }).eq('id', venda.id)
    novaComanda()
  }

  function formatarDesconto(v: string) {
    const n = v.replace(/\D/g, '')
    return (Number(n) / 100).toFixed(2)
  }

  async function fechar() {
    if (!forma) {
      alert('Selecione a forma de pagamento')
      return
    }

    const desconto = Number(formatarDesconto(descontoRaw))
    const totalFinal = venda!.total - desconto

    await supabase.from('vendas').update({
      total: totalFinal,
      forma_pagamento: forma,
      status: 'finalizada',
      fechado_em: new Date().toISOString()
    }).eq('id', venda!.id)

    novaComanda()
    setModalFechar(false)
    setDescontoRaw('')
    setForma('')
  }

  return (
    <div className="flex h-screen p-6 gap-6">
      {/* Área esquerda */}
      <div className="flex-1">
        {!venda && (
          <div className="bg-white p-4 rounded-xl mb-4">
            <input
              value={cliente}
              onChange={e => setCliente(e.target.value)}
              placeholder="Cliente"
              className="border p-2 w-full mb-2"
            />
            <input
              value={comanda}
              onChange={e => setComanda(e.target.value)}
              placeholder="Comanda"
              className="border p-2 w-full mb-2"
            />
            <button
              onClick={criarComanda}
              className="bg-pink-500 text-white w-full py-3 font-bold rounded"
            >
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

        <div className="grid grid-cols-3 gap-4">
          {produtos
            .filter(p => p.name.toLowerCase().includes(busca.toLowerCase()))
            .map(p => (
              <button
                key={p.id}
                onClick={() => adicionar(p)}
                className="bg-white p-4 rounded shadow"
              >
                <p className="font-bold">{p.name}</p>
                <p>R$ {p.price.toFixed(2)}</p>
              </button>
            ))}
        </div>
      </div>

      {/* Área direita */}
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

          <p className="font-black text-right mt-4">
            Total: R$ {venda.total.toFixed(2)}
          </p>

          <div className="mt-4 space-y-2">
            <button
              onClick={novaComanda}
              className="w-full bg-gray-200 py-2 rounded"
            >
              Nova Comanda
            </button>
            <button
              onClick={cancelarComanda}
              className="w-full bg-red-500 text-white py-2 rounded"
            >
              Cancelar
            </button>
            <button
              onClick={() => setModalFechar(true)}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal fechar */}
      {modalFechar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-80">
            <h3 className="font-black mb-2">Fechar Comanda</h3>
            <p>Total: R$ {venda!.total.toFixed(2)}</p>

            <input
              placeholder="Desconto"
              value={descontoRaw}
              onChange={e => setDescontoRaw(e.target.value)}
              className="border p-2 w-full my-2"
            />

            <p>
              Total Final: R${' '}
              {(venda!.total - Number(formatarDesconto(descontoRaw))).toFixed(2)}
            </p>

            {['Crédito', 'Débito', 'Pix', 'Dinheiro'].map(f => (
              <button
                key={f}
                onClick={() => setForma(f)}
                className={`w-full my-1 py-2 rounded ${
                  forma === f ? 'bg-pink-500 text-white' : 'bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}

            <button
              onClick={fechar}
              className="w-full mt-3 bg-green-600 text-white py-2 rounded"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
