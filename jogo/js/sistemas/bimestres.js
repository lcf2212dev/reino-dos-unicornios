/* Temporada ativa e acesso ao catálogo histórico. Não lê nem altera o save.
   Os registros antigos mantêm IDs e recompensas; o conteúdo integral vive fora de jogo/.
   Contrato: docs/contratos/bimestres.md. */
(function () {
  var R = window.Reino;
  var B = R.Bimestres = /** @type {BimestresApi} */ ({
    atual: 4,
    inicio: '2026-10-05',
    aviso: 'Em breve teremos novos conteúdos do quarto bimestre!'
  });
  B.emEspera = function (materia) {
    var m = typeof materia === 'string' ? R.materia(materia) : materia;
    return !!(m && m.arquivada);
  };
  B.acaoEmEspera = function (acao) {
    var a = acao || {};
    if (a.tipo === 'prova') { var p = R.prova(a.prova); return !!(p && p.arquivada); }
    if (a.tipo === 'sala' || a.tipo === 'treino' || (a.tipo === 'tela' && a.tela === 'livro')) return B.emEspera(a.materia);
    if (a.tipo === 'guia') {
      if (/^materia:/.test(a.lugar || '')) return B.emEspera(a.lugar.slice(8));
      // a Escola espera uma prova ativa (a Revisão do bimestre); o Castelo, uma matéria ativa (o treino)
      if (a.lugar === 'escola') return !R.provas.some(function (p) { return !p.arquivada; });
      return a.lugar === 'castelo' && !R.materias.some(function (m) { return !m.arquivada; });
    }
    return false;
  };
  B.avisar = function (quem) {
    return R.Claude.falar(B.aviso, { quem: quem, voz: quem && quem.voz || 'narradora', modal: true,
      botoes: [{ texto: 'Ok!', valor: 'ok', principal: true }] });
  };
  B.painel = function (titulo, opcoes) {
    var pn = R.UI.painel('bimestre', titulo || 'Quarto bimestre', opcoes || { icone: '📚' });
    pn.conteudo.appendChild(R.util.el('p.aviso', B.aviso));
    return pn;
  };
})();
