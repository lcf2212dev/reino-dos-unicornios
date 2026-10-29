# Contrato: telas (UI), foco, teclado, guarda de toque e HUD

Cobre `Reino.UI` como camada: a pilha de telas por cima do mapa, o Esc e o Tab, para onde vai o foco, a guarda de
toque de toda tela que gasta, os botões do HUD e a Área dos pais. O que cada tela mostra fica no contrato do
assunto (`loja.md`, `cuidados.md`, `surpresa.md`, `fotos.md`); regras locais da pasta: `jogo/js/ui/CLAUDE.md`.

## Índice
1. Onde está no código · 2. Pilha de telas · 3. Teclado: Esc e Tab · 4. Foco · 5. Guarda de toque ·
6. HUD e `UI.registrarBotaoHud` · 7. Área dos pais · 8. Acessibilidade · 9. Antes de mexer ·
10. Pixel art e direção de arte: `docs/contratos/arte.md`

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
UI.fecharTela(t?)          // tira t (padrão: a de cima) da pilha e do DOM (`arte.md` §15.8); UI.atualizarHUD()
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
7. A pilha é só `#telas > .tela`. A tela que sai (`#telas-saindo`, `arte.md` §15.8) não é pilha: ninguém a procura.

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
6. Como o foco aparece (anel diferente da seleção, só pelo teclado): `arte.md` §19. Tela aberta pelo teclado ganha
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
7. Celular (≤ 480 px): `.hud-botoes` vira fileira embaixo do chip da montaria (a coluna de chips tem largura fixa, D13-01); hoje são 3 (tela cheia, 📷,
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
4. Texto para criança: pt-BR correto e carinhoso; quebra de palavra: `arte.md` §17; emoji com desenho
   (`jogo/js/CLAUDE.md`, Arte).

## 9. Antes de mexer, rode
```
npm test
npm run e2e
```
Ver uma tela nos 3 tamanhos: `npm run ver -- --ir <lugar>` (ou `--tela`, cenários em `jogo/ferramentas/testes/cenario-telas.js`).

## 10. Pixel art e direção de arte
Mudou para `docs/contratos/arte.md` (os antigos §10.N agora são `arte.md` §N).
