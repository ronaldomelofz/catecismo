const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

function isIndexOrSummarySection(text, index, lines) {
  const lowerText = text.toLowerCase();
  
  // Identificar seções de índice/sumário
  const indexKeywords = [
    'índice geral',
    'sumário',
    'conteúdo',
    'index',
    'table of contents',
    'lista de abreviações',
    'abreviações',
    'bibliografia',
    'referências'
  ];
  
  // Verificar se é uma linha de índice
  if (indexKeywords.some(keyword => lowerText.includes(keyword))) {
    return true;
  }
  
  // Verificar se é uma linha de numeração de página típica de índice (ex: "texto ... 123")
  if (/^.+\.{3,}\s*\d+$/.test(text.trim())) {
    return true;
  }
  
  // Verificar se está em uma seção de índice (próximo a linhas de índice)
  const windowSize = 5;
  const start = Math.max(0, index - windowSize);
  const end = Math.min(lines.length, index + windowSize);
  
  let indexLinesNearby = 0;
  for (let i = start; i < end; i++) {
    const nearbyText = lines[i].toLowerCase();
    if (indexKeywords.some(keyword => nearbyText.includes(keyword)) ||
        /^.+\.{3,}\s*\d+$/.test(lines[i].trim())) {
      indexLinesNearby++;
    }
  }
  
  // Se mais de 20% das linhas próximas são de índice, provavelmente esta linha também é
  return indexLinesNearby / (end - start) > 0.2;
}

function isFooterOrHeader(text) {
  const lowerText = text.toLowerCase().trim();
  
  // Identificar cabeçalhos/rodapés
  const headerFooterPatterns = [
    /^\d+$/, // Apenas números (numeração de página)
    /^página\s+\d+/,
    /^\d+\s*$/,
    /^catecismo da igreja católica$/,
    /^código de direito canônico$/,
    /^direito canônico$/,
    /^parte\s+(i|ii|iii|iv|\d+)$/,
    /^seção\s+(i|ii|iii|iv|\d+)$/,
    /^capítulo\s+(i|ii|iii|iv|\d+)$/
  ];
  
  return headerFooterPatterns.some(pattern => pattern.test(lowerText)) ||
         lowerText.length < 3; // Linhas muito curtas
}

async function convertPdfToStructuredText(pdfPath, outputPath, documentType) {
  try {
    console.log(`Convertendo ${pdfPath}...`);
    
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    const text = data.text;
    
    // Dividir o texto em linhas e limpar
    const allLines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    console.log(`Total de linhas extraídas: ${allLines.length}`);
    
    // Filtrar seções de índice e cabeçalhos/rodapés
    const filteredLines = allLines.filter((line, index) => {
      return !isIndexOrSummarySection(line, index, allLines) && 
             !isFooterOrHeader(line);
    });
    
    console.log(`Linhas após filtragem: ${filteredLines.length}`);
    console.log(`Linhas removidas (índices/cabeçalhos): ${allLines.length - filteredLines.length}`);
    
    const structuredContent = {
      document: documentType,
      totalLines: filteredLines.length,
      originalLines: allLines.length,
      filteredOut: allLines.length - filteredLines.length,
      content: filteredLines.map((line, index) => {
        let number = null;
        
        if (documentType === 'catecismo') {
          // Procurar números de parágrafo
          const paragraphMatch = line.match(/^(\d+)\.|\((\d+)\)|^(\d+)\s/);
          if (paragraphMatch) {
            number = parseInt(paragraphMatch[1] || paragraphMatch[2] || paragraphMatch[3]);
          }
        } else if (documentType === 'direito_canonico') {
          // Procurar números de cânon
          const canonMatch = line.match(/Cân\.?\s*(\d+)|Cânon\s*(\d+)|^(\d+)\s*§|^(\d+)\s*-/);
          if (canonMatch) {
            number = parseInt(canonMatch[1] || canonMatch[2] || canonMatch[3] || canonMatch[4]);
          }
        }
        
        return {
          index,
          text: line,
          ...(documentType === 'catecismo' ? { paragraph: number } : { canon: number })
        };
      })
    };
    
    // Salvar como JSON estruturado
    fs.writeFileSync(outputPath, JSON.stringify(structuredContent, null, 2), 'utf8');
    
    // Também salvar como texto simples para backup
    const txtPath = outputPath.replace('.json', '.txt');
    fs.writeFileSync(txtPath, filteredLines.join('\n'), 'utf8');
    
    console.log(`✅ Conversão concluída:`);
    console.log(`   JSON: ${outputPath}`);
    console.log(`   TXT: ${txtPath}`);
    console.log(`   Linhas úteis: ${filteredLines.length}`);
    console.log(`   Linhas filtradas: ${allLines.length - filteredLines.length}`);
    
    return structuredContent;
    
  } catch (error) {
    console.error(`❌ Erro ao converter ${pdfPath}:`, error.message);
    throw error;
  }
}

async function main() {
  const baseDir = process.cwd();
  
  try {
    // Criar pasta data se não existir
    const dataDir = path.join(baseDir, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    
    console.log('🔄 Iniciando conversão com filtragem de índices...\n');
    
    // Converter catecismo.pdf
    const catecismoPdfPath = path.join(baseDir, 'catecismo.pdf');
    const catecismoJsonPath = path.join(dataDir, 'catecismo.json');
    
    if (fs.existsSync(catecismoPdfPath)) {
      await convertPdfToStructuredText(catecismoPdfPath, catecismoJsonPath, 'catecismo');
    } else {
      console.log('⚠️  Arquivo catecismo.pdf não encontrado');
    }
    
    console.log(''); // Linha em branco
    
    // Converter direito_canonico.pdf
    const direitoPdfPath = path.join(baseDir, 'direito_canonico.pdf');
    const direitoJsonPath = path.join(dataDir, 'direito_canonico.json');
    
    if (fs.existsSync(direitoPdfPath)) {
      await convertPdfToStructuredText(direitoPdfPath, direitoJsonPath, 'direito_canonico');
    } else {
      console.log('⚠️  Arquivo direito_canonico.pdf não encontrado');
    }
    
    console.log('\n🎉 Conversão concluída com filtragem de índices!');
    console.log('📁 Os arquivos estão na pasta "data/"');
    console.log('✨ Agora as buscas não incluirão seções de índice geral.');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { convertPdfToStructuredText }; 