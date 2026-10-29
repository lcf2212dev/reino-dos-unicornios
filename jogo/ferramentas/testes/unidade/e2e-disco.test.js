// Disco do e2e (e2e-disco.js): espaço mínimo, plano do --podar e a pasta REINO_TESTES das guardas.
// Tudo numa pasta própria dentro de /tmp/reino-testes (sem navegador).
// Uso: node --test jogo/ferramentas/testes/unidade/e2e-disco.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { PASTA_TESTES, pastaTestes } = require('../guardas');
const disco = require('../e2e-disco');

const RAIZ = path.join(PASTA_TESTES, `unidade-disco-${process.pid}`);
test.after(() => fs.rmSync(RAIZ, { recursive: true, force: true }));
const criar = (rel, horas = 0) => {
  const p = path.join(RAIZ, rel);
  fs.mkdirSync(p, { recursive: true });
  fs.writeFileSync(path.join(p, 'x.png'), 'abc');
  const t = new Date(Date.now() - horas * 3600e3);
  fs.utimesSync(path.join(p, 'x.png'), t, t); fs.utimesSync(p, t, t);
  fs.utimesSync(path.join(RAIZ, rel.split('/')[0]), t, t); // a pasta de cima também (base-*, cap-*)
};

test('planoPoda: e2e-* velhos e ref de harness antigo; mantém o atual, o da main e o recente', () => {
  criar('e2e-velho', 2); criar('e2e-novo', 0);
  criar('ref-abc1234/dados-imagens-vozes-h11111111', 2);       // antigo e parado: sai
  criar('ref-abc1234/dados-imagens-vozes-h22222222');          // atual: fica
  criar(`ref-abc1234/dados-imagens-vozes-h${disco.harnessMain()}`); // da main: fica
  criar('ref-abc1234/dados-vozes-h22222222.parcial-99', 2);    // captura interrompida velha: sai
  criar('base-abc1234/jogo');                                   // cópia da base: fica
  const plano = disco.planoPoda(RAIZ, { harness: '22222222' });
  const rel = plano.map((x) => path.relative(RAIZ, x.caminho)).sort();
  assert.deepStrictEqual(rel, ['e2e-velho', 'ref-abc1234/dados-imagens-vozes-h11111111', 'ref-abc1234/dados-vozes-h22222222.parcial-99']);
  plano.forEach((x) => assert.strictEqual(x.bytes, 3));
  assert.strictEqual(disco.podar(plano), 9);
  assert.ok(!fs.existsSync(path.join(RAIZ, 'e2e-velho')) && fs.existsSync(path.join(RAIZ, 'e2e-novo')));
  assert.deepStrictEqual(disco.planoPoda(RAIZ, { harness: '22222222' }), []);
});

test('planoPoda: temporárias de teste velhas saem; recentes, fixas e desconhecidas ficam', () => {
  const velhas = ['banco-a1B2c3', 'fluxo-intr-Zz9x8Y', 'validar-docs-copia-q1w2e3', 'trava-abcdef', 'planos-xyz123',
    'novo-12345', 'tipos-678', 'autocontido-0123abcd', 'indice-Q1w2E3',
    // o que escapava: cópias por worktree, aceite-*, ver-*, erro-*, empacotar-saida e outras mkdtemp dos testes
    'reino-ef-e2e-base-0123abcd', 'reino-dos-unicornios-89abcdef', 'aceite-4bim', 'aceite-4bim-sala-AbC123',
    'ver-terceiro-bimestre-HbuOt5', 'ver-recorte-dQuwEF', 'erro-parado-bHdzHi', 'erro-memoria-Jyveuc', 'empacotar-saida',
    'tela-saida-AUUnjK', 'microscopio-0sFf1v', 'livro-acab-eoxRMS', 'estados-18FhYh',
    'vagas-Ab12Cd', 'verdes-gOROXd', 'fluxo-intv-Ep39sd', 'fluxo-limpar-1NeV5K', 'fluxo-int-e2e-kRqqm7', 'vozes-orfaos-6ufk2Y', 'tamanho-1414996'];
  velhas.forEach((n) => criar(n, 2));
  ['banco-recen1', 'entrada-recen2', 'reino-ef-x-fedcba98'].forEach((n) => criar(n, 0));  // menos de 1 h: ficam
  ['travas', 'planos', 'integrar', 'ver', 'auditoria', 'vercel', 'base-abc1234', 'trava', 'banco', 'material', 'vagas', 'verdes', 'tamanho',
    'banco-curto', 'banco-comprido1', 'outra-coisa-abcdef', 'novo-abc', 'reino-sem-hash', 'cap-0123456789abcdef',
    // o artifact está sendo aposentado: as pastas dele saíram da lista
    'artifact-delta-AaBbCc', 'artifact-delta-acento-AaBbCc'].forEach((n) => criar(n, 5)); // fixas ou desconhecidas
  // cópia de worktree velha com um arquivo mexido agora (um teste rodando nela): fica
  criar('reino-ef-viva-00112233', 2);
  fs.writeFileSync(path.join(RAIZ, 'reino-ef-viva-00112233', 'novo.txt'), 'x');
  const rel = disco.planoPoda(RAIZ, { harness: '22222222', basesProtegidas: ['abc1234'] }).map((x) => path.relative(RAIZ, x.caminho)).sort();
  assert.deepStrictEqual(rel.filter((r) => !r.startsWith('cap-')), velhas.slice().sort());
});

test('planoPoda: referência de harness antigo em uso (pasta ou arquivo dentro < 1 h) nunca sai', () => {
  criar('ref-def5678/dados-h33333333', 0);                      // recém-criada por outra worktree: fica
  criar('ref-def5678/dados-h44444444', 2);                      // pasta velha, mas um arquivo dentro acabou de mudar
  fs.writeFileSync(path.join(RAIZ, 'ref-def5678/dados-h44444444/novo.png'), 'x');
  const t = new Date(Date.now() - 2 * 3600e3); fs.utimesSync(path.join(RAIZ, 'ref-def5678/dados-h44444444'), t, t);
  criar('ref-def5678/dados-h55555555.parcial-7', 0);            // captura em andamento: fica
  criar('ref-def5678/dados-h66666666', 2);                      // antigo e parado: sai
  const rel = disco.planoPoda(RAIZ, { harness: '22222222' }).map((x) => path.relative(RAIZ, x.caminho));
  assert.deepStrictEqual(rel.filter((r) => r.startsWith('ref-def5678')), ['ref-def5678/dados-h66666666']);
});

test('planoPoda: ref velha reusada agora (marcarUso) não sai', () => {
  criar('ref-fed9876/dados-h77777777', 3);
  const rel = () => disco.planoPoda(RAIZ, { harness: '22222222' }).map((x) => path.relative(RAIZ, x.caminho));
  assert.ok(rel().includes('ref-fed9876/dados-h77777777'));
  disco.marcarUso(path.join(RAIZ, 'ref-fed9876/dados-h77777777'));
  assert.ok(!rel().includes('ref-fed9876/dados-h77777777'));
});

test('planoPoda: cap-* (cache por conteúdo): interrompida, harness e navegador antigos; protegida e em uso ficam', () => {
  const h = disco.harnessMain();
  criar(`cap-aaaa000000000001/dados-vozes-h${h}-n11111111`, 2);           // atual e parada, mas protegida: fica
  criar(`cap-aaaa000000000002/dados-vozes-h${h}-n11111111.parcial-5`, 2); // captura interrompida: sai
  criar('cap-aaaa000000000003/dados-vozes-h99999999-n11111111', 2);       // harness antigo: sai
  criar(`cap-aaaa000000000004/dados-vozes-h${h}-n00000000`, 2);           // navegador antigo: sai
  criar(`cap-aaaa000000000005/dados-vozes-h${h}-n11111111`, 0);           // em uso: fica
  criar(`cap-aaaa000000000006/dados-vozes-h${h}-n11111111`, 30);          // sem uso há mais de 24 h: sai inteira
  const rel = disco.planoPoda(RAIZ, { harness: '22222222', nav: '11111111', protegidos: ['aaaa000000000001'] })
    .map((x) => path.relative(RAIZ, x.caminho)).filter((r) => r.startsWith('cap-aaaa')).sort();
  assert.deepStrictEqual(rel, [`cap-aaaa000000000002/dados-vozes-h${h}-n11111111.parcial-5`, 'cap-aaaa000000000003/dados-vozes-h99999999-n11111111',
    `cap-aaaa000000000004/dados-vozes-h${h}-n00000000`, 'cap-aaaa000000000006']);
});

test('planoPoda: cap-* da mesma worktree: a mais nova fica (vira a base ao aceitar), as paradas mais velhas saem', () => {
  const h = disco.harnessMain();
  const cap = (c, horas, de) => {
    criar(`cap-${c}/dados-vozes-h${h}-n11111111`, horas);
    de.forEach((d) => { const f = path.join(RAIZ, `cap-${c}`, `.de-${d}`); fs.writeFileSync(f, d); const t = new Date(Date.now() - horas * 3600e3); fs.utimesSync(f, t, t); });
    const t = new Date(Date.now() - horas * 3600e3); fs.utimesSync(path.join(RAIZ, `cap-${c}`), t, t);
  };
  cap('bbbb000000000001', 5, ['w1']);        // w1, velha: sai
  cap('bbbb000000000002', 3, ['w1']);        // w1, a mais nova: fica
  cap('bbbb000000000003', 6, ['w2', 'w1']);  // a mais nova de w2: fica
  cap('bbbb000000000004', 4, []);            // sem dono, menos de 24 h: fica
  const rel = disco.planoPoda(RAIZ, { harness: '22222222', nav: '11111111' }).map((x) => path.relative(RAIZ, x.caminho)).filter((r) => r.startsWith('cap-bbbb'));
  assert.deepStrictEqual(rel, ['cap-bbbb000000000001']);
});

test('planoPoda: base-<curto> sem uso há 24 h sai, salvo a protegida; extração interrompida sai', () => {
  criar('base-ccc1111/jogo', 30); criar('base-ccc2222/jogo', 30); criar('base-ccc3333/jogo', 2); criar('base-ccc4444.parcial-9', 2);
  const rel = disco.planoPoda(RAIZ, { harness: '22222222', basesProtegidas: ['ccc2222'] }).map((x) => path.relative(RAIZ, x.caminho)).filter((r) => r.startsWith('base-ccc'));
  assert.deepStrictEqual(rel, ['base-ccc1111', 'base-ccc4444.parcial-9']);
});

test('conferirEspaco: abaixo do mínimo para com a dica do --podar', () => {
  assert.ok(disco.conferirEspaco(RAIZ, 1) > 0);
  assert.throws(() => disco.conferirEspaco(RAIZ, Number.MAX_SAFE_INTEGER), /--podar/);
});

test('podar recusa caminho fora da pasta de testes', () => {
  assert.throws(() => disco.podar([{ caminho: '/home/leandro', bytes: 0 }]), /proibido/);
});

test('REINO_TESTES: só /tmp ou /dev/shm, nunca servidor/dados', () => {
  assert.strictEqual(pastaTestes(undefined), '/tmp/reino-testes');
  assert.strictEqual(pastaTestes('/dev/shm/reino-testes/'), '/dev/shm/reino-testes');
  ['/home/leandro/x', '/', '/tmp', '/dev/shm', '/tmp/x/servidor/dados', 'relativa'].forEach((p) =>
    assert.throws(() => pastaTestes(p), /proibido/, p));
});
