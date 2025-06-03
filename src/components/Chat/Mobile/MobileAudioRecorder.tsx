
import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Send, Mic } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/components/ui/sonner'

interface MobileAudioRecorderProps {
  onAudioReady: (audioUrl: string) => void
  onCancel: () => void
  disabled?: boolean
}

export function MobileAudioRecorder({ onAudioReady, onCancel, disabled }: MobileAudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [uploading, setUploading] = useState(false)
  const [waveformData, setWaveformData] = useState<number[]>([])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const animationRef = useRef<number>()

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          channelCount: 1
        } 
      })
      
      streamRef.current = stream
      
      const options = {
        mimeType: 'audio/webm;codecs=opus'
      }
      
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.warn('Formato preferido não suportado, usando padrão')
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
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(100)
      setIsRecording(true)
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
      // Start waveform animation
      const animateWaveform = () => {
        setWaveformData(prev => {
          const newData = [...prev]
          if (newData.length >= 20) {
            newData.shift()
          }
          newData.push(Math.random() * 40 + 20)
          return newData
        })
        animationRef.current = requestAnimationFrame(animateWaveform)
      }
      animateWaveform()
      
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error)
      toast.error('Erro ao acessar o microfone. Verifique as permissões.')
      onCancel()
    }
  }, [onCancel])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [isRecording])

  const uploadAndSend = useCallback(async () => {
    if (!audioBlob) return

    try {
      setUploading(true)
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user?.id) {
        toast.error('Você precisa estar logado para enviar áudios.')
        return
      }

      const timestamp = Date.now()
      const fileName = `audio_${timestamp}.webm`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('chat-audios')
        .upload(filePath, audioBlob, {
          cacheControl: '3600',
          upsert: false,
          contentType: audioBlob.type
        })

      if (uploadError) {
        console.error('Erro no upload:', uploadError)
        toast.error('Erro ao enviar áudio. Tente novamente.')
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('chat-audios')
        .getPublicUrl(filePath)

      const finalUrl = `${publicUrl}?t=${timestamp}`
      
      onAudioReady(finalUrl)
      
    } catch (error) {
      console.error('Erro ao enviar áudio:', error)
      toast.error('Erro ao enviar áudio. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }, [audioBlob, onAudioReady])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCancel = () => {
    stopRecording()
    onCancel()
  }

  // Auto-start recording when component mounts
  useEffect(() => {
    startRecording()
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  if (!isRecording && !audioBlob) {
    return null
  }

  return (
    <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
      {isRecording ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white font-mono text-sm">
              {formatTime(recordingTime)}
            </span>
            
            {/* Waveform visualization */}
            <div className="flex items-end gap-0.5 h-8 flex-1 max-w-32">
              {waveformData.map((height, index) => (
                <div
                  key={index}
                  className="bg-trafego-accent-primary rounded-full w-1 transition-all duration-100"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>

          <Button
            onClick={handleCancel}
            size="icon"
            variant="ghost"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 flex-shrink-0"
            disabled={disabled}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Mic className="h-4 w-4 text-trafego-accent-primary" />
            <span className="text-white text-sm">
              Áudio gravado ({formatTime(recordingTime)})
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCancel}
              size="sm"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <Button 
              onClick={uploadAndSend} 
              size="sm"
              disabled={uploading}
              className="bg-trafego-accent-primary hover:bg-trafego-accent-primary/90 text-white"
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
