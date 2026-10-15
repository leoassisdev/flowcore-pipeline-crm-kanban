# Pipeline de CRM em kanban

> Funil comercial com arrastar e soltar entre etapas, total por coluna e previsão ponderada. Mostra quanto vai entrar de verdade, não só quanto está em negociação.

**Ver ao vivo, com preview e manual:** https://flowcoresolucoes.com.br/codigos/pipeline-crm-kanban

Criado por **FlowCore Soluções LTDA**.

## Arquivos

- [`src/DashPipeline.tsx`](src/DashPipeline.tsx)

## Como instalar

1. **Tenha um projeto React com Tailwind** Já tem (Vite, Next.js, Remix)? Pule este passo. Se não, crie um em 1 minuto e adicione ./src/**/*.{ts,tsx} ao content do tailwind.config.

   ```bash
   npm create vite@latest minha-app -- --template react-ts
   cd minha-app
   npm install -D tailwindcss@3 postcss autoprefixer
   npx tailwindcss init -p
   ```

2. **Crie o arquivo src/components/DashPipeline.tsx** Copie o conteúdo de `src/DashPipeline.tsx` deste repositório. Ele é um arquivo só, sem dependência além de React.
3. **Use na sua página**

   ```tsx
   import DashPipeline from "./components/DashPipeline";
   
   <DashPipeline onMove={(id, etapa) => salvar(id, etapa)} />
   ```

4. **Personalize** Textos, dados e a cor de destaque (prop accent) são props com valor padrão. Troque pelos da sua marca ou ligue na sua API.

## Tema e cor

Abre em tema claro. Use `tema="escuro"` para o escuro e `accent` para a cor de destaque:

```tsx
<DashPipeline onMove={(id, etapa) => salvar(id, etapa)} />
```

## Licença

MIT. Pode usar em projeto pessoal ou comercial, de graça. A única condição é manter a linha **“Criado por FlowCore Soluções LTDA”** (ou o crédito de adaptação) onde ela está.

---

Precisa disso integrado no seu sistema? A [FlowCore](https://flowcoresolucoes.com.br) desenvolve sob medida.
