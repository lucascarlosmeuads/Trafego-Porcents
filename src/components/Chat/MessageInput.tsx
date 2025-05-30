
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Mic } from 'lucide-react'
import { AudioRecorder } from './AudioRecorder'

interface MessageInputProps {
  onSendMessage: (message: string, type?: 'texto' | 'audio') => Promise<void>
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({ onSendMessage, disabled, placeholder = "Digite sua mensagem..." }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [showAudioRecorder, setShowAudioRecorder] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSendText = async () => {
    if (!message.trim() || disabled || sending) return

    try {
      setSending(true)
      await onSendMessage(message.trim(), 'texto')
      setMessage('')
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      alert('Erro ao enviar mensagem. Tente novamente.')
    } finally {
      setSending(false)
    }
  }

  const handleSendAudio = async (audioUrl: string) => {
    try {
      setSending(true)
      await onSendMessage(audioUrl, 'audio')
      setShowAudioRecorder(false)
    } catch (error) {
      console.error('Erro ao enviar áudio:', error)
      alert('Erro ao enviar áudio. Tente novamente.')
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendText()
    }
  }

  if (showAudioRecorder) {
    return (
      <div className="border-t bg-white p-4">
        <AudioRecorder
          onAudioReady={handleSendAudio}
          disabled={disabled || sending}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAudioRecorder(false)}
          className="mt-2 w-full"
        >
          Cancelar gravação
        </Button>
      </div>
    )
  }

  return (
    <div className="border-t bg-white p-4">
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled || sending}
          className="flex-1 min-h-[44px] max-h-32 resize-none rounded-full px-4 py-3"
          rows={1}
        />
        
        <Button
          onClick={() => setShowAudioRecorder(true)}
          disabled={disabled || sending}
          variant="outline"
          size="icon"
          className="h-11 w-11 rounded-full"
        >
          <Mic className="h-4 w-4" />
        </Button>
        
        <Button
          onClick={handleSendText}
          disabled={!message.trim() || disabled || sending}
          size="icon"
          className="h-11 w-11 rounded-full bg-blue-600 hover:bg-blue-700"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
