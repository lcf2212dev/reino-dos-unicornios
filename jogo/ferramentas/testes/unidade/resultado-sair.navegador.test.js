// O ✕ da tela de RESULTADO (prova da Escola, Treino da Medalha e fim da sala: atividades/provas.js, treino.js,
// missao.js). Antes ele abria o "Quer sair? Esta tentativa não vai contar…", mas no resultado a tentativa JÁ
// contou (registrarProva/registrarTreino/concluirSala já rodaram) e o "Chocar o ovo" era pulado (auditoria de
// bugs, fx2-telas). Correto: no resultado o ✕ faz o mesmo que o botão do fim (sem o aviso falso; com ovo, choca).
// Prova, treino e sala SINTÉTICOS (questões de escolha, a 1ª opção certa) sobre o save sintético 'inicio'
// (sem salas nem ovos); servidor e banco de TESTE novos (cenario.js); relógio congelado.
const { test, before, after } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('./ajudantes/terceiro-bimestre');

let c;
before(async () => { c = await abrirCenario({ tamanho: 'celular', save: 'inicio' }); });
after(async () => { if (c) await c.fechar(); });

// o botão visível da tela de cima com esse texto (clique de código: o botão pode estar fora da vista)
async function botao(re, ms = 600) {
  const ok = await c.js(`(function () {
    var t = [...document.querySelectorAll('#telas > .tela')].pop();
    var b = t && [...t.querySelectorAll('button')].find(function (x) { return ${re}.test(x.textContent) && !x.hidden && !x.disabled && x.offsetParent; });
    if (b) b.click();
    return !!b;
  })()`);
  if (!ok) throw new Error('sem botão ' + re);
  await c.avancar(ms);
}
// a opção certa ('Sim'; o treino embaralha a ordem)
const opcao = async () => {
  await c.js("[...[...document.querySelectorAll('#telas > .tela')].pop().querySelectorAll('.opcao')].find(function (o) { return /Sim/.test(o.textContent); }).click()");
  await c.avancar(10000);
};
const q = (n) => `{ id: 'rs-${n}', tipo: 'escolha', pergunta: 'Pergunta ${n}?', opcoes: [{ t: 'Sim' }, { t: 'Não' }], certa: 0, explica: 'Porque sim.' }`;
// toca o ✕ do resultado e conta o que aconteceu
async function sairPeloX() {
  await c.js("[...document.querySelectorAll('#telas > .tela')].pop().querySelector('.btn-sair').click()");
  await c.avancar(800);
  return c.js(`({
    confirmar: ((document.querySelector('.tela-confirmar') || {}).textContent || '').trim(),
    atividade: !!document.querySelector('.tela-prova, .tela-missao'),
    ovo: !!document.querySelector('.tela-ovo'),
    fim: window.__fim.slice(),
  })`);
}
// fecha o que sobrou (o teste de antes pode ter falhado no meio)
async function limpar() { await c.js('Reino.UI.fecharTodas(); Reino.Claude.limpar(); document.body.classList.remove("em-missao")'); await c.avancar(600); }

test('prova da Escola: o ✕ do resultado volta à Escola sem dizer que a tentativa não conta', async () => {
  await limpar();   // o teste de antes pode ter falhado com telas abertas
  await c.js(`window.__fim = []; Reino.Progresso.estado().ritualVisto = true;
    Reino.Provas.iniciar(Object.assign({}, Reino.provas[0], { id: 'teste-resultado-sair', questoes: [${q(1)}, ${q(2)}] }),
      function (p) { window.__fim.push(p ? 'premios' : null); })`);
  await c.avancar(600);
  await botao('/Começar a prova/');
  await botao('/Já respirei/');
  await opcao(); await botao('/Próxima/');
  await opcao(); await botao('/Terminei/');
  await botao('/Não, ver a nota/');
  assert.ok(await c.js("!!document.querySelector('.tela-prova .resultado-prova')"), 'chegou ao resultado');
  assert.strictEqual(await c.js("Reino.Progresso.estado().provas['teste-resultado-sair'].tentativas"), 1, 'a tentativa contou');
  const r = await sairPeloX();
  assert.deepStrictEqual(r, { confirmar: '', atividade: false, ovo: false, fim: ['premios'] });
  assert.deepStrictEqual(c.erros, []);
});

test('Treino da Medalha com ovo épico: o ✕ do resultado choca o ovo, sem o aviso de respostas não guardadas', async () => {
  await limpar();   // o teste de antes pode ter falhado com telas abertas
  await c.js(`window.__fim = [];
    var m = Reino.materia('historia');
    Reino.Prova.iniciar(Object.assign({}, m, { salas: [{ id: 'rs-treino', desafios: [${q(1)}, ${q(2)}, ${q(3)}] }] }),
      function (p) { window.__fim.push(p ? 'premios' : null); })`);
  await c.avancar(3000);
  await botao('/Já respirei/');
  await botao('/Começar o treino/');
  for (let i = 0; i < 3; i++) { await opcao(); await botao(i < 2 ? '/Próxima/' : '/Ir para a revisão/'); }
  for (let i = 0; i < 3; i++) {
    await c.js(`document.querySelectorAll('.tela-prova .item-revisao')[${i}].click()`); await c.avancar(600);
    await botao('/Revisei/');
  }
  await botao('/Entregar a prova/');
  assert.ok(await c.js("!!document.querySelector('.tela-prova .resultado-prova')"), 'chegou ao resultado');
  assert.strictEqual(await c.js("Reino.Progresso.estado().treinos.historia.vezes"), 1, 'o treino contou');
  assert.ok(await c.js("!!Reino.Progresso.estado().unis['h-ourinho']"), 'o ovo épico já é dela');
  const r = await sairPeloX();
  assert.deepStrictEqual(r, { confirmar: '', atividade: false, ovo: true, fim: [] });
  assert.deepStrictEqual(c.erros, []);
});

test('fim da sala com ovo: o ✕ choca o ovo, sem o "Quer sair da sala agora?"', async () => {
  await limpar();   // o teste de antes pode ter falhado com telas abertas
  await c.js(`window.__fim = [];
    var m = Reino.materia('historia'), s = m.salas[0];
    Reino.Missao.iniciar(m, Object.assign({}, s, { desafios: [${[1, 2, 3, 4, 5, 6].map(q).join(', ')}] }),
      function (p) { window.__fim.push(p ? 'premios' : null); })`);
  await c.avancar(1000);
  await botao('/Começar/');
  for (let i = 0; i < 6; i++) {
    await opcao();
    // escolha pode conferir sozinha; senão, o "Conferir"
    if (!(await c.js("!!document.querySelector('.missao-retorno:not([hidden]) .btn-principal')"))) await botao('/Conferir/');
    await c.js("document.querySelector('.missao-retorno .btn-principal').click()"); await c.avancar(800);
  }
  assert.ok(await c.js("!!document.querySelector('.tela-missao .fim-sala')"), 'chegou ao fim da sala');
  assert.ok(await c.js("!!Reino.Progresso.estado().salas[Reino.materia('historia').salas[0].id].feita"), 'a sala contou');
  const r = await sairPeloX();
  assert.deepStrictEqual(r, { confirmar: '', atividade: false, ovo: true, fim: [] });
  assert.deepStrictEqual(c.erros, []);
});
