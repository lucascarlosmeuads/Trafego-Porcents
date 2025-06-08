
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Lock } from 'lucide-react'

interface MetaAdsPasswordPromptProps {
  isOpen: boolean
  onPasswordCorrect: () => void
  onClose: () => void
}

// Senha configurável - pode ser alterada facilmente pela equipe técnica
const META_ADS_PASSWORD = 'trafego2024'

export function MetaAdsPasswordPrompt({ isOpen, onPasswordCorrect, onClose }: MetaAdsPasswordPromptProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Simular pequeno delay para UX
    setTimeout(() => {
      if (password === META_ADS_PASSWORD) {
        onPasswordCorrect()
        setPassword('')
        setError('')
      } else {
        setError('Senha incorreta. Tente novamente.')
      }
      setLoading(false)
    }, 500)
  }

  const handleClose = () => {
    setPassword('')
    setError('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-600" />
            Acesso ao Meta Ads
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              Esta área contém configurações avançadas da Meta API. 
              Digite a senha para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha de Acesso</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha..."
                className="w-full"
                disabled={loading}
              />
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading || !password.trim()}
              >
                {loading ? 'Verificando...' : 'Acessar'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
