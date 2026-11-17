/* Parte de bosque-combate.js (interno Reino._bosqueCombate): o que os monstros da Mariana fazem no combate
   (docs/contratos/monstros.md §5). Acrescenta a Reino.BosqueCombate:
     ferir(id, dano) → { vida, vencido } | null   o monstro equipado bate num inimigo ativo da arena de agora; vencido
                                                   segue o caminho da espada (sumindo → 'vencido' no próximo passo: XP,
                                                   pergunta e drop como se fosse ela)
     prender(id) → bool / soltar(id, arena?) → bool  a MonsterBall voando: o alvo fica 'preso' (parado, sem tocar nela,
                                                   fora do alcance da espada, do clique e da ajuda) até ela chegar
     capturar(id) → bool                          a MonsterBall pegou: some sem 'vencido' (sem XP, pergunta nem drop)
                                                   e volta ao ninho depois de voltaMs, como os outros (ativo ou preso)
     spriteInimigo(tipo, q, arena) → canvas|null  o desenho do inimigo (bosque-desenho.js; q 0 normal, 1 pisca, 2 branco, 3 passo)
   node: true: só funções (lidas na hora). */
(function () {
  var R = window.Reino;
  var S = R._bosqueCombate, API = R.BosqueCombate;
  var ATIVOS = { vagando: 1, perseguindo: 1, voltando: 1, recuando: 1 };
  // o inimigo ativo (id) da arena de agora, com o estado dela (comPreso: o preso também vale)
  function achar(id, comPreso) {
    var est = API.arena() ? S.estado : null;
    if (!est || est.desmaiado) return null;
    for (var i = 0; i < est.fantasmas.length; i++) {
      var f = est.fantasmas[i];
      if (f.id === id) return ATIVOS[f.estado] || (comPreso && f.estado === 'preso') ? { est: est, f: f } : null;
    }
    return null;
  }
  API.ferir = function (id, dano) {
    var a = achar(id), n = Math.max(1, Math.round(dano) || 1);
    if (!a) return null;
    var f = a.f, est = a.est;
    f.vida = Math.max(0, f.vida - n); f.feridoAte = est.t + 160;
    if (f.vida <= 0) { f.estado = 'sumindo'; f.ate = est.t + est.cfg.vencidoMs; }
    return { vida: f.vida, vencido: f.vida <= 0 };
  };
  API.prender = function (id) {
    var a = achar(id);
    if (!a) return false;
    a.f.estado = 'preso';
    return true;
  };
  // volta a vagar dali mesmo (a bola abriu ou não chegou), na arena dada (padrão: a de agora; ela pode ter ido de
  // arena para arena com a bola no ar); false se ele não estava preso
  API.soltar = function (id, arena) {
    var est = S.estados[arena || S.arena] || null, f = est && est.fantasmas.filter(function (x) { return x.id === id; })[0];
    if (!f || f.estado !== 'preso') return false;
    f.estado = 'vagando'; f.pausa = true; f.ate = est.t + 400; f.alvoX = f.x; f.alvoY = f.y;
    return true;
  };
  API.capturar = function (id) {
    var a = achar(id, true);
    if (!a) return false;
    a.f.estado = 'esperando'; a.f.ate = a.est.t + a.est.cfg.voltaMs; a.f.vida = 0;
    return true;
  };
  API.spriteInimigo = function (tipo, q, arena) {
    return S.desenho && S.desenho.sprite ? S.desenho.sprite(tipo, q || 0, arena) : null;
  };
})();
