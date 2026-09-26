# Contrato: cena e motor

Cobre a cena ativa (mapa ou interior), a transição em íris, a câmera, o pintor, o laço, a entrada
(toque e teclado), a ordem de desenho em camadas, o jogador, o mapa com o lago (nado) e a depuração.
Regras gerais (ambiente, convenções, testes): `README.md`.

## Índice
1. Onde está no código · 2. Cena ativa (`Reino.Cena`) · 3. Entrar e sair · 4. Transição em íris ·
5. Pintor e ordem de desenho · 6. Interface de cena · 7. Jogador · 8. Câmera ·
9. Mapa: placas, lugares e prédios · 10. Nadar no lago · 11. Desempenho · 12. Depuração · 13. Antes de mexer ·
14. Módulos (sistemas)

## 1. Onde está no código
- `jogo/js/motor/cena.js` — `Reino.Cena` (estado, entrar/sair, adaptador do mapa, ocupar/liberar, quadros).
- `jogo/js/motor/transicao.js` — íris (`TEMPO`, `TEMPO_RAPIDO`, `COR_IRIS`), evento `Reino.EVENTOS.TRANSICAO`.
- `jogo/js/motor/camera.js` — canvas, escala, câmera, pintor, `margemBaixoMapa` (cria `Reino._motor`).
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
  irPara(interiorId, chegada {x,y}, olhar {x,y}) → Promise   // interior → interior (escadas), com íris
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
4. Sem loop: `J.portaIgnorada` vale para porta, tapete e escada.
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
   (+ `camada.itensDesenho` de cada módulo com `camada.ativo()`, §14; ex.: o banho).
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
  saidaEm(tx, ty) → gatilho | null // só interiores: { id, tipo: 'saida'|'escada', x, y, para?, chegada?, olhar? }
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
         tile: {x, y},   // onde ela para (vizinho livre alcançável; gatilho: o próprio tile)
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
5. Ícone da fome/sede/banho (`Cuidados.iconeMontaria()`) desenhado acima do unicórnio (montada: acima do
   conjunto; bebê: acima do bebê), em px da tela e nítido (inteiro de px por px do ícone), como a bolha de
   status dos NPCs. Em todas as cenas (`jogador-desenho.js`).
6. Sujinho (`Cuidados.sujo()`): manchinhas no pelo e nuvenzinha de poeira (anima só com Animações).

## 8. Câmera
1. Igual no mapa e nos interiores: centraliza se couber; senão segue a Mariana com limite nas bordas.
2. Nos interiores pode passar da borda até o fim do HUD de cima e do menu de baixo.
3. Mapa: `BORDA_BAIXO` (4 fileiras de grama) desenhada abaixo do mapa e margem de baixo medida no HUD
   (`margemBaixoMapa`, `motor/camera.js`), para as portas de baixo e ela nadando não sumirem atrás do menu.

## 9. Mapa: placas, lugares e prédios
1. O mapa NÃO tem placas de prédio: sem desenho, sem toque na placa, sem desvio do HUD. O campo `placa`
   dos dados de lugar fica sem uso; `mapa.desenharTela` é vazio (o laço ainda chama).
2. Ficam: toque no prédio, arco-íris dos concluídos, placas DOS CÔMODOS nos interiores (`interiores.md` §6).
3. O menu Lugares mostra o nome e os avisos que a placa dava (`UI.avisosDoLugar(l)`, `ui/lugares.js`):
   `0/5`/`Pronto` (matéria), `Ovo` (Estábulo), `Prova` (Escola), `Sede`/`Fome`/`Banho` (Pet Shop).
   Pet Shop (🐾) e Observatório (🔭) com uma linha de informação cada.
4. Prédio novo no mapa = entrada em `Mapa.LUGARES_FIXOS` (`mundo/lugares.js`) COM `caminho` (lista
   explícita dos tiles de rua) + o desenho em `Mapa.PREDIOS[sprite]` (`mundo/predios.js` ou o arquivo `fora.js`
   do prédio). Lugar com `caminho` (ou matéria com `porCima: true`) entra depois do sorteio dos enfeites:
   o resto do reino fica com as mesmas árvores e flores.
   - O desenho das flores (`Mapa.prerender` → `I.desenharEnfeites`) tira os números do sorteio sequencial
     (`rng(4242)`) de uma CÓPIA do reino de hoje (`I.tipoSorteio`/`I.decorSorteio`, feita no `Mapa.criar` depois
     dos lugares de hoje e antes dos novos). Flor que um lugar novo tirou gasta os mesmos números sem pintar: as
     flores longe dele não mudam. (O chão não usa sorteio.) Teste: `unidade/mapa-sorteio.test.js`.
   - Entram ANTES da cópia: `LUGARES_FIXOS` e as matérias `porCima` listadas em `Mapa.LEGADO_SORTEIO`
     (`mundo/mapa.js`, hoje `['portugues']`). Depois: matéria `porCima` nova e `Reino.registrarLugar`.
     Não acrescente id ao `LEGADO_SORTEIO` nem lugar com caminho ao `LUGARES_FIXOS`: prédio novo usa `registrarLugar`.
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
   e cada `caminho` contra os rects, a água, a fonte e a borda.

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
