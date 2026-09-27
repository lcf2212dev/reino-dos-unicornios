// Testes de unidade: o que a sincronização com o claude.ai faz com cada erro do `set` (js/sistemas/progresso-nuvem.js).
// Suspeita da auditoria (fx2): depois do `invalid_argument` a nuvem fica desligada até recarregar. É de propósito:
// pelo contrato da capacidade db (db.d.ts), `invalid_argument` é permanente (doc acima de 256 KiB, escrita abaixo
// do nível mínimo do visitante: "retrying cannot succeed", "read-only for the rest of the visit"); `revoked` e
// `not_granted` também. O que é passageiro (`unavailable`, código desconhecido, erro sem código, sem resposta)
// tenta de novo sozinho e volta a "sincronizado". Este teste guarda as duas metades; o aparelho nunca perde nada.
// Saves 100% sintéticos, num vm (ajudantes/jogo-save.js); nada toca no save real nem no artifact publicado.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/nuvem-erros.test.js
const { test } = require('node:test');
const assert = require('assert');
const { montar, saveAtual, copia } = require('./ajudantes/jogo-save');

const esperar = (ms) => new Promise((ok) => setTimeout(ok, ms));

// claude.ai de mentira: a 1ª gravação falha com `erro`; as outras dão certo
async function comErroNaPrimeira(erro) {
  const j = montar({ save: saveAtual(), timersReais: true });
  j.R.config.limiteRedeMs = 200; j.R.config.novaTentativaMs = 40;
  j.P.carregar();
  const sets = [];
  j.ctx.claude = { use: () => Promise.resolve({ doc: () => ({
    get: () => Promise.resolve({ exists: false, data: () => undefined }),
    set: (d) => { sets.push(copia(d)); return sets.length === 1 ? Promise.reject(erro) : Promise.resolve(); },
    onSnapshot: () => {},
  }) }) };
  await j.P.iniciarNuvem();                // o 1º envio sai aqui (a Mariana já começou)
  await esperar(150);
  return { j, sets };
}

for (const [nome, erro] of [['unavailable', { code: 'unavailable', message: 'x' }], ['código desconhecido', { code: 'queue_overflow' }],
  ['erro sem código', new Error('rede')]]) {
  test('nuvem: erro passageiro (' + nome + ') tenta de novo sozinho e volta a sincronizar', async () => {
    const { j, sets } = await comErroNaPrimeira(erro);
    assert.ok(sets.length >= 2, 'não tentou de novo');
    assert.strictEqual(j.P.statusNuvem(), 'sincronizado');
    assert.deepStrictEqual(sets[sets.length - 1].estado.salas, j.P.estado().salas);
  });
}

for (const code of ['invalid_argument', 'revoked', 'not_granted']) {
  test('nuvem: erro permanente (' + code + ') desliga a nuvem da sessão, sem mexer no aparelho', async () => {
    const { j, sets } = await comErroNaPrimeira({ code, message: 'x' });
    const antes = JSON.stringify(j.P.estado());
    assert.strictEqual(sets.length, 1, 'repetiu um envio que não pode dar certo');
    assert.strictEqual(j.P.statusNuvem(), 'local');
    j.P.gastarEstrelas(1); j.P.salvar(true);  // o jogo segue gravando no aparelho
    await esperar(100);
    assert.strictEqual(sets.length, 1);
    assert.notStrictEqual(JSON.stringify(j.P.estado()), antes);
    assert.strictEqual(j.lido().estrelas.gastas, j.P.estado().estrelas.gastas, 'o aparelho não gravou');
  });
}
