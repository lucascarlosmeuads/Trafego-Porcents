
import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, Square, Play, Pause, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface AudioRecorderProps {
  onAudioReady: (audioUrl: string) => void
  disabled?: boolean
}

export function AudioRecorder({ onAudioReady, disabled }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      
      const chunks: BlobPart[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        
        // Parar todas as tracks
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      
      // Contar duração
      let seconds = 0
      intervalRef.current = setInterval(() => {
        seconds++
        setDuration(seconds)
      }, 1000)
      
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error)
      alert('Erro ao acessar o microfone. Verifique as permissões.')
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRecording])

  const playAudio = useCallback(() => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }, [audioUrl, isPlaying])

  const deleteAudio = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioBlob(null)
    setAudioUrl(null)
    setDuration(0)
    setIsPlaying(false)
  }, [audioUrl])

  const uploadAndSend = useCallback(async () => {
    if (!audioBlob) return

    try {
      const fileName = `audio_${Date.now()}.webm`
      const filePath = `${supabase.auth.getUser().then(u => u.data.user?.email)}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('chat-audios')
        .upload(filePath, audioBlob)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('chat-audios')
        .getPublicUrl(filePath)

      onAudioReady(publicUrl)
      deleteAudio()
    } catch (error) {
      console.error('Erro ao enviar áudio:', error)
      alert('Erro ao enviar áudio. Tente novamente.')
    }
  }, [audioBlob, onAudioReady, deleteAudio])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
      {!audioBlob ? (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isRecording ? "destructive" : "default"}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled}
            className="flex items-center gap-1"
          >
            {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {isRecording ? 'Parar' : 'Gravar'}
          </Button>
          
          {isRecording && (
            <span className="text-sm text-red-600 font-mono">
              🔴 {formatDuration(duration)}
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 w-full">
          <Button size="sm" variant="ghost" onClick={playAudio}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <span className="text-sm font-mono flex-1">
            Áudio gravado ({formatDuration(duration)})
          </span>
          
          <Button size="sm" variant="ghost" onClick={deleteAudio}>
            <Trash2 className="h-4 w-4" />
          </Button>
          
          <Button size="sm" onClick={uploadAndSend} className="bg-green-600 hover:bg-green-700">
            Enviar
          </Button>
        </div>
      )}
      
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
    </div>
  )
}
