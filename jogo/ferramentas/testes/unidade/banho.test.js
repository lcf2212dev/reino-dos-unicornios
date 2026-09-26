// Testes de unidade: o banho (cuidados.js e progresso-mescla.js): carregar, gasto, ícone, lembrete, banhar, mescla, normalização e cópia -novidades.
// Alvo: js/sistemas/cuidados.js e progresso*.js. Saves 100% sintéticos, num vm (ajudantes/jogo-save.js); nada toca no save real.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/banho.test.js   (tudo: npm test, na raiz do repositório)
// Casos vindos de ferramentas/testes/testar-banho.js (divididos por assunto na Fase 3).
const { test } = require('node:test');
const assert = require('assert');
const { montar, saveHoje, copia } = require('./ajudantes/jogo-save');

function carregado(ajuste, opcoes = {}) {
  const s = saveHoje();
  if (ajuste) ajuste(s);
  const j = montar(Object.assign({ save: s }, opcoes));
  j.P.carregar();
  return j;
}
const reg = (e, id = 'inicial') => e.cuidados[id];

test('save da versão de hoje carrega igual, banho 100 na leitura e sem criar o campo', () => {
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

test('gasto: só a montaria, só com o relógio ativo, 180 minutos de 100 a 0', () => {
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

test('cruzar o 25 do banho grava e emite; sujinho não fica lento; ícone 💧 > 🍎 > 🛁', () => {
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

test('lembrete do banho: só com fome e sede bem, no mesmo limite, fora da Pet Shop', () => {
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

test('banhar: 100, carimbo crescente, grava na hora, cheio e sem-uni, não mexe em acao/acaoFome/acaoSede', () => {
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

test('mescla: um lado sem banho × outro com banho preserva o banho (duas ordens, com e sem carimbo)', () => {
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

test('mescla: a regra do `em` escolhe o lado sem banho e mesmo assim o banho fica', () => {
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

test('mescla: dois lados com banho — carimbo maior vence, empate = menor, acaoBanho = o maior', () => {
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

test('normalização: inválido vira 100, fora da faixa limita, ausente fica ausente, acaoBanho inválido some', () => {
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

test('cópia -novidades devolve o banho que a aba da versão de hoje apagou', () => {
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

test('"trouxe algo novo": conta o acaoBanho e não conta o banho', () => {
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
