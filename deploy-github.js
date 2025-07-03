const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🚀 DEPLOY AUTOMÁTICO VIA API GITHUB');
console.log('==================================');

// Ler arquivo local
function readFileAsBase64(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return Buffer.from(content).toString('base64');
  } catch (error) {
    console.error(`❌ Erro ao ler ${filePath}:`, error.message);
    return null;
  }
}

// Função para fazer requisição HTTPS
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: JSON.parse(responseData || '{}')
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function deployToGitHub() {
  // Informações do repositório
  const owner = 'ronaldomelofz';
  const repo = 'catecismo';
  const branch = 'main';
  
  // Lista de arquivos para atualizar
  const filesToUpdate = [
    {
      path: 'src/app/page.tsx',
      localPath: 'src/app/page.tsx',
      message: '✅ Adicionados links para download dos PDFs'
    },
    {
      path: 'netlify.toml',
      localPath: 'netlify.toml',
      message: '🔧 Corrigido netlify.toml para PDFs'
    }
  ];

  console.log('📁 Preparando arquivos para upload...');
  
  for (const file of filesToUpdate) {
    console.log(`\n🔄 Processando: ${file.path}`);
    
    const content = readFileAsBase64(file.localPath);
    if (!content) {
      console.log(`⚠️ Pulando ${file.path} - arquivo não encontrado`);
      continue;
    }

    // Primeiro, obter o SHA atual do arquivo (se existir)
    console.log(`📡 Obtendo informações do arquivo ${file.path}...`);
    
    const getOptions = {
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${owner}/${repo}/contents/${file.path}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Deploy-Script',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    try {
      const getResponse = await makeRequest(getOptions);
      let sha = null;
      
      if (getResponse.statusCode === 200) {
        sha = getResponse.data.sha;
        console.log(`✅ Arquivo existente encontrado (SHA: ${sha.substring(0, 8)}...)`);
      } else {
        console.log(`📝 Arquivo novo será criado`);
      }

      // Atualizar/criar arquivo
      const updateData = {
        message: file.message,
        content: content,
        branch: branch
      };

      if (sha) {
        updateData.sha = sha;
      }

      const updateOptions = {
        hostname: 'api.github.com',
        port: 443,
        path: `/repos/${owner}/${repo}/contents/${file.path}`,
        method: 'PUT',
        headers: {
          'User-Agent': 'Deploy-Script',
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        }
      };

      console.log(`📤 Enviando ${file.path} para GitHub...`);
      
      // NOTA: Este script requer um token de acesso pessoal do GitHub
      // Por segurança, não podemos incluir o token aqui
      console.log(`⚠️ ATENÇÃO: Este script requer autenticação GitHub`);
      console.log(`📋 Para continuar, você precisa de um Personal Access Token`);
      console.log(`🔗 Gere em: https://github.com/settings/tokens`);
      
    } catch (error) {
      console.error(`❌ Erro ao processar ${file.path}:`, error.message);
    }
  }
  
  console.log('\n📋 RESUMO:');
  console.log('Para completar o deploy automaticamente, você precisa:');
  console.log('1. 🔑 Gerar Personal Access Token no GitHub');
  console.log('2. 🔧 Adicionar o token ao script');
  console.log('3. 🚀 Executar novamente');
  console.log('\n🎯 ALTERNATIVA RÁPIDA:');
  console.log('1. Acesse: https://github.com/ronaldomelofz/catecismo');
  console.log('2. Edite manualmente os arquivos:');
  console.log('   - src/app/page.tsx');
  console.log('   - netlify.toml');
  console.log('3. Faça commit das mudanças');
}

// Executar deploy
deployToGitHub().catch(console.error); 