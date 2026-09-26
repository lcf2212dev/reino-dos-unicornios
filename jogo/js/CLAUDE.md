# jogo/js — regras locais

Fonte única das regras de código do jogo (vale para toda subpasta; o `CLAUDE.md` de cada uma só acrescenta).
Mapa do código: `docs/ARQUITETURA.md`. Contratos por assunto: `docs/contratos/README.md`.
O servidor entrega `js/**`, este arquivo também: nada de segredo aqui.

## Onde o jogo roda
- Três jeitos, e tudo tem que funcionar nos três: `jogo/index.html` aberto direto (file://), o servidor de casa e o
  artifact do claude.ai (montado por `jogo/ferramentas/gerar-artifact.js`).
- O servidor só entrega `index.html`, `css/<arquivo>` (CSS sem subpasta) e `js/**`: todo script fica sob `jogo/js/`;
  nada de `jogo/ferramentas/` chega ao navegador.
- Ambiente (artifact, `file:`, https, servidor de casa, toque, compartilhar, baixar): só por `Reino.ambiente`
  (`js/nucleo/ambiente.js`, funções avaliadas na hora); não repita a checagem de `window.claude` nem de `navigator.share`.

## Scripts clássicos
- Sem módulos ES, bundler nem build. Scripts clássicos, carregados em ordem.
- Sem `fetch` de arquivo local: dado novo mora num `.js` que se registra (ex.: `Reino.registrarSala`).
- Tudo em `window.Reino` e nos globais `Mapa`, `Jogador`, `PA`. Nomes e comentários em português.
- API pública (`Reino.*`, `Mapa`, `Jogador`, `PA`, `window.__reino`) não muda sem o orquestrador.
- Eventos do barramento (`U.on`/`U.emit`): sempre pela constante de `Reino.EVENTOS` (`nucleo/eventos.js`, que documenta
  quem emite, quem ouve e a carga): `U.on(Reino.EVENTOS.CENA, fn)`. Evento novo = constante nova lá, documentada.

## Manifesto (`js/manifesto.js`)
- É a ÚNICA lista de scripts e CSS, na ordem de carga. `index.html` é GERADO dele (`npm run index`).
- Arquivo novo = uma linha `{ js, grupo, node? }` no manifesto (`node: true` se roda sem DOM) + `npm run index`.
- `node jogo/ferramentas/gerar-index.js --conferir` acusa index.html desatualizado, arquivo do manifesto que não
  existe e `.js` em `js/` fora do manifesto (fora `js/voz/`).
- A ordem importa: cada arquivo usa o que os de cima registraram em `window.Reino`. Ordem dos grupos:
  `docs/ARQUITETURA.md` §3.
- `js/voz/*.js` fica FORA do manifesto (pacotes gerados, carregados sob demanda por `Reino.Voz.carregar`). Não abra.

## Registros
- Feature nova entra por registro (`docs/ARQUITETURA.md` §5.1): sistema = `Reino.registrarModulo`, prédio =
  `Reino.registrarLugar`; nada em `main.js`, `laco.js`, `falas.js`, `debug.js`, `mundo/lugares.js`, `ui/lugares.js`.

## Objetos internos
- Arquivo dividido em partes divide o que é privado por um objeto INTERNO, criado pela 1ª parte e descrito no
  cabeçalho dela (o que guarda); cada parte diz de onde veio e o que registra. Quem cria e quem usa cada um
  (`Reino._motor`, `_cena`, `_interiores`, `_predios.<prédio>`, `_npcs`, `_progresso`…): `docs/ARQUITETURA.md` §7.
- Interno não é API: só as partes daquele arquivo usam; quem está fora usa a API pública, que não muda com a divisão.
- Estado compartilhado se lê sempre na hora (ex.: `I.estado` do progresso). Por quê: `docs/decisoes/divisao-em-arquivos.md`.

## `node: true` (roda sem DOM)
- As ferramentas carregam esses arquivos num `vm` do Node sem DOM (`jogo/ferramentas/jogo-no-node.js`).
- No carregamento: nada de DOM, canvas, `document`, `PA`, `Reino.Progresso` nem `Reino.Cena`.
  Só dentro de funções chamadas depois. Registrar no carregamento pode (só guarda a função).
- `sistemas/banho.js` e `banho-desenho.js` seguem a mesma regra, mesmo sem `node: true`.

## Ordem de registro, sorteio e depuração
- A ordem do manifesto define a ordem das salas, dos registros e do `falas.json`.
- Depuração: `?debug=1` → `window.__reino` (`js/debug.js`; lista em `docs/contratos/cena-e-motor.md` §12).
- Modo determinístico: `?debug=1&congelar=1` (`nucleo/congelar.js`, primeiro script): relógio, timers e rAF virtuais
  (`__congelar.avancar(ms)`), `Math.random` com semente, animações desligadas, começo direto no mapa. É o que as
  referências (`npm run e2e`) usam.
- Nele, `U.embaralhar(arr, chave)`/`U.sortear(arr, chave)` sorteiam por `Reino.sorteioDaChave(chave)` (semente =
  FNV-1a da chave + nº de usos dela; não gasta o `Math.random` global): desafio, sala ou treino novo não muda a ordem
  das outras telas. Quem sorteia conteúdo passa a chave (`'sortear:' + sala.id + ...`, `['escolha', d]`). Sem
  congelar (o jogo de verdade), a chave é ignorada e tudo continua com `Math.random`.
- Mudar a ordem de carga, a ordem de registro ou quantas vezes `Math.random` é chamado muda as referências. Só com
  motivo, e conferindo com `npm run e2e`.

## Tamanho (vale também para `jogo/css/` e `jogo/ferramentas/`)
- Código até ~400 linhas; `npm run tamanho` falha acima de 420 (CSS e ferramentas também: 420).
- Dados (conteúdo, ícones, falas, elenco, moldes, faixas) até 800. Gerados sem limite.

## Arte
- Pixel art desenhada em código, sem imagens: contorno `#3a2446`, tile de 16 px. Texto no canvas: "Press Start 2P".
- Todo emoji que aparece na tela ou no canvas tem ícone desenhado em `js/arte/icones/<lote>.js` (confira em
  `jogo/ferramentas/previas/icones.html` ou `npm run ver -- --previa icones`). Emoji novo sem desenho: avise quem integra.
- Feature com emoji próprio (ex.: o 🥐 da Padaria) desenha na PRÓPRIA pasta, sem editar os lotes:
  `Reino.registrarIcones({ '🥐': { n: 'croissant', p: { k: '#3a2446', … }, d: [16 linhas de 16] } })`
  (`js/arte/icones/icones.js`, `node: true`; chave sem `️`). Chave que já existe ou formato torto (o mesmo
  que o `validar-conteudo` confere nos acessórios: `Reino.conferirIcone`) lança erro na hora. O `validar-interiores`
  avisa o `menu.emoji` de `Reino.registrarLugar` que ficar sem desenho.
- Ajustes → Animações desligado e `prefers-reduced-motion` valem em tudo: sem animação, o desenho fica parado (sem
  partículas, ondinhas paradas, planetas parados). O som continua.
- Defeito conhecido, fora das regras: com a fonte reserva (sem internet para a Press Start 2P), maiúscula acentuada
  pode sair com o acento deslocado; com a Press Start 2P sai certo. Não mexa por tabela.

Detalhes por pasta: o `CLAUDE.md` de cada uma.
