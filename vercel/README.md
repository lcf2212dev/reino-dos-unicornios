# O jogo na Vercel

https://reino-dos-unicornios.vercel.app (projeto `reino-dos-unicornios` do time da Vercel, banco Neon
`reino-dos-unicornios-production` ligado pela integração, que põe o `DATABASE_URL` no projeto).

- `montar.js` (o build): copia de `../jogo` só `index.html`, `css/` e `js/` para `public/` e gera o `js/versao.json`.
- `api/progresso.js` e `api/jogadores.js` (+ `lib/banco.js`): as mesmas rotas, respostas e regras de
  `jogo/servidor/servidor.js` (§12 de `docs/contratos/save-e-mescla.md`), sobre Postgres. As tabelas nascem sozinhas.
- `pwa/`: o app instalável. `montar.js` copia o manifesto e os ícones, gera o `sw.js` com o hash de cada arquivo (o
  jogo inteiro fica no aparelho; um deploy novo só baixa o que mudou) e registra os dois no `index.html`.
- Publicar: sozinho. O projeto está ligado ao GitHub e cada push na `main` vira publicação de produção, se o jogo mudou
  (`ignorar-build.sh`, o "Ignored Build Step" do `vercel.json`: preview nunca, porque as variáveis do banco valem também
  em preview; `git.deploymentEnabled` só na `main`). Conferir: `npm run vercel -- --conferir`. Plano B: `npm run vercel`
  (na raiz; `--ajuda`). O banco guarda saves reais: não se lê, grava nem apaga à mão.
