# jogo/js/motor — regras locais

Contratos: `docs/contratos/cena-e-motor.md` (cena, íris, câmera, pintor, laço) e
`docs/contratos/interiores.md` (motor dos interiores).

## Arquivos
- `camera.js` cria `Reino._motor` (canvas, escala, câmera, pintor); `laco.js`, `entrada.js` e `main.js` usam.
- `cena.js` cria `Reino.Cena`; `Reino._cena` é interno de `cena.js` e `transicao.js`.
- `transicao.js`: a íris. `laco.js`: o quadro e o laço. `entrada.js`: teclado, toque, mouse segurado, thumbstick
  (números em `config.controles`, lidos na hora de usar; thumbstick em pixel art de `PA.controle`, tamanhos nas variáveis CSS `--cb`/`--cp`/`--px`).
  `main.js`: início do jogo e telas de entrada.
- `interiores-*.js`: o motor dos interiores, `node: true`, nesta ordem: base, pisos, objetos-parede,
  objetos-moveis, objetos-enfeites, grade, estatico, placas, toque, cena. Dividem `Reino._interiores`.

## Regras
- `interiores-*.js` são `node: true` (regra em `jogo/js/CLAUDE.md`).
- Os outros arquivos do motor carregam no fim do manifesto (depois da UI e dos prédios). Não mude a ordem.
- Ordem de cada quadro: fundo → itens por Y → `desenharSobre` → luz → íris (`cena-e-motor.md` §5).
- Desempenho: média até 16,7 ms por quadro com CPU 4× mais lenta. Nada de canvas criado por quadro;
  o estático é pré-renderizado.
- Animação só com `animar` (Ajustes → Animações e movimento reduzido; regra em `jogo/js/CLAUDE.md`, Arte).
- Helpers de desenho ficam em `js/arte/desenho.js` (uma implementação só).

## Antes de entregar
- Skill `validar-tudo`, mais `npm run e2e -- --desempenho`.
