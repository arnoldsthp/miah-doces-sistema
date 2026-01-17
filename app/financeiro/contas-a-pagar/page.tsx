'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Despesa = {
  id: number
  codigo_item: string | null
  descricao: string
  fornecedor: string | null
  valor: number
  data_despesa: string | null
  data_vencimento: string | null
  data_pagamento: string | null
  pago: boolean
}

const STATUS = ['TODAS', 'ABERTA', 'VENCIDA', 'PAGA'] as const

function hojeISO() {
  return new Date().toISOString().slice(0, 10)
}

function formatarData(data: string | null) {
  if (!data) return '-'
  return new Date(data).toLocaleDateString('pt-BR')
}

function calcularStatus(d: Despesa): 'ABERTA' | 'VENCIDA' | 'PAGA' {
  if (d.pago) return 'PAGA'
  if (d.data_vencimento && d.data_vencimento < hojeISO()) return 'VENCIDA'
  return 'ABERTA'
}

export default function ContasAPagar() {
  const [todas, setTodas] = useState<Despesa[]>([])
  const [filtro, setFiltro] =
    useState<(typeof STATUS)[number]>('TODAS')

  const [editando, setEditando] = useState<Despesa | null>(null)
  const [processando, setProcessando] = useState<number | null>(null)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    const { data } = await supabase
      .from('despesas_fixas')
      .select('*')
      .order('data_vencimento', { ascending: true })

    setTodas(data || [])
  }

  async function marcarPaga(id: number) {
    const ok = confirm('Deseja realmente marcar esta despesa como paga?')
    if (!ok) return

    setProcessando(id)

    const { error } = await supabase
      .from('despesas_fixas')
      .update({
        pago: true,
        data_pagamento: hojeISO(),
      })
      .eq('id', id)

    setProcessando(null)

    if (error) {
      alert('Erro ao marcar como paga: ' + error.message)
      return
    }

    carregar()
  }

  async function salvarEdicao() {
    if (!editando) return

    await supabase
      .from('despesas_fixas')
      .update({
        descricao: editando.descricao,
        fornecedor: editando.fornecedor,
        valor: editando.valor,
        data_despesa: editando.data_despesa,
        data_vencimento: editando.data_vencimento,
      })
      .eq('id', editando.id)

    setEditando(null)
    carregar()
  }

  const filtradas =
    filtro === 'TODAS'
      ? todas
      : todas.filter(d => calcularStatus(d) === filtro)

  const totalPorStatus = (s: 'ABERTA' | 'VENCIDA' | 'PAGA') =>
    todas
      .filter(d => calcularStatus(d) === s)
      .reduce((acc, d) => acc + Number(d.valor), 0)

  return (
    <div className="space-y-6 text-[13px] text-gray-800 bg-gray-100 min-h-screen p-6">

      <h1 className="text-2xl font-black">Contas a Pagar</h1>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card titulo="Em Aberto" valor={totalPorStatus('ABERTA')} cor="text-yellow-600" />
        <Card titulo="Vencidas" valor={totalPorStatus('VENCIDA')} cor="text-red-600" />
        <Card titulo="Pagas" valor={totalPorStatus('PAGA')} cor="text-green-600" />
      </div>

      {/* FILTRO */}
      <div className="flex gap-2">
        {STATUS.map(s => (
          <button
            key={s}
            onClick={() => setFiltro(s)}
            className={`px-4 py-2 rounded-full text-xs font-semibold ${
              filtro === s
                ? 'bg-pink-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs font-bold text-gray-700">
            <tr>
              <th className="p-3 text-left">DATA</th>
              <th className="p-3 text-left">VENC.</th>
              <th className="p-3 text-left">CÓDIGO</th>
              <th className="p-3 text-left">DESCRIÇÃO</th>
              <th className="p-3 text-left">FORNECEDOR</th>
              <th className="p-3 text-right">VALOR</th>
              <th className="p-3 text-center">STATUS</th>
              <th className="p-3 text-center">AÇÃO</th>
            </tr>
          </thead>

          <tbody>
            {filtradas.map(d => {
              const st = calcularStatus(d)

              return (
                <tr key={d.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{formatarData(d.data_despesa)}</td>
                  <td className="p-3">{formatarData(d.data_vencimento)}</td>
                  <td className="p-3 font-mono">{d.codigo_item || '-'}</td>
                  <td className="p-3">{d.descricao}</td>
                  <td className="p-3">{d.fornecedor || '-'}</td>

                  <td className="p-3 text-right font-bold">
                    R$ {d.valor.toFixed(2)}
                  </td>

                  <td className="p-3 text-center">{st}</td>

                  <td className="p-3 text-center space-x-3">
                    {st === 'ABERTA' && (
                      <>
                        <button
                          onClick={() => setEditando(d)}
                          className="text-blue-600 hover:underline"
                        >
                          Editar
                        </button>

                        <button
                          disabled={processando === d.id}
                          onClick={() => marcarPaga(d.id)}
                          className="text-green-600 hover:underline font-semibold disabled:opacity-50"
                        >
                          {processando === d.id
                            ? 'Processando...'
                            : 'Marcar como paga'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              )
            })}

            {filtradas.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-400">
                  Nenhum registro encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL EDIÇÃO (inalterado) */}
      {editando && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-black">Editar Despesa</h2>

            <input
              value={editando.descricao}
              onChange={e =>
                setEditando({ ...editando, descricao: e.target.value })
              }
              className="w-full border px-3 py-2 rounded"
            />

            <input
              value={editando.fornecedor || ''}
              onChange={e =>
                setEditando({ ...editando, fornecedor: e.target.value })
              }
              className="w-full border px-3 py-2 rounded"
            />

            <input
              type="number"
              value={editando.valor}
              onChange={e =>
                setEditando({ ...editando, valor: Number(e.target.value) })
              }
              className="w-full border px-3 py-2 rounded"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={editando.data_despesa || ''}
                onChange={e =>
                  setEditando({ ...editando, data_despesa: e.target.value })
                }
                className="border px-3 py-2 rounded"
              />

              <input
                type="date"
                value={editando.data_vencimento || ''}
                onChange={e =>
                  setEditando({
                    ...editando,
                    data_vencimento: e.target.value,
                  })
                }
                className="border px-3 py-2 rounded"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setEditando(null)}
                className="px-4 py-2 rounded bg-gray-100"
              >
                Cancelar
              </button>

              <button
                onClick={salvarEdicao}
                className="px-4 py-2 rounded bg-pink-600 text-white font-bold"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Card({
  titulo,
  valor,
  cor,
}: {
  titulo: string
  valor: number
  cor: string
}) {
  return (
    <div className="bg-white p-4 rounded-xl shadow border">
      <p className="text-xs text-gray-500 uppercase">{titulo}</p>
      <p className={`text-xl font-bold ${cor}`}>
        R$ {valor.toFixed(2)}
      </p>
    </div>
  )
}
