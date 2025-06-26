
interface ClienteWelcomeHeaderProps {
  className?: string
}

export function ClienteWelcomeHeader({ className }: ClienteWelcomeHeaderProps) {
  return (
    <div className={`relative overflow-hidden ${className || ''}`}>
      {/* Background com gradiente premium */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-black"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 via-transparent to-purple-900/20"></div>
      
      {/* Conteúdo */}
      <div className="relative z-10 text-center space-y-6 px-6 py-12">
        {/* Logo Premium com efeito neon */}
        <div className="inline-block">
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white rounded-2xl font-bold px-8 py-4 text-2xl transition-all duration-300 hover:scale-105 shadow-2xl border border-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-sm">TP</span>
                </div>
                <div>
                  <span className="text-white">Tráfego</span>
                  <span className="text-orange-300 ml-1">Porcents</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Boas-vindas reformuladas */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Bem-vindo ao seu painel
            <span className="block text-3xl font-semibold text-blue-300 mt-2">
              de alta performance! 🎯
            </span>
          </h1>
          
          <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
            Sua central de comando para acompanhar campanhas, enviar materiais
            e maximizar seus resultados no Meta Ads.
          </p>
          
          {/* Call-to-action premium */}
          <div className="pt-4">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border border-green-500/30">
              <span>Vamos começar configurando sua campanha</span>
              <span className="text-xl">🚀</span>
            </div>
          </div>
        </div>
        
        {/* Efeito de brilho animado */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50 animate-pulse"></div>
      </div>
    </div>
  )
}
