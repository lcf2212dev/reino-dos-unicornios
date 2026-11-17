// Proxy de TESTE do "Jogar juntos" (docs/contratos/juntos.md §10): sobe um servidor em 127.0.0.1 numa porta livre
// que repassa TUDO para o servidor de TESTE (o de sempre), menos /api/juntos e /api/presenca, que este processo
// responde em memória com as MESMAS regras do servidor de verdade (vercel/lib/juntos.js e vercel/lib/presenca.js).
// Existe porque o servidor de casa (jogo/servidor/, intocável) não tem as rotas, e os testes de navegador precisam de
// gente criando um servidor, convidando e entrando nele. Só ferramenta de teste: nada disso entra no jogo nem na Vercel.
//   const { iniciarPresenca } = require('./servidor-presenca');
//   const s = await iniciar(); const p = await iniciarPresenca(s.url); … abrir({ url: p.url }) … await p.parar();
const http = require('http');
const { conferirUrl } = require('./guardas');
const { portaLivre } = require('./servidor-teste');
const presenca = require('../../../vercel/lib/presenca');
const juntos = require('../../../vercel/lib/juntos');

function iniciarPresenca(urlDoServidor) {
  const alvo = conferirUrl(urlDoServidor);
  const membros = new Map();    // login → { servidor, dados, visto }
  const servidores = new Map(); // codigo → { codigo, dono, nome, criado, visto }
  const s = { url: null, pedidos: 0, presencas: 0, servidoresPedidos: 0, saiu: 0 };
  const json = (res, status, d) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(d));
  };
  const vivo = (srv) => srv && Date.now() - srv.visto <= juntos.TTL_MS;
  const lista = (codigo) => presenca.lista(Array.from(membros.values()).filter((m) => m.servidor === codigo), Date.now());
  const corpo = (req) => new Promise((ok) => {
    let c = '';
    req.setEncoding('utf8');
    req.on('data', (x) => { c += x; });
    req.on('end', () => { try { ok(JSON.parse(c)); } catch (e) { ok(null); } });
    req.on('error', () => ok(null));
  });

  async function apiJuntos(req, res, u) {
    s.servidoresPedidos++;
    if (req.method === 'GET') {
      const codigo = juntos.normalizar(u.searchParams.get('codigo'));
      if (!juntos.valido(codigo)) return json(res, 400, { erro: 'codigo' });
      const srv = servidores.get(codigo);
      if (!vivo(srv)) return json(res, 404, { erro: 'servidor' });
      srv.visto = Date.now();
      return json(res, 200, { servidor: { codigo: srv.codigo, dono: srv.dono, nome: srv.nome, criado: srv.criado } });
    }
    if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
    const pedido = juntos.lerPedido(await corpo(req));
    if (!pedido) return json(res, 400, { erro: 'pedido' });
    if (pedido.acao === 'criar') {
      let codigo = '';
      for (let i = 0; i < 6 && !codigo; i++) { const c = juntos.novoCodigo(); if (!servidores.has(c)) codigo = c; }
      if (!codigo) return json(res, 503, { erro: 'sem-codigo' });
      const srv = { codigo, dono: pedido.login, nome: pedido.nome, criado: Date.now(), visto: Date.now() };
      servidores.set(codigo, srv);
      return json(res, 201, { servidor: { codigo, dono: srv.dono, nome: srv.nome, criado: srv.criado } });
    }
    const srv = servidores.get(pedido.codigo);
    if (!vivo(srv) || srv.dono !== pedido.login) return json(res, 403, { erro: 'dono' });
    servidores.delete(pedido.codigo);
    for (const [login, m] of membros) if (m.servidor === pedido.codigo) membros.delete(login);
    return json(res, 200, { ok: true });
  }

  async function apiPresenca(req, res, u) {
    s.presencas++;
    if (req.method === 'GET') {
      const codigo = juntos.normalizar(u.searchParams.get('servidor'));
      if (codigo && !juntos.valido(codigo)) return json(res, 400, { erro: 'servidor' });
      return json(res, 200, { agora: Date.now(), ttl: presenca.TTL_MS, jogadores: codigo ? lista(codigo) : [] });
    }
    if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
    const agora = Date.now();
    const m = presenca.montar(await corpo(req), agora);
    if (!m) return json(res, 400, { erro: 'presenca' });
    const codigo = m.saiu ? m.servidor : m.dados.servidor;
    if (m.saiu) {
      s.saiu++;
      membros.delete(m.login);
      return json(res, 200, { agora: Date.now(), ttl: presenca.TTL_MS, jogadores: codigo ? lista(codigo) : [] });
    }
    if (!codigo) return json(res, 200, { agora: Date.now(), ttl: presenca.TTL_MS, jogadores: [] });
    const srv = servidores.get(codigo);
    if (!vivo(srv)) { membros.delete(m.login); return json(res, 404, { erro: 'servidor' }); }
    srv.visto = Date.now();
    membros.set(m.login, { servidor: codigo, dados: JSON.stringify(m.dados), visto: Date.now() });
    return json(res, 200, { agora: Date.now(), ttl: presenca.TTL_MS, jogadores: lista(codigo) });
  }

  const servidor = http.createServer((req, res) => {
    s.pedidos++;
    const u = new URL(req.url, 'http://x');
    if (u.pathname === '/api/presenca') return apiPresenca(req, res, u);
    if (u.pathname === '/api/juntos') return apiJuntos(req, res, u);
    const opcoes = { hostname: alvo.hostname, port: alvo.port, path: u.pathname + u.search, method: req.method,
      headers: Object.assign({}, req.headers, { host: alvo.host }) };
    const proxi = http.request(opcoes, (r) => { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
    proxi.on('error', () => { if (!res.headersSent) res.statusCode = 502; res.end(); });
    req.pipe(proxi);
  });
  s.parar = () => new Promise((ok) => {
    if (servidor.closeAllConnections) servidor.closeAllConnections();
    servidor.close(() => ok());
  });
  return portaLivre(9100).then((porta) => new Promise((ok, falhar) => {
    servidor.once('error', falhar);
    servidor.listen(porta, '127.0.0.1', () => {
      s.url = 'http://127.0.0.1:' + porta + '/';
      ok(s);
    });
  }));
}

module.exports = { iniciarPresenca };
