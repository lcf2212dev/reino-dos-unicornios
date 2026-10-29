// Escala de festa (arte.md §16; UI.festa em ui/pecas.js): o nível de cada tela de fim (título, confete, pulinho) com
// as animações ligadas, e só o título (e o som) com elas desligadas. Molde do fim-sala.navegador.test.js: o desafio é
// trocado por um de mentira que já sai certo. Servidor e banco de TESTE novos por cenário; saves 100% sintéticos.
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('./ajudantes/terceiro-bimestre');

const FALSO = `
  var D = Reino.Desafios;
  D.sortear = function () { return [{ id: 'falso-1', tipo: 'falso', pergunta: 'x', explica: 'x', livro: 'x' }]; };
  D.render = function (d, opts) {
    setTimeout(function () { opts.onMudar(); }, 0);
    return { card: document.createElement('div'), pronto: function () { return true; },
      conferir: function () { return { ok: true }; }, marcarCerto: function () {}, marcarErro: function () {} };
  };`;
const LIGAR = `Reino.Progresso.estado().ajustes.animacoes = true; Reino.util.reduzMovimentoSistema = false;
  document.body.classList.remove('sem-animacao');`;
const DESLIGAR = `Reino.Progresso.estado().ajustes.animacoes = false; document.body.classList.add('sem-animacao');`;
// o que a tela de fim mostra: nível pedido ao UI.festa, classe do título, confete e animação do emoji
const OLHAR = `(function () {
  var h = document.querySelector('.fim-sala h2'), e = document.querySelector('.fim-sala .fim-emoji');
  return { niveis: window.__niveis, titulo: h ? h.className : '', confete: !!document.querySelector('canvas.confete'),
    pulo: e ? e.getAnimations().length : -1, pula: !!(e && e.classList.contains('festa-pulo')), px: h ? getComputedStyle(h).fontSize : '',
    festas: (document.querySelector('.fim-sala').textContent.match(/🎉/g) || []).length };
})()`;

async function fimDeSala(op, iniciar, animar) {
  const c = await abrirCenario(Object.assign({ tamanho: 'notebook', pasta: '/tmp/reino-testes/ver/teste-festa' }, op));
  try {
    await c.js(FALSO + (animar ? LIGAR : DESLIGAR) +
      `window.__niveis = []; var f = Reino.UI.festa; Reino.UI.festa = function (n, o) { window.__niveis.push(n); return f(n, o); };` + iniciar);
    await c.tocar('Começar'); await c.avancar(800);
    for (let k = 0; k < 40 && await c.js("!!document.querySelector('.resumo-sala')"); k++) { await c.tocar('.resumo-botoes .btn-principal'); await c.avancar(400); }
    for (const t of ['Conferir', 'Terminar a sala']) { await c.tocar(t); await c.avancar(t === 'Conferir' ? 800 : 50); }
    const r = await c.js(OLHAR);
    assert.deepStrictEqual(c.erros, []);
    return r;
  } finally { await c.fechar(); }
}
const H1 = "Reino.Missao.iniciar(Reino.materia('historia'), Reino.materia('historia').salas[0]);";
const ULTIMA = "var m = Reino.materia('historia'); m.salas.push(Object.assign({}, m.salas[4], { id: 'h6-teste', nome: 'Sala de Teste' })); Reino.Missao.iniciar(m, m.salas[5]);";

test('fim de sala, animações ligadas: nível 2 (título 24 px, pulinho do emoji, confete), uma 🎉 só (a do emoji, que vira ícone: nenhuma no texto)', async () => {
  const r = await fimDeSala({ save: 'inicio' }, H1, true);
  assert.deepStrictEqual(r.niveis, [2]);
  assert.ok(/titulo-festa-2/.test(r.titulo) && r.px === '24px', JSON.stringify(r));
  assert.ok(r.pula && r.confete, JSON.stringify(r));   // o congelado dos testes pode parar a animação CSS: vale a classe
  assert.strictEqual(r.festas, 0, JSON.stringify(r));
});

test('fim de sala, animações desligadas: só o título, sem confete nem pulinho', async () => {
  const r = await fimDeSala({ save: 'inicio' }, H1, false);
  assert.ok(/titulo-festa-2/.test(r.titulo) && r.px === '24px', JSON.stringify(r));
  assert.ok(!r.pula && r.pulo === 0 && !r.confete, JSON.stringify(r));
});

test('matéria completa, animações ligadas: nível 4 (título 48 px, confete, emoji pulando)', async () => {
  const r = await fimDeSala({ save: 'inicio', materiasCompletas: ['historia'] }, ULTIMA, true);
  assert.deepStrictEqual(r.niveis, [4]);
  assert.ok(/titulo-festa-4/.test(r.titulo) && r.px === '48px', JSON.stringify(r));
  assert.ok(r.pula && r.confete, JSON.stringify(r));   // o congelado dos testes pode parar a animação CSS: vale a classe
});

test('matéria completa, animações desligadas: só o título de 48 px', async () => {
  const r = await fimDeSala({ save: 'inicio', materiasCompletas: ['historia'] }, ULTIMA, false);
  assert.ok(/titulo-festa-4/.test(r.titulo) && r.px === '48px' && !r.confete && !r.pula && r.pulo === 0, JSON.stringify(r));
});

test('a tabela: confete 0/40/90/160, título por nível; compra (nível 1) só o brilho no item', async () => {
  const c = await abrirCenario({ tamanho: 'celular', save: 'completo', pasta: '/tmp/reino-testes/ver/teste-festa' });
  try {
    const r = await c.js(LIGAR + `(function () {
      var t = Reino.UI.festa.tabela, out = { confete: [1, 2, 3, 4].map(function (n) { return t[n].confete; }) };
      var item = document.createElement('div'); document.body.appendChild(item);
      Reino.UI.festa(1, { item: item, som: false });
      out.brilho = item.classList.contains('festa-brilho'); out.canvas1 = !!document.querySelector('canvas.confete');
      var h = document.createElement('h2'); h.className = 'titulo-pixel'; document.body.appendChild(h);
      Reino.UI.festa(4, { titulo: h, som: false });
      out.celular4 = getComputedStyle(h).fontSize; out.canvas4 = !!document.querySelector('canvas.confete');
      return out; })()`);
    assert.deepStrictEqual(r.confete, [0, 40, 90, 160]);
    assert.ok(r.brilho && !r.canvas1 && r.canvas4, JSON.stringify(r));
    assert.strictEqual(r.celular4, '32px', 'nível 4 no celular: --texto-t');
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});
