'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Comanda = {
  id: number
  numero_pedido: string
  cliente: string
  comanda_numero: number
  total: number
  status: string
}

export default function ComandasAbertasPage() {
  const [comandas, setComandas] = useState<Comanda[]>([])
  const [loading, setLoading] = useState(true)

  async function carregarComandas() {
    setLoading(true)

    const { data, error } = await supabase
      .from('vendas')
      .select('id, numero_pedido, cliente, comanda_numero, total, status')
      .eq('status', 'EM_ABERTO')
      .order('data', { ascending: true })

    if (!error && data) {
      setComandas(data as any)
    }

    setLoading(false)
  }

  useEffect(() => {
    carregarComandas()
  }, [])

  if (loading) {
    return <div className="p-8 font-bold">Carregando comandas...</div>
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-black text-pink-600 mb-8">📋 Comandas em Aberto</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {comandas.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-2xl shadow border">
            <p className="text-xs text-gray-400 font-bold">Pedido</p>
            <p className="font-black text-lg">{c.numero_pedido}</p>

            <p className="mt-2 text-sm">
              <span className="font-bold">Cliente:</span> {c.cliente}
            </p>

            <p className="text-sm">
              <span className="font-bold">Comanda:</span> {c.comanda_numero}
            </p>

            <p className="mt-3 font-black text-pink-600">
              Total: R$ {Number(c.total || 0).toFixed(2)}
            </p>

            <Link
              href={`/comandas/${c.id}`}
              className="block mt-4 text-center py-3 bg-pink-500 text-white font-black rounded-xl hover:bg-pink-600"
            >
              Detalhes
            </Link>
          </div>
        ))}
      </div>

      {comandas.length === 0 && (
        <p className="text-center text-gray-400 mt-20 font-bold">
          Nenhuma comanda em aberto.
        </p>
      )}
    </div>
  )
}
