/* Laboratório de Química, 2º andar: o Fogão dos Estados (Cozinha Química) (Reino.UI.telaQuimicaEstados), parte 1 de 2.
   Contrato: docs/contratos/quimica.md §2 e §9. Painel DOM (UI.painel), aberto na hora, com Esc/✕.
   Ela escolhe o que vai na panela e toca 🔥 Esquentar ou ❄ Esfriar (cada toque anda config.quimica.grausPorToque).
   Quando o estado muda e há mudança no contrato (Reino.Quimica.mudancaEntre), a descoberta é gravada NA HORA
   (Reino.Quimica.descobrir('estados', id)), antes da animação; endurecer de novo não é descoberta. O desenho é de
   ui/quimica-estados-2.js (Reino.QuimicaEstados); frases em conteudo/quimica/frases-estados.js, na voz da Dona Caramela.
   A mudança anda (derrete, as bolinhas se soltam) só com Reino.util.animar(); sem ela, o quadro final parado. */
(function () {
  var R = window.Reino, U = R.util;
  var MIN = -20, MAX = 120;                          // o termômetro do Fogão, em °C
  var DURA = 1200;                                   // ms da mudança de estado na animação
  var NOMES = { solido: 'Sólido', liquido: 'Líquido', gas: 'Gás' };

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
  function limitar(g) { return Math.max(MIN, Math.min(MAX, Math.round(g))); }
  // ampliação inteira: 4 onde cabe com folga, senão a maior que cabe na largura (no mínimo 2)
  function escala(L, A) {
    var largo = window.innerWidth >= 900;
    var livreL = largo ? window.innerWidth - 560 : window.innerWidth - 48;
    var livreA = largo ? window.innerHeight - 170 : window.innerHeight - 420;
    return Math.max(2, Math.min(4, Math.floor(livreL / L), Math.floor(livreA / A)));
  }
  // os passos entre dois estados (do sólido ao gás passa pelo líquido)
  var ORDEM = ['solido', 'liquido', 'gas'];
  function passos(de, para) {
    var a = ORDEM.indexOf(de), b = ORDEM.indexOf(para), l = [];
    if (a < 0 || b < 0) return l;
    for (var i = a; i !== b; i += (b > a ? 1 : -1)) l.push([ORDEM[i], ORDEM[i + (b > a ? 1 : -1)]]);
    return l;
  }

  /**
   * O Fogão dos Estados.
   * @param {{ material?: string, graus?: number }} [op]
   */
  function telaQuimicaEstados(op) {
    op = op || {};
    var UI = R.UI, E = R.QuimicaEstados, materiais = Q().materiais();
    var passo = (R.config.quimica && R.config.quimica.grausPorToque) || 10;
    var voz = Q().vozDe ? Q().vozDe('estados') : Q().VOZ_CARAMELA;
    var timer = null, t0 = 0, tMuda = 0;
    function parar() { if (timer) { clearInterval(timer); timer = null; } }
    var p = UI.painel('quimica-estados', '🔥 Fogão dos Estados', { aoFechar: parar });
    var st = { material: null, graus: 0, estado: 'solido', forma: 'pedaco', fogo: null, gotas: false, de: null, p: 1, falando: [] };

    // a cena
    var k = escala(E.L, E.A);
    var tela = el('canvas', 'estados-cena');
    tela.width = E.L; tela.height = E.A;
    tela.style.width = (E.L * k) + 'px'; tela.style.height = (E.A * k) + 'px';
    tela.setAttribute('aria-hidden', 'true');
    var moldura = el('div', 'estados-moldura'); moldura.appendChild(tela);
    var graus = el('span', 'estados-graus'); graus.setAttribute('aria-live', 'polite');
    moldura.appendChild(graus);

    // o que está acontecendo
    var nome = el('h3', 'estados-nome');
    var linhaEstado = el('div', 'estados-linha');
    var estado = el('span', 'estados-estado');
    var premio = el('span', 'estados-premio'); premio.hidden = true;
    var ouvir = botao('btn-pequeno estados-ouvir', '🔊', 'Ouvir de novo');
    linhaEstado.appendChild(estado); linhaEstado.appendChild(premio); linhaEstado.appendChild(ouvir);
    var texto = el('p', 'estados-texto');

    // esquentar e esfriar
    var linhaFogo = el('div', 'estados-fogo');
    var bQuente = botao('estados-toque estados-quente', '🔥 Esquentar');
    var bFrio = botao('estados-toque estados-frio', '❄ Esfriar');
    bQuente.addEventListener('click', function () { tocar(1); });
    bFrio.addEventListener('click', function () { tocar(-1); });
    linhaFogo.appendChild(bQuente); linhaFogo.appendChild(bFrio);

    // o que vai na panela
    var grupoM = el('div', 'estados-grupo');
    grupoM.appendChild(el('p', 'estados-rotulo', 'Na panela'));
    var gradeM = el('div', 'estados-materiais');
    var bMateriais = materiais.map(function (m) {
      var b = botao('estados-material', m.emoji + ' ' + m.nome);
      b.dataset.id = m.id;
      b.addEventListener('click', function () { escolher(m.id); });
      gradeM.appendChild(b);
      return b;
    });
    grupoM.appendChild(gradeM);
    var contagem = el('p', 'estados-contagem');

    var lado = el('div', 'estados-lado');
    [nome, linhaEstado, texto, linhaFogo, grupoM, contagem].forEach(function (e) { lado.appendChild(e); });
    var corpo = el('div', 'estados-corpo');
    corpo.appendChild(moldura); corpo.appendChild(lado);
    p.conteudo.appendChild(corpo);

    /* ---------- estado → tela ---------- */
    function material() { return Q().material(st.material); }
    function desenhar(t) {
      if (!st.material) return;
      E.desenhar(tela, { material: st.material, graus: st.graus, estado: st.estado, forma: st.forma, fogo: st.fogo,
        gotas: st.gotas, de: st.p < 1 ? st.de : null, p: st.p }, t === undefined ? null : t);
    }
    function atualizar() {
      var m = material();
      U.preencher(nome, m ? m.emoji + ' ' + m.nome : '');
      U.preencher(estado, NOMES[st.estado] || '');
      estado.dataset.estado = st.estado;
      U.preencher(graus, 'Termômetro: ' + st.graus + '°C');
      bMateriais.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.id === st.material)); });
      bQuente.setAttribute('aria-disabled', String(st.graus >= MAX));
      bFrio.setAttribute('aria-disabled', String(st.graus <= MIN));
      tela.dataset.material = st.material || ''; tela.dataset.graus = String(st.graus);
      tela.dataset.estado = st.estado; tela.dataset.gotas = String(st.gotas); tela.dataset.forma = st.forma;
      var c = Q().contagem().estados;
      U.preencher(contagem, 'Descobertas: ' + c.feitas + ' de ' + c.total);
      desenhar(timer ? performance.now() - t0 : undefined);
    }
    function falar(paginas) {
      paginas = (paginas || []).filter(Boolean);
      if (!paginas.length) return;
      st.falando = paginas.slice();
      U.preencherColado(texto, paginas.join(' '));
      if (!R.Som || !R.Som.falar) return;
      try { if (R.Som.calar) R.Som.calar(); R.Som.falar(paginas.slice(), { voz: voz }); } catch (e) { if (window.console) console.error(e); }
    }
    function som(n) { if (R.Som && R.Som.tocar) { try { R.Som.tocar(n); } catch (e) {} } }

    /* ---------- o que ela faz ---------- */
    function escolher(id, g) {
      var m = Q().material(id);
      if (!m) return;
      if (id === st.material && g === undefined) { falar(st.falando); return; }   // tocar de novo só repete a fala
      st.material = id; st.graus = limitar(g === undefined ? m.inicio : g);
      st.estado = Q().estadoEm(id, st.graus); st.forma = 'pedaco'; st.fogo = null; st.gotas = false; st.de = null; st.p = 1;
      premio.hidden = true;
      som('selecionar');
      atualizar();
      falar(m.fala);
    }
    function tocar(d) {
      if (!st.material) return;
      var novo = limitar(st.graus + d * passo);
      if (novo === st.graus) { som('toque'); falar(Q().frase(d > 0 ? 'estados.maxQuente' : 'estados.maxFrio')); return; }
      var antes = st.estado;
      st.graus = novo; st.fogo = d > 0 ? 'quente' : 'frio';
      st.estado = Q().estadoEm(st.material, novo);
      if (st.estado === antes) { som('clique'); atualizar(); return; }
      mudou(antes, st.estado);
    }
    // o termômetro passou do ponto: grava as descobertas na hora, depois anima e fala
    function mudou(de, para) {
      var fala = [], ganhou = 0, nova = false;
      passos(de, para).forEach(function (pp) {
        var m = Q().mudancaEntre(st.material, pp[0], pp[1]);
        if (pp[1] === 'solido') st.forma = 'placa';                  // o que endurece na panela vira placa lisa
        if (st.material === 'agua') st.gotas = pp[0] === 'gas' && pp[1] === 'liquido';
        if (!m) { fala = fala.concat(Q().frase('estados.endurece')); return; }
        var r = Q().descobrir('estados', m.id);
        fala = fala.concat(m.explica || []);
        if (r && r.nova) { nova = true; ganhou += r.estrelas || 0; fala = fala.concat(Q().frase('estados.' + pp[1])); }
      });
      if (nova) {
        fala = fala.concat(Q().frase('estados.novo'));
        var c = Q().contagem().estados;
        if (c.feitas >= c.total) fala = fala.concat(Q().frase('estados.todas'));
        U.preencher(premio, '+' + ganhou + ' ⭐'); premio.hidden = false;
      } else premio.hidden = true;
      st.de = de; st.p = timer ? 0 : 1; tMuda = performance.now();
      som(nova ? 'estrela' : 'acerto');
      atualizar();
      if (nova && UI.estrelaVoa) UI.estrelaVoa(premio);
      falar(fala);
    }
    ouvir.addEventListener('click', function () { falar(st.falando); });

    // a animação (6 quadros por segundo), só com as Animações ligadas e o painel aberto
    if (U.animar()) {
      t0 = performance.now();
      timer = setInterval(function () {
        if (!p.tela.parentNode) { parar(); return; }
        if (!U.animar()) { parar(); st.p = 1; desenhar(); return; }   // desligou: quadro final parado
        if (st.p < 1) st.p = Math.min(1, (performance.now() - tMuda) / DURA);
        desenhar(performance.now() - t0);
      }, 160);
    }

    escolher((Q().material(op.material) || materiais[0] || {}).id, typeof op.graus === 'number' ? op.graus : undefined);
    falar(Q().frase('estados.oi').concat(Q().frase('estados.escolha')));
    // pelo teclado, o foco começa no Esquentar
    if (UI.porTeclado && UI.porTeclado()) UI.focarTeclado(bQuente);
    return p;
  }

  R.UI.telaQuimicaEstados = telaQuimicaEstados;
})();
