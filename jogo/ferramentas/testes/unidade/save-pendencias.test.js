// Dois defeitos do save que eram pendências da auditoria de 27/09/2026 e foram corrigidos com carimbos por escolha
// (`escolhasEm`, marcado pelo P.salvar) e por pagamento (`pagoEm`, marcado pelo P.registrarPagamento), com a regra
// nova do P.mesclar autorizada pelo Leandro (docs/contratos/save-e-mescla.md §4.6 e §4.7):
//   1. escolha feita num aparelho voltava atrás quando o outro, sem tê-la recebido, gravava depois;
//   2. "Já pago" corrigido para MENOS voltava ao maior na sincronização.
// Mais casos (versão antiga, comutatividade, cópia): save-escolhas-mescla.test.js e save-escolhas-versao-antiga.test.js.
// Dois aparelhos no mesmo doc (claude.ai de mentira: o banco guarda o último envio, como o servidor de casa).
// Saves 100% sintéticos, num vm (ajudantes/jogo-save.js).
const { test } = require('node:test');
const assert = require('assert');
const { montar, saveAtual, copia, esperar } = require('./ajudantes/jogo-save');

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
    // o envio (1,8 s depois de gravar) e o que mais estiver na fila de timers
    d.enviar = async () => { const ts = d.timers.splice(0); ts.forEach((f) => f()); await esperar(); await esperar(); };
    // o aparelho confere o banco (onSnapshot do claude.ai / a leitura a cada 20 s do servidor de casa)
    d.conferir = async () => { d.snap({ exists: true, metadata: { hasPendingWrites: false }, data: () => copia(banco.valor) }); await esperar(); };
    return d;
  };
  return banco;
}

async function doisAparelhos() {
  const base = saveAtual();
  const banco = bancoCompartilhado({ estado: base, atualizado: base.atualizado });
  const A = montar({ save: copia(base) }), B = montar({ save: copia(base) });
  A.P.carregar(); B.P.carregar();
  const dA = banco.ligar(A), dB = banco.ligar(B);
  await A.P.iniciarNuvem(); await B.P.iniciarNuvem(); await esperar();
  await dA.enviar(); await dB.enviar();
  return { A, B, dA, dB };
}

// o P.salvar envia o estado inteiro e o P.mesclar pegava nome, montaria, usando, aparência e ajustes do lado com
// `atualizado` maior: a gravação sozinha do outro aparelho (cuidados, a cada 60 s) desfazia a escolha dela

test('nome dado ao unicórnio num aparelho não some quando o outro grava os cuidados sozinho', async () => {
  const { A, B, dA, dB } = await doisAparelhos();
  A.relogio.agora += 1000; B.relogio.agora += 1000;
  A.P.estado().unis.inicial.nome = 'Pipoca';   // tablet: ui/estabulo.js
  A.P.salvar();
  await dA.enviar();
  A.relogio.agora += 5000; B.relogio.agora += 5000;
  B.P.salvar();                                // notebook, ainda sem conferir o banco: a gravação dos cuidados
  await dB.enviar();
  await dA.conferir(); await dA.enviar();      // o tablet junta e devolve o nome ao banco (agendarNuvem, 1,8 s)
  await dB.conferir();
  assert.strictEqual(A.P.estado().unis.inicial.nome, 'Pipoca', 'o nome que ela deu no tablet continua no tablet');
  assert.strictEqual(B.P.estado().unis.inicial.nome, 'Pipoca', 'e chega ao notebook');
});

test('montaria escolhida num aparelho não volta atrás quando o outro grava os cuidados sozinho', async () => {
  const { A, B, dA, dB } = await doisAparelhos();
  A.relogio.agora += 1000; B.relogio.agora += 1000;
  A.P.estado().montaria = 'h-cartinha';        // ui/estabulo.js "Montar"
  A.P.salvar();
  await dA.enviar();
  A.relogio.agora += 5000; B.relogio.agora += 5000;
  B.P.salvar();
  await dB.enviar();
  await dA.conferir(); await dB.conferir();
  assert.strictEqual(A.P.estado().montaria, 'h-cartinha', 'a montaria que ela escolheu continua');
});

// `pago` se juntava pelo MAIOR (progresso-mescla.js): o 1000 digitado por engano voltava do outro aparelho
// (em moedas, como os pais digitam; o save guarda reais: R$ 4 = 10 moedas)
test('pagamento corrigido para menos na Área dos pais vale nos dois aparelhos', async () => {
  const { A, B, dA, dB } = await doisAparelhos();   // pago.historia = 4 (reais) no save sintético
  A.relogio.agora += 1000; B.relogio.agora += 1000;
  A.P.registrarPagamento('historia', 1000);        // notebook do pai: 1000 por engano (ui/pais.js)
  await dA.enviar();
  await dB.conferir(); await dB.enviar();          // o tablet recebe o 1000
  assert.strictEqual(B.P.pago('historia'), 1000);
  A.relogio.agora += 30000; B.relogio.agora += 30000;
  A.P.registrarPagamento('historia', 100);         // o pai corrige
  await dA.enviar();
  assert.strictEqual(A.P.pago('historia'), 100, 'no notebook, logo depois de corrigir, vale 100');
  await dB.conferir(); await dB.enviar();
  await dA.conferir(); await dA.enviar();
  assert.strictEqual(B.P.pago('historia'), 100, 'o tablet fica com a correção do pai');
  assert.strictEqual(A.P.pago('historia'), 100, 'o notebook não volta para 1000');
});
