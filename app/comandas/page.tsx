'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function NovaComandaPage() {
  const [cliente, setCliente] = useState('')
  const [tipo, setTipo] = useState<'BALCAO' | 'DELIVERY'>('BALCAO')
  const [mesa, setMesa] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function criarComanda() {
    if (carregando) return
    setCarregando(true)

    const { data, error } = await supabase
      .from('vendas')
      .insert({
        cliente: cliente || 'Consumidor Final',
        tipo,
        mesa: tipo === 'BALCAO' ? mesa || 'Balcão' : null,
        status: 'ABERTA'
      })
      .select()
      .single()

    setCarregando(false)

    if (error) {
      alert('Erro ao criar comanda: ' + error.message)
      return
    }

    localStorage.setItem('saleId', data.id.toString())
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-xl">
        <h1 className="text-2xl font-black mb-6">🧾 Nova Comanda</h1>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400">Cliente</label>
            <input
              value={cliente}
              onChange={e => setCliente(e.target.value)}
              placeholder="Nome do cliente"
              className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400">Tipo</label>
            <div className="flex gap-2">
              {['BALCAO', 'DELIVERY'].map(t => (
                <button
                  key={t}
                  onClick={() => setTipo(t as any)}
                  className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase ${
                    tipo === t ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {tipo === 'BALCAO' && (
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400">Mesa / Comanda</label>
              <input
                value={mesa}
                onChange={e => setMesa(e.target.value)}
                placeholder="Ex: Mesa 5"
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none"
              />
            </div>
          )}

          <button
            onClick={criarComanda}
            disabled={carregando}
            className="w-full py-4 bg-pink-500 hover:bg-pink-600 text-white font-black rounded-2xl mt-6"
          >
            {carregando ? 'Criando...' : 'Iniciar Venda'}
          </button>
        </div>
      </div>
    </div>
  )
}
