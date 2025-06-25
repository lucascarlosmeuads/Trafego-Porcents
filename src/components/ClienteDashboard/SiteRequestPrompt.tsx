
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Globe, HelpCircle } from 'lucide-react'
import { SiteRequestModal } from './SiteRequestModal'

export function SiteRequestPrompt() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-center gap-2 p-4 mt-6 border-t border-gray-200/20">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <HelpCircle className="h-4 w-4" />
          <span>Precisa de site?</span>
        </div>
        <Button
          variant="link"
          onClick={() => setModalOpen(true)}
          className="text-blue-400 hover:text-blue-300 underline p-0 h-auto font-normal text-sm"
        >
          Clique aqui pra entender como funciona
        </Button>
      </div>

      <SiteRequestModal 
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  )
}
