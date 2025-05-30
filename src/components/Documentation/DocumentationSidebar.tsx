
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, File, Book } from 'lucide-react'

interface DocumentationItem {
  id: string
  title: string
  path: string
  category?: string
}

interface DocumentationSidebarProps {
  selectedDoc: string
  onDocSelect: (docId: string) => void
}

const documentationItems: DocumentationItem[] = [
  { id: 'readme', title: 'Índice Geral', path: 'README.md', category: 'Principal' },
  { id: 'visao-geral', title: '1. Visão Geral', path: '01-visao-geral.md', category: 'Documentação' },
  { id: 'perfis-usuario', title: '2. Perfis de Usuário', path: '02-perfis-usuario.md', category: 'Documentação' },
  { id: 'modulos-sistema', title: '3. Módulos do Sistema', path: '03-modulos-sistema.md', category: 'Documentação' },
  { id: 'base-dados', title: '4. Base de Dados', path: '04-base-dados.md', category: 'Documentação' },
  { id: 'fluxo-trabalho', title: '5. Fluxo de Trabalho', path: '05-fluxo-trabalho.md', category: 'Documentação' }
]

export function DocumentationSidebar({ selectedDoc, onDocSelect }: DocumentationSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredDocs = documentationItems.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const groupedDocs = filteredDocs.reduce((acc, doc) => {
    const category = doc.category || 'Outros'
    if (!acc[category]) acc[category] = []
    acc[category].push(doc)
    return acc
  }, {} as Record<string, DocumentationItem[]>)

  return (
    <div className="w-80 bg-card border-r border-border h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-4">
          <Book className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-lg">Documentação</h2>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {Object.entries(groupedDocs).map(([category, docs]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {category}
              </h3>
              <div className="space-y-1">
                {docs.map((doc) => (
                  <Button
                    key={doc.id}
                    variant={selectedDoc === doc.id ? 'default' : 'ghost'}
                    className="w-full justify-start text-sm h-auto py-2"
                    onClick={() => onDocSelect(doc.id)}
                  >
                    <File className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="text-left truncate">{doc.title}</span>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
