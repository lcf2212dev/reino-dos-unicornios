/* Presença de "Jogar juntos" (docs/contratos/juntos.md §2 e §3): as regras do que entra e do que sai da rota
   /api/presenca, sem banco e sem rede (dá para testar no Node puro). O servidor RECONSTRÓI o registro campo a
   campo: nada de JSON do cliente entra como veio. O que não passa é recusado (null), sem gravar nada. */
const LOGIN = /^[a-z0-9_-]{2,20}$/;
const SALA = /^[a-z0-9_-]{1,32}$/;
const ID = /^[a-z0-9_-]{1,32}$/;
const HEX = /^#[0-9a-f]{6}$/i;
const PALAVRA = /^[a-zA-Z]{1,16}$/;   // 'saiaBlusa' é um modelo de verdade (PA.MODELOS)
const RECADOS = ['oi', 'vem', 'legal', 'tchau'];
const SEXOS = ['menina', 'menino'];
// o servidor de "Jogar juntos" (vercel/lib/juntos.js): '' = sozinho, como sempre foi
const juntos = require('./juntos');
const APARENCIA = { pele: '#f1c7a5', cabelo: '#5a3825', roupa: '#ff7eb6', laco: '#ff4f9a' };   // PA.APARENCIA_PADRAO
const TTL_MS = 15000;   // sem notícia por 15 s, some da lista (Reino.config.juntos.ttlMs)
const MAX = 32;         // teto da lista (Reino.config.juntos.maxJogadores)

function numero(v, min, max) {
  if (typeof v !== 'number' || !isFinite(v)) return null;
  return Math.round(Math.min(max, Math.max(min, v)) * 10) / 10;
}
function hex(v) { return typeof v === 'string' && HEX.test(v) ? v.toLowerCase() : null; }
function texto(v, max) {
  if (typeof v !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return v.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);
}
function hexOu(v, padrao) { return hex(v) || padrao; }
function aparencia(a) {
  const d = a && typeof a === 'object' && !Array.isArray(a) ? a : {};
  return { pele: hexOu(d.pele, APARENCIA.pele), cabelo: hexOu(d.cabelo, APARENCIA.cabelo),
    roupa: hexOu(d.roupa, APARENCIA.roupa), laco: hexOu(d.laco, APARENCIA.laco) };
}
// o corte e o modelo do Salão (ids de PA.CORTES/PA.MODELOS); desconhecido vira '' e o desenho cai no padrão do sexo
function visual(v) {
  const d = v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  return { corte: PALAVRA.test(d.corte) ? d.corte : '', modelo: PALAVRA.test(d.modelo) ? d.modelo : '', semLaco: d.semLaco === true };
}
// o unicórnio montado: só o que o desenho usa (id, estágio 0–3 e as 3 cores). Qualquer coisa torta = a pé
function unicornio(u) {
  if (!u || typeof u !== 'object' || Array.isArray(u)) return null;
  const id = typeof u.id === 'string' && ID.test(u.id) ? u.id : null;
  const estagio = numero(u.estagio, 0, 3);
  if (!id || estagio === null) return null;
  const c = u.cores && typeof u.cores === 'object' && !Array.isArray(u.cores) ? u.cores : {};
  const corpo = hex(c.corpo), chifre = hex(c.chifre);
  const crina = Array.isArray(c.crina) ? c.crina.slice(0, 3).map(hex) : [];
  if (!corpo || !chifre || crina.length < 1 || crina.some((x) => !x)) return null;
  return { id: id, estagio: Math.round(estagio), cores: { corpo: corpo, crina: crina, chifre: chifre } };
}

/* Corpo do POST → { saiu: true, login } ou { login, dados } ou null (recusado).
   `agora` é o relógio do servidor (o mesmo que vai na resposta): aceno e recado são carimbados aqui, não no cliente. */
function montar(corpo, agora) {
  if (!corpo || typeof corpo !== 'object' || Array.isArray(corpo)) return null;
  const login = typeof corpo.login === 'string' ? corpo.login : '';
  if (!LOGIN.test(login) || login in Object.prototype || login === 'prototype') return null;
  const servidor = juntos.normalizar(corpo.servidor);
  if (servidor && !juntos.valido(servidor)) return null;
  if (corpo.saiu === true) return { saiu: true, login: login, servidor: servidor };   // só o bastante para apagar a linha
  const sala = typeof corpo.sala === 'string' ? corpo.sala : '';
  if (!SALA.test(sala)) return null;
  const x = numero(corpo.x, 0, 100000), y = numero(corpo.y, 0, 100000);
  if (x === null || y === null) return null;
  const ox = numero(corpo.olharX, -1, 1), oy = numero(corpo.olharY, -1, 1);
  const dados = {
    login: login,
    servidor: servidor,
    sala: sala,
    x: x,
    y: y,
    olharX: ox === null ? 0 : ox,
    olharY: oy === null ? 1 : oy,
    nome: texto(corpo.nome, 20) || login,
    sexo: SEXOS.indexOf(corpo.sexo) >= 0 ? corpo.sexo : 'menina',
    aparencia: aparencia(corpo.aparencia),
    visual: visual(corpo.visual),
    uni: unicornio(corpo.uni),
    acenoEm: corpo.aceno === true ? agora : 0,
    recado: RECADOS.indexOf(corpo.recado) >= 0 ? corpo.recado : '',
    recadoEm: RECADOS.indexOf(corpo.recado) >= 0 ? agora : 0,
  };
  return { login: login, dados: dados };
}

/* A lista que vai para o jogo, a partir das linhas { dados, visto } do banco: só as da janela do TTL, no máximo MAX,
   as mais recentes primeiro. Linha estragada (JSON torto, login inválido) fica de fora, sem derrubar a resposta. */
function lista(linhas, agora) {
  const saida = [];
  const vistas = new Set();
  for (const l of linhas || []) {
    if (saida.length >= MAX) break;
    if (!l || agora - Number(l.visto) > TTL_MS) continue;
    let d = null;
    try { d = typeof l.dados === 'string' ? JSON.parse(l.dados) : l.dados; } catch (e) { d = null; }
    if (!d || typeof d !== 'object' || !LOGIN.test(d.login) || vistas.has(d.login)) continue;
    vistas.add(d.login);
    saida.push(d);
  }
  return saida;
}

module.exports = { LOGIN, SALA, RECADOS, TTL_MS, MAX, montar, lista, numero, texto };
