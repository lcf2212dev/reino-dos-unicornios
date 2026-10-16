/* Área dos pais: PIN, pagamentos por matéria (em Robux; o save guarda em reais: P.pago), novo ciclo e apagar tudo. */
(function () {
  var U = Reino.util, el = U.el, P = Reino.Progresso;
  var EV = Reino.EVENTOS;
  var UI = Reino.UI, R = Reino._ui;
  var est = R.est, painel = R.painel;

  /* ---------- área dos pais ---------- */
  // pelo menu, sempre pede o PIN; `desbloqueada` só na reabertura logo depois de registrar um
  // pagamento ou começar um novo ciclo (o pai acabou de digitar o PIN nesta mesma tela).
  // `materiaId`: reabre mostrando o bloco da matéria que acabou de ser paga (e, pelo teclado, com o
  // foco no "Registrar pagamento" dela), para o pai não perder o lugar
  UI.telaPais = function () { abrirPais(false); };
  function abrirPais(desbloqueada, materiaId) {
    var pn = painel('pais', '🔒 Área dos pais');
    var c = pn.conteudo;
    if (desbloqueada) { conteudoPais(c, pn); if (materiaId) mostrarMateriaPaga(c, materiaId); return; }
    var digitado = '';
    var visor = el('div.pin-visor', { 'aria-live': 'polite' });
    // 4 casas fixas (mais, se o PIN for maior): vazia = só contorno, cheia = quadrado pintado
    function desenharVisor() {
      visor.classList.remove('pin-erro');
      visor.innerHTML = '';
      for (var i = 0; i < Math.max(4, digitado.length); i++) visor.appendChild(el('span.pin-casa' + (i < digitado.length ? '.cheia' : '')));
      visor.setAttribute('aria-label', digitado.length + ' de ' + Math.max(4, digitado.length) + ' números');
    }
    desenharVisor();
    var teclado = el('div.pin-teclado');
    c.appendChild(el('p', 'Digite o PIN dos pais.'));
    c.appendChild(visor);
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK'].forEach(function (k) {
      var b = el('button.pin-tecla', { type: 'button' }, k);
      b.addEventListener('click', function () {
        if (k === '⌫') digitado = digitado.slice(0, -1);
        else if (k === 'OK') { verificar(); return; }
        else if (digitado.length < 8) digitado += k;
        desenharVisor();
      });
      teclado.appendChild(b);
    });
    c.appendChild(teclado);
    function verificar() {
      if (digitado === String(Reino.config.pinPais)) { c.innerHTML = ''; conteudoPais(c, pn); }
      else {
        digitado = ''; visor.removeAttribute('aria-label');
        visor.textContent = 'PIN errado'; visor.classList.remove('pin-erro'); void visor.offsetWidth; visor.classList.add('pin-erro');   // reinicia a tremida
        Reino.Som.tocar('erro');
      }
    }
  }
  // rola só o conteúdo do painel (nada de scrollIntoView) até o bloco da matéria ficar no alto
  function mostrarMateriaPaga(c, materiaId) {
    var campo = document.getElementById('pago-' + materiaId);
    var bloco = campo && campo.closest('.pais-materia');
    if (!bloco) return;
    var r = bloco.getBoundingClientRect(), cr = c.getBoundingClientRect();
    c.scrollTop += r.top - (cr.top + c.clientTop) - (parseFloat(getComputedStyle(c).paddingTop) || 0);   // a 1ª (História) fica no alto, como abriu
    if (UI.porTeclado()) UI.focarTeclado(bloco.querySelector('.pais-pagar button'));
  }

  function conteudoPais(c, pn) {
    var total = 0, pagoTotal = 0;
    Reino.materias.forEach(function (m) {
      var ganho = P.dinheiroMateria(m), pago = P.pago(m.id);
      total += ganho; pagoTotal += pago;
      var campo = el('input.campo-pago#pago-' + m.id, { type: 'number', min: 0, step: 1, value: pago, 'aria-label': 'Robux já pagos de ' + m.nome });
      var salvar = el('button.btn-pequeno', { type: 'button' }, 'Registrar pagamento');
      salvar.addEventListener('click', function () { P.registrarPagamento(m.id, parseFloat(campo.value) || 0); UI.fecharTela(pn.tela); abrirPais(true, m.id); });
      var t = est().treinos[m.id] || {};
      c.appendChild(el('div.pais-materia',
        el('h3', m.emoji + ' ' + m.nome + (m.arquivada ? ' • 3º bimestre arquivado' : '')),
        // grade rótulo/valor (2 colunas); "A pagar" em destaque
        el('dl.pais-numeros',
          el('dt', 'Salas feitas'), el('dd', P.salasFeitas(m) + ' de ' + m.salas.length),
          el('dt', 'Ganhou'), el('dd', U.robux(ganho)),
          el('dt', 'Já pago'), el('dd', U.robux(pago)),
          el('dt.pais-apagar', 'A pagar'), el('dd.pais-apagar', U.robux(Math.max(0, ganho - pago)))),
        el('p', 'Treino da Medalha: ', el('b', t.melhor ? ({ ouro: '🥇 ouro', prata: '🥈 prata', bronze: '🥉 bronze' }[t.melhor]) : 'ainda não fez'), t.vezes ? ' (' + t.vezes + (t.vezes === 1 ? ' vez)' : ' vezes)') : ''),
        Reino.provas.filter(function (pv) { return pv.materiaId === m.id; }).map(function (pv) {
          var r = P.regProva(pv);
          return el('p', pv.nome + ' (' + pv.bimestre + '): ',
            r.tentativas ? el('b', r.tentativas + (r.tentativas === 1 ? ' tentativa' : ' tentativas')) : el('b', 'ainda não fez'),
            r.tentativas ? ' • notas: ' + r.notas.map(Reino.Provas.formatarNota).join(' → ') : '',
            ' • prêmio: ', el('b', r.premio ? Reino.Unicornios.RARIDADES[r.premio].emoji + ' ' + pv.acessorios[r.premio].nome : 'ainda não ganhou'));
        }),
        el('div.pais-pagar', el('label', { for: 'pago-' + m.id }, 'Já pago (Robux):'), campo, salvar)));
    });
    c.appendChild(el('div.bau-total', el('span.bau-moeda', '💰'), el('div', el('small', 'Total ganho no jogo'), el('b', U.robux(total)), el('small', 'A pagar: ', el('span', { style: 'white-space:nowrap' }, U.robux(Math.max(0, total - pagoTotal)))))));
    // nuvem e jogo guardado para jogar sem internet: notas vivas (ui/sem-internet.js)
    c.appendChild(UI.notaNuvem());
    c.appendChild(UI.notaSemInternet());
    c.appendChild(el('p.pais-nota', 'A medalha de ouro da escola (' + U.robux(Reino.config.medalhaEscolaValor) + ') é combinada fora do jogo. O jogo só lembra ' + Reino.Genero.nome() + ' de fazer a prova com calma.'));
    c.appendChild(el('p.pais-nota', 'O prêmio é em Robux. Um "Já pago" registrado antes, em reais, aparece convertido: R$ 20 = 500 Robux.'));
    var ciclo = el('button.btn-grande.btn-secundario', { type: 'button' }, '🔄 Começar novo ciclo de provas');
    ciclo.addEventListener('click', function () {
      UI.confirmar('Zerar salas, treinos, Robux e pagamentos para um novo ciclo de provas? Os unicórnios, as estrelas e os enfeites continuam.', 'Sim, zerar', 'Cancelar').then(function (sim) {
        if (!sim) return; P.novoCiclo(); UI.fecharTela(pn.tela); abrirPais(true); U.emit(EV.MAPA_MUDOU);
      });
    });
    var apagar = el('button.btn-grande.btn-perigo', { type: 'button' }, '🗑️ Apagar tudo');
    apagar.addEventListener('click', function () {
      UI.confirmar('Apagar TODO o progresso, inclusive unicórnios e estrelas? Isso não dá para desfazer.', 'Apagar tudo', 'Cancelar').then(function (sim) {
        if (!sim) return;
        UI.confirmar('Tem certeza mesmo? ' + Reino.Genero.nome() + ' vai começar do zero.', 'Sim, apagar', 'Não').then(function (sim2) {
          if (!sim2) return; P.apagarTudo(); location.reload();
        });
      });
    });
    c.appendChild(el('div.intro-botoes.coluna', ciclo, apagar));
  }
})();
