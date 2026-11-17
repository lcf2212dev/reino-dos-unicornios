# Treinadores de Monstros (MonsterBall, coleção, monstro que segue e ajuda)

Pedido: `pedidos/2026-11-16-treinadores.md`. Na Vila Arco-Íris, o terreno da direita virou o prédio **Treinadores de
Monstros** (interior `vila-treinadores`, lojista **Treinadora Kiara**, `kiara`). Lá se compra a **MonsterBall**
(`bola-monster`, 50 estrelas; 40% de chance) e a **Super MonsterBall** (`bola-super`, 125 estrelas; pega sempre); nas
arenas ela joga a bola no monstro mais perto. Os monstros capturados podem ser equipados (até 4, e mais 1 por matéria
do bimestre terminada: pedido do Leandro, 17/11): andam em fila atrás dela e ajudam na luta, junto com o ET que ela
levou (no fim da fila) e o unicórnio. Na **Casa Mal-Assombrada** da Vila mora um monstro de cada matéria, ganho ao
completar a matéria dele (§10).

## 1. Onde está no código
| Parte | Arquivo |
|---|---|
| números | `js/nucleo/config-monstros.js` (`Reino.config.monstros`) |
| os itens | `conteudo/itens/catalogo.js` (tipo `bola`, ids `bola-monster` e `bola-super`, `loja: 'treinadores'`, `arenas: []`, `peso: 0`, preço `precoBola`/`precoSuper`); ícones `item:bola-monster` e `item:bola-super` em `conteudo/itens/icones-monstros.js` |
| regras, save, captura, coleção | `js/sistemas/monstros*.js` (`Reino.Monstros`) |
| o monstro que segue e a ajuda na luta | `js/sistemas/monstros-bola.js`, `monstros-ajuda.js`, `monstros-pets.js` (o unicórnio e o ET também atacam), `monstros-desenho.js` (camada do módulo 'monstros', rastro do ET) |
| ferir e capturar no combate | `js/sistemas/bosque-combate-monstros.js` (parte de `bosque-combate.js`) |
| telas | `js/ui/monstros.js` (`UI.telaMonstros`), `js/ui/monstros-bola.js` (botão da bola na arena), `css/ui-monstros.css`; `js/ui/treinadores-loja.js` (`UI.telaTreinadores`) |
| os monstros das matérias (§10) | `js/sistemas/monstros-materias.js` (os 6 moldes); a casa em `js/interiores/vila/assombrada*.js` |
| testes | `unidade/monstros.test.js`, `unidade/monstros-pets.test.js`, `unidade/monstros-materias.test.js`, `unidade/monstros.navegador.test.js`, `unidade/assombrada.navegador.test.js` |
| o prédio | `js/interiores/vila/treinadores*.js` + o terreno da direita em `vila.js` |

## 2. Ids
- Espécie de monstro: `'<arena>-<tipo>'` (ex.: `'lua-dificil'`, `'bosque-mosca'`), arena = id de `Reino.Arenas` ou
  `'bosque'`; tipo = `facil | medio | dificil | voador` (ou `mosca` no Bosque). Nome: o do comentário da config
  (ex.: "Urso da Lua"), numa tabela de nomes de `sistemas/monstros*.js`. Os das matérias: `'assombrada-<assunto>'` (§10).
- Interior `vila-treinadores` (16 × 12, `lugar: 'bosque'`, `entrada: false`, `pacote: 'interior-bosque'`), porta na
  Vila em frente ao prédio, escada `sentido: 'portal'` como as das lojas (`vila.md` §2).
- NPC `kiara` "Treinadora Kiara" (mulher, jovem), ação `{ tipo: 'treinadores' }`, com a mesma pergunta do 4º bimestre
  das lojas da Vila antes da conversa (`vila.md` §5).
- Evento `Reino.EVENTOS.MONSTROS: 'monstros'`, carga `{ tipo: 'jogou' | 'capturou' | 'escapou' | 'voltou' | 'equipou', especie? }`
  (documentado em `nucleo/eventos.js`).

## 3. Save (`save-e-mescla.md` §11, três campos)
```
monstros: { <especie>: n }                      // quantos de cada espécie ela já capturou; 'contadores' (só cresce)
monstroCompanheiro: { mariana: { id, em } }     // o 1º da fila (id = espécie ou null); 'carimbo', como etCompanheiro
monstrosJuntos: { mariana: { ids: [especie…], em } }   // a fila dos equipados, em ordem (17/11); 'carimbo'
```
Novo ciclo mantém os três; cópia `-novidades`: sim. Save antigo: `{}` (sem monstro: o ET continua).
- **A fila**: `equipar` e `deixar` gravam a lista em `monstrosJuntos` e o 1º dela em `monstroCompanheiro`, no MESMO
  `em` (no `monstroCompanheiro`, o 1º que não é de matéria: a versão de antes da fila não conhece os da §10). Na leitura vale a lista, a não ser que o `monstroCompanheiro` seja mais novo (um aparelho da versão antiga
  trocou ou deixou o monstro em casa depois: vale o dele, sozinho) ou que a lista não exista (save de antes: o
  monstro de sempre). Lista limpa: só ids de espécie, sem repetir.
- **Vagas**: `config.monstros.equipar.base` (4) e mais `porMateria` (1) por matéria do bimestre de agora (não
  arquivada) com todas as salas feitas (`P.materiaCompleta`), contadas na hora (nada no save). A fila mostra só as
  primeiras `vagas()`; a lista gravada não encolhe por isso.
- **Os monstros e o ET vão juntos**: equipar não mexe no `etCompanheiro`; escolher um ET no álbum não mexe nos
  monstros (até 17/11 era só 1: o save de quem equipou um monstro antes ficou com o ET `null`, e ela leva o ET de novo
  pelo álbum). Na fila atrás dela, no mesmo rastro: o bebê (a pé), o 1º monstro a `distancia` px, cada outro
  `entreMonstros` px atrás do de antes (`Reino._monstros.distancia(n)`) e o ET `config.viagem.etAtrasDoMonstro` px
  atrás do último (`Reino._etCompanheiro.distancia()`).
- Monstro equipado de espécie que ela não tem (mescla estranha) = nenhum.

## 4. API
```
Reino.Monstros
  especies() → [{ id, arena, tipo, nome, nivel, daMateria? }]      capturados() → [{ id, qtd, def }]
  daMateria() → [{ id, nome, materia, ganho }]   molde(especie) → molde | null   sprite(especie, quadro) → canvas | null
  registrarEspecie({ id, assunto, nome, molde })   (só no carregamento; §10)
  equipados() → [especie]  (a fila, até vagas())     equipado() → o 1º da fila | null    estaJunto(especie) → bool
  equipar(especie) → bool  (no fim da fila; false sem vaga)   equipar(null) → deixa todos em casa   deixar(especie) → bool
  (equipar e deixar gravam e emitem 'equipou')   vagas() → n   maisVagas() → bool   materiasTerminadas() → n
  podeJogar(tipo?) → { ok, alvo, arena, uid, tipo } | { ok: false, motivo: 'fora-arena' | 'parada' | 'recarga' | 'sem-bola' | 'longe' }
  jogar(tipo?) → bool        tipo 'comum' (padrão, bola-monster, chanceCaptura) | 'super' (bola-super, chanceSuper)
  bolas(tipo?) → [uid]   ITEM_BOLA: { comum: 'bola-monster', super: 'bola-super' }   quantos(especie) → n   especie(id) → def | null   danoAjuda(especie, danoEspada) → n
  registrarCaptura(especie) → bool   NOMES
Reino.Viagem.companheiro() → id | null                (o ET escolhido; não depende do monstro)
Reino.BosqueCombate.ferir(id, dano) → { vida, vencido } | null   prender(id) / soltar(id, arena?) / capturar(id) → bool   spriteInimigo(tipo, q, arena) → canvas | null
Reino.Itens.usar(uid da bola) → só gasta com Monstros.podeJogar() ok (quem joga é Monstros.jogar)
Reino.UI.telaMonstros() → P        Reino.UI.telaTreinadores(npc) → P
```
- Botões na arena (`ui/monstros-bola.js`, `UI.registrarBotaoHud`, acima do da poção): o da MonsterBall só para quem já
  teve alguma bola ou algum monstro (o e2e, sem bola, não muda); o da Super, logo acima e com a borda dourada, só com
  Super na Mochila. Apagados sem bola, longe, no ar ou parada. A Super voa com faíscas douradas.
- "Meus monstros": no topo "N de M monstros • com você: K de V" (cheio: "Termine uma matéria para levar mais um!");
  "Levar comigo" / "Deixar em casa" em cada capturado, e sem vaga o "Levar comigo" fica indisponível (`arte.md` §19.1).
  Os que ela tem primeiro, depois os que faltam em silhueta; abre pela Mochila (botão só com monstro
  ou bola) e pela loja da Kiara. O cartão da bola na Mochila explica que se joga pelo botão da arena.

## 5. Captura e ajuda
- Captura: o sorteio é na hora do jogar; enquanto a bola voa, o alvo fica `preso` (`BosqueCombate.prender`: parado,
  não toca nela; espada, clique e ajuda não o ferem), para o prêmio nunca dobrar. Ao chegar: pegou → `capturar` (some
  sem XP, pergunta nem drop; volta depois de `voltaMs`) e só então a captura se grava; escapou → `soltar`. Não chegou
  (trocou de cena) ou não deu para capturar: a bola volta para a mochila ('voltou'). Sorteio por
  `Reino.sorteioDaChave('monstros:bola')` no modo congelado (`Itens.rolar`). O preso é solto na arena dele
  (`soltar(id, arena)`; ela pode ter ido de arena para arena com a bola no ar) e o reinício da arena também o solta.
- Cada monstro equipado tem um coraçãozinho rosa sempre acima dele (é amigo; na arena tem o desenho dos inimigos).
- Ajuda: cada monstro da fila ataca no seu tempo (o 1º na hora, os outros escalonados na recarga; `S.ataques[especie]`),
  dano = `max(1, round(dano da espada × (fator[tipo] + bonusNivel × nivel da arena de origem)))`, a cada
  `ajuda.recargaMs`, no inimigo mais perto até `ajuda.alcance`. Inimigo vencido por ele = vencido por ela.
- **Os outros bichinhos também atacam** (pedido de 17/11, `pedidos/2026-11-17-pets-atacam.md`; `sistemas/monstros-pets.js`):
  em toda arena, o unicórnio (sempre com ela: o bebê a pé ou montado) solta uma estrelinha de arco-íris do chifre e o
  ET levado (`Viagem.companheiro()`) um raio verde, no mesmo alvo e alcance, cada um a cada `ajuda.pets.<quem>.recargaMs`
  e fora do compasso dos outros (recomeça a cada arena), dano `max(1, round(dano da espada × ajuda.pets.<quem>.fator))`.
  O tiro voa `ajuda.pets.vooMs` e o dano entra na chegada (sem Animações, só o brilho, na mesma hora); fica em
  `S.tiros[quem]`. Com a camada do módulo 'monstros' ativa em toda arena (mesmo sem monstro equipado). Nada no save.

## 6. Números
`Reino.config.monstros` (comentados lá; preços `precoBola` 50 e `precoSuper` 125, chances `chanceCaptura` 0,4 e `chanceSuper` 1).
Força dos 3 bosques de dentro: `config.arenas.orvalho|neblina|lua`
(`arenas.md` §8).

## 7. Desconto da loja
As bolas se compram sempre (pedido do Leandro, 16/11: "não precisa condicionar às salas"). As salas feitas de
`config.monstros.desconto.materia` (Matemática do Dia a Dia, `matematica4`) dão desconto em todas: a maior faixa de
`desconto.faixas` alcançada (5 salas → 10%, 16 → 25%, 32 → 50%); preço = `max(1, round(cheio × (1 − desconto)))`.
`Treinadores.desconto() → { desconto, feitas, proxima: { salas, desconto } | null }` (contado na hora por
`P.salasFeitas`, nada no save); `ofertas()` traz `preco` (com desconto) e `cheio`. Na loja: o preço cheio riscado ao
lado e, abaixo do saldo, "Desconto de N%: você fez M salas de Matemática! Com K salas, X% de desconto."

## 8. Mini MonsterBall
Item `bola-mini` "Mini MonsterBall" (tipo `bola`, loja `treinadores`, ícone `item:bola-mini`): `config.monstros.precoMini`
(25) e `chanceMini` (0,2). Na loja é o primeiro cartão (`Treinadores.ID_MINI`). Na arena, `Monstros.podeJogar('mini')`/`jogar('mini')`; botão
`monstros-mini` à esquerda do da MonsterBall, só com Mini na Mochila; a bola que volta (`'voltou'`) volta do mesmo tipo.

## 9. MonsterBall pela letra cursiva
No cartão da MonsterBall, "ou" e "Escrever 2 frases": as frases em letra cursiva dão 1 MonsterBall sem estrela
(`Treinadores.ganharEscrevendo`). Tudo em `cursiva.md`.

## 10. Os monstros das matérias (Casa Mal-Assombrada)
Pedido: `pedidos/2026-11-17-casa-mal-assombrada.md`. Um monstro por matéria (`'assombrada-<assunto>'`: matematica,
ingles, portugues, geografia, ciencias, historia), registrado por `Monstros.registrarEspecie` com o molde desenhado em
`sistemas/monstros-materias.js` (`{ linhas, paleta, pisca, flutua, balanco }`, contorno `K`). Arena `'assombrada'`,
lugar "Casa Mal-Assombrada".
- **Ganho = derivado**: `quantos(id)` é 1 quando alguma matéria do mesmo prédio (`lugar.dentro: 'materia:<assunto>'`)
  tem todas as salas feitas (`P.materiaCompleta`), e 0 sem isso; a do 3º bimestre (id = o assunto, arquivada antes da
  novidade) não conta. A jaula pede a de agora (`Bimestres.ativa(assunto)`); quando ela também for arquivada, o monstro
  continua dela. Nada no save: o campo `monstros` não os conta, a MonsterBall não os pega (`registrarCaptura` recusa)
  e um número lá não vale. Tipo e nível: `config.monstros.materias`.
- **Equipar**: como os outros (`equipar`, a fila em `monstrosJuntos`, as `vagas()`); sem a matéria (outro aparelho,
  Novo ciclo) ele sai da fila sem apagar a lista gravada e volta com ela. Aparelho da versão antiga não conhece a
  espécie: não mostra (§6.6 do `save-e-mescla.md`).
- **Desenho**: `Monstros.sprite(id, quadro)` serve para toda espécie (o da arena por `BosqueCombate.spriteInimigo`, o
  da matéria pelo molde; quadro 1 = piscando), usado pela fila, pelo "Meus monstros" e pelas jaulas da casa.
- **A casa**: na Vila, o terreno de cima da esquerda (`vila.md` §2), interior `vila-assombrada` com 6 jaulas
  (`acao: { tipo: 'assombrada-monstro', especie }`): o monstro em silhueta com "?" até ganhar; ganho, colorido, a
  jaula aberta e o "Levar comigo". O botão da MonsterBall na arena não aparece só por ter um monstro de matéria.
- **Aviso na tela de início**: `config.novidadeInicio` (a Casa Mal-Assombrada, até 15/12).

