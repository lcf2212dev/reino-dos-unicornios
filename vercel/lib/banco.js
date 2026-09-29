/* O banco do Reino na Vercel (Postgres/Neon, DATABASE_URL da integração): as mesmas tabelas e regras do servidor
   de casa (jogo/servidor/servidor.js), em banco próprio. Não tem nem copia o progresso do servidor de casa. */
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);
const HISTORICO = 50;
// login: minúsculas, números, - e _ (2 a 20); 'mariana' é o save dela (conta semeada, sem sobrescrever)
const LOGIN = /^[a-z0-9_-]{2,20}$/;
const MARIANA = 'mariana';
const SENHA_MARIANA = 'unicorlice77';   // a mesma de config.jogadores.senhaMariana e do servidor de casa

// tabelas e a conta da Mariana: uma vez por instância (tudo IF NOT EXISTS / ON CONFLICT DO NOTHING)
let pronto = null;
function preparar() {
  if (!pronto) {
    pronto = sql.transaction([
      sql`CREATE TABLE IF NOT EXISTS progresso (id TEXT PRIMARY KEY, dados TEXT NOT NULL, atualizado BIGINT NOT NULL)`,
      sql`CREATE TABLE IF NOT EXISTS historico (n BIGSERIAL PRIMARY KEY, id TEXT NOT NULL, dados TEXT NOT NULL, gravado BIGINT NOT NULL)`,
      sql`CREATE INDEX IF NOT EXISTS historico_id ON historico (id, n)`,
      sql`CREATE TABLE IF NOT EXISTS jogadores (login TEXT PRIMARY KEY, senha TEXT NOT NULL, criado BIGINT NOT NULL)`,
      sql`INSERT INTO jogadores (login, senha, criado) VALUES (${MARIANA}, ${SENHA_MARIANA}, ${Date.now()}) ON CONFLICT (login) DO NOTHING`,
    ]).catch((e) => { pronto = null; throw e; });
  }
  return pronto;
}

async function lerProgresso(id) {
  await preparar();
  const r = await sql`SELECT dados FROM progresso WHERE id = ${id}`;
  return r.length ? r[0].dados : null;
}

// grava o doc e guarda no histórico (as últimas HISTORICO versões de cada id)
async function gravarProgresso(id, texto) {
  await preparar();
  const t = Date.now();
  await sql.transaction([
    sql`INSERT INTO progresso (id, dados, atualizado) VALUES (${id}, ${texto}, ${t})
        ON CONFLICT (id) DO UPDATE SET dados = excluded.dados, atualizado = excluded.atualizado`,
    sql`INSERT INTO historico (id, dados, gravado) VALUES (${id}, ${texto}, ${t})`,
    sql`DELETE FROM historico WHERE id = ${id} AND n NOT IN (SELECT n FROM historico WHERE id = ${id} ORDER BY n DESC LIMIT ${HISTORICO})`,
  ]);
}

async function senhaDe(login) {
  await preparar();
  const r = await sql`SELECT senha FROM jogadores WHERE login = ${login}`;
  return r.length ? r[0].senha : null;
}

async function logins() {
  await preparar();
  const r = await sql`SELECT login FROM jogadores ORDER BY criado, login`;
  return r.map((l) => l.login);
}

// true = criada; false = já existia
async function criarJogador(login, senha) {
  await preparar();
  const r = await sql`INSERT INTO jogadores (login, senha, criado) VALUES (${login}, ${senha}, ${Date.now()})
                      ON CONFLICT (login) DO NOTHING RETURNING login`;
  return r.length > 0;
}

// corpo do pedido como texto (sem o parser da Vercel), cortado em `limite` caracteres
function lerCorpo(req, limite) {
  return new Promise((ok) => {
    let corpo = '';
    let grande = false;
    req.setEncoding('utf8');
    req.on('data', (c) => { corpo += c; if (corpo.length > limite) { grande = true; req.destroy(); } });
    req.on('end', () => ok(grande ? null : corpo));
    req.on('error', () => ok(null));
    req.on('close', () => ok(grande ? null : corpo));
  });
}

// cabeçalhos de toda resposta da API: é por X-Reino-Jogadores que o jogo sabe que há vários jogadores
function cabecalhos(res) {
  res.setHeader('X-Reino', '1');
  res.setHeader('X-Reino-Jogadores', '1');
  res.setHeader('Cache-Control', 'no-store');
}

function json(res, status, d) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(d));
}

module.exports = { LOGIN, MARIANA, lerProgresso, gravarProgresso, senhaDe, logins, criarJogador, lerCorpo, cabecalhos, json };
