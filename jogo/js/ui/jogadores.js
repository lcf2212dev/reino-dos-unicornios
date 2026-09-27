/* "Entrar no Reino" (UI.telaQuemVaiJogar), "Trocar jogador" (UI.trocarJogador) e "Sair" (UI.sairDoJogador): cartões
   com quem este aparelho lembra ("Neste aparelho") e os outros do banco ("No reino"), que só preenchem o login (todo
   mundo entra com senha), e as abas "Entrar" (login e senha) e "Criar conta" (login, senha e repetir, só texto).
   As regras (contas, onde mora cada save) ficam em sistemas/jogadores.js; aqui, só as telas.
   Roda também ANTES do P.carregar (aparelho novo): nada aqui lê o estado do save. CSS: css/ui-jogadores.css. */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI;
  function J() { return Reino.Jogadores; }
  function som(n) { try { Reino.Som.tocar(n); } catch (e) { /* sem som ainda */ } }

  // a 🚪 do "Sair" (Ajustes)
  Reino.registrarIcones({ '🚪': { n: 'porta', p: { k: '#3a2446', m: '#b06a3b', M: '#8a4f2a', c: '#d98d52', o: '#ffd34d' }, d: [
    '................',
    '...kkkkkkkkkk...',
    '...kMmmmmmmmk...',
    '...kMcccccmmk...',
    '...kMcMMMcmmk...',
    '...kMcMmMcmmk...',
    '...kMcMMMcmmk...',
    '...kMcccccmmk...',
    '...kMmmmmmook...',
    '...kMmmmmmook...',
    '...kMcccccmmk...',
    '...kMcMMMcmmk...',
    '...kMcMmMcmmk...',
    '...kMcccccmmk...',
    '..kkkkkkkkkkkk..',
    '................',
  ] } });

  /* ---------- arte dos cartões ---------- */
  function hex(h, sat, luz) {   // HSL → #rrggbb (o desenho em pixel mistura cores em hex)
    sat /= 100; luz /= 100;
    var f = function (n) { var k = (n + h / 30) % 12, c = luz - sat * Math.min(luz, 1 - luz) * Math.max(-1, Math.min(k - 3, 9 - k, 1)); return ('0' + Math.round(c * 255).toString(16)).slice(-2); };
    return '#' + f(0) + f(8) + f(4);
  }
  // cada login com o seu unicórnio (a cor sai do nome: sempre a mesma para o mesmo jogador)
  function unicornioDoLogin(login) {
    var n = 0;
    for (var i = 0; i < login.length; i++) n = (n * 31 + login.charCodeAt(i)) >>> 0;
    var h = n % 360;
    return { id: 'jogador-' + login, raridade: 'comum', cores: { corpo: hex(h, 70, 96), crina: [hex(h, 85, 62), hex((h + 40) % 360, 85, 70), hex((h + 80) % 360, 90, 78)], chifre: '#ffd34d' } };
  }
  // a Mariana montada no unicórnio dela, com a aparência que ela escolheu (só leitura do save deste aparelho)
  function arteDaMariana() {
    var e = null;
    if (J().ehMariana() && Reino.Progresso.estado()) e = Reino.Progresso.estado();
    else { try { e = JSON.parse(localStorage.getItem(Reino.config.chaveSave) || 'null'); } catch (x) { e = null; } }
    var ap = e && e.aparencia && typeof e.aparencia === 'object' ? Object.assign({}, PA.APARENCIA_PADRAO, e.aparencia) : PA.APARENCIA_PADRAO;
    var d = Reino.Unicornios.def('inicial', (e && typeof e.corInicial === 'string' && e.corInicial) || 'rosa');
    return PA.montada(d, 3, 0, ap, {});
  }
  function arteDoCartao(login) {
    try { return PA.paraDOM(login === J().MARIANA ? arteDaMariana() : PA.unicornio(unicornioDoLogin(login), 3, 0), 3, 'jogadores-arte'); }
    catch (x) { return el('span.jogadores-icone', { 'aria-hidden': 'true' }, '🦄'); }
  }

  var ERROS = {
    login: function () { var c = Reino.config.jogadores; return 'Use só letras minúsculas, números, - e _ (de ' + c.loginMin + ' a ' + c.loginMax + ' letras).'; },
    existe: function () { return 'Esse nome já existe. Escolha outro!'; },
    senha: function () { var c = Reino.config.jogadores; return 'A senha precisa ter de ' + c.senhaMin + ' a ' + c.senhaMax + ' letras.'; },
    senhaErrada: function () { return 'Senha errada. Tente de novo!'; },
    naoExiste: function () { return 'Não achei esse jogador.'; },
    rede: function () { return 'Não deu para falar com o reino agora. Tente de novo.'; },
    iguais: function () { return 'As duas senhas não são iguais.'; },
  };
  function aviso(p, erro) { p.textContent = erro ? ERROS[erro]() : ''; p.hidden = !erro; }
  function campo(id, rotulo, opcoes) {
    var input = el('input.campo-nome.jogadores-campo#' + id, Object.assign({ type: 'text', autocomplete: 'off', autocapitalize: 'none', spellcheck: 'false' }, opcoes || {}));
    return { input: input, linha: el('label.jogadores-linha', { for: id }, el('span.jogadores-rotulo', rotulo), input) };
  }
  // botão ocupado enquanto espera o banco (dois toques não criam duas vezes)
  function ocupado(b, sim) { b.disabled = sim; b.setAttribute('aria-busy', String(sim)); }

  // login só com o que vale: maiúscula vira minúscula, acento e o resto somem enquanto digita
  function soLogin(input) {
    input.addEventListener('input', function () {
      var v = input.value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9_-]/g, '');
      if (v !== input.value) input.value = v;
    });
  }
  // Enter num campo leva ao próximo; no último, faz a ação
  function encadear(campos, acao) {
    campos.forEach(function (x, i) {
      x.input.addEventListener('keydown', function (e) { if (e.key !== 'Enter') return; e.preventDefault(); if (campos[i + 1]) campos[i + 1].input.focus(); else acao(); });
    });
  }

  /* ---------- Entrar no Reino: cartões deste aparelho, abas "Entrar" e "Criar conta" ---------- */
  // resolve com o login de quem entrou (já conferido e lembrado neste aparelho), ou null se fechou (só com podeFechar)
  UI.telaQuemVaiJogar = function (opcoes) {
    opcoes = opcoes || {};
    return new Promise(function (resolver) {
      var pn = UI.painel('jogadores', 'Entrar no Reino', { semFechar: !opcoes.podeFechar, aoFechar: function () { resolver(null); } });
      var c = Reino.config.jogadores;
      var fim = false;
      function entrou(login) { if (fim) return; fim = true; UI.fecharTela(pn.tela); resolver(login); }

      // cartões: "Neste aparelho" (entram direto) e "No reino" (abrem o Entrar com o login preenchido)
      var gradeAqui = el('div.jogadores-grade', { role: 'list' }), gradeReino = el('div.jogadores-grade', { role: 'list' });
      var secAqui = el('section.jogadores-secao', el('h3.jogadores-subtitulo', 'Neste aparelho'), gradeAqui);
      var secReino = el('section.jogadores-secao', el('h3.jogadores-subtitulo', 'No reino'), gradeReino);
      var estado = el('p.jogadores-estado', { 'aria-live': 'polite' }, 'Procurando jogadores...');

      // abas
      var abas = {}, paineis = {};
      function aba(nome, rotulo) {
        var b = el('button.jogadores-aba#jogadores-aba-' + nome, { type: 'button', role: 'tab', 'data-aba': nome, 'aria-controls': 'jogadores-painel-' + nome }, rotulo);
        b.addEventListener('click', function () { som('toque'); mostrarAba(nome, true); });
        b.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); var outra = nome === 'entrar' ? 'criar' : 'entrar'; mostrarAba(outra, false); abas[outra].focus(); }
        });
        abas[nome] = b;
        return b;
      }
      var barra = el('div.jogadores-abas', { role: 'tablist', 'aria-label': 'Entrar ou criar conta' }, aba('entrar', '🔑 Entrar'), aba('criar', '➕ Criar conta'));

      // Entrar
      var eLogin = campo('jogador-entrar-login', 'Login', { maxlength: c.loginMax });
      var eSenha = campo('jogador-entrar-senha', 'Senha', { maxlength: c.senhaMax });
      var eErro = el('p.jogadores-erro', { role: 'alert', hidden: true });
      var eIr = el('button.btn-grande.btn-principal.jogadores-entrar', { type: 'button' }, 'Entrar ✨');
      soLogin(eLogin.input);
      paineis.entrar = el('div.jogadores-form#jogadores-painel-entrar', { role: 'tabpanel', 'aria-labelledby': 'jogadores-aba-entrar' },
        eLogin.linha, eSenha.linha, eErro, el('div.intro-botoes', eIr));
      function tentarEntrar() {
        var login = eLogin.input.value, senha = eSenha.input.value;
        if (!J().valido(login)) { aviso(eErro, 'login'); eLogin.input.focus(); return; }
        ocupado(eIr, true);
        J().entrar(login, senha).then(function (r) {
          ocupado(eIr, false);
          if (r.ok) { som('selecionar'); entrou(login); return; }
          aviso(eErro, r.erro === 'senha' ? 'senhaErrada' : r.erro); mostrarBotao(eIr);
          (r.erro === 'naoExiste' ? eLogin : eSenha).input.select();
        });
      }
      eIr.addEventListener('click', tentarEntrar);
      encadear([eLogin, eSenha], tentarEntrar);

      // Criar conta
      var cLogin = campo('jogador-login', 'Login', { maxlength: c.loginMax });
      var s1 = campo('jogador-senha1', 'Senha', { maxlength: c.senhaMax });
      var s2 = campo('jogador-senha2', 'Repita a senha', { maxlength: c.senhaMax });
      var cErro = el('p.jogadores-erro', { role: 'alert', hidden: true });
      var cIr = el('button.btn-grande.btn-principal.jogadores-criar', { type: 'button' }, 'Criar ✨');
      soLogin(cLogin.input);
      paineis.criar = el('div.jogadores-form#jogadores-painel-criar', { role: 'tabpanel', 'aria-labelledby': 'jogadores-aba-criar' },
        el('p.jogadores-dica', 'Letras minúsculas, números, - e _.'), cLogin.linha, s1.linha, s2.linha, cErro, el('div.intro-botoes', cIr));
      function tentarCriar() {
        var login = cLogin.input.value, senha = s1.input.value;
        if (!J().valido(login)) { aviso(cErro, 'login'); cLogin.input.focus(); return; }
        if (!J().senhaValida(senha)) { aviso(cErro, 'senha'); s1.input.focus(); return; }
        if (senha !== s2.input.value) { aviso(cErro, 'iguais'); s2.input.focus(); return; }
        ocupado(cIr, true);
        J().criar(login, senha).then(function (r) {
          ocupado(cIr, false);
          if (r.ok) { som('moeda'); entrou(login); return; }
          aviso(cErro, r.erro); (r.erro === 'senha' ? s1 : cLogin).input.focus(); mostrarBotao(cIr);
        });
      }
      cIr.addEventListener('click', tentarCriar);
      encadear([cLogin, s1, s2], tentarCriar);

      function mostrarAba(nome, focar) {
        Object.keys(abas).forEach(function (k) {
          var sim = k === nome;
          abas[k].setAttribute('aria-selected', String(sim));
          abas[k].tabIndex = sim ? 0 : -1;
          paineis[k].hidden = !sim;
        });
        if (focar) (nome === 'entrar' ? (eLogin.input.value ? eSenha : eLogin) : cLogin).input.focus();
      }
      mostrarAba('entrar', false);

      // cartão = atalho do login (todo mundo entra com senha): preenche o login e leva à senha
      function destacar() {
        pn.conteudo.querySelectorAll('.jogadores-cartao').forEach(function (b) {
          b.setAttribute('aria-current', String(b.getAttribute('data-login') === eLogin.input.value));
        });
      }
      function cartao(login) {
        var b = el('button.jogadores-cartao', { type: 'button', role: 'listitem', 'data-login': login },
          el('span.jogadores-retrato', { 'aria-hidden': 'true' }, arteDoCartao(login)),
          el('b.jogadores-nome', J().nomeDoLogin(login)));
        b.addEventListener('click', function () {
          som('toque');
          aviso(eErro, null);
          eLogin.input.value = login; eSenha.input.value = '';
          mostrarAba('entrar', false); destacar(); eSenha.input.focus();
        });
        return b;
      }
      function mostrar(lista) {
        var foco = pn.conteudo.contains(document.activeElement) && document.activeElement.getAttribute('data-login');
        gradeAqui.innerHTML = ''; gradeReino.innerHTML = '';
        lista.forEach(function (l) { (J().lembrado(l) ? gradeAqui : gradeReino).appendChild(cartao(l)); });
        secAqui.hidden = !gradeAqui.firstChild; secReino.hidden = !gradeReino.firstChild;
        if (foco) { var f = pn.conteudo.querySelector('.jogadores-cartao[data-login="' + foco + '"]'); if (f) f.focus(); }
        destacar();
      }
      eLogin.input.addEventListener('input', destacar);
      // quem jogou por último neste aparelho vem preenchido, e o foco vai para a senha
      if (opcoes.ultimo && J().valido(opcoes.ultimo)) eLogin.input.value = opcoes.ultimo;
      // duas colunas em tela larga e baixa (cartões à esquerda, formulário à direita: ui-jogadores.css)
      pn.conteudo.appendChild(el('div.jogadores', el('div.jogadores-lado-cartoes', secAqui, secReino, estado),
        el('div.jogadores-lado-form', barra, paineis.entrar, paineis.criar)));
      // o botão sempre à vista quando a senha tem o foco ou aparece um erro (telas baixas)
      function mostrarBotao(b) { try { b.scrollIntoView({ block: 'nearest' }); } catch (x) { /* navegador antigo */ } }
      eSenha.input.addEventListener('focus', function () { mostrarBotao(eIr); });
      s2.input.addEventListener('focus', function () { mostrarBotao(cIr); });
      mostrar(J().listarLocais());
      J().listar().then(function (lista) { if (fim) return; mostrar(lista); estado.hidden = true; });
      // Esc na tela sem ✕ (entrada do jogo): volta de "Criar conta" para "Entrar"
      if (!opcoes.podeFechar) pn.tela._aoEsc = function () { if (paineis.entrar.hidden) mostrarAba('entrar', true); };
      setTimeout(function () {
        if (fim || pn.conteudo.contains(document.activeElement)) return;
        (eLogin.input.value ? eSenha : eLogin).input.focus();
      }, 80);
    });
  };

  // "Trocar jogador" (abertura e Ajustes): escolheu outro = grava, lembra e recarrega (sistemas/jogadores.js)
  UI.trocarJogador = function () {
    return UI.telaQuemVaiJogar({ podeFechar: true }).then(function (login) {
      if (!login || login === J().atual()) return login;
      // enquanto o progresso de quem sai vai para o banco (a página recarrega em seguida)
      var t = UI.abrirTela('jogadores');
      t.appendChild(el('div.jogadores-guardando', el('p.titulo-pixel', { 'aria-live': 'polite' }, 'Guardando...')));
      return J().trocarPara(login).then(function () { return login; });
    });
  };
  // "Sair" (Ajustes): guarda, e o próximo carregamento mostra "Entrar no Reino" (o save fica onde está)
  UI.sairDoJogador = function () {
    var t = UI.abrirTela('jogadores');
    t.appendChild(el('div.jogadores-guardando', el('p.titulo-pixel', { 'aria-live': 'polite' }, 'Guardando...')));
    return J().sair();
  };
})();
