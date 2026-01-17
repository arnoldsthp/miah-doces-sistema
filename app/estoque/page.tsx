'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type ItemCadastro = {
  id: number
  codigo: string
  nome?: string
}

/**
 * Categorias de VENDA (hardcoded e padronizadas)
 */
const CATEGORIAS_ESTOQUE = [
  'BEBIDAS ALCOÓLICAS',
  'BEBIDAS (GERAL)',
  'BOLOS',
  'DOCES',
  'SALGADOS',
] as const

export default function GestaoEstoque() {
  const [itemNome, setItemNome] = useState('')
  const [itemSelecionado, setItemSelecionado] = useState<ItemCadastro | null>(null)
  const [sugestoes, setSugestoes] = useState<ItemCadastro[]>([])
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)

  const [categoria, setCategoria] =
    useState<(typeof CATEGORIAS_ESTOQUE)[number]>(CATEGORIAS_ESTOQUE[0])

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

  async function buscarItens(term: string) {
    if (!term || term.length < 2) {
      setSugestoes([])
      return
    }

    const { data } = await supabase
      .from('itens_cadastro')
      .select('id, codigo, nome')
      .eq('tipo', 'VENDA')
      .ilike('nome', `%${term}%`)
      .limit(8)

    setSugestoes(data || [])
    setMostrarSugestoes(true)
  }

  function selecionarItem(i: ItemCadastro) {
    setItemSelecionado(i)
    setItemNome(i.nome || '')
    setSugestoes([])
    setMostrarSugestoes(false)
  }

  async function garantirItemCadastro() {
    if (itemSelecionado) return itemSelecionado

    const { data, error } = await supabase.rpc('get_or_create_item', {
      p_nome: itemNome,
      p_tipo: 'VENDA',
    })

    if (error || !data) {
      alert('Erro ao criar item')
      return null
    }

    return data
  }

  async function salvarEntrada() {
    if (!itemNome || quantidade <= 0) {
      alert('Informe o item e a quantidade.')
      return
    }

    setCarregando(true)

    const item = await garantirItemCadastro()
    if (!item) {
      setCarregando(false)
      return
    }

    const { error } = await supabase.from('entradas_estoque').insert([
      {
        item_id: item.id,
        codigo_item: item.codigo,
        item: itemNome, // ✅ CORREÇÃO DEFINITIVA
        categoria,
        fornecedor,
        quantidade,
        preco_unitario: precoUnitario,
        total,
        metodo_pagamento: metodoPgto,
        data_vencimento_credito:
          metodoPgto === 'credito' ? vencimento : null,
        pago: metodoPgto !== 'credito',
      },
    ])

    setCarregando(false)

    if (error) {
      alert('Erro ao salvar: ' + error.message)
    } else {
      alert('Registrado com sucesso!')
      setItemNome('')
      setItemSelecionado(null)
      setFornecedor('')
      setQuantidade(0)
      setPrecoUnitario(0)
      setVencimento('')
      setCategoria(CATEGORIAS_ESTOQUE[0])
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800 text-[13px]">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black mb-6">Entrada de Estoque</h1>

        <div className="bg-white p-6 rounded-xl shadow border border-gray-100 space-y-5">
          {/* ITEM */}
          <div className="relative">
            <label className="block text-xs font-semibold mb-1 uppercase text-gray-500">
              Item (VENDA)
            </label>
            <input
              value={itemNome}
              onChange={e => {
                setItemNome(e.target.value)
                setItemSelecionado(null)
                buscarItens(e.target.value)
              }}
              onFocus={() => itemNome && setMostrarSugestoes(true)}
              placeholder="Digite o nome do item"
              className="w-full px-3 py-2.5 border rounded"
            />

            {mostrarSugestoes && sugestoes.length > 0 && (
              <div className="absolute z-10 bg-white border rounded w-full max-h-48 overflow-auto shadow">
                {sugestoes.map(i => (
                  <div
                    key={i.id}
                    onClick={() => selecionarItem(i)}
                    className="px-3 py-2 hover:bg-pink-50 cursor-pointer"
                  >
                    <strong>({i.codigo})</strong> — {i.nome}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CATEGORIA + FORNECEDOR */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase text-gray-500">
                Categoria
              </label>
              <select
                value={categoria}
                onChange={e =>
                  setCategoria(
                    e.target.value as (typeof CATEGORIAS_ESTOQUE)[number]
                  )
                }
                className="w-full px-3 py-2.5 border rounded"
              >
                {CATEGORIAS_ESTOQUE.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 uppercase text-gray-500">
                Fornecedor
              </label>
              <input
                value={fornecedor}
                onChange={e => setFornecedor(e.target.value)}
                className="w-full px-3 py-2.5 border rounded"
              />
            </div>
          </div>

          {/* QUANTIDADE + PREÇO */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase text-gray-500">
                Quantidade
              </label>
              <input
                type="number"
                value={quantidade}
                onChange={e => setQuantidade(Number(e.target.value))}
                className="w-full px-3 py-2.5 border rounded"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 uppercase text-gray-500">
                Preço Unitário
              </label>
              <input
                type="number"
                step="0.01"
                value={precoUnitario}
                onChange={e => setPrecoUnitario(Number(e.target.value))}
                className="w-full px-3 py-2.5 border rounded"
              />
            </div>
          </div>

          {/* PAGAMENTO */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase text-gray-500">
                Pagamento
              </label>
              <select
                value={metodoPgto}
                onChange={e => setMetodoPgto(e.target.value)}
                className="w-full px-3 py-2.5 border rounded"
              >
                <option value="dinheiro">Dinheiro / Pix</option>
                <option value="debito">Débito</option>
                <option value="credito">Crédito</option>
              </select>
            </div>

            {metodoPgto === 'credito' && (
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase text-gray-500">
                  Vencimento
                </label>
                <input
                  type="date"
                  value={vencimento}
                  onChange={e => setVencimento(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded"
                />
              </div>
            )}
          </div>

          {/* TOTAL */}
          <div className="flex justify-between items-center bg-pink-50 border border-pink-100 rounded px-4 py-3">
            <span className="font-semibold text-pink-700">Total</span>
            <span className="font-black text-pink-700">
              R$ {total.toFixed(2)}
            </span>
          </div>

          <button
            onClick={salvarEntrada}
            disabled={carregando}
            className={`w-full py-3 rounded font-bold text-white ${
              carregando
                ? 'bg-gray-400'
                : 'bg-pink-600 hover:bg-pink-700'
            }`}
          >
            {carregando ? 'SALVANDO...' : 'CONFIRMAR REGISTRO'}
          </button>
        </div>
      </div>
    </div>
  )
}
