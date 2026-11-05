# Casa do jogador (decorar com kits de móveis)

Pedidos: `pedidos/2026-10-31-casa.md`, `pedidos/2026-10-31-moveis-salas.md` (§12). A casa de 2 andares no canto de baixo à direita do mapa começa vazia. Cada
matéria completa (do 4º bimestre em diante) dá um kit de móveis à escolha, e o jogador põe cada móvel onde quiser,
virado para onde quiser.

## Índice
1. Onde está no código · 2. Ids · 3. Kits · 4. Interiores decoráveis (motor) · 5. Móveis e direções ·
6. Save · 7. API `Reino.Casa` · 8. Onde um móvel pode ficar · 9. Telas · 10. Falas e vozes · 11. Testes · 12. Móveis avulsos (um por sala) ·
13. Os móveis funcionam (`Reino.CasaUsos`)

## 1. Onde está no código
| Parte | Arquivo |
|---|---|
| registro dos kits | `Reino.registrarKitCasa` / `Reino.kitCasa` em `js/nucleo/registros.js` |
| números | `Reino.config.casa` em `js/nucleo/config.js` (`desdeBimestre`, `kits`, `passoGirar`) |
| desenho nas 4 direções | `Reino.CasaArte.virado` em `js/interiores/casa/virar.js` |
| dados dos kits | `js/conteudo/casa/kits-a.js` (estar, jantar, cozinha), `kits-b.js` (banheiro, quarto-jogador, quarto-uni) |
| desenho dos móveis | `js/interiores/casa/moveis-<kit>.js` |
| o prédio | `js/interiores/casa/` (`falas.js`, `objetos.js`, `casa.js`, `andar2.js`, `fora.js`, `lugar.js`) |
| save, regras, ação da caixa | `js/sistemas/casa.js` (`Reino.Casa`) |
| motor | `js/motor/interiores-cena.js` (`refazer`, `objetosExtras`), `interiores-placas.js` (`{nome}`, `{uni}`), validador `jogo/ferramentas/validar/validar-interiores.js` (`decoravel`) |
| telas | `js/ui/bau-casa.js`, `ui/casa-kits.js`, `ui/casa-falas.js` (as falas das duas, `node: true`), `ui/casa-decorar.js` e `ui/casa-decorar-fantasma.js` (+ CSS `ui-bau-casa.css`, `ui-casa-kits.css`, `ui-casa-decorar.css`) |
| câmera no modo colocar | `Reino._motor.ajusteCamera(cam, c)`, chamado no fim de `atualizarCamera` (`js/motor/camera.js`): a câmera segue o fantasma |

## 2. Ids
- Lugar `casa` ("Minha Casa"), `rect {x:46,y:33,w:6,h:5}`, porta em (49,37), sprite `casa`.
- Interiores: `casa` (térreo, `entrada: true`, `pacote: 'interior-casa'`) e `casa-2` (em cima, mesmo pacote).
- Cômodos: no térreo `estar`, `jantar`, `cozinha`, `banheiro`; em `casa-2` os quartos `quarto-jogador`, `quarto-uni` e
  `quarto-et` (o Quarto do ET, do amigo da viagem de foguete: só móveis avulsos, sem kit). Ordem das abas:
  `config.casa.comodos`.
- Kits (ordem de `config.casa.kits`): `estar`, `jantar`, `cozinha`, `banheiro`, `quarto-jogador`, `quarto-uni`.
- Objetos: `casa-<nome>` para os do prédio (ex.: `casa-caixa`, a caixa de mudança); `casa-<kit>-<item>` para os móveis.
- Peça de um kit (uid): `<kit>.<item>.<n>`, com n de 1 a `qtd` (ex.: `jantar.cadeira.3`).
- Ação de objeto: `{ tipo: 'casaDecorar', kit: '<kit>' }` (registrada por `sistemas/casa.js`).
- Telas: `UI.abrirBauCasa()`, `UI.escolherKitCasa()`, `UI.casaKitsPendentes()`, `UI.decorarCasa(opts?)`.

## 3. Kits
```
Reino.registrarKitCasa({
  id: 'quarto-jogador',
  nome: 'Quarto {da|do} {nome}',      // aceita {nome}, {a|b} (Reino.Genero.texto) e {uni} (nome da montaria)
  capa: 'casa-quarto-jogador-cama',   // objeto da biblioteca desenhado como capa na tela de escolha
  comodo: 'quarto-jogador',           // onde combina (só sugestão)
  itens: [
    { id: 'cama', nome: 'Cama', objeto: 'casa-quarto-jogador-cama', direcoes: 4 },
    { id: 'quadro', nome: 'Quadro', objeto: 'casa-quarto-jogador-quadro', direcoes: 1, parede: true },
    { id: 'cadeira', nome: 'Cadeira', objeto: '…', qtd: 2, direcoes: 4 },
  ],
});
```
1. De 6 a 8 itens por kit (contando cada peça da `qtd`). Os nomes ficam curtos (até 14 letras) e sem emoji.
2. `nome` do kit: "Sala de Estar", "Sala de Jantar", "Cozinha", "Banheiro", "Quarto {da|do} {nome}",
   "Quarto de {uni}".
3. Kit escolhido é para sempre. Os mesmos ids, sempre: mudar o `id` de um item faz a peça sumir do save.

## 4. Interiores decoráveis (motor)
1. `decoravel: true` no `registrarInterior`: o validador dispensa o critério de "rico" (`interiores.md` §7 itens 1, 2
   e 4). Continua valendo o resto: paredes, portas, escadas pareadas e tudo alcançável a partir do `spawn`.
2. `objetosExtras(P) → ObjetoInterior[]`: a cena soma esses objetos aos `objetos` fixos, na grade e no desenho. A casa
   usa `objetosExtras: function () { return Reino.Casa ? Reino.Casa.objetosDoAndar('<id>') : []; }`.
3. `Reino.Interiores.refazer(id)`: refaz a grade, os objetos e o estático da cena `id` a partir do `def` (com os
   extras de agora). Se for a cena ativa, ela continua onde está, sem íris. `Reino.Casa.colocar`/`guardar` chamam.
4. Placas: `comodo.placa` aceita `{nome}`, `{a|b}` e `{uni}` (mesma regra do nome do kit). A posição guardada da placa
   leva o texto já trocado.
5. Desenho por cima da cena (fantasma do modo decorar): um módulo com `camada` (`Reino.registrarModulo`), como já
   existe; o motor não muda para isso.
6. Camadas: a animação de um móvel não passa por cima do móvel que o estático desenha depois dele (`interiores.md`
   §6.3); conferido por `testes/unidade/casa-camadas.navegador.test.js`.

## 5. Móveis e direções
1. Cada móvel é um objeto da biblioteca: `Reino.Interiores.objeto('casa-<kit>-<item>', { w, h, solido, alto?, topo?,
   parede?, desenhar })`. `w`/`h` são os da direção `baixo`.
2. `desenhar: Reino.CasaArte.virado({ baixo, cima?, lado? })`. `obj.dir` vale `'baixo'` (de frente para quem olha),
   `'cima'` (de costas), `'esq'` (virado para a esquerda, desenho `lado`) ou `'dir'` (o `lado` espelhado).
3. Nas direções `esq` e `dir`, a pegada chega trocada (`obj.w` = h da biblioteca, `obj.h` = w). O `lado` desenha nessa
   pegada.
4. `direcoes: 2` usa só `baixo` e `esq`; `1` só `baixo`. Item de parede não gira.
5. Regras de pixel art de sempre (`arte.md`): contorno `#3a2446`, luz de cima e da esquerda, sem `arc`, sem degradê liso.
   O tamanho segue a escala do mundo (cama 2×3, sofá 3×2, cadeira 1×1, mesa de jantar 3×2).
6. Sólido: móvel de chão `solido: 'base'` ou `true`; tapete `solido: false` e `plano: true`; de parede `parede: true`.

## 6. Save
Três campos novos (`Reino.Progresso.registrarCampo`, `save-e-mescla.md` §11), todos com `novoCiclo: 'mantem'` e
`copiaSeguranca: true`:

| Campo | Formato | Mescla |
|---|---|---|
| `casaBau` | `{ em: <ms> }` quando ganhou a casa; `{}` antes | o menor `em` |
| `casaKits` | `{ <materiaId>: { kit, em } }` | `carimbo` (por matéria, o `em` maior) |
| `casaItens` | `{ <uid>: { andar, x, y, dir, em } }` ou `{ <uid>: { guardado: true, em } }` | `carimbo` |

1. Guardar NÃO apaga: grava `{ guardado: true, em }`, para a mescla não trazer de volta a peça do outro aparelho.
2. Derivado, nunca guardado solto (`save-e-mescla.md` §2.4): quais kits ela tem (`casaKits`), quantos ela pode
   escolher (matérias completas que contam menos os kits já escolhidos) e quais peças existem.
3. Peça de um kit que ela não tem (perdeu a mescla) é ignorada. Peça colocada num lugar que ficou inválido (dois
   aparelhos puseram duas peças no mesmo tile) é tratada como guardada: a mais nova fica, a outra volta para a caixa.
4. Matéria que conta: `(m.bimestre || 0) >= config.casa.desdeBimestre`, com todas as salas feitas
   (`P.materiaCompleta`). Não depende de `arquivada`: quando o 4º bimestre for arquivado, nada some.

## 7. API `Reino.Casa` (`js/sistemas/casa.js`)
| Função | O que faz |
|---|---|
| `ganhou()` | já abriu o baú da casa |
| `abrirBau()` | carimba `casaBau` (na hora em que a tampa abre) e salva |
| `kitsGanhos()` | ids dos kits que ela tem, na ordem de `config.casa.kits` |
| `kitsLivres()` | ids dos kits que ela ainda pode escolher |
| `kitsPendentes()` | quantos kits ela pode escolher agora (0 se já tem os 6) |
| `escolherKit(kit)` | dá o kit pela primeira matéria completa sem kit; `false` se não pode |
| `nomeKit(kit)` | o nome com `{nome}`/`{uni}` trocados |
| `pecas(kit?)` | `[{ uid, kit, item, objeto, nome, direcoes, parede, lugar: { andar, x, y, dir } \| null }]` |
| `podeColocar(uid, andar, x, y, dir)` | `{ ok, motivo }`; motivo: `'fora'`, `'ocupado'`, `'bloqueia'`, `'parede'`, `'jogador'` |
| `colocar(uid, andar, x, y, dir)` | confere, grava, salva, `Reino.Interiores.refazer(andar)`; devolve `true`/`false` |
| `guardar(uid)` | grava o guardado, salva, refaz |
| `proximaDirecao(uid, dir)` | a próxima de `config.casa.passoGirar` que a peça aceita |
| `objetosDoAndar(andar)` | os `ObjetoInterior` das peças colocadas naquele andar (com `dir` e a pegada trocada) |
| `comodoEm(andar, x, y)` | o cômodo do tile, ou `null` |

## 8. Onde um móvel pode ficar
1. A pegada inteira dentro de UM cômodo da casa (`casa` ou `casa-2`). Móvel de chão: fora das 2 fileiras da parede.
   Móvel de parede: só nas 2 fileiras da parede do fundo.
2. Sem sobrepor outro móvel, objeto fixo, porta, escada, tapete de saída ou `spawn`. Tapete (`plano`) pode ficar
   embaixo de móvel, e um móvel pode ficar em cima de um tapete.
3. Depois de colocado, continua existindo caminho do `spawn` (ou da escada, em `casa-2`) até cada porta, escada, saída
   e o vizinho livre de cada objeto interativo (`Reino.Interiores.caminhoNaGrade`).
4. Fora do tile onde a personagem está.
Qualquer cômodo vale para qualquer kit.

## 9. Telas
1. **Baú da casa** (`UI.abrirBauCasa`): para quem não tem `casaBau`, ao entrar no Reino (não no modo congelado).
   - Jogador antigo: depois do baú de presentes.
   - Jogador novo: depois do tutorial.
   - O baú treme e abre, e a casinha sobe. `Casa.abrirBau()` roda quando a tampa abre.
   - Se houver kit para escolher, a escolha vem em seguida.
2. **Escolha do kit** (`UI.escolherKitCasa`): uma grade de cartões dos kits livres (capa desenhada pelo objeto, nome).
   O toque dá o kit. `UI.casaKitsPendentes()` abre a escolha enquanto houver kit pendente e resolve na hora sem nenhum;
   ela entra na corrente do fim de sala (`atividades/missao.js`) e no fim do baú.
3. **Modo decorar** (`UI.decorarCasa({ kit? })`):
   - Abre pelo botão do HUD (só dentro de `casa`/`casa-2`) e pela caixa de mudança.
   - Um painel com abas pelos kits ganhos e as peças (miniatura, "na casa" ou "guardado").
   - Fantasma: peça guardada vira fantasma no cômodo atual; o toque num tile move. Botões Girar, Colocar e Cancelar,
     com o fantasma verde (pode) ou vermelho (não pode).
   - Tocar numa peça colocada pega para mover; aí aparece também Guardar.
   - Teclado: setas movem, R ou Espaço giram, Enter coloca, Esc cancela.
   - Sem animação com `body.sem-animacao` e `prefers-reduced-motion`.
4. **Tela de início**: a novidade é o destaque principal (`js/ui/abertura-novidade.js`, `config.novidadeInicio`): faixa
   "Nova atualização!" no alto e, embaixo do título, a casinha do baú com "Decore sua casa!", para todos até a data;
   enquanto vale, fica no lugar do bloco da medalha de ouro (o confete e o parabéns do Claude continuam).

## 10. Falas e vozes
1. Quem fala é o Claude (`{ voz: 'claude' }`). Cada arquivo dono de falas as registra pelo `falas()` do seu
   `Reino.registrarModulo` (pacote `geral`), com o texto exato.
2. Nada de `{nome}` nem nome de unicórnio dentro de uma fala falada: nome digitado não tem voz. Use frases gerais
   ("Seu quarto ficou lindo!").
3. Até 30 letras por frase, 3 palavras ou mais (`docs/receitas/licoes-de-voz.md`).

## 11. Testes
- `unidade/casa.test.js` (save, regras, mescla de 2 aparelhos, save antigo sem os campos, guardado, órfã).
- `unidade/casa-moveis.test.js` (§12: pendentes, sorteio fixo, escolher, repetido, peças `movel.*`, mescla, caixa)
  e `unidade/casa-moveis-salas.navegador.test.js` (os 50 desenhos; pranchas em `/tmp/reino-testes/casa-moveis-salas/`).
- `unidade/interiores-decoravel.test.js` (motor: `objetosExtras`, `refazer`, placa com `{nome}`/`{uni}`, validador).
- `unidade/casa-predio.navegador.test.js`, `unidade/casa-decorar.navegador.test.js`, `unidade/casa-telas.navegador.test.js`.
- `unidade/casa-movimento.navegador.test.js` (§13.7; pranchas em `/tmp/reino-testes/casa-movimento/`).
- Cenas do e2e: o interior entra sozinho (vazio, como num save sintético sem kits); telas `bau-casa`, `kit-casa`,
  `movel-casa`, `decorar`.

## 12. Móveis avulsos (um por sala)
Além do kit por matéria, cada sala feita de uma matéria que conta (§6.4, bimestre >= `desdeBimestre`) dá UM móvel
avulso, escolhido entre `config.casa.moveisOpcoes` (5) sorteados. Só depois de ganhar a casa (`casaBau`).

| Parte | Onde |
|---|---|
| registro | `Reino.registrarMovelCasa({ id, nome, objeto, comodo, direcoes, parede? })` / `Reino.movelCasa(id)` / `Reino.moveisCasa` (`js/nucleo/registros.js`) |
| dados (50: um por sala do 4º bimestre, 25 de Língua Portuguesa + 13 de Inglês, mais 3 camas, o chuveiro e os 8 do Quarto do ET) | `js/conteudo/casa/moveis-salas.js` |
| desenho | objeto `casa-movel-<id>` em `js/interiores/casa/moveis-salas-<cômodo>.js` (regras do §5) |
| save, sorteio, pendentes | `js/sistemas/casa-moveis.js` (`Reino.CasaMoveis`) |
| tela | `js/ui/casa-moveis.js` (`UI.escolherMovelCasa`, `UI.casaMoveisPendentes`) + `css/ui-casa-moveis.css` |

1. `comodo` é um id de `config.casa.comodos`: a aba do modo decorar. O nome da aba e do cômodo no cartão é o do kit
   dele ou, sem kit, a placa do cômodo (`Casa.nomeComodo`). As abas passam a ser os cômodos com kit ganho ou
   algum móvel avulso (`Casa.abas()`); a aba traz as peças do kit e depois os móveis avulsos daquele cômodo.
2. Save: `casaMoveis: { <salaId>: { movel, em } }`, `carimbo`, `novoCiclo: 'mantem'`, `copiaSeguranca: true`. A escolha
   de uma sala é para sempre. Entrada com móvel desconhecido não conta: a sala volta a ficar pendente.
3. Derivado: quantas peças de cada móvel ela tem = quantas salas o escolheram (`CasaMoveis.qtd`). Peça (uid) =
   `movel.<id>.<n>`, n de 1 a `qtd`; as regras de lugar (§8) e de `casaItens` (§6) são as mesmas das peças de kit.
4. Sorteio (`CasaMoveis.opcoes(sala)`): fixo por sala (semente = id da sala + `casaBau.em`); os que ela ainda não tem
   primeiro, na ordem sorteada; faltando novos, completa com os que ela tem (ganha mais um igual, "Mais um!").
5. Pendentes (`CasaMoveis.pendentes()`): as salas que contam, feitas e sem móvel, na ordem das matérias e das salas.
6. Quando a tela aparece: ao entrar no Reino, depois do baú da casa (`motor/main.js`; quem já tinha salas feitas
   escolhe uma por sala, uma vez só); no fim de uma sala feita pela 1ª vez (antes do kit da matéria completa,
   `atividades/missao.js`); na caixa de mudança e no botão do HUD (antes dos kits e do painel).
7. Tela: "Escolha um móvel!", "Presente da sala “<nome>”" e "1 de N" na fila; cartões com a capa (`UI.capaCasa`,
   de `ui/casa-kits.js`), o nome e o cômodo. O toque dá o móvel (festa e fala); "Depois" ou Esc param a fila e a sala
   fica pendente. Falas (`ui/casa-falas.js`): "Escolha um móvel novo!" (só na 1ª da fila) e "Móvel novo na sua casa!".


## 13. Os móveis funcionam (`Reino.CasaUsos`)
Pedido: `pedidos/2026-11-03-casa-usos.md`. Peça colocada com uso ganha `uid`, `nome` (o do item) e
`acao: { tipo: 'casaUsar', uid }` em `Casa.objetosDoAndar`; tocar nela (ou Enter ao lado) usa o móvel.

| Parte | Onde |
|---|---|
| API, ação `casaUsar`, "Quem vai?" | `js/sistemas/casa-usos.js` (`Reino.CasaUsos`) |
| o uso de cada móvel (kits e avulsos) | `js/sistemas/casa-usos-tabela.js` (`CasaUsos.registrar(tipo, def)`) |
| animação (cena ocupada, pular) e poses | `js/sistemas/casa-usos-animar.js`, `casa-usos-poses-a.js` (sentar, deitar), `casa-usos-poses-b.js` (banho dela, chuveiro, cozinhar); interno `Reino._casaUsos` |
| estado ligado/aberto no desenho | o `desenhar`/`anim` de cada móvel lê `CasaUsos.ligado(obj)` |
| números | `config.casa.usos` |

1. Usos: `alternar` (luz, TV, aquário, lareira: liga/desliga), `abrir` (geladeira, armários, guarda-roupa, baú),
   `efeito` (liga por `efeitoMs` e desliga sozinho: pia, descarga, piano, vitrola, relógios, brinquedos), `sentar`
   (ela), `deitar` (camas: ela ou o unicórnio; almofadão e caminha nuvem: o unicórnio), `banho` (banheira: o
   unicórnio pelo `Reino.Banho`, ela pela pose), `chuveiro` (ela ou o unicórnio; o unicórnio fica limpinho),
   `cozinhar` (fogão aceso; a comida enche a fome), `comer` (fruteira, cesto de maçãs, cesta de pães, comedouro) e
   `beber` (bebedouro, fontinha, filtro: `Cuidados.beber`). Tapetes, quadros, plantas, espelhos e mesas são enfeite.
2. Ligado/aberto vale só enquanto o jogo está aberto (memória, por `uid`): nada vai para o save. Mudar chama
   `Interiores.refazer(andar)`. Sem `uid` (capa, prancha, fantasma) o móvel é desenhado como sempre; desligado com
   `uid` também (só a lareira: dentro da casa começa apagada). Guardar a peça esquece o estado.
3. Comer em casa: `Cuidados.comerEmCasa(uniId, quanto)` (de graça, grava como `beber`). Nenhum prêmio.
4. "Quem vai?" (`UI.escolher`) só com unicórnio chocado e uso de quem `'ambos'`; sem unicórnio vai ela, e comer ou
   beber só tocam o som.
5. Falas: nenhuma nova; as frases dos cuidados (`comeu`, `bebeu`, `cheio`, `semSede`, `banhou`, `jaLimpinho`).
6. A regra de lugar (§8.3) não muda: peça cercada por outras só não é alcançada (ela arruma os móveis).
7. Movimento de sempre (pedido `pedidos/2026-11-04-casa-movimento.md`): sem tocar, com Animações, se mexem os móveis em
   que o movimento é natural: água (gota, marola), peixes, pêndulo e brilho de magia. Plantas, tapetes, quadros e o
   que só reage ao toque ficam parados. O `anim` vem de `Reino.CasaArte.sempre({ baixo, cima?, lado?, junto? }, hoje?)`
   (`interiores/casa/virar.js`): roda ligado ou não, com o pincel espelhado em `dir`; ligado, o anim de hoje entra no
   lugar dele (com `junto`, os dois). A parte que se move de verdade (pêndulo, peixes, patinho) sai do `desenhar` só
   com `uid`. Invariante: com `uid`, desligado, `desenhar` + `anim` em t = 0 é pixel a pixel o `desenhar` sem `uid`
   (gotas, bolhas e brilhos só com t > 0). A lista dos móveis e as conferências: `casa-movimento.navegador.test.js`.
