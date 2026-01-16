'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Comanda = {
  id: number
  numero_pedido: string
  cliente: string
  comanda_numero: number
  total: number
  status: string
  created_at: string
}

export default function ComandasAbertasPage() {
  const [comandas, setComandas] = useState<Comanda[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  async function carregarComandas() {
    setLoading(true)

    const { data, error } = await supabase
      .from('vendas')
      .select('id, numero_pedido, cliente, comanda_numero, total, status, created_at')
      .eq('status', 'aberta')
      .order('created_at', { ascending: true })

    if (!error) {
      setComandas(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    carregarComandas()
  }, [])

  function abrirComanda(id: number) {
    localStorage.setItem('saleId', String(id))
    router.push('/')
  }

  if (loading) {
    return (
      <div className="p-8 text-sm font-medium text-gray-600">
        Carregando comandas…
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-black text-gray-800 mb-8">
        Comandas em Aberto
      </h1>

      {comandas.length === 0 && (
        <p className="text-center text-gray-400 mt-20 font-medium">
          Nenhuma comanda em aberto.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {comandas.map(c => (
          <button
            key={c.id}
            onClick={() => abrirComanda(c.id)}
            className="
              bg-white
              p-6
              rounded-2xl
              shadow
              border
              text-left
              hover:border-pink-400
              transition
            "
          >
            <p className="text-xs font-semibold text-gray-500">
              Pedido
            </p>
            <p className="text-lg font-semibold text-gray-800">
              {c.numero_pedido}
            </p>

            <p className="mt-2 text-sm text-gray-800 font-medium">
              <span className="font-semibold text-gray-700">Cliente:</span>{' '}
              {c.cliente}
            </p>

            <p className="text-sm text-gray-800 font-medium">
              <span className="font-semibold text-gray-700">Comanda:</span>{' '}
              {c.comanda_numero}
            </p>

            <p className="mt-3 text-pink-600 font-bold">
              Total: R$ {Number(c.total || 0).toFixed(2)}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              Aberta em{' '}
              {new Date(c.created_at).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
