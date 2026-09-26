# jogo/ferramentas — regras locais

Ferramentas de desenvolvimento (Node). Nenhuma entra no jogo. Comandos: `CLAUDE.md` da raiz e `package.json`.

## Guardas (nada chega no progresso da Mariana)
- Nunca a porta 80, `reinodosunicornios.local`, `localhost` sem porta de teste nem o IP do PC.
- Servidor: só `testes/servidor-teste.js` (porta livre ≥ 1024 (nunca 80); banco novo em `/tmp/reino-testes/`;
  recusa banco fora de `/tmp` ou em `servidor/dados`).
- Navegador: só `testes/navegador.js` (Playwright, só Chromium, preso à porta de teste; bloqueia o resto).
  Tamanhos: celular 390×844, tablet 820×1180, notebook 1366×768 (`TAMANHOS`).
- Nada de Firefox, WebKit, nem emulação de iPhone/iPad com WebKit.
- Saves 100% sintéticos: `testes/saves.js`. Nunca copie o save real.
- Nunca leia, copie ou grave em `jogo/servidor/dados/`. Nunca publique o artifact
  (`gerar-artifact.js` só grava a página em `/tmp`).
- Derrube só os seus servidores, pelo PID ou `s.parar()`. Nunca `pkill`/`killall` por nome.
- Temporários em `/tmp/reino-testes/`, sem apagar.

## Pastas
- `vozes/` (listar, gravar, empacotar), `validar/`, `testes/` (unidade, referências, e2e), `previas/` (file://).
- `gerado/`: GERADO (`falas.json`, `vozes-indice.json`, `vozes-cache/`). Não abra (enorme).
- `jogo-no-node.js` carrega os scripts `node: true` do manifesto num `vm`. Nenhuma ferramenta guarda lista
  própria de scripts: use o manifesto (`scripts({ grupos, nomes })`; prévias: `previas/previa.js`).
- `gerar-index.js` escreve o `index.html` (`--conferir` só confere).

## Regras
- Limite: 420 linhas por ferramenta (`npm run tamanho`).
- Teste de unidade novo: `testes/unidade/<assunto>.test.js` (`node --test`).
- Ferramenta que abre navegador ou sobe servidor usa as guardas acima.
