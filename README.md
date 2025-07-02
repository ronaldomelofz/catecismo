# 📖 Consulta nos Documentos da Igreja

Uma aplicação web moderna para consultar o **Catecismo da Igreja Católica** e o **Código de Direito Canônico**.

## 🌟 Características

- ✅ **Busca avançada** nos documentos oficiais da Igreja
- ✅ **Tema claro/escuro** com alternância suave
- ✅ **Layout responsivo** otimizado para mobile
- ✅ **PWA** (Progressive Web App) - instalável como app nativo
- ✅ **Links oficiais** do Vaticano
- ✅ **SEO otimizado** para melhor visibilidade
- ✅ **Performance otimizada** com Next.js 14

## 🚀 Demo

🔗 **[Ver aplicação funcionando](https://catecismocatolico.netlify.app)**

## 📱 Funcionalidades

### 🔍 Busca Inteligente
- Busca por palavras-chave em ambos os documentos
- Destaque visual dos termos encontrados
- Estatísticas de resultados por documento
- Interface intuitiva e rápida

### 🎨 Interface Moderna
- **Tema Claro:** Design limpo e profissional
- **Tema Escuro:** Interface elegante para uso noturno
- **Responsivo:** Funciona perfeitamente em todos os dispositivos

### 📚 Documentos Incluídos
- **Catecismo da Igreja Católica** - Busca por parágrafos
- **Código de Direito Canônico** - Busca por cânones
- **Links oficiais** para documentos do Vaticano

## 🛠️ Tecnologias

- **[Next.js 14](https://nextjs.org/)** - Framework React
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[Tailwind CSS](https://tailwindcss.com/)** - Estilização
- **[Radix UI](https://www.radix-ui.com/)** - Componentes acessíveis
- **[Lucide React](https://lucide.dev/)** - Ícones modernos

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/ronaldomelofz/catecismo.git

# Entre no diretório
cd catecismo

# Instale as dependências
npm install

# Execute em desenvolvimento
npm run dev

# Acesse http://localhost:3000
```

## 🚀 Deploy

### Netlify (Recomendado)
1. Faça fork deste repositório
2. Conecte sua conta Netlify ao GitHub
3. Selecione este repositório
4. As configurações de build já estão prontas em `netlify.toml`

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### Build para produção
```bash
npm run build
# Os arquivos serão gerados na pasta 'dist'
```

## ⚙️ Configuração

O projeto está configurado para deploy estático com:
- Export Next.js otimizado
- PWA com manifest
- Headers de segurança
- Cache otimizado

## 📁 Estrutura do Projeto

```
├── src/
│   ├── app/
│   │   ├── page.tsx          # Página principal
│   │   ├── layout.tsx        # Layout global
│   │   └── globals.css       # Estilos globais
│   └── components/
│       └── ui/               # Componentes UI
├── public/
│   ├── manifest.json         # PWA manifest
│   └── *.png                 # Ícones e imagens
├── data/                     # Dados dos documentos
├── netlify.toml              # Configuração Netlify
└── next.config.js            # Configuração Next.js
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Créditos

- **Documentos oficiais:** [Santa Sé - Vaticano](https://www.vatican.va)
- **Catecismo:** [Catecismo da Igreja Católica](https://www.vatican.va/archive/ccc/index_po.htm)
- **Direito Canônico:** [Código de Direito Canônico](https://www.vatican.va/archive/cod-iuris-canonici/portuguese/codex-iuris-canonici_po.pdf)

## 📞 Suporte

Para dúvidas ou sugestões, abra uma [issue](https://github.com/ronaldomelofz/catecismo/issues) ou entre em contato.

---

**🎉 Desenvolvido com ❤️ para a comunidade católica brasileira** 