/* Servidores de "Jogar juntos" (docs/contratos/juntos.md §3): o código do servidor, a validade e o formato.
   Como no PKXD: alguém CRIA um servidor, manda o convite (código e link) e os amigos entram nele. O servidor vive
   enquanto alguém estiver dentro (o `visto` da tabela é renovado a cada presença) e o dono pode fechá-lo.
   Sem banco e sem rede: dá para testar no Node puro. */
const LOGIN = /^[a-z0-9_-]{2,20}$/;
// sem I, O, 0 e 1: ninguém confunde ao ditar o código por telefone ou digitar no celular
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODIGO = /^[A-HJ-NP-Z2-9]{4}$/;
const TTL_MS = 2 * 60 * 1000;   // sem ninguém por 2 min, o servidor fecha e o código não vale mais

function normalizar(v) {
  if (typeof v !== 'string') return '';
  return v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
}
function valido(codigo) { return CODIGO.test(codigo || ''); }
/** @param {() => number} [sortear] */
function novoCodigo(sortear) {
  const r = typeof sortear === 'function' ? sortear : Math.random;
  let s = '';
  for (let i = 0; i < 4; i++) s += ALFABETO[Math.floor(Math.min(0.999999, Math.max(0, r())) * ALFABETO.length)];
  return s;
}
function texto(v, max) {
  if (typeof v !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return v.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);
}

/** Corpo do POST → { acao, login, nome, codigo } já validado, ou null (recusado). */
function lerPedido(corpo) {
  if (!corpo || typeof corpo !== 'object' || Array.isArray(corpo)) return null;
  const login = typeof corpo.login === 'string' ? corpo.login : '';
  if (!LOGIN.test(login) || login in Object.prototype || login === 'prototype') return null;
  const acao = corpo.acao === 'fechar' ? 'fechar' : corpo.acao === 'criar' ? 'criar' : null;
  if (!acao) return null;
  const codigo = normalizar(corpo.codigo);
  if (acao === 'fechar' && !valido(codigo)) return null;
  return { acao: acao, login: login, nome: texto(corpo.nome, 20) || login, codigo: codigo };
}

module.exports = { LOGIN, ALFABETO, CODIGO, TTL_MS, normalizar, valido, novoCodigo, lerPedido };
