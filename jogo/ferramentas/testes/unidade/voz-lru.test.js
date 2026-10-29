// Reino.Voz: teto dos pacotes na memória (LRU por pacote) e o pacote que volta quando uma fala dele é pedida.
// Roda o js/sistemas/voz.js num vm com um document de mentira: cada <script src="js/voz/<nome>.js"> "chega" num
// setTimeout e chama Reino.Voz.registrar com o mapa do pacote de PACOTES.
// Uso: node --test jogo/ferramentas/testes/unidade/voz-lru.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const FONTE = fs.readFileSync(path.join(__dirname, '../../../js/sistemas/voz.js'), 'utf8');
const b64 = (n) => Buffer.alloc(Math.ceil(n * 3 / 4)).toString('base64').slice(0, n);

// textos: { pacote: [texto, …] } (voz claude); tamanho: letras de base64 de cada fala
function montar(textos, op = {}) {
  const pedidos = [];   // nome de cada <script> pedido, na ordem
  const head = {
    filhos: [],
    appendChild(s) {
      s.parentNode = head; head.filhos.push(s);
      const nome = s.src.replace(/^js\/voz\//, '').replace(/\.js.*$/, '');
      pedidos.push(nome);
      if (op.nunca && op.nunca.includes(nome)) return;   // fica pendurado (rede parada)
      setTimeout(() => {
        const mapa = pacotes[nome];
        if (mapa) ctx.Reino.Voz.registrar(nome, mapa);
        (mapa ? s.onload : s.onerror)();
      }, (op.demoras && op.demoras[nome]) || op.demora || 1);
    },
    removeChild(s) { head.filhos = head.filhos.filter((x) => x !== s); s.parentNode = null; },
  };
  const fakeAc = {
    state: 'running',
    decodeAudioData(buf, ok) { setTimeout(() => ok({ length: 10, numberOfChannels: 1 }), 0); },
    createBufferSource() {
      return { connect() {}, stop() {}, start() { setTimeout(() => this.onended && this.onended(), 0); } };
    },
  };
  const ctx = {
    console, Promise, setTimeout, clearTimeout, atob: (s) => Buffer.from(s, 'base64').toString('binary'),
    Uint8Array, Map, Date, Math, Object, Array, String,
    document: { createElement: () => ({}), head },
    Reino: {
      config: { vozes: {} }, congelado: !!op.congelado,
      Som: { contexto: () => fakeAc, saidaVoz: () => ({}), abaixarEfeitos() {} },
      Falas: op.todas ? { todas: op.todas } : undefined,
      interiores: op.interiores, materia: op.materia, materias: op.materias,
      Cena: { atual: () => ({ def: op.cena ? { pacote: op.cena() } : undefined }) },
      Progresso: op.unis ? { estado: () => ({ unis: op.unis }) } : undefined,
    },
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(FONTE, ctx);
  const V = ctx.Reino.Voz;
  const pacotes = {};
  Object.keys(textos).forEach((p) => {
    pacotes[p] = {};
    textos[p].forEach((t) => { pacotes[p][V.chave('claude', t)] = b64(op.tamanho || 100); });
  });
  if (op.teto) V.tetoPacotes = op.teto;
  return { V, pedidos, head, ctx };
}
const guardados = (V) => Array.from(V.memoriaPacotes().pacotes);
const tags = (head) => head.filhos.map((s) => s.src.replace(/^js\/voz\//, '').replace(/\.js.*$/, '')).sort();

test('passou do teto: sai o pacote usado há mais tempo, e a tag dele', async () => {
  const { V, head } = montar({ geral: ['oi'], a: ['fala a'], b: ['fala b'], c: ['fala c'] }, { teto: 300 });
  await V.carregarVarios(['geral', 'a']);
  await V.carregar('b');
  assert.deepStrictEqual(guardados(V), ['a', 'b', 'geral']);
  await V.carregar('a');   // usar de novo: 'a' passa a ser o mais recente
  await V.carregar('c');
  assert.deepStrictEqual(guardados(V), ['a', 'c', 'geral']);
  assert.deepStrictEqual(tags(head), ['a', 'c', 'geral']);
  assert.strictEqual(V.memoriaPacotes().bytes, 300);
  assert.strictEqual(V.tem('claude', 'fala b'), false, 'V.tem: só o que está na memória');
  assert.strictEqual(V.falarEsperando('fala b').espera, true, 'mas a fala espera o pacote que saiu voltar');
});

test('o geral, o prédio da cena atual e o que acabou de chegar nunca saem', async () => {
  let cena = 'interior-x';
  const { V } = montar({ geral: ['oi'], 'interior-x': ['no prédio'], 'interior-y': ['outro'], a: ['fala a'], b: ['fala b'] },
    { teto: 150, cena: () => cena });
  await V.carregar('geral');
  await V.carregar('interior-x');
  await V.carregar('interior-y');   // pedido (íris) mas a cena ainda é o x: o y sai quando chega outro
  await V.carregar('a');
  await V.carregar('b');
  assert.deepStrictEqual(guardados(V), ['b', 'geral', 'interior-x']);
  cena = null;                      // de volta ao mapa: o prédio pode sair
  await V.carregar('a');
  assert.deepStrictEqual(guardados(V), ['a', 'geral']);
});

test('fala de um pacote que saiu: ele volta pela tag e a fala toca', async () => {
  const { V, pedidos } = montar({ geral: ['oi'], a: ['fala a'], b: ['fala b'] }, { teto: 200 });
  await V.carregarVarios(['geral', 'a']);
  await V.carregar('b');
  assert.ok(!guardados(V).includes('a'));
  await V.falar('fala a');
  assert.deepStrictEqual(Array.from(V.faltando), []);
  assert.ok(guardados(V).includes('a'));
  assert.strictEqual(pedidos.filter((n) => n === 'a').length, 2);
});

test('fala pedida durante a recarga espera o mesmo pedido (uma tag só)', async () => {
  const { V, pedidos } = montar({ geral: ['oi'], a: ['fala a'], b: ['fala b'] }, { teto: 200, demora: 20 });
  await V.carregarVarios(['geral', 'a']);
  await V.carregar('b');
  const volta = V.carregar('a');   // recarga em curso
  const fala = V.falar('fala a');
  await Promise.all([volta, fala]);
  assert.deepStrictEqual(Array.from(V.faltando), []);
  assert.strictEqual(pedidos.filter((n) => n === 'a').length, 2);
});

test('pacote ainda chegando não sai; fala que outra cortou não toca atrasada', async () => {
  const { V } = montar({ geral: ['oi'], a: ['fala a'], b: ['fala b'] }, { teto: 150, demora: 20 });
  await V.carregar('geral');
  const pa = V.carregar('a'), pb = V.carregar('b');
  await Promise.all([pa, pb]);
  assert.deepStrictEqual(guardados(V), ['b', 'geral']);   // 'a' chegou primeiro e saiu quando 'b' chegou
  const f1 = V.falar('fala a');   // vai pedir 'a' de novo
  V.calar();                      // outra fala cortou
  await f1;
  assert.deepStrictEqual(Array.from(V.faltando), []);
});

test('a mesma fala em dois pacotes: sair de um não apaga o áudio', async () => {
  const { V } = montar({ geral: ['oi'], a: ['comum', 'só a'], b: ['comum'], c: ['fala c'] }, { teto: 350 });
  await V.carregarVarios(['geral', 'a']);
  await V.carregar('b');
  await V.carregar('c');
  assert.deepStrictEqual(guardados(V), ['b', 'c', 'geral']);
  assert.strictEqual(V.memoriaPacotes().falas, 3);   // oi, comum, fala c
});

test('modo congelado (testes): nada sai', async () => {
  const { V } = montar({ geral: ['oi'], a: ['fala a'], b: ['fala b'] }, { teto: 150, congelado: true });
  await V.carregarVarios(['geral', 'a', 'b']);
  assert.deepStrictEqual(guardados(V), ['a', 'b', 'geral']);
});

test('<matéria>-extra que ainda não veio: achado por Falas.todas e carregado na fala', async () => {
  let vezes = 0;
  const todas = () => { vezes++; return [{ texto: 'Oi, eu sou o guia!', voz: 'claude', pacote: 'm-extra' }, { texto: 'oi', voz: 'claude', pacote: 'geral' }]; };
  const { V, pedidos } = montar({ geral: ['oi'], 'm-extra': ['Oi, eu sou o guia!'] }, { todas });
  await V.carregar('geral');
  assert.strictEqual(V.falarEsperando('Oi, eu sou o guia!').espera, true);
  await V.falar('Oi, eu sou o guia!');
  assert.deepStrictEqual(Array.from(V.faltando), []);
  assert.ok(pedidos.includes('m-extra'));
  await V.falar('sem gravação nenhuma');
  assert.deepStrictEqual(Array.from(V.faltando), ['claude: sem gravação nenhuma']);
  assert.strictEqual(vezes, 1, 'o índice é montado uma vez só');
});

test('sala e treino trazem o <matéria>-extra; o prédio da matéria também', async () => {
  const { V, pedidos } = montar({ 'm-extra': ['x'], 'm-s1': ['y'], 'm-s2': ['z'], 'interior-m': ['w'], 'n-extra': ['v'] }, {
    interiores: [{ pacote: 'interior-m', npcs: [{ acao: { materia: 'm' } }], objetos: [{ acao: { materia: 'n' } }] }],
    materia: (id) => ({ id, arquivada: id === 'n' }),
  });
  await V.carregarSala({ id: 'm' }, { id: 's1' });
  assert.deepStrictEqual(pedidos.slice().sort(), ['m-extra', 'm-s1']);
  await V.carregarMateria({ id: 'm', salas: [{ id: 's1' }, { id: 's2' }] });
  assert.ok(pedidos.includes('m-s2'));
  const { V: V2, pedidos: p2 } = montar({ 'm-extra': ['x'], 'interior-m': ['w'], 'n-extra': ['v'] }, {
    interiores: [{ pacote: 'interior-m', npcs: [{ acao: { materia: 'm' } }], objetos: [{ acao: { materia: 'n' } }] }],
    materia: (id) => ({ id, arquivada: id === 'n' }),
  });
  await V2.carregar('interior-m');
  await new Promise((r) => setTimeout(r, 20));
  assert.deepStrictEqual(p2, ['interior-m', 'm-extra'], 'matéria arquivada (n) não vem com o prédio');
});

test('carregarSala espera só a sala; o -extra vem por trás e a fala o espera', async () => {
  const todas = () => [{ texto: 'Sala da lua', voz: 'claude', pacote: 'm-extra' }];
  const { V, pedidos } = montar({ 'm-extra': ['Sala da lua'], 'm-s1': ['pergunta'] }, { todas, demoras: { 'm-extra': 60, 'm-s1': 1 } });
  let extraVeio = null;
  await V.carregarSala({ id: 'm' }, { id: 's1' }).then(() => { extraVeio = guardados(V).includes('m-extra'); });
  assert.strictEqual(extraVeio, false, 'não esperou o -extra');
  assert.deepStrictEqual(pedidos, ['m-s1', 'm-extra']);
  await V.falar('Sala da lua');
  assert.deepStrictEqual(Array.from(V.faltando), []);
});

test('falar pede já os pacotes de todos os pedaços que faltam; V.tem só conta o que está na memória', async () => {
  const todas = () => [{ texto: 'um', voz: 'claude', pacote: 'a-extra' }, { texto: 'dois', voz: 'claude', pacote: 'b-extra' }];
  const { V, pedidos } = montar({ 'a-extra': ['um'], 'b-extra': ['dois'] }, { todas, demora: 30 });
  assert.strictEqual(V.tem('claude', 'dois'), false);
  const fala = V.falar(['um', 'dois']);
  await new Promise((r) => setTimeout(r, 5));
  assert.deepStrictEqual(pedidos, ['a-extra', 'b-extra'], 'os dois pedidos de uma vez');
  await fala;
  assert.deepStrictEqual(Array.from(V.faltando), []);
  assert.strictEqual(V.tem('claude', 'dois'), true);
});

test('carregarUnicornios: os -extra das matérias dos unicórnios (os dela, sem ids); o Estábulo também', async () => {
  const materias = [{ id: 'a', unicornios: [{ id: 'a-1' }] }, { id: 'b', unicornios: [{ id: 'b-1' }] }, { id: 'c', unicornios: [{ id: 'c-1' }] }];
  const textos = { 'a-extra': ['x'], 'b-extra': ['y'], 'c-extra': ['z'], 'interior-estabulo': ['w'] };
  const um = montar(textos, { materias, unis: { 'a-1': {}, 'c-1': {} } });
  await um.V.carregarUnicornios(['b-1']);
  assert.deepStrictEqual(um.pedidos, ['b-extra']);
  await um.V.carregarUnicornios();
  assert.deepStrictEqual(um.pedidos, ['b-extra', 'a-extra', 'c-extra']);
  const dois = montar(textos, { materias, unis: { 'b-1': {} }, interiores: [{ pacote: 'interior-estabulo', objetos: [{ acao: { tipo: 'unicornio' } }] }] });
  await dois.V.carregar('interior-estabulo');
  await new Promise((r) => setTimeout(r, 20));
  assert.deepStrictEqual(dois.pedidos, ['interior-estabulo', 'b-extra']);
});

test('um prazo só por fala: dois pedaços de um pacote que não chega não somam a espera', async () => {
  const todas = () => [{ texto: 'um', voz: 'claude', pacote: 'a-extra' }, { texto: 'dois', voz: 'claude', pacote: 'a-extra' }];
  const { V } = montar({ 'a-extra': ['um', 'dois'] }, { todas, nunca: ['a-extra'] });
  const t0 = Date.now();
  await V.falar(['um', 'dois']);
  const ms = Date.now() - t0;
  assert.ok(ms >= 3900 && ms < 6000, 'esperou ' + ms + ' ms (um prazo de 4 s, não dois)');
  assert.deepStrictEqual(Array.from(V.faltando), ['claude: um', 'claude: dois']);
});

test('adiantarExtras: só o -extra das matérias em uso; o prédio pede o -extra junto, não em fila', async () => {
  const materias = [{ id: 'a', arquivada: true }, { id: 'b' }];
  const um = montar({ 'a-extra': ['x'], 'b-extra': ['y'] }, { materias });
  await um.V.adiantarExtras();
  assert.deepStrictEqual(um.pedidos, ['b-extra']);
  const dois = montar({ 'b-extra': ['y'], 'interior-b': ['z'] }, {
    interiores: [{ pacote: 'interior-b', npcs: [{ acao: { materia: 'b' } }] }], materia: (id) => ({ id }), demora: 30 });
  dois.V.carregar('interior-b');
  assert.deepStrictEqual(dois.pedidos, ['interior-b', 'b-extra'], 'os dois pedidos antes do prédio chegar');
  await new Promise((r) => setTimeout(r, 60));
});
