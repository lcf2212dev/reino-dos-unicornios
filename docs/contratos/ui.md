# Contrato: telas (UI), foco, teclado, guarda de toque e HUD

Cobre `Reino.UI` como camada: a pilha de telas por cima do mapa, o Esc e o Tab, para onde vai o foco, a guarda de
toque de toda tela que gasta, os botões do HUD e a Área dos pais. O que cada tela mostra fica no contrato do
assunto (`loja.md`, `cuidados.md`, `surpresa.md`, `fotos.md`); regras locais da pasta: `jogo/js/ui/CLAUDE.md`.

## Índice
1. Onde está no código · 2. Pilha de telas · 3. Teclado: Esc e Tab · 4. Foco · 5. Guarda de toque ·
6. HUD e `UI.registrarBotaoHud` · 7. Área dos pais · 8. Acessibilidade · 9. Antes de mexer ·
10. Pixel art e direção de arte (10.1–10.7 moldura; 10.8 em diante: cor, texto, pixel, escala, luz, movimento,
   estados e componentes)

## 1. Onde está no código
- `jogo/js/ui/base.js` — cria `Reino.UI` e `Reino._ui`: pilha, `UI.painel`, `UI.escolher`/`UI.confirmar`, foco,
  Esc/Tab, guarda de toque (`SEGURAR_MS` 800, `TOQUE_PERTO_PX` 40, `GUARDA_MAX_MS` 2000, `ARMAR_MS` 1100).
- `jogo/js/ui/hud.js` — HUD (chips, dock, tela cheia) e `UI.registrarBotaoHud`; `jogo/js/ui/hud-fotos.js` — 📷 e álbum.
- `jogo/js/ui/pais.js` — Área dos pais. `jogo/js/ui/ajustes.js` — Ajustes (caminho até a Área dos pais).
- CSS: `ui-base.css` (marca de foco, `.armando`, `.toque-ignorado`), `ui-telas.css`, `ui-hud.css`.
- `Reino._ui` é interno das partes de `js/ui/` (lista no fim de `base.js`), não é API do jogo.

## 2. Pilha de telas
```
UI.abrirTela(nome) → section.tela.tela-<nome> (role dialog, aria-modal) em #telas, no topo da pilha
UI.fecharTela(t?)          // tira t (padrão: a de cima) da pilha e do DOM; UI.atualizarHUD()
UI.fecharTodas()  UI.temTela() → bool
UI.painel(nome, titulo, { semFechar?, aoFechar? }) → { tela, conteudo, card }   // cartão com título e ✕
UI.escolher(msg, [{ rotulo, valor, principal?, seguro?, gasta? }], classe?) → Promise(valor)
UI.confirmar(msg, sim, nao, gasta?) → Promise(bool)   // atalho: dois botões, o "não" é o seguro
```
1. Toda tela por cima do mapa passa por `UI.abrirTela` (direto ou pelo `UI.painel`/`UI.escolher`). Tela nova =
   arquivo novo em `js/ui/` + linha no manifesto (`jogo/js/manifesto.js`).
2. Abrir e fechar emitem `Reino.EVENTOS.TELAS` (tamanho da pilha) e ligam/desligam `body.com-tela`. Quem precisa
   saber de tela aberta ouve esse evento ou pergunta `UI.temTela()` (surpresa, cuidados, fotos).
3. Com tela aberta o HUD fica atrás: um clique nele é descartado (um Enter num botão do HUD não empilha outra tela).
4. `UI.painel`: ✕, tocar fora do cartão e Esc fecham (os três pelo mesmo caminho do ✕), salvo `semFechar`.
5. `UI.escolher` resolve com o `valor` do botão tocado e fecha o diálogo antes de resolver.
6. Quem lê o estado numa tela aberta chama `P.estado()` na hora do toque (`save-e-mescla.md` §8).

## 3. Teclado: Esc e Tab
1. Esc (no `window`, depois dos ouvintes do `document`; ignora `defaultPrevented` e repetição) age na tela de
   cima pelo `t._aoEsc`: ✕ no painel, o `seguro` no `UI.escolher`. Tela sem `_aoEsc` não fecha pelo Esc.
2. Balão do Claude aberto por cima: o 1º Esc fecha o balão (`Reino.Claude.fechar`), o seguinte a tela.
3. Num campo de texto (o nome do unicórnio) o Esc e o Enter/Espaço são do campo.
4. Tab/Shift+Tab ficam presos na tela de cima (mais os botões do balão do Claude, se aberto), em volta; do
   título focado (tabindex -1) o Tab segue dali para baixo. Nunca deixar o foco cair no HUD atrás.
5. Enter/Espaço segurados (repetição automática) não acionam de novo o botão em foco.
6. Tela que trata o próprio Esc (a surpresa) marca `preventDefault` no `document`.

## 4. Foco
1. Abrir: se a tela não focou nada em 60 ms, o foco vai para a PRÓPRIA tela (tabindex -1, como um diálogo), não
   para o 1º botão: um Enter logo depois não age sozinho; o Tab leva ao 1º botão. `UI.escolher` foca o `seguro`
   (ou o 1º) em 30 ms. Balão do Claude com foco fica como está.
2. Trocar por dentro (questão nova, fim da sala, resultado): `UI.focarTroca(alvo, titulo, calma?)` — só pelo
   teclado; vai para o `alvo` se ele aparece sem rolar, senão para o título. Pelo toque nada muda.
3. `UI.focarTeclado(e, calma?)` foca e rola só as caixas de dentro da tela de cima (nunca `scrollIntoView`);
   `calma` (ms) descarta o Enter/Espaço que chega logo depois no botão novo. `UI.porTeclado()` diz se a última
   coisa usada foi o teclado.
4. Fechar: o foco volta para quem abriu (`t._focoAntes`) se ainda existe na tela de baixo, senão para o 1º
   controle da tela de baixo, senão para o mapa (`#reino`). Fechada com toque/mouse de volta ao mapa, o foco
   SAI do HUD (o Espaço de andar reabriria a tela). Tela que não deve devolver o foco zera `_focoAntes`.
5. Salas, treino e provas (`atividades/missao.js`, `treino.js`, `provas.js`), pelo teclado: a caixa rola até o
   botão focado; ao trocar de questão ou sair do ritual de respirar o foco vai para a questão
   nova (`UI.focarTroca`, `CALMA_TROCA` 400 ms: o Enter que chega logo depois não escolhe nada); depois de
   escolher um bloco (`desafios/sequencia.js`) o foco fica no monte (o bloco que ficou no lugar; monte vazio: a
   última peça posta). Nada disso muda pelo toque.
6. Como o foco aparece (anel diferente da seleção, só pelo teclado): §10.19. Tela aberta pelo teclado ganha
   `.foco-teclado` e contorno próprio (`ui-telas.css`). Botão `.armando` com foco aparece aceso.

## 5. Guarda de toque (toda tela que gasta estrela ou comida)
Por quê: um botão que some no 1º toque deixava o 2º toque cair no que aparece embaixo (comprou comida, trocou
enfeite e ligou interruptor sem ela querer).
```
UI.segurarToques(ms = 800)   // chamada ao abrir/fechar tela por toque (até 600 ms antes): cliques a até 40 px
                             // desse toque são ignorados; cada toque ignorado ali estica +800 ms, até 2 s. Longe, vale
UI.toqueSegurado(x, y) → bool   // também o pointerdown do mapa (motor/entrada.js): o 2º toque no "Ir" não troca o destino
```
1. Só toque e mouse de verdade (`isTrusted`, `detail > 0`). O toque ignorado afunda o botão de leve, sem som.
2. Botões que gastam (`gasta: true` no `UI.escolher`): nascem apagados (`.armando`, `aria-disabled`) e acendem
   depois de 1,1 s (`ARMAR_MS`) SEM toque na tela; cada toque recomeça a espera. Barrinha enche durante a
   espera ("Espera um pouquinho…" com movimento reduzido). O `seguro` vale na hora.
3. Sob o dedo: se o toque que abriu o diálogo (até 600 ms antes) cai a 40 px de um botão que gasta, ele troca de
   lugar com o seguro (no DOM: o Tab acompanha); se ainda sobrar, o diálogo se move até o seguro ficar sob o
   dedo; se nem assim, um toque a 40 px dali não gasta.
4. Teclado sem espera: Enter/Espaço (clique com `detail` 0) e `.click()` de código passam sempre, inclusive num
   botão `.armando` (ela chega nele com um Tab de propósito).
5. Toda compra pergunta ANTES de gastar, com os botões de gastar `gasta: true` e um `seguro`. Nunca gastar e
   perguntar depois.
6. Guardas próprias de uma tela: Ajustes (1º segundo sem mudar interruptor), Loja (`loja.md` §6), surpresa
   (`surpresa.md` §5). Tela nova que precisa de mais que isto usa as funções acima, não inventa outra espera.

## 6. HUD e `UI.registrarBotaoHud`
```
UI.registrarBotaoHud({ id, ordem, criar() → botão, pintar?(), eventos?: [Reino.EVENTOS.X] })
```
1. Botão novo no HUD de cima entra por registro, num arquivo da feature; não se edita `hud.js`. Ordem: tela
   cheia, depois os registrados por `ordem` (📷 10, álbum 20). O mesmo `id` substitui o anterior.
2. Registrar antes de `UI.montarHUD` (no carregamento); `criar` roda a cada montagem.
3. `pintar` roda na montagem, nos eventos `CENA`, `TELAS`, `OCUPADA`, `TRANSICAO` (ou nos `eventos` dados) e de
   500 em 500 ms: só mexa no DOM quando o estado mudar.
4. Botão indisponível fica apagado com `aria-disabled` e continua focável (não `disabled`).
5. Enter/Espaço com o foco num controle (botão do HUD, chip, "Ok!" do balão, campo) são dele: o `motor/entrada.js` não age
   no alvo perto da Mariana (os botões 📷 e álbum ainda param o keydown com `stopPropagation`).
6. Os blocos do HUD (`.hud-esq`, `.hud-dir`, `.hud-botoes`) têm `pointer-events: none`; só botões e chips pegam
   toque (senão o 📷 criava uma faixa morta sob o chip da montaria no celular).
7. Celular (≤ 480 px): `.hud-botoes` vira coluna ao lado do chip da montaria; hoje são 3 (tela cheia, 📷,
   álbum). Botão a mais só depois de conferir nos 3 tamanhos (`npm run ver`). O dock de baixo tem 4 botões e
   não ganha um 5º (420 px numa tela de 390 cortava).

## 7. Área dos pais (`UI.telaPais`)
1. Pelo menu (Ajustes → 🔒 Área dos pais) sempre pede o PIN (`Reino.config.pinPais`, teclado na tela, até 8
   dígitos). Depois de registrar um pagamento ou começar um novo ciclo, ela fecha e reabre na hora já
   desbloqueada (`abrirPais(true)`): continua aberta sem pedir o PIN de novo.
2. Mostra, por matéria, salas feitas, ganho, pago, a pagar, treino e provas; grava só o pagamento
   (`P.registrarPagamento`), e reabre no bloco daquela matéria.
3. "Começar novo ciclo" (`P.novoCiclo`) e "Apagar tudo" (`P.apagarTudo`, com dupla confirmação e recarga) pedem
   `UI.confirmar`. Novo ciclo soma 1 ao `ciclo` e zera salas, treinos e pagamentos (mais os campos
   `novoCiclo: 'zera'`); unicórnios, estrelas, enfeites, cuidados e despensa ficam. Apagar tudo começa um estado
   novo com `geracao` + 1. Detalhes: `save-e-mescla.md` §8 e §11.
4. Novo ciclo, Apagar tudo e pagamento: só no ambiente de teste, nunca no progresso real (`save-e-mescla.md` §9).

## 8. Acessibilidade (regra do projeto)
1. Teclado sim: foco visível, Tab preso na tela de cima, Esc fecha, o seguro recebe o foco, nada age sozinho
   com um Enter logo depois de abrir ou trocar (§3, §4).
2. Leitor de tela não: itens que só servem a leitor de tela (regiões ao vivo, textos escondidos, anúncios)
   ficam de fora. `aria-label` em botão só de ícone e `role`/`aria-checked` dos interruptores continuam.
3. Animações desligadas e "reduzir movimento" valem nas telas (`body.sem-animacao`, `prefers-reduced-motion`).
4. Texto para criança: pt-BR correto e carinhoso; quebra de palavra: §10.17; emoji com desenho
   (`jogo/js/CLAUDE.md`, Arte).

## 9. Antes de mexer, rode
```
npm test
npm run e2e
```
Ver uma tela nos 3 tamanhos: `npm run ver -- --ir <lugar>` (ou `--tela`, cenários em `jogo/ferramentas/testes/cenario-telas.js`).

## 10. Pixel art e direção de arte
Tudo na tela é pixel art, também o que é CSS e o que é desenhado no canvas. Os itens 1 a 7 são a moldura (citados
como §10.1 a §10.7); as subseções 10.8 em diante são a direção de arte. Código novo já nasce nelas; onde o código de
hoje ainda não segue, o item do `TODO-VISUAL.md` leva até a regra. O porquê das escolhas de produto (escala do mundo,
cor por matéria, festa): `docs/decisoes/direcao-de-arte.md`.
1. Cantos: `border-radius` só com `var(--canto)`, `var(--canto-grande)` ou `var(--redondo)` (o antigo círculo), ou 0.
   `ui-base.css` põe `corner-shape: notch` em tudo: o canto vira um degrau reto e a borda e a sombra o seguem.
   Sem suporte (Safari), canto reto. Nada de `999px` (pílula) nem `50%`.
2. Cor: nada de degradê liso. Faixas chapadas com paradas duras (`#a 0 33%, #b 33% 66%, #c 66%`), de 2 a 4 faixas,
   só em `linear-gradient`: `radial-gradient` desenha círculo de borda lisa (mesmo com parada dura), então não se usa.
3. Sombra e brilho: deslocamento duro, sem desfoque (`0 5px 0`); brilho = contorno de 1 pixel com `drop-shadow`
   sem desfoque nos 4 lados. Nada de `blur`, desfoque em `box-shadow`/`text-shadow`/`drop-shadow` nem `shadowBlur`.
4. Nada de girar desenho pixel (`rotate` borra os pixels): balanço é deslocamento em degraus.
5. Canvas: sem `arc`/`ellipse`/degradê/`shadowBlur` que apareçam lisos na tela; forma redonda vem dos helpers
   pixel (`js/arte/desenho.js`) e luz em faixas.
6. Emoji na tela: sempre com desenho 16×16 (`js/arte/icones/`); o glifo reduzido é só a rede de segurança.
7. Fonte: a Press Start 2P mora no jogo (`css/press-start-2p.woff2`, `@font-face` em `ui-base.css`, `font-display:
   block`): sem rede e no app instalado o texto continua pixel. Nada de fonte de fora.

### 10.8 Cor: tokens e papéis
A moldura (painel, botão, chip, balão, cabeçalho) usa creme, laranja e âmbar. Rosa, lilás, azul e verde são cor de
desenho, de raridade e de matéria, nunca de moldura. Toda cor de CSS vem de um token do `:root` de `ui-base.css`;
literal fora do `:root` só em desenho feito em código (paletas de sprite e de ícone).

Os nomes da tabela já valem (D10-01): `--laranja*`, `--ambar*`, `--verde-folha` e `--papel-quente`; `--rosa` e `--lilas`
são as cores reais de desenho. `--papel-2` já é o `#efe8e2` do estado indisponível; o creme `#fff6e4` que ele era
vive em `--papel-leve` (temporário: os usos passam para `--papel` ou `--papel-quente` no D10-14). Texto de
raridade: `--raro-texto`, `--epico-texto`, `--lendario-texto`; texto laranja: `--laranja-escuro`. Seleção roxa
cheia com texto branco usa fundo `--roxo-texto` (branco sobre `--roxo` dá 4,3:1).

| Token | Hex | Papel |
|---|---|---|
| `--tinta` | `#3a2446` | contorno, texto, sombra dura (o `#2a1838` fica só no olho dos sprites) |
| `--tinta-suave` | `#6b5378` | texto secundário, placeholder, texto do estado indisponível (6,35:1 no `--papel`) |
| `--noite` | `#24162e` | fundo das telas escuras (lista abaixo) |
| `--noite-2` | `#33224a` | degrau de `--noite`: cartão, faixa e estrela sobre fundo escuro |
| `--papel` | `#fff8ee` | fundo de painel |
| `--papel-quente` | `#fff1cc` | cabeçalho, chip, balão |
| `--papel-2` | `#efe8e2` | fundo do estado indisponível (§10.19); `--tinta-suave` sobre ele: 5,5:1 |
| `--laranja`, `--laranja-escuro`, `--laranja-claro` | `#ff8a3d`, `#a8480a`, `#ffe4c2` | ação principal; o escuro é o laranja de texto (5,5:1 no `--papel`, 5,2:1 no `--papel-quente`) |
| `--ambar`, `--ambar-claro` | `#f0a04a`, `#fff1d0` | enfeite secundário da moldura |
| `--ouro` | `#ffd34d` | estrela, moeda |
| `--roxo`, `--roxo-texto` | `#7c5cff`, `#5a3cc4` | seleção; link e texto roxo (6,9:1). `--roxo` nunca é cor de texto |
| `--certo`, `--certo-fundo` | `#1b6e45`, `#dff8e8` | acerto (5,6:1 no fundo verde) |
| `--erro`, `--erro-fundo` | `#b02c47`, `#ffe0e0` | erro de item, sair, perigo (5,1:1 no fundo, 6,0:1 no `--papel`) |
| `--rosa`, `--lilas` | `#ff7eb6`, `#b58cff` | cor de desenho (nunca moldura); `--lilas` é o texto secundário em tela escura (6,6:1 no `--noite`) |

Raridade (texto, fundo, desenho), em cartas, ovos, prova, loja e prêmios; o contorno continua `--tinta` e a cor vai
no fundo ou numa faixa interna:

| Raridade | Texto | Fundo | Desenho |
|---|---|---|---|
| comum | `#6b5378` | `#fff8ee` | `#ff9cc6` |
| raro | `#2b5ea8` (5,3:1) | `#dcebff` | `#5fb4ff` |
| épico | `#5b2aa8` (6,9:1) | `#eadcff` | `#a66bff` |
| lendário | `#8a5200` (5,1:1) | `#ffe39a` | `#ffb020` |

O lendário é sempre dourado; o arco-íris só entra como brilho. Cor de matéria: §10.22.

1. Contraste: texto ≥ 4,5:1 sobre o fundo real (≥ 3:1 só com 24 px ou mais). `--tinta` no `--papel` dá 13,1:1. O
   texto do botão laranja é `--tinta` (5,9:1): não há texto branco sobre laranja.
2. Estado pela cor (seleção, certo, erro) muda fundo e borda do controle; o contorno de desenho continua `--tinta`.
3. Telas escuras, só estas: voo, espaço e planetas, o vão dos interiores e a tela de jogadores. Todas com `--noite`
   (degrau `--noite-2`); o resto do jogo é claro. Nelas o texto é `--papel`, o secundário `--lilas`
   (`--tinta-suave` não se usa: 2,6:1), e ícone ou sprite de contorno escuro ganha brilho de 1 pixel em `--papel`
   (§10.3).

### 10.9 Tipografia
1. Escala na grade de 8 px da Press Start 2P: 8, 16 e 24 px (32 e 48 só na abertura e na festa, §10.16). Texto que
   a criança precisa ler: 16 px. 12 px só em rótulo auxiliar (dock, data, legenda de chip) e na carta da memória
   quando a palavra mais longa não cabe (desce 16 → 12, sem partir a palavra). 8 px só em número sobreposto a ícone
   (contador, selo); palavra nunca abaixo de 12 px. Nada de `em` nem de tamanho fora da escala.
2. Entrelinha: 1,5 no corpo e 1,25 no título.
3. Sem negrito: só o peso 400 (a fonte não tem outro). Hierarquia por tamanho, por cor (`--tinta` e
   `--tinta-suave`) e por faixa.
4. "Letras grandes" (Ajustes, `ajustes.js`) sobe cada tamanho um degrau da escala (12 → 16, 16 → 24, 24 → 32; o
   8 do selo fica), nunca um multiplicador.
5. Texto do canvas (placa do cômodo, moldura da foto) usa o mesmo token do DOM em px CSS: tamanho em px de aparelho
   = token × `devicePixelRatio`, arredondado ao múltiplo de 8 mais perto. A placa tem 16 px CSS nos 3 tamanhos.
6. Caracteres: a fonte não tem "√", "−", "●", "✓" nem o hífen inquebrável (U+2011). Use "-" no lugar de "−", o ✓
   com desenho 16×16 (§10.6), casa cheia desenhada em CSS no lugar de "●"; "–" e "×" existem. Caractere novo em
   texto de tela: confira que a fonte o tem (o `validar-conteudo.js` confere matérias, provas e os textos de `js/ui/`).
7. Ligaduras desligadas no seletor `*` (`font-variant-ligatures: none`; campos sem `font: inherit` também) e, no canvas,
   `ctx.textRendering = 'optimizeSpeed'` antes do `fillText`: com elas "fi" vira um glifo só e o "i" some.

### 10.10 Pixel da interface: bordas, sombras, ícones e retratos
1. Na interface, 1 pixel de arte = 2 px CSS. Toda medida de desenho é múltiplo de 2 px CSS.
2. Borda: 2 px; 4 px em moldura grande (painel, balão, tela, retrato). Nada de 1, 3 ou 5 px.
3. Sombra dura para baixo: 2 px (chip, botão pequeno) ou 4 px (botão grande, painel). Botão apertado desce 2 px e
   perde a sombra na mesma medida.
4. Canto: `--canto-pequeno` (4 px) em botão de até 56 px de lado (✕, tela cheia, 📷, álbum): com `--canto-grande`
   o degrau de 9 px desenha um "+". Acima disso, `--canto` e `--canto-grande` (§10.1).
5. Ícone 16×16 a 32 px CSS; 64 px em destaque; dentro de uma linha de texto, do tamanho da letra (16 ou 24 px).
   Sempre em escala inteira (`PA.escalaNitida`); `paraDOM` só com escala par.
6. Retrato de personagem (balão de NPC e do Claude): 4 px CSS por pixel, o mesmo para todos, em quadro com borda de
   4 px e fundo chapado; a cabeça ocupa de 60 a 80 % da altura do quadro, sem cortar chapéu nem antena.

### 10.11 Escala do mundo (câmera)
O mundo (mapa e interiores) desenha em px de aparelho com escala inteira (`camera.js`, `redimensionar`). Regra:
```
escala = round(altura da tela em px de aparelho / (16 × 18))        // alvo: 18 tiles de altura
escala = max(escala, round(2 × dpr))                                 // nunca menos de 2 px CSS por pixel
escala = min(escala, floor(menor lado em px de aparelho / (16 × 8)))   // o lado menor mostra ≥ 8 tiles
escala = max(escala, round(2 × dpr))                                 // de novo: o mínimo de 2 px CSS vence
```
Quando o "lado menor ≥ 8 tiles" pediria menos de 2 px CSS por pixel (tela muito estreita), vence o mínimo de 2 px
CSS: o personagem continua grande para o toque e a tela mostra menos de 8 tiles.
| Tamanho | Escala (aparelho → CSS) | Tiles visíveis (altura × largura) | Criança (17 px) |
|---|---|---|---|
| celular 390×844, dpr 3 | 9 → 3 px | 17,6 × 8,1 | 51 px CSS |
| tablet 820×1180, dpr 2 | 8 → 4 px (igual a hoje) | 18,4 × 12,8 | 68 px CSS |
| notebook 1366×768, dpr 1 | 3 → 3 px | 16 × 28,5 | 51 px CSS |

Resultado: o notebook mostra de 16 a 20 tiles de altura e, no celular, todo personagem tem ≥ 44 px CSS (e o ícone
de status, 48 px CSS). O ícone de status do NPC acompanha essa escala.

### 10.12 Tabela de alturas (px de arte, contorno incluído)
Medida no sprite, da primeira à última linha com desenho (`npm run ver -- --previa sprites`,
`npm run ver -- --previa interiores:castelo`).

| Peça | Faixa | Hoje (medido em 29/09) |
|---|---|---|
| criança (Mariana a pé, NPC criança, ET criança, fada) | 16–18 | Mariana 17, `lab-malu` 17, ETs crianças 17–18, fada 17 |
| adulto e idoso sem chapéu | 21–24 | 21–24 (D4-15) |
| chapéu, coque, pluma, antena, elmo | até +4 sobre o teto da faixa (adulto: ≤ 28), nunca acima de 2 tiles (32) | até 27 (elmo, chef, festa) |
| ET adulto e vovó | 21–24 e ≥ 2 a mais que a criança do planeta | 24; 26 com antena ou orelha |
| unicórnio filhote (estágios 0 e 1) | 16–18 | 17–18 |
| unicórnio adulto (estágios 2 e 3) | 22–24 | 23 |
| Mariana montada no filhote | 18–22 de lado, de costas e nas diagonais; de frente até 26 (exceção: as pernas dela ficam à vista sobre o unicórnio, D3-04) | lado 18, costas 18, diagonais 19–22, frente 26 |
| Mariana montada no adulto | altura do unicórnio até +4 (23–28); de frente até 30 (mesma exceção) | 23; diagonal de frente 27; frente 30 |
| bicho e criatura grande (dragão, robô) | faixa de adulto | dragão 21, robô 24 |
| estátua e armadura de enfeite | ≤ o adulto ao lado | — |
| porta de prédio (mapa) | 22–28 | 22–25 (D2A-04) |
| poste | 32–36 | 34 |
| arvoreta (1 tile) | 16–20 | 20 |
| árvore comum (copa de 2 a 3 tiles) | ≥ 40 | 43–45 |
| árvore de meia altura (onde a copa cobriria rua, D1-06) | 34–36 | 35–36 |
| mascote Claude | faixa de criança | 18 |

Adulto e criança diferem ≥ 4 px. Peça nova entra na faixa do papel dela; papel novo, linha nova aqui.

### 10.13 Luz, sombra e véu
1. Luz de cima (e da esquerda): brilho de 1 pixel em cima e à esquerda do objeto; a luz nunca é pintada por cima do
   contorno.
2. Sombra de chão reta, embaixo e centrada, em toda peça sólida do mundo: elipse de pixel com alfa de 0,15 a 0,25,
   no máximo 2 níveis, 2 a 3 px de arte fora da base (a sombra coberta pelo próprio desenho não conta).
3. No CSS, sombra só para baixo (`0 4px 0`): nada de deslocamento lateral.
4. Véu de luz (vinheta, halo, escurecer atrás do painel): degraus na grade de pixel, com diferença de alfa ≤ 0,04
   entre vizinhos, ou pontilhado ordenado 2×2 entre dois níveis. Faixa dura de alfa maior aparece como defeito.

### 10.14 Contorno
1. Todo desenho sólido tem contorno de 1 pixel em `--tinta` (`#3a2446`; `PA.contornar` no canvas).
2. Exceções: água, luz (chama, brilho, raio de luz), céu e nuvem, sombra de chão e partícula de 1 a 2 pixels
   (confete, brilhinho). Mesmo assim, a água ganha linha d'água de 1 pixel e a luz, borda de brilho.
3. Silhueta de trancado ou vazio: preenchimento `--tinta-suave` com contorno `--tinta`; o "?" (≥ 7 px de arte de
   altura) sai em `--papel` com contorno `--tinta`. Nada de silhueta clara sem contorno.

### 10.15 Movimento
1. `scale` só por fator inteiro em desenho pixel (e nunca em texto); pulso = deslocamento de 1 pixel de arte ou
   troca de quadro.
2. Desenho pixel anda em degraus: `steps()` ou deslocamento inteiro. Translação suave só em painel inteiro.
3. Durações só por token: `--rapido` 120 ms (resposta ao toque), `--normal` 240 ms (abrir, fechar, trocar),
   `--lento` 600 ms (chegada, festa curta). Repetição infinita tem período de 2 × `--lento` ou mais, e o chamado de
   atenção repete poucas vezes e para.
4. `opacity` só em véu, em partícula e na entrada e saída de uma tela inteira (≤ `--normal`); nunca como estado
   parado (§10.19).
5. Exceções escritas (o validador de pixel aceita só estas):
   - `armar-encher` (`ui-base.css`): barra de preenchimento em `scaleX`, dura `ARMAR_MS`;
   - `.balao-respira` (Ritual da Calma, `ui-prova.css`): cresce e encolhe contínuo, de propósito, no ritmo da
     respiração (3,1 s);
   - `conic-gradient` da aura (`ui-hud.css`): até o D8A-09 redesenhar o chip;
   - confete e festa: duração da escala de festa (§10.16).
6. Toda animação tem saída em `body.sem-animacao` e `prefers-reduced-motion` (§8.3); o que o canvas desenha fica
   parado quando as animações estão desligadas.

### 10.16 Escala de festa
A festa cresce com o feito: acerto < sala < prova < matéria completa. Compra é festa de acerto.

| Nível | Quando | Título | Movimento | Som |
|---|---|---|---|---|
| 1 | acerto, compra, cuidado feito | não muda | brilho de 3 quadros no item; sem confete | curto |
| 2 | sala concluída, treino | 24 px | pulinho do emoji em degraus e brilhinhos; confete 40 | fanfarra |
| 3 | prova terminada, ovo que nasce | 32 px | confete 90 | fanfarra |
| 4 | matéria completa | 48 px (32 no celular, se não couber) | confete 160 e emoji grande | fanfarra longa |

Com animações desligadas fica só o título e o som. O ovo nasce no nível 3 em toda raridade; o lendário ganha o
brilho arco-íris, não mais confete.

### 10.17 Quebra de palavra
1. No `body`: `overflow-wrap: break-word` e `hyphens: manual`. `overflow-wrap: anywhere` é proibido.
2. Palavra longa (9 letras ou mais) só quebra na sílaba, com o hífen à vista (o hífen suave do `hifenizar`,
   `ui/pecas.js`). Nunca no meio sem hífen.
3. Nome próprio e rótulo curto (até 12 letras: botão, chip, título de cabeçalho) não quebram (`nowrap`); se não
   couber, descem um degrau da escala (16 → 12), nunca para tamanho fora dela.
4. Número, artigo e preposição de 1 a 2 letras, "R$" e o emoji do fim ficam colados à palavra vizinha com espaço
   inquebrável (U+00A0). Palavra composta ("arco-íris") fica num `span` com `nowrap`.

### 10.18 Área útil
1. O JS escreve no `:root` três variáveis, em px CSS: `--hud-topo` (fim do HUD de cima), `--dock-altura` (altura do
   dock de baixo) e `--balao-altura` (altura do balão aberto; 0 fechado).
2. Área útil = a tela menos `--hud-topo` em cima e o maior entre `--dock-altura` e `--balao-altura` embaixo, com
   folga de 8 px de cada lado.
3. A câmera do mapa e dos interiores, o balão e os painéis leem essas mesmas variáveis (nenhum mede o HUD por
   conta própria). Objeto de toque e texto ficam dentro da área útil.

### 10.19 Estados de controle: indisponível, erro de item e foco
1. Indisponível (trancado, desligado, sem estrelas, esperando a voz): fundo `--papel-2` chapado, texto
   `--tinta-suave`, borda `--tinta`, sombra de 2 px, e um ícone 16×16 que diz por quê (🔒 trancado, relógio
   esperando, estrela vazia sem estrelas). Nada de `opacity` nem `grayscale` no texto. O botão segue focável, com
   `aria-disabled` (§6.4).
2. Erro de item (opção errada, par errado, peça fora do lugar): estado parado, com fundo `--erro-fundo` e borda
   `--erro`, até o item ser apagado ou até o próximo toque; o tremor vem por cima só com animação. A opção errada
   que fica na tela vem riscada, sem `opacity`, com ≥ 4,5:1.
3. Acerto: fundo `--certo-fundo` e borda `--certo`.
4. Seleção: `--roxo` (borda e fundo). Foco: anel tracejado de 4 px em `--tinta` com folga de 2 px
   (`:focus-visible`), diferente da seleção. O foco por programa só acontece quando a última entrada foi o teclado
   (`UI.porTeclado`, §4.2): depois de um toque, nenhum anel.

### 10.20 Rodapé de ação
1. Uma linha só, fixo no pé do painel (fora do que rola), altura fixa; botões com alvo ≥ 44 px de altura, texto de
   16 px e `nowrap`.
2. Até 3 botões. O que não couber vira só a seta ou o ícone ("←" no lugar de "← Anterior"); o principal fica à
   direita.
3. Serve à prova (`.prova-rodape`, o primeiro), às intros e resumos das salas, à capa da prova, ao "Pronto!" da
   aparência, aos botões da foto e ao fim do guia. No celular, o botão principal aparece sem rolar.

### 10.21 Cabeçalho e larguras de painel
1. Cabeçalho: ícone 16×16 em 32 px à esquerda, título de 16 px numa linha (§10.17.3), ✕ à direita (§10.10.4),
   fundo `--papel-quente`. Com matéria, uma faixa de 8 px na cor dela logo abaixo do cabeçalho (§10.22).
2. Larguras de painel: 560 px (diálogo, escolha, cartão simples) e 720 px (listas, matéria, livro, loja). No
   celular, a largura da tela menos 8 px de cada lado.
3. Na tela baixa e larga (notebook: `min-width: 1000px` e `max-height: 820px`), as listas dentro do painel de 720
   px vão em 2 colunas de cartão.
4. Exceção: a tela de pergunta (sala, prova, treino; não é painel sobre o mapa) vai até 1180 px nessa tela baixa e
   larga, em 2 colunas (enunciado e banco de palavras à esquerda, casas e opções à direita; D12e-02).

### 10.22 Matéria: cor e ícone
Cada matéria tem uma cor e um ícone, os mesmos em todo o caminho: telhado do prédio, cabeçalho da tela da matéria,
livro, sala, prova e prêmio.

| Matéria | Cor |
|---|---|
| Português | `#e0433f` |
| Matemática | `#3f7fe0` |
| Geografia | `#39a860` |
| Ciências | `#139a8c` |
| História | `#b95a36` |
| Inglês | `#e0a020` |

1. O ícone é o `emoji` da própria matéria, com desenho 16×16; nada de ícone genérico (o 📜 da prova) no lugar dele.
2. A cor vai no telhado, na faixa do cabeçalho, numa faixa interna do painel e das cartas do livro. É cor de faixa e
   de desenho: nunca cor de texto nem fundo de texto de 16 px. Motivo: nenhuma serve ao mesmo tempo como texto no
   `--papel` e como fundo de texto `--tinta` (todas ficam abaixo de 4,5:1 no `--papel`; algumas passam sozinhas
   com `--tinta`, como Inglês com 6,1:1 e Geografia com 4,6:1, mas a regra é uma só para as seis).
   O contorno continua `--tinta`.
3. Matéria nova ganha cor que não repita a família de nenhuma destas (um azul só, um verde e um verde-azulado).
