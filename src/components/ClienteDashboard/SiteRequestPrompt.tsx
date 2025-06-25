
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Globe, Sparkles, ArrowRight } from 'lucide-react'
import { SiteRequestModal } from './SiteRequestModal'

export function SiteRequestPrompt() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="px-4 pb-6 mt-8">
        <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 group cursor-pointer"
              onClick={() => setModalOpen(true)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute -inset-1 bg-white/20 rounded-full blur animate-pulse"></div>
                  <div className="relative bg-white/10 p-3 rounded-full backdrop-blur-sm">
                    <Globe className="h-6 w-6 text-white animate-pulse" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold text-lg">
                      Precisa de site?
                    </h3>
                    <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                  </div>
                  <p className="text-blue-100 text-sm font-medium">
                    Clique aqui pra entender como funciona
                  </p>
                  <div className="flex items-center gap-1 text-xs text-blue-200">
                    <span className="bg-green-400 text-green-900 px-2 py-0.5 rounded-full font-semibold">
                      ✨ Incluso no pacote
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <ArrowRight className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform duration-300" />
                <div className="text-xs text-blue-200 font-medium">
                  Saiba mais
                </div>
              </div>
            </div>
            
            {/* Elementos decorativos */}
            <div className="absolute top-2 right-2 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
            <div className="absolute bottom-2 left-2 w-16 h-16 bg-purple-400/10 rounded-full blur-lg"></div>
          </CardContent>
        </Card>
      </div>

      <SiteRequestModal 
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  )
}
