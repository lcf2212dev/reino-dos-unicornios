// guardas.js conferirBanco: o próprio ARQUIVO .db que é link simbólico (em /tmp) para servidor/dados/ ou para fora
// de /tmp tem de ser recusado, também link pendente e link de link. Bug da auditoria: só a PASTA era resolvida.
// Os alvos imitam o caminho do banco de casa numa pasta de teste (nunca o de verdade). Sem navegador, sem servidor.
// Uso: node --test jogo/ferramentas/testes/unidade/guardas-banco-link.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { PASTA_TESTES, conferirBanco } = require('../guardas');

fs.mkdirSync(PASTA_TESTES, { recursive: true });
const pasta = fs.mkdtempSync(path.join(PASTA_TESTES, 'guardas-banco-link-'));

test('conferirBanco recusa arquivo-link (pendente) para servidor/dados', () => {
  const alvo = path.join(pasta, 'falso', 'jogo', 'servidor', 'dados', 'reino.db');
  fs.mkdirSync(path.dirname(alvo), { recursive: true });
  const link = path.join(pasta, 'teste.db');
  fs.symlinkSync(alvo, link);
  assert.throws(() => conferirBanco(link), /servidor\/dados/, `aceitou ${link} -> ${alvo}`);
});

test('conferirBanco recusa arquivo-link para fora de /tmp', () => {
  const link = path.join(pasta, 'fora.db');
  fs.symlinkSync('/usr/nao-existe.db', link);
  assert.throws(() => conferirBanco(link), /\/tmp/, `aceitou ${link} -> /usr/nao-existe.db`);
});

test('conferirBanco recusa link de link (relativo) que termina em servidor/dados', () => {
  const alvo = path.join(pasta, 'falso2', 'servidor', 'dados', 'reino.db');
  fs.mkdirSync(path.dirname(alvo), { recursive: true });
  fs.writeFileSync(alvo, '');
  fs.symlinkSync(path.relative(pasta, alvo), path.join(pasta, 'meio.db'));
  fs.symlinkSync('meio.db', path.join(pasta, 'duplo.db'));
  assert.throws(() => conferirBanco(path.join(pasta, 'duplo.db')), /servidor\/dados/);
});

test('conferirBanco aceita arquivo comum e link que fica em /tmp', () => {
  const comum = path.join(pasta, 'comum.db');
  fs.writeFileSync(comum, '');
  assert.strictEqual(conferirBanco(comum), comum);
  fs.symlinkSync(comum, path.join(pasta, 'bom.db'));
  assert.strictEqual(conferirBanco(path.join(pasta, 'bom.db')), path.join(pasta, 'bom.db'));
});

test('conferirBanco recusa link em laço (saltos demais)', () => {
  fs.symlinkSync('laco-b.db', path.join(pasta, 'laco-a.db'));
  fs.symlinkSync('laco-a.db', path.join(pasta, 'laco-b.db'));
  assert.throws(() => conferirBanco(path.join(pasta, 'laco-a.db')), /saltos demais/);
});

// REINO_TESTES em /dev/shm (O-13): o banco pode ficar DENTRO da pasta de testes; o resto do /dev/shm, servidor/dados,
// fora de /tmp e links com saltos demais continuam proibidos. Roda num processo filho com a variável (PASTA_TESTES é
// lida ao carregar guardas.js). Pasta fixa em /dev/shm, sem apagar (regra dos temporários).
const GUARDAS = path.join(__dirname, '..', 'guardas.js');
function comPasta(reinoTestes, corpo) {
  const env = Object.assign({}, process.env, { REINO_TESTES: reinoTestes || '' });
  const r = require('child_process').spawnSync(process.execPath, ['-e', `
    const fs = require('fs'), path = require('path'), assert = require('assert');
    const { PASTA_TESTES: T, conferirBanco } = require(${JSON.stringify(GUARDAS)});
    const recusa = (b, re) => assert.throws(() => conferirBanco(b), re, 'aceitou ' + b);
    ${corpo}`], { env, encoding: 'utf8' });
  assert.strictEqual(r.status, 0, r.stderr + r.stdout);
}
const SHM = '/dev/shm/reino-testes-guardas';
test('REINO_TESTES em /dev/shm: banco dentro da pasta de testes aceito, o resto recusado', { skip: !fs.existsSync('/dev/shm') }, () => {
  comPasta(SHM, `
    assert.strictEqual(T, ${JSON.stringify(SHM)});
    fs.mkdirSync(T, { recursive: true });
    const p = fs.mkdtempSync(path.join(T, 'banco-'));
    assert.strictEqual(conferirBanco(p + '/reino-teste.db'), p + '/reino-teste.db');
    assert.strictEqual(conferirBanco('/tmp/reino-testes/x/reino-teste.db'), '/tmp/reino-testes/x/reino-teste.db');
    fs.writeFileSync(p + '/comum.db', '');
    fs.symlinkSync(p + '/comum.db', p + '/bom.db');
    assert.strictEqual(conferirBanco(p + '/bom.db'), p + '/bom.db');
    recusa('/dev/shm/outra/reino.db', /\\/tmp/);
    recusa('/dev/shm/reino.db', /\\/tmp/);
    recusa(T + '-irma/reino.db', /\\/tmp/);
    recusa(T + '/servidor/dados/reino.db', /servidor\\/dados/);
    recusa('/home/leandro/reino.db', /\\/tmp/);
    fs.symlinkSync('/usr/nao-existe.db', p + '/fora.db');
    recusa(p + '/fora.db', /\\/tmp/);
    fs.symlinkSync('/dev/shm/outra.db', p + '/shm-fora.db');
    recusa(p + '/shm-fora.db', /\\/tmp/);
    const dados = path.join(p, 'falso', 'servidor', 'dados');
    fs.mkdirSync(dados, { recursive: true });
    fs.symlinkSync(dados, p + '/atalho');
    recusa(p + '/atalho/reino.db', /servidor\\/dados/);
    fs.symlinkSync(path.join(dados, 'reino.db'), p + '/meio.db');
    fs.symlinkSync('meio.db', p + '/duplo.db');
    recusa(p + '/duplo.db', /servidor\\/dados/);
    fs.symlinkSync('laco-b.db', p + '/laco-a.db');
    fs.symlinkSync('laco-a.db', p + '/laco-b.db');
    recusa(p + '/laco-a.db', /saltos demais/);`);
});

test('sem REINO_TESTES (ou com ela em /tmp): banco em /dev/shm continua proibido', () => {
  const corpo = `recusa(${JSON.stringify(SHM + '/x/reino.db')}, /\\/tmp/); recusa('/dev/shm/reino-testes/x/reino.db', /\\/tmp/);`;
  comPasta('', corpo);
  comPasta('/tmp/reino-testes', corpo);
});
