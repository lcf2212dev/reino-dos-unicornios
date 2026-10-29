---
name: validar-tudo
description: Use antes de entregar ou fazer commit de qualquer mudança no Reino dos Unicórnios (código, conteúdo, CSS, ferramentas ou docs), para rodar todos os testes, validadores e conferências do projeto.
---
# Validar tudo

Na raiz da worktree (nunca na árvore principal). Durante o trabalho, só o focado:
`npm run unidade -- --so '<x>'` e `npm run e2e -- --mudancas` (só as imagens das partes mudadas).
No fecho, UMA vez:
```
npm test       # junto: unidade (duas filas, mais lentos primeiro), validadores, tamanho, dados e tipos
npm run e2e    # jogo atual x base, no Chromium (imagens nos 3 tamanhos)
```
- Árvore já verde: `npm test` diz "✔ já verde" e sai (`--forcar` roda). Jogo igual à base: o e2e diz "idêntico por
  construção" sem abrir navegador. `--recapturar` ignora o cache.
- Mexeu em desenho, motor ou interiores: também `npm run e2e -- --desempenho` (~7 min).
- Tamanho: código ~400 linhas (aviso acima de 420, falha acima de 600); dados 800.
- Diferença no e2e reprova, a não ser a mudança visível pedida. Leia primeiro a linha `Resumo:` (só HUD · só dock ·
  só balão · outras; as `outras` com caixas em px CSS). Ruído: `docs/decisoes/referencias-ruido.md`.
- Mudança visível de propósito: `npm run e2e -- --aceitar "<o que muda, 1 linha>"` antes do commit (ou o
  `--trocar-base` do `npm run integrar`); commit que já existe: `npm run e2e -- --trocar-base <hash> "<descrição>"`.
  Nunca edite `base-referencia.txt` à mão.
- Tudo no servidor de TESTE com saves sintéticos; nada toca no progresso, servidor de casa ou banco: `CLAUDE.md` da raiz.
