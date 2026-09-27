/* Chip da Aura no HUD (Reino.Aura, js/sistemas/aura.js), por UI.registrarBotaoHud: fica embaixo das estrelas
   (a montagem põe os registrados à direita; o pintar o leva para a coluna da esquerda). Tocar abre o painel
   da Aura: o valor, a cor, quanto vale cada pergunta e quanto falta para a próxima cor. */
(function () {
  var U = Reino.util, el = U.el;
  var UI = Reino.UI;

  function aura() { return Reino.Aura && typeof Reino.Aura.decimos === 'function' ? Reino.Aura : null; }
  function bolinha(cor) {
    var b = el('span.aura-bolinha', { 'aria-hidden': 'true' });
    if (cor === 'arco-iris') b.classList.add('aura-arco-iris'); else b.style.background = cor;
    return b;
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
    b.appendChild(bolinha(cor.cor));
    b.appendChild(el('span', 'Aura ' + A.texto(d)));
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
    pn.conteudo.appendChild(el('div.aura-painel',
      el('p.aura-valor', bolinha(cor.cor), el('b', A.texto(d))),
      el('p', 'Sua aura está ' + cor.nome + '.'),
      el('p', 'Pergunta certa: +' + A.texto(passo) + '. Errada: −' + A.texto(passo * pen) + '.'),
      corProx !== cor ? el('p', 'Faltam ' + A.texto(prox - d) + ' para a aura ficar ' + corProx.nome + '!') : null,
      el('ul.aura-cores', Reino.config.aura.cores.map(function (c, i) {
        return el('li' + (i === Math.min(f, Reino.config.aura.cores.length - 1) ? '.aura-agora' : ''), bolinha(c.cor), el('small', c.nome));
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
