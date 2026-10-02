// Quebra de linha (ui.md §10.17, util.colado): nenhum grupo colado (span nowrap) passa da caixa do pai nem da tela,
// nos balões (NPC e Claude), nas opções de desafio, nas intros de sala e na capa de prova, no celular e no notebook.
// Cada texto real é posto no lugar de verdade da tela e medido. Nos balões também: o balão inteiro dentro da tela e
// nenhuma linha só com um emoji ou só com um número (D5-07). Exceção: linha de conta ou de lista, sem letra e com
// sinal (+ − × ÷ =), lacuna (___) ou mais de um número ("5 + 5 = 10", "2, 4, 6"): é a conta, não uma sobra; e o
// emoji cuja palavra com ele não cabe numa linha do balão ("travesseiros! 💤" no Claude do celular).
// Servidor e banco de TESTE (cenario.js); save sintético.
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('./ajudantes/terceiro-bimestre');

// põe cada texto em `sel` com U.preencherColado e devolve os que estouram (span nowrap além do pai ou da tela)
const MEDIR = (sel, textos) => `(function () {
  function linhaSozinha(no) {   // o texto de cada linha (ícone = '@'); devolve a linha que é só emoji ou só um número
    var linhas = [];
    function por(y, c) { var l = linhas.find(function (l) { return Math.abs(l.y - y) < 8; }); if (!l) linhas.push(l = { y: y, t: '' }); l.t += c; }
    (function andar(n) {
      if (n.nodeType === 3) {
        for (var i = 0; i < n.data.length; i++) {
          if (/\\s/.test(n.data[i])) continue;
          var rg = document.createRange(); rg.setStart(n, i); rg.setEnd(n, i + 1);
          var q = rg.getClientRects()[0]; if (q) por(Math.round(q.top + q.height / 2), n.data[i]);
        }
      } else if (n.nodeType === 1 && !n.firstChild) { var r = n.getBoundingClientRect(); por(Math.round(r.top + r.height / 2), '@'); }
      else n.childNodes.forEach(andar);
    })(no);
    var ruim = linhas.find(function (l) {
      if (/\\p{L}/u.test(l.t)) return false;
      if (/^[@.,!?:;"')]*$/.test(l.t) && l.t.indexOf('@') >= 0) return true;                // só emoji
      if (/[+−×÷=_-]/.test(l.t) || (l.t.match(/\\p{N}+/gu) || []).length > 1) return false;  // conta ou lista
      return /\\p{N}/u.test(l.t);                                                          // um número sozinho
    });
    return ruim ? ruim.t : '';
  }
  var U = Reino.util, alvo = document.querySelector(${JSON.stringify(sel)}), ruins = [];
  if (!alvo) return ['sem ' + ${JSON.stringify(sel)}];
  var guardado = Array.prototype.slice.call(alvo.childNodes);
  (${textos}).forEach(function (t) {
    if (typeof t !== 'string' || !t) return;
    U.preencherColado(alvo, t);
    var lim = Math.min(innerWidth, alvo.getBoundingClientRect().right) + 1;
    alvo.querySelectorAll('span').forEach(function (sp) {
      if (sp.style.whiteSpace === 'nowrap' && sp.getBoundingClientRect().right > lim) ruins.push(sp.textContent);
    });
    var bal = alvo.closest('#claude-balao');
    if (bal && /\\p{L}/u.test(t)) {   // texto sem letra (só a conta) fica de fora
      var fora = function () { return [bal, bal.querySelector('.claude-fala')].some(function (b) { return b && b.getBoundingClientRect().right > innerWidth + 1; }); };
      if (fora()) {   // só conta se o texto sem colar (como na main) coubesse
        U.preencher(alvo, t);
        var antes = fora();
        U.preencherColado(alvo, t);
        if (!antes) ruins.push('balão fora da tela: ' + t.slice(0, 40));
      }
      var sobra = linhaSozinha(alvo);
      // emoji sozinho só se a última palavra com ele não cabe numa linha (o grupo se desfez: data-largo)
      if (sobra && !(sobra.indexOf('@') >= 0 && alvo.querySelector('[data-largo]'))) ruins.push('linha só com "' + sobra + '": ' + t.slice(0, 40));
    }
  });
  alvo.textContent = ''; guardado.forEach(function (n) { alvo.appendChild(n); });
  return ruins;
})()`;
const FALAS = '[...new Set(Reino.Falas.todas().map(function (f) { return f.texto; }))]';
const OPCOES = '[].concat.apply([], Reino.materias.map(function (m) { return [].concat.apply([], m.salas.map(function (s) {'
  + ' return [].concat.apply([], (s.desafios || []).map(function (d) { return (d.opcoes || []).map(function (o) { return o && o.t; }); })); })); }))'
  + '.concat([].concat.apply([], (Reino.provas || []).map(function (p) { return [].concat.apply([], (p.questoes || []).map(function (q) { return (q.opcoes || []).map(function (o) { return o && o.t; }); })); })))';
const SALAS = (campo) => '[].concat.apply([], Reino.materias.map(function (m) { return m.salas.map(function (s) { return ' + campo + '; }); }))';

for (const tamanho of ['celular', 'notebook']) {
  test(`colado não estoura a caixa (${tamanho})`, async () => {
    const c = await abrirCenario({ tamanho, save: 'completo', pasta: '/tmp/reino-testes/ver/teste-colar-' + tamanho });
    try {
      const falhas = {};
      const conferir = async (nome, sel, textos) => { const r = await c.js(MEDIR(sel, textos)); if (r.length) falhas[nome] = [r.length].concat(r.slice(0, 6)); };
      for (const modo of ['npc', 'claude']) {
        await c.js(`Reino.Claude.limpar(); void Reino.Claude.falar('x', ${modo === 'npc'
          ? "{ quem: { nome: 'Dona Memória', retrato: PA.claude(0).canvas }, modal: true, falar: false, botoes: [{ texto: 'Continuar →', valor: 'mais', principal: true }] }"
          : '{ falar: false }'}); document.querySelector('#claude-balao').classList.remove('entrando');`);
        await conferir('balão ' + modo, '#claude-balao .claude-texto', FALAS);
      }
      await c.js('Reino.Claude.limpar()');
      await c.tela('desafio:m5-02');
      await conferir('opções', '.opcao .opcao-texto', OPCOES);
      await c.tela('sala:m6');
      await conferir('intro', '.intro-claude p', SALAS('s.intro'));
      await conferir('apostila', '.intro-paginas', SALAS("'Apostila: ' + s.paginas"));
      await conferir('nome da sala', '.intro-sala h2', SALAS('s.nome'));
      assert.deepStrictEqual(falhas, {});
    } finally { await c.fechar(); }
  });
}
