/* Fome, sede e banho nas telas: barrinhas de Reino.Cuidados (HUD, Estábulo, Pet Shop), o balão
   dos cuidados com uma tela aberta (recado), o balão de NPC que fecha quando abre uma tela, dar
   comida e o nome/rótulo das comidas. */
(function () {
  var U = Reino.util, el = U.el, P = Reino.Progresso;
  var EV = Reino.EVENTOS;
  var UI = Reino.UI, R = Reino._ui;
  var est = R.est, pilha = R.pilha, topo = R.topo, focar = R.focar, focaveis = R.focaveis, hifenizar = R.hifenizar;

  /* ---------- fome, sede e banho (barrinhas de Reino.Cuidados) ---------- */
  // Toda barrinha de fome/sede/banho leva data-uni e data-campo: um único ouvinte do evento 'cuidados'
  // repinta todas as que estão na página (HUD, Estábulo, Pet Shop) sem refazer nada em volta.
  var CUIDADO = {
    fome: { icone: '🍎', rotulo: 'Fome', baixo: 'Quer comer!' },
    sede: { icone: '💧', rotulo: 'Sede', baixo: 'Quer água!' },
    banho: { icone: '🛁', rotulo: 'Banho', baixo: 'Quer banho!' },
  };
  function cuidadosProntos() { return !!(Reino.Cuidados && Reino.Cuidados.niveis); }
  // o banho só aparece quando Reino.Cuidados já o conhece (niveis() com o campo)
  function comBanho() { try { return cuidadosProntos() && typeof Reino.Cuidados.niveis().banho === 'number'; } catch (e) { return false; } }
  function uniChocado(id) { var u = est().unis[id]; return !!(u && u.chocado); }
  // ícone pequeno e nítido (fora do texto: não cresce com a fonte). PA.iconeEmoji já arredonda
  // para a escala inteira mais próxima de `px` (PA.escalaNitida), então nunca sai borrado.
  function iconePequeno(emoji, px) { return PA.iconeEmoji(emoji, px / 18); }
  // tamanho do ícone das barras grandes: 24px no celular e 32px no tablet e no notebook
  function pxIconeGrande() { return window.innerWidth <= 480 ? 24 : 32; }

  // tamanho 'mini' (HUD e cartas: ícone + trilho fino) ou 'grande' (detalhe e Pet Shop: com rótulo)
  function barraCuidado(uniId, campo, tamanho) {
    var info = CUIDADO[campo];
    var cheio = el('span.cuid-cheio');
    var b = el('span.cuid-barra.cuid-' + campo + '.cuid-' + tamanho,
      { role: 'meter', 'aria-valuemin': '0', 'aria-valuemax': '100', 'data-uni': uniId, 'data-campo': campo },
      // mini: 16px pedidos = 16px CSS nítidos em dpr 1, 2 e 3 (com 12 o iPhone ficava com 10,7px)
      tamanho === 'grande' ? el('span.cuid-rotulo', iconePequeno(info.icone, pxIconeGrande()), el('span', info.rotulo)) : iconePequeno(info.icone, 16),
      el('span.cuid-trilho', cheio),
      tamanho === 'grande' ? el('small.cuid-aviso') : null);
    pintarBarra(b);
    return b;
  }
  function barrasCuidado(uniId, tamanho) {
    return el('span.cuid-par.cuid-par-' + tamanho, barraCuidado(uniId, 'fome', tamanho), barraCuidado(uniId, 'sede', tamanho),
      comBanho() ? barraCuidado(uniId, 'banho', tamanho) : null);
  }
  function pintarBarra(b) {
    if (!cuidadosProntos()) return;
    var id = b.getAttribute('data-uni'), campo = b.getAttribute('data-campo');
    var nv = Reino.Cuidados.niveis(id)[campo];
    var v = Math.round(typeof nv === 'number' ? nv : 100);   // sem o campo = cheio
    var baixo = !!Reino.Cuidados.baixo(id)[campo];
    var cheio = b.querySelector('.cuid-cheio');
    if (cheio) cheio.style.width = v + '%';
    b.classList.toggle('baixo', baixo);
    b.setAttribute('aria-valuenow', String(v));
    b.setAttribute('aria-label', CUIDADO[campo].rotulo + ': ' + v + ' de 100' + (baixo ? ', ' + CUIDADO[campo].baixo.toLowerCase() : ''));
    var aviso = b.querySelector('.cuid-aviso');
    if (aviso) aviso.textContent = baixo ? CUIDADO[campo].baixo : '';
  }
  UI.pintarCuidados = function () { U.$$('.cuid-barra[data-uni]').forEach(pintarBarra); rotularMontaria(); };
  U.on(EV.CUIDADOS, function () { UI.pintarCuidados(); });
  // leitor de tela: o chip da montaria diz também a fome, a sede e o banho ("Estábulo — Nome, fome 40, sede 80, banho 60")
  function rotularMontaria() {
    var m = document.querySelector('#hud .chip-montaria');
    if (!m || !est()) return;
    var id = P.montaria(), txt = 'Estábulo — ' + P.nomeUni(id);
    if (cuidadosProntos() && uniChocado(id)) {
      var n = Reino.Cuidados.niveis(id);
      txt += ', fome ' + Math.round(n.fome) + ', sede ' + Math.round(n.sede) + (typeof n.banho === 'number' ? ', banho ' + Math.round(n.banho) : '');
    }
    m.setAttribute('aria-label', txt);
  }

  // retrato do unicórnio para o balão (quem fala é ele)
  function retratoUni(id) {
    try { var u = est().unis[id]; return PA.unicornio(P.defUni(id), Reino.Unicornios.estagio(u ? u.xp : 0), 0).canvas; } catch (e) { return null; }
  }
  // fala uma frase gravada dos cuidados, na voz de quem fala. O nome que ela deu ao unicórnio
  // só aparece no balão (quem.nome); a voz lê a frase gravada.
  function falarCuidado(chave, uniId) {
    var Cu = Reino.Cuidados, texto = Cu.frases[chave];
    if (!texto) return Promise.resolve(null);
    var voz = Cu.vozDaFrase(chave);
    // balão comum que fecha sozinho em 5 s
    var op = { voz: voz, agora: true, tempo: 5000 };
    if (voz === 'unicornio') op.quem = { nome: P.nomeUni(uniId), retrato: retratoUni(uniId), voz: voz };
    return balaoNaTela(texto, op);
  }
  // Balão dos cuidados com uma tela aberta: ele nunca cobre um botão dela. Enquanto está aberto,
  // body.recado-cuidado desce o balão para o pé da tela e encolhe as telas para acima dele
  // (--recado-altura, ui-petshop.css; o painel rola se precisar). Uma tela nova por cima (a
  // confirmação de outra compra) fecha o balão. Os balões das outras telas não mudam.
  var recado = null;   // { texto, telas } do balão dos cuidados que está sobre as telas
  function soLetras(t) { return String(t).replace(/[^a-zà-ÿ0-9]/gi, '').slice(0, 24); }
  function balaoNaTela(texto, op) {
    var pr = Reino.Claude.falar(texto, op);
    if (!UI.temTela()) return pr;
    var meu = recado = { texto: texto, telas: pilha.length };
    var corpo = document.body;
    corpo.classList.add('recado-cuidado');
    var tentativas = 0;
    (function medir() {
      if (recado !== meu) return;
      var bal = document.querySelector('#claude-balao:not([hidden])');
      var tx = bal && bal.querySelector('.claude-texto');
      // com outro balão aberto, o nosso entra 180 ms depois (claude.js): espera ele aparecer
      if (!tx || soLetras(tx.textContent) !== soLetras(texto)) { if (++tentativas < 90) requestAnimationFrame(medir); return; }
      corpo.style.setProperty('--recado-altura', Math.ceil(bal.getBoundingClientRect().height) + 'px');
      requestAnimationFrame(function () { if (recado === meu) mostrarBotoes(); });
    })();
    // segurança: se o balão for descartado ainda na fila (Claude.limpar), a promessa não termina;
    // a tela volta ao tamanho de sempre depois do tempo do balão + 1,5 s
    var seguranca = setTimeout(function () { if (recado === meu) soltarRecado(); }, (op.tempo || 5000) + 1500);
    var focoAntes = document.activeElement;
    pr.then(function () {
      clearTimeout(seguranca);
      if (recado === meu) soltarRecado();
      // o balão sumiu sozinho com o foco nele (Tab preso inclui o balão): o foco volta para a tela
      var t = topo(), at = document.activeElement;
      if (t && (!at || at === document.body || (at.closest && at.closest('#claude-balao')))) {
        if (!(t.contains(focoAntes) && focar(focoAntes))) focar(focaveis(t)[0]);
      }
    });
    return pr;
  }
  // a tela encolheu: a fileira de botões (ou o que está com o foco) continua à vista, rolando só
  // o conteúdo do painel (sem scrollIntoView, que também rolaria a tela de fundo)
  function mostrarBotoes() {
    var t = topo(), pc = t && t.querySelector('.painel-conteudo');
    if (!pc) return;
    var fileiras = pc.querySelectorAll('.intro-botoes');
    var alvo = fileiras.length ? fileiras[fileiras.length - 1] : (pc.contains(document.activeElement) ? document.activeElement : null);
    if (!alvo) return;
    var r = alvo.getBoundingClientRect(), c = pc.getBoundingClientRect();
    if (r.bottom > c.bottom - 8) pc.scrollTop += Math.min(r.bottom - c.bottom + 12, r.top - c.top - 8);
  }
  function soltarRecado() {
    recado = null;
    document.body.classList.remove('recado-cuidado');
    document.body.style.removeProperty('--recado-altura');
  }
  // Um balão sem botões e não modal (a despedida da Dona Aveia, o "Faltam N estrelas"…) que já
  // estava aberto quando ela tocou ou apertou a tecla que abriu uma tela nova fecha: ficava por
  // cima da tela e o toque dela caía no "Ok!"
  var balaoNpcNoGesto = null, telasAntes = 0;
  function textoBalaoNpc() {
    var bal = document.querySelector('#claude-balao:not([hidden])');
    if (!bal || bal.classList.contains('com-botoes')) return null;
    if (Reino.Claude.dialogoAberto && Reino.Claude.dialogoAberto()) return null;
    return soLetras(bal.querySelector('.claude-texto').textContent);
  }
  ['pointerdown', 'keydown'].forEach(function (ev) {
    document.addEventListener(ev, function (e) { if (e.isTrusted) balaoNpcNoGesto = textoBalaoNpc(); }, true);
  });
  U.on(EV.TELAS, function (n) {
    var abriu = n > telasAntes; telasAntes = n;
    if (abriu && balaoNpcNoGesto && textoBalaoNpc() === balaoNpcNoGesto && !(recado && soLetras(recado.texto) === balaoNpcNoGesto)) {
      // limpar, não só fechar: a despedida da Dona Aveia na fila atrás do "Faltam…" entrava por cima da tela nova
      balaoNpcNoGesto = null; Reino.Claude.limpar();
    }
  });
  U.on(EV.TELAS, function (n) {
    if (!recado) return;
    if (n > recado.telas) {                                           // tela nova por cima: o recado já passou
      var tx = document.querySelector('#claude-balao:not([hidden]) .claude-texto');
      var eraEle = tx && soLetras(tx.textContent) === soLetras(recado.texto);
      soltarRecado();
      if (eraEle) Reino.Claude.fechar();
    }
    else if (!n) soltarRecado();                                      // voltou ao mapa: balão comum
    else recado.telas = n;
  });
  // dá uma comida da despensa: nhac + o unicórnio agradece; barriga cheia: não gasta a comida
  function darComida(uniId, comidaId) {
    var r = Reino.Cuidados.alimentar(uniId, comidaId);
    if (r.ok) { Reino.Som.tocar('nhac'); falarCuidado('comeu', uniId); }
    else if (r.motivo === 'cheio') { Reino.Som.tocar('toque'); falarCuidado('cheio', uniId); }
    else if (r.motivo === 'sem-comida') { Reino.Som.tocar('toque'); falarCuidado('despensaVazia', uniId); }
    return r;
  }
  function comidaPorId(id) { return Reino.Cuidados.comidas().find(function (c) { return c.id === id; }) || null; }
  function textoEnche(c) { return c.enche ? 'Enche tudo!' : 'Enche +' + c.fome; }
  // nome da comida: palavra com hífen não quebra no hífen ("arco-" / "íris"); o resto hifeniza
  function nomeComida(nome) {
    return String(nome).split(/(\S+-\S+)/).map(function (p, i) { return i % 2 ? el('span.sem-quebra', p) : hifenizar(p); });
  }

  R.CUIDADO = CUIDADO;
  R.cuidadosProntos = cuidadosProntos;
  R.comBanho = comBanho;
  R.uniChocado = uniChocado;
  R.iconePequeno = iconePequeno;
  R.barrasCuidado = barrasCuidado;
  R.rotularMontaria = rotularMontaria;
  R.falarCuidado = falarCuidado;
  R.balaoNaTela = balaoNaTela;
  R.darComida = darComida;
  R.textoEnche = textoEnche;
  R.nomeComida = nomeComida;
})();
