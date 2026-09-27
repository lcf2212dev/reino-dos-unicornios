/* "Quem vai jogar?" (UI.telaQuemVaiJogar) e "Trocar jogador" (UI.trocarJogador): cartões com os jogadores deste
   aparelho e os do banco, pedir a senha e criar jogador (login, senha e repetir a senha, só texto).
   As regras (contas, onde mora cada save) ficam em sistemas/jogadores.js; aqui, só as telas.
   Roda também ANTES do P.carregar (aparelho novo): nada aqui lê o estado do save. CSS: css/ui-jogadores.css. */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI;
  function J() { return Reino.Jogadores; }
  function som(n) { try { Reino.Som.tocar(n); } catch (e) { /* sem som ainda */ } }

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

  /* ---------- pedir a senha de um jogador que este aparelho não lembra ---------- */
  function pedirSenha(login) {
    return new Promise(function (resolver) {
      var pn = UI.painel('jogador-senha', '🔒 ' + J().nomeDoLogin(login), { aoFechar: function () { resolver(false); } });
      var s = campo('jogador-senha-campo', 'Senha', { maxlength: Reino.config.jogadores.senhaMax });
      var erro = el('p.jogadores-erro', { role: 'alert', hidden: true });
      var ir = el('button.btn-grande.btn-principal', { type: 'button' }, 'Entrar ✨');
      pn.conteudo.appendChild(el('div.jogadores-form', s.linha, erro, el('div.intro-botoes', ir)));
      function tentar() {
        ocupado(ir, true);
        J().entrar(login, s.input.value).then(function (r) {
          ocupado(ir, false);
          if (r.ok) { som('selecionar'); UI.fecharTela(pn.tela); resolver(true); return; }
          aviso(erro, r.erro === 'senha' ? 'senhaErrada' : r.erro); s.input.select();
        });
      }
      ir.addEventListener('click', tentar);
      s.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') tentar(); });
      setTimeout(function () { s.input.focus(); }, 50);
    });
  }

  /* ---------- criar jogador ---------- */
  function criarJogador() {
    return new Promise(function (resolver) {
      var pn = UI.painel('jogador-criar', '➕ Criar jogador', { aoFechar: function () { resolver(null); } });
      var c = Reino.config.jogadores;
      var l = campo('jogador-login', 'Nome de login', { maxlength: c.loginMax });
      var s1 = campo('jogador-senha1', 'Senha', { maxlength: c.senhaMax });
      var s2 = campo('jogador-senha2', 'Repita a senha', { maxlength: c.senhaMax });
      var erro = el('p.jogadores-erro', { role: 'alert', hidden: true });
      var ir = el('button.btn-grande.btn-principal', { type: 'button' }, 'Criar ✨');
      pn.conteudo.appendChild(el('div.jogadores-form',
        el('p.jogadores-dica', 'Letras minúsculas, números, - e _.'), l.linha, s1.linha, s2.linha, erro, el('div.intro-botoes', ir)));
      // o login só aceita o que vale: maiúscula vira minúscula e o resto some enquanto digita
      l.input.addEventListener('input', function () {
        var v = l.input.value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9_-]/g, '');
        if (v !== l.input.value) l.input.value = v;
      });
      function tentar() {
        var login = l.input.value, senha = s1.input.value;
        if (!J().valido(login)) { aviso(erro, 'login'); l.input.focus(); return; }
        if (!J().senhaValida(senha)) { aviso(erro, 'senha'); s1.input.focus(); return; }
        if (senha !== s2.input.value) { aviso(erro, 'iguais'); s2.input.focus(); return; }
        ocupado(ir, true);
        J().criar(login, senha).then(function (r) {
          ocupado(ir, false);
          if (r.ok) { som('moeda'); UI.fecharTela(pn.tela); resolver(login); return; }
          aviso(erro, r.erro); (r.erro === 'senha' ? s1 : l).input.focus();
        });
      }
      ir.addEventListener('click', tentar);
      [l, s1, s2].forEach(function (x, i, t) {
        x.input.addEventListener('keydown', function (e) { if (e.key !== 'Enter') return; if (t[i + 1]) t[i + 1].input.focus(); else tentar(); });
      });
      setTimeout(function () { l.input.focus(); }, 50);
    });
  }

  /* ---------- Quem vai jogar? ---------- */
  // resolve com o login de quem entrou (já conferido e lembrado neste aparelho), ou null se fechou (só com podeFechar)
  UI.telaQuemVaiJogar = function (opcoes) {
    opcoes = opcoes || {};
    return new Promise(function (resolver) {
      var pn = UI.painel('jogadores', 'Quem vai jogar?', { semFechar: !opcoes.podeFechar, aoFechar: function () { resolver(null); } });
      var grade = el('div.jogadores-grade', { role: 'list' });
      var estado = el('p.jogadores-estado', { 'aria-live': 'polite' }, 'Procurando jogadores...');
      var criar = el('button.btn-grande.btn-secundario.jogadores-criar', { type: 'button' }, '➕ Criar jogador');
      pn.conteudo.appendChild(el('div.jogadores', grade, estado, el('div.intro-botoes', criar)));
      var fim = false;
      function entrou(login) { if (fim) return; fim = true; UI.fecharTela(pn.tela); resolver(login); }
      function cartao(login) {
        var atual = opcoes.podeFechar && login === J().atual();
        var b = el('button.jogadores-cartao', { type: 'button', role: 'listitem', 'data-login': login, 'aria-current': atual ? 'true' : null },
          el('span.jogadores-retrato', { 'aria-hidden': 'true' }, arteDoCartao(login)),
          el('b.jogadores-nome', J().nomeDoLogin(login)),
          J().lembrado(login) ? null : el('small.jogadores-cadeado', '🔒 senha'));
        b.addEventListener('click', function () {
          som('toque');
          if (J().lembrado(login)) J().entrar(login).then(function (r) { if (r.ok) entrou(login); });
          else pedirSenha(login).then(function (ok) { if (ok) entrou(login); });
        });
        return b;
      }
      function mostrar(lista) {
        var foco = grade.contains(document.activeElement) ? document.activeElement.getAttribute('data-login') : null;
        grade.innerHTML = '';
        lista.forEach(function (l) { grade.appendChild(cartao(l)); });
        if (foco) { var f = grade.querySelector('[data-login="' + foco + '"]'); if (f) f.focus(); }
      }
      mostrar(J().listarLocais());
      J().listar().then(function (lista) { if (fim) return; mostrar(lista); estado.hidden = true; });
      criar.addEventListener('click', function () {
        som('toque');
        criarJogador().then(function (login) { if (login) entrou(login); });
      });
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
})();
