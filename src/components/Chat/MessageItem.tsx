
import { ChatMensagem } from '@/hooks/useChatMessages'
import { Button } from '@/components/ui/button'
import { Play, Pause } from 'lucide-react'
import { useState, useRef } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface MessageItemProps {
  mensagem: ChatMensagem
  isOwn: boolean
}

export function MessageItem({ mensagem, isOwn }: MessageItemProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: ptBR })
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-3 py-2 ${
          isOwn
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-gray-200 text-gray-800 rounded-bl-sm'
        }`}
      >
        {/* Cabeçalho da mensagem */}
        <div className="flex items-center justify-between text-xs opacity-75 mb-1">
          <span className="font-medium">
            {mensagem.remetente === 'cliente' ? 'Cliente' : 'Gestor'}
          </span>
          <span>{formatTime(mensagem.created_at)}</span>
        </div>

        {/* Conteúdo da mensagem */}
        {mensagem.tipo === 'texto' ? (
          <p className="text-sm whitespace-pre-wrap break-words">
            {mensagem.conteudo}
          </p>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleAudio}
              className={`p-1 h-8 w-8 rounded-full ${
                isOwn ? 'hover:bg-blue-700' : 'hover:bg-gray-300'
              }`}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <span className="text-sm">🎤 Mensagem de áudio</span>
            
            <audio
              ref={audioRef}
              src={mensagem.conteudo}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>
        )}

        {/* Status da campanha (se disponível) */}
        {mensagem.status_campanha && (
          <div className="text-xs opacity-75 mt-1 pt-1 border-t border-opacity-30">
            Status: {mensagem.status_campanha}
          </div>
        )}
      </div>
    </div>
  )
}
