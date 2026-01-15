'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Cliente = {
  id: string
  codigo: string
  nome: string
  telefone: string
}

export default function ClienteLookup({
  onSelect,
}: {
  onSelect: (c: Cliente | null) => void
}) {
  const [busca, setBusca] = useState('')
  const [lista, setLista] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (busca.length < 2) {
      setLista([])
      return
    }

    const timer = setTimeout(() => buscar(), 300)
    return () => clearTimeout(timer)
  }, [busca])

  async function buscar() {
    setLoading(true)

    const { data } = await supabase
      .from('clientes')
      .select('id, codigo, nome, telefone')
      .or(`nome.ilike.%${busca}%,telefone.ilike.%${busca}%`)
      .order('nome')
      .limit(10)

    setLista(data || [])
    setLoading(false)
  }

  function selecionar(c: Cliente) {
    setBusca(`${c.nome}`)
    setLista([])
    onSelect(c)
  }

  function novoCliente() {
    onSelect(null)
  }

  return (
    <div className="relative">
      <input
        value={busca}
        onChange={e => setBusca(e.target.value)}
        placeholder="Nome ou telefone do cliente"
        className="border p-2 w-full"
      />

      {lista.length > 0 && (
        <div className="absolute z-50 bg-white border w-full rounded shadow max-h-60 overflow-auto">
          {lista.map(c => (
            <button
              key={c.id}
              onClick={() => selecionar(c)}
              className="w-full text-left px-3 py-2 hover:bg-gray-100"
            >
              <b>{c.codigo}</b> — {c.nome} ({c.telefone})
            </button>
          ))}
        </div>
      )}

      {busca.length > 2 && lista.length === 0 && !loading && (
        <button
          onClick={novoCliente}
          className="text-sm text-pink-600 mt-1 underline"
        >
          Cliente não encontrado — cadastrar novo
        </button>
      )}
    </div>
  )
}
