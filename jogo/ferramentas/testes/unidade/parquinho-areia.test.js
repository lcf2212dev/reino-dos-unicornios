// Testes de unidade: a caixa de areia do Parquinho (js/interiores/parquinho/areia-caixa.js, Reino.ParquinhoAreia;
// docs/contratos/parquinho.md). Cavar, amontoar e alisar mudam a grade nos limites; a torre cresce até andaresMax;
// enfeites até enfeitesMax; cobrir ela e o unicórnio até o pescoço (cobrirPassadas) e descobrir; a queda do balanço
// (P.areiaTombo); o desenho parado da caixa do parque só muda com a tela fechada; a pose abre a tela no fim.
// O jogo inteiro (todos os `node: true`) num vm com save sintético (ajudantes/jogo-save.js); nada toca no save real.
// Rodar: node --test jogo/ferramentas/testes/unidade/parquinho-areia.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { Jogo, montar, saveHoje } = require('./ajudantes/jogo-save');

// o vm tem os próprios Array e Object: compara pelo JSON
const igual = (a, b, m) => assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), m);

function jogo() {
  const orig = Jogo.scripts;
  Jogo.scripts = () => orig({});
  let j;
  try { j = montar({ save: saveHoje() }); } finally { Jogo.scripts = orig; }
  j.R.ParquinhoAreia.zerar();
  return j;
}
// o meio de uma célula (px de arte da caixa de perto)
function meio(A, c, l) { return { x: A.AREIA.x + c * A.CEL + 1, y: A.AREIA.y + l * A.CEL + 1 }; }

test('areia: cavar abre buraco com bordinha, até MIN; amontoar sobe até MAX e escorre; alisar volta ao plano', () => {
  const A = jogo().R.ParquinhoAreia, p = meio(A, 18, 6);
  let r = A.usar('cavar', p.x, p.y);
  assert.ok(r.mudou && r.som, 'cavou com som');
  assert.strictEqual(A.altura(18, 6), -1);
  assert.strictEqual(A.depurar().montes, 1, 'a areia tirada vira uma bordinha');
  for (let i = 0; i < 10; i++) A.usar('cavar', p.x, p.y);
  assert.strictEqual(A.altura(18, 6), A.MIN, 'não passa do fundo');
  assert.strictEqual(A.usar('cavar', p.x, p.y).mudou, false);

  const q = meio(A, 6, 12);
  for (let i = 0; i < 10; i++) A.usar('amontoar', q.x, q.y);
  assert.strictEqual(A.altura(6, 12), A.MAX, 'não passa do alto');
  assert.ok(A.altura(7, 12) >= A.MAX - 1 && A.altura(6, 11) >= A.MAX - 1, 'o montinho escorre para os lados');
  for (let i = 0; i < 12; i++) A.usar('alisar', q.x, q.y);
  assert.strictEqual(A.altura(6, 12), 0, 'o rastelo alisa');
});

test('areia: arrastar age pelo caminho do dedo (uma passada por célula) e a valeta ganha beirada', () => {
  const A = jogo().R.ParquinhoAreia, a = meio(A, 10, 4), b = meio(A, 20, 4);
  A.comecar('cavar', a.x, a.y);
  const r = A.mover(b.x, b.y);
  A.soltar();
  assert.ok(r.mudou);
  for (let c = 10; c <= 20; c++) {
    assert.ok(A.altura(c, 4) < 0, 'cavou a célula ' + c);
    // (perto do começo, a bordinha do 1º toque pode cair no caminho)
    if (c >= 13) assert.ok(A.altura(c, 3) < 0 && A.altura(c, 5) < 0, 'a valeta tem 3 células de largura (' + c + ')');
  }
  assert.ok(A.altura(15, 2) > 0 || A.altura(15, 6) > 0 || A.altura(14, 2) > 0 || A.altura(14, 6) > 0, 'a beirada vai para os lados');
  // balde e enfeite não arrastam
  A.comecar('castelo', meio(A, 30, 4).x, meio(A, 30, 4).y);
  assert.strictEqual(A.mover(meio(A, 33, 10).x, meio(A, 33, 10).y).mudou, false);
  A.soltar();
});

test('areia: o balde faz a torre e ela cresce um andar por toque até andaresMax; o rastelo derruba', () => {
  const j = jogo(), A = j.R.ParquinhoAreia, max = j.R.config.parquinho.areia.andaresMax, p = meio(A, 18, 8);
  assert.strictEqual(A.temCastelo(), false);
  assert.strictEqual(A.usar('castelo', p.x, p.y).mudou, true);
  assert.strictEqual(A.temCastelo(), true);
  for (let i = 0; i < max + 2; i++) A.usar('castelo', p.x, p.y - 2);
  igual(A.depurar().torres, [max]);
  const r = A.usar('castelo', p.x, p.y);
  assert.strictEqual(r.mudou, false, 'no máximo, não cresce');
  assert.ok(r.som, 'mas responde com som');
  // torre colada em outra não nasce; longe nasce
  assert.strictEqual(A.usar('castelo', p.x + 8, p.y).mudou, false);
  assert.strictEqual(A.usar('castelo', p.x + 20, p.y).mudou, true);
  for (let i = 0; i < max; i++) A.usar('alisar', p.x, p.y);
  igual(A.depurar().torres, [1], 'a primeira desmanchou');
  // até torresMax torres
  const k = jogo(), B = k.R.ParquinhoAreia, tmax = k.R.config.parquinho.areia.torresMax;
  for (let l = 1; l < 20; l += 3) for (let c = 2; c < 34; c += 7) B.usar('castelo', meio(B, c, l).x, meio(B, c, l).y);
  assert.strictEqual(B.depurar().torres.length, tmax);
});

test('areia: enfeites na areia e no topo da torre, até enfeitesMax (o mais antigo sai)', () => {
  const j = jogo(), A = j.R.ParquinhoAreia, max = j.R.config.parquinho.areia.enfeitesMax;
  const t = meio(A, 18, 8);
  A.usar('castelo', t.x, t.y);
  assert.strictEqual(A.usar('enfeite', t.x, t.y - 3, 'bandeira').mudou, true);
  igual(A.depurar().enfeites, ['bandeira@torre']);
  assert.strictEqual(A.usar('enfeite', t.x, t.y, 'pirulito').mudou, false, 'tipo que não existe');
  for (let i = 0; i < max + 5; i++) A.usar('enfeite', meio(A, 2 + (i % 30), 2).x, meio(A, 2, 2).y, 'concha');
  const d = A.depurar().enfeites;
  assert.strictEqual(d.length, max);
  assert.ok(!d.includes('bandeira@torre'), 'a bandeirinha (a mais antiga) saiu');
  // cavar perto tira o enfeite da areia
  const antes = A.depurar().enfeites.length, e = meio(A, 2, 2);
  A.usar('cavar', e.x, e.y);
  assert.ok(A.depurar().enfeites.length < antes);
});

test('areia: cobrir ela e o unicórnio até o pescoço (risadinha) e descobrir', () => {
  const j = jogo(), A = j.R.ParquinhoAreia, max = j.R.config.parquinho.areia.cobrirPassadas;
  const ela = A.corpo('ela'), uni = A.corpo('uni');
  assert.strictEqual(A.quem(ela.cx, ela.pe - 4), 'ela');
  assert.strictEqual(A.quem(uni.cx, uni.pe - 4), 'uni');
  let r;
  for (let i = 0; i < max; i++) r = A.usar('amontoar', ela.cx, ela.pe - 4);
  assert.strictEqual(r.risada, 'ela', 'coberta até o pescoço: risadinha');
  assert.strictEqual(A.estado().cobre.ela, max);
  assert.strictEqual(A.usar('amontoar', ela.cx, ela.pe - 4).mudou, false, 'não passa do pescoço');
  assert.strictEqual(A.altura(Math.floor((ela.cx - A.AREIA.x) / A.CEL), Math.floor((ela.pe - 1 - A.AREIA.y) / A.CEL)), 0, 'a areia embaixo dela não muda');
  A.usar('cavar', ela.cx, ela.pe - 4);
  assert.strictEqual(A.estado().cobre.ela, max - 2, 'a pazinha tira a areia de cima');
  // arrastar a mão por cima do unicórnio cobre aos poucos (uma passada a cada 4 px)
  A.comecar('amontoar', uni.x, uni.pe - 3);
  A.mover(uni.x + uni.w - 1, uni.pe - 3);
  A.soltar();
  const n = A.estado().cobre.uni;
  assert.ok(n >= 3 && n < max, 'algumas passadas: ' + n);
  // o balde e o enfeite não agem em cima deles
  assert.strictEqual(A.usar('castelo', ela.cx, ela.pe - 4).mudou, false);
  assert.strictEqual(A.usar('enfeite', uni.cx, uni.pe - 4, 'flor').mudou, false);
});

test('areia: a queda do balanço (P.areiaTombo) marca os dois na areia e desmancha a torre de lá', () => {
  const j = jogo(), A = j.R.ParquinhoAreia, P = j.R._predios.parquinho;
  assert.strictEqual(typeof P.areiaTombo, 'function', 'o contrato com o balanço');
  const t = meio(A, 11, 5);
  A.usar('castelo', t.x, t.y);
  assert.strictEqual(A.temCastelo(), true);
  P.areiaTombo();
  const d = A.depurar();
  assert.ok(d.buracos > 20, 'as duas marcas: ' + d.buracos);
  assert.ok(d.montes > 0, 'a areia espirrada em volta');
  assert.strictEqual(d.tombos, 1);
  assert.strictEqual(A.temCastelo(), false, 'a torre onde eles caíram desmanchou');
  assert.ok(A.altura(11, 5) < 0);
});

test('areia: o desenho parado da caixa do parque só muda com a tela fechada', () => {
  const j = jogo(), R = j.R, A = R.ParquinhoAreia;
  let aberta = true;
  R.UI = Object.assign(R.UI || {}, { temTela: () => aberta });
  const k0 = A.chaveMundo();
  A.usar('castelo', meio(A, 18, 8).x, meio(A, 18, 8).y);
  assert.strictEqual(A.chaveMundo(), k0, 'com a tela aberta, o parque atrás não se refaz');
  aberta = false;
  assert.notStrictEqual(A.chaveMundo(), k0, 'fechou: a caixa do parque mostra a torre');
  const lib = R.Interiores.OBJETOS['parquinho-areia'];
  assert.ok(lib.chave().indexOf(A.chaveMundo()) >= 0, 'a chave do objeto segue o estado da areia');
});

test('areia: a pose senta e, no fim, abre a tela de perto (só se ela ainda está no parque)', () => {
  const j = jogo(), R = j.R;
  const pose = R.ParquinhoBrincar.poses().indexOf('areia') >= 0;
  assert.ok(pose, 'a caixa ainda tem a pose areia (parquinhoBrincar)');
  assert.ok(R.config.parquinho.ms.areia <= 1000, 'sentar é curtinho');
  let abriu = 0;
  R.UI = Object.assign(R.UI || {}, { telaParquinhoAreia: () => { abriu++; } });
  // a pose registrada no ParquinhoBrincar: o fim abre a tela se a cena ainda é o parque
  const def = j.ctx.Reino._predios.parquinho;
  assert.ok(def.H, 'os ajudantes das poses');
  const cena = { id: 'parquinho' };
  R.Cena = Object.assign(R.Cena || {}, { atual: () => cena });
  const poseDef = poseDe(j, 'areia');
  poseDef.fim({ interior: 'parquinho' }, { pulou: false });
  assert.strictEqual(abriu, 1);
  cena.id = 'mapa';
  poseDef.fim({ interior: 'parquinho' }, { pulou: true });
  assert.strictEqual(abriu, 1, 'saiu de cena: não abre');
});
// a definição da pose (o registro guarda por id; pega pelo registrarPose de novo, sem mexer no brincar.js)
function poseDe(j, id) {
  const R = j.R, B = R.ParquinhoBrincar, guardadas = {};
  const orig = B.registrarPose;
  B.registrarPose = (i, d) => { guardadas[i] = d; orig(i, d); };
  try {
    const src = require('fs').readFileSync(require('path').join(__dirname, '../../../js/interiores/parquinho/poses-' + id + '.js'), 'utf8');
    require('vm').runInContext(src, j.ctx);
  } finally { B.registrarPose = orig; }
  return guardadas[id];
}
