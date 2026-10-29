# Decisão: scripts clássicos, sem módulos e sem build

Para que serve: explica por que o jogo é HTML/CSS/JS puro, carregado em ordem, e o que não pode entrar.

## Contexto
- O jogo roda na Vercel (`vercel/montar.js` publica só `index.html`, `css/<arquivo>` e `js/**`, o mesmo recorte do
  antigo servidor de casa) e por `jogo/index.html` aberto direto (`file://`). Na época da decisão rodava também no
  servidor de casa e no artifact do claude.ai (aposentados em 29/09/2026).
- `file://` bloqueia módulos ES e `fetch` de arquivo local.
- Quem mantém é uma IA por vez, sem contexto: menos peças = menos erro.

## Decisão
- Scripts clássicos (`<script src>`), na ordem de `jogo/js/manifesto.js`; tudo se pendura em `window.Reino`
  (e nos globais `Mapa`, `Jogador`, `PA`).
- Nenhum bundler, transpilador ou passo de build no jogo. `package.json` é só para as ferramentas.
- Dado novo mora num `.js` que se registra (`Reino.registrarSala`, `Reino.registrarInterior`…), nunca num
  `.json` buscado por `fetch`.
- CSS plano em `jogo/css/`, sem subpasta.
- Tipos: JSDoc conferido por `npm run tipos` só nos arquivos listados; o jogo continua sem build.

## Consequências
- A ordem de carga importa e é a do manifesto (`docs/decisoes/manifesto-unico.md`).
- Nada de `import`/`export`, `require` ou top-level `await` em `jogo/js/`.
- Arquivos `node: true` rodam também no Node (vm) para as ferramentas: sem DOM no carregamento.
- Prévias em `jogo/ferramentas/previas/` abrem por `file://` (o servidor não as entrega).
