# Cidade Nova (portal no Bosque, 4 lojas, Teleportadora)

Pedido: `pedidos/2026-11-06-cidade-nova.md`. No centro-direita do Bosque dos Fantasmas há um portal
que leva a uma cidade menor: praça, **4 lojas** (decoração da casa, armas, capacetes/chapéus,
armaduras/botas), **3 terrenos livres** e a **Teleportadora**, um unicórnio de aura arco-íris que
também fica na praça da cidade principal. Para falar com o NPC de uma loja é preciso acertar uma
pergunta sorteada entre todas as do **4º bimestre**; a compra e a venda aceitam **vários itens de
uma vez**.

## 1. Onde está no código
| Parte | Arquivo |
|---|---|
| números | `js/nucleo/config-loja-cidade.js` (`Reino.config.lojaCidade`) |
| catálogo das 100 peças de equipamento | `js/conteudo/itens/loja-cidade.js` (cria itens, moldes `Reino.VESTES` e ícones `item:<id>`) |
| os 50 móveis da casa | `js/conteudo/casa/loja-decoracao.js`; desenhos em `js/interiores/casa/loja-moveis.js` |
| regras das lojas | `js/sistemas/loja-cidade.js` (`Reino.LojaCidade`, módulo `'loja-cidade'`) |
| telas | `js/ui/loja-cidade.js` (`UI.perguntaLoja`, `UI.telaLojaCidade`) + `css/ui-loja-cidade.css` |
| a cidade e as 4 lojas | `js/interiores/cidade-nova/` (`fundo.js`, `objetos.js`, `cidade.js`, `lojas.js`) |
| o portal no Bosque | `js/interiores/bosque/portal-cidade.js` + uma linha na lista `fixo` de `bosque.js` |
| a Teleportadora (desenho) | `js/arte/teleportadora.js` (`Reino.TeleportadoraArte`, `Reino.PortalCidadeArte`) |
| a Teleportadora na praça principal | `js/mundo/teleportadora.js` |
| a Teleportadora (falas e viagens) | `js/sistemas/teleportadora.js` (`Reino.Teleportadora`) |
| pergunta de um bimestre fixo | `Reino.Bosque.perguntasDe(bim)` / `perguntaDoBimestre(bim)` em `js/sistemas/bosque.js` |

Manifesto: `config-loja-cidade` depois de `config-itens`; `arte/teleportadora` depois de `arte/portal`;
`conteudo/casa/loja-decoracao` depois de `moveis-salas`; `conteudo/itens/loja-cidade` depois de
`icones-b`; `sistemas/loja-cidade|teleportadora` depois de `sistemas/casa-moveis`; `ui/loja-cidade`
depois de `ui/mochila`; `mundo/teleportadora` depois de `mundo/cofre-desenho`; `interiores/casa/loja-moveis`
antes de `casa/falas.js`; `interiores/bosque/portal-cidade` antes de `bosque.js`; a pasta
`interiores/cidade-nova/*` depois do Parquinho e antes de `padrao.js`.

## 2. Ids e prefixos
- Cidade: interior `cidade-nova` (`lugar: 'portal:cidade-nova'`, `portal: true`, `entrada: false`,
  `fundo: 'cidade'`), 50×38, um cômodo `praca`, spawn (25,33).
- Lojas: `loja-casa`, `loja-armas`, `loja-cabecas`, `loja-armaduras` (18×12, `lugar: 'portal:<id>'`,
  `portal: true`, `entrada: false`). Cada uma tem uma `cidade-saida` em (9,9) que volta para a frente
  da porta (em (7,7), (18,7), (29,7) e (40,7)).
- Portas da cidade: `cidade-porta` em (7,6), (18,6), (29,6), (40,6), com a ação
  `{ tipo: 'entrarLoja', interior, chegar: { x: 8, y: 9 } }`.
- Objetos da cidade: `cidade-loja` (8×3, fachada), `cidade-porta`, `cidade-terreno` (5×4, andável),
  `cidade-portal-bosque` (2×2), `cidade-teleportadora` (2×2), `cidade-arvore`, `cidade-bandeira`,
  `cidade-banca`, `cidade-mural`, `cidade-cartaz`, `cidade-saida`; a praça usa os objetos genéricos
  `fonte`, `banco`, `flores`, `luminaria-pe`, `vaso-planta`, `caixote`, `barril`, `tapete`.
- Portal no Bosque: objeto `bosque-portal-cidade` em (43,21), 2×2, **não sólido** (para não mudar o
  sorteio dos fantasmas), ação `{ tipo: 'portalCidade', para: 'cidade' }`.
- Teleportadora: `teleportadora` no mapa (2×2 em (25,23), `Mapa.CIDADE.objetos`), `cidade-teleportadora`
  na entrada (29,31) e na praça (25,20) da Cidade Nova. Mesma arte e mesmo balão.
- Equipamentos: ids `<tipo>-<material>` (`espada-cobre`, `capacete-rubi`, `chapeu-sol`,
  `armadura-aurora`, `botas-trovao`), `loja` = `'armas' | 'cabecas' | 'armaduras'`, `arenas: []`.
- Decoração: ids `vaso-rosas`, `quadro-praia`, …, objeto `loja-movel-<id>`, `loja: 'casa'`, `preco: 30`.

## 3. Números
`Reino.config.lojaCidade` (cada um comentado lá): `precoDecor` 30; `bimestre` 4; `vendaPorRaridade`
(8/16/28/45 para os equipamentos que caem de monstro); `maxPorItem` 20; as chegadas
`chegadaCidade` (25,33) e `chegadaPrincipal` (32,23); `portalBosque` (43,21), `portalCidade` (25,34),
`teleportadoraPrincipal` (25,23), `teleportadoraEntrada` (29,31) e `teleportadoraPraca` (25,20).
Preços dos equipamentos novos: comum 18, raro 32, épico 52, lendário 80 estrelas (venda pela metade,
9/16/26/40). Os 50 móveis: 30 estrelas cada.

## 4. As lojas
- **Casa & Lar** (`casa`): 50 móveis, só compra. O item vira uma peça da casa com
  `CasaMoveis.guardar('loja:<id>:<n>', <id>)`; a `CasaMoveis.qtd` e o modo decorar já a mostram. Sem
  casa ganha, a peça fica guardada e aparece quando ela chegar. Nada novo no save.
- **Forja das Lâminas** (`armas`): 20 espadas. **Elmos & Chapéus** (`cabecas`): 20 capacetes + 20
  chapéus. **Armaduras & Botas** (`armaduras`): 20 armaduras + 20 botas. Cada loja compra de volta
  **qualquer** peça das famílias dela que esteja na mochila ou no Baú de Guardados (nunca a vestida);
  `precoVenda` usa `venda`/`preco` do item ou a tabela por raridade.
- Compra: `P.gastarEstrelas(total)` e, por peça, `Itens.ganhar(id)` (mochila; cheia, Baú). O carrinho
  aceita de 1 a `maxPorItem` de cada item e vários itens. Venda: `Itens.jogarFora(uids)` +
  `P.ganharEstrelas(total)`. Tudo grava com `P.salvar` e emite `MAPA_MUDOU`.
- A tela mostra o saldo, abas **Comprar/Vender**, cartões com preço/atributos, o carrinho com `-` e
  o total; a compra/venda pergunta antes (`UI.confirmar`, `gasta: true`). No celular a grade vira uma
  coluna.

## 5. A pergunta de entrada
- `Reino.Bosque.perguntaDoBimestre(4)` sorteia **uniformemente** entre todas as perguntas das matérias
  do 4º bimestre não arquivadas, de todas as salas (feitas ou não), com os mesmos filtros do Bosque
  (`config.fantasmas.perguntaForaTipos`, `livre`, `escrever` sem `chaves`). A chave do sorteio é
  `'loja-cidade:pergunta'`.
- Ao falar com o NPC, o convite do NPC abre a tela `UI.perguntaLoja` (o card do `Desafios.render` no
  modo `'prova'`, uma tentativa; a página do livro fica em “Leia antes”, fechada). **Certo**: o botão
  vira “Entrar na loja →” e `LojaCidade.abrir` abre `UI.telaLojaCidade`. **Errado/fechar**: mostra a
  resposta certa e não abre a loja. A pergunta da entrada **não** dá estrela, Aura, móvel nem mexe no
  save do Bosque (é só a chave da loja).

## 6. A Teleportadora
- Um unicórnio adulto alado com aura arco-íris animada. Na praça principal é um objeto do mapa
  (`Mapa.alvoObjeto`/`alvoObjetoPerto`, como o cofre); na Cidade Nova é um objeto de interior com
  `ação { tipo: 'teleportadora', destino: 'principal' }`.
- O balão usa `Reino.Claude.falar` com `quem: { nome: 'Teleportadora', retrato, voz: 'narradora' }` e
  dois botões: “Agora não” e “Ir para a Cidade Nova ✨” (na principal) ou “Voltar para a Cidade
  Principal ✨” (na Cidade Nova). `irCidade` faz `Cena.irPara('cidade-nova', chegadaCidade)`;
  `irPrincipal` faz `Cena.sair()` e posiciona em (32,23). Nada de voz nova.

## 7. Portais
- Bosque → Cidade Nova: o objeto `bosque-portal-cidade` (2×2, não sólido) chama
  `Teleportadora.portal('cidade')` → `Cena.irPara('cidade-nova', (25,33))`.
- Cidade Nova → Bosque: `cidade-portal-bosque` (25,34) chama `Teleportadora.portal('bosque')` →
  `Cena.irPara('bosque', (44,23))`. O portal de volta fica na entrada, ao lado do spawn.

## 8. Save
Nenhum campo novo. Os móveis comprados usam `casaMoveis` (chaves `loja:<id>:<n>`, `carimbo`, que já
mantém as escolhas) e os equipamentos usam `itens` (peça com `uid`, como qualquer drop). Estrelas
continuam em `estrelas` (`P.gastarEstrelas`/`P.ganharEstrelas`). Save antigo: a cidade aparece com
as lojas vazias de compras; nada migra.

## 9. API e ações
```
Reino.LojaCidade
  LOJAS (casa|armas|cabecas|armaduras)  loja(id)
  compra(loja) → itens à venda   vende(loja) → itens seus que a loja compra
  preco(loja, id)  precoVenda(def)  totalDe(loja, [{id, qtd}])  itemDe(loja, id)
  comprar(loja, [{id, qtd}]) → { ok, total, entregues, estrelas } | { ok:false, motivo, falta }
  vender(loja, uids) → { ok, total, itens, estrelas }
  pergunta() → { materia, sala, desafio } | null   abrir(loja) → Promise<bool>
Reino.Teleportadora
  falar('cidade'|'principal')  irCidade()  irPrincipal()  portal('cidade'|'bosque')  quem()
Reino.UI
  perguntaLoja(loja, pergunta) → Promise<bool>   telaLojaCidade(lojaId) → Promise<void>
Reino.Bosque
  perguntasDe(bimestre) → [{ materia, sala, desafio }]   perguntaDoBimestre(bimestre) → pergunta | null
```
Ações registradas no módulo `'loja-cidade'`: `lojaCidade` (abre a entrada da loja), `entrarLoja`,
`sairLoja`. No módulo `'teleportadora'`: `teleportadora`, `portalCidade`.

## 10. Interiores de portal (`portal: true`)
A Cidade Nova e as lojas não têm lugar no mapa: entram por `Cena.irPara`, não por porta. O
`validar-interiores.js` reconhece `portal: true` e não exige `LUGARES`/entrada/alcance por escadas
para elas; o critério de “rico” e a grade continuam valendo. A entrada real é o portal do Bosque (e a
Teleportadora).

## 11. Testes
- `unidade/loja-cidade.test.js`: 50 móveis a 30; 20/20/20/20/20; compra/venda de vários, estrelas,
  mochila/baú, peças `casaMoveis`, pergunta do 4º bimestre, ações registradas.
- `unidade/cidade-nova.navegador.test.js`: portal, cidade (4 lojas, 3 terrenos, 2 Teleportadoras),
  porta da loja, pergunta certa entra/errada não, 2 móveis no carrinho.
- e2e: `--esperado` inclui `mapa|interior-bosque|comodo-bosque|tela-movel-casa|tela-(materia|livro|treino|plano|pais|album|escola)|dados/(mapa|interiores|falas|loja|npcs-status)` (a aura da
  Teleportadora aparece nas cenas da praça e o portal muda a cena do Bosque). O `npm test` completo
  confere os três tamanhos.
