/* Gancho para os testes: só existe com ?debug=1 na URL (window.__reino).
   Não muda nada no jogo; só lê o estado e chama as mesmas funções dos controles. */
(function () {
  if (!/[?&]debug=1(&|$)/.test(location.search)) return;
  var quadros = [], ultimo = 0;
  function medir(t) {
    if (ultimo) { quadros.push(t - ultimo); if (quadros.length > 120) quadros.shift(); }
    ultimo = t;
    requestAnimationFrame(medir);
  }
  requestAnimationFrame(medir);

  function cena() { return Reino.Cena ? Reino.Cena.atual() : null; }

  window.__reino = {
    // id da cena ativa: 'mapa' ou o id do interior
    cena: function () { var c = cena(); return c ? c.id : 'mapa'; },
    // 'mapa' | 'transicao' | 'interior' | 'dialogo' | 'atividade'
    estado: function () {
      if (Reino.Cena) return Reino.Cena.estado();
      return Reino.UI.temTela() ? 'atividade' : 'mapa';
    },
    pos: function () {
      return { x: Jogador.x, y: Jogador.y, tile: Jogador.tile(), olhar: { x: Jogador.olharX, y: Jogador.olharY } };
    },
    // quadros por segundo (intervalo entre requestAnimationFrame)
    fps: function () {
      if (!quadros.length) return 0;
      var m = quadros.reduce(function (a, b) { return a + b; }, 0) / quadros.length;
      return Math.round(1000 / m);
    },
    // tempo médio de desenho de um quadro, em ms (medido pelo laço do jogo)
    tempoQuadro: function () { return Reino.Cena && Reino.Cena.quadros ? Reino.Cena.quadros.media() : null; },
    entrar: function (lugarId) {
      if (Reino.Cena) return Reino.Cena.entrar(lugarId);
      return Reino.UI.abrirLugar(Mapa.lugar(lugarId));
    },
    sair: function () { return Reino.Cena ? Reino.Cena.sair() : null; },
    // NPCs da cena ativa: id, nome, tile e ícone de status
    npcs: function () {
      var c = cena();
      if (!c || !c.npcs) return [];
      return c.npcs().map(function (n) {
        return { id: n.id, nome: n.nome, x: n.x, y: n.y, status: Reino.NPCs ? Reino.NPCs.status(n).icone : null };
      });
    },
    // posição na página (px CSS) de um ponto do mundo (px do jogo), para tocar com o mouse/dedo
    paraTela: function (wx, wy) { return Reino.Cena ? Reino.Cena.paraTela(wx, wy) : null; },
    get faltando() { return Reino.Voz.faltando; },
    progresso: function () { return Reino.util.copia(Reino.Progresso.estado()); },
    // novidades (CONTRATOS-NOVIDADES.md): fome e sede, pergunta surpresa e nado
    avancarJogo: function (ms) { return Reino.Cuidados ? Reino.Cuidados.avancar(ms) : null; },
    cuidados: function () { return Reino.Cuidados ? Reino.Cuidados.depurar() : null; },
    surpresa: function () { return Reino.Surpresa ? Reino.Surpresa.forcar() : null; },
    // banho, fotos e música (CONTRATOS-BANHO-FOTOS-MUSICA.md): cada um devolve o depurar() do módulo
    banho: function (uniId) { return Reino.Cuidados && Reino.Cuidados.banhar ? Reino.Cuidados.banhar(uniId) : null; },
    animacaoBanho: function () { return Reino.Banho ? Reino.Banho.depurar() : null; },
    musicaAtual: function () { return Reino.Som && Reino.Som.musicaAtual ? Reino.Som.musicaAtual() : null; },
    fotos: function () { return Reino.Fotos ? Reino.Fotos.depurar() : null; },
    // agua(tx, ty): o tile do mapa é água do lago? Sem argumentos: ela está nadando agora?
    agua: function (tx, ty) {
      if (tx === undefined) return !!(Jogador.nadando && Jogador.nadando());
      return !!(Mapa.agua && Mapa.agua(tx, ty));
    },
  };
})();
