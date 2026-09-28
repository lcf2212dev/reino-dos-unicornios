/* Viagem de foguete (parte 2): o fluxo — decolar → voo (Reino.Voo) → chegada no planeta, a volta de graça ao Hangar
   e o aviso do Claude (uma vez por sessão, no mapa, até o 1º carimbo). Ver o cabeçalho de viagem.js.
   node: true: só funções; nada roda no carregamento. */
(function () {
  var R = window.Reino, V = R.Viagem;
  var S = R._viagem = { avisou: false, voando: false, timer: null };

  function falar(texto, op) {
    op = op || {};
    if (!R.Claude || !R.Claude.falar) return Promise.resolve(null);
    var pags = [].concat(texto);
    return R.Claude.falar(pags.join(' '), { fala: pags, voz: 'claude', modal: op.modal, botoes: op.botoes, tempo: op.tempo });
  }
  // o voo; sem Reino.Voo (outra frente), vai direto
  // com matéria: config.viagem.portaisPorVoo perguntas viram portais (a Lua não tem)
  function voar(planeta) {
    var Voo = R.Voo;
    if (!Voo || typeof Voo.iniciar !== 'function') return Promise.resolve({ chegou: true, estrelas: 0, batidas: 0 });
    var perguntas = planeta.materia && V.perguntas ? V.perguntas(planeta.materia, R.config.viagem.portaisPorVoo, 'voo:' + planeta.id) : [];
    return Promise.resolve(Voo.iniciar({ planeta: planeta, perguntas: perguntas })).catch(function () { return { chegou: false, estrelas: 0, batidas: 0 }; });
  }

  // o painel já fechou: voa e, se chegou, gasta o tanque, dá as estrelas, entra no planeta e carimba
  V.decolar = function (id) {
    var planeta = V.planeta(id);
    if (!planeta || S.voando || !V.cheio() || !V.aberto(planeta.id)) return Promise.resolve(false);
    S.voando = true;
    return voar(planeta).then(function (r) {
      S.voando = false;
      if (!r || !r.chegou) return false;   // saiu no meio: nada se gasta
      V.gastar();
      // portal certo: estrela a mais; e a Aura.contar do voo caiu no tanque ainda cheio: volta depois de gastar
      var certos = Math.max(0, Math.floor((r.portais && r.portais.certos) || 0));
      if (certos) V.ganhar(certos);
      var c = R.config.viagem, est = Math.max(0, Math.min(Math.floor(r.estrelas || 0), c.estrelasPorVoo)) + certos * (c.estrelasPorPortal || 0);
      var P = R.Progresso;
      if (est > 0) { P.ganharEstrelas(est); P.salvar(); if (R.UI && R.UI.atualizarHUD) R.UI.atualizarHUD(); }
      return Promise.resolve(R.Cena.irPara(planeta.interior, planeta.chegada, { x: 0, y: 1 })).then(function () {
        var novo = V.carimbar(planeta.id), F = V.frases, t = [F.chegou(planeta.nome, planeta.artigo)];
        if (novo) t.push(F.carimbo);
        if (est > 0) t.push(F.estrelas(est));
        if (R.Som && R.Som.tocar) R.Som.tocar('estrela');
        falar(t);
        return true;
      });
    }, function () { S.voando = false; return false; });
  };

  // o foguete de pouso: "Voltar para o Reino?" (Sim / Ainda não); a volta é de graça
  V.voltar = function (acao) {
    return falar(V.frases.voltar, { modal: true, botoes: [
      { texto: 'Sim! 🚀', valor: 'sim', principal: true }, { texto: 'Ainda não', valor: 'nao' }] })
      .then(function (v) { if (v === 'sim') return R.Cena.irPara(acao.para, acao.chegada, { x: 0, y: 1 }); });
  };

  // o aviso: uma vez por sessão, com ela no mapa e livre, enquanto o passaporte está vazio
  function livre() {
    var C = R.Cena, UI = R.UI;
    if (!C || !C.estado || C.estado() !== 'mapa') return false;
    if (UI && UI.temTela && UI.temTela()) return false;
    if (R.Claude && R.Claude.aberto && R.Claude.aberto()) return false;
    return !(R.Surpresa && R.Surpresa.aberta && R.Surpresa.aberta());
  }
  function olharAviso() {
    if (S.avisou || Object.keys(V.carimbos()).length) { S.avisou = true; parar(); return; }
    if (!livre()) return;
    S.avisou = true; parar();
    falar(V.frases.aviso, { tempo: 7000 });
  }
  function parar() { if (S.timer) { clearInterval(S.timer); S.timer = null; } }
  V.vigiarAviso = function () {
    // modo determinístico dos testes: sem aviso (as fotos do e2e não mudam)
    if (S.timer || S.avisou || R.congelado || typeof setInterval !== 'function') return;
    S.timer = setInterval(olharAviso, 3000);
  };
})();
