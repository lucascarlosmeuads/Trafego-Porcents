
import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Mic, MicOff } from 'lucide-react'
import { AudioRecorder } from './AudioRecorder'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  onSendMessage: (content: string, type?: 'texto' | 'audio') => Promise<void>
  placeholder?: string
  disabled?: boolean
}

export function MessageInput({ 
  onSendMessage, 
  placeholder = "Digite sua mensagem...",
  disabled = false 
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSendText = useCallback(async () => {
    if (!message.trim() || isSending) return

    setIsSending(true)
    try {
      await onSendMessage(message.trim(), 'texto')
      setMessage('')
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    } finally {
      setIsSending(false)
    }
  }, [message, onSendMessage, isSending])

  const handleSendAudio = useCallback(async (audioUrl: string) => {
    setIsSending(true)
    try {
      await onSendMessage(audioUrl, 'audio')
    } catch (error) {
      console.error('Erro ao enviar áudio:', error)
    } finally {
      setIsSending(false)
      setIsRecording(false)
    }
  }, [onSendMessage])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // No mobile, não enviar com Enter para permitir quebras de linha
    if (e.key === 'Enter' && !e.shiftKey && window.innerWidth >= 768) {
      e.preventDefault()
      handleSendText()
    }
  }

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  return (
    <div className="p-3 md:p-4 bg-card">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        {/* Text Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              adjustTextareaHeight()
            }}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isSending || isRecording}
            className={cn(
              "min-h-[44px] max-h-[120px] resize-none rounded-2xl border-border",
              "focus:ring-2 focus:ring-primary focus:border-primary",
              "text-base md:text-sm", // Larger text on mobile
              "py-3 px-4 pr-12" // More padding for touch targets
            )}
            rows={1}
          />
          
          {/* Send button - aparece quando há texto */}
          {message.trim() && (
            <Button
              onClick={handleSendText}
              disabled={disabled || isSending || !message.trim()}
              size="icon"
              className="absolute right-2 bottom-2 h-8 w-8 rounded-full bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Audio Recording */}
        {!message.trim() && (
          <div className="flex-shrink-0">
            {isRecording ? (
              <Button
                onClick={() => setIsRecording(false)}
                size="icon"
                variant="destructive"
                className="h-11 w-11 rounded-full"
              >
                <MicOff className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                onClick={() => setIsRecording(true)}
                size="icon"
                variant="outline"
                className="h-11 w-11 rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                disabled={disabled || isSending}
              >
                <Mic className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Audio Recorder */}
      {isRecording && (
        <div className="mt-3 p-3 bg-accent/50 rounded-lg">
          <AudioRecorder
            onAudioReady={handleSendAudio}
            disabled={disabled || isSending}
          />
        </div>
      )}

      {/* Sending indicator */}
      {isSending && (
        <div className="mt-2 text-center">
          <span className="text-xs text-muted-foreground">Enviando...</span>
        </div>
      )}
    </div>
  )
}
