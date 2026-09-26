// Ajudante dos testes de unidade do save, dos cuidados e do banho (não é teste: não termina em .test.js).
// montar() põe um jogo inteiro (config, unicórnios, matérias, provas, progresso e cuidados, pelo manifesto,
// com ferramentas/jogo-no-node.js) num vm com localStorage, relógio, timers e document de mentira.
// Saves 100% sintéticos (valores inventados); nada aqui toca no save real nem na rede.
// Usado por testes/unidade/save-*.test.js, cuidados-*.test.js e banho*.test.js.
const path = require('path');
const vm = require('vm');
const Jogo = require('../../../jogo-no-node');

/* ---------- um jogo inteiro num vm, com relógio próprio ---------- */
// opcoes:
//   save        objeto gravado na chave do save antes de carregar
//   copia       objeto (ou texto cru) gravado na cópia '<chaveSave>-novidades'
//   loja        objeto que serve de localStorage (dois aparelhos no mesmo navegador dividem a mesma)
//   agora       hora inicial do relógio de mentira (padrão 1760000000000)
//   antigo      pasta com progresso.js e cuidados.js de uma versão antiga (git show), no lugar dos de hoje
//   timersReais setTimeout/clearTimeout de verdade (padrão: não fazem nada)
//   semArmazenamento  localStorage que lança erro em tudo (navegador bloqueado)
function montar(opcoes = {}) {
  const relogio = { agora: opcoes.agora || 1760000000000 };
  const intervalos = [];
  const ouvintes = {};
  const guardado = opcoes.loja || {};
  const gravacoes = {};   // setItem por chave
  class DataFalsa extends Date {
    constructor(...a) { super(...(a.length ? a : [relogio.agora])); }
    static now() { return relogio.agora; }
  }
  const documento = {
    hidden: false,
    addEventListener(ev, fn) { (ouvintes['doc:' + ev] = ouvintes['doc:' + ev] || []).push(fn); },
  };
  const ctx = {
    console, Math, JSON, Date: DataFalsa,
    setTimeout: opcoes.timersReais ? setTimeout : () => 0, clearTimeout: opcoes.timersReais ? clearTimeout : () => {},
    setInterval: (fn, ms) => { intervalos.push({ fn, ms }); return intervalos.length; },
    clearInterval: () => {},
    document: documento,
    location: { protocol: 'file:', search: '' },
    localStorage: opcoes.semArmazenamento ? {
      getItem: () => { throw new Error('bloqueado'); },
      setItem: () => { throw new Error('bloqueado'); },
    } : {
      getItem: (k) => (k in guardado ? guardado[k] : null),
      setItem: (k, v) => { gravacoes[k] = (gravacoes[k] || 0) + 1; guardado[k] = String(v); },
    },
    addEventListener(ev, fn) { (ouvintes['win:' + ev] = ouvintes['win:' + ev] || []).push(fn); },
    PA: { APARENCIA_PADRAO: { pele: '#f1c7a3', cabelo: '#5a3825', roupa: '#ff7eb6', laco: '#ffd34d' } },
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  const trocar = opcoes.antigo ? { 'sistemas/progresso': path.join(opcoes.antigo, 'progresso.js'), 'sistemas/cuidados': path.join(opcoes.antigo, 'cuidados.js') } : {};
  Jogo.carregar(ctx, Jogo.scripts({
    // o progresso.js antigo (inteiro, de antes da divisão) entra sozinho no lugar das quatro partes de hoje
    nomes: ['nucleo/config', 'nucleo/registros', 'nucleo/util', 'nucleo/eventos', 'personagens/unicornios'].concat(opcoes.antigo ? ['sistemas/progresso']
      : ['sistemas/progresso', 'sistemas/progresso-mescla', 'sistemas/progresso-nuvem', 'sistemas/progresso-regras'], ['sistemas/cuidados']),
    grupos: ['materias', 'provas'],
  }), { trocar });
  const R = ctx.Reino;
  if (opcoes.save) guardado[R.config.chaveSave] = JSON.stringify(opcoes.save);
  if (opcoes.copia !== undefined) guardado[R.config.chaveSave + '-novidades'] = typeof opcoes.copia === 'string' ? opcoes.copia : JSON.stringify(opcoes.copia);
  // o que o resto do jogo faria: Cena, Claude (balão) e contagem de gravações
  const cena = { estado: 'mapa', atual: null };
  const balao = { aberto: false, falas: [] };
  R.Cena = { estado: () => cena.estado, atual: () => cena.atual };
  R.Claude = { aberto: () => balao.aberto, falar: (t, o) => { balao.falas.push({ t, o, em: relogio.agora }); return Promise.resolve(null); }, fechar() {} };
  const salvarOriginal = R.Progresso.salvar;
  const contagem = { salvar: 0 };
  R.Progresso.salvar = function () { contagem.salvar++; return salvarOriginal.apply(this, arguments); };
  const eventos = [];
  R.util.on('cuidados', (d) => eventos.push(d));
  return {
    R, P: R.Progresso, C: R.Cuidados, ctx, relogio, cena, balao, contagem, eventos, documento, guardado, gravacoes, ouvintes,
    chave: R.config.chaveSave, chaveCopia: R.config.chaveSave + '-novidades',
    lido() { return JSON.parse(guardado[R.config.chaveSave]); },
    copiaGuardada() { return JSON.parse(guardado[R.config.chaveSave + '-novidades']); },
    // o relógio anda ms em passos de 1 s, chamando o setInterval do jogo
    andar(ms, passo = 1000) {
      for (let t = 0; t < ms; t += passo) { relogio.agora += passo; intervalos.forEach((i) => i.fn()); }
    },
    tocar() { (ouvintes['win:pointerdown'] || []).forEach((fn) => fn({})); },
    // outra aba gravou o save: o navegador avisa esta com o evento `storage`
    storage(valor) { guardado[R.config.chaveSave] = valor; (ouvintes['win:storage'] || []).forEach((fn) => fn({ key: R.config.chaveSave, newValue: valor })); },
  };
}

/* ---------- saves sintéticos ---------- */
// formato de antes dos cuidados (sem cuidados, despensa nem ajustes.surpresa)
function saveAtual() {
  return {
    v: 1, geracao: 1, ciclo: 1, criado: 1750000000000, atualizado: 1750600000000, comecou: true,
    aparencia: { pele: '#d9a07a', cabelo: '#a0673a', roupa: '#9b7bff', laco: '#ffd34d' },
    corInicial: 'lilas',
    salas: { h1: { vezes: 1, melhor: 6, feita: 1750100000000, perfeita: true, calma: true }, h2: { vezes: 1, melhor: 4, feita: 1750200000000 } },
    treinos: { historia: { vezes: 1, melhor: 'prata' } },
    provas: { 'historia-3bim': { tentativas: 1, notas: [8.5], melhor: 8.5 } },
    unis: {
      inicial: { em: 1750000000000, xp: 95, chocado: true, nome: 'Teste Azul' },
      'h-cartinha': { em: 1750100000000, xp: 0, chocado: true },
      'h-postal': { em: 1750200000000, xp: 0, chocado: false },
    },
    montaria: 'inicial',
    estrelas: { ganhas: 37, gastas: 8 },
    loja: { flor: true },
    usando: { enfeites: ['flor'], capa: false, asasFada: false, estrelinhas: false },
    pago: { historia: 4 },
    ajustes: { som: true, musica: false, voz: true, animacoes: true, texto: 1, setas: false },
    ritualVisto: true,
  };
}
// save da versão da main 9985fa7: cuidados (com carimbos por campo) sem banho nem acaoBanho
function saveHoje() {
  return {
    v: 1, geracao: 1, ciclo: 1, criado: 1750000000000, atualizado: 1750600000000, comecou: true,
    aparencia: { pele: '#d9a07a', cabelo: '#a0673a', roupa: '#9b7bff', laco: '#ffd34d' },
    corInicial: 'lilas',
    salas: { h1: { vezes: 1, melhor: 6, feita: 1750100000000, perfeita: true, calma: true } },
    treinos: { historia: { vezes: 1, melhor: 'prata' } },
    provas: {},
    unis: {
      inicial: { em: 1750000000000, xp: 95, chocado: true, nome: 'Teste Azul' },
      'h-cartinha': { em: 1750100000000, xp: 0, chocado: true },
      'h-postal': { em: 1750200000000, xp: 0, chocado: false },
    },
    montaria: 'inicial',
    estrelas: { ganhas: 37, gastas: 8 },
    loja: { flor: true },
    usando: { enfeites: ['flor'], capa: false, asasFada: false, estrelinhas: false },
    pago: { historia: 4 },
    ajustes: { som: true, musica: false, voz: true, animacoes: true, texto: 1, setas: false, surpresa: true, surpresaEm: 1750500000000 },
    ritualVisto: true,
    cuidados: {
      inicial: { fome: 64.5, sede: 41.25, em: 1750550000000, acao: 1750400000000, acaoFome: 1750300000000, acaoSede: 1750400000000 },
      'h-cartinha': { fome: 90, sede: 80, em: 1750450000000, acao: 0, acaoFome: 0, acaoSede: 0 },
    },
    despensa: { maca: { compradas: 3, usadas: 1 } },
  };
}
const copia = (o) => JSON.parse(JSON.stringify(o));
function semNovos(e) { e = copia(e); delete e.cuidados; delete e.despensa; if (e.ajustes) { delete e.ajustes.surpresa; delete e.ajustes.surpresaEm; } return e; }

// jogo já carregado com saveAtual() (ajuste(s) muda o save antes)
function jogoCarregado(ajuste) {
  const s = saveAtual();
  if (ajuste) ajuste(s);
  const j = montar({ save: s });
  j.P.carregar();
  return j;
}

// um "banco" em memória e a sincronização como o jogo faz: GET, mescla no aparelho, PUT do resultado
function sincronizar(j, banco) {
  const remoto = banco.valor;
  if (remoto) {
    j.guardado[j.R.config.chaveSave] = JSON.stringify(j.P.mesclar(j.P.estado(), copia(remoto)));
    j.P.carregar();                        // troca o objeto (e passa pela cópia), como a mescla real
  }
  banco.valor = copia(j.P.estado());
}

const esperar = () => new Promise((r) => setImmediate(r));

// doc do artifact de mentira (window.claude.use(...).doc): guarda o que foi enviado e os timers do jogo
function docFalso(j, guardado) {
  const d = { enviados: [], snap: null, timers: [] };
  j.ctx.setTimeout = (fn) => { d.timers.push(fn); return d.timers.length; };
  j.ctx.clearTimeout = () => {};
  j.ctx.claude = { use: () => Promise.resolve({ doc: () => ({
    get: () => Promise.resolve({ exists: !!guardado, data: () => (guardado ? { estado: copia(guardado), atualizado: guardado.atualizado } : null) }),
    set: (x) => { d.enviados.push(copia(x)); return Promise.resolve(); },
    onSnapshot: (fn) => { d.snap = fn; },
  }) }) };
  d.rodarTimers = () => { const ts = d.timers.splice(0); ts.forEach((f) => f()); };
  d.chegou = (e) => d.snap({ exists: true, metadata: { hasPendingWrites: false }, data: () => ({ estado: copia(e), atualizado: e.atualizado }) });
  return d;
}

module.exports = { Jogo, montar, saveAtual, saveHoje, copia, semNovos, jogoCarregado, sincronizar, esperar, docFalso };
