// Testes de unidade: os carimbos das escolhas (`escolhasEm`) e dos pagamentos (`pagoEm`) no save e na mescla.
// Por quê: escolha feita num aparelho (nome, montaria, usando, aparência, ajustes) voltava atrás quando outro
// aparelho gravava depois, e "Já pago" corrigido para menos voltava ao maior (docs/contratos/save-e-mescla.md §4.6–4.7).
// Alvo: js/sistemas/progresso*.js. Saves 100% sintéticos, num vm (ajudantes/jogo-save.js); nada toca no save real.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/save-escolhas-mescla.test.js   (tudo: npm test, na raiz)
const { test } = require('node:test');
const assert = require('assert');
const { montar, saveAtual, saveHoje, copia } = require('./ajudantes/jogo-save');
// objetos do vm têm outro Object.prototype: compara pelo conteúdo
const igual = (a, b, m) => assert.deepStrictEqual(copia(a), copia(b), m);

/* ---------- carimbar: só P.salvar, só a troca de verdade ---------- */
test('escolhas: carregar e salvar sem trocar não carimbam; cada troca carimba a sua escolha', () => {
  const j = montar({ save: saveAtual() });
  const e = j.P.carregar();
  assert.strictEqual(e.escolhasEm, undefined, 'carregar não cria o campo (save sem troca fica igual ao de antes)');
  j.P.salvar(true);
  assert.strictEqual(j.lido().escolhasEm, undefined, 'salvar sem trocar não carimba');
  const trocas = [
    ['montaria', (s) => { s.montaria = 'h-cartinha'; }],
    ['usando', (s) => { s.usando.capa = true; }],
    ['aparencia', (s) => { s.aparencia.cabelo = '#000000'; }],
    ['ajuste:som', (s) => { s.ajustes.som = false; }],
    ['ajuste:texto', (s) => { s.ajustes.texto = 2; }],
    ['nome:inicial', (s) => { s.unis.inicial.nome = 'Pipoca'; }],
    ['nome:h-cartinha', (s) => { s.unis['h-cartinha'].nome = 'Cartinha'; }],
  ];
  trocas.forEach(([chave, trocar]) => {
    j.relogio.agora += 1000;
    trocar(j.P.estado()); j.P.salvar(true);
    const em = j.lido().escolhasEm;
    assert.strictEqual(em[chave], j.relogio.agora, chave + ' ganhou o carimbo da troca');
  });
  igual(Object.keys(j.lido().escolhasEm).sort(), trocas.map((t) => t[0]).sort(), 'só as escolhas trocadas');
  j.relogio.agora += 1000;
  j.P.estado().ajustes.surpresa = false; j.P.salvar(true);
  assert.ok(!('ajuste:surpresa' in j.lido().escolhasEm), 'a surpresa tem o carimbo dela (surpresaEm)');
  assert.strictEqual(j.lido().ajustes.surpresaEm, j.relogio.agora);
  // relógio que volta: o carimbo ainda sobe (a troca nova nunca perde para a que o próprio aparelho já fez)
  const antes = j.lido().escolhasEm.montaria;
  j.relogio.agora -= 60000;
  j.P.estado().montaria = 'inicial'; j.P.salvar(true);
  assert.strictEqual(j.lido().escolhasEm.montaria, antes + 1);
  // ganhar um unicórnio novo (sem nome) não é escolha
  j.P.estado().unis['h-postal'].chocado = true; j.P.salvar(true);
  assert.ok(!('nome:h-postal' in j.lido().escolhasEm));
  j.P.apagarTudo();
  assert.strictEqual(j.P.estado().escolhasEm, undefined, 'apagar tudo não carimba');
});

test('pago: registrarPagamento carimba (também para menos) e o Novo ciclo apaga o carimbo com o pago', () => {
  const j = montar({ save: saveAtual() });
  j.P.carregar();
  // os pais digitam Robux; o save guarda reais, como antes (R$ 1 = 25 Robux: progresso-regras.js)
  j.relogio.agora += 1000; j.P.registrarPagamento('historia', 40 * 25);
  assert.strictEqual(j.lido().pagoEm.historia, j.relogio.agora);
  j.relogio.agora += 1000; j.P.registrarPagamento('historia', 4 * 25);
  assert.strictEqual(j.lido().pago.historia, 4); assert.strictEqual(j.lido().pagoEm.historia, j.relogio.agora);
  assert.strictEqual(j.lido().escolhasEm, undefined, 'pagar não é escolha');
  j.P.novoCiclo();
  igual(j.lido().pago, {}); assert.strictEqual(j.lido().pagoEm, undefined);
});

/* ---------- a mescla ---------- */
function par() {
  const a = saveHoje(), b = saveHoje();
  a.atualizado = 1750700000000; b.atualizado = 1750900000000;   // b é o mais recente
  return { a, b };
}

test('mescla: a escolha com o carimbo maior vale, mesmo no lado com atualizado menor (nas duas ordens)', () => {
  const j = montar();
  const { a, b } = par();
  a.montaria = 'h-cartinha'; a.usando = { enfeites: [], capa: true, asasFada: false, estrelinhas: false };
  a.aparencia.roupa = '#123456'; a.ajustes.som = false; a.unis.inicial.nome = 'Pipoca';
  a.escolhasEm = { montaria: 1750650000000, usando: 1750650000000, aparencia: 1750650000000, 'ajuste:som': 1750650000000, 'nome:inicial': 1750650000000 };
  b.ajustes.voz = false; b.escolhasEm = { 'ajuste:voz': 1750800000000, montaria: 1750600000000 };
  [[a, b], [b, a]].forEach(([x, y]) => {
    const r = j.P.mesclar(copia(x), copia(y));
    assert.strictEqual(r.montaria, 'h-cartinha'); assert.strictEqual(r.usando.capa, true); assert.strictEqual(r.aparencia.roupa, '#123456');
    assert.strictEqual(r.ajustes.som, false); assert.strictEqual(r.ajustes.voz, false, 'a troca do outro lado também fica');
    assert.strictEqual(r.unis.inicial.nome, 'Pipoca');
    igual(r.escolhasEm, { montaria: 1750650000000, usando: 1750650000000, aparencia: 1750650000000, 'ajuste:som': 1750650000000, 'nome:inicial': 1750650000000, 'ajuste:voz': 1750800000000 });
    assert.strictEqual(r.atualizado, b.atualizado);
  });
});

test('mescla: sem carimbo nos dois lados (ou empate) vale o lado mais recente, como antes; carimbo vence o sem carimbo', () => {
  const j = montar();
  const { a, b } = par();
  a.montaria = 'h-cartinha'; a.unis.inicial.nome = 'Velho';
  let r = j.P.mesclar(copia(a), copia(b));
  assert.strictEqual(r.montaria, 'inicial'); assert.strictEqual(r.unis.inicial.nome, 'Teste Azul');
  assert.strictEqual(r.escolhasEm, undefined, 'sem carimbo nenhum, a mescla sai como a de antes');
  a.escolhasEm = { montaria: 5 }; b.escolhasEm = { montaria: 5 };
  assert.strictEqual(j.P.mesclar(copia(a), copia(b)).montaria, 'inicial', 'empate = o mais recente');
  delete b.escolhasEm;
  r = j.P.mesclar(copia(b), copia(a));
  assert.strictEqual(r.montaria, 'h-cartinha', 'o carimbo (troca da versão nova) vence o lado sem carimbo');
  // nome apagado de propósito (carimbado) também vale; unicórnio só de um lado vem inteiro
  a.escolhasEm = { 'nome:inicial': 9 }; delete a.unis.inicial.nome; a.unis['h-novo'] = { em: 1, xp: 3, chocado: true, nome: 'Novo' };
  r = j.P.mesclar(copia(b), copia(a));
  assert.ok(!('nome' in r.unis.inicial)); assert.strictEqual(r.unis['h-novo'].nome, 'Novo');
});

test('mescla do pago: carimbo maior vale (também para menos); sem carimbo, o maior; ciclo mais novo leva o carimbo', () => {
  const j = montar();
  const { a, b } = par();
  a.pago = { historia: 4, ciencias: 2 }; a.pagoEm = { historia: 1750800000000 };
  b.pago = { historia: 40, ciencias: 5 }; b.pagoEm = { historia: 1750700000000 };
  [[a, b], [b, a]].forEach(([x, y]) => {
    const r = j.P.mesclar(copia(x), copia(y));
    igual(r.pago, { historia: 4, ciencias: 5 });
    igual(r.pagoEm, { historia: 1750800000000 });
  });
  const velho = copia(b); velho.ciclo = 1; const novo = copia(a); novo.ciclo = 2; novo.pago = { historia: 1 }; novo.pagoEm = { historia: 3 };
  [[velho, novo], [novo, velho]].forEach(([x, y]) => {
    const r = j.P.mesclar(copia(x), copia(y));
    igual(r.pago, { historia: 1 }); igual(r.pagoEm, { historia: 3 });
  });
  delete novo.pagoEm; novo.atualizado = 1; velho.atualizado = 9e12;
  assert.strictEqual(j.P.mesclar(copia(velho), copia(novo)).pagoEm, undefined, 'o carimbo do ciclo velho não fica');
});

test('carimbo estragado conta como sem carimbo e é limpo ao carregar (sem sujar o protótipo)', () => {
  const s = saveAtual();
  s.escolhasEm = JSON.parse('{"montaria":"ontem","usando":-1,"aparencia":1750000000000,"__proto__":5,"nome:inicial":null}');
  s.pagoEm = [1, 2];
  const j = montar({ save: s });
  const e = j.P.carregar();
  igual(e.escolhasEm, { aparencia: 1750000000000 });
  igual(e.pagoEm, {});
  assert.strictEqual(({}).montaria, undefined);
  const outro = saveAtual(); outro.atualizado = 1; outro.montaria = 'h-cartinha'; outro.escolhasEm = { montaria: 'amanhã' };
  assert.strictEqual(j.P.mesclar(copia(e), outro).montaria, 'inicial');
});

/* ---------- propriedades: idempotente, comutativa, nada some ---------- */
function sorteador(semente) {
  let x = semente;
  return () => { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648; };
}
function lado(sorte, i) {
  const s = saveHoje();
  const t = () => 1750000000000 + Math.floor(sorte() * 8) * 1000;
  s.atualizado = 1750600000000 + i * 7 + Math.floor(sorte() * 5) * 100000;
  s.montaria = sorte() < 0.5 ? 'inicial' : 'h-cartinha';
  s.usando.capa = sorte() < 0.5; s.aparencia.laco = sorte() < 0.5 ? '#ffd34d' : '#00ff00';
  s.ajustes.som = sorte() < 0.5; s.ajustes.texto = sorte() < 0.5 ? 1 : 2;
  s.unis.inicial.nome = sorte() < 0.5 ? 'Teste Azul' : 'Pipoca';
  s.pago.historia = Math.floor(sorte() * 50);
  s.salas.h1.melhor = Math.floor(sorte() * 10); s.estrelas.ganhas = Math.floor(sorte() * 100);
  if (sorte() < 0.2) s.unis['h-extra' + i] = { em: 1, xp: 1, chocado: true };
  if (sorte() < 0.8) {
    s.escolhasEm = {};
    ['montaria', 'usando', 'aparencia', 'ajuste:som', 'ajuste:texto', 'nome:inicial'].forEach((k) => { if (sorte() < 0.6) s.escolhasEm[k] = t(); });
  }
  if (sorte() < 0.7) s.pagoEm = { historia: t() };
  return s;
}
const ESCOLHAS = (e) => [e.montaria, e.usando, e.aparencia, e.ajustes.som, e.ajustes.texto, e.unis.inicial.nome, e.pago.historia];

test('muitos pares: mesclar é idempotente, comutativa (atualizado diferente), escolhas pelo carimbo e nenhuma conquista some', () => {
  const j = montar();
  const sorte = sorteador(20260927);
  for (let i = 0; i < 400; i++) {
    const a = lado(sorte, 2 * i), b = lado(sorte, 2 * i + 1);
    const ab = j.P.mesclar(copia(a), copia(b)), ba = j.P.mesclar(copia(b), copia(a));
    igual(ab, ba, 'comutativa (par ' + i + ')');
    igual(j.P.mesclar(copia(a), copia(a)), a, 'mesclar(a, a) = a (par ' + i + ')');
    igual(j.P.mesclar(copia(ab), copia(a)), ab, 'juntar de novo não muda (par ' + i + ')');
    igual(j.P.mesclar(copia(ab), copia(b)), ab);
    // conquistas: nada some
    assert.strictEqual(ab.salas.h1.melhor, Math.max(a.salas.h1.melhor, b.salas.h1.melhor));
    assert.strictEqual(ab.estrelas.ganhas, Math.max(a.estrelas.ganhas, b.estrelas.ganhas));
    Object.keys(a.unis).concat(Object.keys(b.unis)).forEach((k) => assert.ok(ab.unis[k], 'unicórnio ' + k));
    // cada escolha vem de um dos lados: o de carimbo maior; empate, o mais recente
    const rec = a.atualizado >= b.atualizado ? a : b, ant = rec === a ? b : a;
    ['montaria', 'usando', 'aparencia', 'ajuste:som', 'ajuste:texto', 'nome:inicial', 'pago'].forEach((k, n) => {
      const em = (s) => (k === 'pago' ? (s.pagoEm || {}).historia : (s.escolhasEm || {})[k]) || 0;
      const quem = em(ant) > em(rec) ? ant : em(rec) > em(ant) ? rec : null;
      const esperado = quem ? ESCOLHAS(quem)[n] : k === 'pago' ? Math.max(a.pago.historia, b.pago.historia) : ESCOLHAS(rec)[n];
      igual(ESCOLHAS(ab)[n], esperado, k + ' (par ' + i + ')');
    });
  }
});

/* ---------- cópia -novidades ---------- */
test('cópia -novidades: não leva os carimbos das escolhas nem do pago, e o save sem troca fica igual ao de antes', () => {
  const j = montar({ save: saveAtual() });
  j.P.carregar(); j.P.salvar(true);
  const semTroca = j.lido();
  assert.ok(!('escolhasEm' in semTroca) && !('pagoEm' in semTroca));
  j.relogio.agora += 1000;
  j.P.estado().montaria = 'h-cartinha'; j.P.registrarPagamento('historia', 2 * 25);
  const c = j.copiaGuardada();
  igual(Object.keys(c).sort(), ['atualizado', 'ciclo', 'cuidados', 'despensa', 'geracao', 'surpresa', 'surpresaEm'].filter((k) => k in c).sort());
  assert.ok(!('escolhasEm' in c) && !('pagoEm' in c), 'um carimbo velho não pode colar num valor que outra aba trocou');
  // aba antiga no mesmo navegador grava sem os carimbos: a cópia não os devolve (a troca dela vale onde ninguém carimbou)
  const semCarimbo = j.lido(); delete semCarimbo.escolhasEm; delete semCarimbo.pagoEm; semCarimbo.montaria = 'inicial';
  const k = montar({ loja: j.guardado, agora: j.relogio.agora + 1000 });
  j.guardado[k.chave] = JSON.stringify(semCarimbo);
  const e = k.P.carregar();
  assert.strictEqual(e.escolhasEm, undefined); assert.strictEqual(e.montaria, 'inicial'); assert.strictEqual(e.pago.historia, 2);
});
