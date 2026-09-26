/* Pet Shop, parte 4 de 5: ações (beber no bebedouro, banho na banheira), a tela da Dona Aveia e o status
   dela (🍎/💧/🛁) registrados em Reino.NPCs. Só guardam funções: nada roda no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var K = R.Desenho.K;
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.petshop) || { npcs: {}, objetos: {}, extras: [] };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var S = R._predios.petshop;

  /* ================= AÇÕES, TELA E STATUS (só guardam funções) ================= */
  function retratoUni(id) {
    try {
      var P = R.Progresso, d = P.defUni(id), u = P.estado().unis[id];
      var s = window.PA && PA.unicornio ? PA.unicornio(d, R.Unicornios.estagio(u ? u.xp : 0), 0) : null;
      return s ? (s.canvas || s) : null;
    } catch (e) { return null; }
  }
  // balão modal de uma frase do Reino.Cuidados, na voz de quem fala (o unicórnio ou o Claude)
  function falarFrase(chave, id) {
    var Cu = R.Cuidados, Cl = R.Claude;
    var texto = Cu.frases && Cu.frases[chave];
    if (!texto || !Cl || !Cl.falar) return Promise.resolve(null);
    var voz = Cu.vozDaFrase ? Cu.vozDaFrase(chave) : 'claude';
    var op = { modal: true, voz: voz, botoes: [{ texto: 'Ok! 👍', valor: 'ok', principal: true }] };
    if (voz === 'unicornio') {
      var P = R.Progresso;
      op.quem = { nome: (P.nomeUni && P.nomeUni(id)) || 'Unicórnio', retrato: retratoUni(id), voz: voz };
    }
    return Cl.falar(texto, op);
  }
  function beber() {
    var Cu = R.Cuidados, P = R.Progresso, Cl = R.Claude;
    if (!Cu || !Cu.beber || !P) return Promise.resolve(null);
    var id = P.montaria ? P.montaria() : null;
    var r = Cu.beber(id);
    if (r && r.ok) {
      if (R.Som && R.Som.tocar) R.Som.tocar('gole');
      S.golouEm = (window.performance && performance.now) ? performance.now() : Date.now();
      return falarFrase('bebeu', id);
    }
    if (r && r.motivo === 'cheio') return falarFrase('semSede', id);
    // ninguém para beber: a narradora conta para que serve o bebedouro
    var ex = (F.extras || [])[0];
    if (!ex || !Cl || !Cl.falar) return Promise.resolve(null);
    return Cl.falar(ex.texto, { modal: true, voz: ex.voz, quem: { nome: 'Bebedouro', voz: ex.voz },
      botoes: [{ texto: 'Ok! 👍', valor: 'ok', principal: true }] });
  }
  if (R.NPCs && R.NPCs.registrarTela) {
    R.NPCs.registrarTela('petshop', function () { if (R.UI && R.UI.telaPetShop) R.UI.telaPetShop(); }, (F.npcs.aveia && F.npcs.aveia.nova && F.npcs.aveia.nova[0]) || 'Quer ver as comidinhas? 🥕');
  }
  if (R.NPCs && R.NPCs.registrarAcao) R.NPCs.registrarAcao('beber', beber);
  // banho de espuma na banheira (de graça): a animação, o banho = 100 e as falas são do Reino.Banho
  function banho(acao, ctx) {
    var P = R.Progresso, o = ctx && ctx.objeto;
    var id = P && P.montaria ? P.montaria() : null;
    var banheira = o ? { x: o.x, y: o.y, w: o.w || 3, h: o.h || 2 } : null;
    if (R.Banho && R.Banho.iniciar) return R.Banho.iniciar(id, { banheira: banheira });
    // sem o módulo do banho: banha direto, sem animação
    var Cu = R.Cuidados, r = Cu && Cu.banhar ? Cu.banhar(id) : null;
    if (r && r.ok) return falarFrase('banhou', id);
    if (r && r.motivo === 'cheio') return falarFrase('jaLimpinho', id);
    return Promise.resolve(null);
  }
  if (R.NPCs && R.NPCs.registrarAcao) R.NPCs.registrarAcao('banho', banho);
  // a Dona Aveia mostra 🍎/💧/🛁 quando a montaria está com fome, sede ou sujinha
  if (R.NPCs && R.NPCs.registrarStatus) {
    R.NPCs.registrarStatus(function (n) {
      if (!n || n.id !== 'aveia' || !R.Cuidados || !R.Cuidados.iconeMontaria) return null;
      var ic = R.Cuidados.iconeMontaria();
      if (!ic || !(window.PA && PA.iconeDesenho && PA.iconeDesenho(ic))) return null;
      var b = R.Cuidados.baixo ? R.Cuidados.baixo() : null;
      return { icone: ic, rotulo: b && b.fome && b.sede ? 'Com fome e sede' : (ic === '💧' ? 'Com sede' : ic === '🛁' ? 'Precisa de banho' : 'Com fome') };
    });
  }
})();
