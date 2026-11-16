# Treinadores de Monstros (MonsterBall, coleção, monstro que segue e ajuda)

Pedido: `pedidos/2026-11-16-treinadores.md`. Na Vila Arco-Íris, o terreno da direita virou o prédio **Treinadores de
Monstros** (interior `vila-treinadores`, lojista **Treinadora Kiara**, `kiara`). Lá se compra a **MonsterBall**
(`bola-monster`, 50 estrelas; 40% de chance) e a **Super MonsterBall** (`bola-super`, 125 estrelas; pega sempre); nas
arenas ela joga a bola no monstro mais perto. Um monstro capturado pode
ser equipado (só 1): anda atrás dela no lugar do ET e ajuda na luta.

## 1. Onde está no código
| Parte | Arquivo |
|---|---|
| números | `js/nucleo/config-monstros.js` (`Reino.config.monstros`) |
| os itens | `conteudo/itens/catalogo.js` (tipo `bola`, ids `bola-monster` e `bola-super`, `loja: 'treinadores'`, `arenas: []`, `peso: 0`, preço `precoBola`/`precoSuper`); ícones `item:bola-monster` e `item:bola-super` em `conteudo/itens/icones-monstros.js` |
| regras, save, captura, coleção | `js/sistemas/monstros*.js` (`Reino.Monstros`) |
| o monstro que segue e a ajuda na luta | `js/sistemas/monstros-bola.js`, `monstros-ajuda.js`, `monstros-desenho.js` (camada do módulo 'monstros', rastro do ET) |
| ferir e capturar no combate | `js/sistemas/bosque-combate-monstros.js` (parte de `bosque-combate.js`) |
| telas | `js/ui/monstros.js` (`UI.telaMonstros`), `js/ui/monstros-bola.js` (botão da bola na arena), `css/ui-monstros.css`; `js/ui/treinadores-loja.js` (`UI.telaTreinadores`) |
| testes | `unidade/monstros.test.js`, `unidade/monstros.navegador.test.js` |
| o prédio | `js/interiores/vila/treinadores*.js` + o terreno da direita em `vila.js` |

## 2. Ids
- Espécie de monstro: `'<arena>-<tipo>'` (ex.: `'lua-dificil'`, `'bosque-mosca'`), arena = id de `Reino.Arenas` ou
  `'bosque'`; tipo = `facil | medio | dificil | voador` (ou `mosca` no Bosque). Nome: o do comentário da config
  (ex.: "Urso da Lua"), numa tabela de nomes de `sistemas/monstros*.js`.
- Interior `vila-treinadores` (16 × 12, `lugar: 'bosque'`, `entrada: false`, `pacote: 'interior-bosque'`), porta na
  Vila em frente ao prédio, escada `sentido: 'portal'` como as das lojas (`vila.md` §2).
- NPC `kiara` "Treinadora Kiara" (mulher, jovem), ação `{ tipo: 'treinadores' }`, com a mesma pergunta do 4º bimestre
  das lojas da Vila antes da conversa (`vila.md` §5).
- Evento `Reino.EVENTOS.MONSTROS: 'monstros'`, carga `{ tipo: 'jogou' | 'capturou' | 'escapou' | 'voltou' | 'equipou', especie? }`
  (documentado em `nucleo/eventos.js`).

## 3. Save (`save-e-mescla.md` §11, dois campos novos)
```
monstros: { <especie>: n }                      // quantos de cada espécie ela já capturou; 'contadores' (só cresce)
monstroCompanheiro: { mariana: { id, em } }     // o equipado (id = espécie ou null); 'carimbo', como etCompanheiro
```
Novo ciclo mantém os dois; cópia `-novidades`: sim. Save antigo: `{}` (sem monstro: o ET continua).
- **Só 1 companheiro**: equipar um monstro grava `monstroCompanheiro` e escolhe o ET `null`
  (`Reino.Viagem.escolherCompanheiro(null)`); escolher um ET no álbum grava `monstroCompanheiro.mariana.id = null`.
  Na leitura, se os dois aparecem (dois aparelhos), vale o de `em` maior; o outro conta como guardado (sem gravar).
- Monstro equipado de espécie que ela não tem (mescla estranha) = nenhum.

## 4. API
```
Reino.Monstros
  especies() → [{ id, arena, tipo, nome, nivel }]      capturados() → [{ id, qtd, def }]
  equipado() → especie | null                         equipar(especie | null) → bool   (grava, emite 'equipou')
  podeJogar(tipo?) → { ok, alvo, arena, uid, tipo } | { ok: false, motivo: 'fora-arena' | 'parada' | 'recarga' | 'sem-bola' | 'longe' }
  jogar(tipo?) → bool        tipo 'comum' (padrão, bola-monster, chanceCaptura) | 'super' (bola-super, chanceSuper)
  bolas(tipo?) → [uid]   ITEM_BOLA: { comum: 'bola-monster', super: 'bola-super' }   quantos(especie) → n   especie(id) → def | null   danoAjuda(especie, danoEspada) → n
  registrarCaptura(especie) → bool   tiraEt() → bool  (o ET fica em casa)   NOMES
Reino.Viagem.companheiroBruto() → id | null           (o ET escolhido, sem olhar o monstro; companheiro() olha)
Reino.BosqueCombate.ferir(id, dano) → { vida, vencido } | null   prender(id) / soltar(id, arena?) / capturar(id) → bool   spriteInimigo(tipo, q, arena) → canvas | null
Reino.Itens.usar(uid da bola) → só gasta com Monstros.podeJogar() ok (quem joga é Monstros.jogar)
Reino.UI.telaMonstros() → P        Reino.UI.telaTreinadores(npc) → P
```
- Botões na arena (`ui/monstros-bola.js`, `UI.registrarBotaoHud`, acima do da poção): o da MonsterBall só para quem já
  teve alguma bola ou algum monstro (o e2e, sem bola, não muda); o da Super, logo acima e com a borda dourada, só com
  Super na Mochila. Apagados sem bola, longe, no ar ou parada. A Super voa com faíscas douradas.
- "Meus monstros": os que ela tem primeiro, depois os que faltam em silhueta; abre pela Mochila (botão só com monstro
  ou bola) e pela loja da Kiara. O cartão da bola na Mochila explica que se joga pelo botão da arena.

## 5. Captura e ajuda
- Captura: o sorteio é na hora do jogar; enquanto a bola voa, o alvo fica `preso` (`BosqueCombate.prender`: parado,
  não toca nela; espada, clique e ajuda não o ferem), para o prêmio nunca dobrar. Ao chegar: pegou → `capturar` (some
  sem XP, pergunta nem drop; volta depois de `voltaMs`) e só então a captura se grava; escapou → `soltar`. Não chegou
  (trocou de cena) ou não deu para capturar: a bola volta para a mochila ('voltou'). Sorteio por
  `Reino.sorteioDaChave('monstros:bola')` no modo congelado (`Itens.rolar`). O preso é solto na arena dele
  (`soltar(id, arena)`; ela pode ter ido de arena para arena com a bola no ar) e o reinício da arena também o solta.
- O monstro equipado tem um coraçãozinho rosa sempre acima dele (é amigo; na arena tem o desenho dos inimigos).
- Ajuda: dano = `max(1, round(dano da espada × (fator[tipo] + bonusNivel × nivel da arena de origem)))`, a cada
  `ajuda.recargaMs`, no inimigo mais perto até `ajuda.alcance`. Inimigo vencido por ele = vencido por ela.

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

