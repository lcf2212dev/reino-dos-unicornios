# O jogo na Vercel

https://reino-dos-unicornios.vercel.app (projeto `reino-dos-unicornios` do time da Vercel, banco Neon
`reino-dos-unicornios-production` ligado pela integração, que põe o `DATABASE_URL` no projeto).

- `montar.js` (o build): copia de `../jogo` só `index.html`, `css/` e `js/` para `public/` e gera o `js/versao.json`.
- `api/progresso.js` e `api/jogadores.js` (+ `lib/banco.js`): as mesmas rotas, respostas e regras de
  `jogo/servidor/servidor.js` (§12 de `docs/contratos/save-e-mescla.md`), sobre Postgres. As tabelas nascem sozinhas.
- Publicar: `npm run vercel` (na raiz; `--ajuda`). O banco guarda saves reais: não se lê, grava nem apaga à mão.
