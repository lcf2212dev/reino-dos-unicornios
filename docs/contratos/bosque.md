# Bosque dos Fantasmas (portal no mapa e combate com perguntas)

Pedido: `pedidos/2026-11-05-portal-fantasmas.md`; plano: `pedidos/2026-11-05-portal-fantasmas.plano.md`. Um portal
brilhando entre as árvores à direita da Minha Casa leva a um bosque de céu aberto onde ela vence fantasmas fofos
com uma espada; cada fantasma vencido traz uma pergunta. Acertou: 1 XP e 1 estrela. Errar, fechar ou desmaiar não
tira nada.

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
| ataque por alvo (clicar no fantasma) | `js/sistemas/bosque-alvo.js` (módulo `'bosque-alvo'`; estende `Reino.BosqueCombate`) |
| falas do Claude | `js/sistemas/bosque-falas.js` (`Reino.BosqueFalas`, módulo `'bosque-falas'`, `node: true`) |
| telas e HUD | `js/ui/bosque-hud.js`, `bosque-pergunta.js`, `bosque-nivel.js`, `css/ui-bosque.css` |
| móvel por nível | `js/sistemas/casa-moveis.js`, `js/ui/casa-moveis.js` (`casa.md` §12) |

Manifesto: `sistemas/bosque-falas|bosque|bosque-combate|bosque-alvo|bosque-desenho` logo depois de
`sistemas/et-companheiro-desenho.js`; `ui/bosque-*` depois de `ui/casa-moveis.js`; `css/ui-bosque.css` depois de
`css/ui-casa-moveis.css`; `interiores/bosque/*` depois de `interiores/casa/lugar.js` e antes de `interiores/padrao.js`
(o Bosque é o último prédio: as fotos das outras cenas do e2e não mudam), na ordem `icones`, `fundo`, `falas`,
`objetos`, `objetos-2`, `bosque`, `fora`, `lugar`.

## 2. Ids e prefixos
- Lugar `bosque` ("Bosque dos Fantasmas"), sprite `portal-bosque`, rect 1×1 em (53, 38) (a porta é o próprio tile),
  `caminho: [[50,39],[51,39],[52,39],[53,39]]` (as pedras da casa seguindo para leste), `novidade: { desde:
  '2026-11-05', interior: 'bosque' }`, menu 👻.
- Interior `bosque` (`lugar: 'bosque'`, `entrada: true`, `pacote: 'interior-bosque'`, `fundo: 'bosque'`): 56 × 44
  tiles, um cômodo `{ x: 1, y: 1, w: 54, h: 40 }`, saída (28, 40) (o portal de volta), spawn (28, 39).
- Piso `bosque-grama`, parede `bosque-copas`, objetos `bosque-<nome>`.
- Fantasmas: tipos `facil` (lilás), `medio` (azul-turquesa), `dificil` (rosa-vinho com coroa); id `f<n>`.
- Ocupação da cena: `'bosque-desmaio'`. Chave do móvel por nível: `'bosque:' + n`.
- Zonas (fileiras do interior, em `config.fantasmas.zonas`): fáceis embaixo, perto do spawn; difíceis em cima.
  Zona segura de `zonaSegura` tiles em volta do spawn: sem fantasma, e com uma barreira de `raioToque` em volta dela
  (`bosque-combate.js:prender`): o fantasma fica fora da borda, então o toque nunca chega a quem está lá dentro.

## 3. Números
Todos em `Reino.config.fantasmas` (cada um comentado lá): acertos por nível, nível máximo, estrelas por acerto, tipos
de pergunta, vida/dano/velocidade do jogador por ponto, vida/força/velocidade de cada tipo de fantasma, quantos de
cada, zonas, zona segura, visão, coleira, raio do toque e os tempos (`recuoMs`, `voltaMs`, `vencidoMs`,
`vencidoPresoMs`, `desmaioMs`). Nenhum número desses fica no código nem neste doc.

## 4. Save (`save-e-mescla.md` §11)
- `bosque: { acertos, espada, vencidos }`, `mesclar: 'contadores'` (`espada` = 0 ou 1).
- `bosquePontos: { '<nível>': { h: 'forca'|'vida'|'velocidade', em } }`, `mesclar: 'carimbo'`.
- Os dois: `novoCiclo: 'mantem'`, `copiaSeguranca: true`. Registrados em `sistemas/bosque.js`.
- Derivados (nunca guardados): nível = `min(nivelMax, 1 + floor(acertos / acertosPorNivel))`; pontos = escolhas
  válidas com nível ≤ o atual; pendentes = níveis 2..atual sem escolha.
- Móvel por nível: no `casaMoveis`, chave `bosque:<n>` (`casa.md` §12), da fonte `'bosque'` que `sistemas/bosque.js`
  registra em `CasaMoveis.registrarFonte` (`chaves`, `titulo`, `soNovos: true`). As opções da chave são só os móveis
  avulsos que ela ainda não tem (`casa-moveis.js:opcoes`: sem repetido nem "Mais um!"). `chaves()` só tem o que pode
  virar móvel novo: as dos níveis 2..atual ainda sem móvel, das mais baixas, no máximo tantas quantos móveis lhe
  faltam menos as salas pendentes (`CasaMoveis.salasPendentes()`: a sala oferece os novos primeiro; se ela escolher um
  repetido lá, a chave do nível volta). Com todos, vem vazia e o nível fica sem móvel (nada pendente). Sem casa, fica
  pendente e aparece quando ela ganhar a casa.

## 5. API
```
Reino.Bosque (sistemas/bosque.js)
  acertos() nivel() xp() → { n, de, maximo }       temEspada() ganharEspada() → bool (true só na 1ª vez)
  pontos() → { forca, vida, velocidade }  pontosPendentes() → [n]  porPonto(n, 'forca'|'vida'|'velocidade') → bool
  dano() vidaMax() fatorVelocidade()               pergunta() → { materia, sala, desafio } | null
  acertou(materiaId) → { estrelas, nivel, subiu: n | null }   errou(materiaId)   chaveMovel(n) → 'bosque:' + n
Reino.BosqueCombate (sistemas/bosque-combate.js)
  ativo() vida() → { n, max }  atacar() → bool  fantasmas() → [{ id, tipo, x, y, vida, max, estado }]
  devolver(id) reiniciar()  passo(estado, dt, jogador) (puro, testável no Node)
  mirar(id) → bool  alvo() → id | null  pararAlvo()  fantasmaNaTela(clientX, clientY) → { id, tipo } | null
  (bosque-alvo.js; puros: fantasmaEm(est, wx, wy), mirarNo(est, id), pararNo(est), seguirAlvo(est, j))
Reino.EVENTOS.BOSQUE  carga { tipo: 'vida' (+ n, max) | 'golpe' (+ acertou) | 'vencido' (+ id, fantasma = o tipo) | 'desmaio'
                      | 'acerto' (+ materia, nivel) | 'ponto' (+ nivel, h) }
Reino.UI (ui/bosque-*.js)
  telaEspadaBosque() → P   perguntaFantasma(f) → P<'certo'|'errado'|'depois'>   telaBosque()
  subirNivelBosque(n, falas?) → P<'forca'|'vida'|'velocidade'|null>   dicaEspadaBosque() → texto
Jogador.registrarFatorVelocidade(fn)   // Reino.Bosque registra fn = no 'bosque' ? fatorVelocidade() : 1
I.FUNDOS.bosque = { cor, desenhar(ctx, w, h), saida(ctx, px, py) }   // saida = o portal de volta
```
- Pergunta (pedido do Leandro, 05/11): sorteio UNIFORME entre todas as perguntas do bimestre em curso
  (`Reino.Bimestres.atual`: só as matérias desse bimestre e não arquivadas), valendo sala feita ou não. Cada pergunta
  tem a mesma chance: não se sorteia a matéria e depois a sala. Todo tipo da sala, menos
  `config.fantasmas.perguntaForaTipos` (cada um com o motivo no config: só os sem resposta certa ou que enganam na tentativa única), o `escrever` sem `chaves` e a
  pergunta pessoal (`livre: true`). Sem fila e sem evitar repetição.
  Sorteio pela chave (`U.sortear(lista, 'bosque:pergunta')`), para o modo congelado. `Bosque.perguntas()` é a lista.
- A tela é a do `Desafios.render` no modo `'prova'` (uma tentativa, sem o texto ou desenho guardado da sala) e confere
  com `D.pontuar(d, ctrl.valor()) === 1`; nada do `ctrl.conferir` da sala (que grava a produção). Respondida: o
  controle trava (`ctrl.travado`, caixas só de leitura). Errou: `ctrl.revelar` quando o tipo tem; os outros ficam como
  ela deixou e a certa vem por escrito (`D.linhaCerta`). Painel de 600 px para escolha, V ou F e várias; 900 px para os
  outros tipos (`css/ui-bosque.css`).
- A pergunta mostra a página do livro da sala (`d.livro`) aberta acima do enunciado, "Leia antes"
  (`ui/bosque-pergunta.js:contexto`, `UI.desenharCarta`); o texto de apoio e a figura vêm no card do `Desafios.render`.
- Acerto: `P.ganharEstrelas(estrelasPorAcerto)`, `P.salvar()`, `Aura.contar([true], materia)`. Erro: só
  `Aura.contar([false], materia)`. Uma tentativa por fantasma; fechar a pergunta = erro.
- Combate: a simulação avança em `camada.itensDesenho` (o laço não tem `atualizar`); congela com
  `Reino.Cena.bloqueado()` ou tela aberta; `dt` do `t`, no máximo 50 ms; sorteios com `Reino.Desenho.rng(semente)`.
- Ataque: botão da espada (`UI.registrarBotaoHud`, redondo, embaixo à direita), Espaço ou Enter só quando: cena
  `bosque`, não bloqueada, sem tela, foco fora de controle e sem `alvoPerto` (`bosque-combate.js:ligar`). Sem a espada
  `atacar()` devolve false. Chip e botão escondidos fora do Bosque (e o botão, sem a espada).
- Segurar o botão da espada (dedo ou mouse) repete o golpe a cada `jogador.recargaMs`, como segurar o Espaço; para ao
  soltar, ao abrir tela e ao sair do Bosque (`ui/bosque-hud.js:botaoEspada`).
- Clicar ou tocar num fantasma (que leva golpe, com a espada) ataca sozinho (`bosque-alvo.js`): ela anda até
  `PERTO` do `alcance` (refaz o caminho quando ele muda de tile; no tile dele ou ao lado, reto), vira para ele e
  golpeia a cada `recargaMs` pelo `golpear`, seguindo quem foge, até ele sumir (vencido, desmaio). Param: clique ou
  toque no canvas fora de um fantasma, tecla de andar (setas, WASD), tela aberta e troca de cena. O toque no fantasma
  é pego na captura do `pointerdown` da janela, antes do `motor/entrada.js`, e só no Bosque (fora dele nada muda). Mouse
  e dedo na metade direita atacam no `pointerdown` e o motor não o vê; na metade esquerda (a do thumbstick) o dedo
  só ataca ao soltar, num toque curto, e o que andar mais que o `limiarToque` do motor é repassado a ele (o arrasto). O alvo fica em `est.alvo`; o quadro do combate chama `S.quadro(est, j)` depois do passo.
- Cursor: com o mouse em cima de um fantasma, o canvas usa o 🗡 em pixel art (data URL feita uma vez) com o ponto na
  ponta da lâmina; trocado só no `pointermove` (`ui/bosque-hud.js`), de volta ao normal fora dele, com tela e fora do Bosque.
- A espada na mão segue a grade de pixels do sprite dela (`J.silhueta`: borda esquerda e pés, com o trote), a px
  inteiros do jogo: arredondada sozinha ela tremia andando (`bosque-desenho.js:desenharEspada`).
- Dica do botão (só na tela, sem voz), até o 1º golpe da sessão: `UI.dicaEspadaBosque()` muda com o toque
  (`Reino.ambiente.toque()`): em tela de toque só "Toque na espada para atacar."; senão também fala do Espaço.
- Vencido preso: `vencidoPresoMs` sem a UI devolver o fantasma (a pergunta não abriu) o faz voltar a contar `voltaMs`;
  vale ao entrar no Bosque vindo de fora (`bosque-combate.js:soltarPresos`).

## 6. Falas e vozes
- Claude: `Reino.BosqueFalas` (`sistemas/bosque-falas.js`), voz `claude`, pacote `interior-bosque`
  (`som-musica-e-voz.md` §4). Chaves: `espada`, `vencido`, `acerto` (uma das duas, sorteada), `erro`, `nivel`,
  `ponto.forca|vida|velocidade`, `semCasa`, `desmaio`. Nada de número na fala.
- Objetos do Bosque: `interiores/bosque/falas.js` (`Reino.falasDoPredio('bosque', …)`), mesmo pacote.
- Só na tela (não falado): a dica da espada (§5).

## 7. Fluxo
Quem abre cada tela e quando:
| Tela | Quem abre | Quando |
|---|---|---|
| `telaEspadaBosque` | `ui/bosque-nivel.js` (ouve `EV.TRANSICAO`) | fim da íris de entrada no Bosque, se `!temEspada()`, sem tela nem cena ocupada; nunca no modo congelado. `ganharEspada()` roda ao abrir |
| `perguntaFantasma` | `ui/bosque-pergunta.js` (ouve `BOSQUE` `vencido`) | uma por vez, em fila; espera outra tela fechar (`EV.TELAS`) |
| `subirNivelBosque` | `perguntaFantasma` (ao fechar, se `acertou` devolveu `subiu`) e `telaBosque` (botão "Pôr o ponto", pendentes) | nível novo ou ponto pendente |
| `escolherMovelCasa` | `subirNivelBosque`, depois do ponto | só se `Casa.ganhou()` e a chave `bosque:<n>` ainda pendente; sem casa o Claude fala `semCasa` |
| `telaBosque` | chip do HUD (`ui/bosque-hud.js`) | toque no chip, só no Bosque e sem outra tela |

1. Entrar: pisar ou tocar o portal → íris → interior `bosque` (tela da espada na 1ª vez).
2. Fantasma vencido: `bosque-combate.js:passo` emite `BOSQUE { tipo: 'vencido', id, fantasma }` (`fantasma` = o tipo)
   → a UI abre `perguntaFantasma`, chama `acertou`/`errou` e, ao fechar, `BosqueCombate.devolver(id)` (ele volta
   depois de `voltaMs`). Fechar sem responder conta como erro.
3. Subiu de nível: `subirNivelBosque(n)` (3 cartões; "Depois"/✕/Esc deixam pendente, resolve `null`); depois do
   ponto, o móvel do nível (tabela acima).
4. Desmaio (vida 0): `Cena.ocupar('bosque-desmaio')` + estrelinhas; o Claude fala `desmaio`;
   `Cena.irPara('bosque', spawn, { x: 0, y: -1 })`; `reiniciar()` (vida cheia). Nada se perde.
5. Sair: o portal de volta (saída) leva ao mapa, em (53, 39), ao lado do portal.

## 8. Testes
- `npm run validar` (interiores, conteúdo, ícones), `npm run unidade -- --so 'bosque'`, `npm run ver -- --ir bosque`.
- e2e: `--esperado 'interior-bosque|comodo-bosque-|tela-lugares|^dados/(falas|mapa|interiores|loja|save-estado-novo|save-mescla|npcs-status)\.json$|^vozes\.json$'`.
