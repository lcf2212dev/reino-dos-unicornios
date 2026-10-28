// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético, modo determinístico): os prêmios da trilha perfeita
// na interface (docs/contratos/quarto-bimestre.md §14.3). Sem trilha: a Loja mostra os 25 lendários bloqueados (nunca
// à venda), a tabela periódica mostra "?" nos 25 elementos da trilha (os outros abertos) e o álbum Experiências do
// Reino tem 25 silhuetas. Com trilhas.lp10a1: o acessório está ganho e se usa, o zinco abre e a carta da pilha de
// limão abre (com teclado: Enter abre, Voltar, Esc fecha). A vitrine física da Loja continua só com os da Escola.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/premios-trilha.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');

test('prêmios da trilha: Loja, tabela e álbum, sem e com a trilha do Gato de Botas', async () => {
  const c = await abrirCenario({ save: 'completo', tamanho: 'celular', pasta: '/tmp/reino-testes/ver/teste-premios-trilha' });
  try {
    // o save sintético não tem trilha nenhuma
    await c.js('(function () { var e = Reino.Progresso.estado(); e.trilhas = {}; })()');
    assert.deepStrictEqual(await c.js('Object.keys(Reino.Progresso.estado().trilhas)'), []);
    const nTrilha = await c.js('Reino.premiosTrilha.length');
    assert.strictEqual(nTrilha, 25);

    // Loja: 25 lendários da trilha, todos bloqueados, nenhum à venda; os da Escola continuam
    const loja = await c.js(`(function () {
      var L = Reino.LojaItens, P = Reino.Progresso, ps = L.premios(), tr = ps.filter(function (p) { return p.origem === 'trilha'; });
      return { n: tr.length, lend: tr.every(function (p) { return p.raridade === 'lendario' && p.sala; }),
        bloq: tr.every(function (p) { return L.estadoPremio(p, P) === 'bloqueado'; }),
        escola: ps.length - tr.length === Reino.provas.length * 3 };
    })()`);
    assert.deepStrictEqual({ n: loja.n, lend: loja.lend, bloq: loja.bloq, escola: loja.escola }, { n: 25, lend: true, bloq: true, escola: true });
    await c.js('void Reino.UI.telaLoja()');
    await c.avancar(600);
    assert.strictEqual(await c.js("document.querySelectorAll('.item-premio[data-item^=\"lpt-\"][data-estado=\"bloqueado\"]').length"), 25);
    assert.ok((await c.js("document.querySelector('[data-item=\"lpt-lp10a1\"]').textContent")).includes('Sem errar na trilha: O Gato de Botas'));
    await c.foto('loja-bloqueados');
    await c.js('Reino.UI.fecharTodas()');

    // tabela: "?" nos 25 da trilha, os outros com símbolo; a lista em ordem de z
    await c.js('void Reino.UI.telaQuimicaTabela()');
    await c.avancar(600);
    const tab = await c.js(`(function () {
      var bs = [].slice.call(document.querySelectorAll('.tela-quimica-tabela .qt-cartao'));
      var zs = bs.map(function (b) { return +b.dataset.z; });
      return { total: bs.length, fechados: bs.filter(function (b) { return b.classList.contains('qt-fechado'); }).length,
        interroga: bs.filter(function (b) { return b.querySelector('.qt-simb').textContent === '?'; }).length,
        ordem: zs.every(function (z, i) { return !i || zs[i - 1] < z; }) };
    })()`);
    assert.deepStrictEqual(tab, { total: 49, fechados: 25, interroga: 25, ordem: true });
    await c.tocar('.qt-cartao[data-z="30"]');
    assert.ok((await c.js("document.querySelector('.qt-ficha').textContent.replace(/\u00ad/g, '')")).includes('Ganhe numa trilha perfeita de Língua Portuguesa'));
    assert.ok(!(await c.js("document.querySelector('.qt-ficha').textContent")).includes('Zinco'));
    await c.foto('tabela-fechada');
    await c.js('Reino.UI.fecharTodas()');

    // álbum: 25 silhuetas
    await c.js('void Reino.UI.abrirExperiencias()');
    await c.avancar(600);
    assert.strictEqual(await c.js("document.querySelectorAll('.tela-quimica-experiencias .xp-cartao.silhueta').length"), 25);
    await c.foto('album-fechado');
    await c.js('Reino.UI.fecharTodas()');

    // ganha a trilha do Gato de Botas
    await c.js('(function () { Reino.Progresso.estado().trilhas = { lp10a1: 1000 }; Reino.Progresso.conferirTrilhas(); })()');
    assert.strictEqual(await c.js("Reino.LojaItens.estadoPremio(Reino.LojaItens.premios().filter(function (p) { return p.id === 'lpt-lp10a1'; })[0], Reino.Progresso)"), 'ganho');
    await c.js('void Reino.UI.telaLoja()');
    await c.avancar(600);
    await c.tocar('[data-item="lpt-lp10a1"]');
    assert.ok(await c.js("Reino.Progresso.estado().usando.enfeites.indexOf('lpt-lp10a1') >= 0"), 'Usar põe nos enfeites');
    await c.foto('loja-ganho');
    await c.js('Reino.UI.fecharTodas()');

    assert.strictEqual(await c.js('Reino.Quimica.elementoGanho(30)'), true);
    await c.js('void Reino.UI.telaQuimicaTabela({ z: 30 })');
    await c.avancar(600);
    assert.strictEqual(await c.js("document.querySelector('.qt-ficha-nome').textContent"), 'Zinco');
    await c.js('Reino.UI.fecharTodas()');

    // álbum: a carta da pilha de limão aberta; teclado: Enter abre, Voltar, Esc fecha
    await c.js('void Reino.UI.abrirExperiencias()');
    await c.avancar(600);
    assert.strictEqual(await c.js("document.querySelectorAll('.xp-cartao.amigo').length"), 1);
    await c.js("document.querySelector('[data-exp=\"exp-pilha-limao\"]').focus()");
    await c.tecla('Enter');
    await c.avancar(600);
    const carta = await c.js("document.querySelector('.xp-carta').textContent.replace(/\\u00ad/g, '')");
    assert.ok(carta.includes('Pilha de limão') && carta.includes('Faça com um adulto') && carta.includes('Por quê?'));
    await c.foto('carta-aberta');
    await c.tocar('.xp-rodape button');
    assert.strictEqual(await c.js("document.activeElement.dataset.exp"), 'exp-pilha-limao', 'o foco volta para a carta');
    await c.tecla('Escape');
    assert.strictEqual(await c.js('Reino.UI.temTela()'), false, 'Esc fecha');
    // direto na carta (a festa do prêmio)
    await c.js("void Reino.UI.abrirExperiencias('exp-pilha-limao')");
    await c.avancar(600);
    assert.ok(await c.js("!!document.querySelector('.xp-carta')"));
    await c.js('Reino.UI.fecharTodas()');
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});
