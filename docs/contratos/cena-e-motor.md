# Contrato: cena e motor

Cobre a cena ativa (mapa ou interior), a transição em íris, a câmera, o pintor, o laço, a entrada
(toque e teclado), a ordem de desenho em camadas, o jogador, o mapa com o lago (nado) e a depuração.
Regras gerais (ambiente, convenções, testes): `README.md`.

## Índice
1. Onde está no código · 2. Cena ativa (`Reino.Cena`) · 3. Entrar e sair · 4. Transição em íris ·
5. Pintor e ordem de desenho · 6. Interface de cena · 7. Jogador · 8. Câmera ·
9. Mapa: placas, lugares e prédios · 10. Nadar no lago · 11. Desempenho · 12. Depuração · 13. Antes de mexer ·
14. Módulos (sistemas) · 15. Versão nova: a aba se atualiza sozinha

## 1. Onde está no código
- `jogo/js/motor/cena.js` — `Reino.Cena` (estado, entrar/sair, adaptador do mapa, ocupar/liberar, quadros).
- `jogo/js/motor/transicao.js` — íris (`TEMPO`, `TEMPO_RAPIDO`, `COR_IRIS`), evento `Reino.EVENTOS.TRANSICAO`.
- `jogo/js/motor/camera.js` — canvas, escala, câmera, pintor, `bordasMapa` e `areaHUD` (lê a área útil, `arte.md` §18; cria `Reino._motor`).
- `jogo/js/motor/laco.js` — o quadro (camadas) e o laço (`requestAnimationFrame`).
- `jogo/js/motor/entrada.js` — teclado, toque/clique no canvas, mouse segurado, thumbstick do toque, agir no alvo.
- `jogo/js/motor/main.js` — início do jogo e telas de entrada.
- `jogo/js/personagens/jogador.js`, `jogador-desenho.js` — `Jogador` (movimento, caminho, água, desenho).
- `jogo/js/mundo/mapa.js` (grade, lugares, caminho), `lugares.js` (`Mapa.LUGARES_FIXOS`), `mapa-desenho.js`
  (`BORDA_BAIXO`, camada animada), `lago.js` (`Mapa.agua`, `Mapa.fundura`), `predios.js` (`Mapa.PREDIOS`, `Mapa.PREDIOS_ANIM`).
- `jogo/js/ui/lugares.js` — menu Lugares, `UI.avisosDoLugar`.
- `jogo/js/debug.js` — `window.__reino`.

## 2. Cena ativa — `Reino.Cena`
```
Reino.Cena = {
  MAPA, TRANSICAO, INTERIOR, DIALOGO, ATIVIDADE,   // 'mapa','transicao','interior','dialogo','atividade'
  estado() → string        // nesta prioridade: transição > tela DOM aberta (UI.temTela)
                           // > balão modal (Reino.Claude.dialogoAberto()) > tipo da cena ativa
  atual() → cena ativa     // interface da §6
  mapa                     // a cena do mapa (adaptador sobre Mapa)
  bloqueado() → bool       // true em transição, atividade e diálogo: sem andar, sem portas, sem NPCs
  emTransicao() → bool
  entrar(lugarId) → Promise      // mapa → interior de entrada do lugar, com íris.
                                 // Lugar sem interior registrado: UI.abrirLugar(lugar) (painel antigo)
  irPara(interiorId, chegada {x,y}?, olhar {x,y}?, de?) → Promise   // interior → interior (escadas), com íris.
                                 // Sem chegada: ao lado da escada de interiorId que volta para `de`
                                 // (Interiores.chegadaVindoDe; interiores.md §3.1); sem ela, o spawn
  sair() → Promise               // interior → mapa, 1 tile abaixo da porta do lugar, olhando para baixo
  paraTela(wx, wy) → {x, y}      // px do jogo → px CSS da página (testes e toques)
  quadros: { media() → ms, ultimo }   // tempo de desenho por quadro (últimos ~120), para o debug
  ocupar(motivo), liberar(motivo)     // estado 'atividade' sem tela DOM (ex.: banho); evento OCUPADA (motivo | null)
  acionar(gatilho), irAoLugar(lugar), irAoAlvo(alvo), entrarLugar(lugar), faseTransicao()   // extras, podem ser usados
}
eventos (Reino.EVENTOS, jogo/js/nucleo/eventos.js):
         CENA       { de, para }      // a cena ativa trocou
         TRANSICAO  true | false      // começou / terminou a transição
         OCUPADA    motivo | null
```
1. `liberar(motivo)` só desliga se for o mesmo motivo de `ocupar`.
2. Por que `ocupar/liberar` (e não uma tela DOM) no banho: o canvas continua desenhando a animação.

## 3. Entrar e sair
1. Entrar: pisar na porta, tocar no prédio, Enter/Espaço na porta, menu Lugares. Com interior
   registrado vem a íris; sem, o painel antigo.
2. Dentro: ela aparece em `spawn` (1 tile acima do tapete de saída), de costas (`J.virar(0,-1)`).
3. Sair: pisar no tapete, tocar nele ou Enter/Espaço em cima dele. Reaparece em `porta.x, porta.y + 1`,
   virada para baixo.
4. Sem loop: `J.portaIgnorada` vale para porta, tapete e escada. Escada: o gatilho leva `para`, `olhar` e
   `de` (o interior atual); `acionar` chama `irPara(para, chegada, olhar, de)`. Ela aparece ao lado da escada
   do andar `para` que volta para `de`, no lado `chegar` dela (padrão logo abaixo), olhando para `olhar` da escada de origem (`interiores.md` §3.1).
5. Menu Lugares dentro de um interior: `sair()`, anda até o destino e entra. Destino = o próprio prédio:
   vai para o `spawn` da entrada (com íris).
6. Atalhos do HUD (💰 Baú, ⭐ Loja, montaria/Estábulo, 🥚) abrem os painéis direto.
7. Ao abrir o jogo ela começa no mapa. A posição dentro dos interiores não é salva.

## 4. Transição em íris
1. Fecha ~450 ms (ease-in) centrada na Mariana; fica fechada ≥120 ms E até `destino.preparar()` e
   `Reino.Voz.carregar(pacote)` terminarem (limite de segurança ~4 s); troca a cena; abre ~450 ms
   (ease-out) centrada na nova posição.
2. Desenhada no canvas principal, por cima de tudo, cor `#3a2446`. Borda em degraus: faixas horizontais
   de `escala` px (como o `circulo()` do desenho do mapa).
3. Som `Reino.Som.tocar('porta')` ao entrar e ao sair.
4. Durante a transição: input bloqueado, portas e NPCs inativos, nenhuma tela abre (toques no HUD
   ignorados). Nunca dispara duas vezes (a segunda chamada devolve a mesma promessa).
5. Resize/rotação no meio não quebra (raio em fração da tela, calculado a cada quadro).
6. Animações desligado ou `prefers-reduced-motion`: troca rápida (~150 ms), sem círculo.
7. O botão 📷 se apaga durante a transição (evento `Reino.EVENTOS.TRANSICAO`).

## 5. Pintor e ordem de desenho
```
pintor = {
  ret(x, y, w, h, cor)     // px do jogo, desenhado direto em px da tela (suave, sem tremer)
  sprite(img, x, yPes)     // img centrada em x, base em yPes (px do jogo)
  ctx, escala, dpr, cam {x, y}
  tela(x, y) → {x, y}      // px do jogo → px do canvas
}
```
Ordem de cada quadro (`motor/laco.js`):
1. Buffer (px do jogo): fundo `cena.corFundo`; `cena.desenharFundo(bctx, t, animar)`; marcador do toque.
2. Buffer ampliado no canvas.
3. `cena.desenharTela(ctx, pintor, t, animar)` (no mapa hoje é vazio: as placas do mapa saíram, §9).
4. Itens ordenados por Y: `Jogador.itensDesenho(pintor, animar)` + `cena.itensDesenho(pintor, t, animar)`
   (+ `camada.itensDesenho` de cada módulo com `camada.ativo()`, §14; ex.: o banho) + as peças altas do mapa
   encostadas nela (`Mapa.itensFrente`: só os pixels opacos, pela linha do pé, recortadas à caixa dela).
5. `cena.desenharSobre(ctx, pintor, t, animar)` (opcional): placas dos cômodos nos interiores (quase
   transparentes quando cobrem a Mariana) (+ `camada.sobre` dos módulos ativos, §14).
6. Luz (vinheta).
7. Íris, se houver transição.

## 6. Interface de cena (mapa e cada interior)
```
cena = {
  id: 'mapa' | '<id do interior>',  tipo: 'mapa' | 'interior',
  lugarId: null | '<id do lugar no mapa>',
  corFundo: '#c6e15a' (mapa) | cor escura (interior),
  largura(), altura()              // px do jogo
  solido(tx, ty) → bool            // fora dos limites = true
  portaEm(tx, ty) → lugar | null   // só o mapa (como Mapa.portaEm)
  saidaEm(tx, ty) → gatilho | null // só interiores: { id, tipo: 'saida'|'escada', x, y, para?, chegada?, olhar?, de? }
  agua?(tx, ty) → bool             // só o adaptador do mapa; ausente = false
  caminho(a, b) → [{x,y}] | null   // 8 direções, sem cortar quina (regra de Mapa.caminho)
  maisPerto(x, y, de) → {x,y} | null
  alvoEm(wx, wy) → alvo | null     // toque em px do jogo (NPC, objeto interativo, tapete/escada; no mapa: prédio, Claude)
  alvoPerto(tile, olhar) → alvo | null   // Enter/Espaço: gatilho no tile atual; NPC/objeto/Claude nos 4
                                         // vizinhos, preferindo o que ela está olhando
  npcs() → [npc]                   // mapa: []
  preparar() → Promise             // pré-renderiza o estático (só se precisar), com a íris fechada
  desenharFundo(bctx, t, animar)   // buffer em px do jogo: canvas estático + animações leves
  desenharTela(ctx, pintor, t, animar)    // px da tela, antes dos personagens
  desenharSobre?(ctx, pintor, t, animar)  // px da tela, depois dos personagens
  itensDesenho(pintor, t, animar) → [{ y, desenhar() }]   // NPCs, móveis altos, Claude
}
alvo = { tipo: 'npc'|'objeto'|'saida'|'escada'|'lugar'|'claude', id,
         tile: {x, y},   // onde ela para (vizinho livre alcançável; gatilho: o próprio tile). NPC: o tile do
                         // lado vence o de baixo, salvo se ficar mais de 3 passos mais longe (PENA_BAIXO_NPC em
                         // interiores-toque.js), para a Mariana montada não cobrir o NPC na conversa
         olhar: {x, y},  // para onde vira ao chegar
         agir(),         // o que acontece ao chegar
         semCaminho? }   // opcional: o que fazer se não houver caminho
```
1. Controle genérico: toque → `alvoEm`; com alvo, `Jogador.irPara(tile)` e, ao chegar,
   `Jogador.virar(olhar)` e `agir()`; sem alvo, anda até o tile (ou `maisPerto`).
2. Enter/Espaço → `alvoPerto`. Setas do teclado e WASD andam (`V.teclas`); Tab/Enter/Esc como sempre.
3. Tudo ignorado quando `Reino.Cena.bloqueado()`; com tela DOM aberta (pausado), nada de gesto.
4. Controles de ponteiro (`entrada.js`; não há mais setas na tela; `ajustes.setas` fica no save e é ignorado):
   - Toque/clique RÁPIDO em qualquer lugar = o item 1 (vai até o ponto ou age). Mouse e dedo na metade
     esquerda esperam o `pointerup` (pode virar arrasto); dedo na metade direita age já no `pointerdown`.
   - Mouse (`pointerType 'mouse'`, botão principal): arrastou mais de 6 px CSS ou segurou 300 ms → segue o
     ponteiro enquanto o botão está apertado; soltou → para. Perto do ponteiro (6 px do jogo) ela para e só
     volta a andar a 12 px (sem tremer em volta dele).
   - Toque/caneta (`'touch'`/`'pen'`, não o tamanho da tela): dedo na metade esquerda arrastado mais de 12 px
     CSS → thumbstick em `#controle` (base 110 px, pino 48 px; tablet ≥ 700×700: 130/56), centrado onde o
     dedo encostou; direção livre, zona morta 10 px; soltou → some e ela para. Um `pointerId` por vez; outros
     dedos fazem o toque rápido. `#controle` fica com z-index 5 (embaixo do HUD, balões e telas), sem toque.
   - A direção entra no laço por `V.direcaoLivre()` (só sem tecla apertada) como `{x, y, livre: true}`;
     `Jogador.virar8` vira para a mais próxima das 8 direções com folga de 10° (histerese).
   - Transição, diálogo, tela aberta ou `blur` → `V.soltarLivre()` (o gesto acaba).

## 7. Jogador — `Jogador` (`personagens/jogador.js`)
1. Consulta sempre `Reino.Cena.atual()` (com `Mapa` como reserva antes de a cena existir) para `solido`,
   `caminho`, `portaEm`/`saidaEm`.
2. `J.atualizar(dt, teclas, aoPisar)`: andando com as setas, o mouse ou o thumbstick, ao pisar num tile com `portaEm` ou `saidaEm`,
   chama `aoPisar(gatilhoOuLugar)` uma vez (`J.portaIgnorada` = id até sair do tile).
3. `J.itensDesenho(pintor, animar) → [{ y, desenhar() }]`: Mariana e bebê como itens separados; montada =
   um item. `J.desenhar(pintor, animar)` continua existindo (desenha os próprios itens em ordem).
4. `Jogador.gatilhoEm(tx, ty)` existe e pode ser usado.
   `Jogador.pular({ altura: 28, ms: 900 }) → bool` e `Jogador.pulando()`: sobe e desce devagar no relógio `J.t`; a sombra fica
   no chão (encolhe no alto); não reinicia no meio; sem Animações ou com movimento reduzido devolve false.
5. Ícone da fome/sede/banho (`Cuidados.iconeMontaria()`) desenhado acima do unicórnio (montada: acima do
   conjunto; bebê: acima do bebê), em px da tela e nítido (inteiro de px por px do ícone), como a bolha de
   status dos NPCs. Em todas as cenas (`jogador-desenho.js`).
6. Sujinho (`Cuidados.sujo()`): manchinhas no pelo e nuvenzinha de poeira (anima só com Animações).

## 8. Câmera
1. Igual no mapa e nos interiores: centraliza se couber; senão segue a Mariana com limite nas bordas.
2. Nos interiores pode passar da borda até o fim do HUD de cima e do menu de baixo.
3. Mapa: `BORDA_BAIXO` (4 fileiras de bosque) desenhada abaixo do mapa e margem de baixo medida no HUD
   (`bordasMapa`, `motor/camera.js`), para as portas de baixo e ela nadando não sumirem atrás do menu.
   Nas 6 primeiras fileiras, a câmera também sobe pela altura do HUD, com transição suave. A região em `y < 0`
   recebe bosque e a continuação das copas num cache separado, ancorado no mundo; ele cobre o buffer visível,
   cresce quando necessário e é invalidado ao pré-renderizar o mapa. A origem do estático continua em `(0, 0)`.
4. Escala: `escalaDoMundo` (`motor/camera.js`), pela regra do `arte.md` §11.

## 9. Mapa: placas, lugares e prédios
1. O mapa NÃO tem placas de prédio: sem desenho, sem toque na placa, sem desvio do HUD. O campo `placa`
   dos dados de lugar fica sem uso; `mapa.desenharTela` é vazio (o laço ainda chama).
2. Ficam: toque no prédio, contorno dourado dos concluídos (`mundo/contorno.js`: segue o desenho do prédio, pulsa
   e solta faíscas; parado sem Animações; números em `config.mapa.contorno`; matéria de dentro brilha o anfitrião),
   placas DOS CÔMODOS nos interiores (`interiores.md` §6).
3. O menu Lugares mostra o nome e os avisos que a placa dava (`UI.avisosDoLugar(l)`, `ui/lugares.js`):
   `0/5`/`Pronto` (matéria), `Ovo` (Estábulo), `Prova` (Escola), `Sede`/`Fome`/`Banho` (Pet Shop).
   Pet Shop (🐾) e Observatório (🔭) com uma linha de informação cada.
4. O mapa (56×42, `mundo/mapa.js`; árvores em `mundo/arvores.js`, chão, ruas, clareiras e bosque em `mundo/chao.js`;
   `Mapa.fundura` lê a mesma máscara de pixels do lago) é desenhado a partir dos DADOS de `mundo/lugares.js`: `Mapa.CIDADE` (ruas,
   com `estilo` do piso, praça, lago, peças grandes da praça em `objetos`, enfeites postos à mão, `motivos` (postos
   depois do sorteio: não o embaralham), `inicio` = onde ela aparece ao abrir o
   jogo, `claude`), `Mapa.LUGARES_FIXOS`, `Mapa.CLAREIRAS` e `Mapa.RESERVADOS` (terreno guardado para um prédio que
   vem por `registrarLugar`: só grama, com o rect e o caminho que ele deve usar). A posição dela não é salva: ao
   abrir, `Mapa.inicio`. Desenho: `mapa-desenho.js` (chão, meio-fio, enfeites sorteados), `lago.js`,
   `cidade-desenho.js` (piso da praça, fonte grande animada, coreto, canteiros, postes, bancos, cercas, pedras),
   `contorno.js`, `predios.js`. Cada prédio de hoje ganha uma cerquinha na frente, com o portão na porta.
   Prédio novo no mapa = `Reino.registrarLugar` (com `caminho`) + o desenho em `Mapa.PREDIOS[sprite]` (o arquivo
   `fora.js` do prédio). Lugar sem `caminho` (clareira, matéria) desce reto da frente da porta até a rua.
   - Entram ANTES do sorteio dos enfeites (o reino é enfeitado em volta deles): `LUGARES_FIXOS`, as matérias sem
     `porCima` e as `porCima` listadas em `Mapa.LEGADO_SORTEIO` (`mundo/mapa.js`, as de hoje). Depois de uma CÓPIA do
     reino (`I.tipoSorteio`/`I.decorSorteio`): matéria `porCima` nova e `Reino.registrarLugar`. O desenho das flores
     (`Mapa.prerender` → `I.desenharEnfeites`) tira os números do sorteio (`rng(4242)`) da cópia; flor que um lugar
     novo tirou gasta os mesmos números sem pintar: as flores longe dele não mudam. Teste: `unidade/mapa-sorteio.test.js`.
   - Não acrescente id ao `LEGADO_SORTEIO` nem entrada ao `LUGARES_FIXOS`: prédio novo usa `registrarLugar`.
   - Cerquinha com portão de um `registrarLugar`: vem sozinha no terreno de `Mapa.RESERVADOS`; fora dele, `cerca: true`
     no def. Entra depois do sorteio: só muda a fileira da frente do prédio (chão livre), nada no resto do reino.
5. `Mapa.PREDIOS_ANIM[sprite](ctx, px, py, w, h, t)`: gancho na camada animada do mapa (só com Animações);
   o Observatório usa para cintilar.
6. O registro do desenho de fora pelo próprio prédio: `if (window.Mapa && Mapa.PREDIOS) Mapa.PREDIOS.<sprite> = function (ctx, px, py, w, h) {…}`.
7. Achar lugar: `npm run ver -- --previa mapa` (a prévia `ferramentas/previas/mapa.html?grade=1`: números de coluna
   e linha, o rect de cada lugar e das clareiras livres com o id, e as áreas livres pintadas de azul) e
   `npm run ver -- --livres 5x4` (= `node jogo/ferramentas/validar/lugares-do-mapa.js --livres 5x4`): os rects livres
   daquele tamanho com um `caminho` da rua até a frente da porta, caminho mais curto primeiro. Livre = tile de chão
   do mapa de verdade (`Mapa.criar` rodado num vm), sem rua, praça, água, prédio, rect de lugar, clareira nem sólido
   (árvore, arbusto, cristal). O caminho sugerido pode passar por árvore (o mapa tira o enfeite do caminho).
8. O validador (`lugares-do-mapa.js`, chamado por `validar-interiores.js`) confere cada rect (fixos, matérias e
   registrados) contra os outros lugares E contra o terreno fixo (rua, praça, água do lago, fonte, Claude, borda),
   e cada `caminho` contra os rects, a água, a fonte e a borda. "Fonte ou Claude" = tile sólido sem enfeite: as
   peças grandes da praça (`Mapa.CIDADE.objetos`) e o Claude.

## 10. Nadar no lago
```
Mapa.agua(tx, ty) → bool          // tile de água do lago (tipo 'a'); a fonte da praça não é água e segue sólida
Mapa.solido(tx, ty)               // água do lago é andável (false); borda, prédios e enfeites, sólidos
Mapa.caminho(a, b)                // destino em terra: primeiro um caminho SEM água (lago como sólido); só se não
                                  // houver (ela no meio do lago), um caminho nadando. Destino na água: cada passo
                                  // que entra na água custa config.nado.custo (3×). Na diagonal, de terra para
                                  // terra, não corta quina de água
Mapa.maisPerto(x, y, de)          // tocou em terra sólida: prefere terra; quem está nadando prefere a terra encostada
                                  // no que tocou (senão a água em volta); tocou na água: aceita água
Mapa.fundura(wx, wy) → px         // quanto o ponto está dentro da água DESENHADA (elipse do lago); negativo = margem
cena.agua(tx, ty) → bool          // adaptador do mapa; interiores não têm (= false)
Jogador.nadando() → bool          // o tile atual é água (velocidade e som)
Jogador.fundura(x, y) → 0–1       // Mapa.fundura suavizada numa rampa de 12 px; fora do mapa = 0
Jogador.velocidade() → px/s       // ALVO: base (montada 82, a pé 58) × (nadando ? config.nado.fator (0,6) : 1)
                                  // × Cuidados.fatorVelocidade(). O passo usa J.vel, que chega ao alvo aos
                                  // poucos (SUAVE_VEL 0,18 s), sem tranco na margem
Reino.Som.tocar('splash' | 'gotas' | 'gole' | 'nhac')   // entrar na água, sair, beber, comer
```
Lugar novo não entra na água: o validador acusa rect ou `caminho` no lago (§9.8).
1. Só ela anda no mapa: a água é andável para ela e a montaria (ou ela e o bebê).
2. Tocar na água: vai nadando. Tocar em terra: vai por terra sempre que existe caminho por terra, mesmo
   longo. A linha reta do `suavizar()` não corta por água que o caminho de tiles evitou.
3. Setas: entra e sai da água livremente. Nunca sai dos limites, nunca fica presa (vitórias-régias e
   juncos são enfeite).
4. Desenho na água (5 vistas e espelhos; montada e a pé com o bebê, cada corpo no próprio ponto dos pés):
   corte na linha d'água, anel de ondinhas (parado sem animação), respingo e gotinhas seguem a água
   DESENHADA (`Jogador.fundura`), não a grade (nas pontas da elipse o tile é água mas o desenho é areia).
5. Entra com fundura ≥ 0,5 (respingo + `splash`), sai com ≤ 0,15 (gotinhas por 1 s + `gotas`); a folga evita
   piscar na margem. Sem animação: nenhuma partícula; o som continua. `nadando()` continua pelo tile.
6. Desempenho: nada de canvas novo por quadro; cortes e ondinhas pré-renderizados ou com `pintor.ret`.

## 11. Desempenho
1. Média de até 16,7 ms por quadro com a CPU 4× mais lenta (`__reino.tempoQuadro()`), no mapa, nadando,
   na Pet Shop e no Planetário.
2. Nada de canvas criado por quadro; estático pré-renderizado; animações leves.
3. Comparação A/B entre versões: `node jogo/ferramentas/testes/desempenho.js <ref> <novo>` (passa com a
   nova no máximo 5% acima em cada cena).
4. Interiores (`motor/interiores-cena.js`): móveis altos, animações dos móveis baixos (folga 256 px) e o fundo
   estático só no que a câmera vê; NPCs sempre (as placas leem as caixas deles). Só as 4 cenas usadas por último
   guardam estático e sprites; a que sai é refeita no `preparar`.

## 12. Depuração (`?debug=1` → `window.__reino`, `js/debug.js`)
`cena()`, `estado()`, `pos()`, `fps()`, `tempoQuadro()`, `entrar(lugarId)`, `sair()`, `npcs()`,
`paraTela(wx, wy)`, `faltando`, `progresso()`, `avancarJogo(ms)` (= `Cuidados.avancar`), `cuidados()`
(= `Cuidados.depurar`), `surpresa()` (= `Surpresa.forcar`), `agua(tx, ty)` (tile é água?; sem argumentos:
ela está nadando?), `banho(uniId)` (= `Cuidados.banhar`), `animacaoBanho()` (= `Banho.depurar`),
`musicaAtual()`, `fotos()` (= `Fotos.depurar`), `modulos()` (ids, §14), `modulo(id)` (= `depurar()` do módulo).

## 13. Antes de mexer, rode
```
node jogo/ferramentas/gerar-index.js --conferir
node jogo/ferramentas/validar/validar-interiores.js
node jogo/ferramentas/testes/referencias.js capturar /tmp/<voce>/nova --raiz jogo --so dados,imagens
node jogo/ferramentas/testes/referencias.js comparar <referencia> /tmp/<voce>/nova
npm test
```

## 14. Módulos (sistemas)
Sistema novo (como cuidados, surpresa, fotos, banho) = arquivos na pasta dele + linhas no manifesto; nada em
`motor/main.js`, `motor/laco.js`, `sistemas/falas.js` nem `debug.js`. Registro em `js/nucleo/modulos.js`
(`node: true`, logo depois de `nucleo/registros.js`):
- `Reino.registrarModulo(def)`, `Reino.modulos` (ordem de registro = ordem do manifesto), `Reino.modulo(id)`.
- `def = { id, iniciar?(ctx), depoisDasBoasVindas?(ctx), falas?(), depurar?(), acoes?, camada? }` (tipo `ModuloDef`).

| Gancho | Quando roda |
|---|---|
| `iniciar({ novo, tutorial: null })` | ao entrar no Reino, antes das boas-vindas/tutorial (ex.: fome e sede) |
| `depoisDasBoasVindas({ novo, tutorial })` | logo depois; `tutorial` = promessa do tutorial da primeira vez ou `null` (ex.: surpresa) |
| `falas()` → `[{ texto, voz?, pacote? }]` | `Reino.Falas.todas()` (voz padrão `claude`, pacote padrão `geral`) |
| `depurar()` | `__reino.modulo(id)` |
| `camada: { ativo(), itensDesenho(pintor, t, animar), sobre?(ctx, pintor, t, animar) }` | a cada quadro, §5 passos 4 e 5 (erros com rótulo `id` e `id + '-sobre'`) |
| `acoes: { <tipo>: fn(acao, ctx) → Promise }` | quando a Mariana toca um objeto/NPC com `acao: { tipo: '<tipo>', … }` (npcs-e-dialogo.md §7) |

1. Registrar só guarda funções: nada de DOM, Progresso ou Cena no carregamento (as ferramentas carregam no Node).
2. A ordem de registro vale para tudo (chamadas e ordem do `falas.json`): mudar a posição no manifesto muda a
   ordem das vozes e pode mudar o modo determinístico (o e2e acusa).
3. `acoes`: os sistemas carregam ANTES dos NPCs, então `Reino.NPCs.registrarAcao` ainda não existe; por isso a ação
   vai no def. A conversa dos NPCs (`personagens/npcs-conversa.js`) procura o tipo nas de `registrarAcao` e, se não
   achar, nos módulos (na ordem de registro); `Reino.NPCs.acoes()` lista as duas; o `validar-interiores` aceita o tipo.
   `ctx` = `{ npc?, … }` de quem chamou; a Promise resolve quando a ação acaba (erro vira `null`, com `console.error`).
   Antes da ação, o NPC diz a fala `nova` dele (`npcs.<id>.nova` no `falas.js` do prédio) com os botões "Vamos! ✨" e
   "Agora não"; só no "Vamos!" a ação roda. Para a ação falar no balão DO NPC (retrato e voz dele), use `ctx.quem`:
   ```
   acoes: { paozinho: function (acao, ctx) {
     var t = 'Um pãozinho quentinho para você!';   // texto também em falas() do módulo, para ser gravado
     return Reino.Claude.falar(t, { quem: ctx.quem, voz: ctx.npc && ctx.npc.voz, fala: [t], modal: true });
   } }
   ```

`Reino.util.hoje()` (`nucleo/util.js`): o dia `'aaaa-mm-dd'` no fuso local, guardado por minuto (pode ser chamado
a cada quadro, até em `camada.ativo()`); lê o `Date` na hora, então segue o relógio virtual do modo determinístico.

### Camada: o formato dos itens
`camada.itensDesenho(pintor, t, animar)` devolve `[{ y, desenhar() }]`:
- `y` = a linha dos PÉS do que o item desenha, em **px do jogo** (as mesmas coordenadas de `Jogador.x/y`, dos NPCs
  e dos móveis: tile × 16 + 12 é o pé de quem está no tile). Quem está mais embaixo (y maior) aparece na frente.
- Quem ordena é o `motor/laco.js`: junta os itens do Jogador, da cena e de todas as camadas ativas e faz um só
  `sort` por `y` (empate: a ordem em que chegaram). Não ordene nem desenhe fora de `desenhar()`.
- `desenhar()` não recebe nada: use o `pintor` do fechamento (`pintor.ret(x, y, w, h, cor)` e
  `pintor.sprite(img, x, yPes)` em px do jogo, §5). `t` = `performance.now()`; `animar` = falso com Animações
  desligadas ou "reduzir movimento" (desenhe parado).
- `ativo()` roda a cada quadro: barato, sem DOM. Com `false`, nem `itensDesenho` nem `sobre` são chamados.

Onde está a Mariana e o unicórnio (`personagens/jogador.js`, global `Jogador`):
- `Jogador.x`, `Jogador.y`: os pés dela (px do jogo); `Jogador.tile()` → `{ x, y }` em tiles.
- `Jogador.posMontaria()` → `{ x, y, montado, vista, espelhar }`: os pés do unicórnio (montada: junto com ela;
  bebê: no rastro atrás dela), `vista` ('frente', 'diagFrente', 'lado', 'diagCostas', 'costas') e `espelhar` para onde ele olha.
- `Jogador.montado()`: se ela está montada (unicórnio já crescido).

Exemplo mínimo (uma estrelinha que flutua ao lado do unicórnio; atrás dele quando está mais acima):
```js
Reino.registrarModulo({ id: 'estrelinha', camada: {
  ativo: function () { return !!window.Jogador && Reino.Estrelinha.ligada; },
  itensDesenho: function (p, t, animar) {
    var m = Jogador.posMontaria(), sobe = animar ? Math.round(Math.sin(t / 300) * 2) : 0;
    return [{ y: m.y - 0.5, desenhar: function () { p.ret(m.x + 10, m.y - 20 + sobe, 3, 3, '#ffe066'); } }];
  },
} });
```

Exemplo mínimo (um sistema novo "brilho" na pasta dos sistemas, no manifesto depois dos outros sistemas):
```js
(function () {
  var B = {};
  B.falas = function () { return [{ texto: 'Que brilho lindo! ✨' }]; };
  Reino.registrarModulo({ id: 'brilho', iniciar: function (ctx) { /* começa a contar */ }, falas: B.falas,
    depurar: function () { return { ligado: true }; } });
  Reino.Brilho = B;
})();
```

## 15. Versão nova: a aba se atualiza sozinha
Módulo `versao` (`jogo/js/sistemas/versao.js`, `Reino.Versao`). Depois de publicar o jogo novo (Vercel), as
abas que ficaram abertas nos aparelhos percebem e recarregam sozinhas (decisão do Leandro: sem perguntar).
- **A impressão digital**: `npm run versao` (`jogo/ferramentas/gerar-versao.js`) grava `jogo/js/versao.json` =
  `{ versao, gerado }`, com `versao` = sha256 de `index.html` + `css/**` + `js/**` (inclusive `js/voz/`, fora o próprio
  `versao.json`), caminho e conteúdo, em ordem alfabética: a mesma árvore dá sempre o mesmo hash. O arquivo está no
  `.gitignore` (cada checkout gera o seu; `gerar-index.js --conferir` não olha para ele) e o `npm run index` (modo de
  escrita) também o grava.
- **Desligado** (`Reino.Versao.motivoDesligado(amb)`): no artifact aposentado (`window.claude.use` existe: a plataforma
  já entregava a versão nova), aberto do arquivo (`file:`) e no modo determinístico (`Reino.congelado`), a menos que a URL tenha
  `&versao=1` (o teste deste módulo). O e2e não faz fetch nenhum.
- **Conferir** (`iniciar`, ao entrar no Reino): `fetch('js/versao.json?t=…', { cache: 'no-store' })` = linha de base;
  de novo a cada `intervaloMs` e quando a aba volta a ficar visível (no máximo 1×/min). `versao.json` com 404: compara
  o texto do `index.html` (sem cache). Rede fora ou erro: ignora a leitura.
- **Confirmar**: só vale a mudança vista 2 vezes, com `confirmarMs` entre elas, e com `performance.now() > cacheMs`
  (330 s: margem que vem do servidor de casa aposentado, que deixava css/js 300 s em cache. Na Vercel, `vercel/vercel.json`
  põe `no-cache` só em `/`, `index.html`, `js/versao.json` e `sw.js`; css/js seguem o cache padrão dela, revalidado a
  cada pedido, e o service worker troca os arquivos pelo hash).
- **Quando**: parada NO MAPA há `paradaMs` = `Cena.estado() === 'mapa'`, nada bloqueado, nenhuma tela DOM, nenhuma
  pergunta surpresa, nenhum balão (Claude ou NPC), sem caminho nem setas, aba visível, sem toque nem tecla.
- **Como**: o Claude fala num balão que fecha sozinho em `avisoMs` ("Chegou novidade no Reino! ✨" + "O que você fez
  fica guardado.", `falas()` do módulo, pacote `geral`); fechado o balão (sozinho ou no "Ok!"), `P.salvar()` e,
  `esperaMs` depois (o envio ao servidor sai 1,8 s depois de gravar), `Reino.Versao._recarregar()` (= `location.reload()`;
  os testes trocam), com `Jogadores.lembrarEntrada()` antes: o reload entra direto no mapa, sem abertura nem senha
  (`save-e-mescla.md` §12). Tocar fora do balão, tecla, andar ou sair do mapa durante o aviso ou a espera: desiste e tenta de
  novo na próxima parada. Nada vai para o save.
- Números: `config.versao = { intervaloMs, confirmarMs, cacheMs, paradaMs, avisoMs, esperaMs }` (o módulo tem os
  mesmos valores padrão se faltar). Depuração: `__reino.modulo('versao')` → `{ ligado, motivo, fase, base, suspeita,
  nova, buscas, avisos, cancelados, … }` (`fase`: `desligado`, `vigiando`, `nova`, `aviso`, `gravado`, `recarregando`).
- Testes: `unidade/versao.test.js` (desligado, falas, gerador estável) e `unidade/versao.navegador.test.js`
  (`?debug=1&congelar=1&versao=1`, `page.route` servindo v1 e v2).
