
import React from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export function MobileTableIndicator() {
  return (
    <div className="flex lg:hidden items-center justify-center gap-2 py-2 text-xs text-muted-foreground border-t border-border">
      <ArrowLeft className="h-3 w-3" />
      <span>Deslize horizontalmente para ver mais colunas</span>
      <ArrowRight className="h-3 w-3" />
    </div>
  )
}
