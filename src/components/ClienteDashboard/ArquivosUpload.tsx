
import { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle, Paperclip, Upload, X, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase'

interface ArquivoCliente {
  id: string
  nome_arquivo: string
  url_arquivo: string
  data_upload: string
  descricao?: string
}

interface ArquivosUploadProps {
  emailCliente: string
  arquivos: ArquivoCliente[]
  onArquivosUpdated: () => void
  onBack?: () => void
}

// Função para sanitizar nomes de arquivos
const sanitizeFileName = (fileName: string): string => {
  // Remove ou substitui caracteres problemáticos
  return fileName
    .normalize('NFD') // Normaliza acentos
    .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos (acentos)
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Substitui caracteres especiais por underscore
    .replace(/_+/g, '_') // Remove underscores duplicados
    .replace(/^_+|_+$/g, '') // Remove underscores no início e fim
    .replace(/\s+/g, '_') // Substitui espaços por underscore
    .toLowerCase() // Converte para minúsculas
}

export function ArquivosUpload({ emailCliente, arquivos, onArquivosUpdated, onBack }: ArquivosUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [descricao, setDescricao] = useState('')
  const { toast } = useToast()

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg', '.gif', '.svg'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx'],
      'application/vnd.ms-excel': ['.xls', '.xlsx'],
      'application/zip': ['.zip', '.rar'],
      'text/plain': ['.txt'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv']
    },
    maxFiles: 5,
    maxSize: 25 * 1024 * 1024, // 25MB
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles)
    }
  })

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: 'Nenhum arquivo selecionado',
        description: 'Por favor, selecione os arquivos que deseja enviar.',
        variant: 'destructive'
      })
      return
    }

    setUploading(true)
    try {
      await Promise.all(
        files.map(async (file) => {
          const fileExt = file.name.split('.').pop()
          const originalFileName = file.name.replace(`.${fileExt}`, '')
          
          // Sanitizar o nome do arquivo
          const sanitizedFileName = sanitizeFileName(originalFileName)
          const timestamp = Date.now()
          const filePath = `uploads/${emailCliente}/${timestamp}-${sanitizedFileName}.${fileExt}`

          console.log('📤 [ArquivosUpload] Iniciando upload:', {
            originalFileName: file.name,
            sanitizedFileName: `${sanitizedFileName}.${fileExt}`,
            fileType: file.type,
            fileSize: file.size,
            filePath: filePath
          })

          // Upload para o Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('cliente-arquivos')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            console.error('❌ [ArquivosUpload] Erro no upload para storage:', uploadError)
            throw uploadError
          }

          console.log('✅ [ArquivosUpload] Upload para storage concluído:', uploadData)

          // Gerar URL pública
          const { data: { publicUrl } } = supabase.storage
            .from('cliente-arquivos')
            .getPublicUrl(filePath)

          console.log('🔗 [ArquivosUpload] URL gerada:', publicUrl)

          // Inserir registro no banco de dados (tabela correta: arquivos_cliente)
          const { error: dbError } = await supabase
            .from('arquivos_cliente')
            .insert({
              email_cliente: emailCliente,
              nome_arquivo: file.name, // Mantém o nome original para exibição
              tipo_arquivo: file.type,
              caminho_arquivo: filePath,
              tamanho_arquivo: file.size,
              author_type: 'cliente'
            })

          if (dbError) {
            console.error('❌ [ArquivosUpload] Erro ao inserir no banco:', dbError)
            throw dbError
          }

          console.log('✅ [ArquivosUpload] Registro inserido no banco com sucesso')
        })
      )

      toast({
        title: 'Arquivos enviados com sucesso!',
        description: 'Seus arquivos foram enviados e estão sendo processados.',
        className: 'bg-green-500 text-white'
      })

      setFiles([])
      setDescricao('')
      onArquivosUpdated()
    } catch (error: any) {
      console.error('💥 [ArquivosUpload] Erro no processo de upload:', error)
      toast({
        title: 'Erro ao enviar arquivos',
        description: error.message || 'Ocorreu um erro ao enviar os arquivos. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Botão de voltar para desktop */}
      {onBack && (
        <div className="hidden md:block">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Painel Principal
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Envio de Arquivos e Materiais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Compartilhe arquivos importantes para sua campanha.
          </p>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição dos Arquivos (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Adicione uma descrição para os arquivos que você está enviando..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            <div {...getRootProps()} className="rounded-md border-2 border-dashed border-muted-foreground/50 p-4 text-center">
              <input {...getInputProps()} />
              <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Arraste e solte arquivos aqui ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Formatos aceitos: JPEG, PNG, PDF, DOC, XLS, ZIP, TXT, MP4, MOV (Max. 25MB por arquivo, 5 arquivos no total)
              </p>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Arquivos selecionados:</h4>
                <ul className="space-y-1">
                  {files.map((file, index) => (
                    <li key={file.name} className="flex items-center justify-between rounded-md border p-2">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{file.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(file.size / 1024)} KB
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button onClick={handleUpload} disabled={uploading} className="w-full">
              {uploading ? (
                <>
                  Enviando...
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current ml-2"></div>
                </>
              ) : (
                'Enviar Arquivos'
              )}
            </Button>
          </div>

          <Separator />

          <div>
            <h3 className="text-md font-medium">Arquivos Enviados Anteriormente</h3>
            {arquivos.length === 0 ? (
              <p className="text-muted-foreground mt-2">Nenhum arquivo enviado ainda.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {arquivos.map((arquivo) => (
                  <Card key={arquivo.id}>
                    <CardContent className="flex items-start justify-between p-4">
                      <div className="space-y-1">
                        <a
                          href={arquivo.url_arquivo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                        >
                          <Paperclip className="w-4 h-4 mr-1" />
                          {arquivo.nome_arquivo}
                        </a>
                        <p className="text-sm text-muted-foreground">
                          Enviado em {format(new Date(arquivo.data_upload), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                        {arquivo.descricao && (
                          <p className="text-sm mt-1">
                            <span className="font-medium">Descrição:</span> {arquivo.descricao}
                          </p>
                        )}
                      </div>
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botão de voltar para mobile */}
      {onBack && (
        <div className="md:hidden pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Painel Principal
          </Button>
        </div>
      )}
    </div>
  )
}
