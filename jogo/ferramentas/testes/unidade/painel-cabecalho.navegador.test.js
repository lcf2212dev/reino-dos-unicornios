// Cabeçalho padrão do painel (arte.md §21, D10-B11): o título numa linha quando cabe; senão 2 linhas (.titulo-quebra),
// nunca abaixo de --texto-aux; o ícone de 32 px à esquerda, a faixa da matéria com --cor-materia, e as larguras só 560 e 720 (exceções da tela baixa e larga: Foguete, Álbum de ETs e Pet Shop), nos 3 tamanhos e com Letras grandes.
// Servidor e banco de TESTE (cenario.js); save sintético.
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');

const TELAS = [
  'Reino.Provas.telaEscola()',
  'Reino.UI.telaCastelo()', 'Reino.UI.telaLugares()', 'Reino.UI.telaPlano()', 'Reino.UI.telaAjustes()',
  'Reino.UI.telaMateria(Reino.materia("historia"))', 'Reino.UI.abrirLivro(Reino.materia("geografia"))',
  'Reino.UI.telaFoguete()', 'Reino.UI.telaAlbumETs()', 'Reino.UI.telaPetShop()',
];
// exceções da largura (arte.md §21.2): na tela baixa e larga, Foguete e Álbum de ETs a 1180 (sem Letras grandes) e Pet Shop a 1000
function larguraEsperada(abrir, m, grande) {
  var baixaLarga = m.tela >= 1000 && m.altura <= 820;
  if (/telaPetShop/.test(abrir) && m.tela >= 1000) return [1000];
  if (/telaFoguete|telaAlbumETs/.test(abrir) && baixaLarga && !grande) return [Math.min(1180, m.tela)];
  return [560, 720];
}
const MEDIR = `(function () {
  var ts = document.querySelectorAll('#telas .tela'), t = ts[ts.length - 1], p = t.querySelector('.painel'), h = p.querySelector('.painel-topo h2');
  // linhas do texto visível do título: os topos distintos das caixas de cada nó de texto
  var tops = {}, w = document.createTreeWalker(h, NodeFilter.SHOW_TEXT), n;
  while ((n = w.nextNode())) { if (!n.parentElement.offsetParent || !n.textContent.trim()) continue;
    var r = document.createRange(); r.selectNodeContents(n); [].forEach.call(r.getClientRects(), function (b) { tops[Math.round(b.top / 4)] = 1; }); }
  var ic = h.querySelector('.painel-icone');
  return { largura: p.offsetWidth, tela: innerWidth, altura: innerHeight, linhas: Object.keys(tops).length,
    icone: ic ? ic.getBoundingClientRect().width : 0, quebra: h.classList.contains('titulo-quebra'),
    fonte: parseFloat(getComputedStyle(h).fontSize),
    // cabe numa linha? uma cópia sem quebra, na letra de --texto
    cabe: (function () { var k = h.cloneNode(true); k.className = 'titulo-pixel'; k.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;width:auto'; h.parentNode.appendChild(k); var r = k.scrollWidth <= h.clientWidth + 1; k.remove(); return r; })(),
    cor: t.style.getPropertyValue('--cor-materia'), faixa: !!p.querySelector('.painel-faixa') };
})()`;

for (const tamanho of ['celular', 'tablet', 'notebook']) {
  for (const grande of [false, true]) {
    test(`cabeçalho do painel: 1 ou 2 linhas, ícone e largura 560/720 (${tamanho}${grande ? ', letras grandes' : ''})`, async () => {
      const c = await abrirCenario({ tamanho, save: 'completo', ajustes: grande ? { texto: 1.15 } : undefined,
        pasta: `/tmp/reino-testes/ver/teste-painel-cabecalho-${tamanho}${grande ? '-g' : ''}` });
      try {
        await c.avancar(600);
        for (const abrir of TELAS) {
          await c.js('Reino.UI.fecharTodas(); ' + abrir + '; true');
          await c.avancar(300);
          const m = await c.js(MEDIR);
          if (m.cabe) assert.ok(m.linhas === 1 && !m.quebra, abrir + ': cabe: título em 1 linha');
          else assert.ok(m.quebra && m.linhas <= 2, abrir + ': não cabe: 2 linhas (' + m.linhas + ')');
          assert.ok(m.fonte >= 16, abrir + ': título nunca abaixo de 16 px (' + m.fonte + ')');
          assert.strictEqual(m.icone, 32, abrir + ': ícone de 32 px');
          // no celular o painel é a tela menos a folga; senão, só 560 ou 720 (ou a exceção)
          if (m.tela > 760) assert.ok(larguraEsperada(abrir, m, grande).indexOf(m.largura) >= 0, abrir + ': largura ' + m.largura);
          else assert.ok(m.largura <= m.tela, abrir + ': cabe na tela');
          if (/materia\(/.test(abrir)) assert.ok(m.cor && m.faixa, abrir + ': faixa e --cor-materia');
        }
      } finally { await c.fechar(); }
    });
  }
}
