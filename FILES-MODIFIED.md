# 📁 ARQUIVOS MODIFICADOS PARA DEPLOY

## 🔧 **Arquivos que DEVEM ser enviados para o GitHub:**

### 1. **src/app/page.tsx** ⭐ (PRINCIPAL)
- **Alteração:** Adicionados links para download dos PDFs
- **Localização:** `src/app/page.tsx`
- **Tamanho:** ~31KB
- **Status:** ✅ Modificado com sucesso

### 2. **netlify.toml** ⭐ (IMPORTANTE)
- **Alteração:** Corrigido comando de build e headers para PDFs
- **Localização:** `netlify.toml` (raiz do projeto)
- **Tamanho:** ~921 bytes
- **Status:** ✅ Modificado com sucesso

## 📋 **Resumo das Modificações:**

### **src/app/page.tsx:**
```diff
+ import { Download } from 'lucide-react'

+ {/* Downloads dos PDFs */}
+ <div className="text-center">
+   <p>Download dos documentos (PDF):</p>
+   <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
+     <a href="/catecismo.pdf" download="Catecismo_da_Igreja_Catolica.pdf">
+       Catecismo PDF (2.4MB)
+     </a>
+     <a href="/direito_canonico.pdf" download="Codigo_de_Direito_Canonico.pdf">
+       Direito Canônico PDF (5.9MB)
+     </a>
+   </div>
+ </div>
```

### **netlify.toml:**
```diff
- command = "npm run build"
+ command = "npm run export"

+ [[headers]]
+   for = "/data/*"
+   [headers.values]
+     Cache-Control = "public, max-age=86400"
+     Content-Type = "application/json"
+ 
+ [[headers]]
+   for = "*.pdf"
+   [headers.values]
+     Cache-Control = "public, max-age=31536000"
+     Content-Type = "application/pdf"
```

## 🚀 **COMO FAZER O UPLOAD:**

### **Via GitHub Web Interface:**

1. **Acesse:** https://github.com/ronaldomelofz/catecismo

2. **Para o arquivo page.tsx:**
   - Navegue até: `src/app/page.tsx`
   - Clique no ícone ✏️ (Edit)
   - Substitua todo o conteúdo pelo arquivo local
   - Commit: "✅ Adicionados links para download dos PDFs"

3. **Para o arquivo netlify.toml:**
   - Clique em `netlify.toml` na raiz
   - Clique no ícone ✏️ (Edit)
   - Substitua todo o conteúdo pelo arquivo local
   - Commit: "🔧 Corrigido netlify.toml para PDFs"

### **Via Upload de Arquivos:**

1. Clique em "Add file" → "Upload files"
2. Arraste os dois arquivos modificados
3. Commit: "✅ Deploy com links dos PDFs"

## ⚡ **RESULTADO IMEDIATO:**

Após o commit:
- ✅ Netlify detectará as mudanças automaticamente
- ✅ Build será executado (1-2 minutos)
- ✅ Site atualizado: https://catecismocatolico.netlify.app/
- ✅ Links de download funcionando

## 🎯 **Validação:**

Para confirmar que deu certo:
1. Acesse https://catecismocatolico.netlify.app/
2. Verifique se há seção "Download dos documentos (PDF)"
3. Teste os links de download
4. Confirme que os PDFs baixam com nomes corretos

---

**⚠️ IMPORTANTE:** Apenas estes 2 arquivos precisam ser atualizados no GitHub. Todos os outros arquivos (PDFs, dados, etc.) já estão corretos. 