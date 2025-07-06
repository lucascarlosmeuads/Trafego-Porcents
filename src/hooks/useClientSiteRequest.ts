
import { useState, useEffect } from 'react'
import { useSiteSolicitations, SiteSolicitation } from './useSiteSolicitations'
import { useAuth } from './useAuth'

export type SiteRequestStatus = 
  | 'never_requested'     // Nunca solicitou site
  | 'requested_pending'   // Solicitou mas nunca acessou formulário
  | 'form_accessed'       // Já acessou o formulário
  | 'loading'            // Carregando dados

export function useClientSiteRequest() {
  const { user } = useAuth()
  const { getClientSolicitation, createSolicitation, markFormAccessed } = useSiteSolicitations()
  
  const [solicitation, setSolicitation] = useState<SiteSolicitation | null>(null)
  const [status, setStatus] = useState<SiteRequestStatus>('loading')
  const [loading, setLoading] = useState(true)

  const loadClientSolicitation = async () => {
    if (!user?.email) {
      setStatus('never_requested')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await getClientSolicitation(user.email)
      
      if (!data) {
        setStatus('never_requested')
        setSolicitation(null)
      } else {
        setSolicitation(data)
        
        if (data.formulario_acessado_em) {
          setStatus('form_accessed')
        } else {
          setStatus('requested_pending')
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar solicitação do cliente:', error)
      setStatus('never_requested')
    } finally {
      setLoading(false)
    }
  }

  const requestSite = async () => {
    if (!user?.email) return { success: false }

    try {
      setLoading(true)
      
      // Buscar dados do cliente na tabela todos_clientes para pegar informações completas
      const clienteData = {
        email_cliente: user.email,
        nome_cliente: user.email.split('@')[0], // Fallback para o nome
        telefone: '',
        email_gestor: 'andreza@trafegoporcents.com'
      }

      const result = await createSolicitation(clienteData)
      
      if (result.success) {
        await loadClientSolicitation()
        return { success: true }
      } else if (result.existing) {
        await loadClientSolicitation()
        return { success: true, existing: true }
      }
      
      return { success: false }
    } catch (error) {
      console.error('❌ Erro ao solicitar site:', error)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  const accessForm = async () => {
    if (!solicitation?.token_acesso) return null

    try {
      // Marcar como acessado
      await markFormAccessed(solicitation.id)
      
      // Atualizar status local
      setStatus('form_accessed')
      
      // Retornar URL com token
      const formUrl = `https://siteexpress.space/formulario/trafego?token=${solicitation.token_acesso}&email=${encodeURIComponent(user?.email || '')}`
      
      return formUrl
    } catch (error) {
      console.error('❌ Erro ao acessar formulário:', error)
      return null
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'never_requested':
        return {
          title: '🌟 Site Incluso no Seu Pacote!',
          description: 'Seu site já está incluído! Clique abaixo para solicitar a criação.',
          action: 'Solicitar Meu Site'
        }
      case 'requested_pending':
        return {
          title: '✅ Site Solicitado com Sucesso!',
          description: 'Agora acesse o formulário para começarmos a criação do seu site.',
          action: 'Acessar Formulário (Única Vez)'
        }
      case 'form_accessed':
        return {
          title: '🎯 Formulário Já Acessado',
          description: `Você acessou o formulário em ${new Date(solicitation?.formulario_acessado_em || '').toLocaleDateString('pt-BR')}. A Andreza entrará em contato em breve!`,
          action: null
        }
      case 'loading':
        return {
          title: 'Carregando...',
          description: 'Verificando status do seu site...',
          action: null
        }
      default:
        return {
          title: 'Status Desconhecido',
          description: 'Entre em contato com o suporte.',
          action: null
        }
    }
  }

  useEffect(() => {
    loadClientSolicitation()
  }, [user?.email])

  return {
    status,
    solicitation,
    loading,
    requestSite,
    accessForm,
    getStatusMessage,
    reload: loadClientSolicitation
  }
}
