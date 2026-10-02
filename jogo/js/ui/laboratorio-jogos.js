/* Três mecânicas sem cronômetro: pares, navegação espacial e ordenação. Estado vive só no painel. */
(function () {
  var R = window.Reino, UI = R.UI, L = R._laboratorio;
  UI.telaLaboratorioJogo = function (id) {
    var a = R.LABORATORIO.jogos.find(function (x) { return x.id === id; }); if (!a) return;
    var p = L.base(a.nome, a.guia, a.fala);
    var area = L.el('div', 'laboratorio-jogo'), relato = L.el('p', 'laboratorio-relato', 'Vamos brincar!');
    relato.setAttribute('aria-live', 'polite'); p.conteudo.append(area, relato);
    function fim(texto) { relato.textContent = texto; L.falar(R.LABORATORIO.fim); }
    if (id === 'memoria') memoria(area, relato, fim);
    if (id === 'polen') polen(area, relato, fim);
    if (id === 'ciclo') ciclo(area, relato, fim);
    L.botao(p.conteudo, 'Jogar de novo', function () { L.ir(p, function () { UI.telaLaboratorioJogo(id); }); });
    L.voltar(p, 'jogos');
  };
  function memoria(area, relato, fim) {
    var cartas = [], abertas = [], feitos = [], comparar = null;
    R.LABORATORIO.pares.forEach(function (par, i) { par.forEach(function (texto) { cartas.push({ par: i, texto: texto }); }); });
    cartas = R.util.embaralhar(cartas, 'laboratorio:memoria');
    var grade = L.el('div', 'laboratorio-memoria'); area.appendChild(grade);
    cartas.forEach(function (carta, i) {
      var b = L.botao(grade, 'Carta ' + (i + 1), function () {
        if (feitos.indexOf(carta.par) >= 0 || abertas.indexOf(i) >= 0 || abertas.length === 2) return;
        abertas.push(i); b.textContent = carta.texto; b.setAttribute('aria-pressed', 'true');
        if (abertas.length < 2) { relato.textContent = 'Agora vire outra carta.'; return; }
        if (cartas[abertas[0]].par === cartas[abertas[1]].par) {
          feitos.push(carta.par); abertas.forEach(function (n) { grade.children[n].classList.add('laboratorio-certo'); grade.children[n].setAttribute('aria-disabled', 'true'); }); abertas = [];
          if (feitos.length === 3) fim('Todos os pares encontrados! Cada animal vive em um ambiente com o que precisa.');
          else relato.textContent = 'Você encontrou um par! Continue explorando.';
        } else { relato.textContent = 'Estas cartas formam pares diferentes. Observe e vire de novo quando quiser.'; comparar.hidden = false; }
      });
      b.setAttribute('aria-pressed', 'false');
    });
    comparar = L.botao(area, 'Virar estas cartas', function () {
      abertas.forEach(function (n) { grade.children[n].textContent = 'Carta ' + (n + 1); grade.children[n].setAttribute('aria-pressed', 'false'); });
      abertas = []; comparar.hidden = true; relato.textContent = 'Escolha mais duas cartas.'; UI.focarTroca(grade.children[0], area);
    }); comparar.hidden = true;
  }
  function polen(area, relato, fim) {
    var pos = 20, flores = [2, 9, 16], visitadas = [], pedras = [6, 7, 11, 13, 18], terminou = false;
    var grade = L.el('div', 'laboratorio-jardim'); grade.setAttribute('role', 'img'); area.appendChild(grade);
    var controles = L.el('div', 'laboratorio-direcoes'); area.appendChild(controles);
    function desenho() {
      grade.replaceChildren();
      for (var i = 0; i < 25; i++) {
        var tipo = pedras.indexOf(i) >= 0 ? 'pedra' : flores.indexOf(i) >= 0 ? 'flor' : i === 20 ? 'colmeia' : 'grama';
        var casa = L.el('div', 'laboratorio-casa ' + tipo + (visitadas.indexOf(i) >= 0 ? ' visitada' : ''));
        if (i === pos) casa.appendChild(L.el('span', 'laboratorio-abelha'));
        grade.appendChild(casa);
      }
      grade.setAttribute('aria-label', 'Abelha na linha ' + (Math.floor(pos / 5) + 1) + ', coluna ' + (pos % 5 + 1) + '. Flores visitadas: ' + visitadas.length + ' de 3.');
    }
    function mover(dx, dy) {
      if (terminou) return;
      var x = pos % 5 + dx, y = Math.floor(pos / 5) + dy, destino = y * 5 + x;
      if (x < 0 || x > 4 || y < 0 || y > 4 || pedras.indexOf(destino) >= 0) { relato.textContent = 'Há uma pedra ou a cerca por aqui. Experimente outro caminho.'; return; }
      pos = destino;
      if (flores.indexOf(pos) >= 0 && visitadas.indexOf(pos) < 0) visitadas.push(pos);
      relato.textContent = 'Flores visitadas: ' + visitadas.length + ' de 3.' + (visitadas.length === 3 ? ' Volte para a colmeia, no canto de baixo à esquerda.' : ' Procure as flores cor-de-rosa.');
      desenho();
      if (pos === 20 && visitadas.length === 3) { terminou = true; fim('Viagem completa! Ao visitar flores, a abelha pode levar pólen de uma flor para outra.'); }
    }
    [['↑', 'Cima', 0, -1], ['←', 'Esquerda', -1, 0], ['↓', 'Baixo', 0, 1], ['→', 'Direita', 1, 0]].forEach(function (d) { var b = L.botao(controles, d[0], function () { mover(d[2], d[3]); }); b.setAttribute('aria-label', d[1]); });
    area.tabIndex = 0;
    area.addEventListener('keydown', function (e) {
      var direcoes = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }, d = direcoes[e.key];
      if (d) { e.preventDefault(); e.stopPropagation(); mover(d[0], d[1]); }
    });
    area.appendChild(L.el('p', 'laboratorio-legenda', 'Flores rosas • pedras cinzas • colmeia dourada. Toque nas setas ou use as setas do teclado com o jardim em foco.'));
    desenho();
  }
  function ciclo(area, relato, fim) {
    var ordem = [], pecas = R.LABORATORIO.ciclo, terminou = false;
    var trilha = L.el('ol', 'laboratorio-trilha'), banco = L.el('div', 'laboratorio-controles'); area.append(trilha, banco);
    [2, 0, 3, 1].forEach(function (n) {
      var b = L.botao(banco, pecas[n], function () {
        if (terminou || ordem.indexOf(n) >= 0) return;
        ordem.push(n); b.setAttribute('aria-pressed', 'true'); desenhar();
      }); b.dataset.peca = String(n);
    });
    function desenhar() { trilha.replaceChildren(); for (var i = 0; i < 4; i++) trilha.appendChild(L.el('li', '', ordem[i] === undefined ? 'Escolha uma peça' : pecas[ordem[i]])); }
    L.botao(area, 'Desfazer a última', function () { if (terminou || !ordem.length) return; var n = ordem.pop(); banco.querySelector('[data-peca="' + n + '"]').setAttribute('aria-pressed', 'false'); desenhar(); relato.textContent = 'Você pode experimentar outra ordem.'; });
    L.botao(area, 'Testar a viagem', function () {
      if (terminou) return;
      if (ordem.length < 4) { relato.textContent = 'Coloque as quatro peças para testar a viagem.'; return; }
      if (ordem.every(function (n, i) { return n === i; })) { terminou = true; fim('A viagem está completa! O vapor esfria e forma gotinhas nas nuvens. Depois da chuva, a água pode evaporar de novo.'); }
      else relato.textContent = 'Vamos investigar: comece com o sol aquecendo a água. Depois ela evapora, forma gotinhas nas nuvens e cai como chuva. Use Desfazer para mudar as peças.';
    }); desenhar();
  }
})();
