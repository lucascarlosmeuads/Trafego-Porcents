
import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, AlertCircle } from 'lucide-react'

interface MobileAudioPlayerProps {
  audioUrl: string
  isOwn?: boolean
}

export function MobileAudioPlayer({ audioUrl, isOwn = false }: MobileAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [duration, setDuration] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleToggleAudio = useCallback(async () => {
    if (!audioRef.current) return

    if (hasError) {
      // Retry loading
      setHasError(false)
      setIsLoading(true)
      audioRef.current.load()
      return
    }

    setIsLoading(true)
    
    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error)
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }, [isPlaying, hasError])

  const handleAudioEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    console.error('Erro no áudio:', e)
    setHasError(true)
    setIsPlaying(false)
    setIsLoading(false)
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
    setIsLoading(false)
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    if (!duration) return 0
    return (currentTime / duration) * 100
  }

  return (
    <div className="flex items-center gap-2 min-w-[180px]">
      <Button
        size="sm"
        variant="ghost"
        onClick={handleToggleAudio}
        disabled={isLoading}
        className={`
          h-8 w-8 rounded-full flex-shrink-0 p-0
          ${isOwn 
            ? 'hover:bg-white/20 text-white' 
            : 'hover:bg-gray-700 text-gray-300'
          }
        `}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
        ) : hasError ? (
          <AlertCircle className="h-4 w-4 text-red-400" />
        ) : isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4 ml-0.5" />
        )}
      </Button>

      <div className="flex-1 min-w-0">
        {/* Waveform placeholder */}
        <div className="flex items-center gap-0.5 h-6 mb-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`
                w-1 rounded-full transition-all duration-200
                ${i < (getProgressPercentage() / 100) * 12
                  ? (isOwn ? 'bg-white' : 'bg-trafego-accent-primary')
                  : (isOwn ? 'bg-white/30' : 'bg-gray-600')
                }
              `}
              style={{ 
                height: `${Math.random() * 16 + 8}px` 
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
            🎤 Áudio
          </span>
          <span className={`text-xs font-mono ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
            {isPlaying ? formatTime(currentTime) : formatTime(duration || 0)}
          </span>
        </div>

        {hasError && (
          <div className="text-xs text-red-400 mt-1">
            Erro ao carregar. Toque para tentar novamente.
          </div>
        )}
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        preload="metadata"
        crossOrigin="anonymous"
      />
    </div>
  )
}
