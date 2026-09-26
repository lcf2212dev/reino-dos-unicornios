# Plano da refatoração para IA (feat/refatoracao)

**Início:** 2026-09-26 · **Base:** `main` 8e5decb (a branch `feat/banho-fotos-musica` já não existe:
foi integrada na main). Worktree: `/home/leandro/reino-refatoracao`.

Objetivo: organizar código, pastas, ferramentas e documentação para que IAs trabalhem mais rápido,
com menos contexto e menos erro, **sem mudar nada** do que a Mariana vê, ouve ou tem salvo.

## Regra de ouro (como se prova "nada mudou")
- Commit `982f1ed`: modo determinístico (`js/congelar.js`, só com `?debug=1&congelar=1`).
- Referências capturadas nesse commit, duas vezes, iguais entre si:
  `node jogo/ferramentas/testes/referencias.js capturar <saida> --raiz <jogo> --so dados,imagens,vozes,desempenho`
  e `… comparar <referencia> <nova> [--desempenho]`. Ficam em `/tmp/reino-refatoracao/ref-base`.
- Depois de cada passo: capturar de novo e comparar. Diferença reprova o passo
  (ruído de antialiasing: ver `referencias-ruido.md`).

## Estrutura final
```
jogo/
  index.html                 GERADO de js/manifesto.js (ferramentas/gerar-index.js)
  css/                       planos (o servidor só entrega css/<arquivo>): ui-*.css, interiores.css, sistemas-*.css
  js/
    manifesto.js             ordem de carga única (dados puros; Node e ferramentas)
    nucleo/                  congelar, config (dados), util, eventos, registros
    motor/                   main (início), laço, câmera, entrada, cena, transição, interiores-* (motor dos interiores)
    mundo/                   mapa, prédios do mapa, lago
    personagens/             jogador, unicórnios, claude, npcs-* (motor, sprites, diálogo), elenco (dados)
    arte/                    pixelart-*, desenho (helpers únicos), icones/<lote>.js (dados)
    sistemas/                progresso-*, cuidados, loja, surpresa, som, musicas, voz, falas, fotos, banho
    atividades/              desafios (núcleo) + desafios/<tipo>.js, missao, treino, provas
    ui/                      base (telas, painel, foco), hud, uma tela por arquivo
    interiores/<prédio>/     dados, falas e objetos de cada prédio; interiores/padrao.js
    conteudo/materias/<m>/   uma sala por arquivo, livro e registro da matéria
    conteudo/provas/         provas da escola (dados)
    voz/                     GERADO (pacotes de áudio; nomes intocados)
    debug.js
  ferramentas/
    vozes/   validar/   testes/   previas/   conteudo/   gerado/
  servidor/                  intocado
docs/  ARQUITETURA.md  contratos/  receitas/  decisoes/
CLAUDE.md  COMO-USAR.md  package.json (só desenvolvimento)
```

## Mapa de caminhos antigo → novo (Fase 1, só movimentação)
Prefixo `jogo/`. Movido com `git mv`, conteúdo igual (só caminhos citados mudam).

| Antigo | Novo |
|---|---|
| js/congelar.js | js/nucleo/congelar.js |
| js/config.js | js/nucleo/config.js |
| js/main.js | js/motor/main.js |
| js/cena.js | js/motor/cena.js |
| js/interiores.js | js/motor/interiores.js |
| js/mapa.js | js/mundo/mapa.js |
| js/jogador.js | js/personagens/jogador.js |
| js/unicornios.js | js/personagens/unicornios.js |
| js/npcs.js | js/personagens/npcs.js |
| js/claude.js | js/personagens/claude.js |
| js/pixelart.js | js/arte/pixelart.js |
| js/icones.js | js/arte/icones.js (Fase 2: js/arte/icones/<lote>.js) |
| js/progresso.js | js/sistemas/progresso.js |
| js/cuidados.js | js/sistemas/cuidados.js |
| js/surpresa.js | js/sistemas/surpresa.js |
| js/audio.js | js/sistemas/som.js |
| js/musicas.js | js/sistemas/musicas.js |
| js/voz.js | js/sistemas/voz.js |
| js/falas.js | js/sistemas/falas.js |
| js/fotos.js | js/sistemas/fotos.js |
| js/banho.js | js/sistemas/banho.js |
| js/loja-itens.js | js/conteudo/loja-itens.js |
| js/minijogos.js | js/atividades/desafios.js |
| js/prova.js | js/atividades/treino.js |
| js/provas.js | js/atividades/provas.js |
| js/ui.js | js/ui/ui.js |
| js/interiores/<p>.js | js/interiores/<p>/<p>.js |
| js/interiores/<p>-falas.js | js/interiores/<p>/falas.js |
| js/interiores/observatorio-cenas.js | js/interiores/observatorio/cenas.js |
| js/interiores/padrao.js | js/interiores/padrao.js (fica) |
| js/materias/<m>.js | js/conteudo/materias/<m>/<m>.js |
| js/provas/<p>.js | js/conteudo/provas/<p>.js |
| js/voz/*.js | fica (gerado; nomes e caminho intocados) |
| js/debug.js | fica |
| css/jogo.css | css/ui-jogo.css (Fase 2: ui-*.css na mesma ordem) |
| css/novidades.css | css/ui-novidades.css |
| css/petshop.css | css/ui-petshop.css |
| css/fotos.css | css/ui-fotos.css |
| css/interiores.css | fica |
| ferramentas/listar-falas.js, empacotar-vozes.js, gerar-vozes.py | ferramentas/vozes/ |
| ferramentas/falas.json, vozes-indice.json, vozes-cache/ | ferramentas/gerado/ |
| ferramentas/validar-conteudo.js, validar-interiores.js | ferramentas/validar/ |
| ferramentas/testar-save.js, testar-banho.js, testar-musicas.js | ferramentas/testes/ |
| ferramentas/*.html | ferramentas/previas/ |
| ferramentas/gerar-artifact.js | ferramentas/gerar-artifact.js (fica) |
| ferramentas/montar-portugues.js | ferramentas/conteudo/ (ou removido com rascunho/, se o conteúdo já estiver igual) |
| CONTRATOS-*.md (raiz) | docs/contratos/ (Fase 4, consolidados) |

Novos na Fase 1: `js/manifesto.js`, `ferramentas/gerar-index.js` (gera e confere o index.html).

## Divisões (Fase 2) — limites: código ~400 linhas (ferramenta: 420), dados ~800
| Arquivo | Divisão por responsabilidade (nomes finais decididos pelo construtor) |
|---|---|
| motor/interiores.js (1900) | cores e helpers → arte/desenho.js; pisos/paredes; biblioteca de objetos (2–3 arquivos por tema); grade; cena do interior; NPC genérico |
| ui/ui.js (1675) | ui/base.js (telas, painel, escolher/confirmar, foco, toques), ui/hud.js, ui/loja.js, ui/estabulo.js, ui/bau.js, ui/ajustes.js, ui/pais.js, ui/lugares.js, ui/petshop.js, ui/ovos.js, ui/aparencia.js, ui/materia.js |
| atividades/desafios.js (1475) | núcleo (render, pontuar, sortear, textos) + atividades/desafios/<tipo>.js (um por tipo) + atividades/missao.js |
| interiores/portugues (1331), observatorio (1415 + cenas 976), petshop (801), torre, museu, loja, castelo, escola | dados do prédio / objetos (desenho) / cenas, cada um ≤ ~400 |
| personagens/npcs.js (1320) | motor (status, desenhar), sprites, diálogo (frases, paginar, interagir), elenco (dados, com `paraMateria`/`paraProva`) |
| arte/pixelart.js (1245) | base (canvas, paraDOM, ícones), unicórnio, Mariana/Claude, acessórios |
| arte/icones.js (6115) | arte/icones/<lote>.js por tema (≤ ~800 cada) |
| mundo/mapa.js (898) | mapa (grade, lugares, caminho), prédios do mapa, lago/água, desenho animado |
| motor/main.js (432), cena.js (478) | laço, câmera, entrada, início; cena e transição |
| sistemas/* acima de ~400 | progresso (estado/carregar/salvar, mescla, nuvem), som, musicas, fotos, surpresa, banho, cuidados |
| personagens/jogador.js (637) | movimento/caminho, desenho |
| conteudo/materias/<m>.js | uma sala por arquivo + livro + registro |
| css/ui-jogo.css (1020) | ui-*.css na mesma ordem de cascata |
| ferramentas/testes/testar-save.js (1570) | por assunto (Fase 3) |

## Mudanças de API internas
- Arquivos que eram um IIFE só e foram divididos compartilham o que era privado por um objeto
  interno documentado (ex.: `Reino._interiores`), carregado antes das partes. API pública
  (`Reino.*`, `Mapa`, `Jogador`, `PA`, `window.__reino`) não muda.
- Helpers de desenho idênticos passam a ter uma implementação só (`arte/desenho.js`). Helpers com
  constantes diferentes continuam separados (o pixel tem que sair igual).
- CAVALEIROS e PROFESSORES viram campos do elenco (`paraMateria`, `paraProva`).
- Eventos: `Reino.EVENTOS` com os nomes (constantes) e as cargas documentadas.

## Donos por fase
- Fase 0 (base, determinismo, referências, este plano): orquestrador.
- Fase 1 (movimentação + manifesto + gerador do index): 1 construtor; validação: 1 validador.
- Fase 2 (divisões): 1 construtor por área, cada um na sua worktree
  (`/home/leandro/reino-ref-<area>`, branch `feat/ref-<area>` a partir de feat/refatoracao);
  o orquestrador integra uma área por vez (commits temáticos, manifesto, referências).
- Fase 3 (ferramentas e testes): construtores por ferramenta; Fase 4 (docs): construtores por
  grupo de documentos; Fase 5: bugs e validadores finais.

## Decisões
- **Base:** main 8e5decb (feat/banho-fotos-musica não existe mais).
- **Determinismo:** relógio, timers e rAF virtuais (`__congelar.avancar(ms)`), Math.random com
  semente, movimento reduzido e CSS sem animações/transições, começo direto no mapa sem boas-vindas.
- **Referências de imagem não entram no git** (≈570 PNG): são capturadas de um commit base
  (`git archive` em /tmp) e comparadas; referências de dados também são geradas a partir da base.
- **Um servidor de teste por aba** nas capturas: a sincronização de uma aba não vaza para a outra.
- **js/voz/ fica onde está** (gerado, carregado por `Voz.carregar` pelo caminho `js/voz/<pacote>.js`).
- **Gerados das vozes** (falas.json, vozes-indice.json, vozes-cache/) vão para `ferramentas/gerado/`.
- **Construtores em worktrees próprias** e o orquestrador integra: eles podem mexer na cópia
  local do manifesto para testar; a versão integrada do manifesto é só do orquestrador.
- **Limite de código ~400**: `npm run tamanho` usa 420 para código e 800 para dados; gerados fora.
