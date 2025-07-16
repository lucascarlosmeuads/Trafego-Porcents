import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Image, Copy, CheckCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface CopyItem {
  id: string
  tipo: 'linha1' | 'linha2'
  titulo: string
  descricao: string
  linha: string
}

interface CopyExtractionDisplayProps {
  copiesProntas: {
    linha1: {
      titulos: string[]
      descricoes: string[]
    }
    linha2: {
      titulos: string[]
      descricoes: string[]
    }
  }
  nomeOferta: string
  onCopySelected: (copy: any) => void
  selectedCopyId?: string
}

export function CopyExtractionDisplay({ 
  copiesProntas, 
  nomeOferta, 
  onCopySelected,
  selectedCopyId 
}: CopyExtractionDisplayProps) {
  const { toast } = useToast()

  // Transformar copies extraídas em formato padronizado
  const formatarCopies = (): CopyItem[] => {
    const copies: CopyItem[] = []
    
    // Linha 1 - Criativo de Atração
    copiesProntas.linha1.titulos.forEach((titulo, index) => {
      if (titulo && copiesProntas.linha1.descricoes[index]) {
        copies.push({
          id: `linha1-${index}`,
          tipo: 'linha1',
          titulo: titulo.trim(),
          descricao: copiesProntas.linha1.descricoes[index].trim(),
          linha: 'Linha 1 - Criativo de Atração'
        })
      }
    })

    // Linha 2 - Criativo Educacional  
    copiesProntas.linha2.titulos.forEach((titulo, index) => {
      if (titulo && copiesProntas.linha2.descricoes[index]) {
        copies.push({
          id: `linha2-${index}`,
          tipo: 'linha2',
          titulo: titulo.trim(),
          descricao: copiesProntas.linha2.descricoes[index].trim(),
          linha: 'Linha 2 - Criativo Educacional'
        })
      }
    })

    return copies
  }

  const copies = formatarCopies()

  const selecionarCopy = (copy: CopyItem) => {
    const copyFormatada = {
      id: copy.id,
      headline: copy.titulo,
      subheadline: `${nomeOferta} - ${copy.linha}`,
      copy: `${copy.titulo}\n\n${copy.descricao}\n\nExtraído do planejamento estratégico.`,
      cta: 'QUERO SABER MAIS',
      style: copy.linha,
      createdAt: new Date(),
      origem: 'planejamento-estrategico'
    }

    onCopySelected(copyFormatada)
    
    toast({
      title: "Copy selecionada!",
      description: `${copy.linha} pronta para gerar imagem.`,
    })
  }

  const copiarTexto = (copy: CopyItem) => {
    const texto = `${copy.titulo}\n\n${copy.descricao}`
    navigator.clipboard.writeText(texto)
    
    toast({
      title: "Copy copiada!",
      description: "Texto copiado para a área de transferência.",
    })
  }

  if (copies.length === 0) {
    return (
      <Card className="border-yellow-200 bg-yellow-50/50">
        <CardContent className="p-6 text-center">
          <p className="text-yellow-800">
            Nenhuma copy pronta foi encontrada no planejamento.
            Tente fazer upload de um PDF com seções "Linha 1" e "Linha 2" de criativos.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Copies Extraídas do Planejamento ({copies.length})
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Selecione qualquer copy para gerar a imagem correspondente
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {copies.map((copy) => (
              <Card 
                key={copy.id}
                className={`transition-all duration-200 ${
                  selectedCopyId === copy.id 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:border-primary/50'
                }`}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={copy.tipo === 'linha1' ? 'default' : 'secondary'}
                        className={copy.tipo === 'linha1' ? 'bg-blue-600' : 'bg-purple-600'}
                      >
                        {copy.linha}
                      </Badge>
                      {selectedCopyId === copy.id && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Selecionada
                        </Badge>
                      )}
                    </div>

                    {/* Copy Content */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-primary">
                        {copy.titulo}
                      </h3>
                      <p className="text-muted-foreground">
                        {copy.descricao}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant={selectedCopyId === copy.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => selecionarCopy(copy)}
                        className="flex-1"
                      >
                        {selectedCopyId === copy.id ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Selecionada
                          </>
                        ) : (
                          <>
                            <Image className="h-3 w-3 mr-1" />
                            Gerar Imagem
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copiarTexto(copy)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}