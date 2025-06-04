
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
      console.log('🔍 [useSugestoesMelhorias] Buscando sugestões, isAdmin:', isAdmin)
      console.log('🔍 [useSugestoesMelhorias] User email:', user?.email)
      
      let query = supabase
        .from('sugestoes_melhorias')
        .select('*')
        .order('created_at', { ascending: false })

      // Se não for admin, filtrar apenas as sugestões do gestor atual
      if (!isAdmin && user?.email) {
        console.log('🔍 [useSugestoesMelhorias] Filtrando por gestor:', user.email)
        query = query.eq('gestor_email', user.email)
      } else if (isAdmin) {
        console.log('🔍 [useSugestoesMelhorias] Buscando TODAS as sugestões (modo admin)')
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ [useSugestoesMelhorias] Erro ao buscar sugestões:', error)
        return
      }

      console.log('✅ [useSugestoesMelhorias] Sugestões encontradas:', data?.length || 0)
      console.log('📋 [useSugestoesMelhorias] Dados:', data)
      setSugestoes(data || [])
    } catch (error) {
      console.error('❌ [useSugestoesMelhorias] Erro ao buscar sugestões:', error)
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
      console.log('📝 [useSugestoesMelhorias] Criando nova sugestão:', dados)
      
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
        console.error('❌ [useSugestoesMelhorias] Erro ao criar sugestão:', error)
        return false
      }

      console.log('✅ [useSugestoesMelhorias] Sugestão criada com sucesso')
      // Não recarregar automaticamente, deixar componente controlar
      return true
    } catch (error) {
      console.error('❌ [useSugestoesMelhorias] Erro ao criar sugestão:', error)
      return false
    } finally {
      setSubmitting(false)
    }
  }

  // Responder sugestão (apenas admin)
  const responderSugestao = async (id: string, resposta: string) => {
    try {
      console.log('💬 [useSugestoesMelhorias] Respondendo sugestão:', id)
      
      const { error } = await supabase
        .from('sugestoes_melhorias')
        .update({
          resposta_admin: resposta,
          respondido_em: new Date().toISOString(),
          status: 'respondida'
        })
        .eq('id', id)

      if (error) {
        console.error('❌ [useSugestoesMelhorias] Erro ao responder sugestão:', error)
        return false
      }

      console.log('✅ [useSugestoesMelhorias] Sugestão respondida com sucesso')
      // Não recarregar automaticamente, deixar componente controlar
      return true
    } catch (error) {
      console.error('❌ [useSugestoesMelhorias] Erro ao responder sugestão:', error)
      return false
    }
  }

  // Remover o useEffect automático que causava problemas
  // Deixar cada componente controlar quando buscar os dados

  return {
    sugestoes,
    loading,
    submitting,
    criarSugestao,
    responderSugestao,
    fetchSugestoes
  }
}
