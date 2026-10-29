# O jogo na Vercel

https://reino-dos-unicornios.vercel.app (projeto `reino-dos-unicornios` do time da Vercel, banco Neon
`reino-dos-unicornios-production` ligado pela integração, que põe o `DATABASE_URL` no projeto).

- `montar.js` (o build): monta `public/` a partir de `../jogo` com menos requisições: os scripts do manifesto em ~10
  lotes na ordem de carga (`js/lote-NN-<grupo>.<hash>.js`, cada arquivo depois de `;` e de um comentário com o
  caminho de origem, para achar um erro), os CSS num só (`css/jogo.<hash>.css`), a fonte, os pacotes de voz soltos
  (`js/voz/`, sob demanda) e o `js/versao.json` desta árvore. O `jogo/` não muda (file://, servidor de teste, e2e).
  `node montar.js --saida <pasta>` monta noutro lugar (os testes usam `/tmp/reino-testes/`); `DEPENDENCIAS` é o
  que ele lê do repositório (o plano B exporta só isso).
- `api/progresso.js` e `api/jogadores.js` (+ `lib/banco.js`): as mesmas rotas, respostas e regras de
  `jogo/servidor/servidor.js` (§12 de `docs/contratos/save-e-mescla.md`), sobre Postgres. As tabelas nascem sozinhas.
- `pwa/`: o app instalável. `montar.js` copia o manifesto e os ícones, gera o `sw.js` com o hash de cada arquivo (o
  jogo inteiro fica no aparelho; um deploy novo só baixa o que mudou) e registra os dois no `index.html`. O `sw.js`
  instala em duas fases: o núcleo (index, lotes, CSS, fonte, ícones, manifesto, versão) na instalação, e o jogo já
  abre sem rede; as vozes (~70 MB) e as aberturas do iOS depois de ativo, em segundo plano, com a aba lembrando a
  cada minuto (`{ reino: 'continuar' }`). Voz que mudou: a velha fica no cache até a nova chegar.
  Testes: `montar-lotes.navegador.test.js` (lotes, e a foto do mapa igual à do `jogo/`) e `sw-nucleo.navegador.test.js`
  (o SW de antes dos lotes passando para o novo, e a instalação do zero, as duas sem rede no fim), com o
  `jogo/ferramentas/testes/servidor-estatico.js`.
- Publicar: sozinho. O projeto está ligado ao GitHub e cada push na `main` vira publicação de produção, se o jogo mudou
  (`ignorar-build.sh`, o "Ignored Build Step" do `vercel.json`: preview nunca, porque as variáveis do banco valem também
  em preview; `git.deploymentEnabled` só na `main`). Conferir: `npm run vercel -- --conferir` (a mesma regra do
  `ignorar-build.sh` primeiro: jogo igual ao da última publicação de produção READY = "nada a publicar" na hora; na
  dúvida ou com o jogo mudado, espera a Vercel, até 15 min, mostrando o estado). Os lotes e o CSS (nomes com hash)
  vão com cache de 1 ano (`immutable`, no `vercel.json`). Plano B: `npm run vercel`
  (na raiz; `--ajuda`). O banco guarda saves reais: não se lê, grava nem apaga à mão.
