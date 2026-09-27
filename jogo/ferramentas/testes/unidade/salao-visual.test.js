// Testes de unidade: corte de cabelo e modelo de roupa do Salão de Beleza (aparencia.corte / aparencia.modelo).
// 1) o desenho: PA._interno.aplicarVisual (js/arte/pixelart-mariana-visual.js) em todos os cortes, roupas e vistas,
//    a pé (3 passos) e sentada: mesmo tamanho dos moldes e só letras da paleta; ids desconhecidos caem no de hoje.
// 2) o save: save antigo (sem os campos) abre e grava igual, a escolha fica depois de gravar e recarregar, e a
//    mescla leva o corte junto com as cores (aparencia vem inteira do lado mais recente, save-e-mescla.md §4).
// Saves 100% sintéticos, num vm (ajudantes/jogo-save.js); nada toca no save real.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/salao-visual.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { montar, saveHoje, copia } = require('./ajudantes/jogo-save');

const JS = path.join(__dirname, '../../../js');
// as duas partes da arte da Mariana num vm, com um PA de mentira (os moldes não precisam de canvas)
function arteMariana() {
  const ctx = { console };
  ctx.window = ctx;
  ctx.PA = { _interno: { CONTORNO: '#3a2446', cache: {} }, cor: { misturar: (a) => a, escurecer: (a) => a } };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(JS, 'arte/pixelart-mariana-visual.js'), 'utf8'), ctx);
  return ctx.PA;
}
// os moldes de hoje (MARI), lidos do próprio arquivo sem executar o desenho
function moldes() {
  const fonte = fs.readFileSync(path.join(JS, 'arte/pixelart-personagens.js'), 'utf8');
  const ini = fonte.indexOf('var CAPA = '), fim = fonte.indexOf('PA.APARENCIA_PADRAO');
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(fonte.slice(ini, fim) + '; this.MARI = MARI;', ctx);
  return ctx.MARI;
}
const LETRAS = new Set('.HLKERCDASBWMGT'.split(''));

test('salão: todo corte e roupa, em toda vista, a pé e sentada, mantém o tamanho e só usa letras da paleta', () => {
  const PA = arteMariana(), MARI = moldes();
  assert.strictEqual(PA.CORTES.length, 8, '8 cortes');
  assert.strictEqual(PA.MODELOS.length, 8, '8 roupas');
  assert.strictEqual(PA.CORTES[0].id, 'solto'); assert.strictEqual(PA.MODELOS[0].id, 'vestido');
  Object.keys(MARI).forEach((vista) => {
    const m = MARI[vista];
    const poses = m.emPe.map((c, i) => ({ nome: 'pé ' + i, linhas: m.cabeca.concat(c), sentada: false }))
      .concat([{ nome: 'sentada', linhas: m.cabeca.concat(m.sentada), sentada: true }]);
    poses.forEach((pose) => PA.CORTES.forEach((c) => PA.MODELOS.forEach((r) => {
      const onde = `${vista} ${pose.nome} ${c.id}/${r.id}`;
      const saida = PA._interno.aplicarVisual(pose.linhas, vista, pose.sentada, c.id, r.id);
      assert.strictEqual(saida.length, pose.linhas.length, onde + ': altura');
      saida.forEach((l) => {
        assert.strictEqual(l.length, pose.linhas[0].length, onde + ': largura');
        l.split('').forEach((ch) => assert.ok(LETRAS.has(ch), `${onde}: letra "${ch}" fora da paleta`));
      });
      // o visual de hoje passando pela função sai igual aos moldes (o PA.mariana nem chama, mas confere)
      if (c.id === 'solto' && r.id === 'vestido') assert.deepStrictEqual(copia(saida), copia(pose.linhas), onde);
    })));
  });
  // cada corte e cada roupa se distingue do padrão de frente e em pé
  const frente = MARI.frente.cabeca.concat(MARI.frente.emPe[0]);
  PA.CORTES.slice(1).forEach((c) => assert.notDeepStrictEqual(copia(PA._interno.aplicarVisual(frente, 'frente', false, c.id, 'vestido')), copia(frente), c.id));
  PA.MODELOS.slice(1).forEach((r) => assert.notDeepStrictEqual(copia(PA._interno.aplicarVisual(frente, 'frente', false, 'solto', r.id)), copia(frente), r.id));
});

test('salão: sem campo, id desconhecido ou estragado = o visual de hoje', () => {
  const PA = arteMariana();
  const v = (ap) => copia(PA.visualMariana(ap));
  assert.deepStrictEqual(v(undefined), { corte: 'solto', modelo: 'vestido' });
  assert.deepStrictEqual(v({ pele: '#f1c7a5' }), { corte: 'solto', modelo: 'vestido' });
  assert.deepStrictEqual(v({ corte: 'moicano-do-futuro', modelo: 42 }), { corte: 'solto', modelo: 'vestido' });
  assert.deepStrictEqual(v({ corte: '__proto__', modelo: 'toString' }), { corte: 'solto', modelo: 'vestido' });
  assert.deepStrictEqual(v({ corte: 'coque', modelo: 'bailarina' }), { corte: 'coque', modelo: 'bailarina' });
});

test('salão: save antigo abre e grava igual; a escolha fica depois de gravar e recarregar', () => {
  const antigo = saveHoje();
  const j = montar({ save: antigo });
  const e = j.P.carregar();
  assert.deepStrictEqual(copia(e.aparencia), antigo.aparencia, 'nenhum campo novo na aparência');
  j.P.salvar();
  assert.deepStrictEqual(j.lido().aparencia, antigo.aparencia, 'gravado sem corte nem modelo');
  // a Mariana escolhe no Salão (ui/salao.js muda a aparência e grava)
  j.P.estado().aparencia.corte = 'chiquinhas';
  j.P.estado().aparencia.modelo = 'jardineira';
  j.P.salvar();
  const k = montar({ save: j.lido() });
  const e2 = k.P.carregar();
  assert.strictEqual(e2.aparencia.corte, 'chiquinhas');
  assert.strictEqual(e2.aparencia.modelo, 'jardineira');
  assert.strictEqual(e2.aparencia.roupa, antigo.aparencia.roupa, 'as cores continuam');
});

test('salão: a mescla leva corte e roupa com as cores do lado mais recente e conserva id desconhecido', () => {
  const j = montar({ save: saveHoje() });
  j.P.carregar();
  const a = copia(j.P.estado()), b = copia(j.P.estado());
  a.aparencia.corte = 'coque'; a.aparencia.modelo = 'festa'; a.atualizado = 2000;
  b.aparencia.roupa = '#6fdc8c'; b.atualizado = 1000;
  const r = j.P.mesclar(a, b);
  assert.strictEqual(r.aparencia.corte, 'coque'); assert.strictEqual(r.aparencia.modelo, 'festa');
  assert.strictEqual(copia(j.P.mesclar(b, a)).aparencia.corte, 'coque', 'comutativa');
  // aba de uma versão mais nova mandou um corte que esta não conhece: fica guardado (o desenho usa o de hoje)
  a.aparencia.corte = 'corte-do-futuro';
  const r2 = j.P.mesclar(a, b);
  assert.strictEqual(r2.aparencia.corte, 'corte-do-futuro');
  const k = montar({ save: r2 });
  assert.strictEqual(k.P.carregar().aparencia.corte, 'corte-do-futuro');
});
