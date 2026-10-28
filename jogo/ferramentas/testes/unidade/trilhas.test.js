// Testes de unidade: as etapas da sala de livro no save (js/sistemas/etapas-progresso.js, Reino.Etapas) e a trilha
// perfeita (js/sistemas/trilhas.js, P.conferirTrilhas; quimica.js, os grupos elementos e experiencias).
// Contrato: docs/contratos/quarto-bimestre.md §13.2 e §14.2. O jogo inteiro (os `node: true` do manifesto) num vm com
// localStorage e relógio de mentira (ajudantes/jogo-save.js), com os prêmios reais (premios-trilha-*.js). Inclui dois aparelhos, um com a versão de antes das etapas (main c4084a2, git show), no
// mesmo banco. Saves 100% sintéticos; nada toca no save real nem na rede.
// Rodar (da raiz): npm run unidade -- --so trilhas   (também no node jogo/ferramentas/testes/testar-save.js)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { Jogo, montar, saveHoje, copia, esperar } = require('./ajudantes/jogo-save');
const { PASTA_TESTES } = require('../guardas');

const SALA = 'lp10a7', M = 'portugues4';
// o prêmio real da sala (premios-trilha-10.js; tabela do quarto-bimestre.md §14.4), conferido no 1º teste
const PREMIO = { sala: SALA, materia: M, acessorio: { id: 'lpt-lp10a7' }, elemento: 25, experiencia: 'exp-feijao-no-algodao' };
const igual = (a, b, m) => assert.deepStrictEqual(copia(a), copia(b), m);

// o jogo inteiro no vm (cada teste com o seu: nada depende da ordem), com os prêmios reais da trilha
function jogo(opcoes = {}) {
  const orig = Jogo.scripts;
  Jogo.scripts = () => orig({});
  let j;
  try { j = montar(Object.assign({ agora: 1790000000000 }, opcoes)); } finally { Jogo.scripts = orig; }
  j.trilhas = [];
  j.R.util.on(j.R.EVENTOS.TRILHA_PERFEITA, (c) => j.trilhas.push(copia(c)));
  return j;
}
function carregado(save, opcoes) { const j = jogo(Object.assign({ save: save || saveHoje() }, opcoes)); j.P.carregar(); return j; }
const mat = (j) => j.R.materia(M);
const sala = (j) => mat(j).salas.find((s) => s.id === SALA);
const etapas = (j) => j.R.etapasDaSala(mat(j), sala(j));
// resultado de uma etapa: `erros` desafios errados de primeira (e `pressas`)
function res(j, n, erros = 0, pressas = 0) { const t = etapas(j)[n].desafios.length; return { acertosPrimeira: t - erros, total: t, pressas }; }

test('a sala tem 3+ etapas; estado inicial: nada feito, próxima a 1ª; o prêmio real da sala', () => {
  const j = carregado();
  const p = j.R.premioTrilha(SALA);
  igual([p.materia, p.acessorio.id, p.elemento, p.experiencia], [M, PREMIO.acessorio.id, PREMIO.elemento, PREMIO.experiencia]);
  assert.strictEqual(j.R.Quimica.elemento(25).trilha, SALA);
  assert.ok(j.R.QUIMICA.experiencias.some((e) => e.id === PREMIO.experiencia));
  assert.ok(etapas(j).length >= 3, 'etapas: ' + etapas(j).length);
  igual(j.R.Etapas.estado(M, SALA), { total: etapas(j).length, feitas: [], perfeitas: [], proxima: 0, emAndamento: false, fechadaSemConcluir: false, salaFeita: false, trilhaPerfeita: false });
  assert.strictEqual(j.R.Etapas.estado(M, 'h1'), null, 'sala que não é de livro');
  igual(j.R.Etapas.estado(mat(j), sala(j)), j.R.Etapas.estado(M, SALA), 'objeto ou id');
});

test('sair depois da etapa 2 e voltar: as duas guardadas, próxima = 2; a sala ainda não conta', () => {
  const j = carregado();
  igual(j.R.Etapas.concluirEtapa(M, SALA, 0, res(j, 0)), { ultima: false, perfeita: true });
  j.relogio.agora += 1000;
  igual(j.R.Etapas.concluirEtapa(M, SALA, 1, res(j, 1)), { ultima: false, perfeita: true });
  // abre de novo (o que ficou gravado no aparelho)
  const k = jogo({ loja: j.guardado });
  k.P.carregar();
  const e = k.R.Etapas.estado(M, SALA);
  igual([e.feitas, e.proxima, e.emAndamento, e.salaFeita], [[0, 1], 2, true, false]);
  assert.ok(!k.P.estado().salas[SALA], 'a sala só conta na última etapa');
  assert.strictEqual(k.lido().etapas[SALA].feitas[1].em, 1790000001000);
});

test('terminar todas as etapas = o mesmo prêmio de concluirSala com a sala inteira (Robux, estrelas, ovos, xp)', () => {
  for (const [erros, pressas] of [[0, 0], [1, 0], [0, 2]]) {
    const a = carregado(), b = carregado();
    let r;
    etapas(a).forEach((_, n) => {
      r = a.R.Etapas.concluirEtapa(M, SALA, n, res(a, n, n === 1 ? erros : 0, n === 0 ? pressas : 0));
      assert.strictEqual(r.ultima, n === etapas(a).length - 1, 'ultima na etapa ' + n);
    });
    const t = sala(b).desafios.length;
    const inteira = b.P.concluirSala(mat(b), sala(b), { acertosPrimeira: t - erros, total: t, pressas });
    igual(r.sala, inteira, `prêmio (erros ${erros}, pressas ${pressas})`);
    b.P.conferirTrilhas();   // a sala inteira sem erro dá a trilha na próxima abertura (retroativo); as etapas, na hora
    const ea = copia(a.P.estado()), eb = copia(b.P.estado());
    ['salas', 'estrelas', 'unis', 'loja'].forEach((c) => igual(ea[c], eb[c], c));
    assert.strictEqual(a.P.dinheiroTotal(), b.P.dinheiroTotal());
    // rodada nova: nenhuma etapa feita, sala feita
    const e = a.R.Etapas.estado(M, SALA);
    igual([e.feitas, e.proxima, e.salaFeita], [[], 0, true]);
  }
});

test('etapa errada não dá ⭐; refazer só ela sem erro: trilha perfeita, os 3 prêmios uma vez só, sem estrelas da química', () => {
  const j = carregado();
  const n = etapas(j).length;
  for (let k = 0; k < n; k++) {
    const r = j.R.Etapas.concluirEtapa(M, SALA, k, res(j, k, k === 1 ? 1 : 0));
    assert.strictEqual(r.perfeita, k !== 1);
    assert.ok(!r.trilha, 'sem trilha ainda');
  }
  let e = j.R.Etapas.estado(M, SALA);
  assert.ok(!e.perfeitas.includes(1) && e.perfeitas.length === n - 1 && !e.trilhaPerfeita);
  assert.ok(!j.P.estado().salas[SALA].perfeita);
  assert.ok(!j.P.estado().loja[PREMIO.acessorio.id] && !j.R.Quimica.elementoGanho(25));
  const vezes = j.P.estado().salas[SALA].vezes, estrelas = j.P.estrelas();
  // refaz só a etapa 1, sem erro
  j.relogio.agora += 5000;
  const r = j.R.Etapas.concluirEtapa(M, SALA, 1, res(j, 1));
  igual(r, { ultima: false, perfeita: true, trilha: j.R.premioTrilha(SALA) });
  assert.strictEqual(j.P.estado().salas[SALA].vezes, vezes, 'refazer uma etapa não conclui a sala de novo');
  assert.strictEqual(j.P.estrelas(), estrelas, 'nem estrelas da sala nem da química');
  e = j.R.Etapas.estado(M, SALA);
  assert.ok(e.trilhaPerfeita && e.perfeitas.length === n);
  const s = j.lido();
  assert.strictEqual(s.trilhas[SALA], j.relogio.agora);
  assert.strictEqual(s.loja[PREMIO.acessorio.id], true);
  igual([s.quimica.elementos, s.quimica.experiencias], [{ z25: 1 }, { [PREMIO.experiencia]: 1 }]);
  assert.ok(j.R.Quimica.elementoGanho(25) && j.R.Quimica.experienciaGanha(PREMIO.experiencia));
  assert.ok(j.R.Quimica.elementoGanho(1), 'elemento sem trilha: sempre aberto');
  igual(j.R.Quimica.descobertas('elementos'), ['z25']);
  // os grupos do prêmio só pela trilha; a trilha não grava nos grupos de sempre
  igual(j.R.Quimica.descobrir('elementos', 'z1'), { nova: false, estrelas: 0, completo: false });
  igual(j.R.Quimica.descobrir('receitas', 'pof', { trilha: true }), { nova: false, estrelas: 0, completo: false });
  igual(j.trilhas, [{ sala: SALA, materia: M }]);
  // de novo: nada mais
  const r2 = j.R.Etapas.concluirEtapa(M, SALA, 1, res(j, 1));
  assert.ok(!r2.trilha);
  igual(j.P.conferirTrilhas(), []);
  assert.strictEqual(j.trilhas.length, 1);
  assert.strictEqual(j.lido().trilhas[SALA], s.trilhas[SALA]);
});

test('retroativo: save com salas.X.perfeita (feita de uma vez, antes das etapas) ganha ao abrir, uma vez só', () => {
  const s = saveHoje();
  s.salas[SALA] = { vezes: 1, melhor: 11, feita: 1789000000000, perfeita: true };
  const j = carregado(s);
  igual(j.trilhas, [{ sala: SALA, materia: M }]);
  const g = j.lido();
  assert.ok(g.trilhas[SALA] && g.loja[PREMIO.acessorio.id] && g.quimica.elementos.z25, 'gravado ao abrir');
  assert.ok(j.R.Etapas.estado(M, SALA).trilhaPerfeita);
  const k = jogo({ loja: j.guardado });
  k.P.carregar();
  igual(k.trilhas, [], 'abrir de novo não dá de novo');
  igual(k.P.conferirTrilhas(), []);
  // sala já ganha, mas a loja e os cartões faltando (save mexido): voltam, sem evento nem sala nova
  delete k.P.estado().loja[PREMIO.acessorio.id]; delete k.P.estado().quimica.elementos.z25; delete k.P.estado().quimica.experiencias[PREMIO.experiencia];
  const em = k.P.estado().trilhas[SALA];
  igual(k.P.conferirTrilhas(), []);
  assert.ok(k.P.estado().loja[PREMIO.acessorio.id] && k.R.Quimica.elementoGanho(25) && k.R.Quimica.experienciaGanha(PREMIO.experiencia));
  assert.strictEqual(k.P.estado().trilhas[SALA], em);
  igual(k.trilhas, []);
  // sala feita com erro: nada
  const s2 = saveHoje(); s2.salas[SALA] = { vezes: 3, melhor: 9, feita: 1789000000000 };
  const x = carregado(s2);
  igual(x.trilhas, []); assert.ok(!x.P.estado().trilhas[SALA]);
});

test('Novo ciclo: as etapas zeram, os prêmios da trilha ficam e não vêm de novo', () => {
  const s = saveHoje();
  s.salas[SALA] = { vezes: 1, melhor: 11, feita: 1789000000000, perfeita: true };
  const j = carregado(s);
  j.R.Etapas.concluirEtapa(M, SALA, 0, res(j, 0, 1));
  j.P.novoCiclo();
  const e = j.lido();
  igual(e.etapas, {});
  assert.ok(e.trilhas[SALA] && e.loja[PREMIO.acessorio.id] && e.quimica.elementos.z25 && e.quimica.experiencias[PREMIO.experiencia]);
  igual(j.P.conferirTrilhas(), []);
  assert.strictEqual(j.trilhas.length, 1);
  assert.ok(j.R.Etapas.estado(M, SALA).trilhaPerfeita, 'o prêmio ganho continua');
});

test('mescla de dois aparelhos: comutativa; rodada maior vence; mesma rodada, união; ⭐ sempre união', () => {
  const base = saveHoje();
  const A = carregado(copia(base)), B = carregado(copia(base));
  A.R.Etapas.concluirEtapa(M, SALA, 0, res(A, 0));
  B.relogio.agora += 2000;
  B.R.Etapas.concluirEtapa(M, SALA, 1, res(B, 1, 1));
  B.R.Etapas.concluirEtapa(M, SALA, 0, res(B, 0, 1));   // a mesma etapa nos dois: vale a de `em` maior (B)
  const a = copia(A.P.estado()), b = copia(B.P.estado());
  const ab = A.P.mesclar(copia(a), copia(b)), ba = A.P.mesclar(copia(b), copia(a));
  igual(ab.etapas, ba.etapas, 'comutativa');
  igual(ab.trilhas, ba.trilhas);
  igual(Object.keys(ab.etapas[SALA].feitas), ['0', '1']);
  assert.strictEqual(ab.etapas[SALA].feitas[0].em, b.etapas[SALA].feitas[0].em);
  igual(ab.etapas[SALA].perfeitas, a.etapas[SALA].perfeitas, 'a ⭐ de A fica');
  igual(A.P.mesclar(copia(ab), copia(ab)).etapas, ab.etapas, 'idempotente');
  // rodada maior vence: B termina a sala (rodada nova) e faz a 1ª etapa da rodada seguinte
  etapas(B).forEach((_, n) => { if (n > 1) B.R.Etapas.concluirEtapa(M, SALA, n, res(B, n)); });
  B.R.Etapas.concluirEtapa(M, SALA, 2, res(B, 2));
  const b2 = copia(B.P.estado());
  assert.strictEqual(b2.etapas[SALA].rodada, 1);
  const m1 = A.P.mesclar(copia(a), copia(b2)), m2 = A.P.mesclar(copia(b2), copia(a));
  igual(m1.etapas, m2.etapas);
  igual(Object.keys(m1.etapas[SALA].feitas), ['2'], 'as feitas da rodada 0 de A somem');
  assert.ok(m1.etapas[SALA].perfeitas[0] !== undefined, 'a ⭐ da etapa 0 (de A) fica entre rodadas');
  // trilhas: o menor `em` por sala
  const t1 = copia(a), t2 = copia(b2);
  t1.trilhas = { [SALA]: 500, lp10a1: 900 }; t2.trilhas = { [SALA]: 300 };
  igual(A.P.mesclar(t1, t2).trilhas, { [SALA]: 300, lp10a1: 900 });
  igual(A.P.mesclar(t2, t1).trilhas, { [SALA]: 300, lp10a1: 900 });
});

test('a rodada que fechou pela mescla (cada aparelho fez umas etapas): a próxima etapa refeita conclui a sala, uma vez', () => {
  const A = carregado(), B = carregado();
  const n = etapas(A).length;
  for (let k = 0; k < n; k++) (k < 2 ? A : B).R.Etapas.concluirEtapa(M, SALA, k, res(A, k));
  const m = A.P.mesclar(copia(A.P.estado()), copia(B.P.estado()));
  const C = carregado(m);
  const e = C.R.Etapas.estado(M, SALA);
  igual([e.feitas.length, e.proxima, e.emAndamento, e.fechadaSemConcluir, e.salaFeita], [n, null, false, true, false]);
  const r = C.R.Etapas.concluirEtapa(M, SALA, 0, res(C, 0));
  assert.ok(r.ultima && r.sala.primeiraVez);
  assert.strictEqual(C.P.estado().salas[SALA].vezes, 1);
  assert.ok(!C.R.Etapas.concluirEtapa(M, SALA, 1, res(C, 1)).ultima, 'a seguinte já é de uma rodada nova');
});

/* ---------- dois aparelhos, um com a versão de antes das etapas (sem os campos novos), no mesmo banco ---------- */
const ANTIGA = 'c4084a26';
function pastaAntiga() {
  fs.mkdirSync(PASTA_TESTES, { recursive: true });
  const dir = fs.mkdtempSync(path.join(PASTA_TESTES, 'trilhas-antiga-'));
  const mostrar = (f) => execFileSync('git', ['show', ANTIGA + ':jogo/js/sistemas/' + f], { cwd: Jogo.raiz, encoding: 'utf8' });
  fs.writeFileSync(path.join(dir, 'progresso.js'), ['progresso.js', 'progresso-mescla.js', 'progresso-nuvem.js', 'progresso-regras.js', 'progresso-campos.js'].map(mostrar).join('\n'));
  fs.writeFileSync(path.join(dir, 'cuidados.js'), mostrar('cuidados.js'));
  return dir;
}
function bancoCompartilhado(inicial) {
  const banco = { valor: copia(inicial) };
  banco.ligar = (j) => {
    const d = { snap: null, timers: [] };
    j.ctx.setTimeout = (fn) => { d.timers.push(fn); return d.timers.length; };
    j.ctx.clearTimeout = () => {};
    j.ctx.claude = { use: () => Promise.resolve({ doc: () => ({
      get: () => Promise.resolve({ exists: true, data: () => copia(banco.valor) }),
      set: (x) => { banco.valor = copia(x); return Promise.resolve(); },
      onSnapshot: (fn) => { d.snap = fn; },
    }) }) };
    d.enviar = async () => { const ts = d.timers.splice(0); ts.forEach((f) => f()); await esperar(); await esperar(); };
    d.conferir = async () => { d.snap({ exists: true, metadata: { hasPendingWrites: false }, data: () => copia(banco.valor) }); await esperar(); };
    return d;
  };
  return banco;
}

test('versão antiga num aparelho e nova no outro: as etapas, a trilha e os prêmios não somem; a conquista antiga entra', async () => {
  const antigo = pastaAntiga();
  const base = saveHoje();
  const banco = bancoCompartilhado({ estado: base, atualizado: base.atualizado });
  const N = jogo({ save: copia(base) }), V = montar({ save: copia(base), antigo, agora: 1790000000000 });
  N.P.carregar(); V.P.carregar();
  assert.ok(!V.P.registrarCampo || !V.P.camposRegistrados().includes('etapas'), 'a versão antiga não conhece o campo');
  const dN = banco.ligar(N), dV = banco.ligar(V);
  await N.P.iniciarNuvem(); await V.P.iniciarNuvem(); await esperar();
  await dN.enviar(); await dV.enviar();
  const andar = (ms) => { N.relogio.agora += ms; V.relogio.agora += ms; };
  // na versão nova: a sala em etapas, uma com erro, e a trilha depois de refazer
  andar(1000);
  etapas(N).forEach((_, n) => N.R.Etapas.concluirEtapa(M, SALA, n, res(N, n, n === 1 ? 1 : 0)));
  N.R.Etapas.concluirEtapa(M, SALA, 1, res(N, 1));      // rodada nova: refaz a 1 sem erro (a trilha)
  N.R.Etapas.concluirEtapa(M, SALA, 0, res(N, 0, 1));   // e a 0 com erro (não tira a ⭐)
  await dN.enviar();
  // na versão antiga, depois: uma conquista e uma gravação que não sabe dos campos novos
  andar(5000);
  V.P.estado().salas.h3 = { vezes: 1, melhor: 5, feita: V.relogio.agora };
  V.P.ganharEstrelas(3); V.P.salvar();
  await dV.enviar();
  for (let i = 0; i < 3; i++) { andar(1000); await dN.conferir(); await dN.enviar(); andar(1000); await dV.conferir(); await dV.enviar(); }
  const e = N.P.estado();
  assert.ok(e.salas.h3, 'a conquista da versão antiga chegou');
  assert.ok(e.trilhas[SALA] && e.loja[PREMIO.acessorio.id] && e.quimica.elementos.z25 && e.quimica.experiencias[PREMIO.experiencia], 'prêmios da trilha');
  igual(Object.keys(e.etapas[SALA].feitas), ['0', '1'], 'as etapas da rodada nova');
  assert.strictEqual(Object.keys(e.etapas[SALA].perfeitas).length, etapas(N).length, 'as ⭐');
  assert.strictEqual(e.salas[SALA].vezes, 1);
  igual(N.trilhas, [{ sala: SALA, materia: M }], 'o prêmio uma vez só');
  // o banco e a versão antiga guardam os campos que não conhecem
  const g = banco.valor.estado;
  igual([g.etapas, g.trilhas], [copia(e.etapas), copia(e.trilhas)], 'o banco');
  igual(copia(V.P.estado()).etapas, copia(e.etapas), 'a versão antiga guarda as etapas');
  assert.ok(V.P.estado().loja[PREMIO.acessorio.id], 'e o acessório (loja)');
});
