/* Feira: passaporte em memória, instalações livres e descobertas narradas.
   Contrato: docs/contratos/feira-ciencias.md. Descobertas somam Aura pela regra de Ciências; passaporte só em memória. */
(function () {
  var UI = Reino.UI, U = Reino.util, el = U.el;
  var feitas = new Set();
  var nomesSelos = { jardim: 'Jardim', teia: 'Teia', parcerias: 'Parcerias', habitats: 'Mundos', observatorio: 'Olhar' };
  function texto(t) { return U.colado(Reino._ui.hifenizar(t)); }
  function completa(sala) {
    return sala.missoes.length > 0 && sala.missoes.every(function (m) { return feitas.has(m.id); });
  }
  function visita() {
    return { feitas: Array.from(feitas), selos: Reino.FeiraCiencias.salas.filter(completa).map(function (s) { return s.id; }) };
  }
  function botao(rotulo, acao, classe) {
    return el('button.' + (classe || 'feira-botao'), { type: 'button', on: { click: acao } }, texto(rotulo));
  }
  function ilustracao(sala, missao, feita, escolha) {
    var c = el('canvas.feira-cena', { width: 160, height: 96, 'aria-hidden': 'true' });
    Reino.FeiraCiencias.desenharCena(c.getContext('2d'), sala.id, { feita: feita, missao: missao, escolha: escolha || null });
    return c;
  }
  function avisoAura() {
    var A = Reino.Aura, vezes = A.vezesDaMateria('ciencias');
    if (vezes > 1) return 'Hoje: aura ' + vezes + '× na Feira!';
    var partes = U.hoje().split('-').map(Number), d = new Date(partes[0], partes[1] - 1, partes[2] + 1);
    var amanha = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    var bonus = A.vezesDaMateria('ciencias', amanha);
    return bonus > 1 ? 'Amanhã: aura ' + bonus + '× na Feira!' : 'Cada descoberta dá aura!';
  }
  UI.telaFeira = function (opcoes) {
    opcoes = opcoes || {};
    Reino.FeiraCiencias.visita = visita;
    var salas = Reino.FeiraCiencias.salas, viva = true, versao = 0, fala = [];
    var pn = UI.painel('feira', 'Feira de Ciências', {
      curto: 'Feira', icone: salas[0].emoji,
      aoFechar: function () { viva = false; versao++; Reino.Som.calar(); }
    });
    var c = pn.conteudo;
    function narrar(linhas) {
      fala = linhas.slice();
      var atual = ++versao;
      Reino.Som.calar();
      Reino.Voz.carregar('interior-feira').then(function () {
        if (viva && pn.tela.isConnected && atual === versao) UI.ouvirDeNovo(linhas, { voz: 'narradora' });
      });
    }
    function limpar() {
      versao++; Reino.Som.calar(); c.replaceChildren();
      c.scrollTop = 0;
      c.appendChild(el('p.feira-bonus', texto('✨ ' + avisoAura())));
    }
    function ouvir() { return botao('Ouvir de novo', function () { narrar(fala); }, 'feira-ouvir'); }
    function foco(alvo, titulo) { UI.focarTroca(alvo, titulo, 400); }
    function titulo(nome) { return el('h3.feira-titulo', { tabIndex: -1 }, texto(nome)); }
    function faixa(sala) { c.style.setProperty('--feira-cor', sala ? sala.cor : 'var(--roxo)'); }
    function selos() {
      var lista = el('div.feira-selos');
      salas.forEach(function (sala) {
        var feita = completa(sala);
        var b = botao('', function () { tema(sala); }, 'feira-selo' + (feita ? '.carimbado' : ''));
        b.style.setProperty('--feira-cor', sala.cor);
        b.style.setProperty('--feira-clara', sala.clara);
        b.append(el('span.feira-selo-icone', sala.emoji), el('span.feira-selo-nome', texto(nomesSelos[sala.id] || sala.nome)),
          el('span.feira-selo-estado', feita ? '✓ Feito' : 'Visitar'));
        b.title = sala.nome + (feita ? ': ' + sala.selo : ': visitar');
        lista.appendChild(b);
      });
      return lista;
    }
    function menu() {
      limpar(); faixa(null);
      var h = titulo('Meu passaporte');
      c.append(el('div.feira-cabecalho', h, el('p', texto('Escolha por onde passear.'))), selos(),
        el('p.feira-nota', texto('Os selos ficam nesta visita.')));
      var lista = el('div.feira-temas');
      salas.forEach(function (sala) {
        var b = botao('', function () { tema(sala); }, 'feira-tema');
        b.style.setProperty('--feira-cor', sala.cor);
        b.style.setProperty('--feira-clara', sala.clara);
        b.append(ilustracao(sala, sala.missoes[0], completa(sala)),
          el('span.feira-tema-texto', el('span.feira-tema-nome', texto(sala.nome)), el('span', texto(sala.chamada))));
        lista.appendChild(b);
      });
      c.appendChild(lista); foco(lista.querySelector('button'), h);
    }
    function tema(sala) {
      limpar(); faixa(sala);
      var h = titulo(sala.nome);
      c.append(botao('← Todas as salas', menu, 'feira-voltar'), h,
        el('p', texto(sala.chamada)), ouvir());
      if (completa(sala)) c.appendChild(el('p.feira-carimbo', texto('Selo no passaporte!') + ' ' + texto(sala.selo)));
      c.appendChild(el('p.feira-guia', texto('Escolha uma descoberta')));
      var lista = el('div.feira-instalacoes');
      sala.missoes.forEach(function (m) {
        var feita = feitas.has(m.id);
        var b = botao('', function () { missao(sala, m); }, 'feira-instalacao' + (feita ? '.visitada' : ''));
        b.dataset.missao = m.id;
        b.append(ilustracao(sala, m, feita), el('span', texto(m.titulo)),
          el('span.feira-nota', feita ? '✓ Descoberta feita!' : 'Experimentar →'));
        lista.appendChild(b);
      });
      c.appendChild(lista); narrar([sala.chamada]); foco(lista.querySelector('button'), h);
    }
    function missao(sala, m, refazer) {
      limpar(); faixa(sala);
      var resolvida = feitas.has(m.id) && !refazer, escolha = resolvida ? m.certa : null, ganhoAura = null;
      var h = titulo(m.titulo), palco = el('div.feira-palco'), recado = el('div.feira-recado');
      var acoes = el('div.feira-acoes'), pecas = el('div.feira-pecas');
      c.append(botao('← Voltar às descobertas', function () { tema(sala); }, 'feira-voltar'), h,
        el('div.feira-experimento', palco, el('div.feira-ajuda', recado, ouvir(), pecas, acoes)));
      function pintarCena() { palco.replaceChildren(ilustracao(sala, m, resolvida, escolha)); }
      function mensagem(linhas, cabeca) {
        recado.replaceChildren(el('p.feira-etiqueta', texto(cabeca)));
        linhas.forEach(function (linha) { recado.appendChild(el('p', texto(linha))); });
        narrar(linhas);
      }
      function resultado() {
        pecas.replaceChildren(); acoes.replaceChildren();
        mensagem(m.descoberta, 'Descoberta feita!');
        if (ganhoAura) acoes.appendChild(el('p.feira-ganho', texto('✨ +' + Reino.Aura.texto(ganhoAura.depois - ganhoAura.antes) + ' de aura!')));
        if (completa(sala)) acoes.appendChild(el('p.feira-carimbo', texto('Selo no passaporte!') + ' ' + texto(sala.selo)));
        var proxima = sala.missoes.find(function (x) { return !feitas.has(x.id); });
        var seguir = botao(proxima ? 'Próxima descoberta →' : 'Meu passaporte →', function () {
          if (proxima) missao(sala, proxima); else menu();
        }, 'feira-seguir');
        acoes.append(seguir, botao('Refazer', function () { missao(sala, m, true); }));
        foco(seguir, h);
      }
      pintarCena();
      if (resolvida) { resultado(); return; }
      mensagem(m.convite, 'Vamos experimentar?');
      m.opcoes.forEach(function (op) {
        var b = botao(op.emoji + ' ' + op.nome, function () {
          if (resolvida) return;   // o mesmo toque nunca conta duas vezes
          escolha = op.id;
          U.preencher(c.querySelector('.feira-bonus'), '✨ ' + avisoAura());
          if (op.id === m.certa) {
            resolvida = true; feitas.add(m.id);
            ganhoAura = Reino.Aura.contar(true, 'ciencias');
            pintarCena(); resultado();
          } else {
            pintarCena(); mensagem(m.dica, 'Outra ideia também vale!');
            Array.prototype.forEach.call(pecas.children, function (p) { p.classList.remove('experimentada'); });
            b.classList.add('experimentada');
          }
        }, 'feira-peca');
        b.dataset.escolha = op.id; pecas.appendChild(b);
      });
      foco(pecas.querySelector('button'), h);
    }
    var sala = salas.find(function (s) { return s.id === opcoes.sala; });
    var m = sala && sala.missoes.find(function (x) { return x.id === opcoes.missao; });
    if (m) missao(sala, m); else if (sala) tema(sala); else menu();
    return pn;
  };
})();
