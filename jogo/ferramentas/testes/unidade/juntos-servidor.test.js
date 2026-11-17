// Jogar juntos no servidor (docs/contratos/juntos.md §2, §3 e §10): as regras de vercel/lib/presenca.js (o que entra,
// o que é recusado, os limites, a lista) e a rota /api/presenca com um banco de mentira (require.cache), sem Neon e
// sem rede: nada aqui toca o banco da Vercel nem o progresso de ninguém.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/juntos-servidor.test.js   (tudo: npm test)
const test = require('node:test');
const assert = require('node:assert');
const path = require('path');

const RAIZ = path.join(__dirname, '..', '..', '..', '..');
const p = require(path.join(RAIZ, 'vercel', 'lib', 'presenca.js'));
const l = require(path.join(RAIZ, 'vercel', 'lib', 'juntos.js'));

const AGORA = 1760000000000;
const bom = () => ({
  login: 'ana', servidor: '', sala: 'mapa', x: 100.4, y: 220.6, olharX: 0, olharY: -1, nome: 'Ana', sexo: 'menina',
  aparencia: { pele: '#f1c7a5', cabelo: '#5a3825', roupa: '#ff7eb6', laco: '#ff4f9a' },
  visual: { corte: 'rabo', modelo: 'vestido', semLaco: false },
  uni: { id: 'inicial', estagio: 2, cores: { corpo: '#ffd1e6', crina: ['#ff7eb6', '#ffd34d', '#9b7bff'], chifre: '#ffd34d' } },
});

test('presença: o corpo do jogo vira um registro só com o que o desenho usa', () => {
  const m = p.montar(bom(), AGORA);
  assert.strictEqual(m.login, 'ana');
  assert.strictEqual(m.dados.sala, 'mapa');
  assert.strictEqual(m.dados.x, 100.4);
  assert.strictEqual(m.dados.y, 220.6);
  assert.deepStrictEqual(m.dados.aparencia, { pele: '#f1c7a5', cabelo: '#5a3825', roupa: '#ff7eb6', laco: '#ff4f9a' });
  assert.deepStrictEqual(m.dados.uni, bom().uni);
  assert.strictEqual(m.dados.acenoEm, 0, 'sem aceno: sem carimbo');
  assert.strictEqual(m.dados.recado, '');
});

test('presença: recusa o que não é do jogo (nada é gravado)', () => {
  assert.strictEqual(p.montar(null, AGORA), null);
  assert.strictEqual(p.montar([], AGORA), null);
  assert.strictEqual(p.montar('texto', AGORA), null);
  assert.strictEqual(p.montar(Object.assign(bom(), { login: 'A' }), AGORA), null, 'login curto');
  assert.strictEqual(p.montar(Object.assign(bom(), { login: 'mariana!' }), AGORA), null, 'login com símbolo');
  assert.strictEqual(p.montar(Object.assign(bom(), { login: '__proto__' }), AGORA), null, 'nome do Object.prototype');
  assert.strictEqual(p.montar(Object.assign(bom(), { sala: 'mapa/../x' }), AGORA), null, 'sala torta');
  assert.strictEqual(p.montar(Object.assign(bom(), { sala: '' }), AGORA), null, 'sala vazia');
  assert.strictEqual(p.montar(Object.assign(bom(), { x: NaN }), AGORA), null, 'x não é número');
  assert.strictEqual(p.montar(Object.assign(bom(), { y: '10' }), AGORA), null, 'y em texto');
});

test('presença: campos tortos caem no padrão em vez de derrubar (cores, nome, olhar)', () => {
  const m = p.montar(Object.assign(bom(), {
    x: -50, y: 1e9, olharX: 5, olharY: 'x', nome: '  Ana\nBeatriz  ', sexo: 'outro',
    aparencia: { pele: 'rosa', cabelo: '#000000', roupa: null }, visual: { corte: 'Corte!', modelo: 'vestido' },
  }), AGORA);
  assert.strictEqual(m.dados.x, 0, 'x preso no 0');
  assert.strictEqual(m.dados.y, 100000, 'y preso no teto');
  assert.strictEqual(m.dados.olharX, 1);
  assert.strictEqual(m.dados.olharY, 1, 'olhar inválido vira 1 (para baixo)');
  assert.strictEqual(m.dados.nome, 'AnaBeatriz', 'sem controle e sem espaço nas pontas');
  assert.strictEqual(m.dados.sexo, 'menina');
  assert.deepStrictEqual(m.dados.aparencia, { pele: p.montar(bom(), AGORA).dados.aparencia.pele, cabelo: '#000000', roupa: p.montar(bom(), AGORA).dados.aparencia.roupa, laco: p.montar(bom(), AGORA).dados.aparencia.laco });
  assert.strictEqual(m.dados.visual.corte, '', 'corte desconhecido = o padrão do sexo');
  assert.strictEqual(m.dados.visual.modelo, 'vestido');
  // 'saiaBlusa' é um modelo de verdade (PA.MODELOS): o camelCase do jogo não pode ser recusado
  assert.deepStrictEqual(p.montar(Object.assign(bom(), { visual: { corte: 'rabo', modelo: 'saiaBlusa' } }), AGORA).dados.visual,
    { corte: 'rabo', modelo: 'saiaBlusa', semLaco: false });
});

test('presença: nome vazio vira o login; nome comprido corta em 20', () => {
  assert.strictEqual(p.montar(Object.assign(bom(), { nome: '' }), AGORA).dados.nome, 'ana');
  assert.strictEqual(p.montar(Object.assign(bom(), { nome: 'x'.repeat(60) }), AGORA).dados.nome.length, 20);
});

test('presença: unicórnio só com id, estágio 0–3 e as 3 cores certas; o resto vira "a pé"', () => {
  const m = p.montar(bom(), AGORA);
  assert.deepStrictEqual(m.dados.uni, { id: 'inicial', estagio: 2, cores: { corpo: '#ffd1e6', crina: ['#ff7eb6', '#ffd34d', '#9b7bff'], chifre: '#ffd34d' } });
  const torto = (uni) => p.montar(Object.assign(bom(), { uni: uni }), AGORA).dados.uni;
  assert.strictEqual(torto(null), null);
  assert.strictEqual(torto({ id: 'x' }), null, 'sem cores');
  assert.strictEqual(torto({ id: 'x', estagio: 1, cores: { corpo: 'rosa', crina: ['#ff7eb6'], chifre: '#ffd34d' } }), null, 'cor torta');
  assert.strictEqual(torto({ id: 'x', estagio: 1, cores: { corpo: '#ffffff', crina: [], chifre: '#ffd34d' } }), null, 'sem crina');
  assert.strictEqual(torto({ id: 'a b', estagio: 1, cores: { corpo: '#ffffff', crina: ['#ffffff'], chifre: '#ffd34d' } }), null, 'id torto');
  const e = torto({ id: 'x', estagio: 9, cores: { corpo: '#ffffff', crina: ['#ffffff'], chifre: '#ffd34d' } });
  assert.strictEqual(e.estagio, 3, 'estágio preso no 3');
});

test('presença: aceno e recado são carimbados pelo relógio do servidor, e só os 4 recados valem', () => {
  const m = p.montar(Object.assign(bom(), { aceno: true, recado: 'oi' }), AGORA);
  assert.strictEqual(m.dados.acenoEm, AGORA);
  assert.strictEqual(m.dados.recado, 'oi');
  assert.strictEqual(m.dados.recadoEm, AGORA);
  const t = p.montar(Object.assign(bom(), { recado: 'xingamento' }), AGORA);
  assert.strictEqual(t.dados.recado, '');
  assert.strictEqual(t.dados.recadoEm, 0);
});

test('presença: saiu = só o login (para apagar a linha), sem exigir o resto', () => {
  assert.deepStrictEqual(p.montar({ login: 'ana', saiu: true }, AGORA), { saiu: true, login: 'ana', servidor: '' });
  assert.deepStrictEqual(p.montar({ login: 'ana', servidor: 'abcd', saiu: true }, AGORA), { saiu: true, login: 'ana', servidor: 'ABCD' });
  assert.strictEqual(p.montar({ login: 'ana', saiu: true, sala: 'x/y' }, AGORA).saiu, true);
});

test('presença: a lista só tem quem está na janela, sem repetir e com o teto', () => {
  const linha = (login, visto, extra) => ({ visto: visto, dados: JSON.stringify(Object.assign(p.montar(Object.assign(bom(), { login: login }), AGORA).dados, extra || {})) });
  const velho = linha('velho', AGORA - p.TTL_MS - 1);
  const agora = linha('ana', AGORA);
  const repetido = linha('ana', AGORA);
  const estragado = { visto: AGORA, dados: '{nada' };
  const lista = p.lista([velho, agora, repetido, estragado], AGORA);
  assert.deepStrictEqual(lista.map((j) => j.login), ['ana']);
  const muitas = [];
  for (let i = 0; i < 40; i++) muitas.push(linha('j' + i, AGORA - i));
  assert.strictEqual(p.lista(muitas, AGORA).length, p.MAX);
});

test('rota /api/presenca: sem servidor fica sozinho (sem banco); com servidor, grava nele e devolve a lista dele', async () => {
  const pathBanco = require.resolve(path.join(RAIZ, 'vercel', 'lib', 'banco.js'));
  const guardado = new Map(), chamadas = [];
  let corpoDoPedido = null, listaDoBanco = [], vivo = true;
  const bancoFalso = {
    cabecalhos() {},
    json(res, status, d) { res.statusCode = status; res.json = d; res.end(); },
    lerCorpo() { return Promise.resolve(corpoDoPedido); },
    async lerPresenca(servidor) { chamadas.push(['ler', servidor]); return servidor ? listaDoBanco : []; },
    async gravarPresenca(login, servidor, dados) { chamadas.push(['gravar', login, servidor]); guardado.set(login, dados); return listaDoBanco; },
    async sairPresenca(login) { chamadas.push(['sair', login]); guardado.delete(login); },
    async tocarJuntos(codigo) { chamadas.push(['tocar', codigo]); return vivo; },
  };
  require.cache[pathBanco] = { id: pathBanco, filename: pathBanco, loaded: true, exports: bancoFalso };
  try {
    const rota = require(path.join(RAIZ, 'vercel', 'api', 'presenca.js'));
    const resposta = () => { const r = { statusCode: 200, headers: {}, setHeader(k, v) { this.headers[k] = v; }, end() { this.fim = true; } }; return r; };
    const pedir = async (metodo, corpo) => { corpoDoPedido = corpo === undefined ? null : JSON.stringify(corpo); const res = resposta(); await rota({ method: metodo, url: '/api/presenca' }, res); return res; };

    const sozinho = await pedir('POST', bom());
    assert.strictEqual(sozinho.statusCode, 200);
    assert.deepStrictEqual(sozinho.json.jogadores, [], 'sem servidor não vê ninguém');
    assert.deepStrictEqual(chamadas, [], 'e não toca no banco');

    listaDoBanco = [p.montar(bom(), AGORA).dados];
    const comServidor = await pedir('POST', Object.assign(bom(), { servidor: 'abcd' }));
    assert.strictEqual(comServidor.statusCode, 200);
    assert.deepStrictEqual(chamadas[chamadas.length - 1], ['gravar', 'ana', 'ABCD']);
    assert.strictEqual(comServidor.json.jogadores.length, 1);

    vivo = false;
    const fechou = await pedir('POST', Object.assign(bom(), { servidor: 'ABCD' }));
    assert.strictEqual(fechou.statusCode, 404);
    assert.strictEqual(fechou.json.erro, 'servidor');

    const saiu = await pedir('POST', { login: 'ana', servidor: 'ABCD', saiu: true });
    assert.strictEqual(saiu.statusCode, 200);
    assert.ok(chamadas.some((c) => c[0] === 'sair' && c[1] === 'ana'), 'apagou a linha de quem saiu');
    assert.ok(chamadas.some((c) => c[0] === 'ler' && c[1] === 'ABCD'), 'devolveu a lista do servidor');

    vivo = true;
    const g = await pedir('GET');
    assert.strictEqual(g.statusCode, 200);
    assert.strictEqual(g.json.ttl, p.TTL_MS);

    for (const corpo of [null, {}, Object.assign(bom(), { login: 'A' }), Object.assign(bom(), { sala: '' }), Object.assign(bom(), { servidor: 'abc' })]) {
      const r = await pedir('POST', corpo);
      assert.strictEqual(r.statusCode, 400, 'corpo recusado: ' + JSON.stringify(corpo));
    }
    const apagar = await pedir('DELETE');
    assert.strictEqual(apagar.statusCode, 405);
  } finally {
    delete require.cache[pathBanco];
  }
});

test('código do servidor: 4 letras sem I, O, 0 e 1; normaliza o que a pessoa digita', () => {
  assert.strictEqual(l.novoCodigo(() => 0), 'AAAA');
  assert.strictEqual(l.novoCodigo(() => 0.999999), '9999');
  assert.ok(!/[IO01]/.test(l.novoCodigo(() => 0.5)), 'sem letras que confundem');
  assert.strictEqual(l.normalizar('ab-cd'), 'ABCD');
  assert.strictEqual(l.normalizar('  a b c d  '), 'ABCD');
  assert.strictEqual(l.normalizar('ABCDE'), 'ABCDE', 'o corte de 4 é do cliente; o servidor recusa o resto');
  assert.strictEqual(l.valido('ABCD'), true);
  assert.strictEqual(l.valido('ABCDE'), false);
  assert.strictEqual(l.valido('AB1D'), false, '1 não existe no alfabeto');
  assert.strictEqual(l.valido(''), false);
});

test('pedido de servidor: criar e fechar, com login e código válidos', () => {
  assert.deepStrictEqual(l.lerPedido({ acao: 'criar', login: 'ana', nome: 'Ana' }), { acao: 'criar', login: 'ana', nome: 'Ana', codigo: '' });
  assert.deepStrictEqual(l.lerPedido({ acao: 'fechar', login: 'ana', codigo: 'abcd' }), { acao: 'fechar', login: 'ana', nome: 'ana', codigo: 'ABCD' });
  assert.strictEqual(l.lerPedido({ acao: 'fechar', login: 'ana', codigo: 'abc' }), null, 'fechar exige o código');
  assert.strictEqual(l.lerPedido({ acao: 'x', login: 'ana' }), null);
  assert.strictEqual(l.lerPedido({ acao: 'criar', login: 'A' }), null);
  assert.strictEqual(l.lerPedido(null), null);
});

test('rota /api/juntos: criar, conferir o convite, fechar (só o dono) e o que é recusado', async () => {
  const pathBanco = require.resolve(path.join(RAIZ, 'vercel', 'lib', 'banco.js'));
  const servidores = {}, chamadas = [];
  let corpoDoPedido = null;
  const bancoFalso = {
    cabecalhos() {},
    json(res, status, d) { res.statusCode = status; res.json = d; res.end(); },
    lerCorpo() { return Promise.resolve(corpoDoPedido); },
    async criarJuntos(login, nome) { chamadas.push(['criar', login]); const s = { codigo: 'ABCD', dono: login, nome: nome, criado: AGORA }; servidores.ABCD = s; return s; },
    async lerJuntos(codigo) { return servidores[codigo] || null; },
    async tocarJuntos(codigo) { return !!servidores[codigo]; },
    async fecharJuntos(login, codigo) { chamadas.push(['fechar', login, codigo]); const s = servidores[codigo]; if (!s || s.dono !== login) return false; delete servidores[codigo]; return true; },
  };
  require.cache[pathBanco] = { id: pathBanco, filename: pathBanco, loaded: true, exports: bancoFalso };
  try {
    const rota = require(path.join(RAIZ, 'vercel', 'api', 'juntos.js'));
    const resposta = () => { const r = { statusCode: 200, setHeader() {}, end() { this.fim = true; } }; return r; };
    const pedir = async (metodo, corpo, url) => { corpoDoPedido = corpo === undefined ? null : JSON.stringify(corpo); const res = resposta(); await rota({ method: metodo, url: url || '/api/juntos' }, res); return res; };

    const criado = await pedir('POST', { acao: 'criar', login: 'ana', nome: 'Ana' });
    assert.strictEqual(criado.statusCode, 201);
    assert.deepStrictEqual(criado.json.servidor, { codigo: 'ABCD', dono: 'ana', nome: 'Ana', criado: AGORA });
    assert.deepStrictEqual(chamadas[0], ['criar', 'ana']);

    const convite = await pedir('GET', undefined, '/api/juntos?codigo=abcd');
    assert.strictEqual(convite.statusCode, 200);
    assert.strictEqual(convite.json.servidor.codigo, 'ABCD');

    const outro = await pedir('POST', { acao: 'fechar', login: 'bia', codigo: 'ABCD' });
    assert.strictEqual(outro.statusCode, 403, 'só o dono fecha');
    const dono = await pedir('POST', { acao: 'fechar', login: 'ana', codigo: 'ABCD' });
    assert.strictEqual(dono.statusCode, 200);

    const sumiu = await pedir('GET', undefined, '/api/juntos?codigo=ABCD');
    assert.strictEqual(sumiu.statusCode, 404);

    assert.strictEqual((await pedir('POST', { acao: 'criar', login: 'A' })).statusCode, 400);
    assert.strictEqual((await pedir('GET', undefined, '/api/juntos?codigo=ab')).statusCode, 400);
    assert.strictEqual((await pedir('DELETE')).statusCode, 405);
  } finally {
    delete require.cache[pathBanco];
  }
});
