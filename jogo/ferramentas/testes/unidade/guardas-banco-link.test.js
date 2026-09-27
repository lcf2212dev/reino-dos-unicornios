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
