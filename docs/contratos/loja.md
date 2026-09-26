# Contrato: loja (enfeites, comidas, prêmios)

Cobre a lista única do que se compra com estrelas (`Reino.LojaItens`), os enfeites e seus slots, os
prêmios da escola à venda, os preços, as comidas da Pet Shop e a guarda de toque de toda tela que gasta.
Estrelas no save: `save-e-mescla.md`. Compra de comida: `cuidados.md` §6.

## Índice
1. Onde está no código · 2. `Reino.LojaItens` · 3. Prêmios da escola à venda · 4. Enfeites e slots ·
5. Comidas · 6. Guarda de toque (compras e telas) · 7. Antes de mexer

## 1. Onde está no código
- `jogo/js/conteudo/loja-itens.js` — `Reino.LojaItens` (dados, sem DOM).
- `jogo/js/ui/loja.js` — a tela da Loja (`UI.telaLoja`, `UI.ITENS_LOJA`, `logoDepoisDaCompra`).
- `jogo/js/interiores/loja/` — a Loja das Fadas por dentro. `jogo/js/interiores/escola/objetos.js` — mural.
- `jogo/js/arte/pixelart-unicornio-moldes.js` — `PA.ENFEITES_MONTARIA`, moldes `UNI.adulto`/`UNI.filhote`.
- `jogo/js/arte/pixelart-unicornio.js` — cache de sprites com enfeites (`TETO_COMBOS`).
- `jogo/js/ui/base.js` — guarda de toque (`UI.segurarToques`, `UI.toqueSegurado`, `UI.escolher`, `UI.confirmar`, `ARMAR_MS`).
- Preços: `Reino.config.precoPremio`, `Reino.config.comidas` (`jogo/js/nucleo/config.js`).
- Prévia: `jogo/ferramentas/previas/acessorios.html`.

## 2. `Reino.LojaItens`
```
Reino.LojaItens = {
  ENFEITES: [{ id, nome, preco, slot, icone, espaco?: true }]   // tudo o que se compra com estrelas;
                                    // icone = emoji com desenho nos ícones OU a chave 'enfeite:<id>'
  SLOTS: { <slot>: { nome } }       // orelha, olho, cabeca, chifre, pescoco, cauda (em usando.enfeites, com âncora
                                    // nos moldes) + capa, rastro, asas (especiais: usando.capa, usando.estrelinhas,
                                    // usando.asasFada). Não existe `patas`
  enfeite(id) → item | null
  premios() → [{ id, nome, raridade, provaId, preco, slot }]    // acessórios de todas as provas; slot = âncora
                                    // de PA.ENFEITES_MONTARIA (null sem PA, como nas ferramentas em vm)
  precoPremio(raridade) → Reino.config.precoPremio[raridade]
  estadoPremio(premio, P) → 'bloqueado' | 'aVenda' | 'ganho' | 'comprado'
  item(id) → enfeite, ou prêmio como { id, nome, slot, preco, raridade, provaId, icone: 'acessorio:<id>', premio: true }
  FALAS: { chave: texto }           // o que a Loja fala (em Falas.todas, pacote geral)
}
```
1. É a ÚNICA lista: a tela da Loja (`UI.ITENS_LOJA` é apelido de `ENFEITES`), a Loja por dentro e as
   ferramentas usam esta. Nenhuma cópia duplicada.

## 3. Prêmios da escola à venda
1. Estado de um prêmio (derivado, nada novo no save):
   - `ganho`: `P.regProva(prova).premio === premio.raridade`;
   - `comprado`: `estado.loja[id]` e não é o ganho;
   - `aVenda`: não tem, e já ganhou algum acessório desta prova (`P.regProva(prova).premio`);
   - `bloqueado`: ainda não ganhou nenhum desta prova.
2. Comprar: `P.gastarEstrelas(preço)` → `estado.loja[id] = true` → põe no slot (como os enfeites) →
   `P.salvar()`. Não mexe em `estado.provas`, `P.regProva`, arco-íris da Escola, status das professoras,
   mural da Escola nem Área dos pais.
3. Preços: `Reino.config.precoPremio` (comum 25, raro 40, lendário 70).
4. Regra da prova intacta: só nota 10 dá acessório, a tentativa define o tipo, depois vira treino.
5. O mural da Escola conta só o prêmio da prova (`P.regProva(prova).premio === r`), não a compra.
6. A vitrine de prêmios da Loja por dentro mostra os de todas as provas (inclusive Português).

## 4. Enfeites e slots
1. Pelo menos 10 enfeites novos (na leva das novidades), preço de 10 a 45 ⭐, pelo menos 3 do espaço
   (`espaco: true`), nomes que não repetem os de antes nem os acessórios das provas. Um enfeite por slot.
2. Desenho em `PA.ENFEITES_MONTARIA[id] = { linhas, paleta, ancora, dx, dy }` (com contorno próprio `k`).
3. Slots com âncora: `orelha`, `olho`, `cabeca`, `chifre`, `pescoco`, `cauda`. Enfeite de chifre usa o slot
   `chifre`. Slot novo = âncora nova em TODOS os 10 moldes (`UNI.adulto` e `UNI.filhote`, vistas
   lado/frente/costas/diagFrente/diagCostas). As direções da esquerda são o espelho.
4. Vista que não mostra o encaixe: âncora `null` (como `olho` de costas e `cauda` de frente, nos dois
   estágios), e o enfeite não aparece nela.
5. Tudo continua em `usando.enfeites` (lista de ids): nenhum campo novo no save.
   Id que esta versão não conhece (enfeite ou prêmio de uma versão nova, vindo pela mescla) fica em
   `usando.enfeites` e em `loja`: o desenho o pula, e trocar um enfeite só tira do encaixe os ids conhecidos
   (`ui/loja.js`, `alternar`; `save-e-mescla.md` §6).
6. Cada enfeite novo tem ícone em pixel e aparece em `ferramentas/previas/acessorios.html` (grade vista × estágio).
7. Cache de sprites com enfeites: guarda só as 24 combinações usadas por último (`TETO_COMBOS`; a sem enfeite
   fica sempre), contando `PA.unicornio` e a composição montada (`PA.montada`), que sai do cache junto com a
   sua combinação. A que sai é redesenhada no mesmo quadro se voltar.

## 5. Comidas
1. Lista e preços em `Reino.config.comidas` (`{ id, nome, icone, preco, fome, enche? }`; `enche` = vai a 100).
2. Compra, despensa e "dar": `cuidados.md` §2 e §6. A água é de graça.

## 6. Guarda de toque (vale para toda tela que gasta estrela ou comida)
Por quê: um botão que some no 1º toque deixava o 2º toque cair no que aparece embaixo (já comprou comida,
trocou enfeite e ligou interruptor sem ela querer).
```
UI.segurarToques(ms = 800)   // abriu ou fechou uma tela por toque (até 600 ms antes): cliques PERTO (40 px) desse
                             // toque ficam ignorados por 800 ms; cada toque ignorado no mesmo lugar estica a guarda
                             // (+800 ms), até 2 s depois da troca de tela. Longe dele, vale na hora
UI.toqueSegurado(x, y) → bool   // o toque em (x, y) está segurado agora? (e estica a guarda). O pointerdown do
                             // mapa usa (motor/entrada.js): o 2º toque no "Ir" do Lugares não troca o destino
UI.escolher(msg, [{ rotulo, valor, principal?, seguro?, gasta? }], classe?) → Promise(valor)
                             // o `seguro` (ou o 1º) recebe o foco e é o que o Esc escolhe
UI.confirmar(msg, sim, nao, gasta?)   // atalho de UI.escolher com dois botões ("não" é o seguro)
```
1. Tudo vale só para toque e mouse de verdade (`isTrusted`, `detail > 0`); o toque ignorado afunda o botão de
   leve, sem som.
2. Botões que gastam (`gasta: true`; estrela ou comida guardada): nascem apagados (`.armando`,
   `aria-disabled`) e só acendem depois de 1,1 s (`ARMAR_MS`) SEM nenhum toque na tela; cada toque nesse
   tempo recomeça a espera. Uma barrinha enche durante a espera (com "reduzir movimento", o texto "Espera um
   pouquinho…"). O "Agora não" vale na hora.
3. Sob o dedo: se o toque que abriu o diálogo (até 600 ms antes) cai a 40 px de um botão que gasta, esse
   botão troca de lugar com o seguro; se ainda sobrar um embaixo do dedo, o diálogo se move até o "Agora não"
   ficar sob o dedo; se nem assim, um toque a 40 px dali não gasta.
4. Ajustes: no 1º segundo depois de abrir, nenhum toque muda interruptor.
5. Loja: logo depois de uma compra, o cartão comprado (só ele) ignora toques perto do ponto da compra até
   1,1 s (`ARMAR_MS`) sem nenhum toque na tela; cada toque nesse tempo recomeça a espera (`logoDepoisDaCompra`).
6. Teclado sem trava: Enter/Espaço (clique com `detail` 0) e `.click()` de código passam sempre, inclusive num
   botão apagado (ela chega nele com um Tab de propósito); Enter/Espaço segurados (repetição automática) não
   acionam de novo.
7. Tela nova que não põe o foco em nada recebe o foco NELA MESMA (como um diálogo), não no 1º botão: um Enter
   logo depois não age sozinho; o Tab leva ao 1º botão. (O `UI.escolher` foca o seguro.)
8. Toda compra nova pergunta ANTES de gastar, com os botões de gastar marcados `gasta: true` e um botão
   `seguro`. Nunca gastar e perguntar depois.
9. HUD de cima: os blocos (`.hud-esq`, `.hud-dir`, `.hud-botoes`) têm `pointer-events: none`; só botões e
   chips pegam toque (senão o 📷 criava uma faixa morta sob o chip da montaria no celular).

## 7. Antes de mexer, rode
```
node jogo/ferramentas/validar/validar-interiores.js
node jogo/ferramentas/testes/testar-save.js
node jogo/ferramentas/testes/referencias.js capturar /tmp/<voce>/nova --raiz jogo --so dados,imagens
npm test
```
Abra `jogo/ferramentas/previas/acessorios.html` por `file://` (o servidor de teste só entrega `index.html`, `css/` e `js/`)
para conferir os enfeites: passo a passo em `docs/receitas/enfeite-novo.md`.
