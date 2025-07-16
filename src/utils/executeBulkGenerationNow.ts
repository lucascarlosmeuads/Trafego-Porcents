import { executeBulkPlanGeneration } from './bulkGeneratePlans';

// Executar a geração em massa imediatamente
console.log('🚀 Iniciando geração em massa de 130 planejamentos...');

executeBulkPlanGeneration()
  .then(result => {
    console.log('✅ Geração em massa concluída!');
    console.log('📊 Resultado:', result);
    console.log(`✅ Sucessos: ${result.sucessos}`);
    console.log(`❌ Erros: ${result.erros}`);
    console.log(`📋 Total processado: ${result.total}`);
  })
  .catch(error => {
    console.error('❌ Erro na geração em massa:', error);
  });