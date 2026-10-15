/* Telas das matérias: a sala de cada matéria (lista de salas; com os livros da escola, em grupos por capítulo e
   livro), o nome do livro, o Plano da Prova e o Castelo da Medalha (treino). O livro em si: materia-livro.js, que
   usa daqui o R.livroEscolar (Reino._ui). */
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

  // "Capítulo 10 • 📗 Aprendizagem" (sem capítulo, só o livro); no celular o livro desce para a 2ª linha, sem o "•"
  function tituloGrupo(s, L) {
    var partes = [s.capitulo ? 'Capítulo ' + s.capitulo : '', L ? L.emoji + ' ' + L.curto : ''].filter(Boolean);
    return partes.length ? el('h3.materia-grupo', partes.map(function (t, k) { return [k ? el('span.grupo-sep', ' • ') : null, el('span', t)]; })) : null;
  }

  // texto-guia do Claude (não é dito ao abrir): no notebook baixo fica numa linha com reticências; o inteiro no title
  function guia(texto) { return el('p', { title: texto }, texto); }

  UI.telaMateria = function (materia) {
    if (Reino.Bimestres.emEspera(materia)) return Reino.Bimestres.painel(materia.lugar.nome, { materia: materia });
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
    var proxima = null, grupo = null;
    materia.salas.forEach(function (s, i) {
      var reg = est().salas[s.id] || {};
      // livros da escola (4º bimestre): um título a cada capítulo e livro, na ordem do manifesto
      var L = livroEscolar(materia, s.livroOrigem), g = materia.livros ? tituloGrupo(s, L) : null;
      if (g && g.textContent !== grupo) lista.appendChild(g);
      grupo = g && g.textContent;
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
          (temRaro ? ', raro' : '') + (reg.calma ? ', calma' : '') + ', ' + (L ? L.nome : 'apostila') + ' ' + s.paginas + ', ' + (reg.feita ? 'jogar de novo' : 'entrar') },
        el('span.sala-emoji', s.emoji),
        el('span.sala-info', el('b', hifenizar((i + 1) + '. ' + s.nome)), el('small', (L ? L.emoji : '📖') + ' ' + s.paginas), chips),
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

  /* ---------- livro de resumos (o livro em si: materia-livro.js) ---------- */
  // cada matéria pode dar nome ao seu livro (nomeLivro); o padrão é o da História (com os livros da escola, "Meus Livros")
  function nomeLivro(materia) { return materia.nomeLivro || (materia.livros ? 'Meus Livros' : 'Livro das Memórias'); }
  UI.nomeLivro = nomeLivro;
  // o livro da escola de uma sala ou carta (matéria com `livros`, quarto-bimestre.md §2): { chave, nome, emoji, curto }
  // curto: o do livro ou o nome sem o "Livro de" ("Aprendizagem"), nas abas e nos grupos
  function livroEscolar(materia, chave) {
    var L = materia && materia.livros && chave && materia.livros[chave];
    return L ? { chave: chave, nome: L.nome, emoji: L.emoji, curto: L.curto || L.nome.replace(/^Livro d[aeo]s? /, '') } : null;
  }

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
    if (Reino.materias.every(Reino.Bimestres.emEspera)) return Reino.Bimestres.painel('Castelo da Medalha', { icone: '🏰' });
    var pn = painel('lugar', 'Castelo da Medalha', { icone: '🏰' });
    var c = pn.conteudo;
    c.appendChild(el('div.lugar-guia', PA.paraDOM(PA.claude(0), 4, 'claude-intro'),
      guia('Aqui é o treino para a prova de verdade: sem relógio, com revisão antes de entregar. Na escola, a medalha de ouro vale ' + U.reais(Reino.config.medalhaEscolaValor) + '! 🥇')));
    var lista = el('div.lista-salas');
    Reino.materias.filter(function (m) { return !Reino.Bimestres.emEspera(m); }).forEach(function (m) {
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
  R.livroEscolar = livroEscolar;
})();
