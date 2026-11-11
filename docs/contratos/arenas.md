# Arenas (os mapas de luta: o Bosque e os novos)

Pedido do Leandro (05/11/2026): "Crie mais 5 mapas, com monstros mais fortes, portais como o do Bosque, nas bordas da
cidade, cada um com seu nível de dificuldade" e "XP: a pergunta a cada 33,3% do nível". Ajuste do Leandro
(11/11/2026): três portais DENTRO do Bosque, um em cima, um embaixo e um na direita, cada um para um bosque novo com
monstros mais fortes que os de todos os mapas de hoje e o seu nível de dificuldade (§8). Uma arena é um interior de céu
aberto onde ela luta com a espada. O motor do Bosque (combate, HUD, botão da espada, ataque por alvo, desmaio,
perguntas, XP, nível, pontos e baús) vale em toda arena registrada. O placar é UM só para todas (o campo `bosque`,
`bosque.md` §4): nada novo no save por arena.

## Índice
1. As arenas · 2. API · 3. Números · 4. O que vale em toda arena · 5. O que cada frente pode tocar · 6. Como fazer o
mapa `<x>` (modelo: Pântano) · 7. Testes · 8. Os bosques de dentro do Bosque

## 1. As arenas
Do mais fácil ao mais difícil (nível recomendado em `config.arenas.<id>.nivel`; o menu Lugares mostra "Nível
recomendado: N"; sem trava: o inimigo forte já é o desafio):
| # | id (interior, lugar, arena) | nome | portal (rect 1×1) e caminho | prefixo | emoji | estado |
|---|---|---|---|---|---|---|
| 1 | `bosque` | Bosque dos Fantasmas | (53, 38), sudeste, ao lado da Minha Casa | `bosque-` | 👻 | pronto (`bosque.md`) |
| 2 | `pantano` | Pântano das Rãs Resmungonas | (2, 20), oeste, fim da avenida do meio; caminho `[[2,21]]` | `pantano-` | 🐸 | pronto (o modelo) |
| 3 | `gelo` | Montanha Gelada | (11, 3), norte, fim da travessa entre História e Inglês; caminho (11,10)…(11,4) | `gelo-` | 🐧 | mínimo (onda 1) |
| 4 | `dunas` | Dunas dos Escorpiões | (53, 20), leste, fim da avenida do meio; caminho `[[53,21]]` | `dunas-` | 🏜 | mínimo (onda 1) |
| 5 | `cristal` | Caverna de Cristal | (2, 29), oeste, fim da avenida de baixo; caminho `[[2,30]]` | `cristal-` | 💎 | mínimo (onda 1) |
| 6 | `vulcao` | Vulcão dos Dragõezinhos | (53, 10), leste, fim da avenida de cima; caminho `[[53,11]]` | `vulcao-` | 🐉 | mínimo (onda 1) |

- Cada arena tem 4 tipos de inimigo: `facil` (embaixo, perto da entrada), `medio` (no meio), `dificil` (com coroa,
  em cima) e `voador` (em cima, conta 2 no placar como a mosca). No Bosque o 4º é a `mosca`.
- Fixos de toda arena (o motor e os testes contam com eles): interior 56 × 44 tiles, um cômodo
  `{ x: 1, y: 1, w: 54, h: 40 }` (chão nas fileiras 3 a 40), saída (28, 40) = o portal de volta (desenhado pelo
  `I.FUNDOS[id].saida`), spawn (28, 39), zonas de `config.arenas.<id>.zonas` (as mesmas fileiras do Bosque).
  Mudou o tamanho? Mude as zonas no config junto (frente: peça no retorno).
- Ocupação do desmaio `'bosque-desmaio'`; ids dos inimigos `f<n>` (um estado por arena).
- Além dessas 6, três bosques de DENTRO do Bosque (`orvalho`, `neblina`, `lua`; §8) não têm portal no mapa: os portais
  ficam na arena do Bosque e a volta é o portal de cada floresta (sem `saida`, sem lugar no menu Lugares).

## 2. API
```
Reino.registrarArena({ id, nome, curto?, emoji })        motor/interiores-arena.js; id = o do interior; repetido: false
Reino.registrarDesenhoInimigo('<arena>-<tipo>', molde)   molde torto ou repetido: lança erro na carga
  molde = { linhas: [...], paleta: { K: '#3a2446', <letra>: cor }, pisca?: { <i>: 'linha' }, passo?: { <i>: 'linha' },
            flutua?: px (padrão 6; 0 = no chão), balanco?: px (padrão 1,5) }
  linhas de largura igual, até 17 × 20 ('.' = vazio); pisca = olhos fechados; passo = 2º quadro andando (220 ms, só
  com Animações); o branco do golpe e o puf saem sozinhos. Sem molde: o fantasma do tipo (o voador vira a mosca).
Reino.Arenas = { def(id), ids(), cfg(id), desenho(arena, tipo), daCena(cena) }
  cfg(id) = config.fantasmas com config.arenas[id] por cima (jogador sempre o do Bosque); o Bosque = config.fantasmas
Reino.Interiores.arena(op) → { objetos, comodo, spawn, saida, tamanho }   motor/interiores-arena.js (opções no cabeçalho)
  o layout de céu aberto por semente: fixos com fala, enfeites, a mata das bordas, bosquezinhos por zona, bolsões
  fechados e miudezas onde sobra 3×3 vazio (passa no "rico"); nunca sólido na trilha, clareira ou zona segura
Reino.Portal = { criar(cores?), registrar(sprite, cores?), saida(cores?), pedra }   arte/portal.js
  o portal do Bosque em qualquer cor (no mapa, com o brilho animado) e o portal de volta dentro da arena
Reino._predios.bosque.PORTAIS / portalNovo(op)   os portais de dentro do Bosque (§8; interiores/bosque/portais.js)
Reino.Bosque: naArena() arenaAtual() abater(tipo, arena?) xpTotal() curva{…}   (bosque.md §5)
Reino.BosqueCombate: arena() devolver(id, arena?)                              (o resto: bosque.md §5)
Reino.BosqueFalas.de(chave, arena?)   fora do Bosque, as falas sem fantasma (BosqueFalas.arena; nenhuma voz nova)
Reino.EVENTOS.BOSQUE 'vencido' leva `arena`; 'abate' leva `xp`
```

## 3. Números
Tudo em `Reino.config.arenas.<id>` (`js/nucleo/config.js`, comentado): `nivel`, `visao`, `zonas`, `quantos` e,
por tipo, `vida`, `forca`, `velocidade`, `mortos` e `xp`. Crescem de mapa em mapa (o teste confere). O jogador
(vida, dano, velocidade por ponto), a curva de XP (`config.fantasmas.xpNivel`), as perguntas por nível, coleira,
raio do toque, recuo e tempos são os do Bosque (`config.fantasmas`). Nenhum número no código das pastas.

## 4. O que vale em toda arena
- Combate, chip do HUD (vida, nível, barra de XP com as marquinhas dos terços), botão da espada, Espaço/Enter,
  clicar no inimigo, cursor de espada, desmaio (volta ao spawn da arena), a tela da espada na 1ª entrada em
  qualquer arena, a pergunta a cada terço do nível, o nível com o ponto e o baú, o fator de velocidade.
- A pergunta e o painel usam o `emoji` e o `nome` da arena (`telaBosque` com o título dela).
- Falas do Claude fora do Bosque: `BosqueFalas.arena` (as mesmas frases gravadas, sem "fantasma" nem "bosque");
  `bosque-falas.js` as põe também no pacote de voz de cada arena com pacote próprio (o áudio é o mesmo, pelo texto).
- Cada arena tem o seu estado de combate (`S.estados[id]`); sair e voltar põe todos no ninho com vida cheia.
- Água (arena com `agua` no interior, §6.10): ela nada como no lago da cidade, com a espada valendo igual (o golpe só
  olha a posição dela). Os inimigos do chão nascem fora da água e não entram nela (deslizam pela margem; vagando,
  trocam de alvo); o voador (`voador`/`mosca`) passa por cima.

## 5. O que cada frente pode tocar
Frente do mapa `<x>` (gelo, dunas, cristal, vulcao):
- Criar/alterar SÓ `jogo/js/interiores/<x>/**` e as linhas do `<x>` no `jogo/js/manifesto.js` (e `npm run index`);
  um `css/ui-<x>.css` só se precisar (não deve).
- Troca o arquivo mínimo (`lugar.js`, que hoje tem o portal, o lugar e, guardado por `if (!I || !I.arena)`, o
  interior) pelos 5 do modelo: `falas.js`, `objetos.js`, `inimigos.js` (ícone + os 4 desenhos), `<x>.js` (chão, céu
  e o interior) e `lugar.js` (o portal com as cores dela, `if (Reino.Portal) Reino.Portal.registrar(...)`, e o
  `registrarLugar` com o MESMO rect, caminho e menu). O `lugar.js` tem de carregar sozinho (o validador de lugares,
  `validar/lugares-do-mapa.js`, só carrega config, registros e os `lugar.js`). Cinco linhas no manifesto, nunca mais
  (o manifesto tem limite próprio de catálogo, 1200 linhas, em `ferramentas/tamanho.js`).
- NÃO mexe: `rect` e `caminho` do lugar, o id, o tamanho/spawn/saída do interior, `config*.js`, `sistemas/bosque*`,
  `ui/bosque*`, `motor/interiores-arena.js`, `arte/portal.js` nem pasta de outro mapa. Precisa de
  número diferente ou de API nova? Diga no retorno (o orquestrador muda).
- Falas novas de objeto: `falas.js` da pasta, pacote `interior-<x>` (troque o `pacote` do interior para ele) e o
  texto exato no retorno (não grave voz). Sem fala nova, pode ficar no `interior-bosque` com textos do Bosque.
- Emoji novo (menu, pergunta) = ícone na própria pasta (`Reino.registrarIcones`).

## 6. Como fazer o mapa `<x>` (modelo: `jogo/js/interiores/pantano/`)
1. `inimigos.js`, no começo: o emoji do mapa, se ainda não tem desenho (`npm run ver -- --previa icones`).
2. `<x>.js`, a primeira parte: as trilhas (`P.trilha(tx, ty)` em `Reino._predios.<x>`), o piso `<x>-...` (claro: contraste ≥ 2,9 com
   o contorno dela), a parede `<x>-...` e `I.FUNDOS.<x> = { cor, desenhar(ctx, w, h), saida: Reino.Portal.saida({...}) }`.
3. `falas.js`: `Reino.falasDoPredio('<x>', { objetos: { … } })` (até 30 letras por página).
4. `objetos.js` (em duas partes): `I.objeto('<x>-<nome>', …)` com contorno `#3a2446`: altos da mata (`alto`, `topo`),
   pequenos sólidos (topo ≤ 8 para os de bolsão), miudezas não sólidas e os que se tocam (≥ 3, com fala).
5. `inimigos.js`: `Reino.registrarDesenhoInimigo('<x>-facil'|'-medio'|'-dificil'|'-voador', molde)`.
6. `<x>.js`, a segunda parte: `I.arena({ semente, trilha, clareiras, fixos, enfeites, altos, borda, bosques, mata, bolsao, coberto,
   miudos })`, `Reino.registrarArena({ id, nome, curto, emoji })` e `Reino.registrarInterior({ id, lugar: id,
   entrada: true, pacote, fundo: id, tamanho, saida, spawn, comodos: [{ rect: L.comodo, piso, parede }], objetos })`.
7. `lugar.js`: `if (Reino.Portal) Reino.Portal.registrar('portal-<x>', cores)` e o `registrarLugar` que já existe
   (copie do mínimo, sem o interior).
8. Manifesto na ordem `falas, objetos, inimigos, <x>, lugar`, grupo `interiores`, `node: true`, no lugar da linha do
   mínimo; `npm run index`.
9. Conferir: `npm run validar` (17+ tipos, nada de alto cobrindo), `npm run unidade -- --so 'arenas|bosque'`,
   `npm run ver -- --ir <x>` e o combate (`--mudar '{"bosque":{"espada":1}}'`).
10. Água andável (opcional; modelo: as lagoas do Pântano, `pantano/objetos.js`): no `registrarInterior`,
    `agua: { tile(tx, ty) → bool, fundura(wx, wy) → px }` (px para dentro da água DESENHADA; negativo = fora). A
    água é chão andável: nada sólido nem enfeite em cima (no Pântano, cada lagoa é um enfeite plano do tamanho da
    caixa dela, posto antes da mata, com uma clareira em volta), fora da trilha e da zona segura. O desenho da água e
    a `fundura` saem da mesma conta (a linha d'água dela casa com a margem). O resto (nado, corte, respingo) é do
    motor: `cena-e-motor.md` §10. Teste: `testes/unidade/pantano-agua.test.js`.

## 7. Testes
- `testes/unidade/arenas.test.js` (cfg, registro, passo puro numa arena, um estado por arena, o contrato de cada
  arena do jogo), `bosque-xp.test.js` (curva, terços, migração, mescla, XP por arena), `bosque-combate.test.js` e
  `bosque-regras.test.js` (o Bosque igual).
- e2e: o mesmo `--esperado` do Bosque (`bosque.md` §8): `interior-<arena>`/`comodo-<arena>-` (as do Bosque mudam
  com o chip do XP, uma fileira mais baixo, e a câmera acompanha a área útil), `tela-lugares` e os dados `mapa`,
  `interiores`, `falas`, `loja` (config) e `npcs-status`. As fotos do mapa não pegam as bordas (os portais não aparecem).
  Os bosques de dentro (§8) mudam `interior-bosque` e `comodo-bosque-bosque` (os portais e as trilhas novos) e entram
  como `interior-orvalho|neblina|lua`/`comodo-<id>-<id>` nas fotos; os dados que mudam são `interiores` (os 3 defs e
  as escadas do Bosque), `loja` (o config) e `npcs-status` (as chaves novas).

## 8. Os bosques de dentro do Bosque (pedido do Leandro, 11/11/2026)
Três portais dentro da arena do Bosque: um embaixo à esquerda, um na borda direita (abaixo do portal da Vila) e um no
alto, no fim da trilha principal. Cada um leva a um bosque novo, com 4 monstros próprios, mais fortes que os de todas
as arenas do mapa, e o nível de dificuldade na placa do portal e no painel do chip. Nada novo no save: o placar, o XP,
a pergunta, o nível e o baú são os de sempre (§4).
| # | id (interior, arena) | nome | nível | portal no Bosque (tile) | gatilho | volta ao Bosque em | redemoinho |
|---|---|---|---|---|---|---|---|
| 7 | `orvalho` | Bosque do Orvalho | 25 | (9,38), 2×3, embaixo à esquerda | (9,40) | (8,40) | verde-água |
| 8 | `neblina` | Bosque da Neblina | 30 | (53,30), 2×3, borda direita | (53,32) | (52,32) | lilás-cinza |
| 9 | `lua` | Bosque da Lua Cheia | 35 | (27,3), 3×3, no alto | (27,5) | (27,6) | azul-lua |
- Interior de cada um: `lugar: 'bosque'`, `entrada: false`, 56 × 44 tiles, cômodo `{x:1,y:1,w:54,h:40}`, spawn
  (28,39) e SEM `saida`: a volta é o objeto `<id>-portal-volta` em (28,40) com a escada
  `{x:28,y:40, para:'bosque', sentido:'portal', seta:false, chegar:{x:0,y:-1}}` (vindo do Bosque ela chega em
  (28,39), o spawn).
- O desenho do portal no Bosque, a placa "Nv N", a trilha e a limpeza em volta: `interiores/bosque/portais.js`
  (`Reino._predios.bosque.PORTAIS.<id>` e `portalNovo(op)`, chamado pela pasta da floresta DEPOIS do
  `registrarInterior`; ele registra os objetos, tira o que estava no lugar e na trilha nova, emenda a trilha no piso do
  Bosque (o `B.trilha` do `fundo.js`) e preenche com miudezas as janelas 3×3 que abrirem). A escada de ida fica no
  Bosque (`chegar` = onde ela aparece ao voltar); a de volta fica na floresta (pareadas: `interiores.md` §3).
- Falas: as dos objetos são as do Bosque, copiadas (texto igual = áudio igual; pacote `interior-bosque`, sem voz
  nova); as do Claude na arena são as de `BosqueFalas.arena` (sem fantasma, sem bosque).
- Cada pasta nova tem: `falas.js`, `objetos.js` (piso, parede, céu e os objetos-assinatura), `inimigos.js` (o ícone
  da arena e os 4 moldes dos monstros) e `<id>.js` (trilha própria, `Reino.Interiores.arena`, `registrarArena`,
  `registrarInterior` e a chamada `portalNovo`). Modelo: `jogo/js/interiores/pantano/` + os três bosques prontos;
  nenhum `lugar.js` (não é lugar do mapa) e nenhum `fora.js`. Manifesto: grupo `interiores`, `node: true`, no FIM do
  grupo (depois dos outros prédios e antes de `padrao.js`: as fotos das cenas de antes no e2e não mudam de relógio),
  na ordem `falas, objetos, inimigos, <id>`; carregam depois do Bosque, de quem usam o `portalNovo`.
- Números em `config.arenas.<id>`: vida, força, velocidade, mortos, xp, quantos, zonas, `visao` e `nivel`; todos acima
  do `vulcao` por tipo e crescendo entre os três (o teste confere), com o XP para valer a pena.
- O painel do chip (`UI.telaBosque`) mostra "Nível recomendado: N" nas arenas que não são de entrada (as de dentro).
- Zonas e combate: os mesmos do motor (§4), com o desenho próprio de cada tipo (`Reino.registrarDesenhoInimigo` na
  pasta). Desmaio volta ao spawn da própria floresta; a pergunta, o nível e o baú são os de sempre.
