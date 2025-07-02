const fs = require('fs');
const path = require('path');

function createSearchData() {
  console.log('🔄 Criando dados otimizados para busca...');

  // Função para processar arquivo TXT
  function processTextFile(filePath, documentType) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    const entries = [];
    let currentParagraph = null;
    let currentCanon = null;
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      // Extrai número do parágrafo/cânon
      if (documentType === 'catecismo') {
        const paragraphMatch = trimmed.match(/^(\d+)\.\s*/);
        if (paragraphMatch) {
          currentParagraph = paragraphMatch[1];
        }
      } else if (documentType === 'direito_canonico') {
        const canonMatch = trimmed.match(/^Cân\.\s*(\d+)/);
        if (canonMatch) {
          currentCanon = canonMatch[1];
        }
      }
      
      // Adiciona entrada se o texto for significativo
      if (trimmed.length > 10 && !isHeaderOrFooter(trimmed)) {
        entries.push({
          text: trimmed,
          lineNumber: index + 1,
          paragraph: currentParagraph,
          canon: currentCanon
        });
      }
    });
    
    return entries;
  }
  
  // Função para detectar cabeçalhos/rodapés
  function isHeaderOrFooter(text) {
    const headerPatterns = [
      /^CATECISMO$/i,
      /^DA IGREJA$/i,
      /^CATÓLICA$/i,
      /^CÓDIGO$/i,
      /^DIREITO CANÔNICO$/i,
      /^CONSTITUIÇÃO/i,
      /^APOSTÓLICA/i,
      /^JOÃO PAULO/i,
      /^PARTE/i,
      /^CAPÍTULO/i,
      /^SEÇÃO/i,
      /^ARTIGO/i,
      /^LIVRO/i,
      /^TÍTULO/i,
      /^\d+$/, // Apenas números (páginas)
      /^[IVX]+$/, // Números romanos
    ];
    
    return headerPatterns.some(pattern => pattern.test(text)) && text.length < 50;
  }
  
  try {
    // Processa Catecismo
    const catecismoPath = path.join(__dirname, '../data/catecismo.txt');
    const catecismoEntries = processTextFile(catecismoPath, 'catecismo');
    
    // Processa Direito Canônico
    const direitoPath = path.join(__dirname, '../data/direito_canonico.txt');
    const direitoEntries = processTextFile(direitoPath, 'direito_canonico');
    
    // Cria dados otimizados
    const searchData = {
      catecismo: catecismoEntries,
      direito_canonico: direitoEntries,
      metadata: {
        catecismo: {
          total: catecismoEntries.length,
          lastParagraph: Math.max(...catecismoEntries.filter(e => e.paragraph).map(e => parseInt(e.paragraph) || 0))
        },
        direito_canonico: {
          total: direitoEntries.length,
          lastCanon: Math.max(...direitoEntries.filter(e => e.canon).map(e => parseInt(e.canon) || 0))
        }
      }
    };
    
    // Salva arquivos individuais para melhor performance
    const publicDir = path.join(__dirname, '../public/data');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Arquivo do Catecismo
    fs.writeFileSync(
      path.join(publicDir, 'catecismo-search.json'),
      JSON.stringify({ entries: catecismoEntries, metadata: searchData.metadata.catecismo }, null, 2)
    );
    
    // Arquivo do Direito Canônico
    fs.writeFileSync(
      path.join(publicDir, 'direito-search.json'),
      JSON.stringify({ entries: direitoEntries, metadata: searchData.metadata.direito_canonico }, null, 2)
    );
    
    // Arquivo de metadados
    fs.writeFileSync(
      path.join(publicDir, 'search-metadata.json'),
      JSON.stringify(searchData.metadata, null, 2)
    );
    
    console.log('✅ Dados de busca criados com sucesso!');
    console.log(`📚 Catecismo: ${catecismoEntries.length} entradas`);
    console.log(`⚖️ Direito Canônico: ${direitoEntries.length} entradas`);
    console.log(`💾 Arquivos salvos em: ${publicDir}`);
    
  } catch (error) {
    console.error('❌ Erro ao criar dados de busca:', error);
    process.exit(1);
  }
}

// Executa se chamado diretamente
if (require.main === module) {
  createSearchData();
}

module.exports = { createSearchData }; 