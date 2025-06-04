
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface SugestaoMelhoria {
  id: string
  titulo: string
  descricao: string
  categoria: string
  prioridade: string
  status: string
  gestor_email: string
  gestor_nome: string
  resposta_admin?: string | null
  respondido_em?: string | null
  created_at: string
  updated_at: string
}

export function useSugestoesMelhorias() {
  const { user, currentManagerName } = useAuth()
  const [sugestoes, setSugestoes] = useState<SugestaoMelhoria[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Buscar sugestões
  const fetchSugestoes = async (isAdmin = false) => {
    try {
      setLoading(true)
      let query = supabase
        .from('sugestoes_melhorias')
        .select('*')
        .order('created_at', { ascending: false })

      // Se não for admin, filtrar apenas as sugestões do gestor atual
      if (!isAdmin && user?.email) {
        query = query.eq('gestor_email', user.email)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao buscar sugestões:', error)
        return
      }

      setSugestoes(data || [])
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error)
    } finally {
      setLoading(false)
    }
  }

  // Criar nova sugestão
  const criarSugestao = async (dados: {
    titulo: string
    descricao: string
    categoria: string
    prioridade: string
  }) => {
    if (!user?.email) return false

    try {
      setSubmitting(true)
      const { error } = await supabase
        .from('sugestoes_melhorias')
        .insert({
          titulo: dados.titulo,
          descricao: dados.descricao,
          categoria: dados.categoria,
          prioridade: dados.prioridade,
          gestor_email: user.email,
          gestor_nome: currentManagerName || user.email,
          status: 'pendente'
        })

      if (error) {
        console.error('Erro ao criar sugestão:', error)
        return false
      }

      await fetchSugestoes(false) // Atualizar lista
      return true
    } catch (error) {
      console.error('Erro ao criar sugestão:', error)
      return false
    } finally {
      setSubmitting(false)
    }
  }

  // Responder sugestão (apenas admin)
  const responderSugestao = async (id: string, resposta: string) => {
    try {
      const { error } = await supabase
        .from('sugestoes_melhorias')
        .update({
          resposta_admin: resposta,
          respondido_em: new Date().toISOString(),
          status: 'respondida'
        })
        .eq('id', id)

      if (error) {
        console.error('Erro ao responder sugestão:', error)
        return false
      }

      await fetchSugestoes(true) // Atualizar lista
      return true
    } catch (error) {
      console.error('Erro ao responder sugestão:', error)
      return false
    }
  }

  useEffect(() => {
    if (user?.email) {
      fetchSugestoes(false)
    }
  }, [user?.email])

  return {
    sugestoes,
    loading,
    submitting,
    criarSugestao,
    responderSugestao,
    fetchSugestoes
  }
}
