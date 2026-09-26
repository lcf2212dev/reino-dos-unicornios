# Receita: sistema novo (mecânica)

Para que serve: uma mecânica nova que roda no mapa e nos interiores (como o banho, as fotos, a pergunta surpresa,
fome e sede). Contrato: `docs/contratos/cena-e-motor.md` §14. Modelos: `jogo/js/sistemas/fotos.js` (falas +
depurar), `cuidados.js` (iniciar), `surpresa.js` (depoisDasBoasVindas), `banho.js` (camada de desenho).

Sistema novo NÃO edita `motor/main.js`, `motor/laco.js`, `sistemas/falas.js` nem `debug.js`: registra um módulo.

## Comece pelo gerador
```
npm run novo -- sistema <s> --nome "Brilho" --seco        # confere o que vai criar
npm run novo -- sistema <s> --nome "Brilho" [--camada] [--desenho] [--campo <nome> --estrategia carimbo]
```
Cria `jogo/js/sistemas/<s>.js` (e `<s>-desenho.js`, o teste de unidade), as linhas do manifesto e o index, e
imprime o checklist. À mão: a mecânica, as falas (`(preencher)` é recusado pelos validadores), o desenho e as vozes.

## Checklist de arquivos (`<s>` = id do sistema, ex.: `brilho`)
| Arquivo | O que é |
|---|---|
| `jogo/js/sistemas/<s>.js` | `Reino.<S> = {…}` + `Reino.registrarModulo({ id: '<s>', … })` no fim |
| (opcional) `jogo/js/sistemas/<s>-desenho.js`, `<s>-painel.js` | partes, dividindo `Reino._<s>` (arquivos ≤ 400 linhas) |
| `jogo/js/manifesto.js` | uma linha por parte, grupo dos sistemas, depois dos outros sistemas; `npm run index` |
| `jogo/ferramentas/testes/unidade/<s>.test.js` | teste de unidade (no Node, pelo `jogo-no-node.js`) |

## Passo a passo
1. Pasta e arquivo em `jogo/js/sistemas/`, IIFE com `var` + function, como os vizinhos.
2. Registro no fim do arquivo (só guarda funções; nada de DOM, `Reino.Progresso` nem `Reino.Cena` aqui):
   ```js
   Reino.registrarModulo({
     id: '<s>',
     iniciar: function (ctx) { /* ao entrar no Reino, antes das boas-vindas; ctx.novo = save novo */ },
     depoisDasBoasVindas: function (ctx) { /* depois; ctx.tutorial = promessa do tutorial ou null */ },
     falas: function () { return [{ texto: 'Que brilho lindo! ✨' }]; },   // voz 'claude', pacote 'geral'
     depurar: function () { return { ligado: true }; },                     // __reino.modulo('<s>')
     camada: { ativo: fn, itensDesenho: function (pintor, t, animar) { return []; }, sobre: fn },  // opcional
   });
   ```
   Use só os ganchos que precisa. `iniciar` para contadores (fome e sede); `depoisDasBoasVindas` para o que
   espera o tutorial (surpresa).
3. Falas: TODO texto que o sistema fala sai de `falas()` (texto exato; `voz`/`pacote` quando não for o padrão).
   Depois: `fala-nova-e-vozes.md` (quem grava é o orquestrador). Frases curtas (`licoes-de-voz.md`).
4. Camada de desenho (só se desenha no mundo): `ativo()` barato; `itensDesenho` devolve itens ordenados por Y
   junto com a Mariana; `sobre` desenha por cima (px da tela). Nada de canvas novo por quadro; animação só com
   `animar`. Erro vira `console.error` com o rótulo `<s>` e o quadro segue.
   Formato dos itens: `[{ y, desenhar() }]` (y = linha dos pés, px do jogo); onde está a montaria: `Jogador.posMontaria()`
   (`docs/contratos/cena-e-motor.md` §14, "Camada: o formato dos itens").
4b. Ação de NPC (um personagem que faz algo do sistema, ex.: dar um pãozinho): `acoes: { '<tipo>': function (acao, ctx) {…} }`
   no próprio `registrarModulo`, e no interior o NPC usa `acao: { tipo: '<tipo>' }`. Não precisa de `acoes.js` no prédio
   (os sistemas carregam antes dos NPCs; o registro do módulo resolve a ordem e o validador enxerga a ação).
5. Estado no save: `Reino.Progresso.registrarCampo('<nome>', { padrao, mesclar, novoCiclo, copiaSeguranca?, limpar?, exemplos? })`
   no carregamento do arquivo do sistema (depois de `progresso-campos.js` no manifesto, `node: true`), UMA vez.
   `mesclar`: `contadores` (`{ id: n }`, o maior), `carimbo` (`{ id: { …, em } }`, vence o `em` maior), `uniao`
   (lista/conjunto) ou `maior` (número); função própria só com `exemplos: [a, b]`. `novoCiclo: 'mantem' | 'zera'`.
   Nome em camelCase, não usado pelo save de hoje. Os testes de contrato (`save-campos.test.js`) pegam o campo
   sozinhos. Contrato: `docs/contratos/save-e-mescla.md` §11. Nunca mude campos que já existem.
   "Uma vez por dia": compare com `Reino.util.hoje()` ('aaaa-mm-dd', fuso local, barato até em `ativo()` de camada;
   segue o relógio do modo determinístico).
6. Depurar → teste: `depurar()` devolve o estado que o teste confere (`__reino.modulo('<s>')` no navegador).
   Teste de unidade no Node: modelo em `jogo/ferramentas/testes/unidade/modulos.test.js`.
7. Manifesto + `npm run index`. `node: true` se o arquivo não toca em DOM no carregamento (entra nas falas e
   nos validadores do Node; sem `node: true` as falas dele não chegam ao `falas.json`).

## Conferir
```
npm run ver -- --nome <s>                                           # o mapa nos 3 tamanhos, sem erro de console
npm run ver -- --js 'console.log(JSON.stringify(__reino.modulo("<s>")))' --tamanhos celular
npm run ver -- --ir petshop --passos 'esperar:2000' --vivo           # a camada animando num interior
```
Fotos, `<nome>/erros.txt` e `<nome>/estado.json` em `/tmp/reino-testes/ver/<nome>/`. Em script: `abrirCenario()` de
`jogo/ferramentas/testes/cenario.js`.

## Validadores
```
npm run validar
npm run unidade
npm run tamanho
node jogo/ferramentas/vozes/listar-falas.js    # as falas novas aparecem no fim do módulo, na ordem de registro
npm test
npm run e2e -- --desempenho
```
Enquanto constrói, compare só as cenas onde o sistema aparece: `npm run e2e -- --cenas '<regex dos nomes>'`
(ex.: `--cenas '^interior-petshop'`); o completo fica para o fim.
Diferenças esperadas no `npm run e2e`: dados `falas`/`vozes` (falas novas); com campo no save, `save-estado-novo` e
`save-mescla` (o campo aparece no save); imagens só se o sistema aparece no começo do jogo ou nas cenas fotografadas. Qualquer outra diferença é defeito (quase sempre `Math.random` ou ordem de registro).

## Armadilhas
- `node: true`: nada de DOM, canvas, `PA`, `Reino.Progresso` nem `Reino.Cena` no carregamento; só nos ganchos.
- Ordem de registro = ordem do manifesto: vale para as chamadas dos ganchos e para a ordem do `falas.json`.
  Entre DEPOIS dos sistemas que já existem; mudar a posição muda as vozes e pode mudar o modo determinístico.
- `Math.random` no modo determinístico (`?debug=1&congelar=1`) tem semente: chamar a mais (no carregamento, no
  `iniciar`, a cada quadro) muda o que vem depois e as referências. Sorteie só quando a Mariana age, ou use
  um sorteio próprio.
- Timers: use `setTimeout`/relógio normais (o modo congelado os controla); nada de `Date.now()` guardado no
  carregamento.
- Texto na tela sem voz: `__reino.faltando` acusa.
