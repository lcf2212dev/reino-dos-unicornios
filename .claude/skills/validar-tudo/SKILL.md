---
name: validar-tudo
description: Use antes de entregar ou fazer commit de qualquer mudança no Reino dos Unicórnios (código, conteúdo, CSS, ferramentas ou docs), para rodar todos os testes, validadores e conferências do projeto.
---
# Validar tudo

Na raiz da worktree (nunca na árvore principal), nesta ordem:
```
npm test            # unidade, validadores, tamanho (código 420, dados 800), referências de dados
npm run validar     # conteúdo, interiores, index x manifesto, docs
npm run e2e         # jogo atual x base, no Chromium (dados, imagens nos 3 tamanhos, vozes)
npm run tipos       # TypeScript nos arquivos com JSDoc
```
- Mexeu em desenho, motor ou interiores: também `npm run e2e -- --desempenho`.
- Diferença no `e2e` reprova, a não ser que a mudança visível seja a pedida. Ruído de antialiasing:
  `docs/decisoes/referencias-ruido.md`.
- Leia primeiro a linha `Resumo:` do e2e (por tamanho: só HUD · só dock · só balão · outras). Só HUD/dock/balão
  costuma ser dinheiro, botão ou fala: confira 1 dos 5 nomes. As `outras` vêm com caixas `[x,y w×h: px]` em px CSS
  (a imagem magenta mostra onde); o resumo fica em `e2e-<data>/resumo.json`.
- Mudança visível de propósito, já em commit: troque a base com
  `npm run e2e -- --trocar-base <hash> "<o que muda, 1 linha>"` (preserva os comentários, mostra o diff, sem
  commit). Nunca à mão nem com `sed`.
- Tudo usa servidor de TESTE, Chromium e saves sintéticos. Nada toca no servidor de casa, no artifact
  publicado ou no save da Mariana.
- Script que ainda não existe na árvore é pulado com aviso: registre no retorno.
