// Testes de unidade: duas abas no mesmo aparelho (evento storage, sem vaivém, apagar tudo, novo ciclo) e o reenvio da mescla para a nuvem (doc de mentira).
// Alvo: js/sistemas/progresso*.js. Saves 100% sintéticos, num vm (ajudantes/jogo-save.js); nada toca no save real.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/save-abas-nuvem.test.js   (tudo: npm test, na raiz do repositório)
// Casos vindos de ferramentas/testes/testar-save.js (divididos por assunto na Fase 3).
const { test } = require('node:test');
const assert = require('assert');
const { montar, saveAtual, copia, esperar, docFalso } = require('./ajudantes/jogo-save');

/* ---------- duas abas no mesmo aparelho (S3-4) e reenvio da mescla (S3-1) ----------
   Casos do projetista (pesqAbas). Saves 100% sintéticos. */

// n abas com UM localStorage só. Gravar numa aba põe na fila o evento `storage` das outras (como o
// navegador, que entrega depois); entregar() despacha a fila até esvaziar (ou desiste: vaivém).
function abas(n, save) {
  const loja = {}, fila = [], gravacoes = [];
  const lista = [];
  for (let i = 0; i < n; i++) {
    const j = montar();
    const eu = i;
    j.ctx.localStorage = {
      getItem: (k) => (k in loja ? loja[k] : null),
      setItem: (k, v) => {
        const antes = k in loja ? loja[k] : null;
        loja[k] = String(v);
        if (k === j.R.config.chaveSave) gravacoes[eu] = (gravacoes[eu] || 0) + 1;
        lista.forEach((o, x) => { if (x !== eu) fila.push({ para: x, ev: { key: k, newValue: String(v), oldValue: antes } }); });
      },
    };
    lista.push(j);
  }
  if (save) loja[lista[0].R.config.chaveSave] = JSON.stringify(save);
  return {
    abas: lista, loja, fila, gravacoes,
    chave: lista[0].R.config.chaveSave,
    entregar(max = 50) {
      let rodadas = 0;
      while (fila.length) {
        if (++rodadas > max) throw new Error('vaivém: a fila de eventos não esvazia');
        const { para, ev } = fila.shift();
        (lista[para].ouvintes['win:storage'] || []).forEach((fn) => fn(ev));
      }
      return rodadas;
    },
    andar(ms) { lista.forEach((j) => { j.relogio.agora += ms; }); },
    guardado() { return JSON.parse(loja[lista[0].R.config.chaveSave]); },
    // uma aba da versão de hoje (sem a correção): grava o que tem, sem olhar o que está lá
    gravarSemMesclar(e) {
      const k = lista[0].R.config.chaveSave, v = JSON.stringify(e), antes = loja[k] || null;
      loja[k] = v;
      lista.forEach((o, x) => fila.push({ para: x, ev: { key: k, newValue: v, oldValue: antes } }));
    },
  };
}
function sala(j, id) { return j.R.materias.map((m) => m.salas.find((s) => s.id === id)).find(Boolean); }
function fazerSala(j, id, acertos = 5) {
  const m = j.R.materias.find((mm) => mm.salas.some((s) => s.id === id));
  return j.P.concluirSala(m, sala(j, id), { acertosPrimeira: acertos, total: 10, pressas: 1 });
}

test('duas abas: salas e estrelas feitas alternadamente não se perdem (com o evento storage)', () => {
  const t = abas(2, saveAtual());
  const [A, B] = t.abas;
  A.P.carregar(); B.P.carregar();
  t.andar(1000); fazerSala(A, 'h3', 5); t.entregar();          // +5 estrelas, ovo h-pincelada
  t.andar(1000); fazerSala(B, 'i1', 4); t.entregar();          // +4, ovo i-amiguinho
  t.andar(1000); fazerSala(A, 'h4', 6); t.entregar();          // +6, ovo h-ciranda
  t.andar(1000); fazerSala(B, 'i2', 3); t.entregar();          // +3, ovo i-sunny
  const g = t.guardado();
  ['h1', 'h2', 'h3', 'h4', 'i1', 'i2'].forEach((s) => assert.ok(g.salas[s] && g.salas[s].feita, 'sala ' + s));
  ['h-pincelada', 'i-amiguinho', 'h-ciranda', 'i-sunny'].forEach((u) => assert.ok(g.unis[u], 'unicórnio ' + u));
  assert.strictEqual(g.estrelas.ganhas, 37 + 5 + 4 + 6 + 3);
  // as duas abas veem o mesmo
  assert.strictEqual(A.P.estado().estrelas.ganhas, 55); assert.strictEqual(B.P.estado().estrelas.ganhas, 55);
  // A fecha e reabre: nada se perdeu
  const R = montar({ save: g });
  const e = R.P.carregar();
  assert.strictEqual(Object.keys(e.salas).filter((s) => e.salas[s].feita).length, 6);
  assert.strictEqual(R.P.dinheiroTotal(), A.P.dinheiroTotal());
});

test('duas abas: a que grava sem ter recebido o evento junta antes (salas e unicórnios ficam)', () => {
  const t = abas(2, saveAtual());
  const [A, B] = t.abas;
  A.P.carregar(); B.P.carregar();
  t.andar(1000); fazerSala(A, 'h3', 5);
  t.andar(1000); fazerSala(B, 'i1', 4);       // B ainda não recebeu o evento da A
  const g = t.guardado();
  assert.ok(g.salas.h3 && g.salas.h3.feita, 'a sala da A ficou');
  assert.ok(g.salas.i1 && g.salas.i1.feita, 'a sala da B ficou');
  assert.ok(g.unis['h-pincelada'] && g.unis['i-amiguinho']);
  // estrelas: regra da mescla (maior valor) — no atropelo, vale o maior dos dois lados
  assert.strictEqual(g.estrelas.ganhas, 42);
  t.entregar();
  assert.deepStrictEqual(Object.keys(A.P.estado().salas).sort(), Object.keys(B.P.estado().salas).sort());
});

test('duas abas: uma aba sem a correção grava por cima e a aba nova devolve o que faltava', () => {
  const t = abas(1, saveAtual());
  const [A] = t.abas;
  A.P.carregar();
  t.entregar();
  t.andar(1000); fazerSala(A, 'h2', 5);  // h2 já feita: só estrelas
  t.andar(1000); fazerSala(A, 'h3', 6);
  // a aba antiga (que não viu nada) grava o save velho, com som desligado
  t.andar(1000);
  const velho = saveAtual(); velho.ajustes.som = false; velho.atualizado = A.relogio.agora;
  t.gravarSemMesclar(velho);
  t.andar(1000);
  const antes = t.gravacoes[0];
  t.entregar();
  assert.strictEqual(t.gravacoes[0], antes + 1, 'a aba nova regrava uma vez');
  const g = t.guardado();
  assert.ok(g.salas.h3 && g.salas.h3.feita);
  assert.ok(g.unis['h-pincelada']);
  assert.strictEqual(g.estrelas.ganhas, 37 + 5 + 6);
  assert.strictEqual(g.ajustes.som, false, 'o que a aba antiga mudou por último vale (regra de sempre)');
  assert.ok(g.atualizado > velho.atualizado, 'carimbo novo, para o servidor não ignorar');
});

test('duas abas: sem vaivém de gravações entre elas', () => {
  const t = abas(2, saveAtual());
  const [A, B] = t.abas;
  A.P.carregar(); B.P.carregar();
  A.C.iniciar(); B.C.iniciar(); A.tocar(); B.tocar();
  for (let i = 0; i < 5; i++) {
    t.andar(1000); fazerSala(i % 2 ? B : A, ['h3', 'i1', 'h4', 'i2', 'h5'][i], 5);
    A.andar(30000); B.andar(30000);          // a fome gasta nas duas (cuidados.js grava sozinho)
    t.entregar(20);
  }
  // cada sala = 1 gravação de quem fez; cuidados gravam a cada 60 s; nenhuma gravação por eco
  const total = (t.gravacoes[0] || 0) + (t.gravacoes[1] || 0);
  assert.ok(total <= 5 + 2 * 3 + 2, 'gravações demais: ' + total);
  assert.strictEqual(t.fila.length, 0);
});

test('duas abas: quem recebe o evento só junta, não regrava (sem eco)', () => {
  const t = abas(2, saveAtual());
  const [A, B] = t.abas;
  A.P.carregar(); B.P.carregar();
  ['h3', 'h4', 'h5'].forEach((s) => { t.andar(1000); fazerSala(A, s, 5); t.entregar(); });
  A.P.registrarPagamento('historia', 8); t.entregar();
  A.P.novoCiclo(); t.entregar();
  assert.strictEqual(t.gravacoes[0], 5); assert.strictEqual(t.gravacoes[1] || 0, 0, 'a B regravou por eco');
  assert.strictEqual(B.P.estado().ciclo, 2);
});

test('duas abas: a aba que volta do fundo sem ter recebido o evento junta antes de ganhar estrelas', () => {
  const t = abas(2, saveAtual());
  const [A, B] = t.abas;
  A.P.carregar(); B.P.carregar();
  t.andar(1000); fazerSala(A, 'h3', 5);
  t.fila.length = 0;                                          // B estava congelada: o evento se perdeu
  (B.ouvintes['doc:visibilitychange'] || []).forEach((fn) => fn());   // B volta a aparecer
  assert.ok(B.P.estado().salas.h3, 'B já tem a sala da A');
  t.andar(1000); fazerSala(B, 'i1', 4);
  assert.strictEqual(t.guardado().estrelas.ganhas, 37 + 5 + 4, 'nenhuma estrela perdida');
});

test('uma aba sozinha: uma gravação por salvar e nada a mais', () => {
  const t = abas(1, saveAtual());
  const [A] = t.abas;
  A.P.carregar();
  const g0 = t.gravacoes[0] || 0;
  fazerSala(A, 'h3', 5); A.P.salvar(); A.P.salvar();
  assert.strictEqual((t.gravacoes[0] || 0) - g0, 3);
  // o próprio texto de volta (outra aba não mudou nada) não faz nada
  const ev = { key: t.chave, newValue: t.loja[t.chave] };
  (A.ouvintes['win:storage'] || []).forEach((fn) => fn(ev));
  assert.strictEqual((t.gravacoes[0] || 0) - g0, 3);
});

test('duas abas: "Apagar tudo" numa vale na outra, e a outra não ressuscita o velho', () => {
  const t = abas(2, saveAtual());
  const [A, B] = t.abas;
  A.P.carregar(); B.P.carregar();
  t.andar(1000); A.P.apagarTudo(); t.entregar();
  assert.strictEqual(B.P.estado().geracao, 2);
  assert.deepStrictEqual(copia(B.P.estado().salas), {});
  t.andar(1000); B.P.salvar(); t.entregar();
  assert.strictEqual(t.guardado().geracao, 2);
  assert.deepStrictEqual(t.guardado().salas, {});
});

test('duas abas: "Novo ciclo" numa vale na outra', () => {
  const t = abas(2, saveAtual());
  const [A, B] = t.abas;
  A.P.carregar(); B.P.carregar();
  t.andar(1000); A.P.novoCiclo(); t.entregar();
  assert.strictEqual(B.P.estado().ciclo, 2);
  t.andar(1000); fazerSala(B, 'h1', 5); t.entregar();
  const g = t.guardado();
  assert.strictEqual(g.ciclo, 2);
  assert.deepStrictEqual(Object.keys(g.salas), ['h1']);
  assert.deepStrictEqual(Object.keys(A.P.estado().salas), ['h1']);
});

test('nuvem: o que a mescla trouxe volta ao banco com carimbo novo; sem novidade, não reenvia', async () => {
  const base = saveAtual();
  const local = saveAtual(); local.salas.h3 = { vezes: 1, melhor: 5, feita: 1750300000000 }; local.atualizado = 1750500000000; // mais velho que o banco
  const j = montar({ save: local });
  j.P.carregar();
  const d = docFalso(j, base);
  await j.P.iniciarNuvem();
  await esperar();
  const primeiro = d.enviados[0];
  assert.ok(primeiro.estado.salas.h3, 'a sala h3 foi para o banco');
  assert.ok(primeiro.atualizado > base.atualizado, 'com carimbo novo (os outros aparelhos não ignoram)');
  // o banco devolve o mesmo que recebeu: não reenvia
  d.timers.length = 0;
  j.relogio.agora += 20000;
  d.chegou(primeiro.estado);
  d.rodarTimers(); await esperar();
  assert.strictEqual(d.enviados.length, 1, 'sem reenvio quando nada mudou');
  // outro aparelho manda uma versão sem a h3 e com a i1: a junção vai ao banco com as duas
  const outro = saveAtual(); outro.salas.i1 = { vezes: 1, melhor: 4, feita: 1750700000000 }; outro.atualizado = j.relogio.agora - 1000;
  d.chegou(outro);
  d.rodarTimers(); await esperar();
  assert.strictEqual(d.enviados.length, 2);
  const ult = d.enviados[1];
  assert.ok(ult.estado.salas.h3 && ult.estado.salas.i1);
  assert.ok(ult.atualizado > outro.atualizado);
  // e quando a fome muda só pelo relógio, não conta como novidade
  const soFome = copia(ult.estado); soFome.cuidados = { inicial: { fome: 40, sede: 40, em: j.relogio.agora, acao: 0 } }; soFome.atualizado = ult.atualizado + 1;
  d.chegou(soFome);
  d.rodarTimers(); await esperar();
  assert.strictEqual(d.enviados.length, 2, 'fome e sede sozinhas não fazem reenvio');
});

test('nuvem: aparelho igual ao banco não muda o carimbo ao abrir', async () => {
  const base = saveAtual();
  const j = montar({ save: base });
  j.P.carregar();
  const d = docFalso(j, base);
  await j.P.iniciarNuvem();
  assert.strictEqual(j.P.estado().atualizado, base.atualizado);
  assert.strictEqual(d.enviados[0].atualizado, base.atualizado);
});

// (A2) o onSnapshot compara o conteúdo, não o `atualizado`; a `acao` dos cuidados conta; o relógio da fome não
test('nuvem: doc diferente com o MESMO `atualizado` é juntado (surpresa desligada em outro aparelho não se perde)', async () => {
  const base = saveAtual(); base.ajustes.surpresa = true;
  const j = montar({ save: copia(base) });
  j.P.carregar();
  const d = docFalso(j, copia(base));
  await j.P.iniciarNuvem(); await esperar();
  const mesmo = j.P.estado().atualizado;
  const outro = copia(j.P.estado()); outro.ajustes.surpresa = false; outro.ajustes.surpresaEm = 1760000000000; outro.atualizado = mesmo;
  d.chegou(outro);
  assert.strictEqual(j.P.estado().ajustes.surpresa, false, 'mesmo carimbo, conteúdo diferente: junta');
  const n = d.enviados.length;
  d.chegou(copia(j.P.estado()));   // o banco devolve o que já temos: nada muda, nada sai
  d.rodarTimers(); await esperar();
  assert.strictEqual(d.enviados.length, n);
});

test('nuvem: comida dada neste aparelho (acao) que o banco não tem volta ao banco; só a fome mudada, não', async () => {
  const base = saveAtual(); base.cuidados = { inicial: { fome: 50, sede: 50, em: 1750000000000, acao: 1750000000000 } };
  const j = montar({ save: copia(base) });
  j.P.carregar();
  const d = docFalso(j, copia(base));
  await j.P.iniciarNuvem(); await esperar();
  d.rodarTimers(); await esperar();
  const n0 = d.enviados.length;
  // o banco chega com a fome diferente (o relógio de outro aparelho) e nada mais: não reenvia
  const soFome = copia(j.P.estado()); soFome.cuidados.inicial.fome = 12; soFome.cuidados.inicial.em += 5; soFome.atualizado += 5;
  d.chegou(soFome); d.rodarTimers(); await esperar();
  assert.strictEqual(d.enviados.length, n0, 'fome/sede/em não fazem reenvio');
  // este aparelho deu comida (acao nova) e o banco chega sem ela: devolve
  j.P.estado().cuidados.inicial = { fome: 100, sede: 50, em: 1760000000000, acao: 1760000000000 };
  const semComida = copia(base); semComida.atualizado = j.P.estado().atualizado + 10; semComida.estrelas.ganhas += 1;
  d.chegou(semComida); d.rodarTimers(); await esperar();
  assert.ok(d.enviados.length > n0, 'reenviou');
  const ult = d.enviados[d.enviados.length - 1].estado;
  assert.strictEqual(ult.cuidados.inicial.acao, 1760000000000);
  assert.strictEqual(ult.estrelas.ganhas, base.estrelas.ganhas + 1);
});
