/* Laboratório de Química, 2º andar: a Mesa de Separar Misturas (Cozinha Química) (Reino.UI.telaQuimicaSeparar), parte 1 de 2.
   Contrato: docs/contratos/quimica.md §2 e §9. Painel DOM (UI.painel), aberto na hora, com Esc/✕.
   Ela escolhe uma das 6 misturas e uma das 6 ferramentas. A certa grava a descoberta NA HORA do toque
   (Reino.Quimica.descobrir('separar', mistura); estrela só na 1ª vez) e o palco anima a separação; a que não serve só
   pede outra (sem erro, sem som de erro). Falas na voz da Dona Caramela (conteudo/quimica/frases-separar.js).
   Cria o interno Reino._quimicaSeparar, que guarda o desenho (W, H, desenhar, iconeFerramenta): parte 2.
   Sem animação (Reino.util.animar() falso, e2e congelado): nada de timer, o palco já mostra o quadro final. */
(function () {
  var R = window.Reino, U = R.util;
  var S = R._quimicaSeparar = {};
  var DURACAO = 2800, PASSO = 100;   // ms da separação animada e de cada quadro

  function Q() { return R.Quimica; }
  function el(tag, classe, texto) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto !== undefined) U.preencher(e, texto);   // emoji vira o ícone pixel
    return e;
  }
  function botao(classe, texto, rotulo) {
    var b = el('button', classe, texto);
    b.type = 'button';
    if (rotulo) b.setAttribute('aria-label', rotulo);
    return b;
  }
  // ampliação inteira do palco (2 a 4 px CSS por pixel de arte): a maior que cabe sem rolar
  function escala() {
    var largo = window.innerWidth >= 900;
    var livreL = largo ? window.innerWidth - 560 : Math.min(window.innerWidth - 48, 680);
    var livreA = largo ? window.innerHeight - 200 : Math.floor(window.innerHeight * 0.45);
    return Math.max(2, Math.min(4, Math.floor(livreL / S.W), Math.floor(livreA / S.H)));
  }
  function som(n) { if (R.Som && R.Som.tocar) { try { R.Som.tocar(n); } catch (e) { /* sem som */ } } }

  /**
   * A Mesa de Separar Misturas.
   * @param {{ mistura?: string, ferramenta?: string }} [op] já escolhidas (fotos e testes)
   */
  function telaQuimicaSeparar(op) {
    op = op || {};
    var UI = R.UI, timer = null;
    function parar() { if (timer) { clearInterval(timer); timer = null; } }
    var p = UI.painel('quimica-separar', '🥣 Mesa de Separar', { aoFechar: parar, curto: 'Separar' });
    var st = { mistura: null, feita: null, t: 1, falando: [] };

    // o palco
    var k = escala();
    var tela = el('canvas', 'sep-palco');
    tela.width = S.W; tela.height = S.H;
    tela.style.width = (S.W * k) + 'px'; tela.style.height = (S.H * k) + 'px';
    tela.setAttribute('aria-hidden', 'true');
    var moldura = el('div', 'sep-moldura'); moldura.appendChild(tela);

    // o que está na mesa e o que a Dona Caramela diz
    var nome = el('h3', 'sep-nome');
    var linha = el('div', 'sep-linha');
    var jeito = el('span', 'sep-jeito'); jeito.hidden = true;
    var premio = el('span', 'sep-premio'); premio.hidden = true;
    var ouvir = botao('btn-pequeno sep-ouvir', '🔊', 'Ouvir de novo');
    linha.appendChild(jeito); linha.appendChild(premio); linha.appendChild(ouvir);
    var texto = el('p', 'sep-texto');

    function grupo(titulo, classe, itens, ao) {
      var g = el('div', 'sep-grupo');
      g.appendChild(el('p', 'sep-rotulo', titulo));
      var grade = el('div', classe);
      var bs = itens.map(function (x) {
        var b = botao('sep-opcao', x.emoji ? x.emoji + ' ' + x.nome : undefined);
        if (!x.emoji) {   // coador e peneira: o desenho da parte 2 no lugar do emoji
          var ic = S.iconeFerramenta(x.id);
          if (ic && window.PA) b.appendChild(PA.paraDOM(ic, 2, 'sep-icone'));
          b.appendChild(document.createTextNode(x.nome));
        }
        b.dataset.id = x.id;
        var visto = el('span', 'sep-visto', '✓'); visto.setAttribute('aria-hidden', 'true');
        b.appendChild(visto);
        b.addEventListener('click', function () { ao(x.id); });
        grade.appendChild(b);
        return b;
      });
      g.appendChild(grade);
      return { el: g, botoes: bs };
    }
    var gM = grupo('Misturas', 'sep-misturas', Q().misturas(), escolherMistura);
    var gF = grupo('Ferramentas', 'sep-ferramentas', Q().ferramentas(), escolherFerramenta);
    var contagem = el('p', 'sep-contagem');

    var lado = el('div', 'sep-lado');
    [nome, linha, texto, gM.el, gF.el, contagem].forEach(function (e) { lado.appendChild(e); });
    var corpo = el('div', 'sep-corpo');
    corpo.appendChild(moldura); corpo.appendChild(lado);
    p.conteudo.appendChild(corpo);

    /* ---------- estado → tela ---------- */
    function desenhar() {
      S.desenhar(tela.getContext('2d'), st.mistura, st.feita, st.t);
      tela.dataset.mistura = st.mistura || '';
      tela.dataset.ferramenta = st.feita || '';
      tela.dataset.quadro = !st.mistura ? 'vazio' : !st.feita ? 'mistura' : st.t >= 1 ? 'final' : 'animando';
    }
    function atualizar() {
      var m = st.mistura && Q().mistura(st.mistura);
      U.preencher(nome, m ? m.emoji + ' ' + m.nome : 'Qual mistura vamos separar?');
      gM.botoes.forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.dataset.id === st.mistura));
        b.classList.toggle('vista', Q().descoberto('separar', b.dataset.id));
      });
      gF.botoes.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.id === st.feita)); });
      var c = Q().contagem().separar;
      U.preencher(contagem, 'Separadas: ' + c.feitas + ' de ' + c.total);
      desenhar();
    }
    function falar(paginas) {
      paginas = (paginas || []).filter(Boolean);
      if (!paginas.length) return;
      st.falando = paginas.slice();
      U.preencherColado(texto, paginas.join(' '));
      if (!R.Som || !R.Som.falar) return;
      try { if (R.Som.calar) R.Som.calar(); R.Som.falar(paginas.slice(), { voz: Q().vozDe('separar') }); } catch (e) { if (window.console) console.error(e); }
    }
    // a separação: com animação, quadro a quadro até o final; sem, o quadro final direto
    function animar() {
      parar();
      if (!U.animar()) { st.t = 1; desenhar(); return; }
      var t0 = performance.now();
      st.t = 0; desenhar();
      timer = setInterval(function () {
        if (!p.tela.parentNode) { parar(); return; }
        st.t = U.animar() ? Math.min(1, (performance.now() - t0) / DURACAO) : 1;
        desenhar();
        if (st.t >= 1) parar();
      }, PASSO);
    }

    // tela estreita: a ferramenta fica lá embaixo; rola as caixas do painel até o palco (nunca scrollIntoView, ui.md §4)
    function mostrarPalco() {
      for (var c = moldura.parentNode; c && c !== p.tela.parentNode; c = c.parentNode) {
        if (c.scrollHeight <= c.clientHeight + 2) continue;
        var r = moldura.getBoundingClientRect(), b = c.getBoundingClientRect();
        if (r.top < b.top + 8 || r.bottom > b.bottom) c.scrollTop -= b.top + 8 - r.top;
      }
    }

    /* ---------- o que ela faz ---------- */
    function escolherMistura(id) {
      var m = Q().mistura(id);
      if (!m) return;
      if (id === st.mistura && !st.feita) { falar(st.falando); return; }   // tocar de novo só repete a fala
      parar();
      st.mistura = id; st.feita = null; st.t = 1;
      jeito.hidden = true; premio.hidden = true;
      som('selecionar');
      atualizar();
      falar(m.fala);
    }
    function escolherFerramenta(id) {
      var f = Q().ferramenta(id), m = st.mistura && Q().mistura(st.mistura);
      if (!f) return;
      if (!m) { som('toque'); falar(Q().frase('separar.semMistura')); return; }
      if (!Q().separa(m.id, id)) {   // não serve: nada muda, nada se perde; ela tenta outra
        parar();
        st.feita = null; st.t = 1; jeito.hidden = true; premio.hidden = true;
        som('toque');
        atualizar();
        falar(Q().frase('separar.naoSepara'));
        return;
      }
      var r = Q().descobrir('separar', m.id);   // na hora do toque, antes da animação
      st.feita = id;
      U.preencher(jeito, f.jeito + '!'); jeito.hidden = false;
      premio.hidden = !r.nova;
      var fala = [].concat(f.fala || [], m.explica || []);
      atualizar();
      mostrarPalco();
      animar();
      if (r.nova) {
        U.preencher(premio, '+' + r.estrelas + ' ⭐');
        fala = fala.concat(Q().frase('separar.nova'));
        if (Q().descobertas('separar').length === Q().misturas().length) fala = fala.concat(Q().frase('separar.todas'));
        som('estrela');
        UI.festa(1, { item: premio, som: false });
        if (UI.estrelaVoa) UI.estrelaVoa(premio);
      } else {
        som('acerto');
        fala = fala.concat(Q().frase('separar.repetida'));
      }
      falar(fala);
    }
    ouvir.addEventListener('click', function () { falar(st.falando); });

    atualizar();
    falar(Q().frase('separar.oi'));
    if (op.mistura) escolherMistura(op.mistura);
    if (op.ferramenta) escolherFerramenta(op.ferramenta);
    // pelo teclado, o foco começa na 1ª mistura (ou na escolhida)
    if (UI.porTeclado && UI.porTeclado()) {
      var atual = gM.botoes.filter(function (b) { return b.dataset.id === st.mistura; })[0] || gM.botoes[0];
      if (atual) UI.focarTeclado(atual);
    }
    return p;
  }

  R.UI.telaQuimicaSeparar = telaQuimicaSeparar;
})();
