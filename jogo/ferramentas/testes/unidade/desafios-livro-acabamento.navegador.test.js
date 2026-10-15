// Acabamento dos componentes do 4º bimestre na tela de verdade (celular, também com Letras grandes):
// marcar com o sinal colado à palavra como no texto (caixas encostadas sem se cobrir, o sinal tocável por 32 px para o
// lado de fora) e o rótulo "a)" só de texto; o "n de N" do livro entre as setas mesmo com 117 cartas; a ilustração da
// questão nunca abaixo de 2× (a alta rola dentro do quadro, a página não); a célula da tabela nunca corta o texto
// (caixa que cresce, Enter passa para a próxima). Desafios, livro e ilustração sintéticos.
// Servidor e banco de TESTE novos (cenario.js); save sintético; congelado (?congelar=1).
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/desafios-livro-acabamento.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('./ajudantes/terceiro-bimestre');
const { PASTA_TESTES } = require('../guardas');

const MATERIA = { id: 'teste4', nome: 'Teste', emoji: '✏️', cor: '#8e4fd6', livro: [], unicornios: [], lugar: { nome: 'Ala de Teste', artigo: 'a' }, salas: [] };
const MARCAR = { id: 'teste4-m1', tipo: 'marcar', pergunta: 'Circule os sinais.', livro: 'x', explica: 'x', marca: 'circular',
  texto: 'a) Assim{,} o gato correu{.}\nb) — Quem é você{?} disse “Oi{!}”' };
const FIGURA = { id: 'teste4-f1', tipo: 'escolha', pergunta: 'O que é?', livro: 'x', explica: 'x', opcoes: ['Uma flor.', 'Um gato.'], certa: 0,
  figura: { ilustracao: 'teste4-flor', alt: 'Uma flor alta.' } };
const TABELA = { id: 'teste4-t1', tipo: 'tabela', pergunta: 'Escreva.', livro: 'x', explica: 'x', cab: ['Animal', 'Aumentativo', 'Diminutivo'],
  linhas: [['tartaruga', { certas: ['tartarugona'] }, { certas: ['tartaruguinha'] }], ['tempo', { certas: ['x'] }, { certas: ['em uma bela tarde de sol'] }]] };
const sala = (ds) => ({ id: 'teste4-1', nome: 'Teste', emoji: '✏️', paginas: 'p. 1', intro: 'Teste.', ordem: 'livro', desafios: ds });

test('acabamento do livro A/B: marcar colado, contagem do livro, ilustração em 2× e tabela sem corte, no celular', async () => {
  const c = await abrirCenario({ tamanho: 'celular', save: 'completo', pasta: fs.mkdtempSync(path.join(PASTA_TESTES, 'livro-acab-')) });
  const p = c.page;
  const vaza = () => c.js('document.documentElement.scrollWidth > innerWidth');
  const abrir = async (ds) => {
    await c.js(`Reino.UI.fecharTodas(); document.body.classList.remove('em-missao'); void Reino.Missao.iniciar(${JSON.stringify(MATERIA)}, ${JSON.stringify(sala(ds))})`);
    await c.avancar(2000); await p.locator('.intro-botoes .btn-principal').click(); await c.avancar(2500);
  };
  try {
    await c.js(`Reino.registrarIlustracao('teste4-flor', { w: 152, h: 278, desenhar: function (ctx) { ctx.fillStyle = '#e04080'; ctx.fillRect(0, 0, 152, 278); } })`);
    for (const grandes of [false, true]) {
      const onde = grandes ? ' (Letras grandes)' : '';
      await c.js(`document.documentElement.classList.toggle('letras-grandes', ${grandes})`);
      // marcar: os rótulos não são tokens; sinal colado: letras como no texto, caixas sem se cobrir, 32 px de toque
      await abrir([MARCAR]);
      assert.deepStrictEqual(await c.js(`[].map.call(document.querySelectorAll('.marcar-rotulo'), function (e) { return e.textContent; })`), ['a)', 'b)']);
      assert.strictEqual(await c.js(`[].some.call(document.querySelectorAll('.marcar-token'), function (e) { return /^[ab]$/.test(e.textContent); })`), false, 'rótulo virou token' + onde);
      const pares = await c.js(`(function () {
        function tinta(e) { var g = document.createRange(); g.selectNodeContents(e); return g.getBoundingClientRect(); }
        return [].map.call(document.querySelectorAll('.marcar-grupo > .marcar-token + .marcar-token'), function (b) {
          b.scrollIntoView({ block: 'center' });
          var a = b.previousElementSibling, ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(), sinal = b.classList.contains('marcar-sinal') ? b : a;
          var rs = sinal.getBoundingClientRect(), fora = sinal === b ? rs.right + 10 : rs.left - 10, y = rs.top + rs.height / 2;
          return { par: a.textContent + b.textContent, vao: tinta(b).left - tinta(a).right, cobre: ra.right - rb.left, alto: Math.round(rs.height),
            toque: document.elementFromPoint(fora, y) === sinal || sinal.matches(':not(:first-child):not(:last-child)') };
        });
      })()`);
      assert.deepStrictEqual(pares.map((x) => x.par), ['Assim,', 'correu.', 'você?', '“Oi', 'Oi!', '!”']);
      for (const x of pares) {
        assert.ok(x.vao <= 0.5 && x.vao >= -0.5, `${x.par}: o sinal descolou da palavra (${x.vao} px)${onde}`);
        assert.ok(x.cobre <= 0.5, `${x.par}: uma caixa cobre a outra (${x.cobre} px)${onde}`);
        assert.ok(x.toque, `${x.par}: o sinal não pega o toque do lado de fora${onde}`);
        assert.strictEqual(x.alto, 44, `${x.par}: altura do toque`);
      }
      await p.locator('.marcar-rotulo').first().click(); await c.avancar(150);
      assert.strictEqual(await c.js(`document.querySelectorAll('.marcar-token[aria-pressed="true"]').length`), 0, 'tocar no rótulo não marca nada');
      assert.strictEqual(await vaza(), false, 'marcar vaza de lado' + onde);
      // ilustração alta (152×278): 2× e o quadro rola por dentro; a página não rola de lado e as opções estão lá
      await abrir([FIGURA]);
      const fig = await c.js(`(function () { var a = document.querySelector('.desafio-ilustracao'), cv = a.querySelector('canvas');
        return { escala: cv.getBoundingClientRect().width / cv.width, rola: a.scrollHeight > a.clientHeight, moldura: a.classList.contains('desafio-ilustracao-rola'), opcoes: document.querySelectorAll('.opcao').length }; })()`);
      assert.deepStrictEqual(fig, { escala: 2, rola: true, moldura: true, opcoes: 2 }, 'ilustração' + onde);
      assert.strictEqual(await vaza(), false, 'ilustração vaza de lado' + onde);
      // tabela: digitar pelo teclado (Enter passa para a próxima caixa); nada cortado de lado nem embaixo
      await abrir([TABELA]);
      await p.locator('.tabela-campo').first().click();
      for (const r of ['tartarugona', 'tartaruguinha', 'x', 'em uma bela tarde de sol']) { await p.keyboard.type(r); await p.keyboard.press('Enter'); await c.avancar(60); }
      const cortes = await c.js(`[].filter.call(document.querySelectorAll('.tabela-campo, .tabela-quadro td'), function (e) {
        return e.scrollWidth > e.clientWidth + 1 || (e.tagName === 'TEXTAREA' && e.scrollHeight > e.clientHeight + 1); }).map(function (e) { return e.value || e.textContent; })`);
      assert.deepStrictEqual(cortes, [], 'célula cortada' + onde);
      assert.strictEqual(await c.js(`[].map.call(document.querySelectorAll('.tabela-campo'), function (e) { return e.value; }).join('|')`), 'tartarugona|tartaruguinha|x|em uma bela tarde de sol');
      assert.match(await (async () => { await p.locator('.btn-conferir').click(); await c.avancar(2500); return c.js(`document.querySelector('.missao-retorno').textContent`); })(), /Isso/);
      // livro com 117 cartas: "n de N" inteiro entre as setas
      await c.js(`Reino.UI.fecharTodas(); document.body.classList.remove('em-missao');
        Reino.UI.abrirLivro(Object.assign({}, ${JSON.stringify(MATERIA)}, { livro: Array.from({ length: 117 }, function (_, k) { return { id: 'tl-' + k, e: '📗', titulo: 'Carta ' + (k + 1), texto: 'Texto.' }; }) }))`);
      await c.avancar(800);
      for (const k of [19, 116]) {
        await c.js(`document.querySelectorAll('.livro-marca')[${k}].click()`); await c.avancar(300);
        const r = await c.js(`(function () { var pag = document.querySelector('.livro-pag'), b = document.querySelectorAll('.livro-nav .btn-grande');
          var g = document.createRange(); g.selectNodeContents(pag); var t = g.getBoundingClientRect();
          return { texto: pag.textContent, folga: [t.left - b[0].getBoundingClientRect().right, b[1].getBoundingClientRect().left - t.right] }; })()`);
        assert.strictEqual(r.texto, (k + 1) + ' de 117');
        assert.ok(r.folga[0] >= 0 && r.folga[1] >= 0, `"${r.texto}" embaixo da seta (${r.folga})${onde}`);
      }
    }
    assert.deepStrictEqual(c.erros || [], []);
  } finally { await c.fechar(); }
});
