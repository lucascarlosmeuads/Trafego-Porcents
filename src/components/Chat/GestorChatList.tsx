
import { useState } from 'react'
import { useChatConversas, ChatConversaPreview } from '@/hooks/useChatMessages'
import { useAuth } from '@/hooks/useAuth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, MessageCircle, User, ArrowRight, Filter, FilterX, X } from 'lucide-react'
import { ChatInterface } from './ChatInterface'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function GestorChatList() {
  const { conversas, loading } = useChatConversas()
  const [selectedChat, setSelectedChat] = useState<ChatConversaPreview | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showOnlyUnread, setShowOnlyUnread] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { user } = useAuth()

  // Debug: log das conversas carregadas
  console.log('Conversas carregadas:', conversas.length)
  conversas.forEach(c => {
    console.log(`Cliente: ${c.nome_cliente}, Última mensagem: "${c.ultima_mensagem}", Data: ${c.ultima_mensagem_data}`)
  })

  // Obter lista única de status das conversas
  const availableStatus = Array.from(new Set(conversas.map(c => c.status_campanha).filter(Boolean)))

  const conversasFiltradas = conversas
    .filter(conversa =>
      conversa.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversa.email_cliente.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(conversa => showOnlyUnread ? conversa.tem_mensagens_nao_lidas : true)
    .filter(conversa => statusFilter === 'all' ? true : conversa.status_campanha === statusFilter)

  const totalNaoLidas = conversas.filter(c => c.tem_mensagens_nao_lidas).length
  const totalFiltradas = conversasFiltradas.length
  const totalConversas = conversas.length

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

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'otimização':
      case 'otimizacao':
        return 'bg-blue-600 text-white hover:bg-blue-700'
      case 'agendamento':
        return 'bg-yellow-500 text-black hover:bg-yellow-600'
      case 'off':
        return 'bg-red-600 text-white hover:bg-red-700'
      case 'no ar':
        return 'bg-green-600 text-white hover:bg-green-700'
      case 'site':
        return 'bg-orange-600 text-white hover:bg-orange-700'
      case 'criativo':
        return 'bg-purple-600 text-white hover:bg-purple-700'
      case 'brief':
        return 'bg-indigo-600 text-white hover:bg-indigo-700'
      case 'problema':
        return 'bg-red-700 text-white hover:bg-red-800'
      default:
        return 'bg-gray-600 text-white hover:bg-gray-700'
    }
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setShowOnlyUnread(false)
    setStatusFilter('all')
  }

  const hasActiveFilters = searchTerm || showOnlyUnread || statusFilter !== 'all'

  const handleSelectChat = (conversa: ChatConversaPreview) => {
    console.log('Selecionando chat:', conversa.email_cliente, 'Mensagens não lidas:', conversa.tem_mensagens_nao_lidas)
    setSelectedChat(conversa)
  }

  // Função para determinar as classes CSS baseadas no estado
  const getCardClasses = (conversa: ChatConversaPreview) => {
    const baseClasses = "transition-all duration-200 cursor-pointer hover:shadow-xl border-l-4"
    
    // A lógica de seleção não se aplica aqui pois ao clicar já navega para o chat
    // Apenas verificar se tem mensagens não lidas
    if (conversa.tem_mensagens_nao_lidas) {
      return `${baseClasses} bg-red-900/20 border-red-500 hover:bg-red-900/30 shadow-red-500/20 border-l-red-500`
    }
    
    return `${baseClasses} bg-gray-800 border-gray-700 hover:bg-gray-750 border-l-blue-500 hover:border-l-blue-400`
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
          {totalNaoLidas > 0 && (
            <Badge variant="destructive" className="bg-red-600 text-white text-sm px-3 py-1">
              {totalNaoLidas} não lidas
            </Badge>
          )}
        </div>
        
        {/* Contador de resultados */}
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
        
        {/* Busca */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-3">
          {/* Filtro de não lidas */}
          <Button
            variant={showOnlyUnread ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowOnlyUnread(!showOnlyUnread)}
            className={`justify-start ${
              showOnlyUnread 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            {showOnlyUnread ? <FilterX className="h-4 w-4 mr-2" /> : <Filter className="h-4 w-4 mr-2" />}
            {showOnlyUnread ? 'Mostrar todas' : 'Apenas não lidas'}
          </Button>

          {/* Filtro por status */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 h-9 bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="all" className="text-white hover:bg-gray-600">
                Todos os status
              </SelectItem>
              {availableStatus.map((status) => (
                <SelectItem key={status} value={status} className="text-white hover:bg-gray-600">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusBadgeVariant(status).split(' ')[0]}`} />
                    {status}
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
          conversasFiltradas.map((conversa) => (
            <Card 
              key={conversa.email_cliente}
              className={getCardClasses(conversa)}
              onClick={() => handleSelectChat(conversa)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  {/* Lado esquerdo - Informações do cliente */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className={`h-16 w-16 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg md:h-14 md:w-14 ${
                      conversa.tem_mensagens_nao_lidas 
                        ? 'bg-gradient-to-br from-red-700 to-red-800 ring-2 ring-red-500' 
                        : 'bg-gradient-to-br from-blue-800 to-blue-900'
                    }`}>
                      <User className={`h-8 w-8 md:h-7 md:w-7 ${
                        conversa.tem_mensagens_nao_lidas ? 'text-red-200' : 'text-blue-300'
                      }`} />
                    </div>
                    
                    {/* Informações */}
                    <div className="flex-1 min-w-0">
                      {/* Nome e timestamp */}
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                        <h3 className={`text-xl font-bold truncate pr-2 mb-1 md:mb-0 ${
                          conversa.tem_mensagens_nao_lidas ? 'text-red-100' : 'text-white'
                        }`}>
                          {conversa.nome_cliente}
                          {conversa.tem_mensagens_nao_lidas && (
                            <span className="ml-2 text-red-400 text-xl">●</span>
                          )}
                        </h3>
                        <span className="text-sm text-gray-400 flex-shrink-0">
                          {formatLastMessageTime(conversa.ultima_mensagem_data)}
                        </span>
                      </div>
                      
                      {/* Status */}
                      <div className="mb-4">
                        <Badge 
                          className={`text-base font-semibold px-4 py-2 ${getStatusBadgeVariant(conversa.status_campanha)}`}
                        >
                          {conversa.status_campanha}
                        </Badge>
                      </div>
                      
                      {/* Última mensagem */}
                      <p className={`text-sm line-clamp-2 leading-relaxed ${
                        conversa.tem_mensagens_nao_lidas ? 'text-gray-300 font-medium' : 'text-gray-400'
                      }`}>
                        {conversa.ultima_mensagem || 'Nenhuma mensagem ainda'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Lado direito - Indicadores */}
                  <div className="flex flex-col items-end gap-3 ml-4 flex-shrink-0">
                    {/* Badge de mensagens não lidas */}
                    {conversa.mensagens_nao_lidas > 0 && (
                      <Badge variant="destructive" className="text-sm font-bold px-3 py-2 min-w-[32px] h-8 flex items-center justify-center bg-red-600 text-white animate-pulse">
                        {conversa.mensagens_nao_lidas}
                      </Badge>
                    )}
                    
                    {/* Botão de chat */}
                    <div className={`rounded-full p-4 transition-all duration-200 shadow-lg hover:scale-105 ${
                      conversa.tem_mensagens_nao_lidas 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}>
                      <ArrowRight className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
