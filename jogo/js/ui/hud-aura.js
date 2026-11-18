/* Chip da Aura no HUD (Reino.Aura, js/sistemas/aura.js), por UI.registrarBotaoHud: fica embaixo das estrelas
   (a montagem põe os registrados à direita; o pintar o leva para a coluna da esquerda). Tocar abre o painel
   da Aura, sem frases: o valor, a barra até a próxima cor (chama da cor atual e da próxima nas pontas) e, na matéria
   do dia, o selo "emoji da matéria + 🔥 + ×4". */
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
  // 32 px no chip, na barra e no selo; 64 px no destaque do painel (arte.md §10.5)
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
    // só o número, compacto (D13-01): até 999,9 numa linha; daí o número em cima e o nome abreviado embaixo, menor
    // ("12,3" / "mil", "1,2" / "quatri"), para caber ao lado dos botões no celular. O nome inteiro vai no aria-label
    var pc = A.partesCurtas(d);
    b.appendChild(pc ? el('span.aura-chip-texto', el('span', pc.numero), el('span.aura-chip-unidade', pc.unidade)) : el('span', A.texto(d)));
    b.setAttribute('aria-label', 'Aura ' + A.textoNome(d) + ', cor ' + cor.nome);
  }
  UI.pintarChipAura = pintarChip;

  // a barra da faixa atual: de onde a cor começou até a próxima (cheia na última cor)
  function barraAura(A, d, f, cor, corProx) {
    var fim = A.proximaFaixa(d), ini = f === 0 ? 0 : fim / Reino.config.aura.multiplicador;
    var ultima = corProx === cor, pct = ultima ? 100 : Math.max(0, Math.min(100, (d - ini) / (fim - ini) * 100));
    var cheio = el('span.aura-barra-cheia');
    cheio.style.width = pct.toFixed(1) + '%';
    // a cor vem do save (a faixa dela); a branca um tico lilás, para aparecer no trilho branco
    if (cor.cor === 'arco-iris') cheio.classList.add('aura-barra-arco');
    else cheio.style.background = claro(cor.cor) ? misturar(cor.cor, '#3a2446', 0.3) : cor.cor;
    return el('div.aura-barra', { role: 'img', 'aria-label': ultima ? 'Aura no máximo!' : 'Faltam ' + A.textoNome(fim - d) + ' para a aura ficar ' + corProx.nome },
      iconeAura(cor.cor), el('span.aura-barra-trilho', cheio), ultima ? null : iconeAura(corProx.cor));
  }
  // o selo da matéria do dia (Reino.config.aura.materiaDoDia): o emoji da matéria, o foguinho e "×4", sem frase
  function seloDoDia(A) {
    var hoje = A.materiaDoDia(), m = hoje && Reino.materia && Reino.materia(hoje.materia);
    if (m && m.arquivada) m = null;
    if (!m) return null;
    var dica = 'Hoje, ' + m.nome + ' vale ' + hoje.vezes + ' vezes mais Aura!';
    return el('div.aura-dia', { role: 'img', 'aria-label': dica, title: dica },
      PA.iconeEmoji(m.emoji, 2), PA.iconeEmoji('🔥', 2), el('b', '×' + hoje.vezes));
  }

  function telaAura() {
    var A = aura();
    if (!A) return;
    var pn = UI.painel('aura', '✨ Aura');
    var d = A.decimos(), f = A.faixa(d), cor = A.corDaFaixa(f), corProx = A.corDaFaixa(f + 1);
    // o valor: inteiro até 999.999,9; de 1 milhão em diante, o número e o nome por extenso ("1,2" "quatrilhão"), que
    // desce para a linha de baixo quando não cabe
    var pn2 = A.partesNome(d), valor = pn2 ? [el('b', pn2.numero), el('span.aura-nome', pn2.nome)] : [el('b', A.texto(d))];
    pn.conteudo.appendChild(el('div.aura-painel',
      el('p.aura-valor', iconeAura(cor.cor, 4), valor),   // até "999.999,9" (9 letras) cabe no celular
      barraAura(A, d, f, cor, corProx),
      seloDoDia(A)));
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
