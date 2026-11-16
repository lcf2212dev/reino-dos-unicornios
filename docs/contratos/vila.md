# Vila Arco-Íris (portal no Bosque, 4 lojas e a Teleportadora)

Pedido: `pedidos/2026-11-06-vila-arco-iris.md`. No centro-direita do Bosque dos Fantasmas há um portal que leva a uma
cidade menor, a **Vila Arco-Íris**: praça, **4 lojas**, **2 terrenos livres** (o terceiro, o da direita, virou os
**Treinadores de Monstros**: `monstros.md`) e a **Teleportadora**, um unicórnio branco de crina arco-íris
arco-íris (uma na praça da Vila e uma na praça da cidade principal). Para conversar com um
lojista ela responde certo uma pergunta sorteada entre todas as do **4º bimestre**; comprar e vender aceitam **vários
itens de uma vez**.

## 1. Onde está no código
| Parte | Arquivo |
|---|---|
| números | `js/nucleo/config-vila.js` (`Reino.config.vila`) |
| porta de escada sem desenho (portal, porta de loja) | `sentido: 'portal'` + `seta` nas `escadas` (`interiores.md` §3) |
| a conversa só depois da pergunta | gancho `porteira(npc)` dos módulos (`nucleo/modulos.js`, `personagens/npcs-conversa.js`) |
| sair para outro tile do mapa | `Cena.sair(chegada)` (`cena-e-motor.md`) |
| 100 peças de equipamento das lojas | `js/conteudo/itens/loja-moldes.js` (gerador de moldes/ícones), `loja-armas.js`, `loja-cabecas.js`, `loja-armaduras.js` |
| 50 enfeites da casa | `js/conteudo/casa/moveis-loja.js` (dados), desenhos em `js/interiores/casa/moveis-loja-a|b|c.js` |
| regras das lojas | `js/sistemas/vila-lojas.js` (`Reino.VilaLojas`, módulo `'vila-lojas'`) |
| telas | `js/ui/vila-pergunta.js` (`UI.perguntaVila`), `js/ui/vila-loja.js` (`UI.telaVilaLoja`), `css/ui-vila.css` |
| a Vila e as lojas | `js/interiores/vila/` (`falas.js` com os 4 lojistas, `fundo.js`, `objetos*.js`, `vila.js`, `lojas.js`) |
| o portal no Bosque | `js/interiores/bosque/portal-vila.js` + a escada no fim de `bosque.js` |
| os Treinadores de Monstros (o terreno da direita) | `js/interiores/vila/treinadores*.js`, `js/sistemas/treinadores.js`, `js/ui/treinadores-loja.js` (`monstros.md`) |
| a Teleportadora | desenho `js/arte/teleportadora.js`; no mapa `js/mundo/teleportadora.js`; na Vila `js/interiores/vila/teleportadora.js`; falas e viagem `js/sistemas/teleportadora.js` |

## 2. Ids
- Interiores, todos com `lugar: 'bosque'`, `entrada: false`, `pacote: 'interior-bosque'` (são parte do prédio do
  Bosque: entram pelo portal, nunca por porta do mapa):
  - `vila` "Vila Arco-Íris", céu aberto (`fundo: 'vila'`), 40 × 32, um cômodo `{ x: 1, y: 1, w: 38, h: 30 }`, spawn (2, 19).
  - `vila-casa` "Casa Bonita", `vila-armas` "Forja Brilhante", `vila-cabecas` "Elmos e Chapéus", `vila-armaduras`
    "Armaduras e Botas": 16 × 12, um cômodo `{ x: 1, y: 1, w: 14, h: 10 }`.
- Ligações (escadas pareadas `sentido: 'portal'`):
  - Bosque: o portal 'bosque-portal-vila' (2 × 3 em (53, 20), colado na borda direita) com a escada no meio dele, (53, 22),
    `seta: false`, `chegar: { x: -1, y: 0 }` ↔ Vila (1, 19), na borda esquerda, `seta: false`, `chegar: { x: 1, y: 0 }`. Chega no Bosque em (52, 22); na Vila, em (2, 19).
  - Treinadores de Monstros: fachada `vila-treinadores-predio` (6 × 5) em (31, 12), no lugar do terreno da direita; porta
    = escada `portal` em (33, 17), `chegar: { x: 0, y: 1 }` ↔ interior `vila-treinadores` (16 × 12), saída (8, 10) como as
    lojas. Os outros 2 terrenos (esquerda) seguem livres (`monstros.md`).
  - Porta de cada loja na Vila, na fileira 8, em x = 6, 15, 24, 33 (casa, armas, cabecas, armaduras), seta padrão,
    `chegar: { x: 0, y: 1 }` ↔ saída da loja em (8, 10) `seta: 'desce'`, `chegar: { x: 0, y: -1 }`.
- Lojistas (`Reino.registrarPersonagem`, com voz): `lavanda` "Dona Lavanda" (casa), `bigorna` "Seu Bigorna" (armas),
  `plumita` "Madame Plumita" (cabecas), `ferrolho` "Capitão Ferrolho" (armaduras). Ação `{ tipo: 'vilaLoja', loja }`.
- Lojas (`loja`): `casa`, `armas`, `cabecas`, `armaduras`.
- Peças: `loja: 'armas'|'cabecas'|'armaduras'`, `preco` (estrelas), `arenas: []` (não caem de monstro). Enfeites:
  `Reino.registrarMovelCasa({ …, loja: true })`, objeto `casa-movel-<id>`.
- Teleportadora: objeto `vila-teleportadora` (2 × 1, sólido) com `acao: { tipo: 'teleportadora', para: 'cidade' }`;
  no mapa, 2 × 1 a partir do tile `config.vila.teleportadoraMapa`, levando `para: 'vila'`.

## 3. Números
`Reino.config.vila` (comentados lá): `bimestre`, `precoDecor` (30), `precos` por raridade, `vendaFracao`, `vendaDrop`,
`maxPorItem`, `chegadaVila`, `chegadaCidade`, `teleportadoraMapa`.

## 4. Lojas
- Casa Bonita: só compra; o enfeite vira peça da casa com `CasaMoveis.guardar('loja:<id>:<n>', id)` (n = a próxima
  livre). Os móveis `loja: true` ficam fora do sorteio das salas e dos presentes (`casa-moveis.js:sorteaveis`). Sem casa,
  a peça espera. Nada novo no save.
- As outras três vendem as 40 (ou 20) peças delas e compram de volta qualquer peça das famílias delas (armas: espadas;
  cabecas: capacete e chapéu; armaduras: armadura e botas) da mochila ou do baú, nunca a vestida. Preço de venda:
  `floor(preco × vendaFracao)` (mínimo 1) ou `vendaDrop[raridade]` para as que não têm preço.
- Compra: `P.gastarEstrelas(total)` e `Itens.ganhar(id)` por peça (mochila; cheia, o baú). Venda: `Itens.jogarFora(uid)`
  e `P.ganharEstrelas(total)`. `P.salvar()` e `MAPA_MUDOU`.
- Tela: saldo, abas Comprar/Vender, cartões com ícone, nome, raridade, atributos e preço, carrinho com − e + (até
  `maxPorItem` de cada) e o total; confirma antes (`gasta: true`).

## 5. Pergunta antes da conversa
- O módulo `'vila-lojas'` tem `porteira(npc)`: lojista com ação `vilaLoja` → `UI.perguntaVila(npc)`. Certo: a conversa
  normal do NPC (oi, convite "Vamos!") e a loja. Errado ou fechar: mostra a certa e não conversa. Toda conversa pede
  uma pergunta nova.
- Sorteio uniforme entre todas as perguntas das matérias do bimestre `config.vila.bimestre`, não arquivadas, com os
  filtros do Bosque (`config.fantasmas.perguntaForaTipos`, `livre`, `escrever` sem `chaves`); chave `'vila:pergunta'`.
  Não dá estrela nem Aura; não mexe no save.

## 6. Teleportadora
- Unicórnio adulto branco com crina arco-íris, sem asas e sem aura (pedido do Leandro, 06/11).
- Balão `Reino.Claude.falar` com `quem: { nome: 'Teleportadora', retrato, voz: 'npc-teleportadora' }`: na cidade leva
  à Vila (`Cena.irPara('vila', chegadaVila)`); na Vila leva à cidade (`Cena.sair(chegadaCidade)`).

## 7. Testes
`unidade/vila-lojas.test.js` (preços, compra/venda de vários, pergunta do 4º bimestre, porteira, móveis fora do
sorteio), `unidade/vila-itens.test.js` (as 100 peças, moldes e ícones), `unidade/casa-moveis-loja.navegador.test.js` (os
50 enfeites), `unidade/vila.navegador.test.js` (portal, Vila, portas das lojas, lojistas, terrenos) e
`unidade/teleportadora.navegador.test.js` (no mapa e na Vila, as duas viagens).
