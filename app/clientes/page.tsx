'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Cliente = {
  id: string
  codigo: string
  nome: string
  telefone: string | null
  email: string | null
  documento: string | null
}

function gerarCodigoCliente() {
  return 'C' + Date.now()
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null)

  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [documento, setDocumento] = useState('')

  useEffect(() => {
    carregarClientes()
  }, [])

  async function carregarClientes() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome')

    if (!error) {
      setClientes(data || [])
    }
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.codigo.toLowerCase().includes(busca.toLowerCase()) ||
    (c.telefone || '').includes(busca)
  )

  function abrirNovo() {
    setClienteEditando(null)
    setNome('')
    setTelefone('')
    setEmail('')
    setDocumento('')
    setModalAberto(true)
  }

  function abrirEditar(c: Cliente) {
    if (!c.id) {
      alert('Cliente inválido')
      return
    }

    setClienteEditando(c)
    setNome(c.nome)
    setTelefone(c.telefone || '')
    setEmail(c.email || '')
    setDocumento(c.documento || '')
    setModalAberto(true)
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()

    if (!telefone.trim()) {
      alert('Telefone é obrigatório')
      return
    }

    if (!nome.trim()) {
      alert('Nome é obrigatório')
      return
    }

    const tel = telefone.trim()

    // Verificar se já existe cliente com esse telefone
    const { data: existentes, error: erroBusca } = await supabase
      .from('clientes')
      .select('*')
      .eq('telefone', tel)
      .limit(1)

    if (erroBusca) {
      alert('Erro ao validar telefone')
      return
    }

    let error

    if (existentes && existentes.length > 0) {
      // UPDATE
      const clienteExistente = existentes[0]

      const res = await supabase
        .from('clientes')
        .update({
          nome: nome.trim(),
          telefone: tel,
          email: email.trim() || null,
          documento: documento.trim() || null,
        })
        .eq('id', clienteExistente.id)

      error = res.error
    } else {
      // INSERT
      const res = await supabase
        .from('clientes')
        .insert({
          codigo: gerarCodigoCliente(),
          nome: nome.trim(),
          telefone: tel,
          email: email.trim() || null,
          documento: documento.trim() || null,
        })

      error = res.error
    }

    if (error) {
      alert('Erro ao salvar cliente: ' + error.message)
      return
    }

    setModalAberto(false)
    setClienteEditando(null)
    await carregarClientes()
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-black">Clientes</h1>
        <button
          onClick={abrirNovo}
          className="bg-pink-500 text-white px-4 py-2 rounded font-bold"
        >
          Novo Cliente
        </button>
      </div>

      <input
        placeholder="Buscar por nome, código ou telefone..."
        value={busca}
        onChange={e => setBusca(e.target.value)}
        className="border p-2 w-full mb-4"
      />

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-xs uppercase">
            <tr>
              <th className="p-3">Código</th>
              <th className="p-3">Nome</th>
              <th className="p-3">Telefone</th>
              <th className="p-3">Email</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map(c => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-bold">{c.codigo}</td>
                <td className="p-3">{c.nome}</td>
                <td className="p-3">{c.telefone || '-'}</td>
                <td className="p-3">{c.email || '-'}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => abrirEditar(c)}
                    className="text-pink-600 font-bold"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={salvar}
            className="bg-white p-8 rounded-xl w-full max-w-md"
          >
            <h2 className="font-black mb-4">
              {clienteEditando ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>

            <div className="space-y-3">
              <input
                required
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Nome"
                className="border p-2 w-full"
              />
              <input
                required
                value={telefone}
                onChange={e => setTelefone(e.target.value)}
                placeholder="Telefone"
                className="border p-2 w-full"
              />
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                className="border p-2 w-full"
              />
              <input
                value={documento}
                onChange={e => setDocumento(e.target.value)}
                placeholder="CPF / CNPJ"
                className="border p-2 w-full"
              />
            </div>

            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="flex-1 bg-gray-200 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-pink-500 text-white py-2 rounded font-bold"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
