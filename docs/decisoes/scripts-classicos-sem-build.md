# Decisão: scripts clássicos, sem módulos e sem build

Para que serve: explica por que o jogo é HTML/CSS/JS puro, carregado em ordem, e o que não pode entrar.

## Contexto
- O jogo roda de 3 jeitos: `jogo/index.html` aberto direto (`file://`), o servidor de casa (container
  `reino-unicornios`) e o artifact do claude.ai.
- `file://` bloqueia módulos ES e `fetch` de arquivo local. O artifact recebe uma página e arquivos soltos.
- O servidor de casa só entrega `index.html`, `css/<arquivo>` e `js/**`, e não muda sem o Leandro
  (`jogo/servidor/` é lido pelo container; mudar exige restart, proibido para agentes).
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
