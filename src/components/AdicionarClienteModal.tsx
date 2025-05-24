const handleSubmit = async () => {
  if (!formData.nome_cliente || !formData.telefone) {
    toast({
      title: "Erro",
      description: "Nome e telefone são obrigatórios",
      variant: "destructive"
    })
    return
  }

  setLoading(true)

  try {
    const tableName = getTableName(currentManagerName)
    const vendedor = formData.vendedor || currentManagerName

    const clienteBruto = {
      nome_cliente: formData.nome_cliente,
      telefone: formData.telefone,
      email_cliente: formData.email_cliente,
      vendedor,
      email_gestor: user?.email,
      status_campanha: formData.status_campanha,
      data_venda: new Date().toISOString().split('T')[0],
      valor_comissao: 60.00,
      comissao_paga: false
    }

    // 🔍 Remove id e campos vazios, se tiverem vindo por acidente
    const clienteLimpo = Object.fromEntries(
      Object.entries(clienteBruto).filter(
        ([key, value]) => key !== 'id' && value != null
      )
    )

    // 👇 Verificação de debug
    console.log("🟡 Payload para insert:", clienteLimpo)

    const { error } = await supabase
      .from(tableName)
      .insert([clienteLimpo])

    if (error) throw error

    toast({
      title: "Sucesso",
      description: "Cliente adicionado com sucesso"
    })

    setFormData({
      nome_cliente: '',
      telefone: '',
      email_cliente: '',
      vendedor: '',
      status_campanha: 'Brief'
    })
    setOpen(false)
    onClienteAdicionado()
  } catch (error: any) {
    console.error('Erro ao adicionar cliente:', error)
    toast({
      title: "Erro",
      description: error.message || "Erro ao adicionar cliente",
      variant: "destructive"
    })
  } finally {
    setLoading(false)
  }
}
