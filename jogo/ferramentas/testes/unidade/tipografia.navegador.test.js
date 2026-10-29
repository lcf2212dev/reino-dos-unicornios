// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético): tipografia e pixel RENDERIZADOS (ui.md §10.9 e
// §10.10; onda 2b). Nas 25 cenas do inventário da 2b, nos 3 tamanhos, normal e com "Letras grandes" (texto 1.15):
//   - todo texto visível com font-size da escala 8/12/16/24/32/48 px, font-weight 400 e entrelinha 1, 1,25 ou 1,5;
//   - todo <canvas> do DOM (sprite do paraDOM) com um número PAR de px CSS por px de arte (fora o voo e o joystick).
// Enquanto a 2b conserta, só RELATA (sai verde); com ESTRITO do validar-tipografia.js (ou REINO_TIPOGRAFIA_ESTRITA=1)
// qualquer violação reprova. Sempre reprova se uma cena não abriu ou não mediu nada.
// Uma parte por tamanho (este é o celular; tipografia-tablet e tipografia-notebook ao lado), o código em tipografia-comum.js.
// Rodar (da raiz): npm run unidade -- --so tipografia   (tudo: npm test)
const { test } = require('node:test');
test(...require('./tipografia-comum').tamanhoTipografia('celular'));
