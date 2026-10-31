# Contrato: Laboratório de Química

Cobre o prédio `quimica` (clareira 1 do mapa): a bancada de misturas, o caderno de receitas, o microscópio, a
tabela periódica, as descobertas no save e as estrelas; e o 2º andar (§9: curiosidades, Fogão dos Estados, Mesa de
Separar Misturas, livros). Pedidos: `arquivo/pedidos/2026-09-30-laboratorio-quimica.md`, `arquivo/pedidos/2026-09-30-quimica-andar2.md`.
Números em `Reino.config.quimica`. Só diversão e aprendizado extra: nada de dinheiro, Aura, pergunta ou erro.

## Índice
1. Onde está · 2. Telas · 3. Dados · 4. Frases e vozes · 5. O prédio · 6. Ícones · 7. Save e estrelas · 8. Antes de mexer ·
9. O 2º andar · 10. Cartões de experiência

## 1. Onde está
| Arquivo | O quê |
|---|---|
| `jogo/js/sistemas/quimica.js` | `Reino.Quimica`: misturar, descobrir, caderno, contagem, falas (node: true) |
| `jogo/js/conteudo/quimica/*.js` | dados em `Reino.QUIMICA`: ingredientes, receitas, frases, elementos, tabela, lições, lâminas, ícones |
| `jogo/js/ui/quimica-palco.js`, `quimica-bancada.js`, `css/ui-quimica-bancada.css` | a bancada (`UI.telaQuimicaBancada`) e o desenho do béquer e das reações |
| `jogo/js/ui/quimica-caderno.js`, `css/ui-quimica-caderno.css` | o caderno de receitas (`UI.telaQuimicaCaderno`) |
| `jogo/js/ui/quimica-microscopio.js`, `css/ui-quimica-microscopio.css`; `quimica-tabela.js`, `css/ui-quimica-tabela.css` | microscópio; tabela periódica |
| `jogo/js/interiores/quimica/` | reservas, falas, personagens, objetos, layout (`quimica.js`), ações (telas), fachada, lugar |
| `jogo/js/sistemas/cartoes.js`; `ui/bau-cartao.js`, `css/ui-bau-cartao.css` | os cartões de experiência (§10) e o baú do fim da sala |
| `jogo/js/sistemas/quimica-andar2.js`; `interiores/quimica/andar2*.js`, `curiosidade.js`; `ui/quimica-{estados,separar,livros}*.js` | o 2º andar (§9) |

## 2. Telas
Cada tela é um painel DOM (`UI.painel`, `docs/contratos/ui.md`), aberto na hora (síncrono) e com Esc/✕.
| Tela (id de `NPCs.registrarTela`) | Função | Opções |
|---|---|---|
| `quimica-bancada` | `Reino.UI.telaQuimicaBancada(op)` | `{ tubos?: [ids] }` (já no béquer, para teste) |
| `quimica-caderno` | `Reino.UI.telaQuimicaCaderno(op)` | `{ receita?: id }` (abre nela) |
| `quimica-microscopio` | `Reino.UI.telaQuimicaMicroscopio(op)` | `{ lamina?: id, aumento?: 10 \| 40 \| 100 }` |
| `quimica-tabela` | `Reino.UI.telaQuimicaTabela(op)` | `{ z?: n, aba?: 'tabela' \| 'licoes', licao?: id }` |
| `quimica-estados` | `Reino.UI.telaQuimicaEstados(op)` | `{ material?: id, graus?: n }` (2º andar) |
| `quimica-separar` | `Reino.UI.telaQuimicaSeparar(op)` | `{ mistura?: id, ferramenta?: id }` (2º andar) |
| `quimica-livros` | `Reino.UI.telaQuimicaLivros(op)` | `{ livro?: id, pagina?: n }` (2º andar) |
- Quem abre: os objetos do interior (`acao: { tipo: 'tela', tela }`) e a Doutora Proveta (bancada), por
  `interiores/quimica/acoes.js`. `npm run ver -- --tela quimica-bancada` (e as outras) abre direto.
- A bancada tem o botão 📒 que abre o caderno: fecha a bancada e abre o caderno (não empilha duas telas).
- Sem Animações (`Reino.util.animar()` falso, e no modo congelado do e2e): nada de rAF nem timer; desenha o quadro final.
- Pixel art (`arte.md`): canvas com `Reino.Desenho`/`Reino.Interiores.desenho`, sem `arc`, gradiente nem blur;
  ampliação inteira; efeitos em degraus e pontilhado.

## 3. Dados (`Reino.QUIMICA`, `jogo/js/conteudo/quimica/`)
Todos `node: true`, só dados (sem DOM). Formato no comentário de cada arquivo:
- `ingredientes`: `{ id, nome, cor, tipo: 'liquido' | 'po' | 'gas', fala, grupo?, formula?, forma? }`.
  Grupos: `casa` (padrão), `reagentes`, `elementos`, `gases`; filtros preservam os produtos no béquer.
  `forma` distingue soluções, cristais e pós. As cores dos gases são simbólicas e as partículas ocupam o espaço.
- `receitas`: `{ id, ordem, inicial?, nome, emoji, ingredientes: [2 ou 3 ids], efeito, cor, cor2?, acontece, explica, dica }`.
  Efeitos (a bancada desenha cada um): `explosao`, `vulcao`, `cor`, `espuma-gigante`, `dissolver`, `camadas`,
  `gotas`, `redemoinho`, `bolhas`, `precipitado`, `deposito`, `efervescencia`, `gases`. A 1ª (`pof`, vinagre + bicarbonato) é `inicial`: já vem escrita no caderno.
  Nenhum conjunto de ingredientes se repete entre receitas.
- `elementos`: cartões `{ z, simbolo, nome, familia, onde, curiosidade }` (1 a 20, 26, 29, 47, 79);
  `familias`: `{ <id>: { nome, cor } }`; `tabela`: as 118 casas `{ z, simbolo, familia, linha, coluna }`.
- `licoes`: `{ id, ordem, titulo, emoji, paginas, desenho? }`; `laminas`: `{ id, nome, emoji, explica, aumentos: { 10, 40, 100 } }`
  (nenhuma de bicho).
- 2º andar (§9): `materiais`, `mudancas` (`estados.js`); `ferramentas`, `misturas` (`separar.js`); `livros`;
  `curiosidades`. Formato no comentário de cada arquivo.

## 4. Frases e vozes
- No térreo, toda fala das telas é da Doutora Proveta: voz `npc-quimica-proveta` (`Reino.Quimica.VOZ`), pacote
  `interior-quimica` (`Reino.Quimica.PACOTE`), tocada com `Reino.Som.falar(paginas, { voz })`. No 2º andar,
  `Reino.Quimica.vozDe('<tela>')`: `estados` e `separar` na Dona Caramela (`VOZ_CARAMELA`), `livros` e `curiosidade`
  no Professor Carbono (`VOZ_CARBONO`); o `falas()` já leva a voz certa de cada texto.
- `Reino.Quimica.falas()` lista TODO texto falado (frases, ingredientes, receitas, lâminas, lições, elementos): o
  `npm run vozes` grava pelo texto exato. Texto falado fora dessa lista fica sem voz.
- Frases fixas: `Reino.QUIMICA.frases['<tela>.<nome>'] = [páginas]`, cada tela no seu `frases-<tela>.js`, com
  `Reino.QUIMICA.porFrase(chave, paginas)` (chave repetida é erro). Comuns: `frases.js` (`comum.*`). Ler:
  `Reino.Quimica.frase(chave)`.
- Página até 30 letras (sem contar emoji), frases de 3+ palavras (`docs/receitas/licoes-de-voz.md`). Símbolo
  químico só na tela; a voz fala por extenso. Número falado (estrelas) vem escrito no texto: mudou o config, regrave.

## 5. O prédio (`interiores/quimica/`)
- Lugar: `rect { x: 37, y: 24, w: 5, h: 5 }` (a clareira 1), porta (39, 28), `caminho [[39, 29]]`. `Mapa.CLAREIRAS`
  e `Mapa.RESERVADOS` não mudam (mudariam o sorteio do reino); a clareira some sozinha com o lugar no mesmo x, y.
- Interior `quimica` (`tamanho 43×15`, pacote `interior-quimica`): cômodos `microscopio` (x 1), `bancada` (x 15,
  entrada) e `atomos` (x 29), 13×13, portas em (14, 9) e (28, 9), saída (21, 13), spawn (21, 12).
- Doutora Proveta (`quimica-proveta`, reserva em `reservas.js`): vaga (24, 6), abre `quimica-bancada`.
- Objetos que abrem as telas, com estas chaves (falas em `falas.js`): `bancada`, `caderno`, `microscopio`, `tabela`.
- Objetos próprios com o prefixo `quimica-` (o `lab-` é do Observatório; os tipos `lab-*` podem ser reusados).

## 6. Ícones
Todo emoji do laboratório tem pixel art. Os novos ficam em `conteudo/quimica/icones.js` (`Reino.registrarIcones`).
Emoji novo numa tela: só um dos que já têm desenho (`npm run ver -- --previa icones`) ou dos de `icones.js`.

## 7. Save e estrelas
- Campo `quimica` (`registrarCampo`, mescla `contadores`, `novoCiclo: 'mantem'`, na cópia de segurança):
  `{ receitas: { <id>: 1 }, laminas: …, licoes: …, estados: …, separar: …, livros: … }` (grupos em
  `Reino.Quimica.GRUPOS`). Só cresce; id desconhecido fica e não conta; grupo que falta no save antigo = nada descoberto.
- `Reino.Quimica.descobrir(grupo, id)` grava na hora em que ela age (receita: no "Misturar!", antes da animação;
  lâmina: ao ver nítida; lição: ao chegar à última página) e dá as estrelas da 1ª vez: `estrelasReceitaNova`,
  `estrelasLaminaNova`, `estrelasLicaoNova`, e `estrelasCadernoCompleto` quando a receita fecha o caderno; no 2º
  andar, `estrelasEstadoNovo` (mudança de estado vista), `estrelasMisturaNova` (mistura separada) e
  `estrelasLivroNovo` (livro lido até o fim).
  Devolve `{ nova, estrelas, completo }`; repetir não dá nada. Nada de dinheiro nem Aura.
- API: `misturar(ids) → { receita, quase, tipo: 'receita' | 'falta' | 'sobra' | 'nada' | 'vazio' }` (pura);
  `descoberto(grupo, id)`, `descobertas(grupo)`, `noCaderno(id)`, `cadernoCompleto()`, `contagem()`,
  `ingredientes()`, `ingrediente(id)`, `receitas()`, `todasReceitas()`, `receita(id)`, `laminas()`, `lamina(id)`, `licoes()`,
  `licao(id)`, `elementos()`, `elemento(z)`, `tabela()`, `familias()`, `frase(chave)`, `falas()`.

## 8. Antes de mexer
- Receita nova: só dados em `receitas.js` (efeito da lista do §3; efeito novo pede o desenho na bancada).
- Mudou texto falado: `npm run vozes` (skill `gravar-vozes`).
- Testes: `unidade/quimica.test.js` (mistura e save), `unidade/quimica-*.navegador.test.js` (telas).

## 9. O 2º andar
Interior `quimica-2` (`interiores/quimica/andar2.js`, lugar `quimica`, pacote `interior-quimica`, sem saída para o
mapa): 43×15, cômodos `cozinha` (x 1), `curiosidades` (x 15) e `biblioteca` (x 29), 13×13, portas em (14, 9) e (28, 9),
spawn (21, 11). Só curiosidade e aprendizado extra, como o térreo: nada de dinheiro, Aura, pergunta ou erro.
- Escadas pareadas (`interiores.md` §3.1): no térreo, `sobe` em (21, 3), no fundo da Bancada, no fim do corredor da
  porta (chega-se lá em cima em (21, 11)); no 2º andar, `desce` em (21, 12) (chega-se embaixo em (21, 4)).
- Personagens (`reservas.js`; visual em `personagens.js`, falas em `personagens-falas.js`): Professor Carbono
  (`quimica-carbono`, vaga (24, 6), ação `{ tipo: 'quimica-curiosidade', tema: 'todas' }`) e Dona Caramela
  (`quimica-caramela`, vaga (7, 6), abre `quimica-estados`; a fala `nova` dela é o convite da tela,
  "Vamos ver a água mudar?", o mesmo áudio).
- Objetos que abrem as telas (chaves e falas em `andar2-falas.js`): `fogao` → `quimica-estados`, `mesa-separar` →
  `quimica-separar` (Cozinha Química), `estante-livros` → `quimica-livros` (Biblioteca). Objetos próprios do andar em
  `andar2-objetos*.js`, com o prefixo `quimica-`.
- Curiosidades: ação `{ tipo: 'quimica-curiosidade', tema }` (`interiores/quimica/curiosidade.js`) em objetos e no
  Professor Carbono; conta `Reino.Quimica.curiosidade(tema)` na voz dele, com "Outra curiosidade! ✨" e "Tchau! 💛".
  Temas: `Reino.Quimica.TEMAS_CURIOSIDADE` (cozinha, corpo, agua, ar-fogo, metais, cores, elementos, cientistas,
  cristais, brasil); tema sem curiosidade cai em todas. Sorteio sem repetir na sessão (memória; nada no save), pela
  chave no modo congelado. Pelo menos 40, cada uma com fonte e URL no comentário; nada de bicho.
- API (`sistemas/quimica-andar2.js`): `curiosidades()`, `temasCuriosidade()`, `curiosidade(tema)`,
  `reiniciarCuriosidades()` (testes); `materiais()`, `material(id)`, `mudancas()`, `mudanca(id)`,
  `estadoEm(material, graus) → 'solido' | 'liquido' | 'gas'`, `mudancaEntre(material, de, para) → mudança | null`;
  `ferramentas()`, `ferramenta(id)`, `misturas()`, `mistura(id)`, `separa(mistura, ferramenta) → bool` (pura);
  `livros()`, `livro(id)`.
- Ids do contrato: mudanças `agua-derreter`, `agua-ferver`, `agua-condensar`, `agua-congelar`, `chocolate-derreter`,
  `manteiga-derreter`, `vela-derreter` (o sólido que volta a endurecer não é descoberta); ferramentas `coador`, `mao`,
  `peneira`, `sol`, `ima`, `esperar`; misturas `cafe`, `feijao`, `areia-pedras`, `agua-sal`, `areia-ferro`,
  `agua-barrenta` (uma ferramenta vale quando separa de verdade: `certas` pode ter mais de uma); livros `cozinha`, `ar`,
  `fogo`, `ferrugem`, `agua`, `planta`, `corpo`, `cientistas` (`desenho` = o id). Descoberta: estados na hora em que o
  termômetro passa do ponto; separar no toque na ferramenta certa, antes da animação; livro ao chegar à última página.
- `Reino.config.quimica.grausPorToque`: quanto o termômetro do Fogão anda a cada toque.
- Selo "✨ Novo!" do menu Lugares: volta no Laboratório até ela entrar no `quimica-2`, mesmo já tendo entrado no térreo.
- Testes: `unidade/quimica-andar2.test.js` (API, ids, save, escadas) e `unidade/quimica-{estados,separar,livros}.navegador.test.js`.

## 10. Cartões de experiência
Pedido: `pedidos/2026-10-31-moedas-cofre-cartoes.md` §3–§4. Cada sala feita pela 1ª vez dá o próximo cartão: uma
receita nova da bancada, que fica escrita no caderno ("Experimente!") até ela fazer.
- Dados (`conteudo/quimica/receitas-cartoes.js`, `ingredientes-cartoes.js`): receita com `cartao: n` (1..N sem
  buraco, a ordem de ganho) e `ordem: 100 + n`; produto com `cartao: true` (preso no baú até o 1º cartão que o usa).
  Todo produto de cartão é usado por algum cartão. Receita nova = só dados (quando os cartões acabam, a sala não dá baú).
- Derivado das salas feitas, SEM campo no save (`sistemas/cartoes.js`, `Reino.Cartoes`): contam as salas de
  `Reino.materias` com `salas[id].feita ≥` o início do dia `Reino.config.cartoes.desde` (hora local), ordenadas por
  (`feita`, id); a k-ésima dá o cartão k. As salas do 4º bimestre já feitas dão os cartões delas na hora.
- API `Reino.Cartoes`: `lista()` (receitas de cartão por `cartao`), `ganhos()`, `ganho(receitaId)`, `cartao(n)`,
  `daSala(salaId)` (o n daquela sala, ou 0), `produtosNovos(n)` (os produtos de cartão do n que nenhum cartão < n usa),
  `liberado(ingredienteId)` (sem `cartao`: sempre; com: um cartão ganho o usa OU uma receita descoberta no save o usa),
  `novoNaBancada(ingredienteId)` (liberado e ainda sem receita descoberta que o use: selo "Novo!"), `FALAS`.
- O que ela já usou nunca some: receita de cartão descoberta continua em `receitas()` e segura os produtos dela,
  mesmo num Novo ciclo (que zera as salas e, com elas, os cartões ainda não feitos).
- Na química: `receitas()` (e `misturar`, que usa ela) esconde as de cartão não ganhas nem descobertas;
  `todasReceitas()` e `falas()` veem tudo (a voz se grava antes); `noCaderno(id)` vale para cartão ganho;
  `ingredientes()` esconde os produtos não liberados; `descobrir('receitas', id)` de cartão não ganho recusa;
  `cadernoCompleto()` e as `estrelasCadernoCompleto` contam só as receitas sem `cartao` (o bônus não se repete);
  `contagem().receitas` conta as que ela vê. Caderno: a marca "🃏 Cartão n" na cartinha e na página.
- Fim da sala (`atividades/missao.js`, `terminar`): na 1ª vez, a linha "🃏 Cartão de experiência novo!" (se
  `daSala > 0`); no botão final (ou no ✕), na ordem: fecha a tela → `UI.festaMoedas(dinheiro + bônus)`
  (`ui/moedas-festa.js`: as 🪙 voam até o chip do HUD com o som `plim`) → `UI.abrirCartaoBau(n)` → chocar os ovos →
  `aoTerminar`. Sem animações: os mesmos passos, parados (um plim e o número final; o baú, quadro a quadro, a cada toque).
- `UI.abrirCartaoBau(n) → Promise` (`ui/bau-cartao.js`): o baú dos presentes (céu, baú, luz; a tela leva também
  `.tela-presente`) → "Ver o cartão ✨" → a cartinha (emoji, nome, tubinhos) → com produtos novos, "Novo no
  laboratório!" e os frascos (nome e fórmula) → "Ok! ✨". Esc pula para o fim e, no fim, fecha. Nada se grava.
  Voz do Claude (`Reino.Cartoes.FALAS`, pacote `geral`).
- Testes: `unidade/cartoes.test.js` (regra e dados) e `unidade/bau-cartao.navegador.test.js` (baú e moedas).
