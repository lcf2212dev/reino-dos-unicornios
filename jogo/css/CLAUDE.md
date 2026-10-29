# jogo/css — regras locais

- Pasta PLANA: `css/<arquivo>.css`, sem subpasta. A Vercel só publica `css/<arquivo>` (`vercel/montar.js`).
- A ordem da cascata é a lista `css` de `jogo/js/manifesto.js` (regras do manifesto: `jogo/js/CLAUDE.md`).
- CSS novo = arquivo aqui + linha na lista `css` do manifesto + `npm run index`.
- `ui-base.css` vem primeiro (variáveis, corpo, botões); `ui-animacoes.css` vem depois das regras que muda.
- Cada arquivo começa com um comentário dizendo o que tem.
- Animação sempre com saída para `body.sem-animacao` e `@media (prefers-reduced-motion: reduce)`.
- Tamanho: `jogo/js/CLAUDE.md` (Tamanho).
- Este arquivo também é publicado (`css/<arquivo>`): nada de segredo aqui.
- Antes de entregar: skill `validar-tudo`.
