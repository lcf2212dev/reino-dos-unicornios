// Visual de menino (js/arte/pixelart-menino-moldes.js) e o laço opcional: padrão por sexo (ap.sexo ou o perfil),
// cortes curtos sem o cabelo comprido no corpo, calça/bermuda cobrindo as pernas, sem laço = sem letra B na cabeça,
// corte de menino com laço = lacinho. Moldes num vm, sem canvas (como salao-visual.test.js).
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/menino-visual.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const JS = path.join(__dirname, '../../../js');
function arte(perfil) {
  const ctx = { console };
  ctx.window = ctx;
  if (perfil) ctx.Reino = { Jogadores: { perfil: () => perfil } };
  ctx.PA = { _interno: { CONTORNO: '#3a2446', cache: {} }, cor: { misturar: (a) => a, escurecer: (a) => a } };
  vm.createContext(ctx);
  ['arte/pixelart-mariana-visual.js', 'arte/pixelart-menino-moldes.js'].forEach((f) => vm.runInContext(fs.readFileSync(path.join(JS, f), 'utf8'), ctx));
  return ctx.PA;
}
function moldes() {
  const fonte = fs.readFileSync(path.join(JS, 'arte/pixelart-personagens.js'), 'utf8');
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(fonte.slice(fonte.indexOf('var CAPA = '), fonte.indexOf('PA.APARENCIA_PADRAO')) + '; this.MARI = MARI;', ctx);
  return ctx.MARI;
}
const v = (PA, ap) => JSON.parse(JSON.stringify(PA.visualMariana(ap)));

test('menino: padrão pelo sexo (ap.sexo vence o perfil), escolha salva vence o padrão', () => {
  const PA = arte();
  assert.deepStrictEqual(v(PA, {}), { corte: 'solto', modelo: 'vestido', laco: true });
  assert.deepStrictEqual(v(PA, { sexo: 'menino' }), { corte: 'curto', modelo: 'camiseta', laco: false });
  assert.deepStrictEqual(v(PA, { sexo: 'menino', corte: 'coque', semLaco: false }), { corte: 'coque', modelo: 'camiseta', laco: true });
  const PB = arte({ nome: 'Pedro', sexo: 'menino' });
  assert.deepStrictEqual(v(PB, {}), { corte: 'curto', modelo: 'camiseta', laco: false }, 'perfil de menino');
  assert.deepStrictEqual(v(PB, { sexo: 'menina' }), { corte: 'solto', modelo: 'vestido', laco: true }, 'a prévia manda');
  assert.deepStrictEqual(v(PB, { corte: 'moicano', modelo: 'cavaleiro', semLaco: true }), { corte: 'moicano', modelo: 'cavaleiro', laco: false });
  const ids = PA.CORTES.map((o) => o.id).concat(PA.MODELOS.map((o) => o.id));
  assert.strictEqual(new Set(ids).size, ids.length, 'ids únicos');
  PA.CORTES.concat(PA.MODELOS).forEach((o) => assert.ok(o.sexo === 'menina' || o.sexo === 'menino', o.id));
});

test('menino: cortes curtos, calça e bermuda, laço opcional em todas as vistas e poses', () => {
  const PA = arte(), MARI = moldes(), I = PA._interno;
  Object.keys(MARI).forEach((vista) => {
    const m = MARI[vista];
    const poses = m.emPe.map((c) => ({ l: m.cabeca.concat(c), s: false })).concat([{ l: m.cabeca.concat(m.sentada), s: true }]);
    poses.forEach((p) => {
      ['curto', 'espetado', 'topete', 'cacheadoCurto', 'moicano'].forEach((c) => {
        const sem = I.aplicarVisual(p.l, vista, p.s, c, 'camiseta', false);
        assert.ok(sem.slice(7, 10).every((l) => !/[HL]/.test(l)), `${vista} ${c}: nada de cabelo comprido no corpo`);
        assert.ok(sem.every((l) => l.indexOf('B') < 0), `${vista} ${c}: sem laço`);
        assert.ok(I.aplicarVisual(p.l, vista, p.s, c, 'camiseta', true).slice(0, 7).join('').indexOf('B') >= 0, `${vista} ${c}: com lacinho`);
      });
      // calça comprida: nenhuma perna de fora em pé; bermuda: joelho de fora
      const calca = I.aplicarVisual(p.l, vista, p.s, 'curto', 'camisaCalca', false);
      if (!p.s) assert.ok(calca.slice(12, 14).every((l) => l.indexOf('K') < 0), `${vista}: calça cobre as pernas`);
      const berm = I.aplicarVisual(p.l, vista, p.s, 'curto', 'camiseta', false);
      if (!p.s) assert.ok(berm[12].indexOf('K') < 0 && berm[13].indexOf('K') >= 0, `${vista}: bermuda até o joelho`);
    });
    // sem laço num corte de menina: a cabeça perde o B e não ganha pixel fora do cabelo
    const pe = m.cabeca.concat(m.emPe[0]);
    const semLaco = I.aplicarVisual(pe, vista, false, 'solto', 'vestido', false);
    assert.ok(semLaco.every((l) => l.indexOf('B') < 0), vista + ': solto sem laço');
    semLaco.slice(0, 7).forEach((l, y) => l.split('').forEach((ch, x) => { if (ch !== '.') assert.notStrictEqual(pe[y][x], '.', `${vista} ${x},${y}`); }));
  });
});
