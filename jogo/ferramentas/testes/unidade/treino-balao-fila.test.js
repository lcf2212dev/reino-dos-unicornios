// Prova.balaoQueSome (treino.js): o "Hora de revisar!" do treino some sozinho, vigiado por um setInterval de 200 ms.
// Bug (docs/pendencias.md): se o balão nunca aparece (ficou na fila atrás de outro, e o Claude.limpar() de quem abre
// uma questão descartou a fila), o intervalo nunca era limpo. Caminho real: a dica do Claude depois de uma sala
// (Claude.depoisDaMissao, sem tempo) ainda aberta quando ela toca em "Treino" na mesma tela da matéria.
// Agora o intervalo desiste depois de um tempo máximo na fila; o balão que aparece some como antes.
// Jogo inteiro num vm, com relógio, intervalos e balão do Claude de mentira (a fila e o limpar como em claude.js).
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('../../jogo-no-node.js');

function jogo() {
  const relogio = { agora: 1760000000000 };
  const intervalos = [];
  class DataFalsa extends Date {
    constructor(...a) { super(...(a.length ? a : [relogio.agora])); }
    static now() { return relogio.agora; }
  }
  // o balão do Claude: um aberto e a fila; limpar descarta a fila sem resolver (itens sem quem/botões/modal)
  const claude = { aberto: null, fila: [], fechados: [] };
  const balao = { get hidden() { return !claude.aberto; }, querySelector: () => ({ textContent: claude.aberto ? claude.aberto.texto : '' }) };
  const ctx = Jogo.contexto({ console, Math, JSON, Date: DataFalsa, setTimeout: () => 0, clearTimeout() {},
    setInterval: (fn, ms) => { intervalos.push({ fn, ms, vivo: true }); return intervalos.length; },
    clearInterval: (id) => { if (intervalos[id - 1]) intervalos[id - 1].vivo = false; },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    PA: { APARENCIA_PADRAO: { pele: '#f1c7a3', cabelo: '#5a3825', roupa: '#ff7eb6', laco: '#ffd34d' } },
    location: { protocol: 'file:', search: '' }, addEventListener() {},
    document: { hidden: false, addEventListener() {}, getElementById: (id) => (id === 'claude-balao' ? balao : null) } });
  // treino.js não é `node: true` (usa o DOM ao abrir a tela); o balaoQueSome só precisa do util e do balão
  Jogo.carregar(ctx, Jogo.scripts().concat(Jogo.manifesto.scripts.filter((s) => s.js === 'js/atividades/treino.js')));
  const R = ctx.Reino;
  function fechar() {
    if (!claude.aberto) return;
    claude.fechados.push(claude.aberto.texto); claude.aberto = null;
    if (claude.fila.length) claude.aberto = claude.fila.shift();
  }
  R.Claude = {
    falar(texto) { const it = { texto }; if (claude.aberto) claude.fila.push(it); else claude.aberto = it; return new Promise(() => {}); },
    aberto: () => !!claude.aberto, fechar, limpar() { claude.fila = []; fechar(); },
  };
  R.Voz = { falando: () => false };
  return {
    R, claude, intervalos,
    vivos: () => intervalos.filter((i) => i.vivo && i.ms === 200).length,
    // o relógio anda ms, chamando os intervalos vivos a cada 200 ms
    andar(ms) { for (let t = 0; t < ms; t += 200) { relogio.agora += 200; intervalos.forEach((i) => { if (i.vivo) i.fn(); }); } },
  };
}

test('balão descartado na fila (Claude.limpar): o intervalo termina', () => {
  const j = jogo(), texto = j.R.Falas.fixas.revisar;
  j.R.Claude.falar('Dica do Claude depois da sala.');   // a dica ainda aberta
  j.R.Prova.balaoQueSome(texto);
  assert.strictEqual(j.vivos(), 1);
  j.andar(3000);
  assert.strictEqual(j.claude.fila.length, 1, 'o "Hora de revisar!" está na fila');
  j.R.Claude.limpar();   // ela abriu uma questão da lista
  j.andar(5 * 60 * 1000);
  assert.strictEqual(j.vivos(), 0, 'o intervalo de 200 ms continua vivo depois de o balão ser descartado');
});

test('balão que aparece na hora some como antes (tempo de leitura) e o intervalo termina', () => {
  const j = jogo(), texto = j.R.Falas.fixas.revisar;
  const minimo = Math.min(9000, Math.max(4000, texto.length * 45));
  j.R.Prova.balaoQueSome(texto);
  j.andar(minimo - 400);
  assert.strictEqual(j.claude.aberto && j.claude.aberto.texto, texto, 'ainda aberto antes do tempo de leitura');
  j.andar(800);
  assert.deepStrictEqual(j.claude.fechados, [texto]);
  assert.strictEqual(j.vivos(), 0);
});

test('balão que espera na fila e aparece depois: o tempo conta só quando aparece', () => {
  const j = jogo(), texto = j.R.Falas.fixas.revisar;
  const minimo = Math.min(9000, Math.max(4000, texto.length * 45));
  j.R.Claude.falar('Dica do Claude depois da sala.');
  j.R.Prova.balaoQueSome(texto);
  j.andar(20000);
  j.R.Claude.fechar();   // ela fechou a dica: o "Hora de revisar!" aparece
  assert.strictEqual(j.claude.aberto.texto, texto);
  j.andar(minimo - 400);
  assert.strictEqual(j.claude.aberto && j.claude.aberto.texto, texto, 'ainda aberto antes do tempo de leitura');
  j.andar(800);
  assert.strictEqual(j.claude.aberto, null);
  assert.strictEqual(j.vivos(), 0);
});
