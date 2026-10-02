# Contrato: loja (enfeites, comidas, prêmios)

Cobre a lista única do que se compra com estrelas (`Reino.LojaItens`), os enfeites e seus slots, os
prêmios da escola à venda, os preços, as comidas da Pet Shop e a guarda da compra na Loja.
Estrelas no save: `save-e-mescla.md`. Compra de comida: `cuidados.md` §6. Guarda de toque de toda tela que
gasta: `ui.md` §5.

## Índice
1. Onde está no código · 2. `Reino.LojaItens` · 3. Prêmios da escola à venda · 4. Enfeites e slots ·
5. Comidas · 6. Guarda de toque na Loja · 7. Antes de mexer

## 1. Onde está no código
- `jogo/js/conteudo/loja-itens.js` — `Reino.LojaItens` (dados, sem DOM).
- `jogo/js/ui/loja.js` — a tela da Loja (`UI.telaLoja`, `UI.ITENS_LOJA`, `logoDepoisDaCompra`).
- `jogo/js/interiores/loja/` — a Loja das Fadas por dentro. `jogo/js/interiores/escola/objetos.js` — mural.
- `jogo/js/arte/pixelart-unicornio-moldes.js` — `PA.ENFEITES_MONTARIA`, moldes `UNI.adulto`/`UNI.filhote`.
- `jogo/js/arte/pixelart-unicornio.js` — cache de sprites com enfeites (`TETO_COMBOS`).
- `jogo/js/ui/base.js` — guarda de toque (`ui.md` §5) e `logoDepoisDaCompra`.
- Preços: `Reino.config.precoPremio`, `Reino.config.comidas` (`jogo/js/nucleo/config.js`).
- Prévia: `jogo/ferramentas/previas/acessorios.html`.

## 2. `Reino.LojaItens`
```
Reino.LojaItens = {
  ENFEITES: [{ id, nome, preco, slot, icone, espaco?: true, loja?: 'petshop' }]   // tudo o que se compra com estrelas;
                                    // icone = emoji com desenho nos ícones OU a chave 'enfeite:<id>'
  SLOTS: { <slot>: { nome } }       // orelha, olho, cabeca, chifre, pescoco, cauda (em usando.enfeites, com âncora
                                    // nos moldes) + capa, rastro, asas (especiais: usando.capa, usando.estrelinhas,
                                    // usando.asasFada). Não existe `patas`
  naLoja('fadas' | 'petshop') → enfeites do estabelecimento
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
2. `loja` ausente identifica a Loja das Fadas; `loja: 'petshop'` identifica acessórios exclusivos
   da Pet Shop. Tela e vitrine das fadas usam `naLoja('fadas')`; a Pet Shop usa `naLoja('petshop')`.
   Compras e encaixes continuam em `loja[id]` e `usando.enfeites`, sem campo persistente novo.
   `conteudo/loja-novidades.js` acrescenta os itens à lista única, depois de `loja-itens.js`;
   `arte/enfeites-novidades.js` registra seus desenhos e ícones.
3. Os cartões de enfeites da Pet Shop reutilizam a compra, confirmação e guarda de toque da Loja.
   Comprar veste o acessório; tocar novamente permite tirar ou usar sem pagar outra vez.

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
   Montada, `enfeitesNaFrente: [âncoras]` no molde repinta esses enfeites por cima da cavaleira; enfeite que
   passaria da borda vai o mínimo para dentro (`lugarDoEnfeite`, `pixelart-unicornio.js`), e
   `validar-enfeites.js` confere (0 px fora do molde, oclusão montada, nada sobre o tronco dela de frente).
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

## 6. Guarda de toque na Loja
A guarda de toque de toda tela que gasta (`UI.segurarToques`, `UI.toqueSegurado`, `UI.escolher` com `gasta`,
`ARMAR_MS`, teclado sem espera, perguntar antes de gastar) e as regras do HUD de cima: `ui.md` §5 e §6.
Só da Loja:
1. Toda compra pergunta ANTES de gastar (`ui.md` §5.5), com os botões de gastar `gasta: true` e um `seguro`.
2. Logo depois de uma compra, o cartão comprado (só ele) ignora toques perto do ponto da compra até 1,1 s
   (`ARMAR_MS`) sem nenhum toque na tela; cada toque nesse tempo recomeça a espera (`logoDepoisDaCompra`).

## 7. Antes de mexer, rode
```
node jogo/ferramentas/validar/validar-interiores.js
node jogo/ferramentas/testes/testar-save.js
node jogo/ferramentas/testes/referencias.js capturar /tmp/<voce>/nova --raiz jogo --so dados,imagens
npm test
```
Abra `jogo/ferramentas/previas/acessorios.html` por `file://` (o servidor de teste só entrega `index.html`, `css/` e `js/`)
para conferir os enfeites: passo a passo em `docs/receitas/enfeite-novo.md`.
