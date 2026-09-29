// Testes de unidade: o jogo sem rede ao abrir (o app instalado, offline; js/sistemas/progresso-nuvem.js).
// Com o save no aparelho, joga sem a nuvem (P.podeJogarSemNuvem) e P.reconectarNuvem tenta de novo quando a rede
// volta: junta com o banco e envia o que foi feito sem rede, uma vez só. Aparelho sem save (nunca começou) não
// joga sem a nuvem (abriria como jogo novo). Saves 100% sintéticos, num vm (ajudantes/jogo-save.js).
// Rodar (em jogo/): node --test ferramentas/testes/unidade/nuvem-reconectar.test.js
const { test } = require('node:test');
const assert = require('assert');
const { montar, saveAtual, copia } = require('./ajudantes/jogo-save');

const esperar = (ms) => new Promise((ok) => setTimeout(ok, ms));

// claude.ai de mentira: sem rede enquanto `rede.fora`; o banco guarda o que chega
function comRede(j, guardado) {
  const rede = { fora: true, usos: 0, sets: [] };
  j.ctx.claude = { use: () => {
    rede.usos++;
    if (rede.fora) return Promise.reject(new Error('sem rede'));
    return Promise.resolve({ doc: () => ({
      get: () => Promise.resolve({ exists: !!guardado, data: () => (guardado ? { estado: copia(guardado), atualizado: guardado.atualizado, versaoMescla: 2 } : undefined) }),
      set: (d) => { rede.sets.push(copia(d)); return Promise.resolve(); },
      onSnapshot: () => {},
    }) });
  } };
  return rede;
}
const online = (j) => (j.ouvintes['win:online'] || []).forEach((f) => f());

test('offline: com o save no aparelho joga sem a nuvem e, quando a rede volta, envia o que fez', async () => {
  const j = montar({ save: saveAtual(), timersReais: true });
  j.P.carregar();
  const banco = copia(j.P.estado());
  const rede = comRede(j, banco);
  await assert.rejects(j.P.iniciarNuvem());
  assert.strictEqual(j.P.podeJogarSemNuvem(), true);
  assert.strictEqual(j.P.statusNuvem(), 'local');
  j.P.reconectarNuvem();
  j.P.gastarEstrelas(1); j.P.salvar(true);          // jogou sem rede
  const gastas = j.P.estado().estrelas.gastas;
  online(j);                                        // ainda sem rede: falha e continua tentando
  await esperar(20);
  assert.strictEqual(j.P.statusNuvem(), 'local');
  rede.fora = false;
  online(j);
  await esperar(50);
  assert.strictEqual(j.P.statusNuvem(), 'sincronizado');
  assert.ok(rede.sets.length >= 1, 'não enviou o que foi feito sem rede');
  assert.strictEqual(rede.sets[rede.sets.length - 1].estado.estrelas.gastas, gastas);
  const usos = rede.usos;
  online(j);                                        // conectado: para de tentar
  await esperar(20);
  assert.strictEqual(rede.usos, usos);
});

test('offline: aparelho que nunca começou não joga sem a nuvem', () => {
  const j = montar({});
  j.P.carregar();
  assert.strictEqual(j.P.podeJogarSemNuvem(), false);
});
