'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type ItemCadastro = {
  id: number
  codigo: string
  nome: string
}

export default function LancarDespesa() {
  const [descricao, setDescricao] = useState('')
  const [itemSelecionado, setItemSelecionado] = useState<ItemCadastro | null>(null)
  const [sugestoes, setSugestoes] = useState<ItemCadastro[]>([])
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)

  const [fornecedor, setFornecedor] = useState('')
  const [valor, setValor] = useState('')
  const [dataDespesa, setDataDespesa] = useState('')
  const [dataVencimento, setDataVencimento] = useState('')
  const [metodoPgto, setMetodoPgto] =
    useState<'dinheiro' | 'debito' | 'credito'>('dinheiro')

  const [carregando, setCarregando] = useState(false)

  async function buscarItens(term: string) {
    if (!term || term.length < 2) {
      setSugestoes([])
      return
    }

    const { data } = await supabase
      .from('itens_cadastro')
      .select('id, codigo, nome')
      .eq('tipo', 'DESPESA')
      .ilike('nome', `%${term}%`)
      .limit(8)

    setSugestoes(data || [])
    setMostrarSugestoes(true)
  }

  function selecionarItem(i: ItemCadastro) {
    setItemSelecionado(i)
    setDescricao(i.nome)
    setSugestoes([])
    setMostrarSugestoes(false)
  }

  async function garantirItemCadastro() {
    if (itemSelecionado) return itemSelecionado

    const { data, error } = await supabase.rpc('get_or_create_item', {
      p_nome: descricao,
      p_tipo: 'DESPESA',
    })

    if (error || !data) {
      alert('Erro ao criar item de despesa')
      return null
    }

    return data
  }

  async function salvarDespesa(e: React.FormEvent) {
    e.preventDefault()

    if (!descricao || !valor || !dataDespesa) {
      alert('Preencha os campos obrigatórios!')
      return
    }

    setCarregando(true)

    const item = await garantirItemCadastro()
    if (!item) {
      setCarregando(false)
      return
    }

    const { error } = await supabase.from('despesas_fixas').insert([
      {
        item_id: item.id,
        codigo_item: item.codigo,
        descricao: item.nome,
        fornecedor,
        valor: parseFloat(valor),
        data_despesa: dataDespesa,
        data_vencimento: dataVencimento || dataDespesa,
        metodo_pagamento: metodoPgto,
        pago: false,
      },
    ])

    setCarregando(false)

    if (error) {
      alert(error.message)
    } else {
      alert('Despesa lançada com sucesso!')
      setDescricao('')
      setItemSelecionado(null)
      setFornecedor('')
      setValor('')
      setDataDespesa('')
      setDataVencimento('')
      setMetodoPgto('dinheiro')
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800 text-[13px]">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-black mb-6">
          Lançar Despesa
        </h1>

        <form
          onSubmit={salvarDespesa}
          className="bg-white p-6 rounded-xl shadow border border-gray-100 space-y-5"
        >
          {/* DESCRIÇÃO */}
          <div className="relative">
            <label className="block text-xs font-semibold mb-1 uppercase text-gray-500">
              Descrição (DESPESA)
            </label>
            <input
              required
              value={descricao}
              onChange={e => {
                setDescricao(e.target.value)
                setItemSelecionado(null)
                buscarItens(e.target.value)
              }}
              onFocus={() => descricao && setMostrarSugestoes(true)}
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

          {/* FORNECEDOR */}
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

          {/* VALOR */}
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase text-gray-500">
              Valor (R$)
            </label>
            <input
              required
              type="number"
              step="0.01"
              value={valor}
              onChange={e => setValor(e.target.value)}
              className="w-full px-3 py-2.5 border rounded font-mono"
            />
          </div>

          {/* DATAS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase text-gray-500">
                Data da Despesa
              </label>
              <input
                required
                type="date"
                value={dataDespesa}
                onChange={e => setDataDespesa(e.target.value)}
                className="w-full px-3 py-2.5 border rounded"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 uppercase text-gray-500">
                Data de Vencimento
              </label>
              <input
                type="date"
                value={dataVencimento}
                onChange={e => setDataVencimento(e.target.value)}
                className="w-full px-3 py-2.5 border rounded"
              />
            </div>
          </div>

          {/* PAGAMENTO */}
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase text-gray-500">
              Forma de Pagamento
            </label>
            <select
              value={metodoPgto}
              onChange={e => setMetodoPgto(e.target.value as any)}
              className="w-full px-3 py-2.5 border rounded"
            >
              <option value="dinheiro">Dinheiro / Pix</option>
              <option value="debito">Débito</option>
              <option value="credito">Crédito</option>
            </select>
          </div>

          <button
            disabled={carregando}
            className={`w-full py-3 rounded font-bold text-white ${
              carregando
                ? 'bg-gray-400'
                : 'bg-pink-600 hover:bg-pink-700'
            }`}
          >
            {carregando ? 'SALVANDO...' : 'CONFIRMAR DESPESA'}
          </button>
        </form>
      </div>
    </div>
  )
}
