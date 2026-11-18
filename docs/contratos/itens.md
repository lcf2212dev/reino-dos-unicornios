# Itens: drops dos monstros, mochila, Baú de Guardados e roupas de aventura
<!-- Onda 0: os arquivos e símbolos citados ainda não existem; a integração tira a marca acima e roda validar-docs. -->

Pedido: `pedidos/2026-11-05-itens.md`; plano: `pedidos/2026-11-05-itens.plano.json`. Os inimigos das arenas (`arenas.md`)
podem deixar cair equipamentos (espada, escudo, capacete, chapéu, armadura, botas), poções de vida, comidinhas do
unicórnio e estrelas. Os itens vão para a Mochila (20 espaços); a casa ganha o Baú de Guardados, sem limite. O que ela
veste aparece no desenho dela e muda a luta (força, proteção, vida, rapidez, sorte). Nada se perde: item que não cabe
vai para o baú, e nenhuma ação apaga sem ela confirmar.

Decisões marcadas "(decidido pelo Claude)" vêm da onda 0 (arquiteto), sem perguntar a ninguém.

## Índice
1. Onde está no código · 2. Nomes e ids · 3. Catálogo · 4. Consumíveis e estrelas · 5. Drops · 6. Mochila ·
7. Baú de Guardados · 8. Vestir (desenho) · 9. Efeito na luta · 10. Save · 11. API e eventos · 12. Números ·
13. Telas e textos · 14. Falas e vozes · 15. Quem mexe em quê · 16. Testes

## 1. Onde está no código
| Parte | Arquivo | Frente |
|---|---|---|
| números | `js/nucleo/config-itens.js` (`Reino.config.itens`, `node: true`, logo depois de `nucleo/config.js`: o `config.js` já tem 394 linhas) | A |
| evento | `Reino.EVENTOS.ITENS` em `js/nucleo/eventos.js` | A |
| catálogo | `js/conteudo/itens/catalogo.js` (`Reino.ItensCatalogo`, dados, `node: true`) | A |
| save e regras | `js/sistemas/itens.js` (`Reino.Itens`, módulo `'itens'`, campo `itens`, `node: true`) | A |
| sorteio do drop | `js/sistemas/itens-drop.js` (`Reino.ItensDrop`, módulo `'itens-drop'`, `node: true`) | A |
| moldes das roupas | `js/conteudo/itens/vestes-a.js`, `vestes-b.js` (`Reino.VESTES`, dados, `node: true`) | B |
| ícones | `js/conteudo/itens/icones-a.js`, `icones-b.js` (`Reino.registrarIcones`, chaves `item:<id>`, dados, `node: true`) | B |
| desenho vestido | `js/arte/itens-vestir.js` (`PA._interno.aplicarVestes`, `PA.espadaItem`, `PA.escudoItem`) + `arte/pixelart-personagens.js` (`PA.mariana`/`PA.montada` aceitam `opcoes.vestes`) + `personagens/jogador-desenho.js` (passa as vestes) | B |
| tela da Mochila, aviso, botão 🎒 | `js/ui/mochila.js` (+ `mochila-item.js` se passar de 400), `js/ui/itens-aviso.js`, `js/ui/hud-mochila.js`, `css/ui-itens.css` | C |
| Baú de Guardados | `js/ui/guardados.js` (tela e ação `guardados`), `js/interiores/casa/guardados.js` (objeto `casa-guardados`), `interiores/casa/casa.js` (o baú no layout) | C |
| item no chão | `js/sistemas/itens-chao.js` (módulo `'itens-chao'` com `camada`) | D |
| poção na luta | `js/ui/itens-pocao.js` (botão do HUD na arena), `css/ui-itens-pocao.css`; `BosqueCombate.curar` | D |
| atributos na luta | `sistemas/bosque.js` (dano, vida, rapidez), `bosque-combate.js` (proteção, `curar`), `bosque-desenho.js` (espada e escudo vestidos) | D |

Manifesto (quem integra junta; cada frente põe as suas linhas na worktree): `nucleo/config-itens` depois de
`nucleo/config`; `conteudo/itens/catalogo|vestes-a|vestes-b|icones-a|icones-b` no fim do grupo `conteudo`;
`arte/itens-vestir` depois de `arte/pixelart-mariana-visual` (e dos moldes de menino); `sistemas/itens|itens-drop`
depois de `sistemas/bosque-desenho`; `sistemas/itens-chao` logo depois deles; `ui/hud-mochila|itens-aviso|mochila|
guardados|itens-pocao` depois de `ui/bosque-pergunta`; `css/ui-itens|ui-itens-pocao` depois de `css/ui-bosque`;
`interiores/casa/guardados` antes de `interiores/casa/casa`.

## 2. Nomes e ids
- Na tela: **Mochila** (o inventário, ícone 🎒, que já tem desenho) e **Baú de Guardados** (o baú da casa, ícone
  `bau-guardados`). Cuidado com os nomes que já existem: `casaBau`/`UI.abrirBauCasa` (o baú que deu a casa),
  `UI.telaBau` (o Baú do Tesouro, moedas), `UI.bauBosque` (o baú do prêmio do Bosque). Por isso o novo é
  `guardados` no código, nunca `bauCasa` (decidido pelo Claude).
- Telas: `UI.telaMochila(opcoes?)`, `UI.telaGuardados()`. Objeto `casa-guardados`; ação `{ tipo: 'guardados' }`.
- Item no catálogo: id `<tipo>-<nome>` (`espada-gelo`, `chapeu-flor`, `pocao-pequena`, `comida-maca`). Ícone
  `item:<id>` (as comidas usam o emoji delas, que já tem desenho).
- Cada item ganho é uma peça com `uid` próprio: `<Date.now() em base 36>-<4 letras base 36>` (ex.: `mhn3k2a1-x7q2`).
  No modo congelado, as 4 letras saem de `Reino.sorteioDaChave('itens:uid')` (não gasta o `Math.random`).
- Slots do corpo (`Reino.Itens.SLOTS`): `espada`, `escudo`, `cabeca`, `armadura`, `calca`, `botas`. A `calca` entrou em
  18/11 com o Conjunto da Pluma (`cursiva.md` §6): tipo e slot `calca`, só a `calca-pluma` existe.
- **Capacete e chapéu dividem o slot `cabeca`** (decidido pelo Claude): os dois ficam no alto da cabeça e não cabem
  juntos no desenho (o chapéu pode subir só 4 px acima dela, `arte.md` §12); a escolha vira um jogo: o capacete
  protege, o chapéu dá sorte e enfeita. No catálogo, `tipo` (`capacete` ou `chapeu`) é a família; `slot` é onde veste.

## 3. Catálogo (31 equipamentos)
Reserva de ids e nomes para as frentes trabalharem juntas. Depois da frente A, a fonte é `conteudo/itens/catalogo.js`
(os números vivem lá e no config; esta tabela não se atualiza, só os ids e nomes valem como contrato).
Atributos: **Força** = `dano` (soma ao dano da espada), **Proteção** = `defesa` (§9), **Vida** = `vida` (vida
máxima), **Rapidez** = `velocidade` (soma ao fator de velocidade nas arenas), **Sorte** = `sorte` (multiplica a chance
de drop, §5). Raridade: `comum`, `raro`, `epico`, `lendario` (as cores de `arte.md` §8).

| id | nome | slot | raridade | atributos | cai em |
|---|---|---|---|---|---|
| `espada-madeira` | Espada de Madeira | espada | comum | Força +1 | bosque |
| `espada-bambu` | Espada de Bambu | espada | comum | Força +2 | pantano |
| `espada-gelo` | Espada de Gelo | espada | raro | Força +4 | gelo |
| `espada-sol` | Espada do Sol | espada | raro | Força +6 | dunas |
| `espada-cristal` | Espada de Cristal | espada | epico | Força +8 | cristal |
| `espada-dragao` | Espada do Dragão | espada | lendario | Força +11 | vulcao |
| `escudo-madeira` | Escudo de Madeira | escudo | comum | Proteção +1 | bosque, pantano |
| `escudo-concha` | Escudo de Concha | escudo | raro | Proteção +2 | pantano, gelo |
| `escudo-neve` | Escudo Floco de Neve | escudo | raro | Proteção +2, Vida +2 | gelo, dunas |
| `escudo-cristal` | Escudo de Cristal | escudo | epico | Proteção +3 | dunas, cristal |
| `escudo-dragao` | Escudo do Dragão | escudo | lendario | Proteção +4 | vulcao |
| `capacete-panela` | Capacete de Panelinha | cabeca | comum | Proteção +1 | bosque, pantano |
| `capacete-cavaleira` | Elmo de Cavaleira | cabeca | raro | Proteção +1, Vida +2 | pantano, gelo |
| `capacete-polar` | Elmo Polar | cabeca | raro | Proteção +2 | gelo, dunas |
| `capacete-cristal` | Elmo de Cristal | cabeca | epico | Proteção +2, Vida +4 | cristal |
| `capacete-dragao` | Elmo do Dragão | cabeca | lendario | Proteção +3, Vida +4 | vulcao |
| `chapeu-flor` | Chapéu de Flor | cabeca | comum | Sorte +10% | bosque, pantano |
| `chapeu-bruxinha` | Chapéu de Bruxinha | cabeca | raro | Sorte +15%, Vida +2 | bosque, cristal |
| `chapeu-gorro` | Gorro de Pompom | cabeca | comum | Sorte +10%, Vida +2 | gelo |
| `chapeu-palha` | Chapéu de Palha | cabeca | comum | Sorte +10%, Rapidez +3% | dunas |
| `chapeu-coroa` | Coroinha Brilhante | cabeca | lendario | Sorte +25%, Vida +4 | cristal, vulcao |
| `armadura-colete` | Colete Acolchoado | armadura | comum | Vida +2 | bosque, pantano |
| `armadura-folhas` | Armadura de Folhas | armadura | comum | Vida +4 | pantano, gelo |
| `armadura-polar` | Casaco Polar | armadura | raro | Vida +6, Proteção +1 | gelo, dunas |
| `armadura-cristal` | Armadura de Cristal | armadura | epico | Vida +8, Proteção +1 | dunas, cristal |
| `armadura-dragao` | Armadura do Dragão | armadura | lendario | Vida +12, Proteção +2 | vulcao |
| `botas-galocha` | Galochas | botas | comum | Rapidez +5% | bosque, pantano |
| `botas-neve` | Botas de Neve | botas | raro | Rapidez +8% | gelo |
| `botas-vento` | Sandálias do Vento | botas | raro | Rapidez +10% | dunas |
| `botas-cristal` | Botas de Cristal | botas | epico | Rapidez +12% | cristal |
| `botas-dragao` | Botas do Dragão | botas | lendario | Rapidez +15% | vulcao |

Quantidades (decidido pelo Claude): 6 espadas (uma por mapa, a arma é o que mais muda a luta), 5 de cada outro tipo
(capacete e chapéu: 5 + 5 no mesmo slot). Cada mapa tem pelo menos um item de cada slot no seu sorteio, e o Vulcão
dá o conjunto "do Dragão" (lendário). Formato de cada definição (`ItensCatalogo.registrar`):
```
{ id, nome, tipo: 'espada'|'escudo'|'capacete'|'chapeu'|'armadura'|'botas'|'pocao'|'comida',
  slot?: 'espada'|'escudo'|'cabeca'|'armadura'|'botas',      // só equipamento
  raridade?: 'comum'|'raro'|'epico'|'lendario',             // só equipamento
  bonus?: { dano?, defesa?, vida?, velocidade?, sorte? },    // só equipamento; velocidade e sorte em fração (0.05 = 5%)
  arenas: ['bosque', …],                                     // ids de Reino.Arenas onde cai
  peso?: n,                                                  // consumíveis: peso no sorteio da categoria
  cura?: 'pequena'|'grande',  comida?: '<id de config.comidas>',
  loja?, preco?,                                             // peça de loja (`vila.md` §4); bolas (`monstros.md`)
  cursiva?: true, artigo?,                                   // peça da letra cursiva: `loja` sem `preco` (`cursiva.md` §6)
  icone: 'item:<id>' | '<emoji da comida>' }
```
Sem espada vestida vale a espada que ela ganhou no Bosque ("Espada do Bosque", Força +0, `bosque.md` §5): ela não é
item, não sai da mão e não precisa de migração.

## 4. Consumíveis e estrelas
- **Poções** (`tipo: 'pocao'`): `pocao-pequena` "Poção de Vida" (cura `config.itens.pocao.pequena` da vida máxima,
  no mínimo `pequenaMin`; cai em todas as arenas) e `pocao-grande` "Poção de Vida Grande" (enche a vida; cai de `gelo`
  em diante). Só se usam numa arena e com a vida abaixo da máxima (fora dela não existe vida de luta).
- **Comidinhas** (`tipo: 'comida'`): uma por comida de `config.comidas` (hoje `comida-cenoura`, `comida-maca`,
  `comida-feno`, `comida-biscoito`, `comida-bolo`), com o nome, o ícone e o `fome` de lá (o catálogo gera; comida nova
  na config ganha item com peso padrão). "Dar ao unicórnio" chama `Cuidados.comerEmCasa(P.montaria(), fome)` (o `enche`
  vale 100): de graça, grava o carimbo de comer, toca `nhac` e a fala `comeu`; barriga cheia (`cheio`) não gasta o item.
  Não vão para a despensa (decidido pelo Claude): a despensa é um contador que só cresce (`compradas`), e somar nele
  em dois aparelhos ao mesmo tempo perde uma comida; na mochila cada comidinha tem o seu `uid` e nada some.
- **Estrelas**: não ocupam a mochila. `P.ganharEstrelas(n)` + `P.salvar()` na hora do drop; `n` por arena em
  `config.itens.drop.estrelas` (de 1 a 3).
- Consumíveis empilham na mochila: até `config.itens.pilha` (10) do mesmo id num espaço (decidido pelo Claude).
  Equipamento não empilha (1 por espaço).

## 5. Drops
Quem decide e grava: `sistemas/itens-drop.js` (A), ouvindo `EVENTOS.BOSQUE` `'vencido'` (`{ id, fantasma, arena }`):
1. Chance do inimigo: `config.itens.drop.chance[tipo]` (por tipo: `facil`, `medio`, `dificil`, `voador`; a `mosca`
   do Bosque vale como `voador`), vezes `1 + sorte` (soma da Sorte vestida), no máximo `chanceMax`. Igual em todas as
   arenas (o que muda de mapa em mapa é o QUE cai, não quanto).
2. Caiu: sorteia a categoria por `config.itens.drop.categorias` (`equip`, `pocao`, `comida`, `estrelas`).
3. `equip`: os equipamentos da arena (`arenas` do catálogo), com peso `config.itens.drop.raridade[raridade]`, vezes
   `repetido` para o que ela já tem vivo (mochila, baú ou vestido): os novos saem mais. `pocao`/`comida`: os da categoria
   que caem na arena, pelo `peso`. `estrelas`: `n` entre o `[min, max]` da arena.
4. Sem pressa: a chance é por inimigo vencido, nunca por tempo; não há sequência, combo nem prazo para pegar.
5. Sorteios por `Itens.rolar(chave)` = `Reino.congelado ? Reino.sorteioDaChave(chave)() : Math.random()`, com as chaves
   `'itens:drop'`, `'itens:categoria'`, `'itens:qual'`, `'itens:estrelas'`, `'itens:uid'` (modo congelado estável; o jogo de
   verdade continua com `Math.random`).
6. O item ganho é gravado NA HORA do drop (`Itens.ganhar`, um `P.salvar()`): fechar o jogo logo depois não perde nada.
   O que aparece no chão é só a animação (abaixo).
7. Para onde vai: cabe na mochila (pilha com espaço ou espaço livre) → `mochila`; não cabe → `bau` (o Baú de Guardados),
   com o aviso "Mochila cheia! Foi para o baú da casa." (decidido pelo Claude: nada fica no chão para se perder, e a
   mochila continua valendo, porque só o que está nela se usa ou se veste fora de casa).
8. Evento `ITENS { tipo: 'ganhou', uid, id, onde, arena, x, y }` (ou `{ tipo: 'estrelas', n, arena, x, y }`), com `x, y` =
   onde o inimigo sumiu (de `BosqueCombate.fantasmas()`, pelo `id`; sem ele, os pés dela).

Animação no chão (D, `sistemas/itens-chao.js`): no `ganhou`/`estrelas` da arena de agora, o ícone do item (ou a estrela)
salta de `x, y`, quica (`chao.quicaMs`), brilha (`chao.brilhaMs`) e voa até ela (`chao.voaMs`), com contorno e sem girar
(`arte.md` §4). O relógio é o do quadro, como o combate: com tela aberta (a pergunta) a animação espera e termina
depois. Sem Animações: aparece parado no chão por `chao.brilhaMs` e some. Sons existentes (`estrela` para estrela;
`selecionar` ou outro já existente para item). Fora da arena (saiu no meio): a animação é esquecida (o item já está salvo).

## 6. Mochila (20 espaços)
- Capacidade `config.itens.mochila` (20) espaços. O que está vestido NÃO ocupa espaço (decidido pelo Claude).
- Arrumação derivada (A, `Itens.mochila()`), na leitura, sem gravar: as peças com `onde: 'mochila'` em ordem de
  (`em`, `uid`) entram uma a uma: consumível entra numa pilha do mesmo id com menos de `pilha`, ou abre espaço;
  equipamento abre espaço. Sem espaço, a peça aparece no baú (derivado, como a peça da casa que perdeu o lugar,
  `casa.md` §6.3). Só acontece depois de uma mescla de dois aparelhos que encheram a mochila ao mesmo tempo: nada some.
- A tela mostra os espaços em ordem de tipo (espadas, escudos, cabeça, armaduras, botas, poções, comidinhas; dentro, raridade
  maior primeiro).
- Ações (tela, §13): **Vestir** (equipamento da mochila; o que estava no slot volta para a mochila no espaço que ele deixou:
  sempre cabe), **Tirar** (vai para a mochila; cheia, vai para o baú, com o aviso), **Usar** (poção, numa arena),
  **Dar ao unicórnio** (comidinha), **Jogar fora** (com pergunta; pilha: "Jogar fora 1" ou "Jogar fora todas").
- Vestir só da mochila (do baú, primeiro ela tira no baú). Sem nível mínimo para vestir.
- O botão 🎒 do HUD só aparece quando ela já tem a espada do Bosque ou algum item (`Itens.temMochila()`): antes
  disso não há como achar item, e as fotos do e2e (save sem espada) não mudam.

## 7. Baú de Guardados (casa, sem limite)
- Objeto `casa-guardados` (2×1 tiles, sólido, interativo, `nome: 'Baú de Guardados'`, `acao: { tipo: 'guardados' }`)
  no térreo, na Sala de Estar, encostado na parede do fundo ao lado da caixa de mudança: `x: 26, y: 3` (`EST.x + 1`).
  Móvel que ela tinha posto em cima desse lugar volta para a caixa sozinho (`casa.md` §6.3): nada some.
- Desenho: baú de madeira com tampa arredondada em degraus, ferragens douradas e um coraçãozinho, contorno `#3a2446`,
  luz de cima e sombra de chão (`arte.md` §13–14), diferente do baú do prêmio do Bosque.
- Tocar abre `UI.telaGuardados()`: duas colunas (Mochila N de 20 | Baú N), tocar numa pilha leva a pilha inteira para o
  outro lado (para a mochila, só o que couber), "Guardar tudo" leva a mochila inteira para o baú (o vestido fica). O baú
  empilha sem limite por id. Também dá para vestir e tirar ali (atalho para a Mochila).
- Sem baú fora de casa: a tela só abre pelo objeto.

## 8. Vestir (como aparece no desenho)
- Cabeça, armadura, calça e botas aparecem em todo lugar onde `personagens/jogador-desenho.js` a desenha: mapa, interiores e
  arenas, a pé e montada, nas 8 direções (as da esquerda, espelhadas). Espada e escudo só nas arenas (decidido pelo
  Claude: a espada já é assim; na cidade ela anda sem armas e o desenho fica limpo).
- Não aparecem (ela "tira para descansar"): poses da casa (`casa-usos`), banho e retrato do balão. A tela da Mochila mostra
  a figura dela vestida (`PA.mariana(ap, false, 0, { vista: 'frente', vestes })`, escala 8, `arte.md` §10.7).
- `PA.mariana(ap, sentada, quadro, { capa, vista, vestes })` e `PA.montada(def, estagio, quadro, ap, { …, vestes })`:
  `vestes = { cabeca?, armadura?, calca?, botas? }` (ids). A chave do cache leva os quatro ids. **Sem `vestes` (ou tudo vazio) o
  desenho sai pixel a pixel igual ao de hoje** (as fotos do e2e não mudam).
- `PA._interno.aplicarVestes(linhas, vista, sentada, vestes) → { linhas, paletaExtra, topo }`, chamado em `PA.mariana`
  depois do `aplicarVisual` (vale para todo corte e roupa do Salão e para os de menino):
  - `cabeca`: matriz por cima da cabeça, com linhas acima dela (`topo` até 4: o canvas cresce para cima, os pés não saem
    do lugar); pode esconder o laço (`B`);
  - `armadura`: troca as letras da roupa (`C`, `D`, `A`, e `W`/`M` dos modelos do Salão) nas linhas do corpo (7+) pelas
    da armadura e pinta detalhes (ombreira, cinto) por cima;
  - `calca` (molde `{ paleta, calca: { perna, sombra } }`, até 4 cores): depois da armadura e antes das botas. Em pé, a
    linha da saia vira quadril, estreito como as pernas (armadura com `saia: true` fica por cima do quadril), e as
    pernas se cobrem até o pé; o pé levantado do passo continua sapato. Sentada: quadril, coxa e perna.
  - `botas`: troca `S` e as 2 últimas linhas das pernas (`K`, `J`) pelas cores das botas (até 6 cores; o cano cobre a calça).
  - `PA.montada` desconta o `topo` no lugar da cavaleira (o chapéu sobe, ela não desce). O resultado de `PA.mariana` e
    `PA.montada` leva `topoExtra` (px acima da cabeça), para a espada e o ícone de fome acharem a mão e a cabeça.
- Molde (`Reino.VESTES[id]`, dados de B; letras minúsculas, que a paleta da Mariana não usa):
  ```
  Reino.VESTES['chapeu-flor'] = {
    paleta: { a: '#…', b: '#…' },
    vistas: { frente: { linhas: [...], x, y }, lado: {…}, costas: {…}, diagFrente: {…}, diagCostas: {…} },  // cabeca (y < 0 = acima)
    troca: { C: 'a', D: 'b', A: 'c' },   // armadura e botas
    esconde: ['B'],                      // letras da Mariana apagadas (o laço sob o chapéu)
  };
  Reino.VESTES['espada-gelo'] = { paleta, linhas: [5 × 11, em pé, como a espada de hoje] };
  Reino.VESTES['escudo-concha'] = { paleta, linhas: [até 8 × 9] };
  ```
  `PA.espadaItem(id)` e `PA.escudoItem(id)` → canvas (cache); id desconhecido ou sem molde = `null` (quem desenha cai na
  espada de hoje e não desenha escudo).
- Alturas (`arte.md` §12): ela a pé 17; com capacete ou chapéu até 21. Ícone 16×16 de cada item (`item:<id>`) para a
  Mochila, o aviso e o chão.
- `jogador-desenho.js` está com 420 linhas (o limite do aviso): a frente B passa `vestes: Reino.Itens ? Itens.vestes() : null`
  sem crescer o arquivo (compacta um comentário, se precisar).

## 9. Efeito na luta (D)
Bônus = soma do que está vestido (`Itens.bonus()`); vale só nas arenas.
- Força: `Bosque.dano()` = o de hoje + `bonus.dano`.
- Vida: `Bosque.vidaMax()` = o de hoje + `bonus.vida`. **Trocar roupa não cura**: quando a vida máxima sobe por item, a
  atual não sobe junto (só o ponto em Vida continua enchendo, como hoje); quando desce, a atual fica no máximo novo.
  (Senão vestir e tirar com a luta pausada encheria a vida de graça.)
- Rapidez: `Bosque.fatorVelocidade()` = 1 + pontos + `bonus.velocidade`, com o mesmo teto `velocidadeMax`.
- Proteção: o toque do inimigo tira `max(1, round(forca × (1 − min(defesaMax, defesa × defesaPorPonto))))` (8% por ponto,
  no máximo 60%; nunca menos de 1).
- Sorte: só na chance do drop (§5).
- `BosqueCombate` relê dano e vida no evento `ITENS` (como no `'ponto'`).
- Poção: `BosqueCombate.curar(n) → { antes, depois } | null` (D) soma `n` à vida da arena de agora, até a máxima, e
  emite `BOSQUE 'vida'`; `null` fora da arena ou desmaiada. `Itens.usar(uid)` (A) chama e só gasta a poção se curou.
  Botão rápido na arena (`ui/itens-pocao.js`, `UI.registrarBotaoHud`, perto do da espada): ícone da poção e quantas há
  na mochila; usa a pequena primeiro; apagado (`aria-disabled`) com a vida cheia ou sem poção; recarga `pocaoRecargaMs`.

## 10. Save (`save-e-mescla.md` §11, campo novo único)
```
itens: { <uid>: { id, onde: 'mochila' | 'bau' | 'vestido' | 'fora', em } }
```
`Reino.Progresso.registrarCampo('itens', { padrao: () => ({}), mesclar: 'carimbo', novoCiclo: 'mantem',
copiaSeguranca: true, limpar, exemplos })`, em `sistemas/itens.js` (`node: true`, carregado antes do `P.carregar`).
1. **Uma peça, uma chave**: cada item ganho nasce com `uid` novo e nunca muda de chave. Mover, vestir, guardar, gastar ou
   jogar fora só troca o `onde` daquela chave, com `em = max(I.agora(), em + 1)` (sempre crescente).
2. **Gasto e jogado fora são lápide** (`onde: 'fora'`): a chave fica, para a mescla não trazer o item de volta do outro
   aparelho. Nunca se apaga uma chave.
3. **Mescla** (`carimbo`): por `uid`, vence o `em` maior; chaves de um lado só entram inteiras. Duas peças nunca viram uma
   (chaves diferentes) e uma peça nunca vira duas (chave única): **não duplica e não some**. Mexidas ao mesmo tempo na
   mesma peça em dois aparelhos: vale a mais nova (ex.: bebeu a poção num e guardou no outro depois: a poção fica no baú;
   o contrário, some como bebida). Drops em dois aparelhos ao mesmo tempo: os dois ficam.
4. **Vestido em conflito** (dois aparelhos vestiram peças diferentes no mesmo slot): na leitura, vale a de (`em`, `uid`)
   maior; as outras contam como `mochila` (derivado, sem gravar). Mochila acima de 20 depois de mescla: §6 (o excesso
   aparece no baú). Nada se grava no carregamento.
5. **Ids desconhecidos** (item de uma versão nova) e `onde` desconhecido ficam guardados sem efeito: não aparecem, não
   contam espaço, não se vestem (`save-e-mescla.md` §6.6). A gravação conserva.
6. **`limpar`**: só chaves seguras (§6.1) no formato do `uid`; registro sem `id` texto ou sem `onde` texto sai (não vem
   de versão nenhuma); `em` estragado vira 0 (a estratégia `carimbo` já cuida do resto).
7. **Novo ciclo** mantém (itens são como estrelas e unicórnios); **Apagar tudo** zera (padrão). **Cópia `-novidades`**:
   sim (`copiaSeguranca: true`), devolvida pela mesma regra da mescla.
8. **Save antigo** sem o campo: `{}` = mochila e baú vazios, nada vestido (vale a Espada do Bosque). Nenhuma migração e
   nenhuma gravação no carregamento. Um aparelho da versão antiga recebe e devolve o campo intacto (§4.4.1).
9. Estrelas do drop: `P.ganharEstrelas` (o campo `estrelas` de sempre). Comidinha dada: `Cuidados.comerEmCasa` (o campo
   `cuidados` de sempre). Nenhum outro campo novo; nada derivado guardado solto (§2.4).
10. Tamanho: ~45 bytes por peça, lápides incluídas (estimativa: ~16 drops a cada 100 inimigos; 2.000 peças ≈ 90 KB num
    ano de muito jogo). Limite conhecido, aceito; compactar lápides fica para depois e só com regra nova aqui.
11. Teste com dois aparelhos (versão antiga do commit base e nova, num `vm` separado, `save-e-mescla.md` §10) em
    `testes/unidade/itens-save.test.js`; o contrato genérico (`save-campos.test.js`) pega o campo sozinho.

## 11. API e eventos
```
Reino.ItensCatalogo (conteudo/itens/catalogo.js; node: true)
  registrar(def)  def(id) → def | null  todos() → [def]  daArena(arena, tipo?) → [def]
  equipamentos() consumiveis()  NOMES_RARIDADE: { comum: 'Comum', raro: 'Raro', epico: 'Épico', lendario: 'Lendário' }
Reino.Itens (sistemas/itens.js; node: true)
  SLOTS  CAPACIDADE()  def(id)  rolar(chave) → 0..1
  pecas() → [{ uid, id, def, onde }]                // vivas e conhecidas, `onde` já resolvido (§6, §10.4)
  mochila() → [{ id, def, uids, qtd }]              // os espaços, em ordem de tela
  espacos() → { usados, total }   cabe(id) → bool   temMochila() → bool
  bau() → [{ id, def, uids, qtd }]
  vestido() → { espada, escudo, cabeca, armadura, calca, botas: { uid, id, def } | null }
  vestes() → { cabeca, armadura, calca, botas, escudo, espada: id | null }   // memorizado: pode ser chamado a cada quadro
  bonus() → { dano, defesa, vida, velocidade, sorte }
  ganhar(id, info?) → { uid, onde: 'mochila' | 'bau' } | null       // grava; emite 'ganhou'
  vestir(uid) → bool   tirar(slot) → { ok, onde }   guardar(uid) → bool   retirar(uid) → bool (false: não cabe)
  usar(uid) → { ok: true, efeito } | { ok: false, motivo: 'fora-arena' | 'vida-cheia' | 'sem-uni' | 'cheio' | 'nao-usa' }
  jogarFora(uid) → bool
Reino.ItensDrop (sistemas/itens-drop.js; node: true)
  chance(arena, tipo) → 0..1   rolar(arena, tipo) → { item: id } | { estrelas: n } | null   aoVencer(carga) → o que caiu
Reino.BosqueCombate.curar(n) → { antes, depois } | null                 (D)
PA.espadaItem(id) PA.escudoItem(id) → canvas | null; PA._interno.aplicarVestes   (B)
Reino.UI: telaMochila({ uid? }) → P   telaGuardados() → P   avisoItem({ icone, texto, raridade? })   (C)
```
Toda função que muda chama `P.salvar()` e emite `ITENS`; quem lê chama `P.estado()` na hora (`save-e-mescla.md` §8).

`Reino.EVENTOS.ITENS: 'itens'` (A documenta em `eventos.js`). Carga `{ tipo, … }`:
`'ganhou'` (+ uid, id, onde, arena, x, y) · `'estrelas'` (+ n, arena, x, y) · `'mudou'` (+ motivo: `'vestir'` | `'tirar'` |
`'mover'` | `'usar'` | `'jogar'` | `'remoto'`; A emite `'remoto'` no `PROGRESSO_REMOTO` quando o campo mudou).
Emite: `sistemas/itens.js`, `itens-drop.js`. Ouve: `ui/hud-mochila.js`, `ui/itens-aviso.js`, `ui/mochila.js`,
`ui/guardados.js`, `ui/itens-pocao.js`, `sistemas/itens-chao.js`, `sistemas/bosque-combate.js` (relê dano e vida).

## 12. Números (`Reino.config.itens`, `js/nucleo/config-itens.js`, cada um comentado lá)
```
mochila: 20, pilha: 10,
drop: { chance: { facil: 0.12, medio: 0.15, dificil: 0.20, voador: 0.30, mosca: 0.30 }, chanceMax: 0.5,
        categorias: { equip: 35, pocao: 30, comida: 23, estrelas: 12 },
        raridade: { comum: 60, raro: 28, epico: 10, lendario: 3 }, repetido: 0.3,
        estrelas: { bosque: [1, 1], pantano: [1, 1], gelo: [1, 2], dunas: [1, 2], cristal: [2, 3], vulcao: [2, 3] } },
defesaPorPonto: 0.08, defesaMax: 0.6,
pocao: { pequena: 0.4, pequenaMin: 3, grande: 1 }, pocaoRecargaMs: 1000,
pesoComida: { cenoura: 30, maca: 26, feno: 20, biscoito: 16, bolo: 8 }, pesoComidaPadrao: 15,
pesoPocao: { pequena: 85, grande: 15 },
chao: { quicaMs: 350, brilhaMs: 300, voaMs: 450 }, avisoMs: 2600, avisosMax: 3,
```
Conta de referência: no Bosque, ~16 drops a cada 100 inimigos (~6 equipamentos, ~5 poções, ~4 comidinhas, ~2 de
estrelas); um equipamento a cada ~17 inimigos, perto de um nível a cada 30. Os atributos ficam no catálogo.

## 13. Telas e textos (só na tela, sem voz)
Painel de 720 px (`UI.painel`, `arte.md` §21), teclado (Tab, Enter, Esc), 3 tamanhos, `UI.escolher` com `gasta: true`
nos botões que apagam (guarda de toque, `ui.md` §5).
- **Mochila** (`UI.telaMochila`): título "🎒 Mochila"; à esquerda a figura dela vestida e os 6 slots ("Espada", "Escudo",
  "Cabeça", "Armadura", "Calça", "Botas"; vazio: "Vazio"; espada vazia: "Espada do Bosque"); à direita "Espaços: N de 20" e a grade
  de 20 (4 × 5; no celular 5 × 4), com o número da pilha no canto (`--texto-p`). Tocar num espaço abre o cartão: ícone, nome,
  raridade, atributos ("Força +2", "Proteção +1", "Vida +4", "Rapidez +5%", "Sorte +10%"), "Agora: …" com o do slot e os
  botões ("Vestir", "Tirar", "Usar", "Dar ao unicórnio", "Jogar fora"). Poção: "Cura um pouco da vida." /
  "Enche toda a vida."; comidinha: "Enche a barriga do unicórnio.".
- Vazia: "Sua mochila está vazia. Vença monstros nos portais para achar tesouros!"
- Jogar fora: "Jogar fora <nome>?" com "Jogar fora" (`gasta`) e "Agora não" (`seguro`); pilha: "Jogar fora 1", "Jogar fora
  todas" (`gasta`) e "Agora não".
- Usar fora da arena: "Use a poção numa arena, quando a vida baixar."; vida cheia: "Sua vida já está cheia!"; sem
  unicórnio: "Você ainda não tem um unicórnio."; barriga cheia: a fala `cheio` dos cuidados (já gravada).
- **Baú de Guardados** (`UI.telaGuardados`): título "Baú de Guardados" (ícone `bau-guardados`); colunas "Mochila (N de 20)" e
  "Baú (N)"; "Toque num item para mudar de lugar."; "Guardar tudo"; cheia: "A mochila está cheia!"; vazio: "O baú está vazio.".
- **Aviso** (`UI.avisoItem`, `ui/itens-aviso.js`): faixa pequena no alto, abaixo do HUD (`--hud-topo`), com o ícone de 32 px e a
  faixa da raridade; some em `avisoMs`; até `avisosMax` na fila; não é tela (não pausa a luta), espera a tela fechar para
  aparecer. Textos: "<nome>!", "+1 estrela!" / "+N estrelas!", "Mochila cheia! Foi para o baú da casa.".
- **Botão 🎒** (`ui/hud-mochila.js`): `UI.registrarBotaoHud({ id: 'mochila', ordem: 22 })` (entre o álbum e os Ajustes),
  `aria-label` "Mochila"; um brilhinho (sem número) quando chegou item desde a última vez que ela abriu (só na memória).
  Conferir o celular (`ui.md` §6.7): se a fileira não couber, o botão desce para a linha de baixo da fileira (CSS), sem tirar
  nenhum outro.
- Emoji só com desenho: 🎒 e 🗑 já têm; os itens usam `item:<id>`; o baú `bau-guardados` (B desenha).

## 14. Falas e vozes
Nenhuma fala nova com voz (decidido pelo Claude): tudo do §13 é texto de tela. Reaproveitadas, já gravadas: `comeu` e
`cheio` dos cuidados (`cuidados.md` §2). Nada de nome de item em fala.

## 15. Quem mexe em quê (posse exclusiva; o plano tem a lista exata)
- A (núcleo): config-itens, eventos.js, catálogo, itens.js, itens-drop.js, `save-e-mescla.md` (§3.x com o campo), testes do
  save e do drop. Não desenha nem abre tela.
- B (arte): vestes-a/b, icones-a/b, arte/itens-vestir.js, `pixelart-personagens.js`, `jogador-desenho.js`, teste de pranchas.
  Não mexe em save nem em luta; testa passando `opcoes.vestes` direto (não precisa do A).
- C (telas): mochila, aviso, botão 🎒, guardados, css/ui-itens.css, objeto e layout do baú na casa, `casa.md` (uma linha no
  §2/§9), cenas de tela do e2e (`cenario-telas.js`), teste das telas.
- D (combate): itens-chao, itens-pocao (+ css), bosque.js, bosque-combate.js, bosque-desenho.js, `bosque.md` (§5 com o bônus),
  teste da luta com itens.
- Orquestrador: manifesto, `index.html`, tipos, `docs/ARQUITETURA.md` (§5: linha "Itens"), `COMO-USAR.md`, base do e2e.

## 16. Testes
- A: `unidade/itens-save.test.js` (mescla de 2 aparelhos: drop nos dois, gastar num e mover no outro, vestir em conflito,
  mochila acima de 20, lápide, id desconhecido, save antigo, cópia, Novo ciclo), `unidade/itens-drop.test.js` (chance, sorte,
  pesos, repetido, mochila cheia → baú, modo congelado estável, distribuição em 10.000 sorteios perto da conta do §12).
- B: `unidade/itens-vestes.navegador.test.js` (sem vestes = pixel a pixel igual; cada item nas 5 vistas, a pé e montada no
  filhote e no adulto, menina e menino; altura ≤ 21; pranchas em `/tmp/reino-testes/itens-vestes/`).
- C: `unidade/itens-telas.navegador.test.js` (mochila, vestir, tirar, jogar fora com a guarda, guardados, aviso, 3 tamanhos,
  teclado).
- D: `unidade/itens-combate.test.js` (proteção, vida sem cura na troca, curar, rapidez com teto, chão sem travar o passo puro).
- e2e: `--esperado 'interior-casa$|comodo-casa-|tela-decorar$|^dados/(interiores|loja|save-estado-novo|save-mescla)\.json$'`
  (o baú na Sala de Estar; as telas novas, se C as puser no e2e; o config e o campo novo nos dados). Mapa e arenas sem
  espada no save: idênticos (o 🎒 não aparece).
