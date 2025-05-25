
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { Upload, FileText, Image, Video, Trash2 } from 'lucide-react'
import type { ArquivoCliente } from '@/hooks/useClienteData'

interface ArquivosUploadProps {
  emailCliente: string
  arquivos: ArquivoCliente[]
  onArquivosUpdated: () => void
}

export function ArquivosUpload({ emailCliente, arquivos, onArquivosUpdated }: ArquivosUploadProps) {
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (tipo: string) => {
    if (tipo.startsWith('image/')) return <Image className="w-4 h-4" />
    if (tipo.startsWith('video/')) return <Video className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      for (const file of files) {
        // Validar tipo de arquivo
        const allowedTypes = [
          'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
          'video/mp4', 'video/avi', 'video/mov', 'video/wmv'
        ]
        
        if (!allowedTypes.includes(file.type)) {
          toast({
            title: "Tipo de arquivo não permitido",
            description: `O arquivo ${file.name} não é suportado.`,
            variant: "destructive"
          })
          continue
        }

        // Validar tamanho (máximo 50MB)
        if (file.size > 50 * 1024 * 1024) {
          toast({
            title: "Arquivo muito grande",
            description: `O arquivo ${file.name} deve ter no máximo 50MB.`,
            variant: "destructive"
          })
          continue
        }

        // Upload para o Supabase Storage
        const fileName = `${Date.now()}-${file.name}`
        const filePath = `${emailCliente}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('cliente-arquivos')
          .upload(filePath, file)

        if (uploadError) {
          console.error('Erro no upload:', uploadError)
          toast({
            title: "Erro no upload",
            description: `Falha ao enviar ${file.name}`,
            variant: "destructive"
          })
          continue
        }

        // Salvar informações do arquivo no banco
        const { error: dbError } = await supabase
          .from('arquivos_cliente')
          .insert({
            email_cliente: emailCliente,
            nome_arquivo: file.name,
            caminho_arquivo: filePath,
            tipo_arquivo: file.type,
            tamanho_arquivo: file.size
          })

        if (dbError) {
          console.error('Erro ao salvar no banco:', dbError)
          // Tentar remover o arquivo do storage se falhou no banco
          await supabase.storage
            .from('cliente-arquivos')
            .remove([filePath])
        }
      }

      toast({
        title: "Upload concluído!",
        description: "Seus arquivos foram enviados com sucesso.",
      })

      onArquivosUpdated()

    } catch (error) {
      console.error('Erro no upload:', error)
      toast({
        title: "Erro no upload",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
      // Limpar o input
      e.target.value = ''
    }
  }

  const handleDeleteFile = async (arquivo: ArquivoCliente) => {
    try {
      // Remover do storage
      await supabase.storage
        .from('cliente-arquivos')
        .remove([arquivo.caminho_arquivo])

      // Remover do banco
      const { error } = await supabase
        .from('arquivos_cliente')
        .delete()
        .eq('id', arquivo.id)

      if (error) throw error

      toast({
        title: "Arquivo removido",
        description: `${arquivo.nome_arquivo} foi removido com sucesso.`,
      })

      onArquivosUpdated()

    } catch (error) {
      console.error('Erro ao remover arquivo:', error)
      toast({
        title: "Erro ao remover arquivo",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Envio de Materiais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-4">
            Envie imagens e vídeos do seu produto para criação dos materiais publicitários
          </p>
          <Input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="max-w-xs mx-auto"
          />
          <p className="text-xs text-gray-500 mt-2">
            Formatos aceitos: JPG, PNG, GIF, WebP, MP4, AVI, MOV, WMV (máx. 50MB)
          </p>
        </div>

        {uploading && (
          <div className="text-center py-4">
            <p className="text-sm text-blue-600">Enviando arquivos...</p>
          </div>
        )}

        {arquivos.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Arquivos Enviados ({arquivos.length})</h4>
            {arquivos.map((arquivo) => (
              <div key={arquivo.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getFileIcon(arquivo.tipo_arquivo)}
                  <div>
                    <p className="text-sm font-medium">{arquivo.nome_arquivo}</p>
                    <p className="text-xs text-gray-500">
                      {arquivo.tamanho_arquivo && formatFileSize(arquivo.tamanho_arquivo)} • 
                      {new Date(arquivo.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteFile(arquivo)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
