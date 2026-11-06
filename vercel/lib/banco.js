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
      // "Jogar juntos" (docs/contratos/juntos.md §3): só a presença efêmera; NÃO tem nada do save
      sql`CREATE TABLE IF NOT EXISTS presenca (login TEXT PRIMARY KEY, servidor TEXT NOT NULL DEFAULT '', dados TEXT NOT NULL, visto BIGINT NOT NULL)`,
      // os servidores (PKXD): código, dono, nome e o `visto` que os mantém abertos enquanto alguém está dentro
      sql`CREATE TABLE IF NOT EXISTS juntos (codigo TEXT PRIMARY KEY, dono TEXT NOT NULL, nome TEXT NOT NULL, criado BIGINT NOT NULL, visto BIGINT NOT NULL)`,
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

/* ---------- presença ("Jogar juntos"; docs/contratos/juntos.md §3) ----------
   O que é efêmero, separado do progresso: a linha tem o JSON que o servidor montou (lib/presenca.js) e o `visto`
   do relógio do servidor. A varredura das linhas vencidas acontece junto do POST (é o único momento em que há
   alguém esperando). Nada aqui lê nem grava `progresso`, `historico` ou `jogadores`. */
// só quem está no MEU servidor: quem não criou nem entrou em nenhum não vê ninguém (e ninguém o vê)
async function lerPresenca(servidor) {
  await preparar();
  if (!servidor) return [];
  const p = require('./presenca');
  const agora = Date.now();
  const r = await sql`SELECT dados, visto FROM presenca WHERE servidor = ${servidor} AND visto >= ${agora - p.TTL_MS} ORDER BY visto DESC LIMIT ${p.MAX}`;
  return p.lista(r, agora);
}

async function gravarPresenca(login, servidor, dados) {
  await preparar();
  const p = require('./presenca');
  const agora = Date.now();
  await sql.transaction([
    sql`DELETE FROM presenca WHERE visto < ${agora - p.TTL_MS}`,
    sql`INSERT INTO presenca (login, servidor, dados, visto) VALUES (${login}, ${servidor}, ${dados}, ${agora})
        ON CONFLICT (login) DO UPDATE SET servidor = excluded.servidor, dados = excluded.dados, visto = excluded.visto`,
  ]);
  return lerPresenca(servidor);
}

/* ---------- servidores de "Jogar juntos" ---------- */
// 6 tentativas de código livre (1M de combinações; a colisão é rara e o ON CONFLICT resolve)
async function criarJuntos(login, nome) {
  await preparar();
  const j = require('./juntos');
  await expirarJuntos();
  for (let i = 0; i < 6; i++) {
    const codigo = j.novoCodigo(), agora = Date.now();
    const r = await sql`INSERT INTO juntos (codigo, dono, nome, criado, visto) VALUES (${codigo}, ${login}, ${nome}, ${agora}, ${agora})
                        ON CONFLICT (codigo) DO NOTHING RETURNING codigo, dono, nome, criado`;
    if (r.length) return r[0];
  }
  return null;
}
async function lerJuntos(codigo) {
  await preparar();
  const j = require('./juntos');
  const r = await sql`SELECT codigo, dono, nome, criado FROM juntos WHERE codigo = ${codigo} AND visto >= ${Date.now() - j.TTL_MS}`;
  return r.length ? r[0] : null;
}
// um membro entrou (ou continua dentro): renova o servidor; false = esse código não existe mais
async function tocarJuntos(codigo) {
  await preparar();
  const j = require('./juntos');
  const agora = Date.now();
  const r = await sql`UPDATE juntos SET visto = ${agora} WHERE codigo = ${codigo} AND visto >= ${agora - j.TTL_MS} RETURNING codigo`;
  return r.length > 0;
}
// só o dono fecha; aí os membros somem junto (a presença deles não é mais lida)
async function fecharJuntos(login, codigo) {
  await preparar();
  const r = await sql`DELETE FROM juntos WHERE codigo = ${codigo} AND dono = ${login} RETURNING codigo`;
  if (!r.length) return false;
  await sql`DELETE FROM presenca WHERE servidor = ${codigo}`;
  return true;
}
async function expirarJuntos() {
  await preparar();
  const j = require('./juntos');
  await sql`DELETE FROM juntos WHERE visto < ${Date.now() - j.TTL_MS}`;
}

async function sairPresenca(login) {
  await preparar();
  await sql`DELETE FROM presenca WHERE login = ${login}`;
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

module.exports = { LOGIN, MARIANA, lerProgresso, gravarProgresso, senhaDe, logins, criarJogador,
  lerPresenca, gravarPresenca, sairPresenca, criarJuntos, lerJuntos, tocarJuntos, fecharJuntos, expirarJuntos,
  lerCorpo, cabecalhos, json };
