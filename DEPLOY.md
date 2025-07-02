# 🚀 Guia de Deploy no Netlify

## ⚡ Deploy Rápido (3 passos)

### 1. Preparação Local
```bash
# Teste o build localmente
npm run build

# Verifique se não há erros
npm run dev
```

### 2. Deploy no Netlify

#### Opção A: Drag & Drop (Mais Rápido)
1. Faça build local: `npm run build`
2. Vá para [netlify.com](https://netlify.com)
3. Arraste a pasta `.next` para o Netlify

#### Opção B: Git Deploy (Recomendado)
1. **Push para GitHub**:
   ```bash
   git add .
   git commit -m "Preparando para deploy"
   git push origin main
   ```

2. **Conectar no Netlify**:
   - Acesse [netlify.com](https://netlify.com)
   - Clique em "New site from Git"
   - Conecte seu repositório GitHub
   - Configure:
     - **Build command**: `npm run build`
     - **Publish directory**: `.next`
     - **Node version**: `18`

3. **Deploy**:
   - Clique em "Deploy site"
   - Aguarde 2-3 minutos
   - ✅ Site no ar!

### 3. Configurações Importantes

#### Variáveis de Ambiente (Opcional)
No painel do Netlify > Site settings > Environment variables:
```
NEXT_TELEMETRY_DISABLED=1
NODE_VERSION=18
```

#### Domínio Personalizado
- Site settings > Domain management
- Add custom domain

## 📱 Otimizações Mobile Incluídas

✅ **Responsivo**: Layout adaptável para todas as telas  
✅ **PWA**: Instalável como app mobile  
✅ **Performance**: Build otimizado para velocidade  
✅ **SEO**: Meta tags completas  
✅ **Temas**: Claro/Escuro adaptáveis  

## 🔧 Problemas Comuns

### Build Falha
```bash
# Limpe cache e tente novamente
rm -rf .next node_modules
npm install
npm run build
```

### Site não carrega
- Verifique se a pasta de publish é `.next`
- Confirme que o Node version é 18

### APIs não funcionam
- APIs funcionam automaticamente no Netlify com Next.js
- Não precisa configurar serverless functions manualmente

## 📞 URLs Importantes

- **Site Demo**: https://consulta-igreja.netlify.app
- **Netlify**: https://netlify.com
- **GitHub**: https://github.com

---
*Deploy concluído! Seu site estará disponível em poucos minutos.* 🎉 