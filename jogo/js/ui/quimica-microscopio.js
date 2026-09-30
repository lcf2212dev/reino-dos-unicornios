/* Laboratório de Química: a tela do microscópio (Reino.UI.telaQuimicaMicroscopio; docs/contratos/quimica.md §2).
   A ocular é um canvas TAM×TAM ampliado por inteiro (2 ou 4 px CSS por pixel): o campo redondo, o escuro em volta
   e o anel de metal; o desenho das lâminas vem de ui/quimica-laminas.js (Reino.QuimicaLaminas). Painel DOM com as
   lâminas, o aumento (10×, 40×, 100×) e o foco ◀ ▶. Fora de foco = mosaico (bloco maior quanto mais longe do
   ponto); nítida pela 1ª vez = Reino.Quimica.descobrir('laminas', id) e a Doutora Proveta explica. Frases:
   conteudo/quimica/frases-microscopio.js. Partículas boiando só com Reino.util.animar(); sem ela, quadro parado. */
(function () {
  var R = window.Reino, U = R.util;
  var AUMENTOS = [10, 40, 100], FOCO_MAX = 8;
  var BLOCOS = [1, 4, 5, 8, 8, 10, 10, 10, 10];   // tamanho do bloco do mosaico pela distância até o ponto de foco
  var CAMPO = 72;                                  // raio do campo redondo, em pixels de arte
  var NOITE = '#24162e', METAL = '#8a94aa', METAL2 = '#b9c4d6', K = '#3a2446';

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
  // ponto de foco de cada lâmina (3 a 6 cliques do começo): fixo pelo id, nunca Math.random
  function alvoDe(id) { var h = 0; for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0; return 3 + (h % 4); }
  // escala par: 4 (640 px) só onde cabe inteiro com os controles sem rolar; senão 2 (320 px)
  function escala() {
    var largo = window.innerWidth >= 900;
    var livreL = largo ? window.innerWidth - 560 : Math.min(window.innerWidth - 56, 680);
    var livreA = largo ? window.innerHeight - 180 : window.innerHeight - 640;
    return livreL >= 640 && livreA >= 640 ? 4 : 2;
  }

  /* ---------- a ocular ---------- */
  // faixas de uma coroa (r0 < raio ≤ r1), linha a linha; |j| = r fica de fora (senão sobra 1 px no alto e no pé)
  function meia(r, j) { return Math.abs(j) >= r ? -1 : Math.floor(Math.sqrt(r * r - j * j) + 0.35); }
  function coroa(x, c, r0, r1, cor) {
    x.fillStyle = cor;
    for (var j = -r1; j <= r1; j++) {
      var m1 = meia(r1, j), m0 = meia(r0, j);
      if (m1 < 0) continue;
      if (m0 < 0) { x.fillRect(c - m1, c + j, 2 * m1 + 1, 1); continue; }
      x.fillRect(c - m1, c + j, m1 - m0, 1); x.fillRect(c + m0 + 1, c + j, m1 - m0, 1);
    }
  }
  function desenharOcular(tela, img, t) {
    var x = tela.getContext('2d'), T = tela.width, c = T / 2;
    x.imageSmoothingEnabled = false;
    x.fillStyle = NOITE; x.fillRect(0, 0, T, T);
    for (var j = 1 - CAMPO; j < CAMPO; j++) { var m = meia(CAMPO, j); x.drawImage(img, c - m, c + j, 2 * m + 1, 1, c - m, c + j, 2 * m + 1, 1); }
    coroa(x, c, CAMPO - 5, CAMPO - 3, 'rgba(36, 22, 46, 0.12)');   // a luz apaga nas beiradas, em faixas
    coroa(x, c, CAMPO - 3, CAMPO, 'rgba(36, 22, 46, 0.24)');
    coroa(x, c, CAMPO, CAMPO + 1, K);
    coroa(x, c, CAMPO + 1, CAMPO + 4, METAL);
    coroa(x, c, CAMPO + 1, CAMPO + 2, METAL2);
    coroa(x, c, CAMPO + 4, CAMPO + 5, K);
    if (t === null) return;
    // partículas boiando na luz (só com animação): sobem devagar, em pixels inteiros
    for (var i = 0; i < 7; i++) {
      var px = c - 50 + ((i * 37) % 100) + Math.round(2 * Math.sin(t / 900 + i)), py = c + 60 - Math.floor(t / 260 + i * 17) % 120;
      var dx = px - c, dy = py - c;
      if (dx * dx + dy * dy < (CAMPO - 4) * (CAMPO - 4)) { x.fillStyle = i % 3 ? 'rgba(255, 255, 240, 0.7)' : '#ffffff'; x.fillRect(px, py, i % 3 ? 1 : 2, i % 3 ? 1 : 2); }
    }
  }

  /**
   * A tela do microscópio.
   * @param {{ lamina?: string, aumento?: 10|40|100 }} [op]
   */
  function telaQuimicaMicroscopio(op) {
    op = op || {};
    var UI = R.UI, L = R.QuimicaLaminas, laminas = Q().laminas();
    var timer = null;
    function parar() { if (timer) { clearInterval(timer); timer = null; } }
    var p = UI.painel('quimica-microscopio', '🔬 Microscópio', { aoFechar: parar });
    var st = {
      lamina: (Q().lamina(op.lamina) || laminas[0] || {}).id,
      aumento: AUMENTOS.indexOf(op.aumento) >= 0 ? op.aumento : 10,
      foco: 0, nitida: false, falando: [],
    };

    // a ocular
    var k = escala(), T = L.TAM;
    var tela = el('canvas', 'micro-ocular');
    tela.width = T; tela.height = T;
    tela.style.width = (T * k) + 'px'; tela.style.height = (T * k) + 'px';
    tela.setAttribute('aria-hidden', 'true');
    var moldura = el('div', 'micro-moldura'); moldura.appendChild(tela);

    // o que ela está vendo e ouvindo
    var nome = el('h3', 'micro-nome');
    var linhaEstado = el('div', 'micro-linha');
    var estado = el('span', 'micro-estado');
    var premio = el('span', 'micro-premio'); premio.hidden = true;
    var ouvir = botao('btn-pequeno micro-ouvir', '🔊', 'Ouvir de novo');
    linhaEstado.appendChild(estado); linhaEstado.appendChild(premio); linhaEstado.appendChild(ouvir);
    var texto = el('p', 'micro-texto');

    // lâminas
    var grupoL = el('div', 'micro-grupo');
    grupoL.appendChild(el('p', 'micro-rotulo', 'Lâminas'));
    var gradeL = el('div', 'micro-laminas');
    var bLaminas = laminas.map(function (l) {
      var b = botao('micro-lamina', l.emoji + ' ' + l.nome);
      b.dataset.id = l.id;
      var visto = el('span', 'micro-visto', '✓'); visto.setAttribute('aria-hidden', 'true');
      b.appendChild(visto);
      b.addEventListener('click', function () { escolherLamina(l.id); });
      gradeL.appendChild(b);
      return b;
    });
    grupoL.appendChild(gradeL);

    // aumento
    var grupoA = el('div', 'micro-grupo');
    grupoA.appendChild(el('p', 'micro-rotulo', 'Aumento'));
    var linhaA = el('div', 'micro-aumentos');
    var bAumentos = AUMENTOS.map(function (a) {
      var b = botao('micro-aumento', a + '×', 'Aumento de ' + a + ' vezes');
      b.dataset.aumento = String(a);
      b.addEventListener('click', function () { escolherAumento(a); });
      linhaA.appendChild(b);
      return b;
    });
    grupoA.appendChild(linhaA);

    // foco
    var grupoF = el('div', 'micro-grupo');
    grupoF.appendChild(el('p', 'micro-rotulo', 'Foco'));
    var linhaF = el('div', 'micro-foco');
    var menos = botao('btn-icone micro-foco-menos', '◀', 'Girar o foco para trás');
    var mais = botao('btn-icone micro-foco-mais', '▶', 'Girar o foco para a frente');
    var trilho = el('div', 'micro-trilho'); trilho.setAttribute('aria-hidden', 'true');
    var marcas = [];
    for (var i = 0; i <= FOCO_MAX; i++) { var m = el('span', 'micro-marca'); trilho.appendChild(m); marcas.push(m); }
    menos.addEventListener('click', function () { girar(-1); });
    mais.addEventListener('click', function () { girar(1); });
    linhaF.appendChild(menos); linhaF.appendChild(trilho); linhaF.appendChild(mais);
    grupoF.appendChild(linhaF);

    var contagem = el('p', 'micro-contagem');

    var lado = el('div', 'micro-lado');
    [nome, linhaEstado, texto, grupoF, grupoA, grupoL, contagem].forEach(function (e) { lado.appendChild(e); });
    var corpo = el('div', 'micro-corpo');
    corpo.appendChild(moldura); corpo.appendChild(lado);
    p.conteudo.appendChild(corpo);

    /* ---------- estado → tela ---------- */
    function lamina() { return Q().lamina(st.lamina); }
    function distancia() { return Math.abs(st.foco - alvoDe(st.lamina || '')); }
    function desenhar(t) {
      if (!st.lamina) return;
      desenharOcular(tela, L.imagem(st.lamina, st.aumento, BLOCOS[Math.min(distancia(), BLOCOS.length - 1)]), t === undefined ? null : t);
    }
    function atualizar() {
      var l = lamina();
      U.preencher(nome, l ? l.emoji + ' ' + l.nome + ' · ' + st.aumento + '×' : '');
      U.preencher(estado, st.nitida ? '✨ Nítida!' : 'Fora de foco');
      estado.classList.toggle('nitida', st.nitida);
      bLaminas.forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.dataset.id === st.lamina));
        b.classList.toggle('vista', Q().descoberto('laminas', b.dataset.id));
      });
      bAumentos.forEach(function (b) { b.setAttribute('aria-pressed', String(Number(b.dataset.aumento) === st.aumento)); });
      marcas.forEach(function (m, i) { m.classList.toggle('atual', i === st.foco); });
      tela.dataset.lamina = st.lamina || ''; tela.dataset.aumento = String(st.aumento);
      tela.dataset.foco = String(st.foco); tela.dataset.nitida = String(st.nitida);
      var c = Q().contagem().laminas;
      U.preencher(contagem, 'Lâminas vistas: ' + c.feitas + ' de ' + c.total);
      desenhar();
    }
    function falar(paginas) {
      paginas = (paginas || []).filter(Boolean);
      if (!paginas.length) return;
      st.falando = paginas.slice();
      U.preencherColado(texto, paginas.join(' '));
      if (!R.Som || !R.Som.falar) return;
      try { if (R.Som.calar) R.Som.calar(); R.Som.falar(paginas.slice(), { voz: Q().VOZ }); } catch (e) { if (window.console) console.error(e); }
    }
    function som(n) { if (R.Som && R.Som.tocar) { try { R.Som.tocar(n); } catch (e) {} } }
    function textoDoAumento() { var l = lamina(); return l && l.aumentos ? l.aumentos[st.aumento] : null; }

    /* ---------- o que ela faz ---------- */
    function escolherLamina(id) {
      if (id === st.lamina) { falar(st.falando); return; }   // tocar de novo só repete a fala
      st.lamina = id; st.foco = 0; st.nitida = false; premio.hidden = true;
      som('selecionar');
      atualizar();
      falar(Q().frase('microscopio.foco'));
    }
    function escolherAumento(a) {
      if (a === st.aumento) { falar([textoDoAumento()]); return; }
      st.aumento = a;
      som('selecionar');
      atualizar();
      falar([textoDoAumento()]);
    }
    function girar(d) {
      var novo = Math.max(0, Math.min(FOCO_MAX, st.foco + d));
      if (novo === st.foco) { som('toque'); return; }
      st.foco = novo;
      var antes = st.nitida;
      st.nitida = distancia() === 0;
      som('clique');
      atualizar();
      if (st.nitida && !antes) ficouNitida();
    }
    function ficouNitida() {
      var l = lamina();
      if (!l) return;
      var r = Q().descobrir('laminas', l.id);
      if (r.nova) {
        var pags = [].concat(l.explica || [], textoDoAumento() || [], Q().frase('microscopio.laminaNova'));
        if (Q().descobertas('laminas').length === Q().laminas().length) pags = pags.concat(Q().frase('microscopio.todas'));
        U.preencher(premio, '+' + r.estrelas + ' ⭐'); premio.hidden = false;
        som('estrela');
        atualizar();
        falar(pags);
      } else {
        som('acerto');
        falar(Q().frase('microscopio.nitida').concat(textoDoAumento() || []));
      }
    }
    ouvir.addEventListener('click', function () { falar(st.falando); });

    atualizar();
    falar(Q().frase('microscopio.oi'));

    // partículas boiando (5 quadros por segundo), só com as animações ligadas e o painel aberto
    if (U.animar()) {
      var t0 = performance.now();
      timer = setInterval(function () {
        if (!p.tela.parentNode) { parar(); return; }
        if (U.animar()) desenhar(performance.now() - t0); else { parar(); desenhar(); }   // desligou: quadro parado
      }, 200);
    }
    // pelo teclado, o foco começa na lâmina escolhida
    if (UI.porTeclado && UI.porTeclado()) {
      var atual = bLaminas.filter(function (b) { return b.dataset.id === st.lamina; })[0];
      if (atual) UI.focarTeclado(atual);
    }
    return p;
  }

  R.UI.telaQuimicaMicroscopio = telaQuimicaMicroscopio;
})();
