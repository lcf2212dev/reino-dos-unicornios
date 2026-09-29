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
      el('span.barra-dinheiro-texto', U.reais(ganho) + ' de ' + U.reais(total)));
  }

  UI.telaMateria = function (materia) {
    var pn = painel('lugar', materia.lugar.nome);
    var c = pn.conteudo;
    var feitas = P.salasFeitas(materia);
    c.appendChild(el('div.lugar-guia', PA.paraDOM(PA.claude(0), 3, 'claude-intro'),
      el('p', feitas === 0 ? materia.guia : (feitas === materia.salas.length ? 'Você completou todas as salas! Agora pode treinar no Castelo da Medalha ou jogar as salas de novo para ganhar os raros. 🌈' : 'Você já fez ' + feitas + ' de ' + materia.salas.length + ' salas. Vamos para a próxima?'))));
    c.appendChild(barraDinheiro(materia));
    // a sobra da divisão em valores redondos vem como bônus ao completar (progresso-regras.js)
    if (P.bonusMateria(materia) > 0 && !P.materiaCompleta(materia)) c.appendChild(el('p.bau-nota', '🎁 Completando todas as salas: + ' + U.reais(P.bonusMateria(materia)).replace(' ', '\u00a0') + ' de bônus!'));
    var lista = el('div.lista-salas');
    materia.salas.forEach(function (s, i) {
      var reg = est().salas[s.id] || {};
      var raro = (materia.unicornios || []).find(function (u) { return u.raridade === 'raro' && u.sala === s.id; });
      var temRaro = raro && P.temUni(raro.id);
      var chips = el('span.sala-chips',
        reg.feita ? el('span.chip-mini.ok', '✓ Feita') : el('span.chip-mini.nova', 'Nova!'),
        el('span.chip-mini', '💰 ' + U.reais(P.valorSala(materia))),
        temRaro ? el('span.chip-mini.raro', '💙 Raro') : null,
        reg.calma ? el('span.chip-mini.calma', '🌙 Calma') : null);
      // .ir-embaixo: no celular o "Entrar →"/"Jogar de novo" desce para a linha de baixo (senão
      // espreme o nome da sala numa coluna de uma letra)
      var b = el('button.sala-card.ir-embaixo' + (reg.feita ? '.feita' : ''), { type: 'button' },
        el('span.sala-emoji', s.emoji),
        el('span.sala-info', el('b', hifenizar((i + 1) + '. ' + s.nome)), el('small', 'Apostila: ' + s.paginas), chips),
        el('span.sala-ir', reg.feita ? 'Jogar de novo' : 'Entrar →'));
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
    });
    c.appendChild(lista);
    var livro = el('button.btn-grande.btn-secundario', { type: 'button' }, '📖 ' + nomeLivro(materia));
    livro.addEventListener('click', function () { UI.abrirLivro(materia); });
    c.appendChild(el('div.intro-botoes', livro));
  };

  /* ---------- livro de resumos ---------- */
  // cada matéria pode dar nome ao seu livro (nomeLivro); o padrão é o da História
  function nomeLivro(materia) { return materia.nomeLivro || 'Livro das Memórias'; }
  UI.nomeLivro = nomeLivro;
  // desenho e fala de uma carta do livro (o livro pela estante e o resumo antes das questões da sala)
  UI.desenharCarta = function (area, c) {
    area.innerHTML = '';
    area.appendChild(el('div.livro-emoji', c.e));
    area.appendChild(el('h3', c.titulo));
    area.appendChild(el('p', c.texto));
  };
  UI.falaCarta = function (c) { return [c.titulo, c.texto]; };

  UI.abrirLivro = function (materia, cartaoId) {
    Reino.Voz.carregar(materia.id + '-livro');
    var pn = painel('livro', '📖 ' + nomeLivro(materia));
    var cartas = materia.livro;
    var i = Math.max(0, cartas.findIndex(function (c) { return c.id === cartaoId; }));
    var area = el('div.livro-carta');
    var ant = el('button.btn-grande.btn-secundario', { type: 'button' }, '←');
    var prox = el('button.btn-grande.btn-secundario', { type: 'button' }, '→');
    var ouvir = el('button.btn-grande.btn-principal', { type: 'button' }, '🔊 Ouvir');
    var pag = el('span.livro-pag');
    function mostrar() {
      var c = cartas[i];
      UI.desenharCarta(area, c);
      pag.textContent = (i + 1) + ' de ' + cartas.length;
      ant.disabled = i === 0; prox.disabled = i === cartas.length - 1;
      pn.conteudo.scrollTop = 0; // carta nova abre do topo
      Reino.Som.calar();
    }
    ant.addEventListener('click', function () { if (i > 0) { i--; Reino.Som.tocar('toque'); mostrar(); } });
    prox.addEventListener('click', function () { if (i < cartas.length - 1) { i++; Reino.Som.tocar('toque'); mostrar(); } });
    ouvir.addEventListener('click', function () { Reino.Voz.carregar(materia.id + '-livro').then(function () { Reino.Som.falar(UI.falaCarta(cartas[i]), { voz: 'narradora' }); }); });
    pn.conteudo.appendChild(area);
    pn.conteudo.appendChild(el('div.livro-nav', ant, pag, prox));
    if (Reino.Som.temVoz()) pn.conteudo.appendChild(el('div.intro-botoes', ouvir));
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
    var pn = painel('plano', '🥇 Meu Plano da Prova');
    pn.conteudo.appendChild(UI.cartaoPlano());
    pn.conteudo.appendChild(el('div.aviso-medalha',
      el('span.aviso-medalha-icone', '🥇'),
      el('p', 'A medalha de ouro da escola vale ', el('b', U.reais(Reino.config.medalhaEscolaValor)), '! Ela vem das respostas certas, não de terminar primeiro.')));
    pn.conteudo.appendChild(el('p.plano-frase', Reino.Genero.genero('"Terminar por último é coisa de {campeã|campeão}!" 🏆')));
    var ouvir = el('button.btn-grande.btn-principal', { type: 'button' }, '🔊 Ouvir o plano');
    ouvir.addEventListener('click', function () { Reino.Som.falar(Reino.Falas.fixas.plano, { voz: 'claude' }); });
    if (Reino.Som.temVoz()) pn.conteudo.appendChild(el('div.intro-botoes', ouvir));
  };

  UI.telaCastelo = function () {
    var pn = painel('lugar', 'Castelo da Medalha');
    var c = pn.conteudo;
    c.appendChild(el('div.lugar-guia', PA.paraDOM(PA.claude(0), 3, 'claude-intro'),
      el('p', 'Aqui é o treino para a prova de verdade: sem relógio, com revisão antes de entregar. Na escola, a medalha de ouro vale ' + U.reais(Reino.config.medalhaEscolaValor) + '! 🥇')));
    var lista = el('div.lista-salas');
    Reino.materias.forEach(function (m) {
      var completa = P.materiaCompleta(m);
      var t = est().treinos[m.id] || {};
      var faltam = m.salas.length - P.salasFeitas(m);
      var medalha = { ouro: '🥇', prata: '🥈', bronze: '🥉' }[t.melhor];
      var b = el('button.sala-card' + (completa ? '' : '.bloqueada'), { type: 'button' },
        el('span.sala-emoji', m.emoji),
        el('span.sala-info', el('b', 'Treino de ' + m.nome),
          el('small', completa ? '10 perguntas de todas as salas' : 'Abre quando você terminar as salas. Falta' + (faltam === 1 ? ' 1 sala' : 'm ' + faltam + ' salas') + '!'),
          el('span.sala-chips', medalha ? el('span.chip-mini.ok', medalha + ' Melhor medalha') : null, t.vezes ? el('span.chip-mini', t.vezes + (t.vezes === 1 ? ' treino' : ' treinos')) : null)),
        el('span.sala-ir', completa ? 'Treinar →' : '🔒'));
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
