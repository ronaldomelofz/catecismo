const fs = require('fs');

console.log('🔍 VERIFICANDO ESTRUTURA DOS DADOS...\n');

try {
  // Verifica se os arquivos existem
  const arquivos = [
    './public/data/catecismo-search.json',
    './public/data/direito-search.json', 
    './public/data/search-metadata.json'
  ];
  
  arquivos.forEach(arquivo => {
    if (fs.existsSync(arquivo)) {
      console.log(`✅ ${arquivo} existe`);
      const dados = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
      console.log(`   Tipo: ${typeof dados}`);
      console.log(`   É array: ${Array.isArray(dados)}`);
      if (Array.isArray(dados)) {
        console.log(`   Tamanho: ${dados.length}`);
        if (dados.length > 0) {
          console.log(`   Primeiro item:`, dados[0]);
        }
      } else {
        console.log(`   Propriedades:`, Object.keys(dados));
      }
      console.log('');
    } else {
      console.log(`❌ ${arquivo} NÃO existe`);
    }
  });
  
} catch (error) {
  console.error('❌ Erro:', error.message);
} 