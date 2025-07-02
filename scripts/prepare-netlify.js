const fs = require('fs');
const path = require('path');

console.log('🚀 Preparando arquivos para deploy no Netlify...');

// Verificar se a pasta out existe
const outDir = path.join(process.cwd(), 'out');
if (!fs.existsSync(outDir)) {
  console.log('❌ Pasta "out" não encontrada. Execute "npm run build" primeiro.');
  process.exit(1);
}

console.log('✅ Pasta "out" encontrada');

// Copiar arquivos importantes para dentro da pasta out
const filesToCopy = [
  { src: 'netlify.toml', dest: 'netlify.toml' },
  { src: 'public/manifest.json', dest: 'manifest.json' },
  { src: 'public/favicon.ico', dest: 'favicon.ico' }
];

filesToCopy.forEach(({ src, dest }) => {
  const srcPath = path.join(process.cwd(), src);
  const destPath = path.join(outDir, dest);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ ${src} → out/${dest}`);
  } else {
    console.log(`⚠️  ${src} não encontrado, pulando...`);
  }
});

// Criar arquivo _redirects na pasta out
const redirectsContent = `# SPA redirect for client-side routing
/*    /index.html   200

# Static files
/manifest.json  /manifest.json  200
/favicon.ico    /favicon.ico    200
`;

fs.writeFileSync(path.join(outDir, '_redirects'), redirectsContent.trim());
console.log('✅ _redirects criado em out/');

console.log(`
🎉 Deploy estático preparado!

📁 Pasta para upload: out/
📋 Próximos passos:
   1. Acesse https://netlify.com
   2. Arraste a pasta 'out' para o Netlify
   3. Aguarde o deploy (1-2 minutos)

✨ Seu site estará no ar rapidamente!

📊 Conteúdo da pasta out:
${fs.readdirSync(outDir).map(file => `   - ${file}`).join('\n')}
`); 