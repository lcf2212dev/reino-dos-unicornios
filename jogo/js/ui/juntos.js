/* "Jogar com amigos" (docs/contratos/juntos.md §8): o botão 👥 do HUD e a tela de servidores, como no PKXD.
   Quem cria um servidor recebe um código de 4 letras e um link de convite; quem entra joga junto (e cada um fica com o
   seu progresso). Quem não cria nem entra em nenhum continua sozinho, como sempre foi.
   O estado e a rede ficam em sistemas/juntos.js; aqui só a tela. CSS: css/ui-juntos.css. */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI;
  var EV = Reino.EVENTOS;
  var RECADOS = [{ id: 'oi', rotulo: 'Oi!' }, { id: 'vem', rotulo: 'Vem cá!' }, { id: 'legal', rotulo: 'Que legal!' }, { id: 'tchau', rotulo: 'Até logo!' }];

  // 👋 do aceno (o mesmo desenho no balão do mapa e no botão da tela)
  Reino.registrarIcones({ '👋': { n: 'aceno', p: { k: '#3a2446', w: '#ffcf9e', W: '#ffe9cd', s: '#e0a271' }, d: [
    '................',
    '.....kkkkk......',
    '....kwwwwwk.....',
    '...kwwWWwwk.....',
    '...kwwWWwwk.....',
    '...kwwwwwsk.....',
    '...kwwwwwsk.....',
    '...kwwwwwsk.....',
    '...kwwwwwsk.....',
    '...kwwwwwsk.....',
    '..kkwwwwwskk....',
    '..kwwwwwwwwk....',
    '..kwwwwwwwwk....',
    '...kkkkkkkk.....',
    '................',
    '................',
  ] } });

  function juntos() { return Reino.Juntos; }
  function som(n) { try { Reino.Som.tocar(n); } catch (e) { /* sem som ainda */ } }
  function soCodigo(v) { return typeof v === 'string' ? v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) : ''; }
  function linkDoConvite(codigo) {
    try { return location.origin + location.pathname + '?servidor=' + codigo; } catch (e) { return '?servidor=' + codigo; }
  }
  function retrato(j) {
    try {
      var ap = Reino.JuntosDesenho.aparencia(j);
      var def = j.uni ? { id: 'jog-' + j.login, raridade: 'comum', cores: j.uni.cores } : null;
      var spr = def ? PA.montada(def, j.uni.estagio, 0, ap, { vista: 'lado' }) : PA.mariana(ap, false, 0, { vista: 'lado' });
      return PA.paraDOM(spr, 2, 'juntos-retrato');
    } catch (e) { return el('span.juntos-retrato', { 'aria-hidden': 'true' }); }
  }
  function linha(j, aqui, nomeDoLugar) {
    return el('div.juntos-linha' + (aqui ? '.juntos-aqui' : ''),
      el('div.juntos-retrato-caixa', retrato(j)),
      el('div.juntos-texto', el('b.juntos-nome', j.nome),
        el('span.juntos-onde', aqui ? 'Aqui, com você' : nomeDoLugar(j.sala))));
  }

  /* ---------- a tela ---------- */
  function abrirJuntos() {
    var J = juntos();
    var pn = UI.painel('juntos', '👥 Jogar com amigos');
    var lista = el('div.juntos-lista'), pe = el('div.juntos-pe'), corpo = el('div.juntos-corpo');
    pn.conteudo.appendChild(corpo);
    var timer = 0, assinatura = null, render = null, digitado = '';
    function pararTimer() { if (timer) { clearInterval(timer); timer = 0; } }
    function chaveDoEstado() {
      var info = J.servidor();
      return (J.pode() ? 'p' : '-') + '|' + (info ? info.codigo + ':' + info.nome : '-') + '|' + J.aviso();
    }
    function chaveDaLista() {
      return J.todos().map(function (j) { return j.login + ':' + j.sala + ':' + j.nome; }).join('|') + '|' + J.salaAtual() + '|' + J.total();
    }
    // a tela se refaz sozinha quando o servidor muda (criou, entrou, saiu) e a lista, quando alguém entra ou sai
    function acompanhar() {
      pararTimer();
      timer = setInterval(function () {
        if (!pn.tela.isConnected) { pararTimer(); return; }
        if (chaveDoEstado() !== render) { pintar(); return; }
        if (!J.servidor()) return;
        var s = chaveDaLista();
        if (s === assinatura) return;
        assinatura = s;
        pintarLista();
      }, 700);
    }
    function recados(naSala) {
      pe.textContent = '';
      if (!naSala.length) return;
      pe.appendChild(el('p', 'Dizer para quem está aqui:'));
      var fila = el('div.juntos-recados');
      var acenar = el('button.btn-pequeno.juntos-acenar', { type: 'button' }, UI.iconeHud('👋'), el('span', 'Acenar'));
      acenar.addEventListener('click', function () { som('toque'); J.acenar(); });
      fila.appendChild(acenar);
      RECADOS.forEach(function (r) {
        var b = el('button.btn-pequeno', { type: 'button' }, r.rotulo);
        b.addEventListener('click', function () { som('toque'); J.recado(r.id); });
        fila.appendChild(b);
      });
      pe.appendChild(fila);
    }
    function pintarLista() {
      var todos = J.todos(), sala = J.salaAtual(), aqui = [], fora = [];
      todos.forEach(function (j) { (j.sala === sala ? aqui : fora).push(j); });
      aqui.sort(function (a, b) { return a.nome.localeCompare(b.nome); });
      fora.sort(function (a, b) { return a.nome.localeCompare(b.nome); });
      lista.textContent = '';
      if (!todos.length) lista.appendChild(el('p.juntos-vazio', 'Ninguém entrou ainda. Mande o convite para os seus amigos!'));
      aqui.concat(fora).forEach(function (j) { lista.appendChild(linha(j, j.sala === sala, J.nomeDaSala)); });
      recados(aqui);
      assinatura = chaveDaLista();
    }

    /* sozinha (sem servidor): criar ou entrar */
    function semServidor() {
      corpo.textContent = '';
      corpo.appendChild(el('p.juntos-dica', 'Crie um servidor e mande o convite para os seus amigos. Quem entrar com o código joga junto com você — e cada um fica com o seu progresso.'));
      var criar = el('button.btn-grande.btn-principal', { type: 'button' }, 'Criar servidor');
      criar.addEventListener('click', function () {
        if (criar.disabled) return;
        som('toque'); criar.disabled = true; criar.textContent = 'Criando…';
        J.limparAviso();
        J.criar().then(function (ok) { if (!ok) { criar.disabled = false; criar.textContent = 'Criar servidor'; if (pn.tela.isConnected) pintar(); } });
      });
      var campo = el('input.campo-nome.juntos-campo', { type: 'text', maxlength: '4', inputmode: 'text', autocapitalize: 'characters',
        autocomplete: 'off', spellcheck: 'false', placeholder: 'ABCD', 'aria-label': 'Código do servidor de um amigo' });
      campo.value = digitado;
      campo.addEventListener('input', function () { var v = soCodigo(campo.value); if (v !== campo.value) campo.value = v; digitado = campo.value; });
      var entrar = el('button.btn-pequeno', { type: 'button' }, 'Entrar');
      var erro = el('p.juntos-erro', { hidden: !J.aviso() }, J.aviso() || '');
      function avisar(t) { erro.textContent = t || ''; erro.hidden = !t; }
      function tentarEntrar() {
        var c = soCodigo(campo.value);
        if (c.length !== 4) { avisar('O código do servidor tem 4 letras ou números.'); campo.focus(); return; }
        som('toque'); entrar.disabled = true; J.limparAviso(); avisar('');
        J.entrar(c).then(function (ok) {
          if (!ok) { entrar.disabled = false; avisar(J.aviso() || 'Não deu para entrar agora. Tente de novo.'); }
        });
      }
      entrar.addEventListener('click', tentarEntrar);
      campo.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); tentarEntrar(); } });
      corpo.appendChild(el('div.juntos-acao', criar));
      corpo.appendChild(el('p.juntos-dica', 'Ou entre no servidor de um amigo:'));
      corpo.appendChild(el('div.juntos-form', campo, entrar));
      corpo.appendChild(erro);
    }

    /* dentro do servidor: código, convite, quem está e o que fazer */
    function comServidor(info) {
      corpo.textContent = '';
      corpo.appendChild(el('p.juntos-dica', 'Servidor de ' + info.nome + '. Mande o código e o link para os seus amigos entrarem.'));
      corpo.appendChild(el('p.juntos-codigo', el('span.juntos-codigo-rotulo', 'Código do servidor'), el('b.juntos-codigo-grande', info.codigo)));
      var link = linkDoConvite(info.codigo);
      var convidar = el('button.btn-grande.btn-principal', { type: 'button' }, 'Copiar convite');
      convidar.addEventListener('click', function () {
        som('toque');
        var dica = corpo.querySelector('.juntos-convite-dica');
        function avisar(t) { if (dica) dica.textContent = t; }
        try {
          if (navigator.share) { navigator.share({ title: 'Reino dos Unicórnios', text: 'Entra no meu servidor no Reino dos Unicórnios!', url: link }).then(function () { avisar('Convite enviado!'); }, function () { /* cancelou */ }); return; }
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(link).then(function () { avisar('Convite copiado! Cole no zap dos seus amigos.'); }, function () { avisar('Copie o link abaixo.'); });
            return;
          }
        } catch (e) { /* cai no aviso */ }
        avisar('Copie o link abaixo.');
      });
      corpo.appendChild(convidar);
      corpo.appendChild(el('p.juntos-link', { title: link }, link));
      corpo.appendChild(el('p.juntos-dica.juntos-convite-dica', ''));
      corpo.appendChild(el('h3.juntos-titulo', 'Quem está aqui'));
      corpo.appendChild(lista);
      corpo.appendChild(pe);
      if (J.aviso()) corpo.appendChild(el('p.juntos-erro', J.aviso()));
      var botoes = el('div.juntos-botoes');
      var sair = el('button.btn-pequeno', { type: 'button' }, 'Sair do servidor');
      sair.addEventListener('click', function () {
        som('toque');
        J.sair().then(function () { if (pn.tela.isConnected) pintar(); });
      });
      botoes.appendChild(sair);
      if (J.dono()) {
        var fechar = el('button.btn-pequeno.btn-perigo', { type: 'button' }, 'Fechar o servidor');
        fechar.addEventListener('click', function () {
          som('toque');
          UI.escolher('Fechar o servidor? Quem estiver jogando com você sai dele.', [
            { rotulo: 'Fechar', valor: true, principal: true, gasta: false }, { rotulo: 'Agora não', valor: false, seguro: true },
          ]).then(function (sim) {
            if (!sim) return;
            J.fechar().then(function (ok) { if (ok && pn.tela.isConnected) pintar(); });
          });
        });
        botoes.appendChild(fechar);
      }
      corpo.appendChild(botoes);
      pintarLista();
    }

    function pintar() {
      if (!pn.tela.isConnected) return;
      var J = juntos();
      if (!J || !J.pode()) {
        corpo.textContent = '';
        pararTimer();
        corpo.appendChild(el('p.juntos-dica', 'Jogar com amigos precisa da internet e do jogo aberto pelo site (ou pelo app). Aqui você continua jogando sozinha.'));
        return;
      }
      var info = J.servidor();
      if (info) comServidor(info); else semServidor();
      render = chaveDoEstado();
    }
    pintar();
    acompanhar();
    return pn.tela;
  }
  UI.abrirJuntos = abrirJuntos;

  /* ---------- o botão do HUD ---------- */
  function pintarBotao() {
    var b = U.$('#hud .btn-juntos');
    if (!b) return;
    var J = juntos(), n = J ? J.total() : 0;
    b.hidden = false;   // sempre à mão: é por ele que se cria e entra num servidor
    var c = b.querySelector('.juntos-contagem');
    if (c) { c.hidden = n < 1; c.textContent = n > 0 ? String(n) : ''; }
    var noServidor = J && J.servidor();
    b.setAttribute('aria-label', noServidor ? 'Jogar com amigos: ' + (n ? n + ' no servidor' : 'servidor de ' + (noServidor.nome || '')) : 'Jogar com amigos');
    b.title = b.getAttribute('aria-label');
  }
  function botaoJuntos() {
    var b = el('button.btn-tela-cheia.btn-juntos', { type: 'button', 'aria-label': 'Jogar com amigos', title: 'Jogar com amigos' },
      UI.iconeHud('👥'), el('span.juntos-contagem', { 'aria-hidden': 'true', hidden: true }));
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); });
    b.addEventListener('click', function () { som('toque'); pintarBotao(); abrirJuntos(); });
    return b;
  }
  UI.registrarBotaoHud({ id: 'juntos', ordem: 5, criar: botaoJuntos, pintar: pintarBotao, eventos: [EV.JUNTOS] });

  /* aviso fora da tela: o servidor fechou ou o convite não vale (a criança vê na hora, sem abrir nada) */
  var ultimoAviso = '';
  U.on(EV.JUNTOS, function (c) {
    var a = (c && c.aviso) || '';
    if (a && a !== ultimoAviso && typeof UI.avisoItem === 'function') UI.avisoItem({ icone: '👥', texto: a });
    ultimoAviso = a;
  });
})();
