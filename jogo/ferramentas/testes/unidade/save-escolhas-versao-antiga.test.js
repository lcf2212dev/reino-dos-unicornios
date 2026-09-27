// Testes de unidade: os carimbos das escolhas (`escolhasEm`) e do pago (`pagoEm`) com um aparelho da versão ANTIGA
// (main 1510c1c, de antes dos carimbos: progresso*.js e cuidados.js tirados com git show) e outro da versão nova,
// no mesmo doc (claude.ai de mentira), nos dois sentidos. A escolha feita na versão nova não volta atrás, a correção
// do pago vale, nenhuma conquista some, e a versão antiga guarda os carimbos que não conhece.
// Alvo: js/sistemas/progresso*.js (docs/contratos/save-e-mescla.md §4.6–4.7). Saves 100% sintéticos, num vm.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/save-escolhas-versao-antiga.test.js   (tudo: npm test, na raiz)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { Jogo, montar, saveAtual, copia, esperar } = require('./ajudantes/jogo-save');
const { PASTA_TESTES } = require('../guardas');

const ANTIGA = '1510c1c';
// o progresso antigo em quatro partes vira um progresso.js só (é o que montar({ antigo }) carrega)
function pastaAntiga() {
  fs.mkdirSync(PASTA_TESTES, { recursive: true });
  const dir = fs.mkdtempSync(path.join(PASTA_TESTES, 'escolhas-antiga-'));
  const mostrar = (f) => execFileSync('git', ['show', ANTIGA + ':jogo/js/sistemas/' + f], { cwd: Jogo.raiz, encoding: 'utf8' });
  fs.writeFileSync(path.join(dir, 'progresso.js'), ['progresso.js', 'progresso-mescla.js', 'progresso-nuvem.js', 'progresso-regras.js'].map(mostrar).join('\n'));
  fs.writeFileSync(path.join(dir, 'cuidados.js'), mostrar('cuidados.js'));
  return dir;
}
const antigo = pastaAntiga();

// o doc de mentira guarda o último envio (como o servidor de casa); cada aparelho envia e confere quando o teste manda
function bancoCompartilhado(inicial) {
  const banco = { valor: copia(inicial) };
  banco.ligar = (j) => {
    const d = { snap: null, timers: [] };
    j.ctx.setTimeout = (fn) => { d.timers.push(fn); return d.timers.length; };
    j.ctx.clearTimeout = () => {};
    j.ctx.claude = { use: () => Promise.resolve({ doc: () => ({
      get: () => Promise.resolve({ exists: true, data: () => copia(banco.valor) }),
      set: (x) => { banco.valor = copia(x); return Promise.resolve(); },
      onSnapshot: (fn) => { d.snap = fn; },
    }) }) };
    d.enviar = async () => { const ts = d.timers.splice(0); ts.forEach((f) => f()); await esperar(); await esperar(); };
    d.conferir = async () => { d.snap({ exists: true, metadata: { hasPendingWrites: false }, data: () => copia(banco.valor) }); await esperar(); };
    return d;
  };
  return banco;
}
async function aparelhos() {
  const base = saveAtual();
  const banco = bancoCompartilhado({ estado: base, atualizado: base.atualizado });
  const N = montar({ save: copia(base) }), V = montar({ save: copia(base), antigo });
  N.P.carregar(); V.P.carregar();
  const dN = banco.ligar(N), dV = banco.ligar(V);
  await N.P.iniciarNuvem(); await V.P.iniciarNuvem(); await esperar();
  await dN.enviar(); await dV.enviar();
  const andar = (ms) => { N.relogio.agora += ms; V.relogio.agora += ms; };
  // os dois conferem o banco e devolvem o que a junção trouxe, até parar de mudar (o relógio anda entre um e
  // outro: com a hora parada, a versão antiga fica com o próprio estado no empate do `atualizado`)
  const sincronizar = async () => {
    for (let i = 0; i < 3; i++) { andar(1000); await dN.conferir(); await dN.enviar(); andar(1000); await dV.conferir(); await dV.enviar(); }
  };
  return { N, V, dN, dV, banco, andar, sincronizar };
}
function conquistas(e) { return { h1: e.salas.h1.melhor, h3: !!e.salas.h3, ganhas: e.estrelas.ganhas, loja: Object.keys(e.loja).sort(), xp: e.unis.inicial.xp }; }

test('versão nova troca (montaria, nome, som) e a antiga grava depois sem saber: nada volta atrás; o pago segue a regra antiga', async () => {
  const { N, V, dN, dV, banco, andar, sincronizar } = await aparelhos();
  andar(1000);
  N.P.estado().montaria = 'h-cartinha'; N.P.estado().unis.inicial.nome = 'Pipoca'; N.P.estado().ajustes.som = false;
  N.P.salvar(); N.P.registrarPagamento('historia', 2);   // 4 → 2 (os pais corrigem)
  await dN.enviar();
  andar(5000);
  V.P.estado().salas.h3 = { vezes: 1, melhor: 5, feita: V.relogio.agora };   // conquista feita na versão antiga
  V.P.ganharEstrelas(3); V.P.salvar();                                        // e a gravação sozinha dela
  await dV.enviar();
  assert.strictEqual(banco.valor.estado.montaria, 'inicial', 'o pior caso aconteceu (a antiga mandou a montaria velha)');
  await sincronizar();
  [N, V].forEach((j, i) => {
    const e = j.P.estado(), lado = i ? 'versão antiga' : 'versão nova';
    assert.strictEqual(e.montaria, 'h-cartinha', lado); assert.strictEqual(e.unis.inicial.nome, 'Pipoca', lado);
    assert.strictEqual(e.ajustes.som, false, lado);
    // o pago corrigido para menos não resiste a um aparelho antigo aberto: a mescla antiga junta pelo maior e leva o
    // carimbo junto (empate = o maior). Volta à regra de antes, igual nos dois, sem vaivém
    assert.strictEqual(e.pago.historia, 4, lado);
    assert.deepStrictEqual(conquistas(e), { h1: 6, h3: true, ganhas: 40, loja: ['flor'], xp: 95 }, lado + ': conquistas');
  });
  assert.ok(V.P.estado().escolhasEm && V.P.estado().escolhasEm.montaria > 0, 'a versão antiga guarda o carimbo que não conhece');
  assert.ok(V.P.estado().pagoEm && V.P.estado().pagoEm.historia > 0);
  andar(1000); await dN.conferir(); await dV.conferir();
  assert.strictEqual(dN.timers.length + dV.timers.length, 0, 'sem vaivém: ninguém tem nada novo para mandar');
  // a antiga grava de novo (cuidados): o carimbo vai junto e a nova continua certa
  andar(60000); V.P.salvar(); await dV.enviar(); await dN.conferir();
  assert.strictEqual(N.P.estado().montaria, 'h-cartinha');
});

test('pago corrigido para menos entre dois aparelhos da versão nova, com a antiga fechada: vale a correção', async () => {
  const { N, V, dN, dV, andar, sincronizar } = await aparelhos();
  andar(1000); N.P.registrarPagamento('historia', 40); await dN.enviar();
  await sincronizar();
  assert.strictEqual(V.P.pago('historia'), 40);
  // a versão antiga sai de cena (a aba recarrega com a versão nova: mesmo save, mesma loja)
  const V2 = montar({ loja: V.guardado, agora: V.relogio.agora }); V2.P.carregar();
  assert.ok(V2.P.estado().pagoEm.historia > 0, 'o carimbo que a antiga guardou chega à nova');
  andar(1000); V2.relogio.agora = N.relogio.agora;
  N.P.registrarPagamento('historia', 4);
  assert.strictEqual(V2.P.mesclar(copia(V2.P.estado()), copia(N.P.estado())).pago.historia, 4);
  assert.strictEqual(V2.P.mesclar(copia(N.P.estado()), copia(V2.P.estado())).pago.historia, 4);
});

test('versão antiga troca primeiro (sem carimbo) e a nova, que não trocou, grava depois: a troca da antiga fica', async () => {
  const { N, V, dN, dV, andar, sincronizar } = await aparelhos();
  andar(1000);
  V.P.estado().montaria = 'h-cartinha'; V.P.estado().unis.inicial.nome = 'Da Antiga'; V.P.salvar();
  await dV.enviar();
  await dN.conferir();                                 // a nova recebe antes de gravar
  andar(5000);
  N.P.estado().salas.h3 = { vezes: 1, melhor: 7, feita: N.relogio.agora }; N.P.salvar();
  await dN.enviar();
  await sincronizar();
  [N, V].forEach((j) => {
    assert.strictEqual(j.P.estado().montaria, 'h-cartinha'); assert.strictEqual(j.P.estado().unis.inicial.nome, 'Da Antiga');
    assert.strictEqual(j.P.estado().salas.h3.melhor, 7);
  });
  // a nova troca por cima: vale nos dois
  andar(1000); N.P.estado().montaria = 'inicial'; N.P.salvar(); await dN.enviar();
  andar(1000); V.P.salvar(); await dV.enviar();        // a antiga ainda não recebeu e grava
  await sincronizar();
  assert.strictEqual(N.P.estado().montaria, 'inicial'); assert.strictEqual(V.P.estado().montaria, 'inicial');
});

test('mescla direta: o P.mesclar novo e o antigo, nos dois sentidos, não perdem conquista e o novo respeita o carimbo', () => {
  const N = montar(), V = montar({ antigo });
  const velho = saveAtual(); velho.atualizado = 1750900000000; velho.salas.h3 = { vezes: 2, melhor: 9, feita: 1 }; velho.estrelas.ganhas = 50;
  velho.montaria = 'inicial'; velho.pago.historia = 40;
  const novo = saveAtual(); novo.montaria = 'h-cartinha'; novo.escolhasEm = { montaria: 1750650000000 };
  novo.pago.historia = 4; novo.pagoEm = { historia: 1750650000000 }; novo.unis.nova = { em: 2, xp: 1, chocado: true };
  [[velho, novo], [novo, velho]].forEach(([x, y]) => {
    const r = N.P.mesclar(copia(x), copia(y)), rv = V.P.mesclar(copia(x), copia(y));
    assert.strictEqual(r.montaria, 'h-cartinha'); assert.strictEqual(r.pago.historia, 4);
    [r, rv].forEach((m) => {
      assert.strictEqual(m.salas.h3.melhor, 9); assert.strictEqual(m.estrelas.ganhas, 50); assert.ok(m.unis.nova);
    });
  });
});
