// Todo enfeite das duas lojas precisa de ícone e desenho com o mesmo encaixe.
// Carrega os dados reais dos moldes em vm, sem DOM/canvas.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const Jogo = require('../../jogo-no-node');

const ctx = Jogo.contexto();
ctx.PA = { _interno: {} };
Jogo.carregar(ctx, Jogo.scripts({ nomes: ['nucleo/config', 'conteudo/loja-itens', 'conteudo/loja-novidades'], grupos: ['icones'] }));
['arte/pixelart-unicornio-moldes', 'arte/enfeites-novidades'].forEach(nome => {
  vm.runInContext(fs.readFileSync(Jogo.arquivo(nome), 'utf8'), ctx, { filename: nome });
});
const L = ctx.Reino.LojaItens;
const ESPECIAIS = ['capa', 'rastro', 'asas'];   // desenhados pelo próprio código (usando.capa, .estrelinhas, .asasFada)

test('todo enfeite da Loja tem ícone em pixel', () => {
  L.ENFEITES.forEach((e) => {
    const chave = e.icone.replace(/️/g, '');
    assert.ok(ctx.ICONES[chave], `${e.id}: falta o ícone "${chave}" em js/arte/icones/ (enfeite novo: "enfeite:${e.id}" em loja-petshop.js)`);
  });
});

test('todo enfeite de encaixe tem desenho no unicórnio com o mesmo encaixe', () => {
  const moldes = ctx.PA.ENFEITES_MONTARIA;
  L.ENFEITES.filter((e) => !ESPECIAIS.includes(e.slot)).forEach((e) => {
    assert.ok(moldes[e.id], `${e.id}: falta o desenho em var ENFEITES (js/arte/pixelart-unicornio-moldes.js)`);
    assert.strictEqual(moldes[e.id].ancora, e.slot, `${e.id}: ancora '${moldes[e.id].ancora}' no desenho, slot '${e.slot}' na Loja`);
  });
});
