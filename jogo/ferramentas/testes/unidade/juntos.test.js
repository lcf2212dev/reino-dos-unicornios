// Jogar junto no jogo (docs/contratos/juntos.md §5, §6 e §10): o estado e a rede de sistemas/juntos.js num vm do
// Node, sem navegador e sem rede de verdade (fetch de mentira): quem não cria nem entra fica sozinho (sem pedido
// nenhum), criar/entrar pelo convite, a lista só do MEU servidor, o aceno e o recado de um envio só, o servidor que
// fecha, o modo congelado que não faz nada e o saiu do pagehide.
// Nada aqui toca o save real, o banco da Vercel nem o servidor de casa.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/juntos.test.js   (tudo: npm test)
const test = require('node:test');
const assert = require('node:assert');
const Jogo = require('../../jogo-no-node');

const ARQUIVOS = ['nucleo/config', 'nucleo/util', 'nucleo/eventos', 'nucleo/ambiente', 'nucleo/modulos', 'sistemas/juntos'];
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
async function ate(fn, ms = 3000) {
  const fim = Date.now() + ms;
  for (;;) { const v = await fn(); if (v) return v; if (Date.now() > fim) throw new Error('não aconteceu a tempo'); await espera(10); }
}
const jogador = (login, sala, nome, extra) => Object.assign({ login: login, servidor: 'ABCD', sala: sala, nome: nome, sexo: 'menina',
  x: 10, y: 20, olharX: 0, olharY: 1, aparencia: { pele: '#f1c7a5', cabelo: '#5a3825', roupa: '#ff7eb6', laco: '#ff4f9a' },
  visual: { corte: 'rabo', modelo: 'vestido' }, uni: null, acenoEm: 0, recado: '', recadoEm: 0 }, extra || {});

// um jogo com o módulo de verdade e um "reino" de mentira: servidores em memória, presença por servidor
function montar(op = {}) {
  const pedidos = [], ouvintes = {}, eventos = [], guardado = {};
  const servidores = op.servidores || {};     // codigo → { codigo, dono, nome }
  const membros = op.membros || [];           // o que /api/presenca devolve
  let statusPresenca = op.statusPresenca || 200, erroPresenca = op.erroPresenca || null;
  const estado = op.estado || { aparencia: { pele: '#f1c7a5', cabelo: '#5a3825', roupa: '#ff7eb6', laco: '#ff4f9a' }, unis: {}, corInicial: 'rosa' };
  const ctx = Jogo.contexto({
    console: console, Math: Math, JSON: JSON, Date: Date, Promise: Promise,
    setTimeout: setTimeout, clearTimeout: clearTimeout,
    performance: { now: () => Date.now() },
    navigator: { onLine: op.onLine !== false },
    location: { protocol: 'http:', search: op.search || '' },
    localStorage: { getItem: (k) => (k in guardado ? guardado[k] : null), setItem: (k, v) => { guardado[k] = String(v); } },
    document: { hidden: false, addEventListener(ev, fn) { (ouvintes['doc:' + ev] = ouvintes['doc:' + ev] || []).push(fn); } },
    AbortController: AbortController,
    addEventListener(ev, fn) { (ouvintes['win:' + ev] = ouvintes['win:' + ev] || []).push(fn); },
    removeEventListener() {},
    fetch: (url, o) => {
      const corpo = o && o.body ? JSON.parse(o.body) : null;
      const metodo = (o && o.method) || 'GET';
      pedidos.push({ url: url, metodo: metodo, corpo: corpo });
      const responder = (status, dados) => Promise.resolve({ status: status, ok: status >= 200 && status < 300, json: () => Promise.resolve(dados) });
      if (url.indexOf('api/juntos?codigo=') === 0) {
        const codigo = decodeURIComponent(url.split('codigo=')[1]);
        return servidores[codigo] ? responder(200, { servidor: servidores[codigo] }) : responder(404, { erro: 'servidor' });
      }
      if (url === 'api/juntos') {
        if (corpo && corpo.acao === 'criar') {
          const servidor = { codigo: 'NOVA', dono: corpo.login, nome: corpo.nome, criado: Date.now() };
          servidores.NOVA = servidor;
          return responder(201, { servidor: servidor });
        }
        const srv = servidores[corpo && corpo.codigo];
        if (!srv || srv.dono !== corpo.login) return responder(403, { erro: 'dono' });
        delete servidores[srv.codigo];
        return responder(200, { ok: true });
      }
      if (url === 'api/presenca') {
        if (statusPresenca !== 200) return responder(statusPresenca, erroPresenca || {});
        return responder(200, { agora: Date.now(), ttl: 15000, jogadores: membros });
      }
      return responder(404, {});
    },
  });
  Jogo.carregar(ctx, Jogo.scripts({ nomes: ARQUIVOS }));
  const R = ctx.Reino;
  R.Progresso = { jogador: () => op.login || 'ana', estado: () => estado, montaria: () => 'inicial' };
  R.Jogadores = { perfil: () => ({ nome: op.nome || 'Ana', sexo: 'menina' }) };
  R.Cena = { atual: () => ({ id: op.sala || 'mapa' }) };
  ctx.Jogador = { x: 100, y: 200, olharX: 0, olharY: 1, montado: () => false };
  R.util.on(R.EVENTOS.JUNTOS, (d) => eventos.push(d));
  R.config.juntos.intervaloMs = 30;
  R.config.juntos.intervaloParadoMs = 30;
  return { R, J: R.Juntos, pedidos, ouvintes, eventos, estado, ctx, guardado, servidores, setPresenca(s, e) { statusPresenca = s; erroPresenca = e || null; } };
}

test('juntos: quem não cria nem entra fica sozinho, sem pedido de rede nenhum', async () => {
  const j = montar();
  try {
    j.J.iniciar();
    await espera(120);
    assert.strictEqual(j.J.pode(), true, 'o ambiente aceita (http, fora do congelado)');
    assert.strictEqual(j.J.ligado(), false);
    assert.strictEqual(j.J.servidor(), null);
    assert.strictEqual(j.pedidos.length, 0, 'sozinho = como sempre foi');
  } finally { j.J.parar(); }
});

test('juntos: criar o servidor gera um código e começa a contar quem está nele', async () => {
  const j = montar({ membros: [jogador('ana', 'mapa', 'Ana'), jogador('bia', 'mapa', 'Bia'), jogador('caio', 'castelo', 'Caio')] });
  try {
    j.J.iniciar();
    assert.strictEqual(await j.J.criar(), true);
    const servidor = j.J.servidor();
    assert.strictEqual(servidor.codigo, 'NOVA');
    assert.strictEqual(servidor.dono, 'ana');
    assert.strictEqual(j.guardado['reino-juntos-servidor'], 'NOVA', 'o servidor fica lembrado neste aparelho');
    assert.deepStrictEqual(j.pedidos[0], { url: 'api/juntos', metodo: 'POST', corpo: { acao: 'criar', login: 'ana', nome: 'Ana' } });
    await ate(() => j.pedidos.some((p) => p.url === 'api/presenca'));
    const presenca = j.pedidos.find((p) => p.url === 'api/presenca');
    assert.strictEqual(presenca.corpo.servidor, 'NOVA');
    await ate(() => j.J.total() === 2);
    assert.deepStrictEqual(Array.from(j.J.outros(), (o) => o.login), ['bia'], 'só quem está no meu servidor e na minha sala');
    assert.deepStrictEqual(Array.from(j.J.todos(), (o) => o.login).sort(), ['bia', 'caio']);
    assert.strictEqual(j.J.nomeDaSala('mapa'), 'Reino');
    assert.ok(j.eventos.length >= 1, 'o evento JUNTOS avisa a tela');
  } finally { j.J.parar(); }
});

test('juntos: o convite (?servidor=ABCD) entra sozinho depois do login', async () => {
  const j = montar({ search: '?debug=1&servidor=ABCD', servidores: { ABCD: { codigo: 'ABCD', dono: 'bia', nome: 'Bia', criado: 1 } },
    membros: [jogador('ana', 'mapa', 'Ana'), jogador('bia', 'mapa', 'Bia')] });
  try {
    j.J.iniciar();
    await ate(() => j.J.ligado() && j.J.total() === 1);
    assert.deepEqual(j.J.servidor(), { codigo: 'ABCD', dono: 'bia', nome: 'Bia' });
    assert.strictEqual(j.J.dono(), false, 'quem entra não é o dono');
    assert.strictEqual(j.pedidos[0].url, 'api/juntos?codigo=ABCD');
    await ate(() => j.pedidos.some((p) => p.url === 'api/presenca'));
    assert.strictEqual(j.pedidos.find((p) => p.url === 'api/presenca').corpo.servidor, 'ABCD');
  } finally { j.J.parar(); }
});

test('juntos: código errado avisa e continua sozinho', async () => {
  const j = montar();
  try {
    j.J.iniciar();
    assert.strictEqual(await j.J.entrar('zzzz'), false);
    assert.strictEqual(j.J.servidor(), null);
    assert.ok(/não está aberto/.test(j.J.aviso()), 'aviso para a tela: ' + j.J.aviso());
    assert.strictEqual(j.J.ligado(), false);
  } finally { j.J.parar(); }
});

test('juntos: o servidor que fechou derruba a presença e avisa', async () => {
  const j = montar({ search: '?servidor=ABCD', servidores: { ABCD: { codigo: 'ABCD', dono: 'ana', nome: 'Ana', criado: 1 } },
    membros: [jogador('ana', 'mapa', 'Ana'), jogador('bia', 'mapa', 'Bia')] });
  try {
    j.J.iniciar();
    await ate(() => j.J.total() === 1);
    j.setPresenca(404, { erro: 'servidor' });
    await ate(() => !j.J.ligado());
    assert.strictEqual(j.J.servidor(), null);
    assert.ok(/fechou/.test(j.J.aviso()));
    assert.strictEqual(j.guardado['reino-juntos-servidor'], '', 'não volta para um servidor que fechou');
  } finally { j.J.parar(); }
});

test('juntos: aceno e recado saem UMA vez e o relógio continua mandando a posição', async () => {
  const j = montar({ search: '?servidor=ABCD', servidores: { ABCD: { codigo: 'ABCD', dono: 'ana', nome: 'Ana', criado: 1 } },
    membros: [jogador('ana', 'mapa', 'Ana'), jogador('bia', 'mapa', 'Bia')] });
  try {
    j.J.iniciar();
    await ate(() => j.pedidos.filter((p) => p.url === 'api/presenca').length >= 2);
    j.J.acenar();
    await ate(() => j.pedidos.some((p) => p.corpo && p.corpo.aceno === true));
    await espera(80);
    assert.strictEqual(j.pedidos.filter((p) => p.corpo && p.corpo.aceno === true).length, 1, 'aceno em um envio só');
    j.J.recado('oi');
    await ate(() => j.pedidos.some((p) => p.corpo && p.corpo.recado === 'oi'));
    await espera(80);
    assert.strictEqual(j.pedidos.filter((p) => p.corpo && p.corpo.recado === 'oi').length, 1, 'o recado não repete');
  } finally { j.J.parar(); }
});

test('juntos: sair do servidor para a presença e esquece o código', async () => {
  const j = montar({ search: '?servidor=ABCD', servidores: { ABCD: { codigo: 'ABCD', dono: 'ana', nome: 'Ana', criado: 1 } }, membros: [jogador('bia', 'mapa', 'Bia')] });
  try {
    j.J.iniciar();
    await ate(() => j.J.total() === 1);
    await j.J.sair();
    assert.strictEqual(j.J.servidor(), null);
    assert.strictEqual(j.J.ligado(), false);
    assert.strictEqual(j.guardado['reino-juntos-servidor'], '');
    assert.ok(j.pedidos.some((p) => p.corpo && p.corpo.saiu === true), 'avisa o reino na hora');
    const n = j.pedidos.length;
    await espera(80);
    assert.strictEqual(j.pedidos.length, n, 'parou de pedir');
  } finally { j.J.parar(); }
});

test('juntos: no modo congelado não faz NADA (nem um pedido)', async () => {
  const j = montar({ search: '?servidor=ABCD', servidores: { ABCD: { codigo: 'ABCD', dono: 'ana', nome: 'Ana', criado: 1 } } });
  j.R.congelado = true;
  try {
    j.J.iniciar();
    await espera(120);
    assert.strictEqual(j.pedidos.length, 0);
    assert.strictEqual(j.J.pode(), false);
  } finally { j.J.parar(); }
});

test('juntos: sair da página apaga a linha na hora (saiu: true, keepalive)', async () => {
  const j = montar({ search: '?servidor=ABCD', servidores: { ABCD: { codigo: 'ABCD', dono: 'ana', nome: 'Ana', criado: 1 } }, membros: [jogador('bia', 'mapa', 'Bia')] });
  try {
    j.J.iniciar();
    await ate(() => j.J.total() === 1);
    (j.ouvintes['win:pagehide'] || []).forEach((fn) => fn({ persisted: false }));
    assert.strictEqual(j.J.ligado(), false);
    const saiu = j.pedidos.filter((p) => p.corpo && p.corpo.saiu === true);
    assert.strictEqual(saiu.length, 1);
    assert.strictEqual(saiu[0].corpo.servidor, 'ABCD');
  } finally { j.J.parar(); }
});
