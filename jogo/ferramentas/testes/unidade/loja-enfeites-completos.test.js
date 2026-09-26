// Testes de unidade: todo enfeite da Loja (js/conteudo/loja-itens.js) está completo — tem o ícone em pixel
// (window.ICONES, em js/arte/icones/<lote>.js) e, se vai no unicórnio, o desenho em PA.ENFEITES_MONTARIA
// (bloco `var ENFEITES = {` de js/arte/pixelart-unicornio-moldes.js) com o mesmo encaixe (ancora = slot).
// Receita: docs/receitas/enfeite-novo.md. Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/loja-enfeites-completos.test.js
// Só lê arquivos do jogo (vm sem DOM; os moldes são lidos como texto, porque pixelart precisa de canvas).
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const Jogo = require('../../jogo-no-node');

const ctx = Jogo.carregar(Jogo.contexto(), Jogo.scripts({ nomes: ['nucleo/config', 'conteudo/loja-itens'], grupos: ['icones'] }));
const L = ctx.Reino.LojaItens;
const ESPECIAIS = ['capa', 'rastro', 'asas'];   // desenhados pelo próprio código (usando.capa, .estrelinhas, .asasFada)

// o bloco ENFEITES dos moldes: id → encaixe (ancora)
function encaixesDosMoldes() {
  const texto = fs.readFileSync(Jogo.arquivo('arte/pixelart-unicornio-moldes'), 'utf8');
  const ini = texto.indexOf('var ENFEITES = {');
  const fim = texto.indexOf('PA.ENFEITES_MONTARIA = ENFEITES');
  assert.ok(ini > 0 && fim > ini, 'bloco var ENFEITES não achado em pixelart-unicornio-moldes.js');
  const r = {};
  for (const m of texto.slice(ini, fim).matchAll(/^\s*'?([\w-]+)'?\s*:\s*\{\s*linhas:.*?ancora:\s*'(\w+)'/gm)) r[m[1]] = m[2];
  return r;
}

test('todo enfeite da Loja tem ícone em pixel', () => {
  L.ENFEITES.forEach((e) => {
    const chave = e.icone.replace(/️/g, '');
    assert.ok(ctx.ICONES[chave], `${e.id}: falta o ícone "${chave}" em js/arte/icones/ (enfeite novo: "enfeite:${e.id}" em loja-petshop.js)`);
  });
});

test('todo enfeite de encaixe tem desenho no unicórnio com o mesmo encaixe', () => {
  const moldes = encaixesDosMoldes();
  L.ENFEITES.filter((e) => !ESPECIAIS.includes(e.slot)).forEach((e) => {
    assert.ok(moldes[e.id], `${e.id}: falta o desenho em var ENFEITES (js/arte/pixelart-unicornio-moldes.js)`);
    assert.strictEqual(moldes[e.id], e.slot, `${e.id}: ancora '${moldes[e.id]}' no desenho, slot '${e.slot}' na Loja`);
  });
});
