# jogo/css — regras locais

- Pasta PLANA: `css/<arquivo>.css`, sem subpasta. O servidor de casa só entrega `css/<arquivo>`.
- A ordem da cascata é a lista `css` de `jogo/js/manifesto.js`. O `index.html` é gerado dela.
- CSS novo = arquivo aqui + linha na lista `css` do manifesto + `npm run index`.
- `ui-base.css` vem primeiro (variáveis, corpo, botões); `ui-animacoes.css` vem depois das regras que muda.
- Cada arquivo começa com um comentário dizendo o que tem.
- Animação sempre com saída para `body.sem-animacao` e `@media (prefers-reduced-motion: reduce)`.
- Limite: 420 linhas por arquivo (`npm run tamanho`).
- Este arquivo também é entregue pelo servidor (`css/<arquivo>`): nada de segredo aqui.
- Antes de entregar: `npm test` e `npm run e2e` (imagens nos 3 tamanhos).
