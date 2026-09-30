/* Chip da Aura no HUD (Reino.Aura, js/sistemas/aura.js), por UI.registrarBotaoHud: fica embaixo das estrelas
   (a montagem põe os registrados à direita; o pintar o leva para a coluna da esquerda). Tocar abre o painel
   da Aura: o valor, a cor, quanto vale cada pergunta e quanto falta para a próxima cor. */
(function () {
  var U = Reino.util, el = U.el;
  var UI = Reino.UI;

  function aura() { return Reino.Aura && typeof Reino.Aura.decimos === 'function' ? Reino.Aura : null; }

  /* a chama da Aura (ICONES['aura:chama'], arte/icones/interface.js) pintada na cor da faixa (D8A-09): c (cor),
     l (luz, metade para o branco), s (sombra, 30 % para o contorno) e o miolo w branco; o arco-íris em faixas de
     2 linhas, as 6 cores do --arco-iris (ui-base.css) de cima para baixo. Canvas 16×16 em cache por cor */
  var cacheChama = {};
  function hex(c) { var n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function misturar(a, b, t) {
    var x = hex(a), y = hex(b);
    return '#' + x.map(function (v, i) { return ('0' + Math.round(v + (y[i] - v) * t).toString(16)).slice(-2); }).join('');
  }
  function claro(c) { var x = hex(c); return x[0] + x[1] + x[2] > 720; }
  function coresArcoIris() {
    var v = '';
    try { v = getComputedStyle(document.documentElement).getPropertyValue('--arco-iris'); } catch (e) { v = ''; }
    var cs = v.match(/#[0-9a-f]{6}/gi);
    return cs && cs.length ? cs : ['#ff5c6a', '#ff9f45', '#ffe066', '#6fdc8c', '#5fb4ff', '#a66bff'];
  }
  function chama(cor) {
    if (cacheChama[cor]) return cacheChama[cor];
    var ic = window.ICONES['aura:chama'], k = ic.p.k, w = ic.p.w;
    var faixas = cor === 'arco-iris' ? coresArcoIris() : null;
    var c = PA.novoCanvas(16, 16), ctx = c.getContext('2d');
    ic.d.forEach(function (linha, y) {
      var base = faixas ? faixas[Math.min(faixas.length - 1, Math.max(0, Math.floor((y - 1) / 2)))] : cor;
      // a aura branca: o corpo um tico lilás, para a chama de dentro (branca) aparecer
      var corpo = claro(base) ? misturar(base, k, 0.12) : base;
      var pal = { k: k, w: w, c: corpo, l: misturar(base, w, 0.5), s: misturar(base, k, 0.3) };
      for (var x = 0; x < 16; x++) if (pal[linha[x]]) { ctx.fillStyle = pal[linha[x]]; ctx.fillRect(x, y, 1, 1); }
    });
    return (cacheChama[cor] = c);
  }
  // 32 px no chip e na lista de cores; 64 px no destaque do painel (ui.md §10.10.5)
  function iconeAura(cor, escala) {
    var c = PA.paraDOM(chama(cor), escala || 2, 'aura-chama');
    c.setAttribute('aria-hidden', 'true');
    return c;
  }

  var ultimo = null;
  function pintarChip() {
    var b = U.$('#hud .chip-aura'), A = aura();
    if (!b) return;
    var esq = U.$('#hud .hud-esq');
    if (esq && b.parentNode !== esq) esq.appendChild(b);
    b.hidden = !A;
    if (!A) return;
    var d = A.decimos(), cor = A.corDaFaixa(A.faixa(d));
    var chave = d + '|' + cor.cor;
    if (chave === ultimo && b.firstChild) return;
    ultimo = chave;
    b.innerHTML = '';
    b.appendChild(iconeAura(cor.cor));
    // só o número, compacto ("12,3 mil", D13-01), como as estrelas; o nome e o valor inteiro ficam no aria-label
    b.appendChild(el('span', A.textoCurto(d)));
    b.setAttribute('aria-label', 'Aura ' + A.texto(d) + ', cor ' + cor.nome);
  }
  UI.pintarChipAura = pintarChip;

  function telaAura() {
    var A = aura();
    if (!A) return;
    var pn = UI.painel('aura', '✨ Aura');
    var d = A.decimos(), f = A.faixa(d), cor = A.corDaFaixa(f), passo = A.passo(d);
    var pen = Reino.config.aura.penalidade;
    var prox = A.proximaFaixa(d), corProx = A.corDaFaixa(f + 1);
    // matéria do dia (Reino.config.aura.materiaDoDia): o aviso só no painel (sem voz)
    var hoje = A.materiaDoDia(), mh = hoje && Reino.materia && Reino.materia(hoje.materia);
    pn.conteudo.appendChild(el('div.aura-painel',
      el('p.aura-valor' + (A.texto(d).length > 9 ? '.aura-longa' : ''), iconeAura(cor.cor, 4), el('b', A.texto(d))),
      el('p', 'Sua aura está ' + cor.nome + '.'),
      el('p', 'Pergunta certa: +' + A.texto(passo) + '. Errada: -' + A.texto(passo * pen) + '.'),
      mh ? el('p.aura-materia-do-dia', '🌟 Hoje, cada pergunta certa de ', el('b', mh.nome), ' vale ', el('b', hoje.vezes + ' vezes'), ': +' + A.texto(passo * hoje.vezes) + '!') : null,
      corProx !== cor ? el('p', 'Faltam ' + A.texto(prox - d) + ' para a aura ficar ' + corProx.nome + '!') : null,
      el('ul.aura-cores', Reino.config.aura.cores.map(function (c, i) {
        return el('li' + (i === Math.min(f, Reino.config.aura.cores.length - 1) ? '.aura-agora' : ''), iconeAura(c.cor), el('small', c.nome));
      }))));
  }

  function botaoAura() {
    var b = el('button.chip.chip-aura', { type: 'button', 'aria-label': 'Aura' });
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); });
    b.addEventListener('click', function () {
      if (UI.temTela()) return;
      Reino.Som.tocar('toque');
      telaAura();
    });
    ultimo = null;
    return b;
  }

  UI.registrarBotaoHud({ id: 'aura', ordem: 5, criar: botaoAura, pintar: pintarChip, eventos: [Reino.EVENTOS.PROGRESSO] });
  UI.telaAura = telaAura;
})();
