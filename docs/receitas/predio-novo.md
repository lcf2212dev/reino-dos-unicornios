# Receita: prédio novo no mapa (com interior)

Para que serve: um lugar novo no reino (como a Pet Shop e o Observatório): desenho de fora no mapa, porta,
interior com cômodos, objetos e personagens. Regras: `docs/contratos/interiores.md` e
`docs/contratos/cena-e-motor.md` §9. Modelo mais simples de copiar: `jogo/js/interiores/petshop/`.

## Checklist de arquivos (`<p>` = id do prédio, ex.: `padaria`)
| Arquivo | O que é |
|---|---|
| `jogo/js/interiores/<p>/falas.js` | `Reino.FALAS_INTERIORES.<p> = { npcs, objetos, extras? }` (carrega primeiro) |
| `jogo/js/interiores/<p>/objetos*.js` | objetos temáticos `Reino.Interiores.objeto('<p>-<nome>', …)`; o que as partes dividem em `Reino._predios.<p>` |
| `jogo/js/interiores/<p>/<p>.js` | `Reino.registrarInterior({ id: '<p>', lugar: '<p>', entrada: true, pacote: 'interior-<p>', … })` |
| `jogo/js/interiores/<p>/fora.js` | desenho de fora: `if (window.Mapa && Mapa.PREDIOS) Mapa.PREDIOS.<p> = function (ctx, px, py, w, h) {…}` |
| (opcional) `jogo/js/interiores/<p>/acoes.js` | telas e ações próprias (`Reino.NPCs.registrarTela`, `registrarAcao`, `registrarStatus`) |
| `jogo/js/mundo/lugares.js` | entrada em `Mapa.LUGARES_FIXOS` COM `caminho` (no fim da lista) |
| `jogo/js/manifesto.js` | cada parte, grupo `'interiores'`, `node: true`, ANTES de `js/interiores/padrao.js`; `npm run index` |
| `jogo/ferramentas/validar/validar-interiores.js` | o id em `LUGARES` (lista fixa dos lugares que não são matéria) |
| `jogo/js/ui/lugares.js` | emoji e linha de informação no menu Lugares (`UI.telaLugares`) |
| `jogo/js/personagens/elenco.js` + `jogo/js/nucleo/config.js` | cada personagem (`personagem-novo.md`) |
| (opcional) música | `musica-nova.md` (sem faixa própria toca a do mapa) |
| (opcional) `jogo/js/mundo/predios.js` | só se o desenho de fora não ficar no `fora.js` do prédio |

## Passo a passo
1. Lugar no mapa (`jogo/js/mundo/lugares.js`): `{ id, nome, sprite, rect: { x, y, w, h }, placa: 'acima',
   caminho: [[x, y], …] }`. A porta fica no meio da última linha do `rect`. `caminho` = tiles de rua, da rua
   até a frente da porta. Escolha um espaço livre (prévia `jogo/ferramentas/previas/mapa.html` por `file://`).
2. Falas (`falas.js`): curtas (`licoes-de-voz.md`). Objetos: `objetos.<chave>` = lista de falas.
3. Objetos temáticos: formato em `docs/contratos/interiores.md` §5 (`desenhar(ctx, px, py, obj, P)`, `chave`,
   `topo`, `anim`, `toque`). Use `Reino.Interiores.desenho` (paleta e helpers) em vez de copiar funções.
4. Interior (`<p>.js`): formato em `docs/contratos/interiores.md` §3. `saida` na última fileira de um cômodo,
   `spawn` 1 tile acima. Critério de "rico": ≥ 15 tipos de objeto por cômodo, nenhum 3×3 de chão vazio,
   ≥ 3 objetos interativos, tudo alcançável.
5. Desenho de fora (`fora.js`), no tamanho do `rect` (`w`, `h` em px = tiles × 16). Brilho animado:
   `Mapa.PREDIOS_ANIM.<p>` (só com Animações).
6. Menu Lugares (`jogo/js/ui/lugares.js`): um `else if (l.tipo === '<p>')` com emoji e informação.
   `UI.abrirLugar` só precisa de ramo novo se o prédio tiver tela própria.
7. Validador: acrescente `'<p>'` na lista `LUGARES` de `jogo/ferramentas/validar/validar-interiores.js`.
8. Manifesto (partes na ordem: `falas.js`, objetos, `<p>.js`, `acoes.js`, `fora.js`) + `npm run index`.
9. Vozes do pacote `interior-<p>`: `fala-nova-e-vozes.md`.

## Validadores
```
npm run validar        # interiores: grade, rico, alcance, ações, lugares; index x manifesto
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

Conferir: `jogo/ferramentas/previas/interiores.html` por `file://` (acha o prédio pelo grupo do manifesto);
no jogo, servidor de TESTE + save sintético (modelo em `enfeite-novo.md` §6) e `__reino.entrar('<p>')`;
`__reino.tempoQuadro()` ≤ 16,7 ms com a CPU 4× mais lenta.

## Armadilhas
- Lugar sem `caminho`: entra antes do sorteio e muda árvores e flores do reino inteiro (`Math.random` em ordem).
- `node: true`: nada de DOM, canvas, `PA` ou `Reino.Progresso` no carregamento; só dentro de funções.
- Nas ferramentas os prédios carregam em ordem ALFABÉTICA da pasta (`padrao` por último) e isso fixa a ordem
  do `falas.json`: falas e dados compartilhados antes de quem usa, dentro da pasta.
- `validar-interiores.js` recusa lugar fora da lista `LUGARES`.
- Nada de canvas novo por quadro; o estático é pré-renderizado.
- Um interior por lugar com `entrada: true`; andares do mesmo prédio usam o mesmo `pacote`.
