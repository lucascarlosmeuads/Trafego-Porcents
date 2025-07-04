
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
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  FileText, 
  Sparkles,
  AlertCircle
} from 'lucide-react'

// Schema para Etapa 1 - Informações do Negócio
const etapa1Schema = z.object({
  nome_produto: z.string().min(2, "Nome do produto precisa ter pelo menos 2 caracteres"),
  nome_marca: z.string().min(2, "Nome da marca precisa ter pelo menos 2 caracteres"),
  descricao_resumida: z.string().min(10, "Descrição precisa ter pelo menos 10 caracteres"),
  publico_alvo: z.string().min(10, "Público alvo precisa ter pelo menos 10 caracteres"),
  diferencial: z.string().min(10, "Diferencial precisa ter pelo menos 10 caracteres"),
  observacoes_finais: z.string().optional(),
  quer_site: z.enum(['sim', 'nao'], {
    required_error: "Por favor, selecione se você quer um site.",
  }),
})

// Schema para Etapa 2 - Informações da Campanha
const etapa2Schema = z.object({
  investimento_diario: z.number().min(1, "Investimento deve ser maior que R$ 1"),
  direcionamento_campanha: z.enum(['whatsapp', 'site'], {
    required_error: "Selecione o direcionamento da campanha",
  }),
  abrangencia_atendimento: z.enum(['brasil', 'regiao'], {
    required_error: "Selecione a abrangência do atendimento",
  }),
  forma_pagamento: z.enum(['cartao', 'pix', 'boleto'], {
    required_error: "Selecione a forma de pagamento",
  }),
  possui_facebook: z.boolean(),
  possui_instagram: z.boolean(),
  utiliza_whatsapp_business: z.boolean(),
})

// Schema para Etapa 3 - Criativos
const etapa3Schema = z.object({
  criativos_prontos: z.boolean(),
  videos_prontos: z.boolean(),
  cores_desejadas: z.string().min(2, "Informe as cores desejadas"),
  tipo_fonte: z.enum(['moderna', 'serifada', 'bold', 'minimalista', 'tech', 'retro'], {
    required_error: "Selecione o tipo de fonte",
  }),
  cores_proibidas: z.string().optional(),
  fonte_especifica: z.string().optional(),
  estilo_visual: z.enum(['limpo', 'elementos'], {
    required_error: "Selecione o estilo visual",
  }),
  tipos_imagens_preferidas: z.array(z.string()).min(1, "Selecione pelo menos um tipo de imagem"),
})

// Schema completo
const formSchema = etapa1Schema.merge(etapa2Schema).merge(etapa3Schema)

interface TrafficManagementFormProps {
  briefing?: any
  emailCliente: string
  onBriefingUpdated: () => void
  onBack?: () => void
}

export function TrafficManagementForm({ briefing, emailCliente, onBriefingUpdated, onBack }: TrafficManagementFormProps) {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_produto: briefing?.nome_produto || "",
      nome_marca: briefing?.nome_marca || "",
      descricao_resumida: briefing?.descricao_resumida || "",
      publico_alvo: briefing?.publico_alvo || "",
      diferencial: briefing?.diferencial || "",
      observacoes_finais: briefing?.observacoes_finais || "",
      quer_site: briefing?.quer_site ? 'sim' : 'nao',
      investimento_diario: briefing?.investimento_diario || 0,
      direcionamento_campanha: briefing?.direcionamento_campanha || undefined,
      abrangencia_atendimento: briefing?.abrangencia_atendimento || undefined,
      forma_pagamento: briefing?.forma_pagamento as any || undefined,
      possui_facebook: briefing?.possui_facebook || false,
      possui_instagram: briefing?.possui_instagram || false,
      utiliza_whatsapp_business: briefing?.utiliza_whatsapp_business || false,
      criativos_prontos: briefing?.criativos_prontos || false,
      videos_prontos: briefing?.videos_prontos || false,
      cores_desejadas: briefing?.cores_desejadas || "",
      tipo_fonte: briefing?.tipo_fonte || undefined,
      cores_proibidas: briefing?.cores_proibidas || "",
      fonte_especifica: briefing?.fonte_especifica || "",
      estilo_visual: briefing?.estilo_visual || undefined,
      tipos_imagens_preferidas: briefing?.tipos_imagens_preferidas || [],
    },
  })

  // Calcular progresso
  const progress = (currentStep / 3) * 100

  // Validar etapa atual
  const validateCurrentStep = async () => {
    let isValid = false
    
    if (currentStep === 1) {
      const etapa1Values = {
        nome_produto: form.getValues('nome_produto'),
        nome_marca: form.getValues('nome_marca'),
        descricao_resumida: form.getValues('descricao_resumida'),
        publico_alvo: form.getValues('publico_alvo'),
        diferencial: form.getValues('diferencial'),
        observacoes_finais: form.getValues('observacoes_finais'),
        quer_site: form.getValues('quer_site'),
      }
      const result = etapa1Schema.safeParse(etapa1Values)
      isValid = result.success
    } else if (currentStep === 2) {
      const etapa2Values = {
        investimento_diario: form.getValues('investimento_diario'),
        direcionamento_campanha: form.getValues('direcionamento_campanha'),
        abrangencia_atendimento: form.getValues('abrangencia_atendimento'),
        forma_pagamento: form.getValues('forma_pagamento'),
        possui_facebook: form.getValues('possui_facebook'),
        possui_instagram: form.getValues('possui_instagram'),
        utiliza_whatsapp_business: form.getValues('utiliza_whatsapp_business'),
      }
      const result = etapa2Schema.safeParse(etapa2Values)
      isValid = result.success
    }
    
    return isValid
  }

  // Avançar etapa
  const nextStep = async () => {
    const isValid = await validateCurrentStep()
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      form.trigger()
    }
  }

  // Voltar etapa
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Salvar dados
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setSuccess(false)

    try {
      const briefingData = {
        email_cliente: emailCliente.trim().toLowerCase(),
        nome_produto: values.nome_produto.trim(),
        nome_marca: values.nome_marca.trim(),
        descricao_resumida: values.descricao_resumida.trim(),
        publico_alvo: values.publico_alvo.trim(),
        diferencial: values.diferencial.trim(),
        observacoes_finais: values.observacoes_finais?.trim() || null,
        quer_site: values.quer_site === 'sim',
        investimento_diario: values.investimento_diario,
        direcionamento_campanha: values.direcionamento_campanha,
        abrangencia_atendimento: values.abrangencia_atendimento,
        forma_pagamento: values.forma_pagamento,
        possui_facebook: values.possui_facebook,
        possui_instagram: values.possui_instagram,
        utiliza_whatsapp_business: values.utiliza_whatsapp_business,
        criativos_prontos: values.criativos_prontos,
        videos_prontos: values.videos_prontos,
        cores_desejadas: values.cores_desejadas.trim(),
        tipo_fonte: values.tipo_fonte,
        cores_proibidas: values.cores_proibidas?.trim() || null,
        fonte_especifica: values.fonte_especifica?.trim() || null,
        estilo_visual: values.estilo_visual,
        tipos_imagens_preferidas: values.tipos_imagens_preferidas,
        etapa_atual: 3,
        formulario_completo: true,
      }

      const { data, error } = await supabase
        .from('briefings_cliente')
        .upsert(briefingData, { 
          onConflict: 'email_cliente',
          ignoreDuplicates: false 
        })
        .select()

      if (error) {
        console.error("Erro ao salvar o briefing:", error)
        toast({
          variant: "destructive",
          title: "Erro ao salvar.",
          description: `Ocorreu um erro ao salvar o briefing: ${error.message}`,
        })
        return
      }

      toast({
        title: "Sucesso!",
        description: "Formulário de gestão de tráfego enviado com sucesso!",
      })
      
      setSuccess(true)
      onBriefingUpdated()

    } catch (error) {
      console.error("Erro inesperado:", error)
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
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            {onBack && (
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-white hover:text-blue-200 hover:bg-white/10 rounded-xl"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium">Tráfego Porcents</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-blue-200" />
            <h1 className="text-2xl md:text-3xl font-bold">
              Formulário de Gestão de Tráfego
            </h1>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Etapa {currentStep} de 3</span>
              <span>{Math.round(progress)}% concluído</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/20" />
          </div>
        </div>

        {/* Formulário */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Etapa 1 - Informações do Negócio */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold text-gray-800 mb-2">
                        Informações do Negócio
                      </h2>
                      <p className="text-gray-600">Conte-nos sobre seu produto ou serviço</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="nome_produto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-800 font-semibold">
                            1️⃣ O que é o seu produto?
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: Curso de Marketing Digital" 
                              className="h-12 border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nome_marca"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-800 font-semibold">
                            2️⃣ Nome da marca
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: Minha Empresa Digital" 
                              className="h-12 border-gray-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="descricao_resumida"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-800 font-semibold">
                            3️⃣ Descrição resumida do seu produto/serviço
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Ex: Curso completo de marketing digital com mais de 50 aulas..."
                              className="min-h-[100px] border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-xl resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="publico_alvo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-800 font-semibold">
                            4️⃣ Quem é o seu público-alvo?
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Ex: Empreendedores de 25 a 45 anos, interessados em marketing digital..."
                              className="min-h-[100px] border-gray-200 bg-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 rounded-xl resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="diferencial"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-800 font-semibold">
                            5️⃣ Qual o diferencial do seu produto?
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Ex: Único curso que oferece mentorias 1:1 semanais..."
                              className="min-h-[100px] border-gray-200 bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-200 rounded-xl resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="observacoes_finais"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-800 font-semibold">
                            6️⃣ Observações finais (detalhes adicionais que queira compartilhar)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Informações adicionais que considera importante..."
                              className="min-h-[80px] border-gray-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quer_site"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-gray-800 font-semibold">
                            7️⃣ Você quer um site?
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex gap-6"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="sim" id="site-sim" />
                                <Label htmlFor="site-sim" className="text-gray-700 cursor-pointer">
                                  Sim
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="nao" id="site-nao" />
                                <Label htmlFor="site-nao" className="text-gray-700 cursor-pointer">
                                  Não
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Etapa 2 - Informações da Campanha */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold text-gray-800 mb-2">
                        Informações da Campanha
                      </h2>
                      <p className="text-gray-600">Configure os detalhes da sua campanha</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="investimento_diario"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-800 font-semibold">
                            1️⃣ Qual será o investimento diário em anúncios? (R$)
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="Ex: 50.00"
                              className="h-12 border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-xl"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="direcionamento_campanha"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-gray-800 font-semibold">
                            2️⃣ A campanha será direcionada para:
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex gap-6"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="whatsapp" id="dir-whatsapp" />
                                <Label htmlFor="dir-whatsapp" className="text-gray-700 cursor-pointer">
                                  WhatsApp
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="site" id="dir-site" />
                                <Label htmlFor="dir-site" className="text-gray-700 cursor-pointer">
                                  Site
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="abrangencia_atendimento"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-gray-800 font-semibold">
                            3️⃣ Sua empresa atende:
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex gap-6"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="brasil" id="abr-brasil" />
                                <Label htmlFor="abr-brasil" className="text-gray-700 cursor-pointer">
                                  Todo o Brasil
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="regiao" id="abr-regiao" />
                                <Label htmlFor="abr-regiao" className="text-gray-700 cursor-pointer">
                                  Somente sua região
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="forma_pagamento"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-gray-800 font-semibold">
                            4️⃣ Como deseja inserir o investimento para a campanha?
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex flex-col space-y-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="cartao" id="pag-cartao" />
                                <Label htmlFor="pag-cartao" className="text-gray-700 cursor-pointer">
                                  Cartão de crédito
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pix" id="pag-pix" />
                                <Label htmlFor="pag-pix" className="text-gray-700 cursor-pointer">
                                  Pix
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="boleto" id="pag-boleto" />
                                <Label htmlFor="pag-boleto" className="text-gray-700 cursor-pointer">
                                  Boleto
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="possui_facebook"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-gray-800 font-semibold">
                                5️⃣ Você já possui conta no Facebook?
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="possui_instagram"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-gray-800 font-semibold">
                                6️⃣ Você já possui conta no Instagram?
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="utiliza_whatsapp_business"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-gray-800 font-semibold">
                                7️⃣ Você utiliza WhatsApp Business?
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Etapa 3 - Criativos */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold text-gray-800 mb-2">
                        Criativos
                      </h2>
                      <p className="text-gray-600">Defina o estilo visual da sua campanha</p>
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="criativos_prontos"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-gray-800 font-semibold">
                                1️⃣ Você já possui criativos prontos que podemos utilizar?
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="videos_prontos"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-gray-800 font-semibold">
                                2️⃣ Você tem vídeos prontos que podemos usar?
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="cores_desejadas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-800 font-semibold">
                            3️⃣ Quais cores deseja utilizar nos anúncios?
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: Azul, branco, dourado" 
                              className="h-12 border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* ... resto dos campos da etapa 3 ... */}
                    <FormField
                      control={form.control}
                      name="tipo_fonte"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-gray-800 font-semibold">
                            4️⃣ Qual tipo de fonte prefere?
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="grid grid-cols-2 gap-4"
                            >
                              {[
                                { value: 'moderna', label: 'Moderna' },
                                { value: 'serifada', label: 'Serifada' },
                                { value: 'bold', label: 'Bold' },
                                { value: 'minimalista', label: 'Minimalista' },
                                { value: 'tech', label: 'Tech' },
                                { value: 'retro', label: 'Retrô' },
                              ].map((option) => (
                                <div key={option.value} className="flex items-center space-x-2">
                                  <RadioGroupItem value={option.value} id={`fonte-${option.value}`} />
                                  <Label htmlFor={`fonte-${option.value}`} className="text-gray-700 cursor-pointer">
                                    {option.label}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cores_proibidas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-800 font-semibold">
                            5️⃣ Existe alguma cor que não deve ser usada de jeito nenhum?
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: Vermelho, rosa" 
                              className="h-12 border-gray-200 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200 rounded-xl"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fonte_especifica"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-800 font-semibold">
                            6️⃣ Tem alguma fonte específica que devemos usar?
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: Arial, Roboto (opcional)" 
                              className="h-12 border-gray-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estilo_visual"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-gray-800 font-semibold">
                            7️⃣ Prefere um visual mais limpo ou com mais elementos?
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex gap-6"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="limpo" id="visual-limpo" />
                                <Label htmlFor="visual-limpo" className="text-gray-700 cursor-pointer">
                                  Visual Limpo
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="elementos" id="visual-elementos" />
                                <Label htmlFor="visual-elementos" className="text-gray-700 cursor-pointer">
                                  Visual com Mais Elementos
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tipos_imagens_preferidas"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel className="text-gray-800 font-semibold">
                              8️⃣ Sobre as imagens dos anúncios, o que você gostaria?
                            </FormLabel>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                              { id: 'pessoas-reais', label: 'Pessoas reais' },
                              { id: 'mockups-produto', label: 'Mockups de produto' },
                              { id: 'vetores-ilustrativos', label: 'Vetores ilustrativos' },
                              { id: 'fundos-texturizados', label: 'Fundos texturizados' },
                              { id: 'outro', label: 'Outro' },
                            ].map((item) => (
                              <FormField
                                key={item.id}
                                control={form.control}
                                name="tipos_imagens_preferidas"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={item.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(item.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, item.id])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== item.id
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {item.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Botões de Navegação */}
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </Button>

                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center gap-2"
                    >
                      Avançar
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={isSubmitting} 
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Enviando...
                        </>
                      ) : success ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Enviado!
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Enviar Formulário
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
