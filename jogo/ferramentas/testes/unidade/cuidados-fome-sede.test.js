// Testes de unidade: fome e sede (js/sistemas/cuidados.js): relógio, ritmo, comer, beber, gravação espaçada, lembrete e avancar.
// Alvo: js/sistemas/cuidados.js. Saves 100% sintéticos, num vm (ajudantes/jogo-save.js); nada toca no save real.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/cuidados-fome-sede.test.js   (tudo: npm test, na raiz do repositório)
// Casos vindos de ferramentas/testes/testar-save.js (divididos por assunto na Fase 3).
const { test } = require('node:test');
const assert = require('assert');
const { copia, jogoCarregado } = require('./ajudantes/jogo-save');

/* ---------- fome e sede ---------- */

test('nada gasta antes de iniciar; só a montaria gasta; ritmo de 120 e 60 minutos', () => {
  const j = jogoCarregado();
  j.andar(60 * 1000);
  assert.deepStrictEqual(copia(j.C.niveis()), { fome: 100, sede: 100, banho: 100 }, 'gastou antes do Entrar no Reino');
  j.C.iniciar();
  for (let m = 0; m < 30; m++) { j.tocar(); j.andar(60 * 1000); }   // 30 min tocando
  const n = j.C.niveis('inicial');
  assert.ok(Math.abs(n.fome - 75) < 0.2, 'fome ' + n.fome);
  assert.ok(Math.abs(n.sede - 50) < 0.2, 'sede ' + n.sede);
  assert.deepStrictEqual(copia(j.C.niveis('h-cartinha')), { fome: 100, sede: 100, banho: 100 }, 'unicórnio que não é a montaria gastou');
});

test('sem toque por 5 minutos e aba escondida: não gasta', () => {
  const j = jogoCarregado();
  j.C.iniciar();
  j.andar(5 * 60 * 1000);                 // 5 min depois do Entrar (que conta como toque)
  const a = j.C.niveis().sede;
  assert.strictEqual(j.C.ativo(), false);
  j.andar(20 * 60 * 1000);
  assert.strictEqual(j.C.niveis().sede, a, 'gastou sem toque');
  j.tocar();
  assert.strictEqual(j.C.ativo(), true);
  j.documento.hidden = true;
  assert.strictEqual(j.C.ativo(), false);
  j.andar(60 * 1000);
  assert.strictEqual(j.C.niveis().sede, a, 'gastou com a aba escondida');
  j.documento.hidden = false;
  j.andar(60 * 1000);
  assert.ok(j.C.niveis().sede < a);
});

test('passo limitado a 5 s (aba que volta do fundo não dá salto)', () => {
  const j = jogoCarregado();
  j.C.iniciar();
  j.relogio.agora += 60 * 60 * 1000;       // uma hora sem nenhum passo do relógio (aba no fundo)
  j.tocar();
  j.andar(1000);                           // o passo seguinte vale no máximo 5 s
  const esperado = 100 - 5000 / (60 * 60000) * 100;
  assert.ok(Math.abs(j.C.niveis().sede - esperado) < 0.01, 'sede ' + j.C.niveis().sede);
});

test('abaixo de 25 anda a 70%; comer e beber voltam a 1 na hora; estrelas certas; água de graça', () => {
  const j = jogoCarregado((s) => { s.estrelas = { ganhas: 100, gastas: 0 }; });
  j.C.avancar(46 * 60 * 1000);             // sede 23,3 e fome 61,7
  assert.strictEqual(j.C.fatorVelocidade(), 0.7);
  assert.strictEqual(j.C.iconeMontaria(), '💧');
  const antes = j.P.estrelas();
  const b = j.C.beber('inicial');
  assert.strictEqual(b.ok, true);
  assert.strictEqual(j.C.niveis().sede, 100);
  assert.strictEqual(j.P.estrelas(), antes, 'beber gastou estrelas');
  assert.strictEqual(j.C.fatorVelocidade(), 1);
  assert.strictEqual(j.C.beber('inicial').motivo, 'cheio');
  j.C.avancar(60 * 60 * 1000);             // fome 11,7 e sede 0
  assert.strictEqual(j.C.iconeMontaria(), '💧', 'sede tem prioridade no ícone');
  j.C.beber();
  assert.strictEqual(j.C.iconeMontaria(), '🍎');
  assert.strictEqual(j.C.fatorVelocidade(), 0.7);
  assert.strictEqual(j.C.alimentar('inicial', 'maca').motivo, 'sem-comida');
  const precos = {};
  j.R.config.comidas.forEach((c) => { precos[c.id] = c.preco; });
  ['cenoura', 'maca', 'feno', 'biscoito', 'bolo'].forEach((id) => {
    const e0 = j.P.estrelas();
    assert.strictEqual(j.C.comprar(id).ok, true);
    assert.strictEqual(e0 - j.P.estrelas(), precos[id], 'preço de ' + id);
  });
  assert.deepStrictEqual(copia(j.C.despensa().map((d) => d.comida.id)), ['cenoura', 'maca', 'feno', 'biscoito', 'bolo']);
  const f0 = j.C.niveis().fome;
  const r = j.C.alimentar('inicial', 'cenoura');
  assert.strictEqual(r.ok, true);
  assert.ok(Math.abs(r.depois - (f0 + 20)) < 1e-9 && r.antes === f0);
  assert.strictEqual(j.C.fatorVelocidade(), 1, 'comeu e continuou lento');
  assert.strictEqual(j.C.quantidade('cenoura'), 0);
  assert.strictEqual(j.C.alimentar('inicial', 'bolo').depois, 100, 'bolo enche');
  assert.strictEqual(j.C.alimentar('inicial', 'maca').motivo, 'cheio');
  assert.strictEqual(j.C.quantidade('maca'), 1, 'cheio não gasta a comida');
  // faltando estrelas
  j.P.estado().estrelas = { ganhas: 10, gastas: 7 };
  assert.deepStrictEqual(copia(j.C.comprar('bolo')), { ok: false, motivo: 'estrelas', faltam: 5 });
  assert.strictEqual(j.P.estrelas(), 3);
  // unicórnio ainda no ovo
  assert.strictEqual(j.C.alimentar('h-postal', 'maca').motivo, 'sem-uni');
  assert.strictEqual(j.C.beber('h-postal').motivo, 'sem-uni');
  assert.strictEqual(j.C.beber('nao-existe').motivo, 'sem-uni');
});

test('gravação espaçada: nunca a cada passo; cruzar o 25 grava na hora', () => {
  const j = jogoCarregado();
  j.C.iniciar();
  const s0 = j.contagem.salvar;
  for (let m = 0; m < 40; m++) { j.tocar(); j.andar(60 * 1000); }   // 40 min = 2400 passos
  const gravacoes = j.contagem.salvar - s0;
  assert.ok(gravacoes <= 42 && gravacoes >= 30, 'gravações em 40 min: ' + gravacoes);
  // cruzar o 25 da sede (45 min): grava no mesmo passo
  let salvouNoCruzamento = false;
  for (let s = 0; s < 6 * 60; s++) {
    if (s % 60 === 0) j.tocar();
    const antes = j.contagem.salvar, eraBaixo = j.C.baixo().sede;
    j.andar(1000);
    if (!eraBaixo && j.C.baixo().sede) salvouNoCruzamento = j.contagem.salvar > antes;
  }
  assert.ok(salvouNoCruzamento, 'não gravou ao cruzar o 25');
  // o que foi gravado no aparelho já tem a sede baixa
  const gravado = JSON.parse(j.guardado[j.R.config.chaveSave]);
  assert.ok(gravado.cuidados.inicial.sede < 25);
  // evento a cada ponto inteiro (não a cada passo)
  assert.ok(j.eventos.length > 50 && j.eventos.length < 120, 'eventos: ' + j.eventos.length);
});

test('lembrete: só com ela livre e no máximo 1 a cada 10 minutos', () => {
  const j = jogoCarregado((s) => { s.cuidados = { inicial: { fome: 80, sede: 20, em: 1 } }; });
  j.cena.estado = 'atividade';
  j.C.iniciar();
  j.andar(3000);
  assert.strictEqual(j.balao.falas.length, 0, 'lembrou com tela aberta');
  j.cena.estado = 'interior'; j.balao.aberto = true;
  j.andar(3000);
  assert.strictEqual(j.balao.falas.length, 0, 'lembrou com o balão aberto');
  j.balao.aberto = false;
  j.andar(1000);
  assert.strictEqual(j.balao.falas.length, 1);
  assert.strictEqual(j.balao.falas[0].t, j.C.frases.lembreteSede);
  assert.strictEqual(j.balao.falas[0].o.tempo, 6000);
  for (let m = 0; m < 9; m++) { j.tocar(); j.andar(60 * 1000); }
  assert.strictEqual(j.balao.falas.length, 1, 'lembrou antes de 10 min');
  j.tocar(); j.andar(61 * 1000);
  assert.strictEqual(j.balao.falas.length, 2);
  const intervalo = j.balao.falas[1].em - j.balao.falas[0].em;
  assert.ok(intervalo >= 10 * 60 * 1000, 'intervalo ' + intervalo);
});

test('avancar gasta mesmo parada; depurar e falas no formato do contrato', () => {
  const j = jogoCarregado();
  const d = j.C.avancar(12 * 60 * 1000);   // sem iniciar, sem toque
  assert.ok(Math.abs(d.fome - 90) < 0.01 && Math.abs(d.sede - 80) < 0.01);
  assert.deepStrictEqual(Object.keys(d).sort(), ['ativo', 'banho', 'despensa', 'fator', 'fome', 'icone', 'montaria', 'sede', 'sujo', 'todos']);
  assert.deepStrictEqual(Object.keys(d.todos).sort(), ['h-cartinha', 'inicial']);
  const chaves = ['lembreteFome', 'lembreteSede', 'lembreteAmbos', 'lembreteDespensa', 'faltamEstrelas', 'guardado', 'comeu', 'cheio', 'bebeu', 'semSede', 'despensaVazia',
    'lembreteBanho', 'banhou', 'jaLimpinho'];
  assert.deepStrictEqual(Object.keys(j.C.frases).sort(), chaves.slice().sort());
  assert.strictEqual(j.C.vozDaFrase('comeu'), 'unicornio');
  assert.strictEqual(j.C.vozDaFrase('bebeu'), 'unicornio');
  assert.strictEqual(j.C.vozDaFrase('lembreteFome'), 'claude');
  const f = j.C.falas();
  assert.strictEqual(f.length, chaves.length);
  f.forEach((x) => {
    assert.ok(x.texto && (x.voz === 'claude' || x.voz === 'unicornio'));
    // frases de 3 ou mais palavras
    x.texto.split(/(?<=[.!?])\s+/).filter((fr) => /\p{L}/u.test(fr)).forEach((fr) => {
      const palavras = fr.replace(/[^\p{L}\s-]/gu, ' ').trim().split(/\s+/).filter(Boolean);
      assert.ok(palavras.length >= 3, 'frase curta: ' + fr);
    });
  });
});

test('a mescla troca o objeto: os cuidados leem o estado novo', () => {
  const j = jogoCarregado();
  j.C.iniciar();
  j.C.avancar(10 * 60 * 1000);
  const remoto = copia(j.P.estado());
  remoto.cuidados.inicial = { fome: 12, sede: 99, em: j.relogio.agora + 1 };
  remoto.atualizado = j.relogio.agora + 1;
  const e = j.P.mesclar(j.P.estado(), remoto);
  j.ctx.localStorage.setItem(j.R.config.chaveSave, JSON.stringify(e));
  j.P.carregar();                          // troca o objeto, como a mescla faz
  assert.strictEqual(j.C.niveis().fome, 12);
  j.tocar(); j.andar(1000);
  assert.ok(j.P.estado().cuidados.inicial.fome < 12);
});
