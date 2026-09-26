---
name: validar-tudo
description: Use antes de entregar ou fazer commit de qualquer mudança no Reino dos Unicórnios (código, conteúdo, CSS, ferramentas ou docs), para rodar todos os testes, validadores e conferências do projeto.
---
# Validar tudo

Na raiz da worktree (nunca na árvore principal), nesta ordem:
```
npm test            # unidade, validadores, tamanho, referências de dados
npm run validar     # conteúdo, interiores, index x manifesto, docs
npm run e2e         # jogo atual x base, no Chromium (dados, imagens nos 3 tamanhos, vozes)
npm run tamanho     # código até 420 linhas, dados até 800
npm run tipos       # TypeScript nos arquivos com JSDoc
```
- Mexeu em desenho, motor ou interiores: também `npm run e2e -- --desempenho`.
- Diferença no `e2e` reprova, a não ser que a mudança visível seja a pedida. Ruído de antialiasing:
  `docs/decisoes/referencias-ruido.md`.
- Tudo usa servidor de TESTE, Chromium e saves sintéticos. Nada toca no servidor de casa, no artifact
  publicado ou no save da Mariana.
- Script que ainda não existe na árvore é pulado com aviso: registre no retorno.
