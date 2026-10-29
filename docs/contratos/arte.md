# Contrato: pixel art e direção de arte

Para que serve: as regras visuais de tudo o que aparece na tela (CSS e canvas). Leia a seção do que vai mexer; o
índice é a lista de `##` abaixo. Camada de telas (pilha, foco, HUD): `docs/contratos/ui.md`.

## 1–7. Moldura
Tudo na tela é pixel art, também o que é CSS e o que é desenhado no canvas. Os itens 1 a 7 são a moldura (citados
como §1 a §7); as seções 8 em diante são a direção de arte. Código novo já nasce nelas (o backlog que levou o
código até elas, todo feito, está em `arquivo/TODO-VISUAL.md`). O porquê das escolhas de produto (escala do mundo,
cor por matéria, festa): `docs/decisoes/direcao-de-arte.md`.
1. Cantos: `border-radius` só com `var(--canto-pequeno)` (botão pequeno, §10.4), `var(--canto)`, `var(--canto-grande)` ou `var(--redondo)` (o antigo círculo), ou 0.
   `ui-base.css` põe `corner-shape: notch` em tudo: o canto vira um degrau reto e a borda e a sombra o seguem.
   Sem suporte (Safari), canto reto. Nada de `999px` (pílula) nem `50%`.
2. Cor: nada de degradê liso. Faixas chapadas com paradas duras (`#a 0 33%, #b 33% 66%, #c 66%`), de 2 a 4 faixas,
   só em `linear-gradient`: `radial-gradient` desenha círculo de borda lisa (mesmo com parada dura), então não se usa.
3. Sombra e brilho: deslocamento duro, sem desfoque (`var(--sombra-grande)`, §10.3); brilho = contorno de 1 pixel com `drop-shadow`
   sem desfoque nos 4 lados. Nada de `blur`, desfoque em `box-shadow`/`text-shadow`/`drop-shadow` nem `shadowBlur`.
4. Nada de girar desenho pixel (`rotate` borra os pixels): balanço é deslocamento em degraus.
5. Canvas: sem `arc`/`ellipse`/degradê/`shadowBlur` que apareçam lisos na tela; forma redonda vem dos helpers
   pixel (`js/arte/desenho.js`) e luz em faixas.
6. Emoji na tela: sempre com desenho 16×16 (`js/arte/icones/`); o glifo reduzido é só a rede de segurança.
7. Fonte: a Press Start 2P mora no jogo (`css/press-start-2p.woff2`, `@font-face` em `ui-base.css`, `font-display:
   block`): sem rede e no app instalado o texto continua pixel. Nada de fonte de fora.

## 8. Cor: tokens e papéis
A moldura (painel, botão, chip, balão, cabeçalho) usa creme, laranja e âmbar. Rosa, lilás, azul e verde são cor de
desenho, de raridade e de matéria, nunca de moldura. Toda cor de CSS vem de um token do `:root` de `ui-base.css`;
literal fora do `:root` só em desenho feito em código (paletas de sprite e de ícone).

Os nomes da tabela já valem (D10-01): `--laranja*`, `--ambar*`, `--verde-folha` e `--papel-quente`; `--rosa` e `--lilas`
são as cores reais de desenho. `--borda` é apelido de `--tinta` e `--papel-leve` não existe mais (o painel é
`--papel`; cabeçalho e chip, `--papel-quente`). Texto laranja: `--laranja-escuro`. Seleção roxa cheia (`--roxo-texto`)
e acerto cheio (`--certo`) levam texto `--branco` (branco sobre `--roxo` dá 4,3:1, por isso o fundo é `--roxo-texto`).

| Token | Hex | Papel |
|---|---|---|
| `--tinta` | `#3a2446` | contorno, texto, sombra dura (o `#2a1838` fica só no olho dos sprites) |
| `--tinta-suave` | `#6b5378` | texto secundário, placeholder, texto do estado indisponível (6,35:1 no `--papel`) |
| `--noite` | `#24162e` | fundo das telas escuras (lista abaixo) |
| `--noite-2` | `#33224a` | degrau de `--noite`: cartão, faixa e estrela sobre fundo escuro |
| `--papel` | `#fff8ee` | fundo de painel |
| `--papel-quente` | `#fff1cc` | cabeçalho, chip, balão |
| `--papel-2` | `#efe8e2` | fundo do estado indisponível (§19); `--tinta-suave` sobre ele: 5,5:1 |
| `--laranja`, `--laranja-escuro`, `--laranja-claro` | `#ff8a3d`, `#a8480a`, `#ffe4c2` | ação principal; o escuro é o laranja de texto (5,5:1 no `--papel`, 5,2:1 no `--papel-quente`) |
| `--laranja-forte` | `#e06a12` | contorno de escolhido em cima de laranja (unicórnio montado, opção circulada) |
| `--ambar`, `--ambar-claro` | `#f0a04a`, `#fff1d0` | enfeite secundário da moldura |
| `--ouro`, `--ouro-claro` | `#ffd34d`, `#fff4cc` | estrela, moeda; o claro é fundo de aviso de medalha e de apoio |
| `--roxo`, `--roxo-texto` | `#7c5cff`, `#5a3cc4` | seleção; link e texto roxo (6,9:1). `--roxo` nunca é cor de texto |
| `--certo`, `--certo-fundo` | `#1b6e45`, `#dff8e8` | acerto (5,6:1 no fundo verde) |
| `--quase-fundo` | `#fff0c2` | quase certo (errinho da correção, retorno "quase") |
| `--erro`, `--erro-fundo` | `#b02c47`, `#ffe0e0` | erro de item, sair, perigo (5,15:1 no `--erro-fundo`, 6,0:1 no `--papel`) |
| `--rosa`, `--lilas` | `#ff7eb6`, `#b58cff` | cor de desenho (nunca moldura); `--lilas` é o texto secundário em tela escura (6,6:1 no `--noite`) |
| `--azul` | `#5fb4ff` | cor de desenho (pauta do caderno, barra do voo); nunca moldura |
| `--ceu`, `--verde-folha` | `#bfe9ff`, `#9ccc4a` | cor de desenho: céu e água (gota cheia, selo do álbum); folha e interruptor ligado |
| `--roxo-claro` | `#ebe5ff` | fundo roxo leve: trecho em inglês (`.en`, texto `--roxo-texto`, 6,0:1), chip "calma" |
| `--grama` | `#c6e15a` | fundo do `body` por trás do mapa |
| `--branco` | `#ffffff` | brilho de 1 px, halo, texto sobre seleção ou acerto cheio; `#fff` literal não se usa |
| `--brilho`, `--brilho-fraco` | `rgba(255,255,255,0.85)`, `…0.35)` | brilho interno de botão e chip; o do apertado |
| `--sombra-chao`, `--sombra-veu`, `--veu` | `rgba(58,36,70,0.2)`, `…0.35)`, `…0.45)` | sombra de chão; elevação; véu atrás do painel |
| `--veu-noite`, `--veu-noite-fraco` | `rgba(36,22,46,0.4)`, `…0.2)` | vinheta da abertura |
| `--arco-iris` | 6 faixas duras (`#ff5c6a #ff9f45 #ffe066 #6fdc8c #5fb4ff #a66bff`) | só brilho, e só em três lugares: anel da carta lendária, faixa do ovo e aura |
| `--apagado` | `grayscale(1) brightness(1.1)` | `filter` do desenho indisponível (§19.1); nunca no texto |

Alfa em degraus: um brilho de moldura só (`--brilho`, e `--brilho-fraco` no apertado), a sombra de tinta em três
(`--sombra-chao`, `--sombra-veu`, `--veu`), o véu escuro em dois (`--veu-noite`, `--veu-noite-fraco`) e o véu da
abertura em sete degraus de 0,04 (`--veu-1` a `--veu-7`, D8B-23); alfa fora deles não se escreve. Véu desce de um
nível ao vizinho de 0,04 em 0,04 ou, entre dois níveis mais distantes, em pontilhado ordenado 2×2 (§13.4): faixa
dura, não.

O que o canvas e o JS pintam de moldura lê `Reino.config.paleta` (`jogo/js/nucleo/config.js`), espelho do `:root`
com o mesmo hex, conferido pelo validador de cores (`npm run validar`): mude os dois juntos. Cor que vem do save (unicórnio, aura,
aparência, carimbo) não é token e não se reescreve nem se normaliza (D8B-03).

SVG em `data:` não aceita `var()`: o `fill` leva o hex de um token da tabela.

Cor do app (splash, `html` antes dos scripts, manifesto, `theme-color`): `--noite`. Com o mapa aberto o
`theme-color` vira `--grama` e volta a `--noite` na abertura; o JS lê `Reino.config.paleta`, e `index.html`, manifesto e
`vercel/montar.js` levam o hex, conferido por teste. Os ícones PNG do app não mudam.

Desenho feito em CSS também usa token: halo e brilho `--branco`, caderno com margem `--rosa` e pauta `--azul`, nota
da folha `--erro`.

Conferir: a ação principal da pergunta é moldura, então a mesma classe `.btn-conferir` e a mesma cor nas três
telas (sala, surpresa e ET): laranja habilitado, §19.1 desabilitado. Verde (`--verde-folha`) não é cor de botão.

Raridade (texto, fundo, desenho), em cartas, ovos, prova, loja, prêmios e no quadro da Escola: tokens
`--<r>-texto|fundo|desenho` (`--comum-texto` é `--tinta-suave`) e `Reino.config.paleta.raridade`. O contorno é
sempre `--borda`; a cor vai no fundo chapado (`--<r>-fundo`) e numa faixa interna de 4 px (`--<r>-desenho`):

| Raridade | Texto | Fundo | Desenho |
|---|---|---|---|
| comum | `#6b5378` | `#fff8ee` | `#ff9cc6` |
| raro | `#2b5ea8` (5,3:1) | `#dcebff` | `#5fb4ff` |
| épico | `#5b2aa8` (6,9:1) | `#eadcff` | `#a66bff` |
| lendário | `#8a5200` (5,1:1) | `#ffe39a` | `#ffb020` |

O lendário é sempre dourado (chip, faixa da prova e quadro da Escola também); o arco-íris só entra como brilho
(`--arco-iris`, na tabela acima) e na faixa e na moldura do cartão Ultra Lendário (Loja e baú dos presentes). Cor de matéria: §22.

1. Contraste: texto ≥ 4,5:1 sobre o fundo real (≥ 3:1 só com 24 px ou mais). `--tinta` no `--papel` dá 13,1:1. O
   texto do botão laranja é `--tinta` (5,9:1): não há texto branco sobre laranja.
2. Estado pela cor (seleção, certo, erro) muda fundo e borda do controle; o contorno de desenho continua `--tinta`.
3. Telas escuras, só estas: abertura (o céu é desenho), voo, espaço e planetas, o vão dos interiores, a tela de
   jogadores e o baú dos presentes. Todas com `--noite` (degrau `--noite-2`); o resto do jogo é claro. Nelas o texto é `--papel`, o secundário `--lilas`
   (`--tinta-suave` não se usa: 2,6:1), e ícone ou sprite de contorno escuro ganha brilho de 1 pixel em `--papel`
   (§3).

## 9. Tipografia
1. Escala na grade da Press Start 2P, só por token do `:root` de `ui-base.css`:

   | Token | px | Para quê |
   |---|---|---|
   | `--texto-p` | 8 | só número sobreposto a ícone (contador, selo com número); palavra nunca |
   | `--texto-aux` | 12 | rótulo auxiliar: `.chip-mini`, `small`, data, legenda, preço riscado, estágio, raridade, plaquinha do nome, número da questão, dock |
   | `--texto` | 16 | o que a criança lê: balão, botão, opção, chips do HUD, preço, enunciado, título de painel e de grupo |
   | `--texto-g` | 24 | título grande (`h3` do livro, visor do PIN); enunciado (`.pergunta`) a partir de 640 px |
   | `--texto-t` | 32 | abertura e festa (§16) |
   | `--texto-festa` | 48 | abertura e festa (§16; 32 no celular, se não couber) |

   Todo `font-size` do CSS é um desses tokens: nada de `em`, `%`, `clamp`, `vw`, `calc` nem px solto. O que muda
   por tamanho de tela troca de token numa media query. Carta da memória com palavra que não cabe: 16 → 12, sem
   partir a palavra. O canvas e o JS leem o espelho `Reino.config.texto` (`{ p: 8, aux: 12, corpo: 16, g: 24 }`,
   `jogo/js/nucleo/config.js`), com o mesmo número: mude os dois juntos. O espelho é só do canvas: JS que muda o
   tamanho de texto do DOM troca de token (classe ou `var(--texto…)`), nunca escreve px do espelho.
2. Entrelinha: `--entrelinha` (1,5) no corpo e `--entrelinha-titulo` (1,25) em título (`.titulo-pixel`, `h2`, `h3`,
   `.missao-titulo`). `line-height: 1` só em peça de uma linha com altura fixa (chip, contador, tecla).
3. Sem negrito: nenhum `font-weight` diferente de 400 no CSS, e `b, strong { font-weight: 400 }` no `ui-base.css`
   (a fonte não tem outro peso). Hierarquia por tamanho, por cor (`--tinta` e `--tinta-suave`) e por faixa.
4. "Letras grandes" (Ajustes): `ajustes.js` põe a classe `letras-grandes` no `<html>` quando `ajustes.texto > 1`. O
   interruptor segue gravando `1.15` ou `1` no save (nenhuma migração nem normalização). `:root.letras-grandes`
   sobe cada token um degrau: `--texto-aux` 16, `--texto` 24, `--texto-g` 32; `--texto-p`, `--texto-t` e
   `--texto-festa` ficam. Nunca um multiplicador: `--escala-texto` não existe, e o layout que muda com as letras
   grandes usa o seletor `.letras-grandes`. O texto do canvas não cresce (a parede não tem lugar para a placa maior).
5. Texto do canvas usa o token do DOM em px CSS: tamanho em px de aparelho = token × `devicePixelRatio`,
   arredondado ao múltiplo de 8 mais perto (vale para todo texto do canvas). A placa do
   cômodo tem `Reino.config.texto.corpo × dpr` px de aparelho (48/32/16 no celular, tablet e notebook: múltiplo de
   8), 16 px CSS nos 3 tamanhos. A moldura dela é desenhada em px de arte da interface (§10.1: 1 px de arte =
   2 px CSS = `2 × dpr` px de aparelho): borda de 1 px de arte, pregos de 1×1. A moldura da foto segue a mesma
   conta. Placa sem lugar na parede: §18.4.
6. Caracteres: a fonte não tem "√", "−", "●", "✓" nem o hífen inquebrável (U+2011). Use "-" no lugar de "−", o ✓
   com desenho 16×16 (§6), casa cheia desenhada em CSS no lugar de "●"; "–" e "×" existem. Caractere novo em
   texto de tela: confira que a fonte o tem (o `validar-conteudo.js` confere matérias, provas e os textos de `js/ui/`).
7. Ligaduras desligadas no seletor `*` (`font-variant-ligatures: none`; campos sem `font: inherit` também) e, no canvas,
   `ctx.textRendering = 'optimizeSpeed'` antes do `fillText`: com elas "fi" vira um glifo só e o "i" some.
8. Título que não cabe desce um degrau por vez, nunca por fator: o título da missão em Português (`ajustarTitulo`,
   `desafios.js`, só em Português) vai de 24 a 16 e a 12, e nunca ×0,9/0,8/0,7.

## 10. Pixel da interface: bordas, sombras, ícones e retratos
1. Na interface, 1 pixel de arte = 2 px CSS. Toda medida de desenho é múltiplo de 2 px CSS. Exceção que vem de
   antes: `--canto-grande` (9 px, §1).
2. Borda, só por token: `--borda-fina` (2 px) em botão de qualquer tamanho, chip, chip-mini, cartão e campo;
   `--borda-grossa` (4 px) em moldura grande (painel, balão, tela, retrato). Nenhuma outra espessura (nada de 1, 3,
   5, 6 nem 10 px).
3. Sombra dura para baixo, só por token: `--sombra-pequena` (`0 2px 0 var(--borda)`) em chip e botão pequeno;
   `--sombra-grande` (`0 4px 0 var(--borda)`) em botão grande e painel. Contorno de texto (`text-shadow`) de 2 px.
   Botão apertado desce a altura da sombra (2 ou 4 px) e a sombra some; cada tocável declara `--degrau` ao lado da
   sombra (§15.7).
4. Canto: `--canto-pequeno` (4 px) em botão de até 56 px de lado (✕, tela cheia, 📷, álbum): com `--canto-grande`
   o degrau de 9 px desenha um "+". Acima disso, `--canto` e `--canto-grande` (§1).
5. Ícone 16×16 a 32 px CSS (2 px CSS por pixel) em botão, dock, chip e também dentro da linha de texto (a letra de
   16 px da Press Start 2P já tem 2 px CSS por pixel da fonte); 64 px em destaque. Sempre em escala inteira
   (`PA.escalaNitida`, alvo 32: nada de `escalaNitida(36, 16)`; o `iconeTexto` também dá 32).
   Exceção: o ícone de barrinha (cuidados e crescimento no cartão da montaria e nas cartas) fica em 16 px, 1 px CSS
   por pixel, porque a barra tem 8 px de altura; é a única densidade menor da interface.
6. Retrato no balão (NPC e Claude): 4 px CSS por pixel, o mesmo para todos, sem `max-width` que encolha; quadro com
   borda `--borda-grossa`, fundo chapado `--papel-quente`, `--canto` e a plaquinha do nome (`--texto-aux`) encostada
   embaixo. Recorte a partir de `spr.topo - 1` (com chapéu e antena), cabeça centrada, 1 px de margem nos ETs; a
   cabeça ocupa de 60 a 80 % da altura do quadro. No celular com "Letras grandes" o retrato vai para cima do texto
   e o balão ocupa a largura toda; os botões do balão ficam com `nowrap`.
7. Sprite no DOM (`PA.paraDOM`): escala par, sempre. Claude nas intros 4 (o grande, 6); unicórnio e silhueta das
   cartas 4; detalhe do unicórnio 8; nascimento 8 (nada fracionário no meio da animação); vitrine da loja e prévia do
   acessório 4; Salão 8 (Mariana grande), 4 (vistas), 2 (montada) e 4 (retrato); criar personagem 8; álbum de ETs
   4; sprite das peças 4; o resto 2. Exceções escritas: o joystick (`entrada.js`, desenho já em px CSS), o confete
   (§14.2) e o canvas do voo (escala própria).

## 11. Escala do mundo (câmera)
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

Resultado: o notebook mostra de 16 a 20 tiles de altura e, no celular, todo personagem tem ≥ 44 px CSS.
O ícone de status do NPC (o balãozinho 20×23 sobre a cabeça) não acompanha essa escala: segue a densidade da
interface, 2 px CSS por pixel (`s = 2 × dpr` px de aparelho), 46 px CSS de altura nos 3 tamanhos, menor que o NPC
(adulto: 66, 88 e 66 px CSS).

## 12. Tabela de alturas (px de arte, contorno incluído)
Medida no sprite, da primeira à última linha com desenho (`npm run ver -- --previa sprites`,
`npm run ver -- --previa interiores:castelo`).

| Peça | Faixa | Hoje (medido em 29/09) |
|---|---|---|
| criança (Mariana a pé, NPC criança, ET criança, fada) | 16–18 | Mariana 17, `lab-malu` 17, ETs crianças 18 (sem antena); 20–22 com boina ou antena, fada 17 |
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

## 13. Luz, sombra e véu
1. Luz de cima (e da esquerda): brilho de 1 pixel em cima e à esquerda do objeto; a luz nunca é pintada por cima do
   contorno.
2. Sombra de chão reta, embaixo e centrada, em toda peça sólida do mundo: elipse de pixel com alfa de 0,15 a 0,25,
   no máximo 2 níveis, 2 a 3 px de arte fora da base (a sombra coberta pelo próprio desenho não conta).
3. No CSS, sombra só para baixo (`0 4px 0`): nada de deslocamento lateral.
4. Véu de luz (vinheta, halo, escurecer atrás do painel): degraus na grade de pixel, com diferença de alfa ≤ 0,04
   entre vizinhos, ou pontilhado ordenado 2×2 entre dois níveis. Faixa dura de alfa maior aparece como defeito.

## 14. Contorno
1. Todo desenho sólido tem contorno de 1 pixel em `--tinta` (`#3a2446`; `PA.contornar` no canvas).
2. Exceções: água, luz (chama, brilho, raio de luz), céu e nuvem, sombra de chão e partícula de 1 a 2 pixels
   (confete, brilhinho). Mesmo assim, a água ganha linha d'água de 1 pixel e a luz, borda de brilho.
   O confete é pixel do mundo: peças de 1 a 2 px de arte do mundo (`Reino._motor.escala / dpr` px CSS cada px de
   arte), posição arredondada a esse passo, cores de `Reino.config.paleta.confete`, com o hex dos tokens `--rosa`,
   `--ouro`, `--roxo`, `--azul`, `--laranja` e `--verde-folha` do §8.
3. Silhueta de trancado ou vazio: preenchimento `--tinta-suave` com contorno `--tinta`; o "?" (≥ 7 px de arte de
   altura) sai em `--papel` com contorno `--tinta`. Nada de silhueta clara sem contorno.

## 15. Movimento
1. `scale` só por fator inteiro em desenho pixel (e nunca em texto); pulso = deslocamento de 1 pixel de arte ou
   troca de quadro.
2. Desenho pixel (sprite, ícone, emoji, chip, carta, estrela) anda em `steps(n)`, com n = número de degraus de 2 px
   do deslocamento, ou em deslocamento inteiro. `ease-out` só em translação de painel inteiro e em `opacity` de véu,
   flash ou tela inteira (§19.1). `cubic-bezier` só nas exceções do item 5.
3. Durações só por token: `--rapido` 120 ms (resposta ao toque), `--normal` 240 ms (abrir, fechar, trocar),
   `--lento` 600 ms (chegada, festa curta), no `:root` de `ui-base.css`, com o espelho `Reino.config.movimento`
   (`config.js`; o validador confere os dois). Toda duração de `animation` e `transition` em `jogo/css/` é um token
   ou `calc(<inteiro> * var(--lento))`; os `0ms`/`0.01ms` das saídas `sem-animacao`/`reduce` valem. Repetição
   infinita tem período de 2 × `--lento` ou mais, e o chamado de atenção repete poucas vezes e para.
4. `opacity`: onde pode, só no §19.1.
5. Exceções escritas (o validador de pixel aceita só estas):
   - `armar-encher` (`ui-base.css`): barra de preenchimento em `scaleX`, dura `ARMAR_MS`;
   - `.balao-respira` (Ritual da Calma, `ui-prova.css`): cresce e encolhe contínuo, de propósito, no ritmo da
     respiração (3,1 s);
   - `.respiro-circulo` (Cantinho do Respiro, `ui-respiro.css`): cresce e encolhe na respiração guiada, 4 s por fase
     (`ease-in-out`, presa a `FASE_MS` de `interiores/portugues/lp-respiro.js`);
   - confete e festa: duração da escala de festa (§16);
   - zoom da abertura (`ui-abertura.css`): `--entrar-ms` com `cubic-bezier`, casado com `Reino.config.abertura`;
   - duração presa a um timer do JS: `armar-encher` (`ui-base.css`, 1,1 s = `ARMAR_MS` de `ui/base.js`) e o
     `balancar` do `.ovo-grande.balanca` (`ui-paineis.css`, 0,45 s = o `setTimeout(nasceu, 450)` de `ui/ovos.js`).
6. Toda animação e toda `transition` curta têm saída em `body.sem-animacao` e `prefers-reduced-motion` (§8.3); o que
   o canvas desenha fica parado quando as animações estão desligadas. O afundar (item 7) não é animação: fica igual
   nas duas saídas.
7. Afundar. Todo tocável com sombra de degrau, em `:active`, desce a altura da sombra e a sombra some; o brilho
   interno (onde há) vira o do apertado. Uma regra só, em `ui-base.css`:
   `:is(button, [role="button"]):active:not(:disabled):not([aria-disabled="true"]):not(.indisponivel)
   { transform: translateY(var(--degrau, 0px)); box-shadow: var(--brilho-apertado, none); }`.
   1. Cada tocável declara, na mesma regra da sombra, `--degrau: 2px` (com `--sombra-pequena`) ou `--degrau: 4px`
      (com `--sombra-grande`); quem tem brilho `inset` declara também
      `--brilho-apertado: inset 0 2px 0 var(--brilho-fraco)`. Nenhum outro `:active` com `transform` ou
      `box-shadow` (o `.dock-btn:active` troca só o fundo: o botão não tem sombra, a do `.dock` fica).
   2. Sem sombra de degrau, não afunda (`--degrau` 0: `.apoio-abrir`, `.interruptor`, `.jogadores-aba`,
      `.btn-ouvir`, `.dock-btn`). Exceções: `.chip-mini.sugestao` tem `--sombra-pequena` e `--degrau: 2px`;
      `.ovo-grande` (desenho solto, fundo transparente) desce `--degrau: 2px`, sem sombra.
   3. Estado parado não muda o repouso: selecionado (`[aria-pressed="true"]`), `.certa` e `.colocada` guardam a
      sombra e afundam igual. Indisponível não afunda (§19.1).
   4. É estado, não animação: instantâneo (sem `transition`; pixel não desliza), igual com `body.sem-animacao` e
      `prefers-reduced-motion`.
   5. Animação que mexe no `transform` do próprio botão (chamado do `.bau`, `pulsar` do `.btn-ovos` e do chip dos
      ovos, `balancar` do `.ovo-grande`): `animation: none` em `:active`, na mesma regra única.
   6. Com sombra, mas não tocáveis (sem `--degrau`): `.painel`, `.painel-ovo`, `.tela-jogadores .painel`, `.dock`,
      `.claude-fala`, `.titulo-jogo`, `.nota-folha`, `.selo-tentativa`, `.linha-premio`, `.jogadores-guardando`,
      `.criar-plaquinha`, `.apoio`, `.fotos-vazio`. O validador de movimento usa esta lista.
   7. Sombra de degrau num pseudo-elemento (a `.bolinha-cor` do celular, no `::before`): o `:active` do botão só
      redefine o token (`--sombra-pequena: none`), sem `transform` nem `box-shadow`; quem desce é a regra única.
8. Entrada e saída de tela. O véu (`.tela`) esmaece (`opacity` 0 → 1) e o `.painel` desce 3 degraus de 2 px
   (`translateY(-6px)` → 0, `steps(3)`), os dois em `--rapido`; a saída é o inverso, em `--rapido`, `forwards`.
   1. `UI.fecharTela` faz tudo NA HORA (tira da pilha, `com-tela`, `EV.TELAS`, HUD, foco devolvido) e então, com
      `U.animar()` verdadeiro, move o nó para `#telas-saindo` (criado por `ui/base.js` ao lado de `#telas`,
      `aria-hidden="true"`, `inert`, `pointer-events: none`, abaixo de `#telas` no empilhamento) com a classe
      `.saindo`, e o tira do DOM depois de `Reino.config.movimento.rapido` ms (`setTimeout`: o `animationend` não
      vem com animação desligada). Com `U.animar()` falso, tira na hora. `UI.fecharTodas` usa o mesmo caminho.
   2. `#telas-saindo` não é pilha (§2.7): `#telas > .tela` e `telas.querySelector(...)` seguem vendo só a viva.

## 16. Escala de festa
A festa cresce com o feito: acerto < sala < prova < matéria completa. Compra é festa de acerto.

| Nível | Quando | Título | Movimento | Som |
|---|---|---|---|---|
| 1 | acerto, compra, cuidado feito | não muda | brilho de 3 quadros no item; sem confete | curto |
| 2 | sala concluída, treino | 24 px (`--texto-g`) | pulinho do emoji em degraus e brilhinhos; confete 40 | fanfarra |
| 3 | prova terminada, ovo que nasce | 32 px (`--texto-t`) | confete 90 | fanfarra |
| 4 | matéria completa | 48 px (`--texto-festa`; `--texto-t` no celular, se não couber) | confete 160 e emoji grande | fanfarra longa |

Uma chamada só: `UI.festa(nivel, opcoes)` (`ui/pecas.js`, tabela em `UI.festa.tabela`; `opcoes.item` recebe o
brilho do nível 1). Nível por tela: compra, cuidado, acerto da surpresa e do ET = 1; sala, treino, ET vencido e Aura
= 2; prova e ovo = 3; matéria completa = 4. Com animações desligadas fica só o título e o som. O ovo nasce no nível
3 em toda raridade; o lendário (ovo e prova) ganha o brilho arco-íris, não mais confete: moldura `.brilho-arco` de 6
faixas de 4 px (`--arco-1` a `--arco-6`) em cor lisa, que troca a ordem das cores em degraus (`var(--lento)`
`step-end`, 3 vezes) e fica parada sem animação. O ícone da tela de fim sai no tamanho do nível, em escala inteira
(32 px no nível 2, 48 px no nível 4). O confete é desenhado pela regra do §14.2.

## 17. Quebra de palavra
1. No `body`: `overflow-wrap: break-word` e `hyphens: manual`. `overflow-wrap: anywhere` é proibido.
2. Palavra longa (9 letras ou mais) só quebra na sílaba, com o hífen à vista (o hífen suave do `hifenizar`,
   `ui/pecas.js`). Nunca no meio sem hífen.
3. Nome próprio e rótulo curto (até 12 letras: botão, chip, título de cabeçalho) não quebram (`nowrap`); se não
   couber, descem um degrau da escala (16 → 12), nunca para tamanho fora dela.
4. Número, artigo e preposição de 1 a 2 letras, "R$" e o emoji do fim ficam colados à palavra vizinha com espaço
   inquebrável (U+00A0). Palavra composta ("arco-íris") fica num `span` com `nowrap`.
5. Balão (NPC e Claude, com ou sem botões, e o recado de cuidado do Pet Shop): `.claude-texto` em `--texto`. A
   paginação tem dois limites em `npcs-falas.js`: o da frase (`frases()`, 30 letras; é o que define o texto falado
   e não muda) e o da página, que junta frases até caber em 2 linhas do celular com o retrato de 4 px (§10.6). A
   frase sozinha maior que a página fica com 3 linhas: partir a frase mudaria a voz. O `validar-interiores.js` avisa
   pelo limite da página.

## 18. Área útil
1. O JS escreve no `:root`, em px CSS: `--hud-topo` (fim do HUD de cima), `--dock-altura` (altura do dock de baixo),
   por bloco do HUD `--hud-esq-largura`/`--hud-esq-fundo` (coluna de chips) e `--hud-dir-largura`/`--hud-dir-fundo`
   (montaria e a fileira ⛶ 📷 🖼), todas por `ui/hud.js` (`Reino.UI.areaUtil()` devolve os mesmos números;
   `medirAreaUtil()` força a medida), e `--balao-altura` (topo do balão com a aba do nome até o pé; 0 fechado), por
   `personagens/claude.js`. Só se reescreve quando o valor muda.
2. Área útil = a tela menos `--hud-topo` em cima e o maior entre `--dock-altura` e `--balao-altura` embaixo, com
   folga de 8 px de cada lado.
3. A câmera do mapa e dos interiores, o balão e os painéis leem essas mesmas variáveis (nenhum mede o HUD por
   conta própria). Objeto de toque e texto ficam dentro da área útil.
   Com tela aberta o balão vai para o pé (`body.balao-no-pe`) e a tela reserva `--balao-altura` + 8 px embaixo. Na
   conversa com NPC num interior, a câmera sobe só o que falta para a Mariana e o NPC ficarem acima do balão, e na
   mesma conversa só sobe (sem vai e volta entre páginas); fechado, volta ao lugar.
4. Placa do cômodo sem lugar na parede (coberta pelo HUD ou sem espaço): desce para a primeira faixa livre abaixo do
   HUD e à direita da coluna de chips, mesmo sobre o chão, com a mesma borda. Nunca some.

## 19. Estados de controle: indisponível, erro de item e foco
1. Indisponível (trancado, desligado, sem estrelas, esperando a voz, Conferir sem resposta): uma regra só, para
   `:disabled`, `[aria-disabled="true"]` e `.indisponivel` (o que não é botão: carta cara da loja, planeta trancado).
   Não afunda (§15.7): o retorno ao toque é o `toque-ignorado`.
   Fundo `--papel-2` chapado, texto `--tinta-suave`, borda `--borda`, sombra `--sombra-pequena`; o desenho dentro leva
   `filter: var(--apagado)`. Nada de `opacity` nem `grayscale` no texto. O botão segue focável, com `aria-disabled`
   (§6.4). Ícone 16×16 só onde há motivo: 🔒 no trancado (planeta, foguete) e no caro (loja); o resto fica só com a
   aparência. Com `Reino.config.esperaFala.travar = true`, o botão esperando a voz ganha o ícone de ouvido (D5-13).
   `opacity`, em todo o CSS, só em movimento: `@keyframes` (partícula, entrada e saída de uma tela inteira, ≤
   `--normal`) e a transição de véu e flash (`.abertura-flash`, `.fotos-flash`, `.abertura-entrando`). Estado parado
   com `opacity`, só estas duas exceções: o 0/1 do escondido-até-o-foco (`.criar-lasca`) e o joystick translúcido
   sobre o mapa (`#controle`). O validador de cores (`npm run validar`) acusa o resto.
2. Erro de item (opção errada, par errado, peça fora do lugar): estado parado, com fundo `--erro-fundo` e borda
   `--erro`, até o item ser apagado ou até o próximo toque; o tremor vem por cima só com animação. A opção errada
   que fica na tela vem riscada, sem `opacity`, com ≥ 4,5:1.
3. Acerto: fundo `--certo-fundo` e borda `--certo`.
4. Seleção: `--roxo` (borda e fundo). Foco: anel tracejado de 4 px em `--tinta` com folga de 2 px
   (`:focus-visible`), diferente da seleção. O foco por programa só acontece quando a última entrada foi o teclado
   (`UI.porTeclado`, §4.2): depois de um toque, nenhum anel.

## 20. Rodapé de ação
1. Uma linha só, fixo no pé do painel (fora do que rola), altura fixa; botões com alvo ≥ 44 px de altura, texto em
   `--texto` e `nowrap`.
2. Até 3 botões. O que não couber vira só a seta ou o ícone ("←" no lugar de "← Anterior"); o principal fica à
   direita.
3. Serve à prova (`.prova-rodape`, o primeiro), às intros e resumos das salas, à capa da prova, ao "Pronto!" da
   aparência, aos botões da foto e ao fim do guia. No celular, o botão principal aparece sem rolar.

## 21. Cabeçalho e larguras de painel
1. Cabeçalho (`UI.painel(id, titulo, opcoes)`): ícone 16×16 em 32 px à esquerda, título em `--texto` com `nowrap`
   (§17.3), ✕ à direita (§10.4), fundo `--papel-quente`.
   1. Opções: `icone` (o desenho do cabeçalho), `materia` (a cor e a faixa, §22.4), `estreito` (`.painel-estreito`,
      560 px), `curto` (nome curto do título).
   2. O emoji no início do título vira o ícone de 32 px; não fica emoji solto no texto.
   3. Título que não cabe: primeiro o nome curto (`opcoes.curto` ou a tabela `CURTOS`, com o nome inteiro no
      `aria-label`); depois 2 linhas no mesmo tamanho (`.titulo-quebra`, só entre palavras); só então `.titulo-longo`,
      um degrau abaixo (24 → 16 px). Nunca 12 px.
2. Larguras de painel: 560 px (diálogo, escolha, cartão simples; `.painel-estreito`) e 720 px (listas, matéria, livro,
   loja, Foguete e Álbum de ETs). No celular, a largura da tela menos 8 px de cada lado.
   1. Na tela baixa e larga (notebook: `min-width: 1000px` e `max-height: 820px`), as listas dentro do painel de 720
      px vão em 2 colunas de cartão.
   2. Na tela baixa e larga, Álbum de ETs e Foguete vão até 1180 px (sem Letras grandes; mesma largura, D8B-28) e Pet
      Shop até 1000 px (a partir de 1000 px de largura).
   3. A tela de pergunta (sala, prova, treino; não é painel sobre o mapa) vai até 1180 px nessa tela baixa e larga, em
      2 colunas (enunciado e banco de palavras à esquerda, casas e opções à direita; D12e-02).
   4. O fim da matéria completa (`.fim-materia`) vai até 1000 px a partir de 700 px de largura, com os prêmios em 2
      colunas (O-36).
3. Caber na tela:
   1. Conteúdo que ainda rola mostra a sombra `.rola-mais` no pé; some quando chega ao fim.
   2. Na tela baixa e larga: o texto-guia que já é falado sai (`.guia-falada`); o que não é falado fica em 1 linha, com
      o texto inteiro no `title`.
   3. O cartão de prova diz "Revisão de X" (nome inteiro para o leitor de tela).
   4. Tela da matéria na tela baixa e larga: o livro vira só o ícone na linha do dinheiro (`aria-label` e `title`) e o
      retrato do Claude do guia sai.
   5. Lugares em 2 colunas, com o nome numa linha (o inteiro no `title`); Ajustes com os botões em 2×2.
   6. Com Letras grandes, essas telas podem rolar.

## 22. Matéria: cor e ícone
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
| Língua Portuguesa | `#8e4fd6` |
| English | `#d23c9b` |

1. O ícone é o `emoji` da própria matéria, com desenho 16×16; nada de ícone genérico (o 📜 da prova) no lugar dele.
2. A cor vai no telhado, na faixa do cabeçalho, numa faixa interna do painel e das cartas do livro. É cor de faixa e
   de desenho: nunca cor de texto nem fundo de texto de 16 px. Motivo: nenhuma serve ao mesmo tempo como texto no
   `--papel` e como fundo de texto `--tinta` (todas ficam abaixo de 4,5:1 no `--papel`; algumas passam sozinhas
   com `--tinta`, como Inglês com 6,1:1 e Geografia com 4,6:1, mas a regra é uma só para as seis).
   O contorno continua `--tinta`.
3. Matéria nova ganha cor que não repita a família de nenhuma destas (um azul só, um verde e um verde-azulado).
4. A tela aberta com a opção `materia` do `UI.painel` recebe `--cor-materia`; ela pinta a faixa de 8 px logo abaixo do
   cabeçalho e a faixa sob o subtítulo (topo da missão, cartas do livro); nunca o texto (item 2).
