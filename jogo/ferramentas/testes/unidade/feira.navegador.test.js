// Feira: brincadeira completa no Chrome com save sintético; tentativa, descoberta, passaporte e teclado.
const test = require('node:test');
const assert = require('node:assert/strict');
const { abrirCenario } = require('../cenario');

test('feira: todas as descobertas mudam a cena, não gastam progresso e preservam o passaporte ao reabrir', async () => {
  const c = await abrirCenario({ save: 'completo', tamanho: 'celular', pasta: '/tmp/reino-testes/ver/teste-feira' });
  try {
    await c.ir('feira');
    const antes = await c.js('({estrelas: Reino.Progresso.estrelas(), salas: JSON.stringify(Reino.Progresso.estado().salas)})');
    const salas = await c.js('Reino.FeiraCiencias.salas');
    await c.js('void Reino.UI.telaFeira()'); await c.avancar(600);
    assert.equal(await c.js("document.querySelectorAll('.feira-selo').length"), 5);
    await c.tecla('Escape');
    for (const sala of salas) for (const m of sala.missoes) {
      await c.js(`void Reino.UI.telaFeira({sala:${JSON.stringify(sala.id)},missao:${JSON.stringify(m.id)}})`);
      await c.avancar(600);
      const cenaAntes = await c.js("document.querySelector('.feira-palco canvas').toDataURL()");
      const errada = m.opcoes.find(o => o.id !== m.certa);
      await c.tocar(`[data-escolha="${errada.id}"]`);
      assert.equal(await c.js(`Reino.FeiraCiencias.visita().feitas.includes(${JSON.stringify(m.id)})`), false);
      assert.equal(await c.js("document.querySelectorAll('.feira-peca').length"), 3, 'todas as peças continuam disponíveis');
      assert.ok(await c.js("document.querySelector('.feira-recado').textContent").then(t => m.dica.every(l => t.replace(/\u00ad/g, '').includes(l))));
      await c.tocar(`[data-escolha="${m.certa}"]`);
      assert.equal(await c.js(`Reino.FeiraCiencias.visita().feitas.includes(${JSON.stringify(m.id)})`), true);
      assert.notEqual(await c.js("document.querySelector('.feira-palco canvas').toDataURL()"), cenaAntes, m.id + ': efeito desenhado');
      assert.equal(await c.js("document.querySelectorAll('.feira-peca').length"), 0, 'passa para descoberta');
      await c.tecla('Escape');
    }
    await c.js('void Reino.UI.telaFeira()'); await c.avancar(600);
    assert.equal(await c.js("document.querySelectorAll('.feira-selo.carimbado').length"), 5);
    assert.equal(await c.js('Reino.FeiraCiencias.visita().feitas.length'), 25);
    assert.deepEqual(await c.js('({estrelas: Reino.Progresso.estrelas(), salas: JSON.stringify(Reino.Progresso.estado().salas)})'), antes);
    const m = salas[0].missoes[0];
    // Tab e Enter abrem um tema; Esc volta ao mundo.
    await c.tecla('Tab');
    const foco = await c.js("document.activeElement && document.activeElement.closest('.tela-feira') !== null");
    assert.ok(foco, 'foco dentro do painel');
    await c.tecla('Escape');
    await c.js(`void Reino.UI.telaFeira({sala:'jardim',missao:${JSON.stringify(m.id)}})`); await c.avancar(600);
    await c.tocar('.feira-acoes .feira-botao');
    assert.equal(await c.js("document.querySelectorAll('.feira-peca').length"), 3, 'refazer continua livre');
    await c.avancar(600);
    await c.page.locator(`[data-escolha="${m.certa}"]`).focus();
    await c.tecla('Enter');
    assert.equal(await c.js('Reino.FeiraCiencias.visita().feitas.length'), 25, 'repetir não duplica');
    await c.tecla('Escape');
    assert.equal(await c.js('Reino.UI.temTela()'), false);
    assert.deepEqual(c.erros, []);
  } finally { await c.fechar(); }
});

test('feira: Aura 4× apenas em 02/10, sem duplicação e com virada do dia na atividade aberta', async () => {
  for (const [dia, ganho, aviso] of [
    ['2026-10-01', 2, 'Amanhã: aura 4×'],
    ['2026-10-02', 8, 'Hoje: aura 4×'],
    ['2026-10-03', 2, 'Cada descoberta dá aura!'],
  ]) {
    const c = await abrirCenario({ save: 'completo', tamanho: 'celular', mudar: { aura: { mariana: { d: 0, em: 1 } } } });
    try {
      await c.ir('feira');
      await c.js(`Reino.util.hoje = function () { return ${JSON.stringify(dia)}; }`);
      const m = await c.js('Reino.FeiraCiencias.salas[0].missoes[0]');
      const abrir = async () => {
        await c.js(`void Reino.UI.telaFeira({sala:'jardim',missao:${JSON.stringify(m.id)}})`);
        await c.avancar(600);
      };
      await abrir();
      assert.ok((await c.js("document.querySelector('.feira-bonus').textContent")).replace(/\u00ad/g, '').includes(aviso), dia);
      await c.tocar(`[data-escolha="${m.opcoes.find(o => o.id !== m.certa).id}"]`);
      assert.equal(await c.js('Reino.Aura.decimos()'), 0, 'outra peça não tira nem dá Aura');
      // Dispara duas vezes o mesmo botão, inclusive já removido do painel.
      await c.page.evaluate(id => {
        const b = document.querySelector(`[data-escolha="${id}"]`); b.click(); b.click();
      }, m.certa);
      await c.avancar(400);
      assert.equal(await c.js('Reino.Aura.decimos()'), ganho, dia + ': conta uma vez');
      assert.ok((await c.js("document.querySelector('.feira-ganho').textContent")).includes(`+0,${ganho}`));
      await c.tecla('Escape'); await abrir();
      assert.equal(await c.js('Reino.Aura.decimos()'), ganho, 'reabrir resultado não rende');
      assert.equal(await c.js("document.querySelector('.feira-ganho') === null"), true);
      await c.tocar('.feira-acoes .feira-botao');
      await c.tocar(`[data-escolha="${m.certa}"]`);
      assert.equal(await c.js('Reino.Aura.decimos()'), ganho * 2, 'refazer rende novamente');
      if (dia === '2026-10-01') {
        await c.tocar('.feira-acoes .feira-botao');
        await c.js("Reino.util.hoje = function () { return '2026-10-02'; }; Reino.Progresso.estado().aura.mariana.d = 98");
        await c.tocar(`[data-escolha="${m.certa}"]`);
        assert.equal(await c.js('Reino.Aura.decimos()'), 106, '4× um passo, mesmo atravessando uma faixa');
        assert.ok((await c.js("document.querySelector('.feira-bonus').textContent")).includes('Hoje: aura 4×'));
      }
      const atual = await c.js('Reino.Aura.decimos()');
      assert.equal(await c.js("JSON.parse(localStorage.getItem('mariana-reino-v1')).aura.mariana.d"), atual, 'Aura persiste no save sintético');
      assert.deepEqual(c.erros, []);
    } finally { await c.fechar(); }
  }
});
