# Treinadores de Monstros (MonsterBall, coleção, monstro que segue e ajuda)

Pedido: `pedidos/2026-11-16-treinadores.md`. Na Vila Arco-Íris, o terreno da direita virou o prédio **Treinadores de
Monstros** (interior `vila-treinadores`, lojista **Treinadora Kiara**, `kiara`). Lá se compra a **MonsterBall**
(`bola-monster`, 50 estrelas); nas arenas ela captura o monstro mais perto com 40% de chance. Um monstro capturado pode
ser equipado (só 1): anda atrás dela no lugar do ET e ajuda na luta.

## 1. Onde está no código
| Parte | Arquivo |
|---|---|
| números | `js/nucleo/config-monstros.js` (`Reino.config.monstros`) |
| o item | `conteudo/itens/catalogo.js` (tipo `bola`, id `bola-monster`, `loja: 'treinadores'`, `arenas: []`); ícone `conteudo/itens/icones-monstros.js` |
| regras, save, captura, coleção | `js/sistemas/monstros*.js` (`Reino.Monstros`) |
| o monstro que segue e a ajuda na luta | `js/sistemas/monstros-*.js` (camada de módulo, como `et-companheiro-desenho.js`) |
| telas | `js/ui/monstros.js` (`UI.telaMonstros`), botão da bola na arena; `js/ui/treinadores-loja.js` (`UI.telaTreinadores`) |
| o prédio | `js/interiores/vila/treinadores*.js` + o terreno da direita em `vila.js` |

## 2. Ids
- Espécie de monstro: `'<arena>-<tipo>'` (ex.: `'lua-dificil'`, `'bosque-mosca'`), arena = id de `Reino.Arenas` ou
  `'bosque'`; tipo = `facil | medio | dificil | voador` (ou `mosca` no Bosque). Nome: o do comentário da config
  (ex.: "Urso da Lua"), numa tabela de nomes de `sistemas/monstros*.js`.
- Interior `vila-treinadores` (16 × 12, `lugar: 'bosque'`, `entrada: false`, `pacote: 'interior-bosque'`), porta na
  Vila em frente ao prédio, escada `sentido: 'portal'` como as das lojas (`vila.md` §2).
- NPC `kiara` "Treinadora Kiara" (mulher, jovem), ação `{ tipo: 'treinadores' }`, com a mesma pergunta do 4º bimestre
  das lojas da Vila antes da conversa (`vila.md` §5).
- Evento `Reino.EVENTOS.MONSTROS: 'monstros'`, carga `{ tipo: 'capturou' | 'escapou' | 'equipou', especie? }`.

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
  podeJogar() → { ok, alvo? | motivo: 'fora-arena' | 'sem-bola' | 'longe' | 'recarga' }
  jogar() → bool                                      (gasta 1 bola, anima, sorteia chanceCaptura, emite)
Reino.UI.telaMonstros() → P        Reino.UI.telaTreinadores(npc) → P
```

## 5. Captura e ajuda
- Captura: o alvo some como vencido, sem XP, sem pergunta e sem drop (o prêmio é o monstro), e volta depois como os
  outros (`voltaMs`). Sorteio por `Reino.sorteioDaChave('monstros:bola')` no modo congelado.
- Ajuda: dano = `max(1, round(dano da espada × (fator[tipo] + bonusNivel × nivel da arena de origem)))`, a cada
  `ajuda.recargaMs`, no inimigo mais perto até `ajuda.alcance`. Inimigo vencido por ele = vencido por ela.

## 6. Números
`Reino.config.monstros` (comentados lá). Força dos 3 bosques de dentro: `config.arenas.orvalho|neblina|lua`
(`arenas.md` §8).
