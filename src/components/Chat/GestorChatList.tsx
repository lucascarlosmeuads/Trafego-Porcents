import { useState } from 'react'
import { useChatConversas, ChatConversaPreview } from '@/hooks/useChatMessages'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, MessageCircle, User, ArrowRight, X } from 'lucide-react'
import { ChatInterface } from './ChatInterface'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getStatusBadgeClasses } from '@/utils/statusColors'
import { STATUS_CAMPANHA } from '@/lib/supabase'

export function GestorChatList() {
  const { conversas, loading, recarregar } = useChatConversas()
  const [selectedChat, setSelectedChat] = useState<ChatConversaPreview | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  const { user } = useAuth()

  const conversasValidas = conversas.filter(c => 
    c.email_cliente && 
    c.email_cliente.trim() !== '' && 
    c.nome_cliente && 
    c.nome_cliente.trim() !== ''
  )

  const conversasFiltradas = conversasValidas
    .filter(conversa =>
      conversa.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversa.email_cliente.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(conversa => statusFilter === 'all' ? true : conversa.status_campanha === statusFilter)

  const totalFiltradas = conversasFiltradas.length
  const totalConversas = conversasValidas.length

  const formatLastMessageTime = (dateString: string) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return format(date, 'HH:mm', { locale: ptBR })
    } else {
      return format(date, 'dd/MM', { locale: ptBR })
    }
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
  }

  const hasActiveFilters = searchTerm || statusFilter !== 'all'

  const isSelected = (conversa: ChatConversaPreview) => {
    if (!selectedChat || !conversa) return false
    return selectedChat.email_cliente === conversa.email_cliente && 
           selectedChat.email_gestor === conversa.email_gestor
  }

  const handleSelectChat = (conversa: ChatConversaPreview) => {
    setSelectedChat(conversa)
  }

  const getCardClasses = (conversa: ChatConversaPreview) => {
    const baseClasses = "transition-all duration-200 cursor-pointer hover:shadow-xl border-l-4"
    const selecionado = isSelected(conversa)
    
    if (selecionado) {
      return `${baseClasses} !bg-blue-900/90 !border-blue-400 shadow-blue-500/30 ring-2 ring-blue-400/50`
    }
    
    return `${baseClasses} bg-gray-800 border-gray-700 hover:bg-gray-750 border-l-blue-500`
  }

  const getAvatarClasses = (conversa: ChatConversaPreview) => {
    const baseClasses = "h-16 w-16 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg md:h-14 md:w-14"
    const selecionado = isSelected(conversa)
    
    if (selecionado) {
      return `${baseClasses} bg-gradient-to-br from-blue-700 to-blue-800 ring-2 ring-blue-400`
    }
    
    return `${baseClasses} bg-gradient-to-br from-blue-800 to-blue-900`
  }

  const getTextClasses = (conversa: ChatConversaPreview, isTitle: boolean = false) => {
    const selecionado = isSelected(conversa)
    
    if (selecionado) {
      return isTitle ? 'text-blue-100' : 'text-blue-200'
    }
    
    return isTitle ? 'text-white' : 'text-gray-400'
  }

  const getUserIconClasses = (conversa: ChatConversaPreview) => {
    const selecionado = isSelected(conversa)
    
    if (selecionado) {
      return 'text-blue-200'
    }
    
    return 'text-blue-300'
  }

  if (selectedChat) {
    return (
      <div className="h-full">
        <ChatInterface
          emailCliente={selectedChat.email_cliente}
          emailGestor={user?.email || ''}
          nomeCliente={selectedChat.nome_cliente}
          statusCampanha={selectedChat.status_campanha}
          onBack={() => setSelectedChat(null)}
          showBackButton={true}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
          <p className="text-gray-300">Carregando conversas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Mensagens dos Clientes</h2>
        </div>
        
        <div className="mb-4 text-sm text-gray-400">
          Mostrando {totalFiltradas} de {totalConversas} conversas
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="ml-3 h-7 px-3 text-sm text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar filtros
            </Button>
          )}
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
        </div>

        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 h-9 bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600 z-[60]">
              <SelectItem value="all" className="text-white hover:bg-gray-600 focus:bg-gray-600">
                Todos os status
              </SelectItem>
              {STATUS_CAMPANHA.map((status) => (
                <SelectItem key={status} value={status} className="text-white hover:bg-gray-600 focus:bg-gray-600">
                  <div className="flex items-center gap-2">
                    <span 
                      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors ${getStatusBadgeClasses(status)} !text-white border-transparent`}
                    >
                      {status}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de conversas */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversasFiltradas.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <MessageCircle className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {hasActiveFilters ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
            </h3>
            <p className="text-gray-400">
              {hasActiveFilters ? 'Tente ajustar os filtros' : 'Aguarde seus clientes iniciarem conversas'}
            </p>
          </div>
        ) : (
          conversasFiltradas.map((conversa, index) => {
            const chaveUnica = `${conversa.email_cliente}-${conversa.email_gestor}-${index}`
            
            return (
              <Card 
                key={chaveUnica}
                className={getCardClasses(conversa)}
                onClick={() => handleSelectChat(conversa)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={getAvatarClasses(conversa)}>
                        <User className={`h-8 w-8 md:h-7 md:w-7 ${getUserIconClasses(conversa)}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                          <h3 className={`text-xl font-bold truncate pr-2 mb-1 md:mb-0 ${getTextClasses(conversa, true)}`}>
                            {conversa.nome_cliente}
                          </h3>
                          <span className="text-sm text-gray-400 flex-shrink-0">
                            {formatLastMessageTime(conversa.ultima_mensagem_data)}
                          </span>
                        </div>
                        
                        <div className="mb-4">
                          <span 
                            className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors px-4 py-2 ${getStatusBadgeClasses(conversa.status_campanha)} !text-white border-transparent`}
                          >
                            {conversa.status_campanha}
                          </span>
                        </div>
                        
                        <p className={`text-sm line-clamp-2 leading-relaxed ${getTextClasses(conversa)}`}>
                          {conversa.ultima_mensagem || 'Nenhuma mensagem ainda'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3 ml-4 flex-shrink-0">
                      <div className={`rounded-full p-4 transition-all duration-200 shadow-lg hover:scale-105 ${
                        isSelected(conversa)
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}>
                        <ArrowRight className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
