
import { ChatMensagem } from '@/hooks/useChatMessages'
import { Button } from '@/components/ui/button'
import { Play, Pause, AlertCircle } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from '@/components/ui/sonner'

interface MessageItemProps {
  mensagem: ChatMensagem
  isOwn: boolean
}

export function MessageItem({ mensagem, isOwn }: MessageItemProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [duration, setDuration] = useState<string>('')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (mensagem.tipo === 'audio') {
      console.log('🎵 [MessageItem] URL do áudio recebida:', mensagem.conteudo)
      
      try {
        new URL(mensagem.conteudo)
        console.log('✅ [MessageItem] URL válida')
        setHasError(false)
      } catch (error) {
        console.error('❌ [MessageItem] URL inválida:', error)
        setHasError(true)
      }
    }
  }, [mensagem])

  useEffect(() => {
    if (mensagem.tipo === 'audio' && audioRef.current && mensagem.conteudo) {
      const audio = audioRef.current
      setHasError(false)
      audio.load()
      console.log('🔄 [MessageItem] Carregando áudio:', mensagem.conteudo)
    }
  }, [mensagem.conteudo, mensagem.tipo])

  const toggleAudio = async () => {
    if (!audioRef.current) return

    try {
      if (isPlaying) {
        console.log('⏸️ [MessageItem] Pausando áudio')
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        console.log('▶️ [MessageItem] Tentando reproduzir áudio:', mensagem.conteudo)
        setIsLoading(true)
        setHasError(false)
        
        audioRef.current.load()
        await new Promise(resolve => setTimeout(resolve, 100))
        
        await audioRef.current.play()
        setIsPlaying(true)
        console.log('✅ [MessageItem] Áudio reproduzindo com sucesso')
      }
    } catch (error) {
      console.error('❌ [MessageItem] Erro ao reproduzir áudio:', error)
      setHasError(true)
      setIsPlaying(false)
      toast.error('Erro ao reproduzir áudio')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration && isFinite(audioRef.current.duration)) {
      const mins = Math.floor(audioRef.current.duration / 60)
      const secs = Math.floor(audioRef.current.duration % 60)
      setDuration(`${mins}:${secs.toString().padStart(2, '0')}`)
      console.log('📊 [MessageItem] Duração do áudio carregada:', `${mins}:${secs}`)
      setHasError(false)
    }
  }

  const handleAudioCanPlay = () => {
    console.log('✅ [MessageItem] Áudio pode ser reproduzido')
    setHasError(false)
    setIsLoading(false)
  }

  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const audio = e.currentTarget
    const error = audio.error
    
    console.error('💥 [MessageItem] Erro no elemento de áudio:', {
      error: error?.message,
      code: error?.code,
      src: audio.src,
      networkState: audio.networkState,
      readyState: audio.readyState
    })
    
    setHasError(true)
    setIsPlaying(false)
    setIsLoading(false)
    toast.error('Erro ao carregar áudio')
  }

  const handleAudioEnded = () => {
    console.log('🏁 [MessageItem] Áudio terminou de tocar')
    setIsPlaying(false)
  }

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: ptBR })
  }

  const retryAudio = () => {
    console.log('🔄 [MessageItem] Tentando novamente carregar o áudio')
    setHasError(false)
    setIsLoading(true)
    
    if (audioRef.current) {
      const currentSrc = audioRef.current.src
      audioRef.current.src = ''
      audioRef.current.load()
      audioRef.current.src = currentSrc
      audioRef.current.load()
    }
    
    setTimeout(() => setIsLoading(false), 2000)
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
        <div className="flex items-center justify-between text-xs opacity-75 mb-1">
          <span className="font-medium">
            {mensagem.remetente === 'cliente' ? 'Cliente' : 'Gestor'}
          </span>
          <span>{formatTime(mensagem.created_at)}</span>
        </div>

        {mensagem.tipo === 'texto' ? (
          <p className="text-sm whitespace-pre-wrap break-words">
            {mensagem.conteudo}
          </p>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={hasError ? retryAudio : toggleAudio}
              disabled={isLoading}
              className={`p-1 h-8 w-8 rounded-full ${
                isOwn ? 'hover:bg-blue-700' : 'hover:bg-gray-300'
              }`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
              ) : hasError ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            
            <div className="flex-1 min-w-0">
              <span className="text-sm">🎤 Mensagem de áudio</span>
              {duration && (
                <span className="text-xs opacity-75 ml-2">({duration})</span>
              )}
              {hasError && (
                <div className="text-xs text-red-500 mt-1">
                  Erro ao carregar áudio. Toque para tentar novamente.
                </div>
              )}
            </div>
            
            <audio
              ref={audioRef}
              src={mensagem.conteudo}
              onEnded={handleAudioEnded}
              onError={handleAudioError}
              onLoadedMetadata={handleAudioLoadedMetadata}
              onCanPlay={handleAudioCanPlay}
              onLoadStart={() => console.log('🔄 [MessageItem] Iniciando carregamento do áudio')}
              onLoadedData={() => console.log('📊 [MessageItem] Dados do áudio carregados')}
              preload="metadata"
              className="hidden"
              crossOrigin="anonymous"
            />
          </div>
        )}

        {mensagem.status_campanha && (
          <div className="text-xs opacity-75 mt-1 pt-1 border-t border-opacity-30">
            Status: {mensagem.status_campanha}
          </div>
        )}
      </div>
    </div>
  )
}
