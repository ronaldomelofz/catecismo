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
      
      // Adiciona entrada se o texto for significativo E não for de índice
      if (trimmed.length > 10 && 
          !isHeaderOrFooter(trimmed) && 
          !isIndexContent(trimmed) &&
          !isIndexPage(trimmed)) {
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
      
      // Filtros rigorosos para ÍNDICE GERAL e todas variações
      /ÍNDICE\s*GERAL/i,
      /^ÍNDICE/i,
      /SUMÁRIO/i,
      /TABELA\s*DE\s*CONTEÚDO/i,
      /^CONTEÚDO/i,
      /^ÍNDICE\s*SISTEMÁTICO/i,
      /^ÍNDICE\s*ALFABÉTICO/i,
      /^ÍNDICE\s*ANALÍTICO/i,
      /^ÍNDICE\s*DE\s*MATÉRIAS/i,
      /^ÍNDICE\s*TEMÁTICO/i,
      /^\.{3,}/, // Linhas com pontos (típicas de índices)
      /^\d+\s*\.{3,}/, // Números seguidos de pontos
      /\.{3,}\s*\d+$/, // Pontos seguidos de números (páginas)
      /^\d+\s*-\s*\d+$/, // Intervalos de páginas (ex: 123-145)
      /^Página\s*\d+/i, // "Página 123"
      /^Pág\.\s*\d+/i, // "Pág. 123"
    ];
    
    return headerPatterns.some(pattern => pattern.test(text)) && text.length < 200;
  }
  
  // Função para detectar conteúdo específico de índices
  function isIndexContent(text) {
    const indexPatterns = [
      // Padrões típicos de índices - MUITO MAIS RIGOROSOS
      // REMOVIDO: /^\d+\.\s*[A-ZÀÁÂÃÉÊÍÓÔÕÚÜ]/i, // "1. ALGUM TÍTULO" - estava pegando parágrafos normais
      /^[A-Z\s]+\.\.\.\s*\d+$/i, // "ALGUM TÍTULO... 123"
      /^[A-Z\s]+\s*\.\.\.\s*\d+$/i, // "ALGUM TÍTULO ... 123"
      /^\d+\s*\.\s*[A-Z\s]+\s*\.\.\./i, // "1. TÍTULO..."
      /^[A-Z][a-z\s]+\.\.\.\s*\d+$/i, // "Título... 123"
      /^[IVX]+\.\s*[A-ZÀÁÂÃÉÊÍÓÔÕÚÜ]/i, // "I. TÍTULO"
      /^Parágrafo\s*\d+\s*\.\.\./i, // "Parágrafo 123..."
      /^Cân\.\s*\d+\s*\.\.\./i, // "Cân. 123..."
      /^\d+\s*-\s*\d+\s*$/i, // "123 - 456" (números de páginas)
      /^Página\s*\d+/i, // "Página 123"
      /^Pág\.\s*\d+/i, // "Pág. 123"
      /^Ver\s*também/i, // "Ver também"
      /^Cf\.\s*/i, // "Cf. "
      /^Cfr\.\s*/i, // "Cfr. "
      
      // Padrões específicos para linhas de ÍNDICE GERAL
      /^[A-ZÀÁÂÃÉÊÍÓÔÕÚÜ\s]+\s*\.{2,}\s*\d+$/i, // "TÍTULO ... 123"
      /^[A-ZÀÁÂÃÉÊÍÓÔÕÚÜ][a-z\s]*\s*\.{2,}\s*\d+$/i, // "Título ... 123"
      /^\d+\s*\.{2,}/i, // "123 ..."
      /\.{2,}\s*\d+\s*$/i, // "... 123"
      /^\s*\d+\s*$/i, // Apenas número isolado
      /^\s*[IVX]+\s*$/i, // Apenas número romano isolado
      /^[A-Z][A-Z\s]*$/, // TEXTO EM MAIÚSCULAS (títulos de seção)
      /^[A-Z][a-z\s]*,\s*\d+$/i, // "Título, 123"
      /^[A-Z][a-z\s]*\s+\d+$/i, // "Título 123"
      
      // Filtra linhas que são claramente de índice/sumário
      /^\s*\d+\.\d+/i, // "1.1", "2.3", etc
      /^\s*[a-z]\)/i, // "a)", "b)", etc
      /^\s*\([a-z]\)/i, // "(a)", "(b)", etc
      /^\s*[ivx]+\)/i, // "i)", "ii)", etc
      /^\s*\([ivx]+\)/i, // "(i)", "(ii)", etc
      
      // Palavras que indicam estruturas de índice
      /^\s*(SUMÁRIO|ÍNDICE|CONTEÚDO)/i,
      /^\s*(Ver|Vide|Cf|Cfr|Conferir)\s/i,
      /^\s*p\.\s*\d+/i, // "p. 123" (página)
      /^\s*pp\.\s*\d+/i, // "pp. 123" (páginas)
    ];
    
    // Verifica se contém muitos pontos (típico de índices)
    const dotCount = (text.match(/\./g) || []).length;
    const hasLotsOfDots = dotCount > 3 && text.length < 100;
    
    // Verifica se é linha de índice típica
    const matchesIndexPattern = indexPatterns.some(pattern => pattern.test(text));
    
    // Verifica se tem padrão de referência de página no final
    const hasPageReference = /\b\d{1,4}$/.test(text.trim()) && text.length < 80;
    
    // Verifica se tem muito pouco conteúdo textual (provável índice)
    const hasLittleText = text.replace(/[\d\s\.,-]/g, '').length < 10;
    
    // Verifica padrões específicos de ÍNDICE GERAL
    const isGeneralIndex = /ÍNDICE/i.test(text) || 
                          /SUMÁRIO/i.test(text) || 
                          /CONTEÚDO/i.test(text);
    
    return matchesIndexPattern || 
           hasLotsOfDots || 
           (hasPageReference && text.length < 80) || 
           (hasLittleText && text.length < 50) ||
           isGeneralIndex;
  }
  
  // Função adicional para detectar páginas inteiras de índice
  function isIndexPage(text) {
    // Padrões que indicam que estamos numa página de índice
    const indexPagePatterns = [
      /^\s*ÍNDICE\s*$/i,
      /^\s*SUMÁRIO\s*$/i,
      /^\s*CONTEÚDO\s*$/i,
      /^\s*ÍNDICE\s+GERAL\s*$/i,
      /^\s*ÍNDICE\s+SISTEMÁTICO\s*$/i,
      /^\s*ÍNDICE\s+ALFABÉTICO\s*$/i,
      /^\s*ÍNDICE\s+ANALÍTICO\s*$/i,
      /^\s*ÍNDICE\s+DE\s+MATÉRIAS\s*$/i,
      /^\s*TABELA\s+DE\s+CONTEÚDO\s*$/i,
      /^\s*LISTA\s+DE\s+CONTEÚDO\s*$/i,
    ];
    
         // Verifica se a linha é uma linha típica de índice que pode ter passado pelos outros filtros
     const suspiciousPatterns = [
       // Linhas com apenas letras maiúsculas e números
       /^[A-ZÀÁÂÃÉÊÍÓÔÕÚÜ\s\d\.,:-]+$/,
       // Linhas que terminam com número de página
       /^.+\s+\d{1,4}$/,
       // Linhas com pontos de preenchimento
       /^.+\.{2,}.+$/,
     ];
     
     // Verifica separadamente se é título de seção em maiúsculas
     const isShortUppercase = /^[A-ZÀÁÂÃÉÊÍÓÔÕÚÜ\s]+$/.test(text) && text.length < 30;
    
         return indexPagePatterns.some(pattern => pattern.test(text)) ||
            (suspiciousPatterns.some(pattern => pattern.test(text)) && text.length < 60) ||
            isShortUppercase;
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