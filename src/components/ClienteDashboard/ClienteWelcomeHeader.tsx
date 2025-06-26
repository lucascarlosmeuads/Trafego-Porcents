
interface ClienteWelcomeHeaderProps {
  className?: string
}

export function ClienteWelcomeHeader({ className }: ClienteWelcomeHeaderProps) {
  return (
    <div className={`text-center space-y-4 ${className || ''}`}>
      <div className="inline-block">
        <div className="relative group cursor-pointer mb-4">
          <div className="absolute inset-0 bg-gradient-hero rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
          <div className="relative bg-gradient-hero text-white rounded-2xl font-bold px-8 py-4 text-2xl transition-transform duration-300 hover:scale-105">
            <span>Tráfego</span>
            <span className="text-orange-300">Porcents</span>
          </div>
        </div>
      </div>
      
      <h1 className="text-3xl font-bold text-white">
        Bem-vindo ao seu painel! 🎉
      </h1>
      <p className="text-gray-400 max-w-2xl mx-auto">
        Aqui você pode acompanhar o progresso da sua campanha, enviar materiais, 
        preencher o briefing e muito mais. Vamos começar?
      </p>
    </div>
  )
}
