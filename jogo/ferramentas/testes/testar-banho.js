// Testes do banho (js/sistemas/cuidados.js e js/sistemas/progresso.js), sem navegador — CONTRATOS-BANHO-FOTOS-MUSICA.md, seções 1 e 2.
// Uso: node ferramentas/testes/testar-banho.js   (sai com código 1 se algum teste falhar)
// Os testes antigos do save e da fome e sede continuam em ferramentas/testes/testar-save.js.
// Saves 100% sintéticos (valores inventados). O "aparelho da versão de hoje" carrega progresso.js e
// cuidados.js da main (git show 9985fa7:…) num vm separado, com o mesmo localStorage de mentira.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const os = require('os');
const assert = require('assert');
const { execFileSync } = require('child_process');

const Jogo = require('../jogo-no-node');
const raiz = Jogo.raiz;

/* ---------- um jogo inteiro num vm, com relógio próprio ---------- */
// opcoes.antigo: pasta com progresso.js e cuidados.js da versão de hoje (sem banho)
// opcoes.loja: um objeto para o localStorage (dois aparelhos no mesmo navegador dividem a mesma)
function montar(opcoes = {}) {
  const relogio = { agora: opcoes.agora || 1760000000000 };
  const intervalos = [];
  const ouvintes = {};
  const guardado = opcoes.loja || {};
  class DataFalsa extends Date {
    constructor(...a) { super(...(a.length ? a : [relogio.agora])); }
    static now() { return relogio.agora; }
  }
  const documento = {
    hidden: false,
    addEventListener(ev, fn) { (ouvintes['doc:' + ev] = ouvintes['doc:' + ev] || []).push(fn); },
  };
  const ctx = {
    console, Math, JSON, Date: DataFalsa,
    setTimeout: () => 0, clearTimeout: () => {},
    setInterval: (fn, ms) => { intervalos.push({ fn, ms }); return intervalos.length; },
    clearInterval: () => {},
    document: documento,
    location: { protocol: 'file:', search: '' },
    localStorage: {
      getItem: (k) => (k in guardado ? guardado[k] : null),
      setItem: (k, v) => { guardado[k] = String(v); },
    },
    addEventListener(ev, fn) { (ouvintes['win:' + ev] = ouvintes['win:' + ev] || []).push(fn); },
    PA: { APARENCIA_PADRAO: { pele: '#f1c7a3', cabelo: '#5a3825', roupa: '#ff7eb6', laco: '#ffd34d' } },
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  const trocar = opcoes.antigo ? { 'sistemas/progresso': path.join(opcoes.antigo, 'progresso.js'), 'sistemas/cuidados': path.join(opcoes.antigo, 'cuidados.js') } : {};
  Jogo.carregar(ctx, Jogo.scripts({
    // o progresso.js antigo (inteiro, de antes da divisão) entra sozinho no lugar das quatro partes de hoje
    nomes: ['nucleo/config', 'nucleo/registros', 'nucleo/util', 'personagens/unicornios'].concat(opcoes.antigo ? ['sistemas/progresso']
      : ['sistemas/progresso', 'sistemas/progresso-mescla', 'sistemas/progresso-nuvem', 'sistemas/progresso-regras'], ['sistemas/cuidados']),
    grupos: ['materias', 'provas'],
  }), { trocar });
  const R = ctx.Reino;
  if (opcoes.save) guardado[R.config.chaveSave] = JSON.stringify(opcoes.save);
  if (opcoes.copia !== undefined) guardado[R.config.chaveSave + '-novidades'] = JSON.stringify(opcoes.copia);
  const cena = { estado: 'mapa', atual: null };
  const balao = { aberto: false, falas: [] };
  R.Cena = { estado: () => cena.estado, atual: () => cena.atual };
  R.Claude = { aberto: () => balao.aberto, falar: (t, o) => { balao.falas.push({ t, o, em: relogio.agora }); return Promise.resolve(null); }, fechar() {} };
  const salvarOriginal = R.Progresso.salvar;
  const contagem = { salvar: 0 };
  R.Progresso.salvar = function () { contagem.salvar++; return salvarOriginal.apply(this, arguments); };
  const eventos = [];
  R.util.on('cuidados', (d) => eventos.push(d));
  return {
    R, P: R.Progresso, C: R.Cuidados, ctx, relogio, cena, balao, contagem, eventos, guardado,
    chave: R.config.chaveSave, chaveCopia: R.config.chaveSave + '-novidades',
    lido() { return JSON.parse(guardado[R.config.chaveSave]); },
    copiaGuardada() { return JSON.parse(guardado[R.config.chaveSave + '-novidades']); },
    andar(ms, passo = 1000) {
      for (let t = 0; t < ms; t += passo) { relogio.agora += passo; intervalos.forEach((i) => i.fn()); }
    },
    tocar() { (ouvintes['win:pointerdown'] || []).forEach((fn) => fn({})); },
    // outra aba gravou o save: o navegador avisa esta com o evento `storage`
    storage(valor) { guardado[R.config.chaveSave] = valor; (ouvintes['win:storage'] || []).forEach((fn) => fn({ key: R.config.chaveSave, newValue: valor })); },
  };
}

/* ---------- saves sintéticos ---------- */
// save da versão de HOJE (main 9985fa7): cuidados sem banho nem acaoBanho
function saveHoje() {
  return {
    v: 1, geracao: 1, ciclo: 1, criado: 1750000000000, atualizado: 1750600000000, comecou: true,
    aparencia: { pele: '#d9a07a', cabelo: '#a0673a', roupa: '#9b7bff', laco: '#ffd34d' },
    corInicial: 'lilas',
    salas: { h1: { vezes: 1, melhor: 6, feita: 1750100000000, perfeita: true, calma: true } },
    treinos: { historia: { vezes: 1, melhor: 'prata' } },
    provas: {},
    unis: {
      inicial: { em: 1750000000000, xp: 95, chocado: true, nome: 'Teste Azul' },
      'h-cartinha': { em: 1750100000000, xp: 0, chocado: true },
      'h-postal': { em: 1750200000000, xp: 0, chocado: false },
    },
    montaria: 'inicial',
    estrelas: { ganhas: 37, gastas: 8 },
    loja: { flor: true },
    usando: { enfeites: ['flor'], capa: false, asasFada: false, estrelinhas: false },
    pago: { historia: 4 },
    ajustes: { som: true, musica: false, voz: true, animacoes: true, texto: 1, setas: false, surpresa: true, surpresaEm: 1750500000000 },
    ritualVisto: true,
    cuidados: {
      inicial: { fome: 64.5, sede: 41.25, em: 1750550000000, acao: 1750400000000, acaoFome: 1750300000000, acaoSede: 1750400000000 },
      'h-cartinha': { fome: 90, sede: 80, em: 1750450000000, acao: 0, acaoFome: 0, acaoSede: 0 },
    },
    despensa: { maca: { compradas: 3, usadas: 1 } },
  };
}
const copia = (o) => JSON.parse(JSON.stringify(o));
function carregado(ajuste, opcoes = {}) {
  const s = saveHoje();
  if (ajuste) ajuste(s);
  const j = montar(Object.assign({ save: s }, opcoes));
  j.P.carregar();
  return j;
}
const reg = (e, id = 'inicial') => e.cuidados[id];

/* ---------- os testes ---------- */
const testes = [];
function teste(nome, fn) { testes.push({ nome, fn }); }

teste('save da versão de hoje carrega igual, banho 100 na leitura e sem criar o campo', () => {
  const orig = saveHoje();
  const j = montar({ save: orig });
  const e = j.P.carregar();
  assert.deepStrictEqual(copia(e), orig, 'algum campo de hoje mudou ao carregar');
  assert.deepStrictEqual(copia(j.C.niveis('inicial')), { fome: 64.5, sede: 41.25, banho: 100 });
  assert.deepStrictEqual(copia(j.C.niveis('h-postal')), { fome: 100, sede: 100, banho: 100 }, 'sem registro');
  assert.ok(!('banho' in reg(e)) && !('acaoBanho' in reg(e)), 'criou o campo à toa');
  assert.strictEqual(j.C.sujo(), false);
  assert.strictEqual(j.C.icone(), null);
  // gravar também não cria o campo (nem no save, nem na cópia -novidades)
  j.P.salvar();
  assert.ok(!('banho' in j.lido().cuidados.inicial));
  assert.ok(!('banho' in j.copiaGuardada().cuidados.inicial));
  // e comer/beber não mexe no banho
  j.relogio.agora = 1760000000000;
  assert.ok(j.C.beber('inicial').ok);
  assert.ok(!('banho' in reg(j.P.estado())));
});

teste('gasto: só a montaria, só com o relógio ativo, 180 minutos de 100 a 0', () => {
  const j = carregado((s) => { s.cuidados = {}; });
  j.andar(60 * 1000);
  assert.strictEqual(j.C.niveis().banho, 100, 'gastou antes de iniciar');
  j.C.iniciar();
  for (let m = 0; m < 90; m++) { j.tocar(); j.andar(60 * 1000); }
  assert.ok(Math.abs(j.C.niveis().banho - 50) < 0.2, 'banho ' + j.C.niveis().banho);
  assert.strictEqual(j.C.niveis('h-cartinha').banho, 100, 'unicórnio que não é a montaria gastou');
  assert.ok(!j.P.estado().cuidados['h-cartinha'], 'criou registro para quem não é a montaria');
  // sem toque por 5 minutos: para
  j.andar(6 * 60 * 1000);
  const parado = j.C.niveis().banho;
  j.andar(5 * 60 * 1000);
  assert.strictEqual(j.C.niveis().banho, parado, 'gastou sem toque');
  // aba escondida: para
  j.tocar(); j.ctx.document.hidden = true; j.andar(60 * 1000);
  assert.strictEqual(j.C.niveis().banho, parado, 'gastou com a aba escondida');
  j.ctx.document.hidden = false;
  // 180 minutos de jogo: zero (avancar, sem as condições)
  const k = carregado((s) => { s.cuidados = {}; });
  k.C.avancar(180 * 60 * 1000);
  assert.strictEqual(k.C.niveis().banho, 0);
  k.C.avancar(60 * 1000);
  assert.strictEqual(k.C.niveis().banho, 0, 'passou de zero');
  const m = carregado((s) => { s.cuidados = {}; });
  m.C.avancar(90 * 60 * 1000);
  assert.ok(Math.abs(m.C.niveis().banho - 50) < 1e-9);
});

teste('cruzar o 25 do banho grava e emite; sujinho não fica lento; ícone 💧 > 🍎 > 🛁', () => {
  const j = carregado((s) => { s.cuidados = { inicial: { fome: 100, sede: 100, banho: 25.01, em: 1, acao: 0, acaoFome: 0, acaoSede: 0 } }; });
  j.C.iniciar();
  const antes = j.contagem.salvar, ev = j.eventos.length;
  j.tocar(); j.andar(2000);   // 2 s de jogo: 25,01 → 24,99 (sede e fome mudam só um pouquinho)
  assert.ok(j.C.niveis().banho < 25);
  assert.ok(j.contagem.salvar > antes, 'não gravou ao cruzar o 25');
  assert.ok(j.eventos.length > ev, 'não emitiu ao cruzar o 25');
  assert.ok(j.lido().cuidados.inicial.banho < 25, 'o que foi gravado não tem o banho baixo');
  assert.strictEqual(j.C.fatorVelocidade(), 1, 'sujinho ficou lento');
  assert.strictEqual(j.C.sujo(), true);
  assert.deepStrictEqual(copia(j.C.baixo()), { fome: false, sede: false, banho: true });
  assert.strictEqual(j.C.icone(), '🛁');
  assert.strictEqual(j.C.iconeMontaria(), '🛁');
  const d = j.C.depurar();
  assert.strictEqual(d.sujo, true); assert.strictEqual(d.icone, '🛁'); assert.strictEqual(d.fator, 1);
  assert.ok(d.banho < 25);
  assert.deepStrictEqual(Object.keys(d.todos.inicial).sort(), ['banho', 'fome', 'sede']);
  // prioridade
  const r = j.P.estado().cuidados.inicial;
  r.fome = 10; assert.strictEqual(j.C.icone(), '🍎'); assert.strictEqual(j.C.fatorVelocidade(), j.R.config.cuidados.fatorLento);
  r.sede = 10; assert.strictEqual(j.C.icone(), '💧');
  r.fome = 100; assert.strictEqual(j.C.icone(), '💧');
  r.sede = 100; r.banho = 30; assert.strictEqual(j.C.icone(), null); assert.strictEqual(j.C.sujo(), false);
});

teste('lembrete do banho: só com fome e sede bem, no mesmo limite, fora da Pet Shop', () => {
  const lem = (j) => j.balao.falas.map((f) => f.t);
  const F = (j) => j.C.frases;
  // só o banho baixo: lembreteBanho
  const j = carregado((s) => { s.cuidados = { inicial: { fome: 100, sede: 100, banho: 10, em: 1, acao: 0, acaoFome: 0, acaoSede: 0 } }; });
  j.C.iniciar(); j.tocar(); j.andar(2000);
  assert.deepStrictEqual(lem(j), [F(j).lembreteBanho]);
  // limite: nada nos próximos 10 minutos
  for (let m = 0; m < 9; m++) { j.tocar(); j.andar(60 * 1000); }
  assert.strictEqual(lem(j).length, 1, 'lembrou de novo antes de 10 minutos');
  for (let m = 0; m < 2; m++) { j.tocar(); j.andar(60 * 1000); }
  assert.strictEqual(lem(j).length, 2);
  // sede baixa junto: a sede ganha
  const k = carregado((s) => { s.cuidados = { inicial: { fome: 100, sede: 10, banho: 10, em: 1, acao: 0, acaoFome: 0, acaoSede: 0 } }; });
  k.C.iniciar(); k.tocar(); k.andar(2000);
  assert.deepStrictEqual(lem(k), [F(k).lembreteSede]);
  const f = carregado((s) => { s.cuidados = { inicial: { fome: 10, sede: 10, banho: 10, em: 1, acao: 0, acaoFome: 0, acaoSede: 0 } }; });
  f.C.iniciar(); f.tocar(); f.andar(2000);
  assert.deepStrictEqual(lem(f), [F(f).lembreteAmbos]);
  // dentro da Pet Shop: espera
  const p = carregado((s) => { s.cuidados = { inicial: { fome: 100, sede: 100, banho: 10, em: 1, acao: 0, acaoFome: 0, acaoSede: 0 } }; });
  p.cena.estado = 'interior'; p.cena.atual = { lugarId: 'petshop' };
  p.C.iniciar(); p.tocar(); p.andar(2000);
  assert.strictEqual(lem(p).length, 0, 'lembrou dentro da Pet Shop');
  // frases e vozes
  assert.strictEqual(j.C.vozDaFrase('banhou'), 'unicornio');
  assert.strictEqual(j.C.vozDaFrase('lembreteBanho'), 'claude');
  assert.strictEqual(j.C.vozDaFrase('jaLimpinho'), 'claude');
  const textos = j.C.falas().map((x) => x.texto);
  ['lembreteBanho', 'banhou', 'jaLimpinho'].forEach((c) => assert.ok(textos.includes(F(j)[c]), c));
});

teste('banhar: 100, carimbo crescente, grava na hora, cheio e sem-uni, não mexe em acao/acaoFome/acaoSede', () => {
  const j = carregado((s) => { s.cuidados.inicial.banho = 20; });
  const r0 = copia(reg(j.P.estado()));
  const antesSalvar = j.contagem.salvar, ev = j.eventos.length;
  const t = j.relogio.agora;
  const res = j.C.banhar('inicial');
  assert.deepStrictEqual(copia(res), { ok: true, antes: 20, depois: 100 });
  const r = reg(j.P.estado());
  assert.strictEqual(r.banho, 100);
  assert.strictEqual(r.acaoBanho, t);
  assert.strictEqual(r.em, t);
  assert.strictEqual(r.acao, r0.acao); assert.strictEqual(r.acaoFome, r0.acaoFome); assert.strictEqual(r.acaoSede, r0.acaoSede);
  assert.strictEqual(r.fome, r0.fome); assert.strictEqual(r.sede, r0.sede);
  assert.strictEqual(j.contagem.salvar, antesSalvar + 1, 'não gravou na hora');
  assert.strictEqual(j.lido().cuidados.inicial.banho, 100);
  assert.strictEqual(j.lido().cuidados.inicial.acaoBanho, t);
  assert.ok(j.eventos.length > ev, 'não emitiu');
  assert.strictEqual(j.eventos[j.eventos.length - 1].banho, 100);
  // cheio (a gravação normaliza e troca o objeto dos cuidados: sempre ler de novo)
  const R = () => reg(j.P.estado());
  assert.deepStrictEqual(copia(j.C.banhar('inicial')), { ok: false, motivo: 'cheio' });
  R().banho = 99.5; assert.deepStrictEqual(copia(j.C.banhar()), { ok: false, motivo: 'cheio' }, '99,5 já é cheio');
  // registro de hoje (sem banho) = limpinho = cheio, e não cria nada
  assert.deepStrictEqual(copia(j.C.banhar('h-cartinha')), { ok: false, motivo: 'cheio' });
  assert.ok(!('banho' in j.P.estado().cuidados['h-cartinha']));
  // carimbo crescente mesmo no mesmo milissegundo (e com o relógio voltando)
  R().banho = 40; assert.ok(j.C.banhar().ok);
  assert.strictEqual(R().acaoBanho, t + 1);
  j.relogio.agora = t - 5000; R().banho = 40; assert.ok(j.C.banhar().ok);
  assert.strictEqual(R().acaoBanho, t + 2);
  assert.strictEqual(R().acao, r0.acao, 'o banho mexeu no acao');
  // sem-uni: ovo, desconhecido
  assert.deepStrictEqual(copia(j.C.banhar('h-postal')), { ok: false, motivo: 'sem-uni' });
  assert.deepStrictEqual(copia(j.C.banhar('nao-existe')), { ok: false, motivo: 'sem-uni' });
  // montaria sem registro nenhum: cria o registro com fome/sede 100 e acao 0
  const k = carregado((s) => { s.cuidados = {}; });
  k.C.avancar(100 * 60 * 1000);
  const b = k.C.niveis().banho;
  delete k.P.estado().cuidados.inicial.acao; delete k.P.estado().cuidados.inicial.acaoFome;
  const res2 = k.C.banhar();
  assert.ok(res2.ok && Math.abs(res2.antes - b) < 1e-9);
  const rk = reg(k.P.estado());
  assert.strictEqual(rk.acao, 0, 'banho mexeu no acao');
  assert.strictEqual(rk.acaoFome, 0);
});

/* ---------- mescla ---------- */
const T = 1760000000000;
function lado(cuidados, atualizado) { const s = saveHoje(); s.cuidados = cuidados; s.atualizado = atualizado; return s; }
function mesclar(a, b) { const j = montar(); return j.P.mesclar(copia(a), copia(b)); }
const base = (extra) => Object.assign({ fome: 50, sede: 50, em: T, acao: T, acaoFome: T, acaoSede: T }, extra);

teste('mescla: um lado sem banho × outro com banho preserva o banho (duas ordens, com e sem carimbo)', () => {
  const comB = { inicial: base({ banho: 30, acaoBanho: T - 10 }) };
  const semB = { inicial: base({ fome: 40, em: T + 5 }) };     // versão de hoje, mais recente e gastou mais
  [[lado(comB, 1), lado(semB, 2)], [lado(semB, 2), lado(comB, 1)], [lado(comB, 3), lado(semB, 2)], [lado(semB, 1), lado(comB, 3)]].forEach(([a, b], i) => {
    const c = mesclar(a, b).cuidados.inicial;
    assert.strictEqual(c.banho, 30, 'ordem ' + i);
    assert.strictEqual(c.acaoBanho, T - 10, 'ordem ' + i);
    assert.strictEqual(c.fome, 40, 'a regra da fome mudou (' + i + ')');
  });
  // banho sem carimbo (acaoBanho ausente) no único lado que tem: vale, e sem inventar carimbo
  const soBanho = { inicial: base({ banho: 12 }) };
  [[lado(soBanho, 1), lado(semB, 2)], [lado(semB, 2), lado(soBanho, 1)]].forEach(([a, b]) => {
    const c = mesclar(a, b).cuidados.inicial;
    assert.strictEqual(c.banho, 12); assert.ok(!('acaoBanho' in c));
  });
});

teste('mescla: a regra do `em` escolhe o lado sem banho e mesmo assim o banho fica', () => {
  // lado sem carimbo nenhum de fome/sede (save antigo) e `em` maior: a regra escolhe o registro inteiro dele
  const semCarimbo = { inicial: { fome: 20, sede: 25, em: T + 100 } };
  const comB = { inicial: base({ banho: 44, acaoBanho: T - 7 }) };
  [[lado(semCarimbo, 5), lado(comB, 1)], [lado(comB, 1), lado(semCarimbo, 5)], [lado(comB, 9), lado(semCarimbo, 5)]].forEach(([a, b], i) => {
    const c = mesclar(a, b).cuidados.inicial;
    assert.strictEqual(c.fome, 20, 'a regra do em não escolheu o lado sem banho (' + i + ')');
    assert.strictEqual(c.em, T + 100);
    assert.strictEqual(c.banho, 44, 'o banho sumiu (' + i + ')');
    assert.strictEqual(c.acaoBanho, T - 7);
  });
  // o `em` escolhe o lado COM banho e o outro não tem: continua
  const velhoSem = { inicial: { fome: 20, sede: 25, em: T - 100 } };
  const semCarimboComB = { inicial: { fome: 60, sede: 60, em: T, banho: 33 } };
  const c = mesclar(lado(velhoSem, 5), lado(semCarimboComB, 1)).cuidados.inicial;
  assert.strictEqual(c.banho, 33); assert.strictEqual(c.fome, 60);
  // os dois sem carimbo de fome/sede e com banho: o banho segue a regra dele (carimbo maior), não a do `em`
  const x = { inicial: { fome: 20, sede: 25, em: T + 100, banho: 10, acaoBanho: T - 50 } };
  const y = { inicial: { fome: 60, sede: 60, em: T, banho: 90, acaoBanho: T - 5 } };
  [[x, y], [y, x]].forEach(([a, b]) => {
    const r = mesclar(lado(a, 2), lado(b, 1)).cuidados.inicial;
    assert.strictEqual(r.fome, 20); assert.strictEqual(r.banho, 90); assert.strictEqual(r.acaoBanho, T - 5);
  });
});

teste('mescla: dois lados com banho — carimbo maior vence, empate = menor, acaoBanho = o maior', () => {
  const a = { inicial: base({ banho: 100, acaoBanho: T + 50 }) }, b = { inicial: base({ banho: 20, acaoBanho: T }) };
  [[a, b], [b, a]].forEach(([x, y]) => {
    [[1, 2], [2, 1]].forEach(([ux, uy]) => {
      const c = mesclar(lado(x, ux), lado(y, uy)).cuidados.inicial;
      assert.strictEqual(c.banho, 100); assert.strictEqual(c.acaoBanho, T + 50);
    });
  });
  // empate (mesmo banho visto pelos dois, gastou em cada um): o menor
  const e1 = { inicial: base({ banho: 70, acaoBanho: T }) }, e2 = { inicial: base({ banho: 65.5, acaoBanho: T }) };
  [[e1, e2], [e2, e1]].forEach(([x, y]) => {
    const c = mesclar(lado(x, 1), lado(y, 2)).cuidados.inicial;
    assert.strictEqual(c.banho, 65.5); assert.strictEqual(c.acaoBanho, T);
  });
  // os dois sem acaoBanho (0 e 0): empate = o menor, sem inventar carimbo
  const s1 = { inicial: base({ banho: 70 }) }, s2 = { inicial: base({ banho: 60 }) };
  const c = mesclar(lado(s1, 2), lado(s2, 1)).cuidados.inicial;
  assert.strictEqual(c.banho, 60); assert.ok(!('acaoBanho' in c));
  // um lado com carimbo estragado conta 0
  const q1 = { inicial: base({ banho: 90, acaoBanho: 'x' }) }, q2 = { inicial: base({ banho: 50, acaoBanho: 5 }) };
  const cq = mesclar(lado(q1, 2), lado(q2, 1)).cuidados.inicial;
  assert.strictEqual(cq.banho, 50); assert.strictEqual(cq.acaoBanho, 5);
  // banho dado em A e comida dada em B: valem os dois, e o `acao` continua sendo só de comer/beber
  const A = { inicial: base({ fome: 30, banho: 100, acaoBanho: T + 900 }) };
  const B = { inicial: base({ fome: 80, banho: 10, acao: T + 500, acaoFome: T + 500 }) };
  [[A, B], [B, A]].forEach(([x, y]) => {
    const r = mesclar(lado(x, 1), lado(y, 2)).cuidados.inicial;
    assert.strictEqual(r.fome, 80); assert.strictEqual(r.banho, 100);
    assert.strictEqual(r.acao, T + 500, 'o banho entrou no acao'); assert.strictEqual(r.acaoFome, T + 500); assert.strictEqual(r.acaoBanho, T + 900);
  });
  // nenhum lado tem: continua ausente
  const n = mesclar(lado({ inicial: base() }, 1), lado({ inicial: base({ fome: 10 }) }, 2)).cuidados.inicial;
  assert.ok(!('banho' in n) && !('acaoBanho' in n));
});

teste('normalização: inválido vira 100, fora da faixa limita, ausente fica ausente, acaoBanho inválido some', () => {
  const j = carregado((s) => {
    s.cuidados = {
      a: base({ banho: 'abc', acaoBanho: -1 }), b: base({ banho: 150, acaoBanho: 'x' }), c: base({ banho: -3, acaoBanho: 7 }),
      d: base({ banho: null }), e: base(), f: base({ banho: '42', acaoBanho: 0 }), g: base({ banho: 55.5, acaoBanho: T }),
    };
  });
  const c = j.P.estado().cuidados;
  assert.strictEqual(c.a.banho, 100); assert.ok(!('acaoBanho' in c.a));
  assert.strictEqual(c.b.banho, 100); assert.ok(!('acaoBanho' in c.b));
  assert.strictEqual(c.c.banho, 0); assert.strictEqual(c.c.acaoBanho, 7);
  assert.strictEqual(c.d.banho, 100);
  assert.ok(!('banho' in c.e) && !('acaoBanho' in c.e), 'ausente virou presente');
  assert.strictEqual(c.f.banho, 42); assert.strictEqual(c.f.acaoBanho, 0);
  assert.strictEqual(c.g.banho, 55.5); assert.strictEqual(c.g.acaoBanho, T);
  // o acao, a fome e a sede não mudaram por causa do banho
  ['a', 'b', 'c', 'd', 'e', 'f', 'g'].forEach((k) => { assert.strictEqual(c[k].acao, T); assert.strictEqual(c[k].fome, 50); });
});

teste('cópia -novidades devolve o banho que a aba da versão de hoje apagou', () => {
  const j = carregado((s) => { s.cuidados.inicial.banho = 15; s.cuidados.inicial.acaoBanho = T - 1; });
  j.P.salvar();
  assert.strictEqual(j.copiaGuardada().cuidados.inicial.banho, 15);
  // uma aba antiga regrava o save sem o banho (e até com fome mais nova)
  const s = j.lido();
  delete s.cuidados.inicial.banho; delete s.cuidados.inicial.acaoBanho;
  s.cuidados.inicial.fome = 12; s.cuidados.inicial.em = T + 10;
  j.guardado[j.chave] = JSON.stringify(s);
  const k = montar({ loja: j.guardado });
  const e = k.P.carregar();
  assert.strictEqual(e.cuidados.inicial.banho, 15, 'o banho não voltou da cópia');
  assert.strictEqual(e.cuidados.inicial.acaoBanho, T - 1);
  assert.strictEqual(e.cuidados.inicial.fome, 12);
  // cópia com banho mais novo (carimbo) que o save: vence a cópia; mais velho: vence o save
  const s2 = j.lido(); s2.cuidados.inicial.banho = 60; s2.cuidados.inicial.acaoBanho = T + 5; j.guardado[j.chave] = JSON.stringify(s2);
  assert.strictEqual(montar({ loja: j.guardado }).P.carregar().cuidados.inicial.banho, 60);
  const s3 = j.lido(); s3.cuidados.inicial.banho = 60; s3.cuidados.inicial.acaoBanho = T - 1; j.guardado[j.chave] = JSON.stringify(s3);
  assert.strictEqual(montar({ loja: j.guardado }).P.carregar().cuidados.inicial.banho, 15, 'empate = o menor');
  // "Apagar tudo" (geração nova) não traz o banho de volta
  const c = j.copiaGuardada(); c.geracao = 1;
  const s4 = j.lido(); s4.geracao = 2; s4.cuidados = {}; j.guardado[j.chave] = JSON.stringify(s4);
  assert.ok(!montar({ loja: j.guardado }).P.carregar().cuidados.inicial);
});

teste('"trouxe algo novo": conta o acaoBanho e não conta o banho', () => {
  // esta aba tem o estado `meu`; outra aba grava `outro` (evento storage): regrava só se a junção trouxe algo
  function regravou(meu, outro) {
    const k = montar({ save: meu });
    k.P.carregar();
    const antes = k.contagem.salvar;
    k.storage(JSON.stringify(outro));
    return k.contagem.salvar > antes;
  }
  const meu = saveHoje(); meu.cuidados.inicial.banho = 40; meu.cuidados.inicial.acaoBanho = T;
  // a outra aba só tem o banho diferente (gastou menos), mesmo carimbo: nada novo (o empate fica com o menor, 40)
  const soBanho = copia(meu); soBanho.cuidados.inicial.banho = 55; soBanho.atualizado += 1;
  assert.ok(!regravou(meu, soBanho), 'o banho, que muda a cada segundo, contou como novo');
  // esta aba deu banho (carimbo maior): a outra não tem, é novo
  const banhei = copia(meu); banhei.cuidados.inicial.banho = 100; banhei.cuidados.inicial.acaoBanho = T + 10;
  assert.ok(regravou(banhei, soBanho), 'o banho dado aqui não contou como novo');
  // esta aba tem banho e a outra (versão de hoje) não tem o campo: o carimbo do banho é novo para ela
  const semBanho = copia(meu); delete semBanho.cuidados.inicial.banho; delete semBanho.cuidados.inicial.acaoBanho; semBanho.atualizado += 1;
  assert.ok(regravou(meu, semBanho), 'o banho que a outra aba não conhece não contou como novo');
  // mesmo carimbo dos dois lados e nada mais diferente: não regrava
  const igual = copia(meu); igual.atualizado += 1;
  assert.ok(!regravou(meu, igual));
});

/* ---------- aparelho da versão de hoje (main 9985fa7) ---------- */
function pastaAntiga() {
  const dir = '/tmp/reino-banho-pw/b1/antigo';
  const arqs = ['progresso.js', 'cuidados.js'];
  if (!arqs.every((f) => fs.existsSync(path.join(dir, f)))) {
    fs.mkdirSync(dir, { recursive: true });
    arqs.forEach((f) => fs.writeFileSync(path.join(dir, f), execFileSync('git', ['show', '9985fa7:jogo/js/' + f], { cwd: raiz })));
  }
  return dir;
}

teste('aparelho da versão de hoje grava, gasta, come, bebe e mescla um save com banho: o banho não some nem zera', () => {
  const antigo = pastaAntiga();
  // 1. versão nova: banho dado e depois gasto um pouco; grava (save + cópia)
  const loja = {};
  const N = montar({ loja, save: saveHoje() });
  N.P.carregar();
  N.P.estado().cuidados.inicial.banho = 30;
  assert.ok(N.C.banhar().ok);
  N.C.avancar(18 * 60 * 1000);   // banho 90
  N.P.salvar();
  const banhoN = N.P.estado().cuidados.inicial.banho, carimboN = N.P.estado().cuidados.inicial.acaoBanho;
  assert.ok(Math.abs(banhoN - 90) < 1e-9);
  // 2. versão de hoje no mesmo navegador: carrega, gasta, come, bebe, grava
  const V = montar({ loja, antigo, agora: N.relogio.agora + 1000 });
  V.P.carregar();
  assert.strictEqual(V.P.estado().cuidados.inicial.banho, banhoN, 'a versão de hoje perdeu o banho ao carregar');
  V.C.iniciar();
  for (let m = 0; m < 5; m++) { V.tocar(); V.andar(60 * 1000); }
  V.P.estado().despensa.maca = { compradas: 5, usadas: 1 };
  assert.ok(V.C.alimentar('inicial', 'maca').ok);
  assert.ok(V.C.beber('inicial').ok);
  V.P.salvar();
  const gravadoV = JSON.parse(loja[V.chave]);
  assert.strictEqual(gravadoV.cuidados.inicial.banho, banhoN);
  // 3. a versão de hoje mescla com um remoto que tem banho e com um remoto sem banho (mais novo)
  const remotoCom = copia(gravadoV); remotoCom.cuidados.inicial.banho = 5; remotoCom.cuidados.inicial.acaoBanho = carimboN - 100; remotoCom.atualizado += 10;
  const m1 = V.P.mesclar(copia(V.P.estado()), remotoCom);
  assert.strictEqual(typeof m1.cuidados.inicial.banho, 'number');
  const remotoSem = copia(gravadoV); delete remotoSem.cuidados.inicial.banho; delete remotoSem.cuidados.inicial.acaoBanho;
  remotoSem.cuidados.inicial.em += 99999; remotoSem.atualizado += 20;
  const m2 = V.P.mesclar(copia(V.P.estado()), remotoSem);    // aqui a versão de hoje pode perder o banho...
  assert.ok(!('banho' in m2.cuidados.inicial), 'o pior caso não aconteceu (o teste não testaria nada)');
  // ...e grava isso no aparelho (o pior caso): a cópia -novidades é da versão de hoje também, com o banho
  loja[V.chave] = JSON.stringify(m2);
  // 4. de volta à versão nova: o banho não sumiu nem zerou, e a comida e a água dadas na versão de hoje valem
  const N2 = montar({ loja, agora: V.relogio.agora + 1000 });
  const e = N2.P.carregar();
  const r = e.cuidados.inicial;
  assert.strictEqual(typeof r.banho, 'number', 'o banho sumiu');
  assert.ok(r.banho > 0, 'o banho zerou');
  assert.strictEqual(r.banho, banhoN, 'o banho não é o que a versão nova deixou');
  assert.strictEqual(r.acaoBanho, carimboN);
  assert.ok(r.acao >= gravadoV.cuidados.inicial.acao && r.sede === 100, 'a água da versão de hoje não valeu');
  // 5. a versão nova mescla com o estado da versão de hoje sem banho, nas duas ordens: o banho fica
  [[e, m2], [m2, e]].forEach(([a, b]) => {
    const c = N2.P.mesclar(copia(a), copia(b)).cuidados.inicial;
    assert.strictEqual(c.banho, banhoN);
  });
  // 6. o `acao` do banho nunca foi visto como comida pela versão de hoje: um remoto só com banho novo
  //    (acao igual) não mexe na fome nem na sede da versão de hoje
  const soBanhou = copia(gravadoV); soBanhou.cuidados.inicial.banho = 100; soBanhou.cuidados.inicial.acaoBanho = carimboN + 5000;
  soBanhou.cuidados.inicial.fome = 100; soBanhou.cuidados.inicial.sede = 100;
  const antesV = copia(V.P.estado().cuidados.inicial);
  const m3 = V.P.mesclar(copia(V.P.estado()), soBanhou).cuidados.inicial;
  assert.strictEqual(m3.fome, Math.min(antesV.fome, 100));
});

teste('aparelho da versão de hoje sem cópia (outro navegador): servidor sem banho não apaga o banho do aparelho novo', () => {
  const antigo = pastaAntiga();
  const lojaN = {};
  const N = montar({ loja: lojaN, save: saveHoje() });
  N.P.carregar(); N.P.estado().cuidados.inicial.banho = 30; assert.ok(N.C.banhar().ok); N.C.avancar(36 * 60 * 1000);
  const banho = N.P.estado().cuidados.inicial.banho;
  // o outro aparelho (versão de hoje) nunca viu o banho: estado dele, mais novo, com carimbos de fome/sede
  const V = montar({ save: saveHoje(), antigo, agora: N.relogio.agora + 5000 });
  V.P.carregar(); V.P.estado().despensa.maca = { compradas: 5, usadas: 1 }; assert.ok(V.C.alimentar('inicial', 'maca').ok); V.P.salvar();
  const doV = copia(V.P.estado());
  assert.ok(!('banho' in doV.cuidados.inicial));
  // a versão de hoje junta o do aparelho novo e manda ao servidor: pode ou não levar o banho
  const naVersaoHoje = V.P.mesclar(copia(V.P.estado()), copia(N.P.estado()));
  // o aparelho novo recebe os dois (cada um pode ter perdido): o banho continua
  [doV, naVersaoHoje].forEach((remoto) => {
    [[N.P.estado(), remoto], [remoto, N.P.estado()]].forEach(([a, b]) => {
      const c = N.P.mesclar(copia(a), copia(b)).cuidados.inicial;
      assert.strictEqual(c.banho, banho);
      assert.ok(c.fome > 64.5, 'a comida da versão de hoje não valeu');
    });
  });
});

(async () => {
  let falhas = 0;
  for (const t of testes) {
    try { await t.fn(); console.log('ok   ' + t.nome); }
    catch (e) { falhas++; console.log('FALHOU ' + t.nome + '\n       ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join('\n       ') : e)); }
  }
  console.log(`\n${testes.length - falhas}/${testes.length} testes passaram`);
  process.exit(falhas ? 1 : 0);
})();
