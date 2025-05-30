
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

export interface Comentario {
  id: string
  cliente_id: number
  comentario: string
  autor: string
  lido: boolean
  created_at: string
  updated_at: string
}

export function useComentariosCliente(clienteId: string) {
  const [comentarios, setComentarios] = useState<Comentario[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchComentarios = async () => {
    if (!clienteId) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('comentarios_cliente')
        .select('*')
        .eq('cliente_id', parseInt(clienteId))
        .order('created_at', { ascending: true })

      if (error) {
        console.error('❌ Erro ao buscar comentários:', error)
        toast({
          title: "Erro",
          description: "Falha ao carregar comentários",
          variant: "destructive"
        })
      } else {
        setComentarios(data || [])
      }
    } catch (error) {
      console.error('💥 Erro inesperado:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar comentários",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const adicionarComentario = async (texto: string, autor: string) => {
    if (!texto.trim() || !clienteId) return false

    setSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('comentarios_cliente')
        .insert({
          cliente_id: parseInt(clienteId),
          comentario: texto.trim(),
          autor: autor,
          lido: false
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao adicionar comentário:', error)
        toast({
          title: "Erro",
          description: "Falha ao adicionar comentário",
          variant: "destructive"
        })
        return false
      } else {
        toast({
          title: "Sucesso",
          description: "Comentário adicionado com sucesso"
        })
        // Adicionar o novo comentário à lista local
        setComentarios(prev => [...prev, data])
        return true
      }
    } catch (error) {
      console.error('💥 Erro inesperado:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao adicionar comentário",
        variant: "destructive"
      })
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const marcarComoLido = async (comentarioId: string) => {
    try {
      const { error } = await supabase
        .from('comentarios_cliente')
        .update({ lido: true })
        .eq('id', comentarioId)

      if (error) {
        console.error('❌ Erro ao marcar como lido:', error)
        toast({
          title: "Erro",
          description: "Falha ao marcar comentário como lido",
          variant: "destructive"
        })
      } else {
        // Atualizar localmente
        setComentarios(prev => 
          prev.map(c => 
            c.id === comentarioId ? { ...c, lido: true } : c
          )
        )
        toast({
          title: "Sucesso",
          description: "Comentário marcado como entendido"
        })
      }
    } catch (error) {
      console.error('💥 Erro inesperado:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar comentário",
        variant: "destructive"
      })
    }
  }

  // Calcular comentários não lidos
  const comentariosNaoLidos = comentarios.filter(c => !c.lido).length

  useEffect(() => {
    fetchComentarios()
  }, [clienteId])

  return {
    comentarios,
    loading,
    submitting,
    comentariosNaoLidos,
    adicionarComentario,
    marcarComoLido,
    refetch: fetchComentarios
  }
}
