/* Laboratório de Química: o caderno de receitas (Reino.UI.telaQuimicaCaderno), um caderno de cientista com espiral e
   papel quadriculado. Índice: as receitas por ordem (Reino.Quimica.receitas()) com o contador; a do caderno
   (noCaderno: descoberta ou a 'pof', inicial) com emoji e nome; o segredo, silhueta com "?" e a dica. Página: emoji
   grande, nome, os ingredientes em tubinhos da cor de cada um, o que acontece, a explicação e o aviso de segurança;
   "Ouvir" na voz da Doutora Proveta. op.receita abre direto na página dela. Contrato: docs/contratos/quimica.md §2.
   Estilos: css/ui-quimica-caderno.css. Sem animação: nada aqui se mexe. */
(function () {
  var U = Reino.util, el = U.el;
  var UI = Reino.UI;
  var K = '#3a2446';   // contorno (arte.md §14)

  function hif(s) { var h = Reino._ui && Reino._ui.hifenizar; return h ? h(s) : s; }
  function falar(paginas) { if (paginas.length) Reino.Som.falar(paginas, { voz: Reino.Quimica.VOZ }); }

  /* ---------- desenhos (pixel art em código; paleta literal só aqui) ---------- */
  function pintar(grade, cores) {
    var c = document.createElement('canvas'), ctx;
    c.width = grade[0].length; c.height = grade.length; ctx = c.getContext('2d');
    grade.forEach(function (linha, y) {
      for (var x = 0; x < linha.length; x++) {
        var cor = cores[linha[x]];
        if (cor) { ctx.fillStyle = cor; ctx.fillRect(x, y, 1, 1); }
      }
    });
    return c;
  }
  // mistura duas cores #rrggbb (t = 0: a, 1: b), para o claro e o escuro do líquido
  function misturar(a, b, t) {
    function p(h, i) { return parseInt(h.slice(1 + i * 2, 3 + i * 2), 16); }
    var r = '#';
    for (var i = 0; i < 3; i++) r += ('0' + Math.round(p(a, i) + (p(b, i) - p(a, i)) * t).toString(16)).slice(-2);
    return r;
  }
  // tubo de ensaio 10×24: boca, vidro (g), brilho (v), líquido (L, com a superfície l e o fundo d) ou pó (P e grãos p)
  var TUBO = [
    'kkkkkkkkkk', 'kwwwwwwwwk', 'kkkkkkkkkk',
    '.kvgggggk.', '.kvgggggk.', '.kvgggggk.', '.kvgggggk.', '.kvgggggk.', '.kvgggggk.',
    '.kvlllllk.', '.kvLLLLLk.', '.kvLLLLLk.', '.kvLLLLLk.', '.kvLLLLLk.', '.kvLLLLLk.', '.kvLLLLLk.',
    '.kvLLLLLk.', '.kvLLLLLk.', '.kvLLLLdk.', '.kvLLLLdk.', '.kLLLLddk.', '..kLLddk..', '...kkkk...',
    '..........',
  ];
  var TUBO_PO = [
    'kkkkkkkkkk', 'kwwwwwwwwk', 'kkkkkkkkkk',
    '.kvgggggk.', '.kvgggggk.', '.kvgggggk.', '.kvgggggk.', '.kvgggggk.', '.kvgggggk.',
    '.kvgggggk.', '.kvgggggk.', '.kvgggggk.', '.kvgPgggk.', '.kvPPPgPk.', '.kvPpPPPk.', '.kPPPPpPk.',
    '.kPpPPPPk.', '.kPPPPpPk.', '.kPPpPPdk.', '.kPPPPPdk.', '.kPpPPddk.', '..kPPddk..', '...kkkk...',
    '..........',
  ];
  function tubo(ing) {
    var cor = /^#[0-9a-f]{6}$/i.test(ing.cor || '') ? ing.cor : '#9fd8ff';
    if (ing.tipo === 'gas') {
      var grade = TUBO.map(function (linha, y) {
        return linha.replace(/[Lld]/g, function (_, x) { return (x + y * 3) % 7 === 0 ? 'P' : 'g'; });
      });
      return pintar(grade, { k: K, w: '#ffffff', g: '#e6f4ff', v: '#ffffff', P: cor });
    }
    var po = ing.tipo === 'po';
    return pintar(po ? TUBO_PO : TUBO, {
      k: K, w: '#ffffff', g: '#e6f4ff', v: '#ffffff',
      L: cor, l: misturar(cor, '#ffffff', 0.45), d: misturar(cor, K, 0.3),
      P: cor, p: misturar(cor, K, 0.35),
    });
  }
  // o frasco do segredo (arte.md §14.3): silhueta em --tinta-suave com contorno --tinta; o "?" vem do CSS
  var FRASCO = [
    '................', '.....xxxxxx.....', '.....xxxxxx.....', '......xxxx......', '......xxxx......',
    '......xxxx......', '.....xxxxxx.....', '....xxxxxxxx....', '...xxxxxxxxxx...', '..xxxxxxxxxxxx..',
    '..xxxxxxxxxxxx..', '.xxxxxxxxxxxxxx.', '.xxxxxxxxxxxxxx.', '.xxxxxxxxxxxxxx.', '..xxxxxxxxxxxx..',
    '................',
  ];
  function segredo(escala) {
    var c = PA.paraDOM(PA.silhueta(pintar(FRASCO, { x: K })), escala, 'qcad-frasco');
    c.setAttribute('aria-hidden', 'true');
    return el('span.qcad-silhueta', c, el('span.qcad-interroga', { 'aria-hidden': 'true' }, '?'));
  }
  // a argola da espiral (6×11): metal com brilho, entrando no furo do papel; repetida pelo CSS
  var ARGOLA = [
    '.kkkk.......', 'kwssk.......', 'ks..dk......', 'ks..dk......', 'ks..dk......', 'ks..dk......',
    'kd..dk......', '.kddk.......', '.kHHk.......', '.kHHk.......', '..kk........',
  ];
  var urlArgola = null;
  function argola() {
    if (!urlArgola) {
      try { urlArgola = pintar(ARGOLA, { k: K, w: '#ffffff', s: '#c9c2d6', d: '#8a7fa0', H: '#24162e' }).toDataURL(); }
      catch (e) { urlArgola = ''; }
    }
    return urlArgola;
  }
  function icone(emoji, escala) {
    var c = PA.iconeEmoji(emoji, escala);
    c.setAttribute('aria-hidden', 'true');
    return c;
  }

  /* ---------- a tela ---------- */
  function telaQuimicaCaderno(op) {
    var Q = Reino.Quimica;
    if (!Q || UI.temTela()) return;
    op = op || {};
    var pn = UI.painel('quimica-caderno', '📒 Caderno de Receitas', { curto: '📒 Caderno' });
    pn.tela.setAttribute('aria-label', 'Caderno de receitas');
    pn.conteudo.classList.add('qcad-conteudo');
    var espiral = el('div.qcad-espiral', { 'aria-hidden': 'true' });
    var url = argola();
    if (url) espiral.style.backgroundImage = 'url(' + url + ')';
    var folha = el('div.qcad-folha');
    pn.conteudo.appendChild(el('div.qcad-caderno', espiral, folha));

    // rodapé de ação (arte.md §20): 📒 Receitas (só na página), 🔊 Ouvir e "Ir para a bancada"
    var voltar = el('button.btn-grande.btn-secundario.so-seta.qcad-voltar', { type: 'button', 'aria-label': 'Voltar às receitas' },
      '📒', el('span.rotulo-longo', ' Receitas'));
    var ouvir = el('button.btn-grande.btn-secundario.so-seta.qcad-ouvir', { type: 'button', 'aria-label': 'Ouvir' },
      '🔊', el('span.rotulo-longo', ' Ouvir'));
    var bancada = el('button.btn-grande.btn-principal.qcad-bancada', { type: 'button', 'aria-label': 'Ir para a bancada' },
      el('span.qcad-longo', 'Ir para a bancada'), el('span.qcad-curto', 'Bancada'));
    pn.card.appendChild(el('footer.rodape-acao.qcad-rodape', voltar, ouvir, bancada));

    var atual = null;   // id da receita aberta; null = índice
    function lista() { return Q.receitas(); }
    function falaIndice() { return Q.frase(Q.cadernoCompleto() ? 'caderno.completo' : 'caderno.oi'); }
    function falaPagina(r) {
      if (!Q.noCaderno(r.id)) return [r.dica].concat(Q.frase('caderno.segredo')).filter(Boolean);
      return [r.acontece].concat(r.explica || [], Q.frase('comum.seguranca')).filter(Boolean);
    }
    // o selo da receita: "✔ Feita" (descoberta), "Experimente!" (a inicial ainda não feita) ou nada
    function selo(r) {
      if (Q.descoberto('receitas', r.id)) return el('span.qcad-selo.feita', '✔ Feita');
      if (Q.noCaderno(r.id)) return el('span.qcad-selo.experimente', 'Experimente!');
      return null;
    }

    function indice(foco) {
      atual = null;
      folha.textContent = '';
      folha.className = 'qcad-folha qcad-indice';
      var c = Q.contagem().receitas, rs = lista();
      var cab = el('div.qcad-cabeca-indice',
        el('h3.qcad-titulo', { tabindex: '-1' }, 'Minhas receitas'),
        el('p.qcad-contador', { 'aria-live': 'polite' }, U.colado(c.feitas + ' de ' + c.total + ' receitas feitas')));
      folha.appendChild(cab);
      if (Q.cadernoCompleto()) {
        folha.appendChild(el('p.qcad-completo', icone('🏆', 2), el('span', U.colado(Q.frase('caderno.completo')[0] || 'Caderno completo!'))));
      }
      var grade = el('ul.qcad-grade');
      rs.forEach(function (r, i) {
        var aberta = Q.noCaderno(r.id);
        var b = el('button.qcad-cartao' + (aberta ? '.aberta' : '.segredo') + (Q.descoberto('receitas', r.id) ? '.feita' : ''),
          { type: 'button', 'data-receita': r.id,
            'aria-label': 'Receita ' + (i + 1) + ': ' + (aberta ? r.nome : 'segredo. Dica: ' + r.dica) },
          el('span.qcad-num', { 'aria-hidden': 'true' }, 'Nº ' + (i + 1)),
          aberta ? el('span.qcad-figura', icone(r.emoji, 4)) : el('span.qcad-figura', segredo(4)),
          aberta ? el('b.qcad-nome', U.colado(hif(r.nome))) : el('b.qcad-nome', 'Segredo'),
          aberta ? null : el('small.qcad-dica', U.colado(hif(r.dica || ''))),
          selo(r));
        b.addEventListener('click', function () { Reino.Som.tocar('toque'); pagina(r.id, true); });
        grade.appendChild(el('li', b));
      });
      folha.appendChild(grade);
      voltar.hidden = true;
      pn.conteudo.scrollTop = 0;
      if (foco) {
        var bf = grade.querySelector('[data-receita="' + foco + '"]');
        if (bf) { UI.focarTroca(bf, cab.firstChild); try { bf.scrollIntoView({ block: 'nearest' }); } catch (e) { /* antigo */ } }
      }
    }

    function tubos(r) {
      var fila = el('div.qcad-tubos', { role: 'list', 'aria-label': 'Ingredientes' });
      (r.ingredientes || []).forEach(function (id, i) {
        var ing = Q.ingrediente(id) || { id: id, nome: id, cor: '#9fd8ff' };
        var cv = PA.paraDOM(tubo(ing), 4, 'qcad-tubo-img');
        cv.setAttribute('aria-hidden', 'true');
        var t = el('div.qcad-tubo', { role: 'listitem' }, cv, el('small', U.colado(ing.nome)));
        // o "+" anda junto com o tubo seguinte: se a fila quebra (celular), a linha de baixo começa com "+"
        fila.appendChild(i ? el('div.qcad-par', { role: 'presentation' }, el('span.qcad-mais', { 'aria-hidden': 'true' }, '+'), t) : t);
      });
      return fila;
    }

    // seta: 'ant' ou 'prox' quando veio da seta (pelo teclado o foco fica nela: Enter segue folheando)
    function pagina(id, trocou, seta) {
      var rs = lista(), i = rs.findIndex(function (x) { return x.id === id; });
      if (i < 0) return indice(null);
      var r = rs[i], aberta = Q.noCaderno(r.id);
      atual = r.id;
      folha.textContent = '';
      folha.className = 'qcad-folha qcad-pagina' + (aberta ? '' : ' qcad-pagina-segredo');
      Reino.Som.calar();
      // ← Nº n de N → (folhear sem voltar ao índice)
      var ant = el('button.btn-icone.qcad-seta', { type: 'button', 'aria-label': 'Receita anterior' }, '←');
      var prox = el('button.btn-icone.qcad-seta', { type: 'button', 'aria-label': 'Próxima receita' }, '→');
      ant.disabled = i === 0; prox.disabled = i === rs.length - 1;
      ant.addEventListener('click', function () { if (i > 0) { Reino.Som.tocar('toque'); pagina(rs[i - 1].id, true, 'ant'); } });
      prox.addEventListener('click', function () { if (i < rs.length - 1) { Reino.Som.tocar('toque'); pagina(rs[i + 1].id, true, 'prox'); } });
      folha.appendChild(el('nav.qcad-folhear', { 'aria-label': 'Folhear o caderno' }, ant,
        el('span.qcad-pag', U.colado('Receita ' + (i + 1) + ' de ' + rs.length)), prox));
      var titulo = el('h3.qcad-titulo', { tabindex: '-1' }, U.colado(aberta ? hif(r.nome) : 'Receita secreta'));
      folha.appendChild(el('div.qcad-cabeca', aberta ? el('span.qcad-figura.grande', icone(r.emoji, 4)) : el('span.qcad-figura.grande', segredo(4)),
        el('div.qcad-cabeca-texto', titulo, selo(r))));
      if (!aberta) {
        folha.appendChild(el('section.qcad-bloco.qcad-bloco-dica', el('h4', 'Dica'), el('p', U.colado(hif(r.dica || '')))));
        folha.appendChild(el('p.qcad-convite', U.colado(Q.frase('caderno.segredo')[0] || '')));
      } else {
        folha.appendChild(el('section.qcad-bloco.qcad-bloco-tubos', el('h4', 'Ingredientes'), tubos(r)));
        folha.appendChild(el('section.qcad-bloco', el('h4', 'O que acontece'), el('p', U.colado(hif(r.acontece || '')))));
        folha.appendChild(el('section.qcad-bloco', el('h4', 'Por quê?'), el('p', U.colado(hif((r.explica || []).join(' '))))));
        folha.appendChild(el('p.qcad-aviso', U.colado(Q.frase('comum.seguranca').join(' '))));
      }
      voltar.hidden = false;
      pn.conteudo.scrollTop = 0;
      // na ponta a seta usada apaga: o foco vai para a outra
      var naSeta = seta === 'ant' ? (ant.disabled ? prox : ant) : seta === 'prox' ? (prox.disabled ? ant : prox) : null;
      if (trocou) UI.focarTroca(naSeta || voltar, titulo);
    }

    voltar.addEventListener('click', function () { Reino.Som.tocar('toque'); Reino.Som.calar(); indice(atual); });
    ouvir.addEventListener('click', function () {
      var r = atual && Q.receita(atual);
      falar(r ? falaPagina(r) : falaIndice());
    });
    bancada.addEventListener('click', function () {
      Reino.Som.tocar('toque'); Reino.Som.calar();
      UI.fecharTela(pn.tela);
      if (typeof UI.telaQuimicaBancada === 'function') UI.telaQuimicaBancada();
    });

    if (op.receita && Q.receita(op.receita)) pagina(op.receita, false);
    else { indice(null); falar(falaIndice()); }
    Reino.Som.tocar('porta');
    return pn;
  }

  UI.telaQuimicaCaderno = telaQuimicaCaderno;
})();
