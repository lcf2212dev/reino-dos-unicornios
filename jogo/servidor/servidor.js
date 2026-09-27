/* Servidor de casa do Reino dos Unicórnios: serve o jogo e guarda o progresso
   da Mariana num banco SQLite (com histórico das últimas versões como backup).
   Jogadores: tabela `jogadores` (login, senha em texto, sem segurança, como pedido) e um progresso por login
   na mesma tabela `progresso` (id = login). A Mariana continua na linha 'mariana' e em /api/progresso. */
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
  CREATE TABLE IF NOT EXISTS jogadores (login TEXT PRIMARY KEY, senha TEXT NOT NULL, criado INTEGER NOT NULL);
`);
const ler = db.prepare('SELECT dados FROM progresso WHERE id = ?');
const gravar = db.prepare('INSERT INTO progresso (id, dados, atualizado) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET dados = excluded.dados, atualizado = excluded.atualizado');
const guardar = db.prepare('INSERT INTO historico (id, dados, gravado) VALUES (?, ?, ?)');
const podar = db.prepare('DELETE FROM historico WHERE id = ? AND n NOT IN (SELECT n FROM historico WHERE id = ? ORDER BY n DESC LIMIT ?)');
const listarJogadores = db.prepare('SELECT login FROM jogadores ORDER BY criado, login');
const lerJogador = db.prepare('SELECT senha FROM jogadores WHERE login = ?');
const criarJogador = db.prepare('INSERT INTO jogadores (login, senha, criado) VALUES (?, ?, ?) ON CONFLICT(login) DO NOTHING');
// login: minúsculas, números, - e _ (2 a 20); 'mariana' é o save dela (conta semeada abaixo, sem sobrescrever)
const LOGIN = /^[a-z0-9_-]{2,20}$/;
const MARIANA = 'mariana';
// a conta da Mariana também mora na tabela (pedido do Leandro): semeada ao iniciar, NUNCA sobrescrita se já existe
// (a mesma senha de config.jogadores.senhaMariana; mudar aqui só vale para banco novo). O progresso dela continua
// na linha 'mariana' de `progresso` e em /api/progresso.
const SENHA_MARIANA = 'unicorlice77';
db.prepare('INSERT INTO jogadores (login, senha, criado) VALUES (?, ?, ?) ON CONFLICT(login) DO NOTHING').run(MARIANA, SENHA_MARIANA, Date.now());

const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.ico': 'image/x-icon' };
// só o que o jogo precisa fica público
const PUBLICO = /^\/(index\.html|css\/[\w.-]+|js\/[\w./-]+)$/;

// /api/progresso (a Mariana) e /api/progresso/<login>: o mesmo doc, com o mesmo histórico
function api(req, res, id) {
  res.setHeader('X-Reino', '1');
  res.setHeader('X-Reino-Jogadores', '1');   // este servidor sabe vários jogadores (o antigo gravava tudo em 'mariana')
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'HEAD') return res.end();
  if (req.method === 'GET') {
    const linha = ler.get(id);
    if (!linha) { res.statusCode = 404; return res.end(); }
    res.setHeader('Content-Type', 'application/json');
    return res.end(linha.dados);
  }
  if (req.method === 'PUT') {
    // outro jogador só grava com a conta criada (o jogo cria antes de sincronizar): nada de linha solta
    if (id !== MARIANA && !lerJogador.get(id)) { res.statusCode = 404; return res.end(); }
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

// corpo JSON pequeno de um POST (null = inválido)
function lerCorpo(req, fim) {
  let corpo = '';
  req.setEncoding('utf8');
  req.on('data', (c) => { corpo += c; if (corpo.length > 1e4) req.destroy(); });
  req.on('end', () => { let d = null; try { d = JSON.parse(corpo); } catch (e) { /* inválido */ } fim(d && typeof d === 'object' ? d : null); });
}
function json(res, status, d) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(d));
}
// GET /api/jogadores: os logins (a Mariana primeiro); POST: cria { login, senha } (409 se existe);
// POST /api/jogadores/entrar: confere a senha (200 certa, 403 errada, 404 não existe; a Mariana confere com a linha dela; sem a linha, entra)
function apiJogadores(req, res, entrar) {
  res.setHeader('X-Reino', '1');
  res.setHeader('X-Reino-Jogadores', '1');
  res.setHeader('Cache-Control', 'no-store');
  if (!entrar && req.method === 'GET') return json(res, 200, [MARIANA].concat(listarJogadores.all().map((l) => l.login).filter((l) => l !== MARIANA)));
  if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
  lerCorpo(req, (d) => {
    const login = d && typeof d.login === 'string' ? d.login : '';
    const senha = d && typeof d.senha === 'string' ? d.senha : null;
    if (!LOGIN.test(login)) return json(res, 400, { erro: 'login' });
    if (entrar) {
      const j = lerJogador.get(login);
      if (!j && login === MARIANA) return json(res, 200, { ok: true });   // banco sem a linha dela: entra, como antes
      if (!j) return json(res, 404, { erro: 'nao-existe' });
      return j.senha === senha ? json(res, 200, { ok: true }) : json(res, 403, { erro: 'senha' });
    }
    if (senha === null || !senha.length || senha.length > 100) return json(res, 400, { erro: 'senha' });
    if (login === MARIANA) return json(res, 409, { erro: 'existe' });
    const r = criarJogador.run(login, senha, Date.now());
    return r.changes ? json(res, 201, { ok: true }) : json(res, 409, { erro: 'existe' });
  });
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  let p;
  // % malformado (ex.: /%E0%A4%A) é pedido estragado: 400, sem derrubar o servidor
  try { p = decodeURIComponent(url.pathname); } catch (e) { res.statusCode = 400; return res.end(); }
  if (p === '/api/progresso') return api(req, res, MARIANA);
  const jog = /^\/api\/progresso\/([^/]+)$/.exec(p);
  if (jog) {
    if (!LOGIN.test(jog[1])) { res.statusCode = 404; return res.end(); }
    return api(req, res, jog[1]);
  }
  if (p === '/api/jogadores' || p === '/api/jogadores/entrar') return apiJogadores(req, res, p === '/api/jogadores/entrar');
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
