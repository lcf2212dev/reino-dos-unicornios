/* Portais de resposta no voo de foguete (2ª versão; contrato: docs/contratos/viagem.md §4). Estende Reino.Voo:
   - física pura (Node): cada pergunta vira um portal que cruza o foguete em (i+1)/(n+1) do voo; a posição sai do
     relógio (sem somar erro); a faixa (opção) em que o foguete está ao cruzar é a resposta. Nada de asteroide ou
     estrela perto do portal. Sem pressa: o voo dura o mesmo.
   - tela (V.portaisTela): a pergunta numa faixa acima do canvas (com 🔊, lida pela narradora com a voz gravada da
     sala) e os rótulos das opções em DOM sobre as faixas do canvas (legíveis no celular). Certo: "Isso!", brilho e
     Reino.Aura.contar([true]); errado: "Quase!" e a certa por 2 s, nada se tira.
   O desenho das faixas mora em voo-desenho.js. */
(function () {
  var R = window.Reino, V = R.Voo;
  V.PORTAL_A = 16;              // altura da faixa (px lógicos)
  V.PERGUNTA_ANTES_MS = 5500;   // a pergunta aparece (e é lida) este tanto antes de o portal cruzar o foguete
  V.RESPOSTA_MS = 2000;         // quanto o "Isso!"/"Quase!" (com a certa) fica na faixa
  var LIVRE_MS = 1800;          // nenhum objeto cruza o foguete tão perto de um portal
  V.CORES_PORTAL = ['#e0607a', '#4aa3df', '#5cbf6a'];

  V.FALA_CERTO = 'Isso! Você acertou!';
  V.FALA_ERRADO = 'Quase! Veja a certa ali.';

  V.novosPortais = function (perguntas, vooMs) {
    var ps = (perguntas || []).filter(function (p) { return p && p.opcoes && p.opcoes.length >= 2; });
    return ps.map(function (p, i) {
      return { n: i, p: p, quando: Math.round(vooMs * (i + 1) / (ps.length + 1)), y: -99, fase: 'espera', escolha: null };
    });
  };
  // a opção (faixa) na posição x do foguete
  V.faixa = function (x, n) { return Math.max(0, Math.min(n - 1, Math.floor(x / (V.L / n)))); };
  // um objeto sorteado agora cruzaria o foguete perto de um portal?
  V.pertoDePortal = function (s) {
    var cruza = s.t + (V.FOGUETE_Y + 10) / V.VEL_OBJ * 1000;
    return (s.portais || []).some(function (o) { return Math.abs(o.quando - cruza) < LIVRE_MS; });
  };
  // um passo dos portais (dentro de V.passo, na fase 'voo'): eventos 'pergunta' e 'portal'
  V.passoPortais = function (s, ev) {
    (s.portais || []).forEach(function (o) {
      o.y = V.FOGUETE_Y - (o.quando - s.t) * V.VEL_OBJ / 1000;
      if (o.fase === 'espera' && s.t >= o.quando - V.PERGUNTA_ANTES_MS) { o.fase = 'pergunta'; ev.push({ tipo: 'pergunta', portal: o }); }
      if (o.fase !== 'passou' && s.t >= o.quando) {
        o.fase = 'passou';
        o.escolha = V.faixa(s.x, o.p.opcoes.length);
        var certo = o.escolha === o.p.certa;
        if (certo) { s.portaisCertos++; s.brilhos.push({ x: s.x, y: V.FOGUETE_Y, vida: 400 }); } else s.portaisErros++;
        ev.push({ tipo: 'portal', certo: certo, portal: o });
      }
    });
  };

  /* ---------- a tela (só no navegador) ---------- */
  function el(tag, classe, texto) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto !== undefined) e.textContent = texto;
    return e;
  }
  function genero(t) { return R.Genero && R.Genero.texto ? R.Genero.texto(t) : t; }
  function falar(t, voz) {
    try { if (R.Som && R.Som.falar) R.Som.falar(t, { voz: voz || 'claude' }); } catch (e) { if (window.console) console.error(e); }
  }
  // a narradora lê a pergunta com a voz gravada da sala (como a pergunta surpresa)
  function ler(p) {
    try {
      // na ordem da tela (as opções da escolha vêm embaralhadas: p.ordem)
      var segs = R.Falas && R.Falas.segmentosDesafio ? R.Falas.segmentosDesafio(p.desafio, p.ordem) : [p.texto];
      if (R.UI && R.UI.ouvirDeNovo) R.UI.ouvirDeNovo(segs, { voz: 'narradora' }); else falar(segs, 'narradora');
    } catch (e) { if (window.console) console.error(e); }
  }

  // op: { faixa (elemento acima do canvas), palco, cv, s, animar }. Devolve { evento(e), quadro(), fim() }
  V.portaisTela = function (op) {
    var s = op.s, cv = op.cv;
    // pacotes de voz das salas (para ler as perguntas); sem esperar
    var salas = {};
    s.portais.forEach(function (o) { salas[o.p.materia + '-' + o.p.sala] = o.p; });
    Object.keys(salas).forEach(function (k) {
      try { if (R.Voz && R.Voz.carregarSala) R.Voz.carregarSala({ id: salas[k].materia }, { id: salas[k].sala }); } catch (e) {}
    });
    var texto = el('p', 'voo-pergunta-texto'), ouvir = el('button', 'btn-icone voo-ouvir livre-na-fala', '🔊');
    ouvir.type = 'button'; ouvir.setAttribute('aria-label', 'Ouvir a pergunta de novo');
    ouvir.hidden = true;
    op.faixa.appendChild(texto); op.faixa.appendChild(ouvir);
    op.faixa.setAttribute('aria-live', 'polite');
    var atual = null, respostaAte = 0, relogio = 0;
    ouvir.addEventListener('click', function (e) { e.stopPropagation(); if (atual) ler(atual.p); });
    ouvir.addEventListener('pointerdown', function (e) { e.stopPropagation(); });

    // os rótulos das opções (um grupo por portal, sobre as faixas do canvas)
    var grupos = s.portais.map(function (o) {
      var g = el('div', 'voo-portal');
      g.hidden = true;
      o.p.opcoes.forEach(function (t, i) {
        var r = R.util.preencher(el('span', 'voo-opcao'), t);   // «inglês» vira <span class="en">
        r.style.width = (100 / o.p.opcoes.length) + '%';
        r.style.setProperty('--cor-portal', V.CORES_PORTAL[i % V.CORES_PORTAL.length]);
        g.appendChild(r);
      });
      op.palco.appendChild(g);
      return g;
    });
    function mostrar(t, classe) { R.util.preencher(texto, t); op.faixa.className = 'voo-pergunta' + (classe ? ' ' + classe : ''); }

    return {
      evento: function (e) {
        if (e.tipo === 'pergunta') {
          atual = e.portal; respostaAte = 0;
          mostrar('❓ ' + e.portal.p.texto, 'voo-pergunta-ligada');
          ouvir.hidden = false;
          ler(e.portal.p);
        } else if (e.tipo === 'portal') {
          var o = e.portal, g = grupos[o.n], certa = o.p.opcoes[o.p.certa];
          respostaAte = relogio + V.RESPOSTA_MS; ouvir.hidden = true; atual = null;
          if (g) {
            g.children[o.p.certa].classList.add('voo-opcao-certa');
            if (!e.certo && g.children[o.escolha]) g.children[o.escolha].classList.add('voo-opcao-errada');
          }
          if (e.certo) {
            mostrar(genero(V.FALA_CERTO) + ' ⭐', 'voo-pergunta-ligada voo-pergunta-certo' + (op.animar ? ' voo-brilho' : ''));
            falar(genero(V.FALA_CERTO));
            try { if (R.Aura && R.Aura.contar) R.Aura.contar([true]); } catch (x) { if (window.console) console.error(x); }
          } else {
            mostrar(V.FALA_ERRADO + ' ✓ ' + certa, 'voo-pergunta-ligada voo-pergunta-quase');
            falar(V.FALA_ERRADO);
          }
        }
      },
      // cada quadro: posição dos rótulos (na escala do canvas) e o fim do "Isso!"/"Quase!"
      quadro: function () {
        relogio = s.total;
        if (respostaAte && relogio >= respostaAte) { respostaAte = 0; if (!atual) { mostrar('', ''); } }
        var k = cv.clientWidth / V.L, x0 = cv.offsetLeft + cv.clientLeft, y0 = cv.offsetTop + cv.clientTop;
        s.portais.forEach(function (o, i) {
          var g = grupos[i], ve = s.fase === 'voo' && o.y > -V.PORTAL_A && o.y < V.A + V.PORTAL_A;
          // passou: some depois da resposta (a certa fica à vista enquanto o "Quase!" está na faixa)
          if (o.fase === 'passou' && !respostaAte) ve = false;
          g.hidden = !ve;
          if (!ve) return;
          g.style.left = x0 + 'px'; g.style.width = cv.clientWidth + 'px';
          g.style.top = (y0 + (o.y - V.PORTAL_A / 2) * k) + 'px'; g.style.height = (V.PORTAL_A * k) + 'px';
        });
      },
      fim: function () { grupos.forEach(function (g) { if (g.parentNode) g.parentNode.removeChild(g); }); },
    };
  };
})();
