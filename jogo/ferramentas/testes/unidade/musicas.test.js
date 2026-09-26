// Testes de unidade: as músicas por ambiente (js/sistemas/musicas.js + musicas-faixas.js) — duração, notas e
// repetição. As regras completas estão no conferidor ferramentas/testes/testar-musicas.js (ver o cabeçalho
// dele); aqui ele roda inteiro, acusa uma faixa estragada de propósito numa cópia em /tmp, e as regras
// básicas (loop ≥ 20 s, notas válidas) também são conferidas direto.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/musicas.test.js   (tudo: npm test, na raiz)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const Jogo = require('../../jogo-no-node');

const jogo = Jogo.raiz;
const conferidor = path.join(jogo, 'ferramentas/testes/testar-musicas.js');
const tmp = path.join('/tmp/reino-testes', path.basename(path.dirname(jogo)) + '-' + crypto.createHash('md5').update(jogo).digest('hex').slice(0, 8), 'musicas');

function rodarConferidor(env = {}) {
  const r = spawnSync(process.execPath, [conferidor], { cwd: jogo, encoding: 'utf8', env: Object.assign({}, process.env, env) });
  return { status: r.status, saida: (r.stdout || '') + (r.stderr || '') };
}

test('conferidor das músicas: todas as faixas passam (≥ 20 s, seções diferentes, sem trecho curto repetido)', () => {
  const r = rodarConferidor();
  assert.strictEqual(r.status, 0, r.saida);
  assert.match(r.saida, /✓ músicas ok/);
});

test('conferidor das músicas: acusa uma faixa encurtada numa cópia (loop < 20 s e seção repetida)', () => {
  fs.mkdirSync(tmp, { recursive: true });
  const arq = path.join(tmp, 'musicas.js');
  // a cópia de musicas.js com uma linha a mais no fim: o mapa fica só com a primeira seção
  fs.writeFileSync(arq, fs.readFileSync(Jogo.arquivo('sistemas/musicas'), 'utf8') +
    '\nReino.Musicas.faixas.mapa.ordem = [Reino.Musicas.faixas.mapa.ordem[0]];\n');
  const r = rodarConferidor({ MUSICAS_ARQ: arq });
  assert.strictEqual(r.status, 1, r.saida);
  assert.match(r.saida, /✗ mapa: loop de [\d.]+ s \(< 20 s\)/);
  assert.match(r.saida, /✗ mapa: menos de 2 seções diferentes/);
});

test('direto: cada faixa dura pelo menos 20 s, começa no tempo 0 e tem notas válidas', () => {
  const ctx = Jogo.contexto({ console, Math, Object, Array, JSON, String, Number, Error, parseFloat, setTimeout, clearTimeout });
  Jogo.carregar(ctx, Jogo.scripts({ nomes: ['nucleo/config', 'nucleo/registros', 'nucleo/util', 'sistemas/musicas-faixas', 'sistemas/musicas'] }));
  const M = ctx.Reino.Musicas;
  const ids = Object.keys(M.faixas);
  assert.ok(ids.length >= 10, 'poucas faixas: ' + ids.length);
  ['mapa', 'lago', 'castelo', 'escola', 'petshop', 'observatorio', 'sala'].forEach((a) => assert.ok(M.faixas[a], 'sem faixa: ' + a));
  ids.forEach((id) => {
    const dur = M.duracao(id), ev = M.expandir(id);
    assert.ok(dur >= 20, `${id}: ${dur} s`);
    assert.ok(ev.length > 0 && ev.some((e) => e.t === 0), `${id}: não começa no tempo 0`);
    ev.forEach((e) => assert.ok(e.t >= 0 && e.t < dur && e.dur > 0 && e.freq >= 30 && e.freq <= 12000 && e.vol > 0 && e.vol <= 1, `${id}: nota inválida em t=${e.t}`));
  });
});
