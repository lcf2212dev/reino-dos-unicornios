# jogo/js/ui — regras locais

Contrato da camada: `docs/contratos/ui.md` (pilha de telas, `UI.painel`, Esc/Tab, foco, guarda de toque, HUD e
`UI.registrarBotaoHud`, Área dos pais, acessibilidade). Cada tela: o contrato do assunto (`loja.md`, `cuidados.md`,
`fotos.md`, `surpresa.md`). Regras gerais de código e arte: `jogo/js/CLAUDE.md`.

## Estrutura
- `base.js` cria `Reino.UI` (pilha de telas, painel, `escolher`/`confirmar`, foco, teclado) e `Reino._ui`.
- `espera-fala.js` (logo depois): `UI.esperarFala`, `UI.ouvirDeNovo`, `UI.esperandoFala` (falas com botão; trava só com `config.esperaFala.travar`).
- As outras partes acrescentam telas a `Reino.UI`, nesta ordem (manifesto): pecas, cuidados, hud, hud-fotos, materia,
  bau, loja, estabulo, petshop, ovos, lugares, ajustes, aparencia, pais.
- O que cada parte publica em `Reino._ui` está no fim de `base.js`. Tela nova = arquivo novo + linha no manifesto.
- Botão no HUD: `UI.registrarBotaoHud` num arquivo da feature; não mexa em `hud.js` (`ui.md` §6).
- Estilos em `jogo/css/` (regras em `jogo/css/CLAUDE.md`).

## Regras
- Toda tela que gasta estrela ou comida usa `gasta: true` e a guarda de toque (`ui.md` §5).
- Teclado sim, leitor de tela não (`ui.md` §8).
- Texto para criança: quebra de palavra e `hifenizar` pelo `ui.md` §10.17 (tom: `docs/receitas/licoes-de-voz.md`).
- "Apagar tudo", "Novo ciclo" e pagamentos (`pais.js`): só no ambiente de teste.

## Antes de entregar
- `npm test` e `npm run e2e` (imagens em celular, tablet e notebook).
