// Festa da medalha de ouro na tela de início (js/ui/abertura-medalha.js, config.festaMedalha): com a última jogadora
// Mariana (ou ninguém) e a data até festaMedalha.ate, a tela tem a medalha, a faixa e o "Parabéns, Mariana!"; com outro
// jogador lembrado ou a data depois, a entrada de sempre. A novidade em destaque (js/ui/abertura-novidade.js,
// config.novidadeInicio) vale para todos até a data dela e fica no lugar da medalha. Enter no "Entrar" toca a
// fanfarra e fecha a tela. Servidor e banco de TESTE novos (cenario.js); save sintético; modo congelado (data virtual
// 21/09/2026, nucleo/congelar.js).
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');

const pasta = () => fs.mkdtempSync(path.join(PASTA_TESTES, 'medalha-'));

// abre a tela de início por cima (__reino.telaInicio) e lê o que ela mostra
// (o emoji vira desenho pixel: canvas.icone-em, lido aqui como [ícone])
const ABRIR_E_LER = `(async () => {
  const txt = (n) => n ? Array.from(n.childNodes).map((x) => x.nodeType === 3 ? x.textContent : x.classList.contains('icone-em') ? '[ícone]' : x.textContent).join('') : null;
  Reino.UI.fecharTodas();
  window.__fimInicio = false;
  __reino.telaInicio().then(() => { window.__fimInicio = true; });
  const t = document.querySelector('.tela-inicio');
  return {
    medalha: !!t.querySelector('canvas.medalha-festa'),
    faixa: txt(t.querySelector('.abertura-faixa-medalha')),
    parabens: (t.querySelector('.medalha-parabens') || {}).textContent || null,
    bimestre: (t.querySelector('.medalha-bimestre') || {}).textContent || null,
    titulo: t.querySelector('.titulo-abertura').getAttribute('aria-label'),
    novidade: txt(t.querySelector('.abertura-faixa-novidade')),
    novidadeTexto: (t.querySelector('.novidade-texto') || {}).textContent || null,
    casinha: !!t.querySelector('.novidade-desenho, .novidade-casinha'),
    botao: txt(t.querySelector('.btn-comecar')),
  };
})()`;

test('abertura: festa da medalha só para a Mariana e até a data; Enter no "Entrar" com fanfarra', async () => {
  const c = await abrirCenario({ tamanho: 'celular', save: 'completo', pasta: pasta() });
  try {
    // a regra pura
    assert.deepStrictEqual(await c.js(`[
      Reino.UI.festaMedalha.ativa('mariana', '2026-10-28'), Reino.UI.festaMedalha.ativa(null, '2026-12-20'),
      Reino.UI.festaMedalha.ativa('leo', '2026-10-28'), Reino.UI.festaMedalha.ativa('mariana', '2026-12-21')]`),
    [true, true, false, false]);

    // 0) a novidade em destaque: para todos até a data dela, no lugar da medalha
    assert.deepStrictEqual(await c.js("[Reino.UI.novidadeInicio.ativa('2026-11-30'), Reino.UI.novidadeInicio.ativa('2026-12-01')]"), [true, false]);
    await c.js("localStorage.setItem('reino-jogador-atual', 'mariana'); localStorage.removeItem('reino-novidade-vista'); 1");
    // 1ª vez deste aparelho: o botão é "Atualizar"; o toque passa a atualização (no modo congelado, na hora) e grava
    assert.strictEqual((await c.js(ABRIR_E_LER)).botao, 'Atualizar [ícone]');
    await c.js("document.querySelector('.tela-inicio .btn-comecar').click(); 1");
    await c.avancar(400);
    assert.deepStrictEqual(await c.js("({ vista: localStorage.getItem('reino-novidade-vista'), fim: __fimInicio, primeira: Reino.UI.novidadeInicio.primeiraVez() })"),
      { vista: 'bosque-2026-11-05', fim: true, primeira: false });
    const nova = await c.js(ABRIR_E_LER);
    assert.deepStrictEqual(nova, { medalha: false, faixa: null, parabens: null, bimestre: null, titulo: 'Reino dos Unicórnios',
      novidade: '[ícone] Nova atualização! [ícone]', novidadeTexto: 'O Bosque dos Fantasmas', casinha: true, botao: 'Entrar no Reino [ícone]' });
    await c.js("window.__novAte = Reino.config.novidadeInicio.ate; Reino.config.novidadeInicio.ate = '2026-09-20'; 1");

    // 1) última jogadora: a Mariana (o save dela no aparelho de teste), data virtual dentro → festa
    const festa = await c.js(ABRIR_E_LER);
    assert.deepStrictEqual(festa, { medalha: true, faixa: '[ícone] Medalha de Ouro! [ícone]', parabens: 'Parabéns, Mariana!', bimestre: '3º bimestre',
      titulo: 'Reino dos Unicórnios', novidade: null, novidadeTexto: null, casinha: false, botao: 'Entrar no Reino [ícone]' });

    // Enter no botão (teclado): fanfarra e a tela fecha
    await c.js("window.__sons = []; var t0 = Reino.Som.tocar; Reino.Som.tocar = function (n) { __sons.push(n); return t0.apply(this, arguments); }; document.querySelector('.tela-inicio .btn-comecar').focus(); 1");
    await c.page.keyboard.press('Enter');
    await c.avancar(400);
    assert.deepStrictEqual(await c.js("({ sons: __sons, fim: __fimInicio, tela: !!document.querySelector('.tela-inicio') })"),
      { sons: ['fanfarra'], fim: true, tela: false });

    // 2) data depois do fim da festa → a entrada de sempre
    await c.js("window.__ate = Reino.config.festaMedalha.ate; Reino.config.festaMedalha.ate = '2026-09-20'; 1");
    const depois = await c.js(ABRIR_E_LER);
    assert.strictEqual(depois.medalha, false, 'depois da data: sem medalha');
    assert.strictEqual(depois.faixa, null, 'depois da data: sem faixa');
    assert.strictEqual(depois.novidade, null);
    await c.js("Reino.config.festaMedalha.ate = __ate; 1");

    // 3) outro jogador lembrado neste aparelho → a entrada de sempre
    await c.js("localStorage.setItem('reino-jogadores', JSON.stringify({ leo: { senha: 'abc', criado: 1 } })); localStorage.setItem('reino-jogador-atual', 'leo'); Reino.Jogadores.ultimo()");
    const outro = await c.js(ABRIR_E_LER);
    assert.strictEqual(outro.medalha, false, 'outro jogador: sem medalha');
    assert.strictEqual(outro.parabens, null, 'outro jogador: sem parabéns');
    assert.strictEqual(outro.novidade, null);
    // outro jogador também vê a novidade, enquanto ela vale
    await c.js("Reino.config.novidadeInicio.ate = __novAte; 1");
    assert.strictEqual((await c.js(ABRIR_E_LER)).novidadeTexto, 'O Bosque dos Fantasmas');
    await c.js("Reino.UI.fecharTodas(); 1");
  } finally { await c.fechar(); }
});
