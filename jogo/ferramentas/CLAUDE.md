# jogo/ferramentas — regras locais

Ferramentas de desenvolvimento (Node). Nenhuma entra no jogo. Comandos: `CLAUDE.md` da raiz e `package.json`.

## Guardas (nada chega no progresso da Mariana)
- Nunca a porta 80, `reinodosunicornios.local`, `localhost` sem porta de teste nem o IP do PC.
- Servidor: só `testes/servidor-teste.js` (porta livre ≥ 1024 (nunca 80); banco novo em `/tmp/reino-testes/`;
  recusa banco fora de `/tmp` ou em `servidor/dados`).
- Navegador: só `testes/navegador.js` (Playwright, só Chromium, preso à porta de teste; bloqueia o resto).
  Tamanhos: celular 390×844, tablet 820×1180, notebook 1366×768 (`TAMANHOS`).
- Nada de Firefox, WebKit, nem emulação de iPhone/iPad com WebKit.
- Saves 100% sintéticos: `testes/saves.js`. Nunca copie o save real.
- Nunca leia, copie ou grave em `jogo/servidor/dados/`. Nunca publique o artifact
  (`gerar-artifact.js` só grava em `/tmp`; publicar é da skill `publicar-artifact`, depois de cada merge que muda o jogo).
- Derrube só os seus servidores, pelo PID ou `s.parar()`. Nunca `pkill`/`killall` por nome.
- Temporários em `/tmp/reino-testes/`, sem apagar (`rm` só com caminho literal: `CLAUDE.md` da raiz). Exceção: as ferramentas de voz (`vozes/`) gravam o venv do
  transcritor e os temporários em `<raiz>/.vozes/` (ignorado pelo git; o /tmp é memória).

## Testes que não travam
- Todo passo roda por `testes/processo.js` (`rodar`): grupo de processos próprio e tempo máximo; no estouro, o grupo
  inteiro (Chromium incluso) leva SIGTERM e, 5 s depois, SIGKILL. `npm test`: unidade 6 min, validadores 2, tamanho 1,
  referências de dados 4 (`REINO_TEMPO=2` dobra). `npm run unidade` (`testes/unidade.js`): 2 min por teste,
  concorrência até 4, `--so <regex>`, `--sem-navegador`.
- Trava por worktree (`testes/trava.js`, `/tmp/reino-testes/travas/`): `npm test`, `unidade` e `e2e` esperam até
  10 min se outro teste roda na mesma worktree (`--sem-esperar` falha logo). Trava de PID morto é assumida.
- "Page crashed"/"Target crashed" no Chromium: confira `df -h /tmp`; se estiver cheio, rode com
  `TMPDIR=/dev/shm/<pasta>` (não apague temporários de outros). A pasta de testes pode ir junto:
  `REINO_TESTES=/dev/shm/reino-testes` (só dentro de `/tmp` ou `/dev/shm`; com ela em `/dev/shm`, o banco de teste,
  a base e as referências do e2e e o `--saida` das vozes ficam dentro dela; `guardas.js`).
- Vigia (`testes/vigia-memoria.js`, ligado por `navegador.js` em todo Chromium de teste): processo acima de
  `REINO_MEMORIA_GB` (4), soma acima de `REINO_MEMORIA_TOTAL_GB` (24) ou aba do e2e sem foto há `REINO_TRAVADO_MIN`
  (5) min: mostra o que cada aba fazia (também em `/tmp/reino-testes/vigia/`), derruba os processos DAQUELE teste e
  sai com código 3. O `avancar` do e2e espera um pacote de voz no máximo 20 s (`REINO_ESPERA_VOZ_MS`) e diz qual.
- Hook do Claude Code (`.claude/settings.json` → `fluxo/vigia-travamento.js`, depois de cada ferramenta e a cada
  mensagem): avisa Chromium de teste acima de `REINO_MEMORIA_GB` (4), os de um mesmo teste somando mais de
  `REINO_VIGIA_TOTAL_GB` (24), teste rodando há mais de `REINO_VIGIA_TESTE_MIN` (30) min, memória livre abaixo de 10%
  e diagnóstico novo do vigia; o mesmo aviso volta ao mesmo agente só depois de 10 min. Na mão: `--agora`.
- Investigar e corrigir: skill `investigar-vazamento`; `npm run memoria` (`testes/sonda-memoria.js`) mede uma aba passo
  a passo e compara duas cópias do jogo.
- Todo comando do `package.json` responde a `--ajuda` sem fazer mais nada (`ajuda.js`; `unidade/ajuda.test.js`
  confere); o e2e e o servidor de teste recusam opção desconhecida.
- O servidor de teste mostra também `http://<IP da rede>:<porta>/`: só para o pai abrir à mão no celular/tablet.
  Scripts e Playwright seguem em 127.0.0.1.

## Ver o jogo
- Ver e fotografar uma cena com UM comando: `npm run ver -- --ir petshop --estrelas 500 --tamanhos celular`
  (`testes/ver.js`; `--tela loja|sala:h1|prova:<id>|desafio:h1-03` (esse desafio em 1º no sorteio, na tela real), `--passos` (passo
  `perguntas`: passa a intro e o resumo da sala), `--js`,
  `--previa`, `--recorte`, `--ampliar`; `--ajuda` tem exemplos). Sai em `/tmp/reino-testes/ver/<nome>/` (PNG,
  erros.txt, estado.json e console.txt, o console todo da página) e com código ≠ 0 se houve erro de console. O
  `console.log` de cada `--js`/`--passos` e o valor que cada `--js` devolve saem no fim da saída.
- `--previa mapa` traz a grade (coluna/linha, rect e id de cada lugar e clareira, áreas livres em azul); `--livres 5x4`
  lista rects livres com o `caminho` sugerido até a rua (sem navegador; `docs/contratos/cena-e-motor.md` §9).
- `--js`/`js:` (e o `js()` do cenário) com código que devolve Promise: no jogo congelado, Promise que depende do relógio
  (`Reino.Cena.sair()`, telas) só termina quando o relógio anda. Use `void <código>` e depois `esperar:<ms>`; sem o
  `void`, a espera para em 15 s (`REINO_ESPERA_JS_MS`) com essa explicação.
- Em script: `abrirCenario()` de `testes/cenario.js` (servidor e banco novos por cenário, save de `saves-compor.js`);
  não escreva outro ajudante de Playwright.

## Conferir enquanto constrói
- Rápido: `npm run ver -- …` (fotos), `npm run validar` (só erros e avisos; `--so <id>` num validador para olhar uma
  feature, `--detalhes` para a lista inteira), `npm run e2e -- --cenas '<regex>'` (só as imagens daquela parte).
- No fim: `npm test` e o `npm run e2e` completo (cada imagem diferente sai com a da base, a atual e uma imagem de
  diferença em magenta; diferença esperada: registre).

## Gerador
- `novo/` (`npm run novo`): prédio, matéria, sala, prova, personagem, sistema, desafio… começam com UM comando, ex.:
  `npm run novo -- predio padaria --nome "Padaria" --rect 10,10,5,4 --caminho "14,14;13,14;12,14"`,
  `npm run novo -- materia geografia --nome "Geografia" --emoji 🌍` ou `npm run novo -- sala historia h6`
  (`--lista`, `--ajuda`, `--seco`, `--raiz`).
- `npm run novo -- reserva <id> …`: o contrato de um NPC para frentes paralelas (vaga tracejada até o
  `novo personagem` preencher); nas frentes, `REINO_RESERVAS_ABERTAS=1` rebaixa a reserva sem registro a aviso, e
  o `fluxo/comum.js` apaga essa variável na integração (`docs/contratos/plano-paralelo.md`).
- Cria os arquivos dos modelos (`novo/modelos/`), põe as linhas no manifesto na ordem certa, refaz o index e imprime o
  que falta. O que só a pessoa escreve sai como `(preencher)`, que os validadores recusam ("falta preencher").

## Artifact por delta
- `npm run artifact -- --desde <commit|publicado>` (`artifact-delta.js`): só novos, mudados e removidos
  (`null`) desde o commit publicado (`artifact-publicado.txt`: `<hash> <url> <versão>`), em lote-N.json com
  ≤250 entradas; a página e os removidos no último lote. Sem `--desde`: tudo, também em lotes.
- `--registrar <hash> --versao vN` troca a linha do `artifact-publicado.txt` depois de publicar.
- `vozes/empacotar-vozes.js` ordena as chaves e não regrava pacote igual (o delta não republica voz à toa).

## Pastas
- `vozes/` (listar, gravar, empacotar), `validar/`, `testes/` (unidade, referências, e2e), `previas/` (file://).
- `validar/` (`npm run validar`, por `validar-tudo.js`): conteúdo, interiores, `validar-nomes.js` (nome repetido:
  erro no mesmo prédio, aviso entre prédios), `validar-enfeites.js` (enfeite fora do molde e oclusão montada) e
  `validar-docs.js` (pastas de material vêm do disco, sem lista fixa).
  Contraste do chão x contorno da Mariana: `contraste-pisos.navegador.test.js`, com regra e exceções em
  `validar/contraste.js` (exceção só com motivo escrito; não mude cor do jogo só para passar).
- `gerado/`: GERADO (`falas.json`, `vozes-indice.json`, `vozes-cache/`). Não abra (enorme).
- `jogo-no-node.js` carrega os scripts `node: true` do manifesto num `vm`. Nenhuma ferramenta guarda lista
  própria de scripts: use o manifesto (`scripts({ grupos, nomes })`; prévias: `previas/previa.js`).
- `gerar-index.js` escreve o `index.html` (`--conferir` só confere).

## e2e (`npm run e2e`)
- Relatório: no topo, `Resumo: N imagens diferentes — só HUD a · só dock b · só balão c · outras d` (e por tamanho);
  as de região conhecida vêm só como contagem + 5 nomes; as `outras`, na lista, com as caixas em px CSS
  (`[x,y w×h: px]`). O mesmo em `e2e-<data>/resumo.json`.
- Regiões (`.hud-topo`, `.dock`, `#claude-balao`) em `testes/referencias-regioes.js`; mudou o layout, meça de novo:
  `node jogo/ferramentas/testes/referencias-regioes.js --medir` (não entra no hash do harness).
- Trocar a base: `npm run e2e -- --trocar-base <hash> "<descrição de 1 linha>"` (commit ancestral de HEAD; não roda
  o e2e nem faz commit; mostra o diff). Nunca edite `base-referencia.txt` com `sed`.
- Save `completo` (`testes/saves.js`) só marca salas das matérias fixas (história, inglês, português): matéria nova
  não muda o dinheiro do HUD.

## Tipos (`npm run tipos`)
- Só conferência, nunca build nem arquivo carregado pelo jogo. Nos arquivos do jogo os tipos entram só em comentários
  JSDoc (`/** @param {Materia} m */`).
- Formas principais em `testes/tipos-jogo.d.ts`: `EstadoSave` (e `RegSala`, `RegTreino`, `RegProva`, `RegUni`,
  `RegCuidado`, `RegDespensa`, `Ajustes`, `Usando`), `Materia`, `Sala`, `Desafio` (união por `tipo`), `Prova`,
  `InteriorDef`, `ObjetoInterior`, `Npc`, `PersonagemElenco`, `Fala`, `Enfeite`/`Comida`/`ItemLoja`, `Musica`,
  `EventosReino`, e as APIs `ProgressoApi`, `FalasApi`, `LojaItensApi`, `MusicasApi`. APIs de extensão em
  `testes/tipos-extensoes.d.ts`; as globais (`Reino.*` com tipo) em `testes/tipos-globais.d.ts`; a lista conferida em
  `testes/tipos.json` (`fora` = os que ainda têm erro).

## Regras
- Tamanho: 420 linhas por ferramenta (regra completa em `jogo/js/CLAUDE.md`, Tamanho).
- Teste de unidade novo: `testes/unidade/<assunto>.test.js` (`npm run unidade -- --so <assunto>`).
- Ferramenta que abre navegador ou sobe servidor usa as guardas acima.
