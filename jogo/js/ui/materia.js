/* Telas das matérias: a sala de cada matéria (lista de salas), o livro de resumos, o Plano da
   Prova e o Castelo da Medalha (treino). */
(function () {
  var U = Reino.util, el = U.el, P = Reino.Progresso;
  var EV = Reino.EVENTOS;
  var UI = Reino.UI, R = Reino._ui;
  var est = R.est, painel = R.painel, hifenizar = R.hifenizar;

  function barraDinheiro(materia) {
    var ganho = P.dinheiroMateria(materia), total = Reino.config.valorPorMateria;
    return el('div.barra-dinheiro',
      el('div.barra-dinheiro-trilho', el('span', { style: { width: Math.round(ganho / total * 100) + '%' } })),
      el('span.barra-dinheiro-texto', U.colado(U.reais(ganho) + ' de ' + U.reais(total))));
  }

  // texto-guia do Claude (não é dito ao abrir): no notebook baixo fica numa linha com reticências; o inteiro no title
  function guia(texto) { return el('p', { title: texto }, texto); }

  UI.telaMateria = function (materia) {
    var pn = painel('lugar', materia.lugar.nome, { materia: materia });
    var c = pn.conteudo;
    var feitas = P.salasFeitas(materia);
    c.appendChild(el('div.lugar-guia', PA.paraDOM(PA.claude(0), 4, 'claude-intro'),
      guia(feitas === 0 ? materia.guia : (feitas === materia.salas.length ? 'Você completou todas as salas! Agora pode treinar no Castelo da Medalha ou jogar as salas de novo para ganhar os raros. 🌈' : 'Você já fez ' + feitas + ' de ' + materia.salas.length + ' salas. Vamos para a próxima?'))));
    // livro no alto, compacto, ao lado da barra de dinheiro (D7-15)
    // no notebook baixo só o ícone fica à vista (o nome no aria-label e no title)
    var livro = el('button.btn-livro-topo', { type: 'button', 'aria-label': nomeLivro(materia), title: nomeLivro(materia) }, '📖 ', el('span.livro-topo-nome', nomeLivro(materia)));
    livro.addEventListener('click', function () { UI.abrirLivro(materia); });
    var topo = el('div.materia-topo', barraDinheiro(materia), livro);
    c.appendChild(topo);
    // o cartão focado pelo teclado não some embaixo do topo grudado (acompanha as Letras grandes)
    var medirTopo = function () { c.style.scrollPaddingTop = topo.offsetHeight + 'px'; };
    if (window.ResizeObserver) new ResizeObserver(medirTopo).observe(topo); else setTimeout(medirTopo, 0);
    // a sobra da divisão em valores redondos vem como bônus ao completar (progresso-regras.js)
    if (P.bonusMateria(materia) > 0 && !P.materiaCompleta(materia)) c.appendChild(el('p.bau-nota', '🎁 Completando todas as salas: + ' + U.reais(P.bonusMateria(materia)).replace(' ', '\u00a0') + ' de bônus!'));
    var lista = el('div.lista-salas.lista-materia');
    // a 1ª sala não feita ganha o "✨ Próxima!" e a lista rola até ela (D7-14)
    var iProx = feitas === 0 ? -1 : materia.salas.findIndex(function (s) { return !(est().salas[s.id] || {}).feita; });
    var proxima = null;
    materia.salas.forEach(function (s, i) {
      var reg = est().salas[s.id] || {};
      var raro = (materia.unicornios || []).find(function (u) { return u.raridade === 'raro' && u.sala === s.id; });
      var temRaro = raro && P.temUni(raro.id);
      var chips = el('span.sala-chips',
        // no celular Feita, Raro e Calma ficam só no desenho (o rótulo some): os chips cabem numa linha (D7-09)
        reg.feita ? el('span.chip-mini.ok', { 'aria-label': 'Feita' }, '✓', el('span.rotulo-chip', ' Feita'))
          // "Próxima!" com mais chips: no celular só o ✨ (a borda grossa já marca), para não quebrar a linha
          : i === iProx && (temRaro || reg.calma) ? el('span.chip-mini.nova', { 'aria-label': 'Próxima' }, '✨', el('span.rotulo-chip', ' Próxima!'))
          : el('span.chip-mini.nova', i === iProx ? '✨ Próxima!' : '✨ Nova!'),
        el('span.chip-mini', '💰 ' + U.reais(P.valorSala(materia))),
        temRaro ? el('span.chip-mini.raro', { 'aria-label': 'Raro' }, '💙', el('span.rotulo-chip', ' Raro')) : null,
        reg.calma ? el('span.chip-mini.calma', { 'aria-label': 'Calma' }, '🌙', el('span.rotulo-chip', ' Calma')) : null);
      // .ir-embaixo: no celular o "Entrar →"/"Jogar de novo" desce para a linha de baixo (senão
      // espreme o nome da sala numa coluna de uma letra)
      var b = el('button.sala-card.ir-embaixo' + (reg.feita ? '.feita' : '') + (i === iProx ? '.proxima' : ''), { type: 'button',
        // nome acessível inteiro: no celular a ação e os rótulos ficam só no desenho
        'aria-label': (i + 1) + '. ' + s.nome + ', ' + (reg.feita ? 'feita' : i === iProx ? 'próxima' : 'nova') + ', ' + U.reais(P.valorSala(materia)) +
          (temRaro ? ', raro' : '') + (reg.calma ? ', calma' : '') + ', apostila ' + s.paginas + ', ' + (reg.feita ? 'jogar de novo' : 'entrar') },
        el('span.sala-emoji', s.emoji),
        el('span.sala-info', el('b', hifenizar((i + 1) + '. ' + s.nome)), el('small', '📖 ' + s.paginas), chips),
        // no celular só a seta, à direita do nome (D7-09)
        reg.feita ? el('span.sala-ir', el('span.rotulo-chip', 'Jogar de novo'), el('span.seta-celular', '→'))
          : el('span.sala-ir', el('span.rotulo-chip', 'Entrar '), '→'));
      b.addEventListener('click', function () {
        Reino.Som.tocar('porta');
        Reino.Missao.iniciar(materia, s, function (premios) {
          UI.fecharTela(pn.tela);
          UI.telaMateria(materia);
          if (premios) Reino.Claude.depoisDaMissao();
          U.emit(EV.MAPA_MUDOU);
        });
      });
      lista.appendChild(b);
      if (i === iProx) proxima = b;
    });
    c.appendChild(lista);
    // rola só o conteúdo do painel, sem animação, para a próxima sala ficar inteira à vista
    if (proxima) {
      var fim = proxima.offsetTop + proxima.offsetHeight - c.offsetTop - c.clientHeight + 18; // o topo fica grudado (sticky)
      if (fim > 0) c.scrollTop = fim;
    }
  };

  /* ---------- livro de resumos ---------- */
  // cada matéria pode dar nome ao seu livro (nomeLivro); o padrão é o da História
  function nomeLivro(materia) { return materia.nomeLivro || 'Livro das Memórias'; }
  UI.nomeLivro = nomeLivro;
  // desenho e fala de uma carta do livro (o livro pela estante e o resumo antes das questões da sala)
  // o texto vira blocos de até 3 frases (só na tela: a fala continua sendo c.texto inteiro)
  var FRASE = /[.!?…]["”»)]?\s+(?=["“«(]?[A-ZÁÉÍÓÚÂÊÔÃÕÀÇ0-9])/g;
  function blocosCarta(texto) {
    var frases = [], ini = 0, m, alvo = texto.replace(/«[^«»]*?([.!?…]?»)/g, function (m, fim) { return '«' + m.slice(1, -fim.length).replace(/./g, 'X') + fim; });
    FRASE.lastIndex = 0; // só corta fora do «inglês» (ou logo depois dele)
    while ((m = FRASE.exec(alvo))) { frases.push(texto.slice(ini, m.index + m[0].length).trim()); ini = m.index + m[0].length; }
    frases.push(texto.slice(ini));
    var n = Math.ceil(frases.length / 3), tam = Math.ceil(frases.length / n), out = [];
    for (var j = 0; j < frases.length; j += tam) out.push(frases.slice(j, j + tam).join(' '));
    return out;
  }
  // termo destacado: c.destaque ou a palavra mais longa do título que aparece no texto
  var PALAVRA = '[A-Za-zÀ-ÿ]';
  // trecho «inglês» vira '#' (mesmo tamanho): o destaque nunca corta o span.en
  function semIngles(t) { return t.replace(/«[^«»]*»/g, function (m) { return m.replace(/./g, '#'); }); }
  function termoCarta(c) {
    var cands = c.destaque ? [c.destaque] : c.titulo.split(/[^A-Za-zÀ-ÿ]+/)
      .filter(function (w) { return w.length >= 4; }).sort(function (a, b) { return b.length - a.length; });
    for (var k = 0; k < cands.length; k++) {
      var m = new RegExp('(^|[^A-Za-zÀ-ÿ])(' + cands[k] + PALAVRA + '{0,2})(?![A-Za-zÀ-ÿ])', 'i').exec(semIngles(c.texto));
      if (m) return m[2];
    }
    return null;
  }
  UI.blocosCarta = blocosCarta; UI.termoCarta = termoCarta;
  UI.desenharCarta = function (area, c) {
    area.innerHTML = '';
    area.appendChild(el('div.livro-emoji', c.e));
    area.appendChild(el('h3', c.titulo));
    // figuras: fileira de ícones das coisas que a carta lista (D7-16); só desenho, a fala não muda
    if (c.figuras && c.figuras.length) {
      area.appendChild(el.apply(null, ['div.livro-figuras'].concat(c.figuras.map(function (f) { return el('span.livro-figura', f); }))));
    }
    var termo = termoCarta(c);
    blocosCarta(c.texto).forEach(function (b) {
      var i = termo ? semIngles(b).indexOf(termo) : -1;
      if (i < 0) { area.appendChild(el('p', b)); return; }
      area.appendChild(el('p', b.slice(0, i), el('span.destaque', termo), b.slice(i + termo.length)));
      termo = null; // só a primeira vez
    });
  };
  UI.falaCarta = function (c) { return [c.titulo, c.texto]; };

  UI.abrirLivro = function (materia, cartaoId) {
    Reino.Voz.carregar(materia.id + '-livro');
    var pn = painel('livro', '📖 ' + nomeLivro(materia), { materia: materia });
    var cartas = materia.livro;
    var i = Math.max(0, cartas.findIndex(function (c) { return c.id === cartaoId; }));
    var area = el('div.livro-carta');
    var ant = el('button.btn-grande.btn-secundario', { type: 'button', 'aria-label': 'Carta anterior' }, '←');
    var prox = el('button.btn-grande.btn-secundario', { type: 'button', 'aria-label': 'Próxima carta' }, '→');
    var ouvir = el('button.btn-grande.btn-principal.so-seta', { type: 'button', 'aria-label': 'Ouvir' }, '🔊', el('span.rotulo-longo', ' Ouvir'));
    var pag = el('span.livro-pag');
    // índice (D7-12): uma fileira rolável com o ícone de cada carta; 1 toque leva a ela
    var marcas = cartas.map(function (c, k) {
      var m = el('button.livro-marca', { type: 'button', 'aria-label': 'Carta ' + (k + 1) + ': ' + c.titulo }, c.e);
      m.addEventListener('click', function () { if (k !== i) { i = k; Reino.Som.tocar('toque'); mostrar(); } });
      return m;
    });
    function mostrar() {
      var c = cartas[i];
      UI.desenharCarta(area, c);
      marcas.forEach(function (m, k) { m.classList.toggle('atual', k === i); if (k === i) m.setAttribute('aria-current', 'true'); else m.removeAttribute('aria-current'); });
      var mi = marcas[i], fila = mi.parentNode;   // a marca atual à vista na fileira, sem animação
      if (fila && (mi.offsetLeft < fila.scrollLeft || mi.offsetLeft + mi.offsetWidth > fila.scrollLeft + fila.clientWidth)) fila.scrollLeft = mi.offsetLeft - 8;
      pag.textContent = (i + 1) + ' de ' + cartas.length;
      ant.disabled = i === 0; prox.disabled = i === cartas.length - 1;
      pn.conteudo.scrollTop = 0; // carta nova abre do topo
      Reino.Som.calar();
    }
    ant.addEventListener('click', function () { if (i > 0) { i--; Reino.Som.tocar('toque'); mostrar(); } });
    prox.addEventListener('click', function () { if (i < cartas.length - 1) { i++; Reino.Som.tocar('toque'); mostrar(); } });
    ouvir.addEventListener('click', function () { Reino.Voz.carregar(materia.id + '-livro').then(function () { Reino.Som.falar(UI.falaCarta(cartas[i]), { voz: 'narradora' }); }); });
    pn.card.insertBefore(el.apply(null, ['nav.livro-indice', { 'aria-label': 'Cartas do livro' }].concat(marcas)), pn.conteudo);
    pn.conteudo.appendChild(area);
    // ← n de N → e o 🔊 Ouvir no rodapé de ação do painel, fora da carta que rola: sempre no mesmo lugar (ui.md §10.20)
    pn.card.appendChild(el('footer.rodape-acao.livro-rodape', el('div.livro-nav', ant, pag, prox),
      Reino.Som.temVoz() ? el('div.intro-botoes', ouvir) : null));
    mostrar();
  };

  /* ---------- castelo (treino da medalha) ---------- */
  UI.cartaoPlano = function () {
    return el('ol.plano-prova',
      el('li', el('span', '🌬️'), 'Respiro 3 vezes.'),
      el('li', el('span', '👀'), 'Leio cada pergunta 2 vezes.'),
      el('li', el('span', '✏️'), 'Respondo com calma.'),
      el('li', el('span', '🔁'), 'Reviso tudo, do começo ao fim.'),
      el('li', el('span', '📝'), 'Só entrego depois de revisar.'));
  };

  UI.telaPlano = function () {
    var pn = painel('plano', '🥇 Meu Plano da Prova', { estreito: true });
    pn.conteudo.appendChild(UI.cartaoPlano());
    pn.conteudo.appendChild(el('div.aviso-medalha',
      el('span.aviso-medalha-icone', '🥇'),
      el('p', 'A medalha de ouro da escola vale ', el('b', U.colado(U.reais(Reino.config.medalhaEscolaValor))), U.colado('! Ela vem das respostas certas, não de terminar primeiro.'))));
    pn.conteudo.appendChild(el('p.plano-frase', U.colado(Reino.Genero.genero('"Terminar por último é coisa de {campeã|campeão}!" 🏆'))));
    var ouvir = el('button.btn-grande.btn-principal', { type: 'button' }, '🔊 Ouvir o plano');
    ouvir.addEventListener('click', function () { Reino.Som.falar(Reino.Falas.fixas.plano, { voz: 'claude' }); });
    if (Reino.Som.temVoz()) pn.conteudo.appendChild(el('div.intro-botoes', ouvir));
  };

  UI.telaCastelo = function () {
    var pn = painel('lugar', 'Castelo da Medalha', { icone: '🏰' });
    var c = pn.conteudo;
    c.appendChild(el('div.lugar-guia', PA.paraDOM(PA.claude(0), 4, 'claude-intro'),
      guia('Aqui é o treino para a prova de verdade: sem relógio, com revisão antes de entregar. Na escola, a medalha de ouro vale ' + U.reais(Reino.config.medalhaEscolaValor) + '! 🥇')));
    var lista = el('div.lista-salas');
    Reino.materias.forEach(function (m) {
      var completa = P.materiaCompleta(m);
      var t = est().treinos[m.id] || {};
      var faltam = m.salas.length - P.salasFeitas(m);
      var medalha = { ouro: '🥇 Melhor: Ouro', prata: '🥈 Melhor: Prata', bronze: '🥉 Melhor: Bronze' }[t.melhor];
      // o mesmo cartão da Escola (D6-23): ícone pequeno ao lado do nome, "Treinar →" como selo-botão
      var b = el('button.sala-card.cartao-lista' + (completa ? '' : '.bloqueada'), { type: 'button' },
        el('span.sala-emoji', m.emoji),
        el('span.sala-info', el('b', 'Treino de ' + m.nome),
          el('small', completa ? '10 perguntas de todas as salas' : 'Abre quando você terminar as salas. Falta' + (faltam === 1 ? ' 1 sala' : 'm ' + faltam + ' salas') + '!'),
          el('span.sala-chips', medalha ? el('span.chip-mini.ok', medalha) : null, t.vezes ? el('span.chip-mini', t.vezes + (t.vezes === 1 ? ' treino' : ' treinos')) : null,
            completa ? el('span.sala-ir.selo-ir', 'Treinar →') : el('span.sala-ir', '🔒'))));   // o selo na linha dos chips
      b.addEventListener('click', function () {
        if (!completa) {
          Reino.Som.tocar('toque');
          Reino.Claude.falar(Reino.Falas.treinoBloqueado(m, faltam));
          return;
        }
        Reino.Som.tocar('porta');
        Reino.Prova.iniciar(m, function () { UI.fecharTela(pn.tela); UI.telaCastelo(); U.emit(EV.MAPA_MUDOU); });
      });
      lista.appendChild(b);
    });
    c.appendChild(lista);
    var plano = el('button.btn-grande.btn-secundario', { type: 'button' }, '📜 Ver o Plano da Prova');
    plano.addEventListener('click', UI.telaPlano);
    c.appendChild(el('div.intro-botoes', plano));
  };

  R.barraDinheiro = barraDinheiro;
})();
