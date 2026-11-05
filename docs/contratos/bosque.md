# Bosque dos Fantasmas (portal no mapa, combate e perguntas)

Pedido: `pedidos/2026-11-05-portal-fantasmas.md`; ajuste: `pedidos/2026-11-05-bosque-mosca-bau.md`. Um portal
brilhando entre as árvores à direita da Minha Casa leva a um bosque de céu aberto onde ela vence fantasmas fofos e
moscas feias com uma espada. A cada 10 inimigos mortos abre uma pergunta (a mosca conta 2); a cada 30, o nível. A
pergunta certa dá 1 estrela e a Aura; o nível dá um ponto de habilidade. Os dois prêmios trazem um móvel surpresa
para a casa num baú que ela toca para abrir. Errar, fechar ou desmaiar não tira nada.

## Índice
1. Onde está no código · 2. Ids e prefixos · 3. Números · 4. Save · 5. API · 6. Falas e vozes · 7. Fluxo ·
8. Testes

## 1. Onde está no código
| Parte | Arquivo |
|---|---|
| números | `Reino.config.fantasmas` em `js/nucleo/config.js` |
| evento | `Reino.EVENTOS.BOSQUE` em `js/nucleo/eventos.js` |
| fator de velocidade | `Jogador.registrarFatorVelocidade(fn)` (`cena-e-motor.md` §10) |
| saída desenhada pelo fundo | `I.FUNDOS[id].saida(ctx, px, py)` (`interiores.md` §3, `fundo`) |
| o portal no mapa | `js/interiores/bosque/lugar.js` (lugar), `fora.js` (desenho), `icones.js` (👻 🗡 🌀) |
| o interior | `js/interiores/bosque/bosque.js`, `fundo.js`, `objetos.js`, `objetos-2.js`, `falas.js` |
| regras e save | `js/sistemas/bosque.js` (`Reino.Bosque`, módulo `'bosque'`, `node: true`) |
| combate e desenho | `js/sistemas/bosque-combate.js` (`Reino.BosqueCombate`, módulo `'bosque-combate'` com `camada`), `bosque-desenho.js` |
| ataque por alvo (clicar no inimigo) | `js/sistemas/bosque-alvo.js` (módulo `'bosque-alvo'`; estende `Reino.BosqueCombate`) |
| falas do Claude | `js/sistemas/bosque-falas.js` (`Reino.BosqueFalas`, módulo `'bosque-falas'`, `node: true`) |
| telas e HUD | `js/ui/bosque-hud.js`, `bosque-pergunta.js`, `bosque-nivel.js`, `bosque-bau.js`, `css/ui-bosque.css` |
| móvel surpresa | `js/sistemas/casa-moveis.js` (`CasaMoveis.presente`/`guardar`), `js/ui/bosque-bau.js` (`UI.capaCasa`, de `ui/casa-kits.js`; `casa.md` §12) |

Manifesto: `sistemas/bosque-falas|bosque|bosque-combate|bosque-alvo|bosque-desenho` logo depois de
`sistemas/et-companheiro-desenho.js`; `ui/bosque-hud`, `ui/bosque-nivel`, `ui/bosque-bau`, `ui/bosque-pergunta`
depois de `ui/casa-moveis.js`; `css/ui-bosque.css` depois de `css/ui-casa-moveis.css`; `interiores/bosque/*` depois de
`interiores/casa/lugar.js` e antes de `interiores/padrao.js` (o Bosque é o último prédio: as fotos das outras cenas do
e2e não mudam), na ordem `icones`, `fundo`, `falas`, `objetos`, `objetos-2`, `bosque`, `fora`, `lugar`.

## 2. Ids e prefixos
- Lugar `bosque` ("Bosque dos Fantasmas"), sprite `portal-bosque`, rect 1×1 em (53, 38) (a porta é o próprio tile),
  `caminho: [[50,39],[51,39],[52,39],[53,39]]` (as pedras da casa seguindo para leste), `novidade: { desde:
  '2026-11-05', interior: 'bosque' }`, menu 👻.
- Interior `bosque` (`lugar: 'bosque'`, `entrada: true`, `pacote: 'interior-bosque'`, `fundo: 'bosque'`): 56 × 44
  tiles, um cômodo `{ x: 1, y: 1, w: 54, h: 40 }`, saída (28, 40) (o portal de volta), spawn (28, 39).
- Piso `bosque-grama`, parede `bosque-copas`, objetos `bosque-<nome>`.
- Inimigos: tipos `facil` (lilás), `medio` (azul-turquesa), `dificil` (rosa-vinho com coroa) e `mosca` (verde-escura
  feia, com asas e olhos vermelhos); id `f<n>`.
- Ocupação da cena: `'bosque-desmaio'`. Chaves do móvel surpresa: `'bosque:' + n` (nível n) e `'bosque:p' + bloco`
  (pergunta do bloco, bloco = 1, 2, 3…); as duas ficam fora da fila das salas (`CasaMoveis.presente`).
- Zonas (fileiras do interior, em `config.fantasmas.zonas`): fáceis embaixo, perto do spawn; médios no meio;
  difíceis e moscas em cima. Zona segura de `zonaSegura` tiles em volta do spawn: sem inimigo, e com uma barreira de
  `raioToque` em volta dela (`bosque-combate.js:prender`): o inimigo fica fora da borda, então o toque nunca chega a
  quem está lá dentro.

## 3. Números
Todos em `Reino.config.fantasmas` (cada um comentado lá): `perguntasPorBloco` (10 inimigos mortos por pergunta),
`mortosPorNivel` (30 por nível), nível máximo, estrelas por acerto, tipos de pergunta, vida/dano/velocidade do jogador
por ponto, vida/força/velocidade/mortos de cada tipo de inimigo (a mosca conta 2), quantos de cada, zonas, zona
segura, visão, coleira, raio do toque e os tempos (`recuoMs`, `voltaMs`, `vencidoMs`, `vencidoPresoMs`, `desmaioMs`).
`acertosPorNivel` fica só como legado da migração do save (§4). Nenhum número desses fica no código nem neste doc.

## 4. Save (`save-e-mescla.md` §11)
- `bosque: { acertos, espada, vencidos, mortos, perguntasFeitas, migrado }`, `mesclar: 'contadores'` (`espada` = 0 ou 1;
  `mortos` = placar de inimigos mortos, a mosca conta 2; `perguntasFeitas` = blocos de 10 já consumidos; `migrado` = 1
  é a marca da migração do save antigo, mas NÃO é porteira: o piso do nível antigo é reaplicado nas leituras, porque a
  mescla pode trazer acertos antigos com mortos novos; num save novo sem nível antigo ele fica 1 na memória e só vai ao
  arquivo na primeira gravação de verdade).
- `bosquePontos: { '<nível>': { h: 'forca'|'vida'|'velocidade', em } }`, `mesclar: 'carimbo'`.
- Os dois: `novoCiclo: 'mantem'`, `copiaSeguranca: true`. Registrados em `sistemas/bosque.js`.
- Derivados (nunca guardados): nível = `min(nivelMax, 1 + floor(mortos / mortosPorNivel))`; `xp()` = mortos até o
  próximo nível (`mortos % mortosPorNivel` de `mortosPorNivel`, cheio no máximo); `perguntasPendentes()` =
  `max(0, floor(mortos / perguntasPorBloco) - perguntasFeitas)`; `proximaPergunta()` = `mortos % perguntasPorBloco`
  de `perguntasPorBloco`; pontos = escolhas válidas com nível ≤ o atual; pendentes = níveis 2..atual sem escolha.
- Migração do save antigo (idempotente e só para cima; o `migrado` é a marca, não a porteira): o nível antigo era
  `1 + floor(acertos / acertosPorNivel)`; o trecho legado é `max(0, nívelAntigo - 1) * mortosPorNivel`. Se ele passa
  dos `mortos`, sobe `mortos` até ele e `perguntasFeitas` até `floor(legado / perguntasPorBloco)`; se não passa, nada
  muda (as perguntas dos mortos novos continuam pendentes). Assim o nível que ela já tinha é mantido, inclusive quando
  a mescla traz `acertos` antigos para um aparelho com `migrado` 1 e `mortos` 0, e não abre pergunta nem baú
  retroativo. Roda no `iniciar` do módulo `'bosque'` e, por segurança, nas leituras (`nivel`, `xp`,
  `perguntasPendentes`, `abater`, `acertou`, `errou`, `consumirPergunta`).
- Móvel surpresa: `CasaMoveis.presente(chave)` grava o móvel em `casaMoveis` (fora de `pendentes`, sem fila de sala)
  e devolve `{ chave, movel }`; se a chave já tem móvel válido, devolve o mesmo. O sorteio é determinístico (semente =
  chave + `casaBau.em` + quantidade de móveis), prefere os móveis que ela ainda não tem e, com todos, dá mais um igual
  ("Mais um!"). Sem casa, o móvel fica guardado e aparece quando ela ganhar a casa.
  O nível grava `bosque:<nível>` no abate (antes do baú abrir); a pergunta certa grava `bosque:p<bloco>` em `acertou`.
  Níveis antigos ainda com o ponto pendente ganham o baú na hora de pôr o ponto, via `presente`, só se a chave ainda
  não tiver móvel (nunca uma fila retroativa).

## 5. API
```
Reino.Bosque (sistemas/bosque.js)
  acertos() mortos() nivel() xp() → { n, de, maximo }      perguntasPendentes() proximaPergunta() → { n, de }
  temEspada() ganharEspada() → bool (true só na 1ª vez)
  pontos() → { forca, vida, velocidade }  pontosPendentes() → [n]  porPonto(n, 'forca'|'vida'|'velocidade') → bool
  dano() vidaMax() fatorVelocidade()               pergunta() → { materia, sala, desafio } | null
  abater(tipo) → { mortos, perguntas, subiu: n | null, premioNivel: { chave, movel } | null }
  acertou(materiaId) → { estrelas, nivel, presente: { chave, movel } | null }   errou(materiaId)
  consumirPergunta() → bool   chaveMovel(n) → 'bosque:' + n
Reino.CasaMoveis (sistemas/casa-moveis.js; casa.md §12)
  presente(chave) → { chave, movel } | null   guardar(chave, movelId) → bool   escolhida(chave) → bool
Reino.BosqueCombate (sistemas/bosque-combate.js)
  ativo() vida() → { n, max }  atacar() → bool  fantasmas() → [{ id, tipo, x, y, vida, max, estado }]
  devolver(id) reiniciar()  passo(estado, dt, jogador) (puro, testável no Node)
  mirar(id) → bool  alvo() → id | null  pararAlvo()  fantasmaNaTela(clientX, clientY) → { id, tipo } | null
  (bosque-alvo.js; puros: fantasmaEm(est, wx, wy), mirarNo(est, id), pararNo(est), seguirAlvo(est, j))
Reino.EVENTOS.BOSQUE  carga { tipo: 'vida' (+ n, max) | 'golpe' (+ acertou) | 'vencido' (+ id, fantasma = o tipo)
                      | 'abate' (+ mortos, subiu) | 'desmaio' | 'acerto' (+ materia, nivel, presente) | 'ponto' (+ nivel, h) }
Reino.UI (ui/bosque-*.js)
  telaEspadaBosque() → P   perguntaFantasma(f) → P<'certo'|'errado'|'depois'>   telaBosque()
  subirNivelBosque(n, falas?, premio?) → P<'forca'|'vida'|'velocidade'|null>
  bauBosque({ chave, movel, titulo }) → P   dicaEspadaBosque() → texto
Jogador.registrarFatorVelocidade(fn)   // Reino.Bosque registra fn = no 'bosque' ? fatorVelocidade() : 1
I.FUNDOS.bosque = { cor, desenhar(ctx, w, h), saida(ctx, px, py) }   // saida = o portal de volta
```
- Pergunta (pedido do Leandro, 05/11): a pergunta só aparece a cada `perguntasPorBloco` inimigos mortos (a mosca conta
  2). A lista é sorteada UNIFORMEMENTE entre todas as perguntas do bimestre em curso (`Reino.Bimestres.atual`: só as
  matérias desse bimestre e não arquivadas), valendo sala feita ou não. Cada pergunta tem a mesma chance: não se
  sorteia a matéria e depois a sala. Todo tipo da sala, menos `config.fantasmas.perguntaForaTipos` (cada um com o
  motivo no config: só os sem resposta certa ou que enganam na tentativa única), o `escrever` sem `chaves` e a
  pergunta pessoal (`livre: true`). Sem fila e sem evitar repetição. Sorteio pela chave
  (`U.sortear(lista, 'bosque:pergunta')`), para o modo congelado. `Bosque.perguntas()` é a lista.
- A tela é a do `Desafios.render` no modo `'prova'` (uma tentativa, sem o texto ou desenho guardado da sala) e confere
  com `D.pontuar(d, ctrl.valor()) === 1`; nada do `ctrl.conferir` da sala (que grava a produção). Respondida: o
  controle trava (`ctrl.travado`, caixas só de leitura). Errou: `ctrl.revelar` quando o tipo tem; os outros ficam como
  ela deixou e a certa vem por escrito (`D.linhaCerta`). Painel de 600 px para escolha, V ou F e várias; 900 px para os
  outros tipos (`css/ui-bosque.css`).
- A pergunta mostra a página do livro da sala (`d.livro`) aberta acima do enunciado, "Leia antes"
  (`ui/bosque-pergunta.js:contexto`, `UI.desenharCarta`); o texto de apoio e a figura vêm no card do `Desafios.render`.
- Acerto: `P.ganharEstrelas(estrelasPorAcerto)`, `P.salvar()`, `Aura.contar([true], materia)`, consome UMA pergunta
  pendente (`perguntasFeitas++`) e grava o móvel `bosque:p<bloco>` (o `presente` do evento `acerto`). Erro ou fechar:
  consome a pergunta pendente, conta o vencido e só `Aura.contar([false], materia)`; não abre baú.
- Sem pergunta no bimestre: `Bosque.pergunta()` é null e o fluxo chama `Bosque.consumirPergunta()` (consome a pendente
  sem tela); a recuperação na entrada também faz isso, para não repetir em toda visita.
- Combate: a simulação avança em `camada.itensDesenho` (o laço não tem `atualizar`); congela com
  `Reino.Cena.bloqueado()` ou tela aberta; `dt` do `t`, no máximo 50 ms; sorteios com `Reino.Desenho.rng(semente)`.
  Os 4 tipos nascem por `config.fantasmas.quantos`/`zonas` (o laço é genérico).
- Ataque: botão da espada (`UI.registrarBotaoHud`, redondo, embaixo à direita), Espaço ou Enter só quando: cena
  `bosque`, não bloqueada, sem tela, foco fora de controle e sem `alvoPerto` (`bosque-combate.js:ligar`). Sem a espada
  `atacar()` devolve false. Chip e botão escondidos fora do Bosque (e o botão, sem a espada).
- Segurar o botão da espada (dedo ou mouse) repete o golpe a cada `jogador.recargaMs`, como segurar o Espaço; para ao
  soltar, ao abrir tela e ao sair do Bosque (`ui/bosque-hud.js:botaoEspada`).
- Clicar ou tocar num inimigo (que leva golpe, com a espada) ataca sozinho (`bosque-alvo.js`): ela anda até `PERTO` do
  `alcance` (refaz o caminho quando ele muda de tile; no tile dele ou ao lado, reto), vira para ele e golpeia a cada
  `recargaMs` pelo `golpear`, seguindo quem foge, até ele sumir (vencido, desmaio). Param: clique ou toque no canvas
  fora de um inimigo, tecla de andar (setas, WASD), tela aberta e troca de cena. O toque no inimigo é pego na captura
  do `pointerdown` da janela, antes do `motor/entrada.js`, e só no Bosque (fora dele nada muda). Mouse e dedo na
  metade direita atacam no `pointerdown` e o motor não o vê; na metade esquerda (a do thumbstick) o dedo só ataca ao
  soltar, num toque curto, e o que andar mais que o `limiarToque` do motor é repassado a ele (o arrasto). O alvo fica
  em `est.alvo`; o quadro do combate chama `S.quadro(est, j)` depois do passo.
- Cursor: com o mouse em cima de um inimigo, o canvas usa o 🗡 em pixel art (data URL feita uma vez) com o ponto na
  ponta da lâmina; trocado só no `pointermove` (`ui/bosque-hud.js`), de volta ao normal fora dele, com tela e fora do
  Bosque.
- A espada na mão segue a grade de pixels do sprite dela (`J.silhueta`: borda esquerda e pés, com o trote), a px
  inteiros do jogo: arredondada sozinha ela tremia andando (`bosque-desenho.js:desenharEspada`).
- Dica do botão (só na tela, sem voz), até o 1º golpe da sessão: `UI.dicaEspadaBosque()` muda com o toque
  (`Reino.ambiente.toque()`): em tela de toque só "Toque na espada para atacar."; senão também fala do Espaço.
- Baú do prêmio (`UI.bauBosque`, `ui/bosque-bau.js`): tela cheia com o baú fechado ("Toque no baú! 🎁"); o toque
  treme, abre, sobe a luz e os brilhos e mostra o cartão com a capa do móvel (`UI.capaCasa`), o nome, o cômodo e
  "Mais um!" quando repetido. "Fechar ✨" fecha; Esc antes de abrir abre o baú, depois fecha. Sem casa, a nota "Ele fica
  guardado até você ganhar a sua casa." aparece na tela. O móvel já está gravado antes (fechar o jogo não perde nada).
  Sem Animações: os mesmos passos, parados. Sons: `estrela`, `rachar`, `chocar`.
- HUD e painel: o chip mostra vida, "Nv N", a barra de `mortosPorNivel` e a linha 👻 `n/perguntasPorBloco` da próxima
  pergunta (mais o selo de ponto pendente); o painel mostra "Inimigos mortos: N" e "Próxima pergunta: n/10".
- Vencido preso: `vencidoPresoMs` sem a UI devolver o inimigo (a pergunta não abriu) o faz voltar a contar `voltaMs`;
  vale ao entrar no Bosque vindo de fora (`bosque-combate.js:soltarPresos`).

## 6. Falas e vozes
- Claude: `Reino.BosqueFalas` (`sistemas/bosque-falas.js`), voz `claude`, pacote `interior-bosque`
  (`som-musica-e-voz.md` §4). Chaves: `espada`, `vencido`, `acerto` (uma das duas, sorteada), `erro`, `nivel`,
  `ponto.forca|vida|velocidade`, `semCasa`, `desmaio`. Nada de número na fala.
- O aviso de "sem casa" agora é só a nota na tela do baú (§5); o texto `semCasa` do pacote não é mais falado pelo
  nível, e o baú não inventa fala nem voz.
- Objetos do Bosque: `interiores/bosque/falas.js` (`Reino.falasDoPredio('bosque', …)`), mesmo pacote.
- Só na tela (não falado): a dica da espada (§5) e os textos do baú do prêmio ("Toque no baú! 🎁", "Fechar ✨", a nota).

## 7. Fluxo
Quem abre cada tela e quando:
| Tela | Quem abre | Quando |
|---|---|---|
| `telaEspadaBosque` | `ui/bosque-nivel.js` (ouve `EV.TRANSICAO`) | fim da íris de entrada no Bosque, se `!temEspada()`, sem tela nem cena ocupada; nunca no modo congelado. `ganharEspada()` roda ao abrir |
| `perguntaFantasma` | `ui/bosque-pergunta.js` (ouve `BOSQUE` `vencido`) | um por vez, em fila; só quando o abate fechou um bloco de 10 (ou é a pergunta pendente recuperada) e `Bosque.perguntasPendentes() > 0`; espera outra tela fechar (`EV.TELAS`) |
| `bauBosque` | `perguntaFantasma` (acerto) e `UI.subirNivelBosque` (nível) | o prêmio de móvel, depois da pergunta ou do ponto; o móvel já foi gravado |
| `subirNivelBosque` | `ui/bosque-pergunta.js` (a fila, quando `abate.subiu`) e `telaBosque` (botão "Pôr o ponto", pendentes) | nível novo ou ponto pendente; depois do ponto (ou "Depois"/Esc), o baú do nível |
| `telaBosque` | chip do HUD (`ui/bosque-hud.js`) | toque no chip, só no Bosque e sem outra tela |

1. Entrar: pisar ou tocar o portal → íris → interior `bosque` (tela da espada na 1ª vez). Com pergunta pendente
   (fechou o jogo no meio), ela é recuperada com `id` null ao entrar e quando não há tela (com a espada e dentro do
   Bosque).
2. Inimigo vencido: `bosque-combate.js:passo` emite `BOSQUE { tipo: 'vencido', id, fantasma }` (`fantasma` = o tipo)
   → a UI chama `Bosque.abater(fantasma)` (o placar sobe; a mosca conta 2), enfileira `{ id, abate }` e processa um
   por vez: pergunta (se o bloco fechou) → `BosqueCombate.devolver(id)` (ele volta depois de `voltaMs`) → nível (se
   `abate.subiu`). Fechar a pergunta sem responder conta como erro.
3. Pergunta certa: estrela, Aura, consome a pergunta pendente, grava `bosque:p<bloco>` e, ao fechar, o baú do presente.
4. Subiu de nível: `abater` grava `bosque:<nível>`; depois da pergunta, `subirNivelBosque(n, undefined, premioNivel)`
   (3 cartões; "Depois"/✕/Esc deixam o ponto pendente, resolve `null`) e, no fim, o baú do nível.
5. Desmaio (vida 0): `Cena.ocupar('bosque-desmaio')` + estrelinhas; o Claude fala `desmaio`;
   `Cena.irPara('bosque', spawn, { x: 0, y: -1 })`; `reiniciar()` (vida cheia). Nada se perde.
6. Sair: o portal de volta (saída) leva ao mapa, em (53, 39), ao lado do portal.

## 8. Testes
- `npm run validar` (interiores, conteúdo, ícones), `npm run unidade -- --so 'bosque'`, `npm run ver -- --ir bosque`.
- e2e: `--esperado 'interior-bosque|comodo-bosque-|tela-lugares|^dados/(falas|mapa|interiores|loja|save-estado-novo|save-mescla|npcs-status)\.json$|^vozes\.json$'`.
