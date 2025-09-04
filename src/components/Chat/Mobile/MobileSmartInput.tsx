
import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Mic, Lock } from 'lucide-react'
import { MobileAudioRecorder } from './MobileAudioRecorder'
import { useIsMobile } from '@/hooks/use-mobile'

interface MobileSmartInputProps {
  onSendMessage: (content: string, type?: 'texto' | 'audio') => Promise<void>
  onTyping?: () => void
  placeholder?: string
  disabled?: boolean
}

export function MobileSmartInput({ 
  onSendMessage, 
  onTyping,
  placeholder = "Digite uma mensagem...",
  disabled = false 
}: MobileSmartInputProps) {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isLongPress, setIsLongPress] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isMobile = useIsMobile()
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleSendText = useCallback(async () => {
    if (!message.trim() || isSending) return

    setIsSending(true)
    try {
      await onSendMessage(message.trim(), 'texto')
      setMessage('')
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = '20px'
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
      e.preventDefault()
      handleSendText()
    }
  }

  const handleInputChange = (value: string) => {
    setMessage(value)
    adjustTextareaHeight()
    
    // Trigger typing indicator with debounce
    if (onTyping) {
      onTyping()
      
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
      
      typingTimerRef.current = setTimeout(() => {
        // Stop typing indicator
      }, 1000)
    }
  }

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '20px'
      const scrollHeight = textareaRef.current.scrollHeight
      const maxHeight = 100 // ~4 lines
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`
    }
  }

  // Long press handlers for audio recording
  const handleMouseDown = () => {
    if (message.trim()) return // Only for audio when no text
    
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPress(true)
      setIsRecording(true)
    }, 200)
  }

  const handleMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }
    
    if (isLongPress) {
      setIsLongPress(false)
      // Recording will be handled by MobileAudioRecorder
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    handleMouseDown()
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    handleMouseUp()
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [])

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="bg-gray-900 border-t border-gray-800 p-3">
      <div className="flex items-end gap-2 max-w-lg mx-auto">
        {/* Main input area */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSending || isRecording}
            className="
              min-h-[44px] max-h-[100px] resize-none rounded-3xl border-gray-700 
              bg-gray-800 text-white placeholder:text-gray-400
              focus:ring-2 focus:ring-trafego-accent-primary focus:border-trafego-accent-primary
              text-base px-4 py-3 pr-12
              scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent
            "
            rows={1}
          />
          
          {/* Send button when there's text */}
          {message.trim() && (
            <Button
              onClick={handleSendText}
              disabled={disabled || isSending || !message.trim()}
              size="icon"
              className="
                absolute right-2 bottom-2 h-8 w-8 rounded-full 
                bg-trafego-accent-primary hover:bg-trafego-accent-primary/90
                text-white shadow-lg
              "
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Audio button when no text */}
        {!message.trim() && (
          <Button
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            size="icon"
            disabled={disabled || isSending}
            className={`
              h-11 w-11 rounded-full transition-all duration-200 flex-shrink-0
              ${isRecording || isLongPress
                ? 'bg-red-500 hover:bg-red-600 scale-110' 
                : 'bg-trafego-accent-primary hover:bg-trafego-accent-primary/90'
              }
              text-white shadow-lg active:scale-95
            `}
          >
            {isRecording ? <Lock className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
        )}
      </div>

      {/* Audio recorder */}
      {isRecording && (
        <div className="mt-3 px-2">
          <MobileAudioRecorder
            onAudioReady={handleSendAudio}
            onCancel={() => {
              setIsRecording(false)
              setIsLongPress(false)
            }}
            disabled={disabled || isSending}
          />
        </div>
      )}

      {/* Sending indicator */}
      {isSending && (
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-400">Enviando...</span>
        </div>
      )}
    </div>
  )
}
