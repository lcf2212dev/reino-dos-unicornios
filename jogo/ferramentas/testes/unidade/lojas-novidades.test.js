// Catálogo/arte e fluxo compartilhado das duas lojas; estado inteiramente sintético em vm.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const raiz = path.resolve(__dirname, '../../../js');
function carregar(ctx, arquivo) {
  vm.runInContext(fs.readFileSync(path.join(raiz, arquivo + '.js'), 'utf8'), ctx);
}
function jogo() {
  const estado = { loja: {}, usando: { enfeites: ['id-de-versao-futura'] } };
  let estrelas = 300, salvos = 0, confirma = [];
  const P = { estado: () => estado, estrelas: () => estrelas,
    gastarEstrelas: (n) => { if (estrelas < n) return false; estrelas -= n; return true; }, salvar: () => salvos++ };
  function el(tag, ...filhos) {
    const atributos = filhos[0] && typeof filhos[0] === 'object' && !filhos[0].tag ? filhos.shift() : {};
    return { tag, atributos, filhos, eventos: {}, addEventListener(nome, fn) { this.eventos[nome] = fn; } };
  }
  const ctx = vm.createContext({ console, PA: { ENFEITES_MONTARIA: {}, iconeDesenho: () => ({}), paraDOM: () => 'pixel', escalaNitida: () => 4 }, document: { querySelector: () => null } });
  ctx.window = ctx;
  ctx.Reino = { Progresso: P, EVENTOS: { MAPA_MUDOU: 'mapa' }, util: { el, emit() {} },
    UI: { confirmar: (...args) => { assert.equal(args[3], true); return new Promise(r => confirma.push(r)); }, festa() {} },
    _ui: { est: () => estado, compra: {}, hifenizar: s => s, logoDepoisDaCompra: () => false },
    Som: { tocar() {} }, Claude: { falar() {} }, Falas: { fixas: { lojaFaltam: 'Faltam estrelas' } } };
  carregar(ctx, 'conteudo/loja-itens');
  const antes = ctx.Reino.LojaItens.ENFEITES.length;
  carregar(ctx, 'conteudo/loja-novidades');
  carregar(ctx, 'arte/icones/icones');
  carregar(ctx, 'arte/enfeites-novidades');
  carregar(ctx, 'ui/loja');
  return { ctx, estado, P, antes, confirma, salvos: () => salvos };
}
test('12 novidades nas Fadas e 6 exclusivas na Pet Shop, todas com arte e ícone próprios', () => {
  const { ctx, antes } = jogo(), L = ctx.Reino.LojaItens;
  const novos = L.ENFEITES.slice(antes);
  assert.equal(novos.length, 18);
  assert.equal(novos.filter(i => !i.loja).length, 12);
  assert.equal(L.naLoja('petshop').length, 6);
  assert.equal(new Set(L.ENFEITES.map(i => i.id)).size, L.ENFEITES.length);
  assert.equal(new Set(L.ENFEITES.map(i => i.nome)).size, L.ENFEITES.length);
  assert.equal(new Set(novos.map(i => ctx.PA.ENFEITES_MONTARIA[i.id].linhas.join('\n'))).size, 18);
  novos.forEach(i => {
    assert.equal(L.item(i.id), i);
    assert.ok(i.preco >= 10 && i.preco <= 45);
    const d = ctx.PA.ENFEITES_MONTARIA[i.id];
    assert.equal(d.ancora, i.slot);
    assert.equal(d.paleta.k, '#3a2446');
    assert.equal(ctx.Reino.conferirIcone(ctx.ICONES[i.icone]).length, 0);
    assert.equal(L.naLoja('fadas').includes(i), !i.loja);
  });
});
test('cancelar não gasta; confirmar compra uma vez, equipa, troca slot, tira e preserva id desconhecido', async () => {
  const j = jogo(), { ctx, estado, P, confirma } = j, L = ctx.Reino.LojaItens;
  const pet = L.item('pet-patinha'), fadas = L.item('colar-vagalumes');
  const cartao = item => ctx.Reino._ui.cartaoEnfeite(item, () => {});
  const tocar = b => b.eventos.click({});
  const saldo = P.estrelas();
  tocar(cartao(pet)); assert.equal(P.estrelas(), saldo);
  confirma.shift()(false); await Promise.resolve(); assert.equal(P.estrelas(), saldo);
  const antigo = cartao(pet);
  tocar(antigo); tocar(antigo);
  confirma.shift()(true); await Promise.resolve();
  confirma.shift()(true); await Promise.resolve();
  assert.equal(P.estrelas(), saldo - pet.preco);
  assert.equal(estado.loja[pet.id], true);
  assert.ok(estado.usando.enfeites.includes(pet.id));
  assert.equal(j.salvos(), 1);
  tocar(cartao(fadas)); confirma.shift()(true); await Promise.resolve();
  assert.ok(!estado.usando.enfeites.includes(pet.id));
  assert.ok(estado.usando.enfeites.includes(fadas.id));
  const depois = P.estrelas();
  tocar(cartao(pet)); assert.equal(P.estrelas(), depois);
  assert.ok(estado.usando.enfeites.includes(pet.id));
  assert.ok(!estado.usando.enfeites.includes(fadas.id));
  tocar(cartao(pet)); assert.ok(!estado.usando.enfeites.includes(pet.id));
  assert.ok(estado.usando.enfeites.includes('id-de-versao-futura'));
});
test('saldo insuficiente mantém compra disponível para feedback, sem abrir confirmação nem gastar', () => {
  const { ctx, P, confirma, estado } = jogo();
  P.gastarEstrelas(300);
  const card = ctx.Reino._ui.cartaoEnfeite(ctx.Reino.LojaItens.item('pet-boina'), () => {});
  assert.equal(card.atributos['aria-disabled'], 'true');
  assert.match(card.atributos['aria-label'], /faltam 28 estrelas/);
  card.eventos.click({});
  assert.equal(confirma.length, 0);
  assert.equal(P.estrelas(), 0);
  assert.equal(Object.keys(estado.loja).length, 0);
});
test('arte registra ícones no Node sem PA e com PA parcial dos validadores', () => {
  for (const PA of [undefined, {}]) {
    const ctx = vm.createContext({ PA });
    ctx.window = ctx;
    carregar(ctx, 'arte/icones/icones');
    carregar(ctx, 'arte/enfeites-novidades');
    assert.equal(Object.keys(ctx.ICONES).length, 18);
  }
});
