# jogo/js/ui — regras locais

Contratos: `docs/contratos/loja.md` §6 (guarda de toque), `cuidados.md`, `fotos.md`, `README.md` §2.

## Estrutura
- `base.js` cria `Reino.UI` (pilha de telas, painel, `escolher`/`confirmar`, foco, teclado) e `Reino._ui`.
- As outras partes acrescentam telas a `Reino.UI`, nesta ordem (manifesto): pecas, cuidados, hud, materia,
  bau, loja, estabulo, petshop, ovos, lugares, ajustes, aparencia, pais.
- O que cada parte publica em `Reino._ui` está no fim de `base.js`. Tela nova = arquivo novo + linha no manifesto.
- Estilos em `jogo/css/` (regras em `jogo/css/CLAUDE.md`).

## Regras
- Toda tela que gasta estrela ou comida usa `gasta: true` e a guarda de toque (`UI.segurarToques`,
  `UI.toqueSegurado`). O 2º toque não pode cair no que aparece embaixo.
- Teclado: foco visível, Tab preso na tela de cima, Esc fecha; o `seguro` recebe o foco.
  Itens só de leitor de tela ficam de fora.
- Texto para criança: pt-BR correto e carinhoso; `hifenizar` para a fonte pixel.
- Emoji na tela precisa de desenho em `js/arte/icones/<lote>.js`.
- Animações desligadas e movimento reduzido valem aqui também.
- "Apagar tudo", "Novo ciclo" e pagamentos (`pais.js`): só no ambiente de teste.

## Antes de entregar
- `npm test` e `npm run e2e` (imagens em celular, tablet e notebook).
