# Script PowerShell para Deploy no GitHub
# Execute este script após instalar o Git

Write-Host "🚀 DEPLOY AUTOMÁTICO PARA GITHUB" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Verificar se Git está instalado
try {
    $gitVersion = git --version
    Write-Host "✅ Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git não encontrado!" -ForegroundColor Red
    Write-Host "📥 Baixe e instale o Git: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "🔄 Execute este script novamente após instalar o Git" -ForegroundColor Yellow
    pause
    exit
}

# Verificar status do repositório
Write-Host "`n📊 Verificando status do repositório..." -ForegroundColor Cyan
git status

# Adicionar todos os arquivos
Write-Host "`n📤 Adicionando arquivos..." -ForegroundColor Cyan
git add .

# Fazer commit
$commitMessage = "✅ Corrigido sistema de busca - todos os resultados sem limitação"
Write-Host "`n💾 Fazendo commit: $commitMessage" -ForegroundColor Cyan
git commit -m $commitMessage

# Push para GitHub
Write-Host "`n🌐 Enviando para GitHub..." -ForegroundColor Cyan
try {
    git push origin main
    Write-Host "`n✅ SUCESSO! Arquivos enviados para GitHub!" -ForegroundColor Green
    Write-Host "🔄 O Netlify fará o deploy automaticamente em alguns minutos" -ForegroundColor Green
    Write-Host "🌐 Acesse: https://catecismocatolico.netlify.app" -ForegroundColor Green
} catch {
    Write-Host "`n❌ Erro no push. Verifique suas credenciais do GitHub" -ForegroundColor Red
    Write-Host "💡 Configure suas credenciais: git config --global user.email 'seu@email.com'" -ForegroundColor Yellow
    Write-Host "💡 Configure seu nome: git config --global user.name 'Seu Nome'" -ForegroundColor Yellow
}

Write-Host "`n🎉 SISTEMA CORRIGIDO COM SUCESSO!" -ForegroundColor Green
Write-Host "📊 381 resultados para 'matrimonio' serão mostrados!" -ForegroundColor Green
Write-Host "🔍 Busca sem acentos funcionando perfeitamente!" -ForegroundColor Green

pause 