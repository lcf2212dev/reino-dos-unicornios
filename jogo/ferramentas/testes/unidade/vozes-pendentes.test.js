// vozes/vozes.js (npm run vozes): o passo 2 decidia "nada novo: gerar-vozes.py não precisa rodar" só pelo mp3 no
// cache, mas o empacotar acha o áudio pelo vozes-indice.json (chave → mp3), que só o gerar-vozes.py reescreve. Fala
// com mp3 no cache e sem a chave certa no índice (texto que voltou ao de antes; dois textos que viram a mesma fala)
// fazia o npm run vozes falhar em "Falas sem áudio" (bug da auditoria). Roda numa CÓPIA das ferramentas numa pasta
// temporária (nada do repositório é escrito); o gerar-vozes.py é um dublê offline que só refaz o índice a partir do
// cache, como o de verdade faz para as falas já gravadas; sem uv no PATH.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { PASTA_TESTES } = require('../guardas');
const W = path.join(__dirname, '..', '..');

test('npm run vozes: fala com mp3 no cache e sem chave no índice não reprova o empacotar', () => {
  const raiz = fs.mkdtempSync(path.join(PASTA_TESTES, 'vozes-pend-'));
  const F = path.join(raiz, 'jogo/ferramentas');
  const G = path.join(F, 'gerado');
  fs.mkdirSync(path.join(F, 'vozes'), { recursive: true });
  fs.mkdirSync(path.join(raiz, 'jogo/js/voz'), { recursive: true });
  fs.copyFileSync(path.join(W, 'ajuda.js'), path.join(F, 'ajuda.js'));
  ['vozes.js', 'empacotar-vozes.js'].forEach((a) => fs.copyFileSync(path.join(W, 'vozes', a), path.join(F, 'vozes', a)));
  fs.mkdirSync(path.join(F, 'testes'), { recursive: true });   // guardas.js: o --saida pode ficar na REINO_TESTES
  fs.copyFileSync(path.join(W, 'testes', 'guardas.js'), path.join(F, 'testes', 'guardas.js'));
  // dublê do gerar-vozes.py: índice = chave → <voz>/<sha1>.mp3 para o que está no cache (sem rede)
  fs.writeFileSync(path.join(F, 'vozes', 'gerar-vozes.py'), `import hashlib, json, os
B = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'gerado')
d = json.load(open(os.path.join(B, 'falas.json')))
ind = {}
for f in d['falas']:
    v = d['vozes'][f['voz']]
    h = hashlib.sha1('|'.join([v['voz'], v['velocidade'], v['tom'], f['fala']]).encode()).hexdigest()[:16]
    rel = os.path.join(f['voz'], h + '.mp3')
    if os.path.exists(os.path.join(B, 'vozes-cache', rel)): ind[f['chave']] = rel
json.dump(ind, open(os.path.join(B, 'vozes-indice.json'), 'w'))
`);
  const vozes = { claude: { voz: 'pt-BR-ThalitaMultilingualNeural', velocidade: '+0%', tom: '+0Hz' } };
  const fala = { chave: 'abcd1234x', voz: 'claude', texto: 'Oba, Mariana!', fala: 'Oba, Mariana!', pacotes: ['geral'] };
  fs.mkdirSync(path.join(G, 'vozes-cache', 'claude'), { recursive: true });
  const h = crypto.createHash('sha1').update(['pt-BR-ThalitaMultilingualNeural', '+0%', '+0Hz', fala.fala].join('|'), 'utf8').digest('hex').slice(0, 16);
  fs.writeFileSync(path.join(G, 'vozes-cache', 'claude', h + '.mp3'), 'mp3 de mentira');   // já gravado antes
  fs.writeFileSync(path.join(G, 'falas.json'), JSON.stringify({ vozes, falas: [fala] }));
  fs.writeFileSync(path.join(G, 'vozes-indice.json'), '{}');                               // a chave não está no índice

  const saida = path.join(raiz, 'saida');
  const env = { ...process.env, PATH: '/usr/bin:/bin' };   // sem uv: nada de rede
  const r = spawnSync(process.execPath, [path.join(F, 'vozes', 'vozes.js'), '--sem-listar', '--sem-conferir', '--saida', saida],
    { cwd: raiz, env, encoding: 'utf8' });
  const txt = r.stdout + r.stderr;
  fs.writeFileSync(path.join(raiz, 'log.txt'), txt);
  assert.doesNotMatch(txt, /Falas sem áudio/, txt);
  assert.ok(fs.existsSync(path.join(saida, 'geral.js')), 'pacote geral.js empacotado\n' + txt);
});

test('require do vozes.js não roda nada; pendentes(gerado) conta as falas sem áudio', () => {
  const raiz = fs.mkdtempSync(path.join(PASTA_TESTES, 'vozes-req-'));
  const vozes = { claude: { voz: 'pt-BR-X', velocidade: '+0%', tom: '+0Hz' } };
  const falas = ['Oi!', 'Tchau!'].map((t, i) => ({ chave: 'k' + i, voz: 'claude', texto: t, fala: t, pacotes: ['geral'] }));
  const h = crypto.createHash('sha1').update(['pt-BR-X', '+0%', '+0Hz', 'Oi!'].join('|'), 'utf8').digest('hex').slice(0, 16);
  fs.mkdirSync(path.join(raiz, 'vozes-cache', 'claude'), { recursive: true });
  fs.writeFileSync(path.join(raiz, 'vozes-cache', 'claude', h + '.mp3'), 'x');
  fs.writeFileSync(path.join(raiz, 'falas.json'), JSON.stringify({ vozes, falas }));
  fs.writeFileSync(path.join(raiz, 'vozes-indice.json'), JSON.stringify({ k0: `claude/${h}.mp3` }));
  const G = path.join(W, 'gerado');
  const antes = fs.readdirSync(G).map((a) => a + fs.statSync(path.join(G, a)).mtimeMs).join();
  const { pendentes } = require('../../vozes/vozes.js');
  assert.deepStrictEqual(pendentes(raiz).map((f) => f.chave), ['k1']);
  assert.strictEqual(fs.readdirSync(G).map((a) => a + fs.statSync(path.join(G, a)).mtimeMs).join(), antes, 'gerado/ intocado');
});

// conferência: "antes" = último índice conferido por inteiro (.vozes/indice-conferido.json); transcritor falso
// (REINO_VOZES_VENV com um bin/python que só anota os argumentos e sai com o código pedido)
test('npm run vozes: confere o que mudou desde a última conferência completa; sem mudança, nem abre o Python', () => {
  const raiz = fs.mkdtempSync(path.join(PASTA_TESTES, 'vozes-conf-'));
  const F = path.join(raiz, 'jogo/ferramentas');
  const G = path.join(F, 'gerado');
  fs.mkdirSync(path.join(F, 'vozes'), { recursive: true });
  fs.mkdirSync(G, { recursive: true });
  fs.copyFileSync(path.join(W, 'ajuda.js'), path.join(F, 'ajuda.js'));
  fs.copyFileSync(path.join(W, 'vozes', 'vozes.js'), path.join(F, 'vozes', 'vozes.js'));
  const venv = path.join(raiz, 'venv');
  const log = path.join(raiz, 'chamadas.txt');
  fs.mkdirSync(path.join(venv, 'bin'), { recursive: true });
  fs.writeFileSync(path.join(venv, 'bin', 'python'), `#!/bin/sh\necho "$@" >> ${log}\nexit $(cat ${raiz}/codigo)\n`, { mode: 0o755 });
  const conferido = path.join(raiz, '.vozes', 'indice-conferido.json');
  const rodar = (codigo) => {
    fs.writeFileSync(path.join(raiz, 'codigo'), String(codigo));
    return spawnSync(process.execPath, [path.join(F, 'vozes', 'vozes.js'), '--sem-listar', '--sem-gravar', '--sem-empacotar'],
      { cwd: raiz, encoding: 'utf8', env: { ...process.env, PATH: '/usr/bin:/bin', REINO_VOZES_VENV: venv } });
  };
  const chamadas = () => (fs.existsSync(log) ? fs.readFileSync(log, 'utf8').trim().split('\n') : []);
  // 1ª rodada falhou no meio: o índice parcial (k0) não pode virar "antes"
  fs.mkdirSync(path.dirname(conferido), { recursive: true });
  fs.writeFileSync(conferido, '{}');
  fs.writeFileSync(path.join(G, 'vozes-indice.json'), JSON.stringify({ k0: 'claude/a.mp3' }));
  let r = rodar(1);
  assert.strictEqual(r.status, 1, r.stdout);
  assert.match(chamadas()[0], /--antes .*indice-conferido\.json/);
  assert.strictEqual(fs.readFileSync(conferido, 'utf8'), '{}', 'conferência que reprovou não marca nada');
  // de novo, agora passa: confere contra o {} (inclui o k0) e marca o índice como conferido
  r = rodar(0);
  assert.strictEqual(r.status, 0, r.stdout);
  assert.strictEqual(chamadas().length, 2);
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(conferido, 'utf8')), { k0: 'claude/a.mp3' });
  // nada mudou: pula a conferência sem rodar o Python
  r = rodar(1);
  assert.strictEqual(r.status, 0, r.stdout);
  assert.match(r.stdout, /nenhuma gravação nova/);
  assert.strictEqual(chamadas().length, 2);
});
