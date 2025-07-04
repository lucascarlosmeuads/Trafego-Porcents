
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, Image, Video, Music, Archive, AlertCircle } from 'lucide-react'

interface ArquivoCliente {
  id: string
  nome_arquivo: string
  tipo_arquivo: string
  tamanho_arquivo: number | null
  caminho_arquivo: string
  created_at: string
  author_type: string
}

interface ClienteArquivosProps {
  emailCliente: string
}

export function ClienteArquivos({ emailCliente }: ClienteArquivosProps) {
  const [arquivos, setArquivos] = useState<ArquivoCliente[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchArquivos()
  }, [emailCliente])

  const fetchArquivos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('arquivos_cliente')
        .select('*')
        .eq('email_cliente', emailCliente)
        .order('created_at', { ascending: false })

      if (error) {
        setError(`Erro ao carregar arquivos: ${error.message}`)
        return
      }

      setArquivos(data || [])
    } catch (err) {
      setError('Erro inesperado ao carregar arquivos')
    } finally {
      setLoading(false)
    }
  }

  const getFileIcon = (tipoArquivo: string) => {
    const tipo = tipoArquivo.toLowerCase()
    if (tipo.includes('image')) return <Image className="h-4 w-4" />
    if (tipo.includes('video')) return <Video className="h-4 w-4" />
    if (tipo.includes('audio')) return <Music className="h-4 w-4" />
    if (tipo.includes('zip') || tipo.includes('rar')) return <Archive className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`
  }

  const handleDownload = async (arquivo: ArquivoCliente) => {
    try {
      const { data, error } = await supabase.storage
        .from('cliente-arquivos')
        .download(arquivo.caminho_arquivo)

      if (error) {
        console.error('Erro ao baixar arquivo:', error)
        return
      }

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = arquivo.nome_arquivo
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erro inesperado ao baixar arquivo:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-red-800 text-sm">{error}</span>
        </div>
      </div>
    )
  }

  if (arquivos.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhum arquivo encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {arquivos.map((arquivo) => (
        <div key={arquivo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {getFileIcon(arquivo.tipo_arquivo)}
            <div>
              <p className="font-medium text-sm">{arquivo.nome_arquivo}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{formatFileSize(arquivo.tamanho_arquivo)}</span>
                <span>•</span>
                <Badge variant="outline" className="text-xs">
                  {arquivo.author_type === 'cliente' ? 'Cliente' : 'Gestor'}
                </Badge>
                <span>•</span>
                <span>{new Date(arquivo.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDownload(arquivo)}
            className="h-7 px-2"
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  )
}
