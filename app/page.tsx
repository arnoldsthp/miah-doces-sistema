'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Produto = {
  id: number
  name: string
  price: number
}

type Cliente = {
  id: string
  nome: string
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
  cliente_id: string | null
  total: number
}

export default function NovoPedidoPage() {
  const router = useRouter()

  const [produtos, setProdutos] = useState<Produto[]>([])
  const [buscaProduto, setBuscaProduto] = useState('')

  const [buscaCliente, setBuscaCliente] = useState('')
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)

  const [comanda, setComanda] = useState<Comanda | null>(null)
  const [itens, setItens] = useState<Item[]>([])
  const [numeroComanda, setNumeroComanda] = useState('')

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
    setBuscaCliente(venda.cliente)

    const { data: items } = await supabase.from('sales_items').select('*').eq('sale_id', venda.id)
    setItens(items || [])
  }

  // ------------------------
  // AUTOCOMPLETE CLIENTE
  // ------------------------
  useEffect(() => {
    if (buscaCliente.length < 2) {
      setClientes([])
      return
    }

    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('clientes')
        .select('*')
        .ilike('nome', `%${buscaCliente}%`)
        .order('nome')
        .limit(8)

      setClientes(data || [])
    }, 300)

    return () => clearTimeout(t)
  }, [buscaCliente])

  function selecionarCliente(c: Cliente) {
    setClienteSelecionado(c)
    setBuscaCliente(c.nome)
    setClientes([])
  }

  // ------------------------
  // COMANDA
  // ------------------------
  async function criarComanda() {
    if (!numeroComanda) {
      alert('Informe o número da comanda')
      return
    }

    let clienteId = clienteSelecionado?.id

    if (!clienteId && buscaCliente.trim()) {
      const { data } = await supabase
        .from('clientes')
        .insert({ nome: buscaCliente.trim() })
        .select()
        .single()

      clienteId = data.id
      setClienteSelecionado(data)
    }

    const { data, error } = await supabase.rpc('criar_comanda', {
      p_cliente: buscaCliente || 'Consumidor Final',
      p_tipo: 'BALCAO',
      p_comanda: Number(numeroComanda)
    })

    if (error) {
      alert(error.message)
      return
    }

    await supabase.from('vendas').update({
      cliente_id: clienteId,
      cliente: buscaCliente || 'Consumidor Final'
    }).eq('id', data.id)

    localStorage.setItem('saleId', data.id)
    setComanda(data)
    setItens([])
  }

  // ------------------------
  // ITENS
  // ------------------------
  async function adicionar(produto: Produto) {
    if (!comanda) return

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

  return (
    <div className="flex h-screen">

      {/* PDV */}
      <div className="flex-1 p-6">

        {!comanda && (
          <div className="bg-white p-4 rounded-xl mb-4 relative">
            <input
              placeholder="Cliente"
              value={buscaCliente}
              onChange={e => {
                setBuscaCliente(e.target.value)
                setClienteSelecionado(null)
              }}
              className="border p-2 w-full mb-2"
            />

            {clientes.length > 0 && (
              <div className="absolute bg-white border w-full z-50">
                {clientes.map(c => (
                  <div
                    key={c.id}
                    onClick={() => selecionarCliente(c)}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {c.nome}
                  </div>
                ))}
              </div>
            )}

            <input
              placeholder="Comanda"
              value={numeroComanda}
              onChange={e => setNumeroComanda(e.target.value)}
              className="border p-2 w-full mb-2"
            />

            <button onClick={criarComanda} className="w-full bg-pink-500 text-white py-3 font-bold rounded">
              Criar Comanda
            </button>
          </div>
        )}

        <input
          placeholder="Buscar produto..."
          value={buscaProduto}
          onChange={e => setBuscaProduto(e.target.value)}
          className="border p-2 w-full mb-4"
        />

        <div className="grid grid-cols-3 gap-4">
          {produtos.filter(p => p.name.toLowerCase().includes(buscaProduto.toLowerCase())).map(p => (
            <button key={p.id} onClick={() => adicionar(p)} className="bg-white p-4 rounded">
              <p className="font-bold">{p.name}</p>
              <p>R$ {p.price.toFixed(2)}</p>
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
