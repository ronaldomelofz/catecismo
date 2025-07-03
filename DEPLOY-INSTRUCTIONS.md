# 🚀 INSTRUÇÕES PARA DEPLOY MANUAL

## 📋 **Resumo das Alterações Implementadas:**

✅ **Adicionados links para download dos PDFs na página inicial**
- Catecismo PDF (2.4MB) 
- Direito Canônico PDF (5.9MB)
- Design responsivo com bordas e ícones de download
- Tema escuro/claro compatível

✅ **Corrigido netlify.toml**
- Comando de build: `npm run export`
- Headers para PDFs e arquivos JSON
- Configuração otimizada para Netlify

## 🔧 **Como Fazer o Deploy:**

### **Opção 1: GitHub Web Interface (Recomendada)**

1. **Acesse:** https://github.com/ronaldomelofz/catecismo

2. **Upload dos arquivos modificados:**
   - Clique em "Add file" → "Upload files"
   - Arraste os seguintes arquivos:
     - `src/app/page.tsx` (página principal com links dos PDFs)
     - `netlify.toml` (configuração atualizada)

3. **Fazer commit:**
   - Mensagem: `✅ Adicionados links para download dos PDFs`
   - Clique em "Commit changes"

4. **Aguardar deploy automático:**
   - O Netlify detectará as mudanças automaticamente
   - Deploy será feito em 1-2 minutos
   - Site atualizado: https://catecismocatolico.netlify.app/

### **Opção 2: GitHub Desktop**

1. Abra o GitHub Desktop
2. Selecione o repositório `catecismo`
3. Veja as mudanças nos arquivos
4. Adicione commit: "✅ Adicionados links para download dos PDFs"
5. Clique em "Push origin"

### **Opção 3: Instalação do Git**

Se quiser usar Git via linha de comando:

1. **Baixe o Git:** https://git-scm.com/download/win
2. **Instale e reinicie o terminal**
3. **Execute os comandos:**
   ```bash
   git add .
   git commit -m "✅ Adicionados links para download dos PDFs"
   git push origin main
   ```

## 📱 **Resultado Esperado:**

Após o deploy, o site https://catecismocatolico.netlify.app/ terá:

### **Seção de Links (na página inicial):**

```
Links oficiais do Vaticano:
[📖 Catecismo - Site Oficial 🔗] [⚖️ Direito Canônico - PDF Oficial 🔗]

Download dos documentos (PDF):
[📖 Catecismo PDF (2.4MB) ⬇️] [⚖️ Direito Canônico PDF (5.9MB) ⬇️]
```

### **Funcionalidades:**
- ✅ Botões de download funcionais
- ✅ PDFs baixados com nomes descritivos
- ✅ Design responsivo (mobile/desktop)
- ✅ Tema escuro/claro
- ✅ Ícones apropriados (Book, Scale, Download)

## 🎯 **Status Atual:**

- ✅ Build gerado com sucesso (pasta `dist/`)
- ✅ PDFs incluídos (catecismo.pdf, direito_canonico.pdf)
- ✅ Dados de busca atualizados
- ✅ Configuração Netlify otimizada
- ⏳ **Aguardando push para GitHub**

## 📞 **Em caso de problemas:**

1. Verifique se os arquivos foram enviados corretamente
2. Aguarde 2-3 minutos para o deploy do Netlify
3. Teste os links de download no site
4. Verifique se não há erros no console do navegador

---

**🎉 Após o deploy, a aplicação estará completa com todos os recursos solicitados!** 