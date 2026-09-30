# Contrato: Laboratório de Química

Cobre o prédio `quimica` (clareira 1 do mapa): a bancada de misturas, o caderno de receitas, o microscópio, a
tabela periódica, as descobertas no save e as estrelas. Pedido: `pedidos/2026-09-30-laboratorio-quimica.md`.
Números em `Reino.config.quimica`. Só diversão e aprendizado extra: nada de dinheiro, Aura, pergunta ou erro.

## Índice
1. Onde está · 2. Telas · 3. Dados · 4. Frases e vozes · 5. O prédio · 6. Ícones · 7. Save e estrelas · 8. Antes de mexer

## 1. Onde está
| Arquivo | O quê |
|---|---|
| `jogo/js/sistemas/quimica.js` | `Reino.Quimica`: misturar, descobrir, caderno, contagem, falas (node: true) |
| `jogo/js/conteudo/quimica/*.js` | dados em `Reino.QUIMICA`: ingredientes, receitas, frases, elementos, tabela, lições, lâminas, ícones |
| `jogo/js/ui/quimica-palco.js`, `quimica-bancada.js`, `css/ui-quimica-bancada.css` | a bancada (`UI.telaQuimicaBancada`) e o desenho do béquer e das reações |
| `jogo/js/ui/quimica-caderno.js`, `css/ui-quimica-caderno.css` | o caderno de receitas (`UI.telaQuimicaCaderno`) |
| `jogo/js/ui/quimica-microscopio.js`, `css/ui-quimica-microscopio.css`; `quimica-tabela.js`, `css/ui-quimica-tabela.css` | microscópio; tabela periódica |
| `jogo/js/interiores/quimica/` | reservas, falas, personagens, objetos, layout (`quimica.js`), ações (telas), fachada, lugar |

## 2. Telas
Cada tela é um painel DOM (`UI.painel`, `docs/contratos/ui.md`), aberto na hora (síncrono) e com Esc/✕.
| Tela (id de `NPCs.registrarTela`) | Função | Opções |
|---|---|---|
| `quimica-bancada` | `Reino.UI.telaQuimicaBancada(op)` | `{ tubos?: [ids] }` (já no béquer, para teste) |
| `quimica-caderno` | `Reino.UI.telaQuimicaCaderno(op)` | `{ receita?: id }` (abre nela) |
| `quimica-microscopio` | `Reino.UI.telaQuimicaMicroscopio(op)` | `{ lamina?: id, aumento?: 10 \| 40 \| 100 }` |
| `quimica-tabela` | `Reino.UI.telaQuimicaTabela(op)` | `{ z?: n, aba?: 'tabela' \| 'licoes', licao?: id }` |
- Quem abre: os objetos do interior (`acao: { tipo: 'tela', tela }`) e a Doutora Proveta (bancada), por
  `interiores/quimica/acoes.js`. `npm run ver -- --tela quimica-bancada` (e as outras) abre direto.
- A bancada tem o botão 📒 que abre o caderno: fecha a bancada e abre o caderno (não empilha duas telas).
- Sem Animações (`Reino.util.animar()` falso, e no modo congelado do e2e): nada de rAF nem timer; desenha o quadro final.
- Pixel art (`ui.md` §10): canvas com `Reino.Desenho`/`Reino.Interiores.desenho`, sem `arc`, gradiente nem blur;
  ampliação inteira; efeitos em degraus e pontilhado.

## 3. Dados (`Reino.QUIMICA`, `jogo/js/conteudo/quimica/`)
Todos `node: true`, só dados (sem DOM). Formato no comentário de cada arquivo:
- `ingredientes`: `{ id, nome, cor, tipo: 'liquido' | 'po', fala }` (12 tubos).
- `receitas`: `{ id, ordem, inicial?, nome, emoji, ingredientes: [2 ou 3 ids], efeito, cor, cor2?, acontece, explica, dica }`.
  Efeitos (a bancada desenha cada um): `explosao`, `vulcao`, `cor`, `espuma-gigante`, `dissolver`, `camadas`,
  `gotas`, `redemoinho`, `bolhas`. A 1ª (`pof`, vinagre + bicarbonato) é `inicial`: já vem escrita no caderno.
  Nenhum conjunto de ingredientes se repete entre receitas.
- `elementos`: cartões `{ z, simbolo, nome, familia, onde, curiosidade }` (1 a 20, 26, 29, 47, 79);
  `familias`: `{ <id>: { nome, cor } }`; `tabela`: as 118 casas `{ z, simbolo, familia, linha, coluna }`.
- `licoes`: `{ id, ordem, titulo, emoji, paginas, desenho? }`; `laminas`: `{ id, nome, emoji, explica, aumentos: { 10, 40, 100 } }`
  (nenhuma de bicho).

## 4. Frases e vozes
- Toda fala das telas é da Doutora Proveta: voz `npc-quimica-proveta` (`Reino.Quimica.VOZ`), pacote
  `interior-quimica` (`Reino.Quimica.PACOTE`), tocada com `Reino.Som.falar(paginas, { voz })`.
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
  `{ receitas: { <id>: 1 }, laminas: { <id>: 1 }, licoes: { <id>: 1 } }`. Só cresce; id desconhecido fica e não conta.
- `Reino.Quimica.descobrir(grupo, id)` grava na hora em que ela age (receita: no "Misturar!", antes da animação;
  lâmina: ao ver nítida; lição: ao chegar à última página) e dá as estrelas da 1ª vez: `estrelasReceitaNova`,
  `estrelasLaminaNova`, `estrelasLicaoNova`, e `estrelasCadernoCompleto` quando a receita fecha o caderno.
  Devolve `{ nova, estrelas, completo }`; repetir não dá nada. Nada de dinheiro nem Aura.
- API: `misturar(ids) → { receita, quase, tipo: 'receita' | 'falta' | 'sobra' | 'nada' | 'vazio' }` (pura);
  `descoberto(grupo, id)`, `descobertas(grupo)`, `noCaderno(id)`, `cadernoCompleto()`, `contagem()`,
  `ingredientes()`, `ingrediente(id)`, `receitas()`, `receita(id)`, `laminas()`, `lamina(id)`, `licoes()`,
  `licao(id)`, `elementos()`, `elemento(z)`, `tabela()`, `familias()`, `frase(chave)`, `falas()`.

## 8. Antes de mexer
- Receita nova: só dados em `receitas.js` (efeito da lista do §3; efeito novo pede o desenho na bancada).
- Mudou texto falado: `npm run vozes` (skill `gravar-vozes`).
- Testes: `unidade/quimica.test.js` (mistura e save), `unidade/quimica-*.navegador.test.js` (telas).
