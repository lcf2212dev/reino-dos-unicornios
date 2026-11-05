/* Casa do jogador, modo decorar (docs/contratos/casa.md §9.3), parte 2: o botão do HUD e o painel das peças.
   UI.decorarCasa({ kit? }) → Promise (resolve quando ela sai com "Pronto", ✕ ou Esc). O painel fica no pé da tela,
   sem véu escuro: a casa aparece em cima. Abas pelos cômodos com kit ou móvel avulso (Reino.Casa.abas(), nome de
   Reino.Casa.nomeComodo); cada peça com a
   miniatura (o desenho do objeto, de frente), o nome e "Na casa" ou "Guardado". Tocar numa peça (ou num móvel da
   casa, por cima do painel) entra no modo colocar (ui/casa-decorar-fantasma.js); colocou, guardou ou cancelou,
   o painel volta. A cena fica ocupada (Cena.ocupar('decorar')) do começo ao fim: ela não anda.
   Botão do HUD (casinha com pincel): só dentro de `casa`/`casa-2`; faz o mesmo que a caixa de mudança (a ação
   'casaDecorar' de sistemas/casa.js: escolha de kit pendente, o painel ou a fala de quem ainda não tem kit). */
(function () {
  var R = window.Reino, U = R.util, el = U.el, UI = R.UI, I = R._ui, EV = R.EVENTOS;
  var ANDARES = ['casa', 'casa-2'], T = 16, CALMA_MS = 400;

  /* ---------- ícone do botão: casinha com pincel ---------- */
  R.registrarIcones({ 'casa-pincel': { n: 'casa com pincel', p: { k: '#3a2446', R: '#ffb3c1', r: '#ff6b8a', 2: '#d63d63', C: '#ffffff', c: '#fff8ee',
    B: '#b3e0ff', 7: '#e3cdb8', 0: '#74442a', y: '#ffd34d', t: '#a0643a', T: '#d9a066', 8: '#8e86ad', S: '#f4f2fa', P: '#ff7eb6', p: '#d63d63' }, d: [
    '....kk.....kkkk.',
    '...kRRk....ktTk.',
    '..kRrrRk...ktTk.',
    '.kRrrrrRk..ktTk.',
    'kRrrrrrrRk.ktTk.',
    'k22222222k.ktTk.',
    '.kCCCCCCk.kk8Skk',
    '.kCkkkcCk.k88SSk',
    '.kCkBkkkk.kPPPPk',
    '.kCkkkktk.kPPPpk',
    '.kCccckyk.kPPPpk',
    '.kCccckyk..kPpk.',
    '.k77777tk...kk..',
    '.kkkkkkkk.......',
    '..........kPPk..',
    '...........kk...',
  ] } });

  function F() { return I.casaDecorar; }
  function C() { return R.Casa; }
  function naCasa() { var c = R.Cena && R.Cena.atual(); return !!c && ANDARES.indexOf(c.id) >= 0; }

  /* ---------- a sessão ---------- */
  // S = { kit, modo: 'painel' | 'colocar', tela, ultima (uid tocado por último), calmaAte, resolver, promessa }
  var S = null;
  function sair() {
    if (!S) return;
    var s = S;
    S = null;
    if (s.modo === 'painel' && s.tela && I.pilha.indexOf(s.tela) >= 0) UI.fecharTela(s.tela);
    R.Cena.liberar('decorar');
    F().soltarCamera();
    s.resolver();
  }
  // a tela do painel saiu da pilha sem o ✕ (UI.fecharTodas, outra parte): a sessão acaba junto
  U.on(EV.TELAS, function () { if (S && S.modo === 'painel' && S.tela && I.pilha.indexOf(S.tela) < 0) sair(); });
  U.on(EV.CENA, function (c) { if (S && ANDARES.indexOf(c && c.para) < 0) sair(); });

  // a aba de partida: a pedida, a última usada, a do cômodo onde ela está, a primeira
  function abaInicial(pedida) {
    var ganhos = C().abas();
    if (pedida && ganhos.indexOf(pedida) >= 0) return pedida;
    if (S && S.kit && ganhos.indexOf(S.kit) >= 0) return S.kit;
    var c = R.Cena.atual(), jt = window.Jogador ? Jogador.tile() : null, com = c && jt ? C().comodoEm(c.id, jt.x, jt.y) : null;
    var doComodo = ganhos.filter(function (k) { var d = R.kitCasa(k); return d && d.comodo === com; })[0];
    return doComodo || ganhos[0];
  }

  UI.decorarCasa = function (opts) {
    opts = opts || {};
    if (S) return S.promessa;
    if (!C() || !C().abas().length || !naCasa()) return Promise.resolve();
    var resolver, promessa = new Promise(function (r) { resolver = r; });
    S = { kit: null, modo: 'painel', tela: null, ultima: null, resolver: resolver, promessa: promessa };
    S.kit = abaInicial(opts.kit);
    // balão do Claude aberto (a fala da caixa, um aviso): fecha antes, para não ficar por cima do painel
    if (R.Claude && R.Claude.aberto && R.Claude.aberto() && R.Claude.limpar) R.Claude.limpar();
    R.Cena.ocupar('decorar');
    abrirPainel();
    return promessa;
  };

  /* ---------- o painel ---------- */
  function miniatura(objeto) {
    var s = F().sprite(objeto, 'baixo');
    return PA.paraDOM(s.normal, 2, 'decorar-mini');
  }
  function cartao(p) {
    var b = el('button.decorar-peca' + (p.lugar ? '.na-casa' : ''), { type: 'button', 'data-uid': p.uid, 'aria-label': p.nome + (p.lugar ? ', na casa' : ', guardado') },
      el('span.decorar-peca-estado', p.lugar ? 'Na casa' : 'Guardado'), el('span.decorar-mini-caixa', miniatura(p.objeto)),
      el('span.decorar-peca-nome', I.hifenizar ? I.hifenizar(p.nome) : p.nome));
    b.addEventListener('click', function (e) {
      // Enter logo depois de o painel voltar (o mesmo Enter que colocou, ou um 2º) não pega a peça de novo
      if (!e.detail && S && performance.now() < S.calmaAte) return;
      escolher(p.uid);
    });
    return b;
  }
  function abrirPainel() {
    S.modo = 'painel';
    S.calmaAte = performance.now() + CALMA_MS;
    var pn = UI.painel('decorar', 'Decorar a casa', { icone: 'casa-pincel', aoFechar: sair });
    S.tela = pn.tela;
    var kits = C().abas(), grade = el('div.decorar-pecas'), abas = {};
    function mostrar(kit) {
      S.kit = kit;
      Object.keys(abas).forEach(function (k) { abas[k].setAttribute('aria-selected', k === kit ? 'true' : 'false'); });
      grade.textContent = '';
      C().pecas(kit).forEach(function (p) { grade.appendChild(cartao(p)); });
    }
    var barraAbas = kits.length > 1 ? el('div.decorar-abas', { role: 'tablist', 'aria-label': 'Kits' }, kits.map(function (k) {
      var b = el('button.decorar-aba', { type: 'button', role: 'tab', 'data-kit': k }, C().nomeComodo(k));
      b.addEventListener('click', function () { R.Som.tocar('toque'); mostrar(k); });
      return (abas[k] = b);
    })) : el('p.decorar-kit', C().nomeComodo(kits[0]));
    var pronto = el('button.btn-pequeno.btn-principal.decorar-pronto', { type: 'button' }, 'Pronto');
    pronto.addEventListener('click', function () { R.Som.tocar('toque'); sair(); });
    // painel baixo (a sala fica à vista em cima): abas e "Pronto" numa linha, as peças numa fileira que rola de lado
    pn.card.insertBefore(el('div.decorar-topo', barraAbas, pronto), pn.conteudo);
    pn.conteudo.appendChild(el('p.decorar-dica', 'Escolha uma peça ou toque num móvel da casa.'));
    pn.conteudo.appendChild(grade);
    mostrar(S.kit);
    // o toque na casa (fora do cartão) pega o móvel que estiver ali; no vazio, nada (só o ✕, o Esc e o Pronto saem)
    pn.tela.addEventListener('click', function (e) {
      if (e.target !== pn.tela) return;
      e.stopImmediatePropagation();
      var uid = pecaNoPonto(e.clientX, e.clientY);
      if (uid) escolher(uid);
    }, true);
    // pelo teclado, o foco volta para a peça mexida por último
    var ultima = S.ultima && grade.querySelector('[data-uid="' + S.ultima + '"]');
    if (ultima && UI.porTeclado()) UI.focarTeclado(ultima, CALMA_MS);
  }

  // o móvel colocado no tile do ponto (px CSS); móvel e tapete no mesmo tile: o móvel
  function pecaNoPonto(cx, cy) {
    var V = R._motor, r = V.canvas.getBoundingClientRect(), andar = R.Cena.atual().id;
    var tx = Math.floor((V.cam.x + (cx - r.left) * V.dpr / V.escala) / T), ty = Math.floor((V.cam.y + (cy - r.top) * V.dpr / V.escala) / T);
    var achadas = C().pecas().filter(function (p) {
      var l = p.lugar;
      if (!l || l.andar !== andar) return false;
      var pg = F().pegada(p.objeto, l.dir);
      return tx >= l.x && tx < l.x + pg.w && ty >= l.y && ty < l.y + pg.h;
    });
    var II = R.Interiores.OBJETOS;
    achadas.sort(function (a, b) { return (II[a.objeto].plano ? 1 : 0) - (II[b.objeto].plano ? 1 : 0); });
    return achadas[0] ? achadas[0].uid : null;
  }

  function escolher(uid) {
    if (!S || S.modo !== 'painel') return;
    var p = C().pecas().find(function (x) { return x.uid === uid; });
    if (!p) return;
    R.Som.tocar('selecionar');
    S.ultima = uid;
    S.modo = 'colocar';
    UI.fecharTela(S.tela);
    S.tela = null;
    F().entrar(p, function () {
      if (!S) return;
      if (!naCasa()) { sair(); return; }
      abrirPainel();
    });
  }

  /* ---------- botão do HUD ---------- */
  function pintarBotao() {
    var b = U.$('#hud .btn-casa-decorar');
    if (b && b.hidden === naCasa()) b.hidden = !naCasa();
  }
  UI.registrarBotaoHud({ id: 'casa-decorar', ordem: 15, pintar: pintarBotao, criar: function () {
    var b = el('button.btn-tela-cheia.btn-casa-decorar', { type: 'button', 'aria-label': 'Decorar a casa', title: 'Decorar a casa' });
    b.hidden = !naCasa();
    b.appendChild(UI.iconeHud('casa-pincel'));
    // Enter/Espaço no botão são dele (não do alvo perto dela: ui.md §6.5)
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); });
    b.addEventListener('click', function () {
      var m = R.modulo('casa');
      if (!naCasa() || UI.temTela() || R.Cena.bloqueado() || !m) { I.toqueIgnorado(b); return; }
      R.Som.tocar('toque');
      m.acoes.casaDecorar({ tipo: 'casaDecorar' }, {});
    });
    return b;
  } });
})();
