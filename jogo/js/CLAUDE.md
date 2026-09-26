# jogo/js — regras locais

Regras gerais: `docs/contratos/README.md` §1–§3. Arquitetura: `docs/ARQUITETURA.md`.
O servidor entrega `js/**`, este arquivo também: nada de segredo aqui.

## Scripts clássicos
- Sem módulos ES, bundler, build nem `fetch` de arquivo local. Roda em file://, no servidor de casa e no artifact.
- Tudo em `window.Reino` e nos globais `Mapa`, `Jogador`, `PA`. Nomes e comentários em português.
- API pública (`Reino.*`, `Mapa`, `Jogador`, `PA`, `window.__reino`) não muda sem o orquestrador.

## Manifesto (`js/manifesto.js`)
- É a ÚNICA lista de scripts e CSS, na ordem de carga. `index.html` é gerado dele.
- Arquivo novo = uma linha `{ js, grupo, node? }` no manifesto + `npm run index`.
- `node jogo/ferramentas/gerar-index.js --conferir` acusa `.js` em `js/` fora do manifesto.
- A ordem importa: cada arquivo usa o que os de cima registraram.
- `js/voz/*.js` fica FORA do manifesto (gerado, carregado por `Reino.Voz.carregar`). Não abra.

## Registros
- Feature nova entra por registro (`docs/ARQUITETURA.md` §5.1): sistema = `Reino.registrarModulo`, prédio =
  `Reino.registrarLugar`; nada em `main.js`, `laco.js`, `falas.js`, `debug.js`, `mundo/lugares.js`, `ui/lugares.js`.

## Objetos internos
- Arquivo dividido em partes divide o que é privado por um objeto interno, descrito no cabeçalho:
  `Reino._motor`, `_cena`, `_interiores`, `_predios.<prédio>`, `_npcs`, `_jogador`, `_ui`, `_desafios`,
  `_progresso`, `_som`, `_musicas`, `_surpresa`, `_fotos`, `_banho`, `PA._interno`.
- Só as partes daquele arquivo usam o interno; quem está fora usa a API pública.

## `node: true` (roda sem DOM)
- As ferramentas carregam esses arquivos num `vm` do Node (`jogo/ferramentas/jogo-no-node.js`).
- No carregamento: nada de DOM, canvas, `document`, `PA`, `Reino.Progresso` nem `Reino.Cena`.
  Só dentro de funções chamadas depois. Registrar no carregamento pode (só guarda a função).
- `sistemas/banho.js` e `banho-desenho.js` seguem a mesma regra, mesmo sem `node: true`.

## Ordem de registro e `Math.random`
- A ordem do manifesto define a ordem das salas, dos registros e do `falas.json`.
- O modo determinístico (`?debug=1&congelar=1`, `nucleo/congelar.js`) usa `Math.random` com semente.
  Mudar a ordem de carga, a ordem de registro ou quantas vezes `Math.random` é chamado muda as
  referências. Só com motivo, e conferindo com `npm run e2e`.

## Tamanho e arte
- Código até ~400 linhas (`npm run tamanho` falha acima de 420); dados até 800.
- Pixel art em código: contorno `#3a2446`, tile de 16 px, fonte "Press Start 2P".
- Emoji na tela precisa de desenho em `js/arte/icones/<lote>.js`.
- Animações desligadas e `prefers-reduced-motion`: desenho parado, som continua.
- Depuração: `?debug=1` → `window.__reino` (`js/debug.js`). Detalhes por pasta: o `CLAUDE.md` de cada uma.
