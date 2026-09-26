/* Reino.ambiente (jogo/js/nucleo/ambiente.js) com window/location/navigator falsos:
   artifact, file:, http, https, com e sem canShare. */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const codigo = fs.readFileSync(path.join(__dirname, '../../../js/nucleo/ambiente.js'), 'utf8');

function montar({ protocolo = 'https:', seguro = true, claude, share = true, canShare = true, download = true, toque = false } = {}) {
  const navigator = {};
  if (share) navigator.share = () => Promise.resolve();
  if (canShare) navigator.canShare = (d) => !!(d && d.files && d.files.length);
  const ctx = {
    location: { protocol: protocolo }, navigator,
    HTMLAnchorElement: function () {},
  };
  if (download) ctx.HTMLAnchorElement.prototype.download = '';
  ctx.window = ctx;
  ctx.isSecureContext = seguro;
  ctx.matchMedia = () => ({ matches: toque });
  if (claude) ctx.claude = claude;
  vm.createContext(ctx);
  vm.runInContext(codigo, ctx);
  Object.defineProperty(ctx.Reino.ambiente, '_ctx', { value: ctx });
  return ctx.Reino.ambiente;
}
const arq = [{ name: 'foto.png' }];

test('https seguro, com canShare: compartilha e baixa', () => {
  const A = montar();
  assert.equal(A.https(), true); assert.equal(A.http(), false); assert.equal(A.artifact(), false);
  assert.equal(A.podeCompartilhar(arq), true); assert.equal(A.podeBaixar(), true);
  assert.equal(A.podeCompartilhar([]), false);
});
test('https sem canShare: não compartilha, baixa', () => {
  const A = montar({ canShare: false });
  assert.equal(A.podeCompartilhar(arq), false); assert.equal(A.podeBaixar(), true);
});
test('http (servidor de casa): sem contexto seguro não compartilha', () => {
  const A = montar({ protocolo: 'http:', seguro: false });
  assert.equal(A.http(), true); assert.equal(A.https(), false);
  assert.equal(A.podeCompartilhar(arq), false); assert.equal(A.podeBaixar(), true);
  assert.equal(A.servidorCasa(), null);
  A.marcarServidorCasa(true); assert.equal(A.servidorCasa(), true);
});
test('file:', () => {
  const A = montar({ protocolo: 'file:', seguro: false });
  assert.equal(A.arquivoLocal(), true); assert.equal(A.http(), false);
});
test('artifact: nem compartilha nem baixa; claude que chega depois conta', () => {
  const B = montar();
  assert.equal(B.artifact(), false);
  B._ctx.claude = { use() {} };   // o window.claude chega depois do carregamento
  assert.equal(B.artifact(), true);
  assert.equal(B.podeCompartilhar(arq), false); assert.equal(B.podeBaixar(), false);
});
test('toque e navegador sem download', () => {
  const A = montar({ toque: true, download: false });
  assert.equal(A.toque(), true); assert.equal(A.podeBaixar(), false);
});
