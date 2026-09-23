/* Servidor de casa do Reino dos Unicórnios: serve o jogo e guarda o progresso
   da Mariana num banco SQLite (com histórico das últimas versões como backup). */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const PORTA = +(process.env.PORTA || 80);
const RAIZ = path.resolve(process.env.RAIZ || path.join(__dirname, '..'));
const BANCO = process.env.BANCO || '/dados/reino.db';
const HISTORICO = 50;

fs.mkdirSync(path.dirname(BANCO), { recursive: true });
const db = new DatabaseSync(BANCO);
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS progresso (id TEXT PRIMARY KEY, dados TEXT NOT NULL, atualizado INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS historico (n INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT NOT NULL, dados TEXT NOT NULL, gravado INTEGER NOT NULL);
`);
const ler = db.prepare('SELECT dados FROM progresso WHERE id = ?');
const gravar = db.prepare('INSERT INTO progresso (id, dados, atualizado) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET dados = excluded.dados, atualizado = excluded.atualizado');
const guardar = db.prepare('INSERT INTO historico (id, dados, gravado) VALUES (?, ?, ?)');
const podar = db.prepare('DELETE FROM historico WHERE id = ? AND n NOT IN (SELECT n FROM historico WHERE id = ? ORDER BY n DESC LIMIT ?)');

const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.ico': 'image/x-icon' };
// só o que o jogo precisa fica público
const PUBLICO = /^\/(index\.html|css\/[\w.-]+|js\/[\w./-]+)$/;

function api(req, res) {
  const id = 'mariana';
  res.setHeader('X-Reino', '1');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'HEAD') return res.end();
  if (req.method === 'GET') {
    const linha = ler.get(id);
    if (!linha) { res.statusCode = 404; return res.end(); }
    res.setHeader('Content-Type', 'application/json');
    return res.end(linha.dados);
  }
  if (req.method === 'PUT') {
    let corpo = '';
    req.setEncoding('utf8');
    req.on('data', (c) => { corpo += c; if (corpo.length > 2e6) req.destroy(); });
    req.on('end', () => {
      let d;
      try { d = JSON.parse(corpo); } catch (e) { res.statusCode = 400; return res.end(); }
      if (!d || typeof d.estado !== 'object') { res.statusCode = 400; return res.end(); }
      const texto = JSON.stringify(d), t = Date.now();
      gravar.run(id, texto, t);
      guardar.run(id, texto, t);
      podar.run(id, id, HISTORICO);
      res.statusCode = 204; res.end();
    });
    return;
  }
  res.statusCode = 405; res.end();
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  let p = decodeURIComponent(url.pathname);
  if (p === '/api/progresso') return api(req, res);
  if (p === '/') p = '/index.html';
  if (!PUBLICO.test(p) || p.includes('..')) { res.statusCode = 404; return res.end('não encontrado'); }
  const arq = path.join(RAIZ, p);
  fs.stat(arq, (erro, st) => {
    if (erro || !st.isFile()) { res.statusCode = 404; return res.end('não encontrado'); }
    res.setHeader('Content-Type', TIPOS[path.extname(arq)] || 'application/octet-stream');
    // index sempre fresco; o resto pode ficar um pouco em cache
    res.setHeader('Cache-Control', p === '/index.html' ? 'no-cache' : 'max-age=300');
    res.setHeader('Content-Length', st.size);
    fs.createReadStream(arq).pipe(res);
  });
}).listen(PORTA, () => console.log(`Reino dos Unicórnios na porta ${PORTA}, banco ${BANCO}`));
