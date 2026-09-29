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
