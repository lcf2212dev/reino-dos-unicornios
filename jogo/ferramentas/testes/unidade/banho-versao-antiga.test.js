// Testes de unidade: um aparelho da versão da main 9985fa7 (sem banho; progresso.js e cuidados.js tirados com git show) junto com um aparelho de hoje: o banho não some nem zera.
// Alvo: js/sistemas/cuidados.js e progresso*.js. Saves 100% sintéticos, num vm (ajudantes/jogo-save.js); nada toca no save real.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/banho-versao-antiga.test.js   (tudo: npm test, na raiz do repositório)
// Casos vindos de ferramentas/testes/testar-banho.js (divididos por assunto na Fase 3).
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { Jogo, montar, saveHoje, copia } = require('./ajudantes/jogo-save');
const raiz = Jogo.raiz;

/* ---------- aparelho da versão de hoje (main 9985fa7) ---------- */
function pastaAntiga() {
  const dir = '/tmp/reino-banho-pw/b1/antigo';
  const arqs = ['progresso.js', 'cuidados.js'];
  if (!arqs.every((f) => fs.existsSync(path.join(dir, f)))) {
    fs.mkdirSync(dir, { recursive: true });
    arqs.forEach((f) => fs.writeFileSync(path.join(dir, f), execFileSync('git', ['show', '9985fa7:jogo/js/' + f], { cwd: raiz })));
  }
  return dir;
}

test('aparelho da versão de hoje grava, gasta, come, bebe e mescla um save com banho: o banho não some nem zera', () => {
  const antigo = pastaAntiga();
  // 1. versão nova: banho dado e depois gasto um pouco; grava (save + cópia)
  const loja = {};
  const N = montar({ loja, save: saveHoje() });
  N.P.carregar();
  N.P.estado().cuidados.inicial.banho = 30;
  assert.ok(N.C.banhar().ok);
  N.C.avancar(18 * 60 * 1000);   // banho 90
  N.P.salvar();
  const banhoN = N.P.estado().cuidados.inicial.banho, carimboN = N.P.estado().cuidados.inicial.acaoBanho;
  assert.ok(Math.abs(banhoN - 90) < 1e-9);
  // 2. versão de hoje no mesmo navegador: carrega, gasta, come, bebe, grava
  const V = montar({ loja, antigo, agora: N.relogio.agora + 1000 });
  V.P.carregar();
  assert.strictEqual(V.P.estado().cuidados.inicial.banho, banhoN, 'a versão de hoje perdeu o banho ao carregar');
  V.C.iniciar();
  for (let m = 0; m < 5; m++) { V.tocar(); V.andar(60 * 1000); }
  V.P.estado().despensa.maca = { compradas: 5, usadas: 1 };
  assert.ok(V.C.alimentar('inicial', 'maca').ok);
  assert.ok(V.C.beber('inicial').ok);
  V.P.salvar();
  const gravadoV = JSON.parse(loja[V.chave]);
  assert.strictEqual(gravadoV.cuidados.inicial.banho, banhoN);
  // 3. a versão de hoje mescla com um remoto que tem banho e com um remoto sem banho (mais novo)
  const remotoCom = copia(gravadoV); remotoCom.cuidados.inicial.banho = 5; remotoCom.cuidados.inicial.acaoBanho = carimboN - 100; remotoCom.atualizado += 10;
  const m1 = V.P.mesclar(copia(V.P.estado()), remotoCom);
  assert.strictEqual(typeof m1.cuidados.inicial.banho, 'number');
  const remotoSem = copia(gravadoV); delete remotoSem.cuidados.inicial.banho; delete remotoSem.cuidados.inicial.acaoBanho;
  remotoSem.cuidados.inicial.em += 99999; remotoSem.atualizado += 20;
  const m2 = V.P.mesclar(copia(V.P.estado()), remotoSem);    // aqui a versão de hoje pode perder o banho...
  assert.ok(!('banho' in m2.cuidados.inicial), 'o pior caso não aconteceu (o teste não testaria nada)');
  // ...e grava isso no aparelho (o pior caso): a cópia -novidades é da versão de hoje também, com o banho
  loja[V.chave] = JSON.stringify(m2);
  // 4. de volta à versão nova: o banho não sumiu nem zerou, e a comida e a água dadas na versão de hoje valem
  const N2 = montar({ loja, agora: V.relogio.agora + 1000 });
  const e = N2.P.carregar();
  const r = e.cuidados.inicial;
  assert.strictEqual(typeof r.banho, 'number', 'o banho sumiu');
  assert.ok(r.banho > 0, 'o banho zerou');
  assert.strictEqual(r.banho, banhoN, 'o banho não é o que a versão nova deixou');
  assert.strictEqual(r.acaoBanho, carimboN);
  assert.ok(r.acao >= gravadoV.cuidados.inicial.acao && r.sede === 100, 'a água da versão de hoje não valeu');
  // 5. a versão nova mescla com o estado da versão de hoje sem banho, nas duas ordens: o banho fica
  [[e, m2], [m2, e]].forEach(([a, b]) => {
    const c = N2.P.mesclar(copia(a), copia(b)).cuidados.inicial;
    assert.strictEqual(c.banho, banhoN);
  });
  // 6. o `acao` do banho nunca foi visto como comida pela versão de hoje: um remoto só com banho novo
  //    (acao igual) não mexe na fome nem na sede da versão de hoje
  const soBanhou = copia(gravadoV); soBanhou.cuidados.inicial.banho = 100; soBanhou.cuidados.inicial.acaoBanho = carimboN + 5000;
  soBanhou.cuidados.inicial.fome = 100; soBanhou.cuidados.inicial.sede = 100;
  const antesV = copia(V.P.estado().cuidados.inicial);
  const m3 = V.P.mesclar(copia(V.P.estado()), soBanhou).cuidados.inicial;
  assert.strictEqual(m3.fome, Math.min(antesV.fome, 100));
});

test('aparelho da versão de hoje sem cópia (outro navegador): servidor sem banho não apaga o banho do aparelho novo', () => {
  const antigo = pastaAntiga();
  const lojaN = {};
  const N = montar({ loja: lojaN, save: saveHoje() });
  N.P.carregar(); N.P.estado().cuidados.inicial.banho = 30; assert.ok(N.C.banhar().ok); N.C.avancar(36 * 60 * 1000);
  const banho = N.P.estado().cuidados.inicial.banho;
  // o outro aparelho (versão de hoje) nunca viu o banho: estado dele, mais novo, com carimbos de fome/sede
  const V = montar({ save: saveHoje(), antigo, agora: N.relogio.agora + 5000 });
  V.P.carregar(); V.P.estado().despensa.maca = { compradas: 5, usadas: 1 }; assert.ok(V.C.alimentar('inicial', 'maca').ok); V.P.salvar();
  const doV = copia(V.P.estado());
  assert.ok(!('banho' in doV.cuidados.inicial));
  // a versão de hoje junta o do aparelho novo e manda ao servidor: pode ou não levar o banho
  const naVersaoHoje = V.P.mesclar(copia(V.P.estado()), copia(N.P.estado()));
  // o aparelho novo recebe os dois (cada um pode ter perdido): o banho continua
  [doV, naVersaoHoje].forEach((remoto) => {
    [[N.P.estado(), remoto], [remoto, N.P.estado()]].forEach(([a, b]) => {
      const c = N.P.mesclar(copia(a), copia(b)).cuidados.inicial;
      assert.strictEqual(c.banho, banho);
      assert.ok(c.fome > 64.5, 'a comida da versão de hoje não valeu');
    });
  });
});
