# Contrato: cena e motor

Cobre a cena ativa (mapa ou interior), a transição em íris, a câmera, o pintor, o laço, a entrada
(toque e teclado), a ordem de desenho em camadas, o jogador, o mapa com o lago (nado) e a depuração.
Regras gerais (ambiente, convenções, testes): `README.md`.

## Índice
1. Onde está no código · 2. Cena ativa (`Reino.Cena`) · 3. Entrar e sair · 4. Transição em íris ·
5. Pintor e ordem de desenho · 6. Interface de cena · 7. Jogador · 8. Câmera ·
9. Mapa: placas, lugares e prédios · 10. Nadar no lago · 11. Desempenho · 12. Depuração · 13. Antes de mexer

## 1. Onde está no código
- `jogo/js/motor/cena.js` — `Reino.Cena` (estado, entrar/sair, adaptador do mapa, ocupar/liberar, quadros).
- `jogo/js/motor/transicao.js` — íris (`TEMPO`, `TEMPO_RAPIDO`, `COR_IRIS`), evento `Reino.EVENTOS.TRANSICAO`.
- `jogo/js/motor/camera.js` — canvas, escala, câmera, pintor, `margemBaixoMapa` (cria `Reino._motor`).
- `jogo/js/motor/laco.js` — o quadro (camadas) e o laço (`requestAnimationFrame`).
- `jogo/js/motor/entrada.js` — teclado, toque no canvas, setas na tela, agir no alvo.
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
   (+ `Reino.Banho.itensDesenho` durante o banho).
5. `cena.desenharSobre(ctx, pintor, t, animar)` (opcional): placas dos cômodos nos interiores (quase
   transparentes quando cobrem a Mariana) (+ `Reino.Banho.sobre` durante o banho).
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
2. Enter/Espaço → `alvoPerto`.
3. Tudo ignorado quando `Reino.Cena.bloqueado()`.

## 7. Jogador — `Jogador` (`personagens/jogador.js`)
1. Consulta sempre `Reino.Cena.atual()` (com `Mapa` como reserva antes de a cena existir) para `solido`,
   `caminho`, `portaEm`/`saidaEm`.
2. `J.atualizar(dt, teclas, aoPisar)`: andando com as setas, ao pisar num tile com `portaEm` ou `saidaEm`,
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
5. `Mapa.PREDIOS_ANIM[sprite](ctx, px, py, w, h, t)`: gancho na camada animada do mapa (só com Animações);
   o Observatório usa para cintilar.
6. O registro do desenho de fora pelo próprio prédio: `if (window.Mapa && Mapa.PREDIOS) Mapa.PREDIOS.<sprite> = function (ctx, px, py, w, h) {…}`.

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
`musicaAtual()`, `fotos()` (= `Fotos.depurar`).

## 13. Antes de mexer, rode
```
node jogo/ferramentas/gerar-index.js --conferir
node jogo/ferramentas/validar/validar-interiores.js
node jogo/ferramentas/testes/referencias.js capturar /tmp/<voce>/nova --raiz jogo --so dados,imagens
node jogo/ferramentas/testes/referencias.js comparar <referencia> /tmp/<voce>/nova
npm test
```
