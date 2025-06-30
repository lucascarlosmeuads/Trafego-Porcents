
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { useComissaoAvancada } from '@/hooks/useComissaoAvancada'
import { Edit3, Check, X, Loader2 } from 'lucide-react'

interface ComissaoEditavelProps {
  clienteId: string
  valorAtual: number
  onValorAtualizado: () => void
  disabled?: boolean
}

export function ComissaoEditavel({ 
  clienteId, 
  valorAtual, 
  onValorAtualizado,
  disabled = false 
}: ComissaoEditavelProps) {
  const [editando, setEditando] = useState(false)
  const [novoValor, setNovoValor] = useState(valorAtual.toString())
  const { atualizarValorComissao, loading } = useComissaoAvancada()

  const handleIniciarEdicao = () => {
    setNovoValor(valorAtual.toString())
    setEditando(true)
  }

  const handleCancelar = () => {
    setNovoValor(valorAtual.toString())
    setEditando(false)
  }

  const handleSalvar = async () => {
    const valor = parseFloat(novoValor.replace(',', '.'))
    
    if (isNaN(valor) || valor < 10 || valor > 1000) {
      return
    }

    const sucesso = await atualizarValorComissao(clienteId, valor)
    if (sucesso) {
      setEditando(false)
      onValorAtualizado()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSalvar()
    } else if (e.key === 'Escape') {
      handleCancelar()
    }
  }

  if (disabled) {
    return (
      <span className="text-sm font-medium">
        {formatCurrency(valorAtual)}
      </span>
    )
  }

  if (editando) {
    return (
      <div className="flex items-center gap-1 min-w-[120px]">
        <Input
          type="number"
          step="0.01"
          min="10"
          max="1000"
          value={novoValor}
          onChange={(e) => setNovoValor(e.target.value)}
          onKeyDown={handleKeyPress}
          className="h-7 text-xs w-20"
          autoFocus
          disabled={loading}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSalvar}
          disabled={loading}
          className="h-7 w-7 p-0"
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Check className="h-3 w-3 text-green-600" />
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancelar}
          disabled={loading}
          className="h-7 w-7 p-0"
        >
          <X className="h-3 w-3 text-red-600" />
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleIniciarEdicao}
      className="h-auto p-1 font-medium hover:bg-muted/50 gap-1"
    >
      {formatCurrency(valorAtual)}
      <Edit3 className="h-3 w-3 opacity-50" />
    </Button>
  )
}
