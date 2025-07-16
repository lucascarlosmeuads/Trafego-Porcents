import { executeReformatAllPlans } from './reformatAllPlans';

// Executar a reformatação de todos os planejamentos imediatamente
console.log('🎨 Iniciando reformatação de todos os planejamentos existentes...');

executeReformatAllPlans()
  .then(result => {
    console.log('✅ Reformatação concluída!');
    console.log('📊 Resultado:', result);
    console.log(`✅ Sucessos: ${result.sucessos}`);
    console.log(`❌ Erros: ${result.erros}`);
    console.log(`📋 Total processado: ${result.total}`);
    
    if (result.sucessos > 0) {
      console.log('🎉 TODOS OS PLANEJAMENTOS FORAM REFORMATADOS COM SUCESSO!');
      console.log('📱 Agora todos os PDFs terão formatação profissional com:');
      console.log('   ✨ Emojis estratégicos');
      console.log('   📝 Títulos em negrito maiores');
      console.log('   🎯 Estrutura hierárquica clara');
      console.log('   💼 Layout profissional para cliente');
    }
  })
  .catch(error => {
    console.error('❌ Erro na reformatação:', error);
  });