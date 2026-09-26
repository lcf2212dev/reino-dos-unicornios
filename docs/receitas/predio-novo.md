# Receita: prédio novo no mapa (com interior)

Para que serve: um lugar novo no reino (como a Pet Shop e o Observatório): desenho de fora no mapa, porta,
interior com cômodos, objetos e personagens. Regras: `docs/contratos/interiores.md` e
`docs/contratos/cena-e-motor.md` §9. Modelo mais simples de copiar: `jogo/js/interiores/petshop/`.

## Comece pelo gerador
```
npm run novo -- predio <p> --nome "Padaria" --emoji 🥐 --seco     # sem --rect: escolhe a 1ª área livre (e diz qual)
npm run novo -- predio <p> --nome "Padaria" --emoji 🥐
npm run ver -- --livres 5x4          # outras áreas livres; escolhida uma: --rect x,y,w,h --caminho "x,y;x,y;…"
npm run ver -- --previa mapa         # o mapa com grade numerada, os lugares e as áreas livres pintadas
```
Cria `falas.js`, `objetos.js`, `<p>.js`, `fora.js` e `<p>/lugar.js` (um cômodo que já passa no validador), as linhas do
manifesto e o index. À mão: preencher os `(preencher)`, mais cômodos e objetos, o desenho de fora, personagens
(`npm run novo -- personagem <id> --predio <p>`) e as vozes. Os passos abaixo dizem o que cada arquivo precisa.

## Checklist de arquivos (`<p>` = id do prédio, ex.: `padaria`)
| Arquivo | O que é |
|---|---|
| `jogo/js/interiores/<p>/falas.js` | `Reino.FALAS_INTERIORES.<p> = { npcs, objetos, extras? }` (carrega primeiro) |
| `jogo/js/interiores/<p>/objetos*.js` | objetos temáticos `Reino.Interiores.objeto('<p>-<nome>', …)`; o que as partes dividem em `Reino._predios.<p>` |
| `jogo/js/interiores/<p>/<p>.js` | `Reino.registrarInterior({ id: '<p>', lugar: '<p>', entrada: true, pacote: 'interior-<p>', … })` |
| `jogo/js/interiores/<p>/fora.js` | desenho de fora: `if (window.Mapa && Mapa.PREDIOS) Mapa.PREDIOS.<p> = function (ctx, px, py, w, h) {…}` |
| `jogo/js/interiores/<p>/lugar.js` | `Reino.registrarLugar({ id, nome, sprite, rect, placa, caminho, menu })` (depois do `fora.js`) |
| (opcional) `jogo/js/interiores/<p>/acoes.js` | telas e ações próprias (`Reino.NPCs.registrarTela`, `registrarAcao`, `registrarStatus`) |
| `jogo/js/manifesto.js` | cada parte, grupo `'interiores'`, `node: true`, ANTES de `js/interiores/padrao.js`; `npm run index` |
| `jogo/js/interiores/<p>/personagens.js` | cada personagem: `npm run novo -- personagem <id> --predio <p> [--x --y] [--acao]` (já entra no interior; `personagem-novo.md`). Não edite `elenco.js` nem `config.js` |
| (opcional) música | `musica-nova.md` (sem faixa própria toca a do mapa) |
| (opcional) `jogo/js/mundo/predios.js` | só se o desenho de fora não ficar no `fora.js` do prédio |

## Passo a passo
1. Lugar no mapa (`jogo/js/interiores/<p>/lugar.js`): `Reino.registrarLugar({ id: '<p>', nome, sprite: '<p>',
   rect: { x, y, w, h }, placa: 'acima', caminho: [[x, y], …], menu: { emoji, info?(l), avisos?(l), abrir?(l) } })`
   (`docs/contratos/interiores.md` §9.7). A porta fica no meio da última linha do `rect`. `caminho` (obrigatório) =
   tiles de rua, da rua até a frente da porta. Espaço livre: `npm run ver -- --previa mapa`.
   `menu` dá o emoji, a linha de informação e os chips do menu Lugares; `abrir` só se o prédio tiver tela própria.
   Não edite `mundo/lugares.js`, `ui/lugares.js` nem `validar-interiores.js`.
2. Falas (`falas.js`): curtas (`licoes-de-voz.md`). Objetos: `objetos.<chave>` = lista de falas.
3. Objetos temáticos: formato em `docs/contratos/interiores.md` §5 (`desenhar(ctx, px, py, obj, P)`, `chave`,
   `topo`, `anim`, `toque`). Use `Reino.Interiores.desenho` (paleta e helpers) em vez de copiar funções.
4. Interior (`<p>.js`): formato em `docs/contratos/interiores.md` §3. `saida` na última fileira de um cômodo,
   `spawn` 1 tile acima. Critério de "rico": ≥ 15 tipos de objeto por cômodo, nenhum 3×3 de chão vazio,
   ≥ 3 objetos interativos, tudo alcançável.
5. Desenho de fora (`fora.js`), no tamanho do `rect` (`w`, `h` em px = tiles × 16). Brilho animado:
   `Mapa.PREDIOS_ANIM.<p>` (só com Animações).
6. Manifesto (partes na ordem: `falas.js`, objetos, `<p>.js`, `acoes.js`, `fora.js`, `<p>/lugar.js`) + `npm run index`.
7. Vozes do pacote `interior-<p>`: `fala-nova-e-vozes.md`.

## Validadores
```
npm run validar        # interiores: grade, rico, alcance, ações; lugares (lidos dos dados: id, caminho, rect); index x manifesto
npm run unidade
npm run tamanho        # cada parte ≤ 420 linhas de código (falas.js é dado: 800)
node jogo/ferramentas/vozes/listar-falas.js
npm test
npm run e2e -- --desempenho   # esperado: mapa e dados de interiores/lugares mudam; desempenho ≤ 5% pior
```

Referências (na worktree; precisam do git): em `npm test`, o passo *referências de dados* mostra a diferença
esperada abaixo; os outros passos têm que sair ✔. Diferenças esperadas no `npm run e2e`:
- dados: `falas`, `mapa` (lugar e prédio novos), `interiores`, `elenco` (personagens novos), `loja`
  (a `config` entra aí: perfis de voz) e `vozes`;
- imagens: o mapa onde o prédio aparece e a tela `lugares`; desempenho no máximo 5% pior.
A base do e2e só muda por commit: quem integra troca o hash em `jogo/ferramentas/testes/base-referencia.txt`
depois do commit da mudança; não edite esse arquivo na tarefa. Qualquer diferença fora da lista acima é defeito.

Conferir (fotos em `/tmp/reino-testes/ver/<nome>/`):
```
npm run ver -- --previa interiores:<p>                  # prévia do interior por file://
npm run ver -- --ir <p> --nome <p>                       # dentro do prédio, nos 3 tamanhos
npm run ver -- --tela lugares --tamanhos celular         # linha e chips do menu Lugares
npm run ver -- --previa mapa                             # o prédio de fora no mapa
```
Em script: `abrirCenario()` de `jogo/ferramentas/testes/cenario.js`. `__reino.tempoQuadro()` ≤ 16,7 ms com a CPU 4× mais lenta.

## Armadilhas
- Lugar sem `caminho`: `registrarLugar` recusa (devolve `false`) e o validador acusa.
- `node: true`: nada de DOM, canvas, `PA` ou `Reino.Progresso` no carregamento; só dentro de funções.
- Nas ferramentas os prédios carregam em ordem ALFABÉTICA da pasta (`padrao` por último) e isso fixa a ordem
  do `falas.json`: falas e dados compartilhados antes de quem usa, dentro da pasta.
- `<p>/lugar.js` depois do `fora.js` no manifesto (o `sprite` tem de existir em `Mapa.PREDIOS`).
- Nada de canvas novo por quadro; o estático é pré-renderizado.
- Um interior por lugar com `entrada: true`; andares do mesmo prédio usam o mesmo `pacote`.
