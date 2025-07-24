import { createClienteNovoUser } from './utils/createClienteNovoUser'

// Teste para criar o usuário clientenovo
async function testCreateUser() {
  console.log('🎯 Testando criação do usuário clientenovo...')
  
  const result = await createClienteNovoUser()
  
  if (result.success) {
    console.log('✅ SUCESSO! Usuário criado:', result.data)
  } else {
    console.error('❌ ERRO ao criar usuário:', result.error)
  }
}

// Executar o teste
testCreateUser()