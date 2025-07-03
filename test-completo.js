const fs = require('fs');
const path = require('path');

// 🔍 SCRIPT DE REVISÃO COMPLETA DO PROJETO
console.log('🔍🔍🔍 INICIANDO REVISÃO COMPLETA DO PROJETO 🔍🔍🔍\n');

// Carrega os dados corretamente
const catecismoFile = JSON.parse(fs.readFileSync('./public/data/catecismo-search.json', 'utf8'));
const direitoFile = JSON.parse(fs.readFileSync('./public/data/direito-search.json', 'utf8'));
const metadata = JSON.parse(fs.readFileSync('./public/data/search-metadata.json', 'utf8'));

const catecismoData = catecismoFile.entries;
const direitoData = direitoFile.entries;

console.log('📊 ESTATÍSTICAS GERAIS:');
console.log(`📚 Catecismo: ${catecismoData.length} entradas`);
console.log(`⚖️ Direito Canônico: ${direitoData.length} entradas`);
console.log(`📈 Último parágrafo: ${metadata.catecismo.lastParagraph}`);
console.log(`📈 Último cânon: ${metadata.direito_canonico.lastCanon}\n`);

// 🔍 FUNÇÃO PARA TESTAR UM PARÁGRAFO/CÂNON
function testarItem(tipo, numero, dados) {
  const campo = tipo === 'paragraph' ? 'paragraph' : 'canon';
  const entradas = dados.filter(entry => entry[campo] === numero.toString());
  
  if (entradas.length === 0) {
    return { status: 'AUSENTE', entradas: 0, temInicio: false, texto: '' };
  }
  
  // Verifica se tem entrada que comece com o número
  const numeroCompleto = numero + '.';
  const entradaInicial = entradas.find(entry => 
    entry.text.trim().startsWith(numeroCompleto)
  );
  
  const textoCompleto = entradas.map(e => e.text).join(' ').substring(0, 200);
  
  return {
    status: entradaInicial ? 'COMPLETO' : 'INCOMPLETO',
    entradas: entradas.length,
    temInicio: !!entradaInicial,
    texto: textoCompleto,
    primeiraLinha: entradas[0]?.text.substring(0, 100) || ''
  };
}

// 🔍 TESTE AMOSTRAGEM DE PARÁGRAFOS DO CATECISMO
console.log('📚 TESTANDO PARÁGRAFOS DO CATECISMO:');
const paragrafosAmostra = [1, 10, 50, 100, 500, 1000, 1500, 1613, 1653, 2000, 2153, 2500, 2865];

paragrafosAmostra.forEach(num => {
  const resultado = testarItem('paragraph', num, catecismoData);
  console.log(`📋 Parágrafo ${num}: ${resultado.status} (${resultado.entradas} entradas) - "${resultado.primeiraLinha}..."`);
  
  if (resultado.status === 'INCOMPLETO') {
    console.log(`   ⚠️ Primeira linha: "${resultado.primeiraLinha}"`);
  }
});

console.log('\n⚖️ TESTANDO CÂNONES DO DIREITO CANÔNICO:');
const canonesAmostra = [1, 10, 50, 100, 500, 1000, 1400, 1439, 1500, 1653, 1700, 1750];

canonesAmostra.forEach(num => {
  const resultado = testarItem('canon', num, direitoData);
  console.log(`📋 Cânon ${num}: ${resultado.status} (${resultado.entradas} entradas) - "${resultado.primeiraLinha}..."`);
  
  if (resultado.status === 'INCOMPLETO') {
    console.log(`   ⚠️ Primeira linha: "${resultado.primeiraLinha}"`);
  }
});

// 🔍 TESTE ABRANGENTE - VERIFICA TODOS OS NÚMEROS
console.log('\n🔍 ANÁLISE ABRANGENTE:');

// Verifica parágrafos 1-100
let paragrafosProblema = [];
for (let i = 1; i <= 100; i++) {
  const resultado = testarItem('paragraph', i, catecismoData);
  if (resultado.status !== 'COMPLETO') {
    paragrafosProblema.push({ numero: i, status: resultado.status, entradas: resultado.entradas });
  }
}

// Verifica cânones 1-100
let canonesProblema = [];
for (let i = 1; i <= 100; i++) {
  const resultado = testarItem('canon', i, direitoData);
  if (resultado.status !== 'COMPLETO') {
    canonesProblema.push({ numero: i, status: resultado.status, entradas: resultado.entradas });
  }
}

console.log(`\n📊 RESULTADOS DA ANÁLISE (primeiros 100 itens):`);
console.log(`📚 Parágrafos com problema: ${paragrafosProblema.length}/100`);
console.log(`⚖️ Cânones com problema: ${canonesProblema.length}/100`);

if (paragrafosProblema.length > 0) {
  console.log('\n❌ PARÁGRAFOS COM PROBLEMA:');
  paragrafosProblema.slice(0, 10).forEach(p => {
    console.log(`   📋 Parágrafo ${p.numero}: ${p.status} (${p.entradas} entradas)`);
  });
  if (paragrafosProblema.length > 10) {
    console.log(`   ... e mais ${paragrafosProblema.length - 10} parágrafos`);
  }
}

if (canonesProblema.length > 0) {
  console.log('\n❌ CÂNONES COM PROBLEMA:');
  canonesProblema.slice(0, 10).forEach(c => {
    console.log(`   📋 Cânon ${c.numero}: ${c.status} (${c.entradas} entradas)`);
  });
  if (canonesProblema.length > 10) {
    console.log(`   ... e mais ${canonesProblema.length - 10} cânones`);
  }
}

// 🔍 VERIFICAÇÃO DE DUPLICATAS
console.log('\n🔍 VERIFICANDO DUPLICATAS:');

function verificarDuplicatas(dados, tipo) {
  const textos = new Map();
  let duplicatas = 0;
  
  dados.forEach((entry, index) => {
    const texto = entry.text.trim();
    if (textos.has(texto)) {
      duplicatas++;
    } else {
      textos.set(texto, index);
    }
  });
  
  return { total: dados.length, duplicatas, unicos: textos.size };
}

const statsCatecismo = verificarDuplicatas(catecismoData, 'catecismo');
const statsDireito = verificarDuplicatas(direitoData, 'direito');

console.log(`📚 Catecismo: ${statsCatecismo.unicos} únicos, ${statsCatecismo.duplicatas} duplicatas de ${statsCatecismo.total} total`);
console.log(`⚖️ Direito: ${statsDireito.unicos} únicos, ${statsDireito.duplicatas} duplicatas de ${statsDireito.total} total`);

// 🔍 VERIFICAÇÃO DE COBERTURA
console.log('\n📊 VERIFICAÇÃO DE COBERTURA:');

function verificarCobertura(dados, campo, maximo) {
  const numerosEncontrados = new Set();
  
  dados.forEach(entry => {
    if (entry[campo]) {
      numerosEncontrados.add(parseInt(entry[campo]));
    }
  });
  
  const faltando = [];
  for (let i = 1; i <= maximo; i++) {
    if (!numerosEncontrados.has(i)) {
      faltando.push(i);
    }
  }
  
  return {
    encontrados: numerosEncontrados.size,
    total: maximo,
    cobertura: (numerosEncontrados.size / maximo * 100).toFixed(1),
    faltando: faltando.slice(0, 20) // Mostra apenas os primeiros 20
  };
}

const coberturaCatecismo = verificarCobertura(catecismoData, 'paragraph', 2865);
const coberturaDireito = verificarCobertura(direitoData, 'canon', 1752);

console.log(`📚 Catecismo: ${coberturaCatecismo.encontrados}/${coberturaCatecismo.total} parágrafos (${coberturaCatecismo.cobertura}%)`);
if (coberturaCatecismo.faltando.length > 0) {
  console.log(`   ❌ Faltando: ${coberturaCatecismo.faltando.join(', ')}${coberturaCatecismo.faltando.length === 20 ? '...' : ''}`);
}

console.log(`⚖️ Direito: ${coberturaDireito.encontrados}/${coberturaDireito.total} cânones (${coberturaDireito.cobertura}%)`);
if (coberturaDireito.faltando.length > 0) {
  console.log(`   ❌ Faltando: ${coberturaDireito.faltando.join(', ')}${coberturaDireito.faltando.length === 20 ? '...' : ''}`);
}

console.log('\n✅ REVISÃO COMPLETA FINALIZADA!'); 