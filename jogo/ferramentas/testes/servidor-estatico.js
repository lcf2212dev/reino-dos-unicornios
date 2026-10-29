// Servidor estático de TESTE para o jogo montado da Vercel (vercel/montar.js --saida /tmp/reino-testes/…): serve
// uma pasta inteira (sw.js, manifesto e ícones na raiz, como a Vercel), só em 127.0.0.1 e numa porta de teste
// (guardas.js). Sem banco e sem API: /api/* responde 404 (o jogo segue no aparelho, como sem rede).
// Responde com ETag e 304, como a Vercel. Para os testes do service worker: `raiz` pode trocar no meio (um deploy
// novo), `atraso(caminho)` segura arquivos (ms ou uma Promise: rede lenta ou parada), `pedidos` lista o que foi
// pedido e quantos bytes saíram, e `parar()` derruba tudo (sem rede).
//   const { servirPasta } = require('./servidor-estatico');
//   const s = await servirPasta({ raiz: '/tmp/reino-testes/x/public' }); … s.url … s.raiz = outra; … await s.parar();
const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { conferirPorta, conferirUrl } = require('./guardas');

const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};

// op: { raiz, porta?, atraso?(caminho) → ms | Promise }
function servirPasta(op) {
  const conexoes = new Set();
  const s = { raiz: path.resolve(op.raiz), atraso: op.atraso || null, pedidos: [], url: null };
  const servidor = http.createServer((req, res) => {
    let p;
    try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch (e) { res.statusCode = 400; return res.end(); }
    if (p === '/') p = '/index.html';
    const arq = path.join(s.raiz, p);
    if (p.includes('..') || p.startsWith('/api/') || !arq.startsWith(s.raiz + path.sep)) { res.statusCode = 404; return res.end(); }
    const registro = { caminho: p.slice(1), bytes: 0 };
    s.pedidos.push(registro);
    const servir = () => fs.readFile(arq, (erro, dados) => {
      if (erro) { res.statusCode = 404; return res.end(); }
      const etag = '"' + crypto.createHash('sha1').update(dados).digest('hex').slice(0, 16) + '"';
      res.setHeader('ETag', etag);
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      if (req.headers['if-none-match'] === etag) { res.statusCode = 304; registro.naoMudou = true; return res.end(); }
      res.setHeader('Content-Type', TIPOS[path.extname(arq)] || 'application/octet-stream');
      registro.bytes = dados.length;
      res.end(dados);
    });
    const espera = s.atraso ? s.atraso(registro.caminho) : 0;
    if (typeof espera === 'number') { if (espera > 0) setTimeout(servir, espera); else servir(); } else Promise.resolve(espera).then(servir);
  });
  servidor.on('connection', (c) => { conexoes.add(c); c.on('close', () => conexoes.delete(c)); });
  s.parar = () => new Promise((ok) => {
    servidor.close(() => ok());
    conexoes.forEach((c) => c.destroy());
  });
  return new Promise((ok, falhar) => {
    servidor.once('error', falhar);
    servidor.listen(op.porta ? conferirPorta(op.porta) : 0, '127.0.0.1', () => {
      const porta = conferirPorta(servidor.address().port);
      s.url = conferirUrl(`http://127.0.0.1:${porta}/`).href;
      ok(s);
    });
  });
}

module.exports = { servirPasta };
