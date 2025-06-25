
import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeft, 
  CheckCircle, 
  FileText, 
  Sparkles,
  AlertCircle
} from 'lucide-react'

const briefingFormSchema = z.object({
  nome_produto: z.string().min(2, {
    message: "Nome do produto precisa ter pelo menos 2 caracteres.",
  }),
  investimento_diario: z.number().min(0.01, {
    message: "Investimento diário deve ser maior que R$ 0,01.",
  }),
  descricao_resumida: z.string().min(10, {
    message: "Descrição resumida precisa ter pelo menos 10 caracteres.",
  }),
  publico_alvo: z.string().min(10, {
    message: "Público alvo precisa ter pelo menos 10 caracteres.",
  }),
  diferencial: z.string().min(10, {
    message: "Diferencial do produto precisa ter pelo menos 10 caracteres.",
  }),
  quer_site: z.enum(['sim', 'nao'], {
    required_error: "Por favor, selecione se você quer um site.",
  }),
  nome_marca: z.string().optional(),
  observacoes_finais: z.string().optional(),
  forma_pagamento: z.enum(['cartao', 'boleto', 'pix'], {
    required_error: "Por favor, selecione a forma de pagamento.",
  }),
  tipo_prestacao_servico: z.enum(['presencial', 'online', 'hibrido'], {
    required_error: "Por favor, selecione o tipo de prestação do serviço.",
  }),
  localizacao_divulgacao: z.string().min(2, {
    message: "Localização para divulgação precisa ter pelo menos 2 caracteres.",
  }),
}).refine((data) => {
  if (data.quer_site === 'sim' && (!data.nome_marca || data.nome_marca.trim().length < 2)) {
    return false;
  }
  return true;
}, {
  message: "Nome da marca é obrigatório quando você quer um site.",
  path: ["nome_marca"],
});

interface BriefingCliente {
  nome_produto: string
  publico_alvo: string
  descricao_resumida: string
  diferencial: string
  investimento_diario: number
  quer_site: boolean
  nome_marca?: string | null
  observacoes_finais?: string | null
  forma_pagamento?: string | null
  tipo_prestacao_servico?: string | null
  localizacao_divulgacao?: string | null
}

interface BriefingFormProps {
  briefing?: BriefingCliente | null
  emailCliente: string
  onBriefingUpdated: () => void
  onBack?: () => void
}

export function BriefingForm({ briefing, emailCliente, onBriefingUpdated, onBack }: BriefingFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  console.log('🔍 [BriefingForm] === DEBUGGING BRIEFING FORM ===')
  console.log('📧 [BriefingForm] Email do cliente:', emailCliente)
  console.log('📋 [BriefingForm] Briefing recebido:', briefing)

  const form = useForm<z.infer<typeof briefingFormSchema>>({
    resolver: zodResolver(briefingFormSchema),
    defaultValues: {
      nome_produto: briefing?.nome_produto || "",
      investimento_diario: briefing?.investimento_diario || 0,
      descricao_resumida: briefing?.descricao_resumida || "",
      publico_alvo: briefing?.publico_alvo || "",
      diferencial: briefing?.diferencial || "",
      quer_site: briefing?.quer_site ? 'sim' : 'nao',
      nome_marca: briefing?.nome_marca || "",
      observacoes_finais: briefing?.observacoes_finais || "",
      forma_pagamento: (briefing?.forma_pagamento as 'cartao' | 'boleto' | 'pix') || undefined,
      tipo_prestacao_servico: (briefing?.tipo_prestacao_servico as 'presencial' | 'online' | 'hibrido') || undefined,
      localizacao_divulgacao: briefing?.localizacao_divulgacao || "",
    },
  })

  const watchQuerSite = form.watch('quer_site')

  useEffect(() => {
    if (briefing) {
      console.log('🔄 [BriefingForm] Resetando formulário com dados do briefing')
      form.reset({
        nome_produto: briefing.nome_produto || "",
        investimento_diario: briefing.investimento_diario || 0,
        descricao_resumida: briefing.descricao_resumida || "",
        publico_alvo: briefing.publico_alvo || "",
        diferencial: briefing.diferencial || "",
        quer_site: briefing.quer_site ? 'sim' : 'nao',
        nome_marca: briefing.nome_marca || "",
        observacoes_finais: briefing.observacoes_finais || "",
        forma_pagamento: (briefing.forma_pagamento as 'cartao' | 'boleto' | 'pix') || undefined,
        tipo_prestacao_servico: (briefing.tipo_prestacao_servico as 'presencial' | 'online' | 'hibrido') || undefined,
        localizacao_divulgacao: briefing.localizacao_divulgacao || "",
      })
    }
  }, [briefing, form])

  async function onSubmit(values: z.infer<typeof briefingFormSchema>) {
    setIsSubmitting(true)
    setSuccess(false)

    console.log('🚀 [BriefingForm] === INICIANDO SALVAMENTO ===')
    console.log('📧 [BriefingForm] Email cliente:', emailCliente)
    console.log('📝 [BriefingForm] Dados do formulário:', values)

    try {
      const briefingData = {
        email_cliente: emailCliente.trim().toLowerCase(),
        nome_produto: values.nome_produto.trim(),
        investimento_diario: values.investimento_diario,
        descricao_resumida: values.descricao_resumida.trim(),
        publico_alvo: values.publico_alvo.trim(),
        diferencial: values.diferencial.trim(),
        quer_site: values.quer_site === 'sim',
        nome_marca: values.quer_site === 'sim' ? values.nome_marca?.trim() || null : null,
        observacoes_finais: values.observacoes_finais?.trim() || null,
        forma_pagamento: values.forma_pagamento,
        tipo_prestacao_servico: values.tipo_prestacao_servico,
        localizacao_divulgacao: values.localizacao_divulgacao.trim(),
      }

      console.log('💾 [BriefingForm] Dados preparados para salvar:', briefingData)

      const { data, error } = await supabase
        .from('briefings_cliente')
        .upsert(briefingData, { 
          onConflict: 'email_cliente',
          ignoreDuplicates: false 
        })
        .select()

      console.log('📤 [BriefingForm] Resposta do upsert:', { data, error })

      if (error) {
        console.error("❌ [BriefingForm] Erro ao salvar o briefing:", error)
        toast({
          variant: "destructive",
          title: "Erro ao salvar.",
          description: `Ocorreu um erro ao salvar o briefing: ${error.message}`,
        })
        return
      }

      console.log('✅ [BriefingForm] Briefing salvo com sucesso!')
      
      toast({
        title: "Sucesso!",
        description: "Briefing salvo com sucesso.",
      })
      
      setSuccess(true)
      onBriefingUpdated()

    } catch (error) {
      console.error("💥 [BriefingForm] Erro inesperado ao salvar o briefing:", error)
      toast({
        variant: "destructive",
        title: "Erro Inesperado.",
        description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            {onBack && (
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-white hover:text-blue-200 hover:bg-white/10 rounded-xl"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Voltar ao Painel</span>
                <span className="md:hidden">Voltar</span>
              </Button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium">Tráfego Porcents</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            {success ? (
              <CheckCircle className="w-6 h-6 text-green-300" />
            ) : (
              <FileText className="w-6 h-6 text-blue-200" />
            )}
            <h1 className="text-2xl md:text-3xl font-bold">
              Briefing do Produto
            </h1>
          </div>
          <p className="text-blue-100 text-sm md:text-base">
            Conte-nos tudo sobre seu produto ou serviço para criarmos campanhas incríveis
          </p>
        </div>

        {/* Formulário */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* 📦 Nome do Produto */}
                <FormField
                  control={form.control}
                  name="nome_produto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-800 font-semibold text-base">
                        📦 Nome do Produto/Serviço
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Curso de Marketing Digital" 
                          className="h-12 border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all text-gray-800"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 💰 Investimento Diário */}
                <FormField
                  control={form.control}
                  name="investimento_diario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-800 font-semibold text-base">
                        💰 Investimento Diário (R$)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="Ex: 50.00"
                          className="h-12 border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-xl transition-all text-gray-800"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 💳 Forma de Pagamento */}
                <FormField
                  control={form.control}
                  name="forma_pagamento"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="flex items-center gap-2 text-gray-800 font-semibold text-base">
                        💳 Qual será a forma de pagamento?
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="cartao" id="pagamento-cartao" />
                            <Label htmlFor="pagamento-cartao" className="text-gray-700 cursor-pointer">
                              Cartão
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="boleto" id="pagamento-boleto" />
                            <Label htmlFor="pagamento-boleto" className="text-gray-700 cursor-pointer">
                              Boleto
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pix" id="pagamento-pix" />
                            <Label htmlFor="pagamento-pix" className="text-gray-700 cursor-pointer">
                              Pix
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 📍 Tipo de Prestação do Serviço */}
                <FormField
                  control={form.control}
                  name="tipo_prestacao_servico"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="flex items-center gap-2 text-gray-800 font-semibold text-base">
                        📍 Qual o tipo/modelo de prestação do seu serviço?
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="presencial" id="prestacao-presencial" />
                            <Label htmlFor="prestacao-presencial" className="text-gray-700 cursor-pointer">
                              Presencial
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="online" id="prestacao-online" />
                            <Label htmlFor="prestacao-online" className="text-gray-700 cursor-pointer">
                              Online
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="hibrido" id="prestacao-hibrido" />
                            <Label htmlFor="prestacao-hibrido" className="text-gray-700 cursor-pointer">
                              Híbrido
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 🌎 Localização para Divulgação */}
                <FormField
                  control={form.control}
                  name="localizacao_divulgacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-800 font-semibold text-base">
                        🌎 Em qual cidade, região ou estado o seu serviço/produto deve ser divulgado?
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: São Paulo, Brasil inteiro, Região Sudeste..." 
                          className="h-12 border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all text-gray-800"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 📝 Descrição Resumida */}
                <FormField
                  control={form.control}
                  name="descricao_resumida"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-800 font-semibold text-base">
                        📝 Descrição Resumida do Produto/Serviço
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Curso completo de marketing digital com mais de 50 aulas, certificado e suporte personalizado."
                          className="min-h-[100px] border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-xl transition-all resize-none text-gray-800"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* 🎯 Público Alvo */}
                <FormField
                  control={form.control}
                  name="publico_alvo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-800 font-semibold text-base">
                        🎯 Público-Alvo
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Empreendedores de 25 a 45 anos, interessados em marketing digital e vendas online, residentes no Brasil."
                          className="min-h-[100px] border-gray-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl transition-all resize-none text-gray-800"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* ⭐ Diferencial */}
                <FormField
                  control={form.control}
                  name="diferencial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-800 font-semibold text-base">
                        ⭐ Diferencial do Produto/Serviço
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Único curso que oferece mentorias 1:1 semanais, metodologia testada por mais de 1000 alunos."
                          className="min-h-[100px] border-gray-200 bg-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 rounded-xl transition-all resize-none text-gray-800"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 🌐 Quer Site */}
                <FormField
                  control={form.control}
                  name="quer_site"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="flex items-center gap-2 text-gray-800 font-semibold text-base">
                        🌐 Você quer um site?
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sim" id="site-sim" />
                            <Label htmlFor="site-sim" className="text-gray-700 cursor-pointer">
                              Sim, quero um site
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="nao" id="site-nao" />
                            <Label htmlFor="site-nao" className="text-gray-700 cursor-pointer">
                              Não, não quero um site
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 🏷️ Nome da Marca - Aparece apenas se quer site */}
                {watchQuerSite === 'sim' && (
                  <>
                    <FormField
                      control={form.control}
                      name="nome_marca"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-gray-800 font-semibold text-base">
                            🏷️ Nome da Marca
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: Minha Empresa Digital" 
                              className="h-12 border-gray-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl transition-all text-gray-800"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Aviso sobre upload da logo */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-blue-800 font-medium text-sm">
                            📤 Importante: Envio da Logo
                          </p>
                          <p className="text-blue-700 text-sm mt-1">
                            Como você quer um site, não esqueça de enviar a logo da sua marca na seção "Materiais" do sistema. 
                            Isso é essencial para criarmos seu site com a identidade visual correta.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {/* 💬 Observações Finais */}
                <FormField
                  control={form.control}
                  name="observacoes_finais"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-800 font-semibold text-base">
                        💬 Observações Finais (Opcional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Informações adicionais que considera importante para a campanha."
                          className="min-h-[80px] border-gray-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl transition-all resize-none text-gray-800"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Botão de Submit */}
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Salvando Briefing...
                      </div>
                    ) : success ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Briefing Salvo!
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Salvar Briefing
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Botão de voltar para mobile */}
        {onBack && (
          <div className="md:hidden">
            <Button
              variant="outline"
              onClick={onBack}
              className="w-full h-12 border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Painel Principal
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
