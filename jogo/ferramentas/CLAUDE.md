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
  (`gerar-artifact.js` só grava em `/tmp`; publicar é da skill `publicar-artifact`, com pedido do Leandro).
- Derrube só os seus servidores, pelo PID ou `s.parar()`. Nunca `pkill`/`killall` por nome.
- Temporários em `/tmp/reino-testes/`, sem apagar. Exceção: as ferramentas de voz (`vozes/`) gravam o venv do
  transcritor e os temporários em `<raiz>/.vozes/` (ignorado pelo git; o /tmp é memória).

## Testes que não travam
- Todo passo roda por `testes/processo.js` (`rodar`): grupo de processos próprio e tempo máximo; no estouro, o grupo
  inteiro (Chromium incluso) leva SIGTERM e, 5 s depois, SIGKILL. `npm test`: unidade 6 min, validadores 2, tamanho 1,
  referências de dados 4 (`REINO_TEMPO=2` dobra). `npm run unidade` (`testes/unidade.js`): 2 min por teste,
  concorrência até 4, `--so <regex>`, `--sem-navegador`.
- Trava por worktree (`testes/trava.js`, `/tmp/reino-testes/travas/`): `npm test`, `unidade` e `e2e` esperam até
  10 min se outro teste roda na mesma worktree (`--sem-esperar` falha logo). Trava de PID morto é assumida.
- O servidor de teste mostra também `http://<IP da rede>:<porta>/`: só para o pai abrir à mão no celular/tablet.
  Scripts e Playwright seguem em 127.0.0.1.

## Ver o jogo
- `npm run ver` (`testes/ver.js`) ou, em script, `abrirCenario()` de `testes/cenario.js`; não escreva outro ajudante de Playwright.

## Gerador
- `novo/` (`npm run novo`): cria os arquivos de prédio, matéria, sala, prova, personagem e sistema a partir de `novo/modelos/`, com as linhas do manifesto.

## Artifact por delta
- `npm run artifact -- --desde <commit|publicado>` (`artifact-delta.js`): só novos, mudados e removidos
  (`null`) desde o commit publicado (`artifact-publicado.txt`: `<hash> <url> <versão>`), em lote-N.json com
  ≤250 entradas; a página e os removidos no último lote. Sem `--desde`: tudo, também em lotes.
- `--registrar <hash> --versao vN` troca a linha do `artifact-publicado.txt` depois de publicar.
- `vozes/empacotar-vozes.js` ordena as chaves e não regrava pacote igual (o delta não republica voz à toa).

## Pastas
- `vozes/` (listar, gravar, empacotar), `validar/`, `testes/` (unidade, referências, e2e), `previas/` (file://).
- `validar/` (`npm run validar`, por `validar-tudo.js`): conteúdo, interiores, `validar-nomes.js` (nome repetido:
  erro no mesmo prédio, aviso entre prédios) e `validar-docs.js` (pastas de material vêm do disco, sem lista fixa).
  Contraste do chão x contorno da Mariana: `contraste-pisos.navegador.test.js`, com regra e exceções em
  `validar/contraste.js` (exceção só com motivo; não mude cor do jogo para passar sem o Leandro).
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

## Regras
- Limite: 420 linhas por ferramenta (`npm run tamanho`).
- Teste de unidade novo: `testes/unidade/<assunto>.test.js` (`npm run unidade -- --so <assunto>`).
- Ferramenta que abre navegador ou sobe servidor usa as guardas acima.
