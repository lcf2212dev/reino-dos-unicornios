# Helpers de desenho: uma fonte só

**Data:** 2026-09-26 · **Contexto:** refatoração (branch feat/ref-desenho)

## Decisão
`jogo/js/arte/desenho.js` (`Reino.Desenho`) é a fonte única dos helpers de pixel e da cor do
contorno. Cópias IDÊNTICAS viraram apelidos (`var ret = D.ret;`); as que se comportam diferente
ficaram onde estavam, com um comentário dizendo por quê. Nenhum pixel mudou (referências completas
e prova de equivalência helper a helper).

`desenho.js` passou a carregar **antes** de `js/arte/pixelart.js` no manifesto (não faz nada na
carga além de registrar funções): `PA.cor` agora é `Reino.Desenho`. As prévias que carregam o grupo
`pixelart` ganharam `'arte/desenho'` na lista `nomes:`.

Novo em `Reino.Desenho`: `rng(semente)`, o sorteio com semente (LCG) que estava copiado em
`mundo/mapa.js` e `interiores/observatorio/planetas.js`.

## Virou apelido de Reino.Desenho / Reino.util
| Helper | Onde estava copiado |
|---|---|
| `ret`, `circulo`, `elipse`, `triangulo`, `contornoRet` | `mundo/mapa-desenho.js` (o contorno de lá é `C.contorno`, a mesma cor de `K`) |
| `ret`, `circulo`, `elipse`, `contornoRet`, `brilho` | `interiores/observatorio/fora.js` |
| `brilho` | `interiores/estabulo/estabulo.js`, `portugues/objetos-hall-cozinha.js`, `loja/desenhos.js`, `petshop/objetos-loja.js` |
| `matriz` | `interiores/castelo/objetos.js`, `interiores/torre/objetos.js`, `sistemas/banho-desenho.js` (`mapaPixels`) |
| `circulo` | `sistemas/banho-desenho.js` (`circ`) |
| `misturar`, `escurecer`, `clarear`, `hexRgb` | `arte/pixelart.js` (`PA.cor`, `hexParaRgb`) |
| `sorte` | `interiores/observatorio/ceu.js` |
| `rng` (novo em Desenho) | `mundo/mapa.js`, `interiores/observatorio/planetas.js` |
| `K` (`'#3a2446'`) | `var K`/`CONTORNO` locais de 40 arquivos (prédios, npcs, fotos, banho, pixelart, jogador) |
| `Reino.util.sortear` | `interiores/observatorio/falas.js` |

Os `brilho` locais não tinham cor padrão (o de Desenho usa branco quando falta a cor); todas as
chamadas passam uma cor constante, então o desenho é o mesmo. O `hexParaRgb` antigo do `PA.cor`
dava erro com algo que não fosse texto (o de Desenho faz `String(h)`); com texto, o resultado é igual.

## Ficou separado (e por quê)
- `observatorio/ceu.js` `hexRgb`/`misturar`/`escurecer`/`clarear`: não expande cor de 3 dígitos.
- `observatorio/ceu.js` `brilho`: sem cor, usa a ESTRELA (não o branco).
- `interiores/padrao.js` `hex`/`mistura`/`clara`/`escura`: cor vazia vira `#999999`, não limita a
  0–255 e `escura` mistura com o preto.
- `observatorio/planetas.js` `esc`/`cla`/`mis` e `personagens/npcs.js` `esc`/`cla`/`mis`: embrulhos
  (memo / busca tardia) do `PA.cor`, que já é o de Desenho.
- `observatorio/planetas.js` `discoBuf`: pinta numa grade `Buf`, não num canvas.
- `sistemas/banho-desenho.js` `brilho` e `personagens/jogador-desenho.js` `sombra`: desenham no
  pintor (px de tela), com tamanho/força.
- `mundo/mapa-desenho.js` `sombraBase` e `portaArco`: só existem lá.
- `observatorio/falas.js` `copia`: cópia rasa; `Reino.util.copia` é funda (JSON).
- `motor/transicao.js` `COR_IRIS`: tem o valor de `K`, mas é outra coisa (a cor da íris).
- Paletas de ícones (`arte/icones/*`): dados; o `'#3a2446'` fica escrito nelas.

## Prova
`/tmp/reino-refatoracao/desenho/equivalencia.js`: versão antiga (lida do git) × nova, com um
contexto de mentira que grava `fillStyle`/`fillRect`, 11 320 casos (inclusive fracionários,
negativos, raio 0, todas as cores escritas no jogo), 0 diferenças, com controle negativo
(`+ 0.5` × `+ 0.35` no círculo é acusado).
