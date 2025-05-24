
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Save, X } from 'lucide-react'

interface ProblemaDescricaoProps {
  clienteId: string
  descricaoAtual?: string
  onSave: (clienteId: string, descricao: string) => Promise<boolean>
  onCancel: () => void
}

export function ProblemaDescricao({ 
  clienteId, 
  descricaoAtual = '', 
  onSave, 
  onCancel 
}: ProblemaDescricaoProps) {
  const [descricao, setDescricao] = useState(descricaoAtual)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDescricao(descricaoAtual)
  }, [descricaoAtual])

  const handleSave = async () => {
    if (!descricao.trim()) {
      return
    }

    setSaving(true)
    try {
      const success = await onSave(clienteId, descricao.trim())
      if (success) {
        onCancel() // Fechar o modal/campo
      }
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    }
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave()
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-amber-50 border-amber-200">
      <div className="flex items-center gap-2 text-amber-700">
        <AlertTriangle className="w-4 h-4" />
        <Label className="font-medium">Descrição do Problema</Label>
        <span className="text-xs text-amber-600">(obrigatório)</span>
      </div>
      
      <Textarea
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Descreva detalhadamente o problema encontrado..."
        className="min-h-[100px] border-amber-300 focus:border-amber-500 focus:ring-amber-500"
        autoFocus
      />
      
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={saving}
        >
          <X className="w-4 h-4 mr-1" />
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || !descricao.trim()}
          className="bg-amber-600 hover:bg-amber-700"
        >
          <Save className="w-4 h-4 mr-1" />
          {saving ? 'Salvando...' : 'Salvar Problema'}
        </Button>
      </div>
      
      <p className="text-xs text-amber-600">
        Pressione Ctrl+Enter para salvar rapidamente ou Esc para cancelar
      </p>
    </div>
  )
}
