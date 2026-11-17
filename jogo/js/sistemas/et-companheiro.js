/* Viagem de foguete (3ª versão): o ET amigo que acompanha a Mariana, flutuando um pouco atrás dela no mapa e nos
   interiores (campo `etCompanheiro`). Contrato: docs/contratos/viagem.md §6.3. Desenho: et-companheiro-desenho.js.
   Aqui: API (Reino.Viagem.companheiro / escolherCompanheiro), o campo do save e o rastro próprio (o do bebê é do
   jogador.js). Não conversa nem bloqueia nada. O ET e os monstros equipados (monstros.md §3) vão juntos: os monstros em
   fila atrás dela e o ET atrás do último (`config.viagem.etAtrasDoMonstro`). O rastro serve a todos (monstros-desenho.js).
   node: true: nada de DOM, Progresso nem Cena no carregamento (só dentro das funções). */
(function () {
  var R = window.Reino;
  var V = R.Viagem = R.Viagem || {};
  // o que as partes dividem (et-companheiro-desenho.js): rastro, cena e para onde o ET olha
  var S = R._etCompanheiro = { rastro: [], cena: null, espelhar: false, ultX: null };
  var SALTO = 24;   // px do jogo num quadro só: foi porta, escada ou teletransporte (o rastro recomeça)
  function cfg() { return R.config.viagem; }

  /* ================= NO SAVE ================= */
  // etCompanheiro: { mariana: { id: npcId | null, em } }: vale o mais recente entre aparelhos; Novo ciclo mantém
  R.Progresso.registrarCampo('etCompanheiro', {
    padrao: function () { return {}; },
    mesclar: 'carimbo',
    novoCiclo: 'mantem',
    copiaSeguranca: true,
    limpar: function (v) {
      var m = v.mariana;
      if (m === undefined) return v;
      var id = typeof m.id === 'string' && m.id ? m.id : null;
      return { mariana: { id: id, em: typeof m.em === 'number' ? m.em : 0 } };
    },
    exemplos: [{ mariana: { id: 'lua-lumi', em: 10 } }, { mariana: { id: null, em: 20 } }],
  });
  function estado() { try { return R.Progresso.estado(); } catch (e) { return null; } }

  /* ================= API ================= */
  // o ET escolhido (id do elenco) ou null; some se deixou de ser amigo ou se o personagem não existe
  V.companheiro = function () {
    var est = estado(), m = est && est.etCompanheiro && est.etCompanheiro.mariana, id = m && m.id;
    if (!id || !V.ehAmigo || !V.ehAmigo(id)) return null;
    var el = R.NPCs && R.NPCs.ELENCO && R.NPCs.ELENCO[id];
    if (R.NPCs && R.NPCs.ELENCO && (!el || !el.sprite || el.sprite.base === 'reserva')) return null;
    return id;
  };
  // levar um amigo (id) ou deixar em casa (null); os monstros equipados continuam junto. true = gravou
  V.escolherCompanheiro = function (id) {
    var est = estado();
    if (!est || (id !== null && (typeof id !== 'string' || !V.ehAmigo || !V.ehAmigo(id)))) return false;
    var m = est.etCompanheiro && est.etCompanheiro.mariana;
    est.etCompanheiro = { mariana: { id: id, em: Math.max(Date.now(), (m && m.em || 0) + 1) } };
    S.rastro = [];
    try { R.Progresso.salvar(); } catch (e) { /* sem save (teste) */ }
    return true;
  };

  /* ================= RASTRO ================= */
  // a distância atrás dela: nunca em cima do bebê (que anda DIST_BEBE atrás); com monstros junto, no fim da fila, atrás
  // do último (Reino._monstros.distancia(n): o 1º a config.monstros.distancia, cada outro entreMonstros atrás)
  S.distancia = function () {
    var J = window.Jogador, M = R.Monstros, MS = R._monstros, aPe = J && J.DIST_BEBE && !(J.montado && J.montado());
    var d = cfg().companheiroDistancia, n = M && M.equipados ? M.equipados().length : 0;
    if (aPe) d = Math.max(d, J.DIST_BEBE + 16);
    if (n && MS && MS.distancia) d = Math.max(d, MS.distancia(n - 1)) + cfg().etAtrasDoMonstro;
    return d;
  };
  // recomeça de lado, um pouco atrás (y menor): a pé, à direita (o bebê começa à esquerda); montada, à esquerda
  S.recomecar = function (x, y) {
    var J = window.Jogador, lado = J && J.montado && J.montado() ? -1 : 1, d = S.distancia() + 8;
    S.rastro = [{ x: x + lado * d, y: y - 4 }, { x: x, y: y }];
    S.ultX = null;
  };
  // a cada quadro: guarda o caminho dela; salto grande ou cena nova recomeça
  S.atualizar = function (x, y, cena, ox, oy) {
    var ult = S.rastro[S.rastro.length - 1];
    if (!ult || cena !== S.cena || Math.hypot(ult.x - x, ult.y - y) > SALTO) {
      S.cena = cena;
      S.recomecar(x, y);
      return;
    }
    if (Math.hypot(ult.x - x, ult.y - y) > 0.05) {
      S.rastro.push({ x: x, y: y });
      var total = 0, max = S.distancia() * 3;
      for (var i = S.rastro.length - 1; i > 0; i--) {
        total += Math.hypot(S.rastro[i].x - S.rastro[i - 1].x, S.rastro[i].y - S.rastro[i - 1].y);
        if (total > max) { S.rastro.splice(0, i - 1); break; }
      }
    }
  };
  // o ponto do rastro a d px atrás dela (interpolado)
  S.pontoAtras = function (d) {
    var r = S.rastro, n = r.length;
    if (!n) return null;
    var px = r[n - 1].x, py = r[n - 1].y, falta = d;
    for (var i = n - 2; i >= 0; i--) {
      var q = r[i], seg = Math.hypot(px - q.x, py - q.y);
      if (seg > 0 && seg >= falta) { var t = falta / seg; return { x: px + (q.x - px) * t, y: py + (q.y - py) * t }; }
      falta -= seg; px = q.x; py = q.y;
    }
    return { x: px, y: py };
  };

  R.registrarModulo({
    id: 'et-companheiro',
    depurar: function () {
      var p = S.rastro.length ? S.pontoAtras(S.distancia()) : null;
      return { companheiro: V.companheiro(), cena: S.cena, pontos: S.rastro.length, et: p };
    },
    // desenho junto dos personagens (ordenado por y): só com um amigo escolhido
    camada: {
      ativo: function () { return !!(window.Jogador && S.itensDesenho && V.companheiro()); },
      itensDesenho: function (p, t, animar) { return S.itensDesenho(p, t, animar); },
    },
  });
})();
