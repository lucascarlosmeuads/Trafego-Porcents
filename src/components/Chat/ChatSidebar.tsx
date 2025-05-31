
import { useState } from 'react'
import { ChatConversaPreview } from '@/hooks/useChatMessages'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, MessageCircle, User, Filter, FilterX, X } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'

interface ChatSidebarProps {
  conversas: ChatConversaPreview[]
  selectedChat: ChatConversaPreview | null
  onSelectChat: (conversa: ChatConversaPreview) => void
  loading: boolean
}

export function ChatSidebar({ conversas, selectedChat, onSelectChat, loading }: ChatSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showOnlyUnread, setShowOnlyUnread] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Função específica para marcar mensagens como lidas
  const marcarMensagensComoLidas = async (emailCliente: string, emailGestor: string) => {
    try {
      console.log('📖 [ChatSidebar] Marcando mensagens como lidas:', {
        emailCliente,
        emailGestor
      })

      const { error } = await supabase
        .from('chat_mensagens')
        .update({ lida: true })
        .eq('lida', false)
        .eq('remetente', 'cliente')
        .eq('email_cliente', emailCliente)
        .eq('email_gestor', emailGestor)

      if (error) throw error
      
      console.log('✅ [ChatSidebar] Mensagens marcadas como lidas com sucesso')
    } catch (err) {
      console.error('❌ [ChatSidebar] Erro ao marcar mensagens como lidas:', err)
    }
  }

  // CORREÇÃO: Filtrar conversas válidas primeiro
  const conversasValidas = conversas.filter(c => 
    c.email_cliente && 
    c.email_cliente.trim() !== '' && 
    c.nome_cliente && 
    c.nome_cliente.trim() !== ''
  )

  // Obter lista única de status das conversas
  const availableStatus = Array.from(new Set(conversasValidas.map(c => c.status_campanha).filter(Boolean)))

  const conversasFiltradas = conversasValidas
    .filter(conversa =>
      conversa.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversa.email_cliente.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(conversa => showOnlyUnread ? conversa.tem_mensagens_nao_lidas : true)
    .filter(conversa => statusFilter === 'all' ? true : conversa.status_campanha === statusFilter)

  const totalNaoLidas = conversasValidas.filter(c => c.tem_mensagens_nao_lidas).length
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

  // CORREÇÃO: Função isSelected mais rigorosa
  const isSelected = (conversa: ChatConversaPreview) => {
    if (!selectedChat || !conversa) return false
    const isSelectedChat = selectedChat.email_cliente === conversa.email_cliente && 
                          selectedChat.email_gestor === conversa.email_gestor
    console.log(`🔍 [ChatSidebar] Verificando seleção para ${conversa.email_cliente}:`, {
      isSelectedChat,
      selectedEmail: selectedChat?.email_cliente,
      conversaEmail: conversa.email_cliente
    })
    return isSelectedChat
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setShowOnlyUnread(false)
    setStatusFilter('all')
  }

  const hasActiveFilters = searchTerm || showOnlyUnread || statusFilter !== 'all'

  const handleSelectChat = async (conversa: ChatConversaPreview) => {
    console.log('🎯 [ChatSidebar] === INÍCIO SELEÇÃO CHAT ===')
    console.log('🎯 [ChatSidebar] Chat clicado:', {
      cliente: conversa.email_cliente,
      gestor: conversa.email_gestor,
      temMensagensNaoLidas: conversa.tem_mensagens_nao_lidas,
      mensagensNaoLidas: conversa.mensagens_nao_lidas,
      jaEstaSelecionado: isSelected(conversa)
    })

    // CORREÇÃO: Verificar se já está selecionado ANTES de marcar como lidas
    const jaEstaSelecionado = isSelected(conversa)
    
    // CORREÇÃO: Marcar como lidas APENAS se tem mensagens não lidas E não está selecionado
    if (conversa.tem_mensagens_nao_lidas && !jaEstaSelecionado) {
      console.log('📖 [ChatSidebar] Marcando mensagens como lidas...')
      await marcarMensagensComoLidas(conversa.email_cliente, conversa.email_gestor)
      
      // AGUARDAR um pouco para a atualização do banco
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log('✅ [ChatSidebar] Chamando onSelectChat para:', conversa.email_cliente)
    onSelectChat(conversa)
  }

  // CORREÇÃO: Lógica de classes CSS mais específica e hierárquica
  const getCardClasses = (conversa: ChatConversaPreview) => {
    const baseClasses = "cursor-pointer transition-all duration-300 hover:shadow-lg border-l-4"
    const selecionado = isSelected(conversa)
    const naoLido = conversa.tem_mensagens_nao_lidas
    
    console.log(`🎨 [ChatSidebar] Classes para ${conversa.email_cliente}:`, {
      selecionado,
      naoLido,
      selectedChatEmail: selectedChat?.email_cliente
    })
    
    // HIERARQUIA CORRETA: 1º Selecionado (AZUL), 2º Não Lido (VERMELHO), 3º Padrão (CINZA)
    if (selecionado) {
      console.log(`🔵 [ChatSidebar] Card SELECIONADO (AZUL): ${conversa.email_cliente}`)
      return `${baseClasses} !bg-blue-900/90 !border-blue-400 shadow-blue-500/30 ring-2 ring-blue-400/50 !shadow-xl`
    }
    
    if (naoLido) {
      console.log(`🔴 [ChatSidebar] Card NÃO LIDO (VERMELHO): ${conversa.email_cliente}`)
      return `${baseClasses} !bg-red-900/50 hover:!bg-red-900/60 !border-red-500 shadow-red-500/30`
    }
    
    console.log(`⚪ [ChatSidebar] Card PADRÃO (CINZA): ${conversa.email_cliente}`)
    return `${baseClasses} bg-gray-800 border-gray-600 hover:bg-gray-750`
  }

  // Função para determinar as classes do avatar
  const getAvatarClasses = (conversa: ChatConversaPreview) => {
    const baseClasses = "h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
    
    if (isSelected(conversa)) {
      return `${baseClasses} bg-gradient-to-br from-blue-700 to-blue-800 ring-2 ring-blue-400`
    }
    
    if (conversa.tem_mensagens_nao_lidas) {
      return `${baseClasses} bg-gradient-to-br from-red-700 to-red-800 ring-2 ring-red-500`
    }
    
    return `${baseClasses} bg-gradient-to-br from-blue-800 to-blue-900`
  }

  // Função para determinar as classes do texto
  const getTextClasses = (conversa: ChatConversaPreview, isTitle: boolean = false) => {
    if (isSelected(conversa)) {
      return isTitle ? 'text-blue-100' : 'text-blue-200'
    }
    
    if (conversa.tem_mensagens_nao_lidas) {
      return isTitle ? 'text-red-100 font-semibold' : 'text-gray-200 font-medium'
    }
    
    return isTitle ? 'text-white' : 'text-gray-400'
  }

  // Função para determinar as classes do ícone do usuário
  const getUserIconClasses = (conversa: ChatConversaPreview) => {
    if (isSelected(conversa)) {
      return 'text-blue-200'
    }
    
    if (conversa.tem_mensagens_nao_lidas) {
      return 'text-red-200'
    }
    
    return 'text-blue-300'
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header - fixo */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 shadow-lg flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-white">Mensagens</h2>
          {totalNaoLidas > 0 && (
            <Badge variant="destructive" className="bg-red-600 text-white">
              {totalNaoLidas} não lidas
            </Badge>
          )}
        </div>
        
        {/* Contador de resultados */}
        <div className="mb-3 text-xs text-gray-400">
          Mostrando {totalFiltradas} de {totalConversas} conversas
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="ml-2 h-6 px-2 text-xs text-gray-400 hover:text-white"
            >
              <X className="h-3 w-3 mr-1" />
              Limpar filtros
            </Button>
          )}
        </div>
        
        {/* Busca */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
        </div>

        {/* Filtros */}
        <div className="space-y-2">
          {/* Filtro de não lidas */}
          <Button
            variant={showOnlyUnread ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowOnlyUnread(!showOnlyUnread)}
            className={`w-full justify-start ${
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
            <SelectTrigger className="w-full h-9 bg-gray-700 border-gray-600 text-white">
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

      {/* Lista de conversas - scrollável */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {conversasFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <MessageCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">
              {hasActiveFilters ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
            </h3>
            <p className="text-xs text-gray-400">
              {hasActiveFilters ? 'Tente ajustar os filtros' : 'Aguarde seus clientes iniciarem conversas'}
            </p>
          </div>
        ) : (
          conversasFiltradas.map((conversa, index) => (
            <Card 
              key={`conversa-${conversa.email_cliente}-${conversa.email_gestor}-${index}`}
              className={getCardClasses(conversa)}
              onClick={() => handleSelectChat(conversa)}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className={getAvatarClasses(conversa)}>
                    <User className={`h-6 w-6 ${getUserIconClasses(conversa)}`} />
                  </div>
                  
                  {/* Informações */}
                  <div className="flex-1 min-w-0">
                    {/* Nome e timestamp */}
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-sm font-bold truncate pr-2 ${getTextClasses(conversa, true)}`}>
                        {conversa.nome_cliente}
                        {conversa.tem_mensagens_nao_lidas && !isSelected(conversa) && (
                          <span className="ml-1 text-red-400 animate-pulse">●</span>
                        )}
                      </h3>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatLastMessageTime(conversa.ultima_mensagem_data)}
                      </span>
                    </div>
                    
                    {/* Status */}
                    <div className="mb-2">
                      <Badge 
                        className={`text-xs font-medium px-2 py-1 ${getStatusBadgeVariant(conversa.status_campanha)}`}
                      >
                        {conversa.status_campanha}
                      </Badge>
                    </div>
                    
                    {/* Última mensagem */}
                    <p className={`text-xs line-clamp-1 leading-relaxed ${getTextClasses(conversa)}`}>
                      {conversa.ultima_mensagem || 'Nenhuma mensagem ainda'}
                    </p>
                  </div>
                  
                  {/* Badge de mensagens não lidas */}
                  {conversa.mensagens_nao_lidas > 0 && !isSelected(conversa) && (
                    <Badge variant="destructive" className="text-xs font-bold px-2 py-1 min-w-[24px] h-6 flex items-center justify-center bg-red-600 text-white animate-pulse">
                      {conversa.mensagens_nao_lidas > 99 ? '99+' : conversa.mensagens_nao_lidas}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
