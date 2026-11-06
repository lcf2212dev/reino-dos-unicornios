# Arquitetura do jogo

Para que serve: o mapa do código para quem chega sem contexto. Diz onde mora cada coisa, em que ordem
carrega, como um quadro é desenhado e o que é gerado. Regras aqui não: as de código ficam no `CLAUDE.md` de cada
pasta (as gerais em `jogo/js/CLAUDE.md`), as de cada assunto nos contratos (`docs/contratos/README.md`), os comandos
e o fluxo de trabalho no `CLAUDE.md` da raiz; o passo a passo nas receitas (`docs/receitas/`); o porquê nas
decisões (`docs/decisoes/`).

## 1. O jogo em uma frase
"Mariana e o Reino dos Unicórnios": jogo de revisão escolar para a Mariana (7 anos), em pixel art desenhada
em código. Ela anda num mapa, entra nos prédios, conversa com personagens e faz as salas de cada matéria
(História, Inglês, Português). Acertos dão estrelas, unicórnios, enfeites e dinheiro de verdade (derivado).

## 2. Onde o jogo roda (e o que isso impõe)
| Jeito | Como | Quem usa |
|---|---|---|
| Vercel | `reino-dos-unicornios.vercel.app` e o app instalável (PWA), montados de `jogo/` por `vercel/` | a Mariana e os outros jogadores |
| `file://` | abrir `jogo/index.html` direto | prévias à mão (os testes usam o servidor de TESTE: `jogo/ferramentas/CLAUDE.md`) |

O que isso impõe ao código (scripts clássicos, sem `fetch` local): `jogo/js/CLAUDE.md`. O servidor de casa e o
artifact do claude.ai foram aposentados em 29/09/2026 (o código ainda os reconhece). Progresso real, intocável:
`docs/contratos/save-e-mescla.md` §9 (o porquê: `docs/decisoes/seguranca-do-progresso.md`).

## 3. Ordem de carga
- A lista é `jogo/js/manifesto.js` (regras do manifesto e de `node: true`: `jogo/js/CLAUDE.md`).
- Grupos, na ordem: `nucleo` → `icones` → `pixelart` → `arte` → `conteudo` → `personagens` (unicórnios) →
  `materias` → `provas` → `sistemas` (progresso, som, músicas, voz; `personagens/claude.js`; falas, cuidados,
  surpresa) → `mundo` →
  `personagens` (jogador) → `atividades` → `ui` → `sistemas` (fotos) → `motor` (interiores-*) →
  `personagens` (npcs, elenco) → `interiores` (um prédio por vez, `padrao.js` por último) → `sistemas`
  (banho) → `motor` (cena, transição, câmera, laço, entrada, main) → `debug`.
- As ferramentas escolhem arquivos por grupo ou por nome (`jogo/ferramentas/jogo-no-node.js`,
  `jogo/ferramentas/previas/previa.js`). Nome = caminho sob `js/` sem `.js` (ex.: `sistemas/progresso`).

## 4. Mapa de pastas
```
jogo/
  index.html            GERADO do manifesto
  css/                  ui-*.css, interiores.css (planos, ordem da cascata no manifesto)
  js/
    manifesto.js        ordem de carga
    nucleo/             congelar (modo determinístico), config (DADOS: números, PIN, vozes, comidas),
                        registros (matérias/provas), util (Reino.util + barramento), eventos (Reino.EVENTOS)
    arte/               pixelart*.js (PA), desenho.js (Reino.Desenho), icones/<lote>.js (window.ICONES)
    conteudo/           loja-itens.js, materias/<m>/ (uma sala por arquivo), provas/<prova>.js
    personagens/        unicornios, jogador*, claude (balão), npcs-* (motor dos NPCs), elenco (dados)
    sistemas/           progresso-*, som-*, musicas*, voz, falas, cuidados, surpresa*, fotos*, banho*
    mundo/              mapa, lugares (dados), mapa-desenho, chao, arvores, lago, cidade-desenho, cidade-pecas,
                        contorno, fachadas (+ kit), predios
    atividades/         desafios.js + desafios/<tipo>.js, missao (sala), treino (Castelo), provas (Escola)
    ui/                 base (telas, foco, guarda de toque), hud e uma tela por arquivo
    motor/              interiores-* (motor dos prédios), cena, transicao, camera, laco, entrada, main
    interiores/<prédio>/  falas, objetos, o interior, ações, desenho de fora; interiores/padrao.js
    voz/                GERADO: pacotes de áudio (não abrir)
    debug.js            window.__reino (só com ?debug=1)
  ferramentas/
    vozes/  validar/  testes/ (+ testes/unidade/)  previas/ (abrem por file://)  gerado/ (não abrir)
  servidor/             servidor de casa (aposentado; intocável)
vercel/                 o jogo na Vercel (API, PWA)
docs/  ARQUITETURA.md  contratos/  receitas/  decisoes/
```

## 5. Onde está cada subsistema
| Subsistema | Arquivos | Contrato |
|---|---|---|
| Cena, íris, câmera, laço, entrada | `jogo/js/motor/cena.js`, `transicao.js`, `camera.js`, `laco.js`, `entrada.js`, `main.js` | `docs/contratos/cena-e-motor.md` |
| Mapa, lugares, prédios de fora, lago | `jogo/js/mundo/` | `docs/contratos/cena-e-motor.md` §9–10 |
| Jogador | `jogo/js/personagens/jogador.js`, `jogador-desenho.js` | `docs/contratos/cena-e-motor.md` §7 |
| Interiores (motor e prédios) | `jogo/js/motor/interiores-*.js`, `jogo/js/interiores/` | `docs/contratos/interiores.md` |
| NPCs, elenco, balão | `jogo/js/personagens/npcs*.js`, `elenco.js`, `claude.js` | `docs/contratos/npcs-e-dialogo.md` |
| Save e sincronização | `jogo/js/sistemas/progresso.js`, `progresso-mescla.js`, `progresso-nuvem.js`, `progresso-regras.js` | `docs/contratos/save-e-mescla.md` |
| Fome, sede, banho | `jogo/js/sistemas/cuidados.js`, `banho.js`, `banho-desenho.js`, `jogo/js/ui/cuidados.js`, `petshop.js` | `docs/contratos/cuidados.md` |
| Loja e enfeites | `jogo/js/conteudo/loja-itens.js`, `jogo/js/ui/loja.js`, `jogo/js/arte/pixelart-unicornio-moldes.js` | `docs/contratos/loja.md` |
| Pergunta surpresa | `jogo/js/sistemas/surpresa.js`, `surpresa-painel.js` | `docs/contratos/surpresa.md` |
| Viagem de foguete (tanque, voo, planetas, ETs) | `jogo/js/sistemas/viagem*.js`, `jogo/js/ui/foguete.js`, `jogo/js/atividades/voo*.js`, `jogo/js/interiores/planetas/` | `docs/contratos/viagem.md` |
| Laboratório de Química (misturas, caderno, microscópio, tabela periódica; 2º andar: curiosidades, Fogão dos Estados, Mesa de Separar, livros) | `jogo/js/sistemas/quimica.js`, `quimica-andar2.js`, `jogo/js/conteudo/quimica/`, `jogo/js/ui/quimica-*.js`, `jogo/js/interiores/quimica/` | `docs/contratos/quimica.md` |
| Bosque dos Fantasmas (portal, combate, perguntas, nível) | `jogo/js/interiores/bosque/`, `jogo/js/sistemas/bosque*.js`, `jogo/js/ui/bosque-*.js` | `docs/contratos/bosque.md` |
| Cidade Nova (portal, 4 lojas, Teleportadora, pergunta do 4º bimestre) | `jogo/js/interiores/cidade-nova/`, `jogo/js/sistemas/loja-cidade.js`, `teleportadora.js`, `jogo/js/ui/loja-cidade.js` | `docs/contratos/cidade-nova.md` |
| Mapa de luta novo (arena: portal, inimigos, números) | `jogo/js/interiores/<mapa>/`, `jogo/js/motor/interiores-arena.js`, `arte/portal.js` | `docs/contratos/arenas.md` |
| Som, música, voz | `jogo/js/sistemas/som*.js`, `musicas-faixas.js`, `musicas.js`, `voz.js`, `falas.js` | `docs/contratos/som-musica-e-voz.md` |
| Fotos | `jogo/js/sistemas/fotos.js`, `fotos-moldura.js`, `fotos-telas.js` | `docs/contratos/fotos.md` |
| Matérias, salas, provas, desafios | `jogo/js/conteudo/`, `jogo/js/atividades/` | `docs/contratos/conteudo.md` |
| Telas, HUD, foco, guarda de toque, Área dos pais | `jogo/js/ui/` | `docs/contratos/ui.md` |
| Ícones em pixel | `jogo/js/arte/icones/<lote>.js` (prévia `jogo/ferramentas/previas/icones.html`) | `jogo/js/CLAUDE.md` (Arte) |
| Configuração (números, PIN, vozes) | `jogo/js/nucleo/config.js` | — |

## 5.1 Pontos de extensão (quero X → faço Y)
Cada feature entra por um registro, no arquivo dela + uma linha no manifesto (`npm run index`). Os centrais ficam intactos.
Comece pelo gerador quando houver: `npm run novo -- <tipo> <id>` (`--lista`, `--seco`); ele cria os arquivos, as
linhas do manifesto e o index, e deixa `(preencher)` onde só a pessoa escreve (os validadores recusam).
| Quero | Gerador | Faço (registro / arquivo) | NÃO toco | Receita |
|---|---|---|---|---|
| Sistema (mecânica como banho, fotos) | `novo sistema` | `Reino.registrarModulo` em `jogo/js/sistemas/<s>.js` | `motor/main.js`, `motor/laco.js`, `sistemas/falas.js`, `debug.js` | `sistema-novo.md` |
| Campo novo no save | `novo sistema --campo` | `Reino.Progresso.registrarCampo` no arquivo do sistema | `progresso*.js`, testes do save | `sistema-novo.md` passo 5 |
| Prédio (lugar + interior) | `novo predio` | `Reino.registrarLugar` + `Reino.registrarInterior` em `jogo/js/interiores/<p>/` | `mundo/lugares.js`, `ui/lugares.js`, `validar-interiores.js` | `predio-novo.md` |
| Matéria dentro de um prédio que já existe (sem prédio no mapa) | `novo materia --dentro <lugar> --interior <id>` | `lugar: { nome, artigo, dentro, interior }` na matéria + `Reino.registrarInterior({ lugar: 'materia:<m>', entrada: true })` no prédio anfitrião | `mundo/mapa.js`, `ui/lugares.js`, `motor/cena.js` | `contratos/conteudo.md` §2 item 7 |
| Matéria / sala | `novo materia`, `novo sala` (sala do 4º bimestre: `npm run novo -- sala <matéria do 4º bim> <id>`) | `Reino.registrarMateria` / `Reino.registrarSala` em `jogo/js/conteudo/materias/<m>/` | telas e desafios | `materia-nova.md`; 4º bim: `sala-4bim.md` |
| Prova | `novo prova` | `Reino.registrarProva` (acessórios com `desenho` e `icone` inline) em `jogo/js/conteudo/provas/` | Escola, `arte/pixelart-unicornio-moldes.js`, `arte/icones/` | `prova-nova.md` |
| Personagem | `novo personagem` | `Reino.registrarPersonagem` (com o perfil de voz) em `jogo/js/interiores/<p>/personagens.js` | `personagens/elenco.js`, `nucleo/config.js` | `personagem-novo.md` |
| Personagem feito em paralelo (plano) | `novo reserva`, depois `novo personagem` | `Reino.reservarPersonagem` em `<p>/reservas.js` (contrato: nome, gênero, idade, voz, vaga) + só o sprite no `personagens.js` | o `<p>/reservas.js` (nas frentes) | `contratos/plano-paralelo.md` |
| Enfeite / comida | — | `Reino.LojaItens` (`jogo/js/conteudo/loja-itens.js`) | telas da Loja e Pet Shop | `enfeite-novo.md`, `comida-nova.md` |
| Música | — | `jogo/js/sistemas/musicas-faixas.js` | `musicas.js` | `musica-nova.md` |
| Fala | — | dados do dono (`falas.js` do prédio, `falas()` do módulo) | `sistemas/falas.js` | `fala-nova-e-vozes.md` |
| Tipo de desafio (ex.: conta armada) | `novo desafio` | `Reino.registrarTipoDesafio` em `jogo/js/atividades/desafios/<tipo>.js` (tela, pontos, textos, voz, validador) | `atividades/desafios.js`, `atividades/provas.js`, `sistemas/falas.js`, `validar-conteudo.js` | `desafio-novo.md` |
| Ícone de emoji novo | — | `Reino.registrarIcones({ '<emoji>': { n, p, d } })` num arquivo da pasta da feature | `arte/icones/<lote>.js` | `jogo/js/CLAUDE.md` (Arte) |
| Ação de NPC de um sistema | `novo sistema` | `acoes: { <tipo>: fn }` no `Reino.registrarModulo` | `personagens/npcs-conversa.js` | `cena-e-motor.md` §14 |
| Botão no HUD | — | `UI.registrarBotaoHud({ id, ordem, criar, pintar?, eventos? })` num arquivo da feature (ex.: `ui/hud-fotos.js`) | `ui/hud.js` | `jogo/js/ui/CLAUDE.md` |
| Saber onde o jogo roda (`file:`, https, toque, compartilhar, baixar) | — | `Reino.ambiente` (`jogo/js/nucleo/ambiente.js`), funções avaliadas na hora | checar `window.claude`/`navigator.share` de novo | `fotos.md` |
| Falas de um prédio em vários arquivos | `novo predio` | `Reino.falasDoPredio(id, parte)` (`nucleo/registros.js`) em cada parte | `Reino.FALAS_INTERIORES.<p> = …` | `npcs-e-dialogo.md` §10.5 |
| Kit de móveis da casa do jogador | — | `Reino.registrarKitCasa` em `jogo/js/conteudo/casa/kits-*.js` + os objetos em `jogo/js/interiores/casa/moveis-<kit>.js` (`Reino.CasaArte.virado`) | o sistema e as telas da casa | `contratos/casa.md` §3 e §5 |
| Móvel avulso da casa (um à escolha por sala feita) | — | `Reino.registrarMovelCasa` em `jogo/js/conteudo/casa/moveis-salas.js` + o objeto `casa-movel-<id>` em `jogo/js/interiores/casa/moveis-salas-<cômodo>.js` | o sistema e as telas da casa | `contratos/casa.md` §12 |
| Loja de cidade (itens, carrinho, pergunta de entrada) | — | `Reino.LojaCidade` em `jogo/js/sistemas/loja-cidade.js` + itens/decor em `jogo/js/conteudo/itens/loja-cidade.js` e `conteudo/casa/loja-decoracao.js` | as telas das lojas antigas | `contratos/cidade-nova.md` |
| Andar novo com escadas | — | `escadas: [{ x, y, para, chegar, olhar, sentido }]` com par no outro andar (sem `chegada`) | arquivos de coordenação entre andares | `interiores.md` §3.1 |

Conferir enquanto constrói e no fim: `jogo/ferramentas/CLAUDE.md` (Conferir enquanto constrói).

## 6. Ciclo de um quadro (`jogo/js/motor/laco.js`)
`laco(t)` roda a cada `requestAnimationFrame`:
1. `dt` limitado a 50 ms. Parado se o jogo não começou ou há tela DOM aberta (`V.pausado`).
2. `Reino.Cena.bloqueado()` (transição, diálogo, atividade): ela não anda. Senão, setas → `Jogador.atualizar`
   (pisou em porta/tapete/escada → `Cena.acionar`).
3. `desenhar(t)`:
   1. `animar` = Ajustes → Animações E sem "reduzir movimento" E jogo ativo.
   2. `atualizarCamera()` (`motor/camera.js`).
   3. Buffer em px do jogo: `cena.corFundo`, `cena.desenharFundo(bctx, t, animar)`, marcador do toque.
   4. Buffer ampliado no canvas (px da tela), sem suavizar.
   5. `cena.desenharTela(ctx, pintor, t, animar)` (no mapa, vazio).
   6. Itens ordenados por Y: `Jogador.itensDesenho` + `cena.itensDesenho` + `camada.itensDesenho` de cada módulo
      com `camada.ativo()` (ex.: o banho), na ordem de registro.
   7. `cena.desenharSobre` (placas dos cômodos) e `camada.sobre` dos módulos ativos.
   8. Luz (vinheta), íris (`Cena.desenharIris`), tempo do quadro (`Reino.Cena.quadros`).
- Cada parte roda dentro de `seguro()`: um erro de desenho vira um `console.error` (uma vez) e o quadro segue.
- Nada de canvas novo por quadro; o estático é pré-renderizado (`motor/interiores-estatico.js`).

## 7. Objetos internos e a divisão de IIFE
Arquivo grande foi dividido em partes que carregam em sequência; o que era privado vira um objeto INTERNO
(regra: `jogo/js/CLAUDE.md`, Objetos internos). Cada um é criado na primeira parte do arquivo (ou do prédio:
`Reino._predios.<p>`) e usado pelas outras; o cabeçalho de cada arquivo diz de que parte ele é. Para achar todos:
`grep -rnE "\b(Reino|R|PA|Mapa)\._[a-zA-Z]+ = " jogo/js`.

## 8. Eventos (`Reino.EVENTOS`, `jogo/js/nucleo/eventos.js`)
Barramento `Reino.util` (`U.on`, `U.emit`); como usar e criar evento: `jogo/js/CLAUDE.md`. A lista, com a carga,
quem emite e quem ouve, é o comentário de cada constante em `jogo/js/nucleo/eventos.js` (não se copia aqui).

## 9. Arquivos gerados (quais não se abrem: `CLAUDE.md` da raiz)
| Gerado | De onde | Regenerar |
|---|---|---|
| `jogo/index.html` | `jogo/js/manifesto.js` | `npm run index` |
| `jogo/js/voz/*.js` (pacotes de áudio) | falas do jogo + gravações | `npm run vozes` (só quem integra) |
| `jogo/ferramentas/gerado/falas.json` | `Reino.Falas.todas()` | `node jogo/ferramentas/vozes/listar-falas.js` |
| `jogo/ferramentas/gerado/vozes-indice.json`, `vozes-cache/` | gravações (edge-tts) | `npm run vozes` |
