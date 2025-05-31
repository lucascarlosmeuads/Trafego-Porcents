
import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, Square, Play, Pause, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/components/ui/sonner'

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
  const [uploading, setUploading] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      
      const options = {
        mimeType: 'audio/webm;codecs=opus'
      }
      
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.warn('⚠️ [AudioRecorder] Formato preferido não suportado, usando padrão')
        delete options.mimeType
      }
      
      const mediaRecorder = new MediaRecorder(stream, options)
      const chunks: BlobPart[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        
        console.log('📊 [AudioRecorder] Gravação finalizada:', {
          tamanho: blob.size,
          tipo: blob.type,
          chunks: chunks.length
        })
        
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(100)
      setIsRecording(true)
      
      let seconds = 0
      intervalRef.current = setInterval(() => {
        seconds++
        setDuration(seconds)
      }, 1000)
      
    } catch (error) {
      console.error('❌ [AudioRecorder] Erro ao iniciar gravação:', error)
      toast.error('Erro ao acessar o microfone. Verifique as permissões.')
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
      setUploading(true)
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user?.id) {
        console.error('❌ [AudioRecorder] Usuário não autenticado:', userError)
        toast.error('Você precisa estar logado para enviar áudios.')
        return
      }

      const timestamp = Date.now()
      const fileName = `audio_${timestamp}.webm`
      const filePath = `${user.id}/${fileName}`

      console.log('📤 [AudioRecorder] Enviando áudio:', { 
        fileName, 
        filePath, 
        userId: user.id,
        blobSize: audioBlob.size,
        blobType: audioBlob.type
      })

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-audios')
        .upload(filePath, audioBlob, {
          cacheControl: '3600',
          upsert: false,
          contentType: audioBlob.type
        })

      if (uploadError) {
        console.error('❌ [AudioRecorder] Erro no upload:', uploadError)
        toast.error('Erro ao enviar áudio. Tente novamente.')
        throw uploadError
      }

      console.log('✅ [AudioRecorder] Upload concluído:', uploadData.path)

      const { data: { publicUrl } } = supabase.storage
        .from('chat-audios')
        .getPublicUrl(filePath)

      const finalUrl = `${publicUrl}?t=${timestamp}`

      console.log('🔗 [AudioRecorder] URL pública gerada:', finalUrl)

      // Verificar se o arquivo está acessível
      try {
        const response = await fetch(finalUrl, { method: 'HEAD' })
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        console.log('✅ [AudioRecorder] Arquivo acessível via URL pública')
      } catch (fetchError) {
        console.warn('⚠️ [AudioRecorder] Arquivo pode não estar imediatamente acessível:', fetchError)
      }

      onAudioReady(finalUrl)
      deleteAudio()
      toast.success('Áudio enviado com sucesso!')
      
    } catch (error) {
      console.error('💥 [AudioRecorder] Erro ao enviar áudio:', error)
      toast.error('Erro ao enviar áudio. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }, [audioBlob, onAudioReady, deleteAudio])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg border border-border">
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
            <span className="text-sm text-red-500 font-mono flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              {formatDuration(duration)}
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 w-full">
          <Button size="sm" variant="ghost" onClick={playAudio} disabled={uploading}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <span className="text-sm font-mono flex-1 text-foreground">
            Áudio gravado ({formatDuration(duration)})
          </span>
          
          <Button size="sm" variant="ghost" onClick={deleteAudio} disabled={uploading}>
            <Trash2 className="h-4 w-4" />
          </Button>
          
          <Button 
            size="sm" 
            onClick={uploadAndSend} 
            disabled={uploading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {uploading ? 'Enviando...' : 'Enviar'}
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
