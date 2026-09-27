// Rastro de estrelinhas (loja: usando.estrelinhas; personagens/jogador.js e jogador-desenho.js): sem Animações ou com
// "reduzir movimento", nada de partículas (jogo/js/CLAUDE.md, Arte). Andando, o guardarRastro soltava faíscas (com
// Math.random) e o desenho as pintava sem olhar se as animações estavam ligadas (bug da auditoria motor-central).
// Servidor e banco de TESTE novos por cenário (cenario.js); save sintético; congelado = movimento reduzido.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');

const pasta = () => fs.mkdtempSync(path.join(PASTA_TESTES, 'estrelinhas-'));

for (const modo of ['movimento reduzido (congelado)', 'Ajustes → Animações desligado']) {
  test(`rastro de estrelinhas não solta faíscas com ${modo}`, async () => {
    const c = await abrirCenario({ tamanho: 'notebook', save: 'completo',
      pasta: pasta() });
    try {
      await c.js(`Reino.Claude.limpar && Reino.Claude.limpar();
        var est = Reino.Progresso.estado(); est.usando.estrelinhas = true;
        ${modo.startsWith('Ajustes') ? 'est.ajustes.animacoes = false;' : ''}
        Jogador.faiscas = []; Jogador.posicionar(27, 28); 'ok'`);
      await c.avancar(100);
      const animar = await c.js('Reino.Progresso.estado().ajustes.animacoes && !Reino.util.reduzMovimentoSistema');
      assert.strictEqual(animar, false, 'pré-condição: sem animação');
      await c.page.keyboard.down('ArrowRight');
      await c.avancar(400);
      const n = await c.js('Jogador.faiscas.length');
      await c.page.keyboard.up('ArrowRight');
      assert.strictEqual(n, 0, 'andando sem animação não há faíscas para desenhar (veio ' + n + ')');
    } finally { await c.fechar(); }
  });
}

// faíscas que sobraram de quando as animações estavam ligadas: com elas desligadas, o desenho não as pinta
// (itensDesenho não traz o item das faíscas; o pintor falso basta, porque nenhum item é desenhado aqui)
test('sem animação, faíscas que sobraram não entram no desenho dela', async () => {
  const c = await abrirCenario({ tamanho: 'notebook', save: 'completo', pasta: pasta() });
  try {
    const r = await c.js(`Reino.Claude.limpar && Reino.Claude.limpar();
      var est = Reino.Progresso.estado(); est.usando.estrelinhas = true; est.ajustes.animacoes = false;
      Jogador.posicionar(27, 28);
      Jogador.faiscas = []; var sem = Jogador.itensDesenho({}, false).length;
      Jogador.faiscas = [{ x: Jogador.x, y: Jogador.y - 6, v: 0 }, { x: Jogador.x + 2, y: Jogador.y - 8, v: 0.1 }];
      var com = Jogador.itensDesenho({}, false).length;
      ({ sem: sem, com: com })`);
    assert.strictEqual(r.com, r.sem, 'o item das faíscas não entra no desenho sem animação (' + JSON.stringify(r) + ')');
  } finally { await c.fechar(); }
});
