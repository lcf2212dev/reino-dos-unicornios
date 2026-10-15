/* Viagem de foguete (parte 3): as perguntas curtas das salas para os portais do voo e o desafio do ET.
   Contrato: docs/contratos/viagem.md §4.1. `escolha` com até 3 opções de até 16 letras (sem `apoio`) e `vf`;
   primeiro das salas que ela já fez, senão de todas; sorteio por U.embaralhar(lista, chave). Retorno com `ordem`.
   node: true: só funções; nada roda no carregamento. */
(function () {
  var R = window.Reino, V = R.Viagem;
  var MAX_OPCOES = 3, MAX_LETRAS = 16;

  function curta(t) { return typeof t === 'string' && t.trim().length > 0 && t.length <= MAX_LETRAS; }
  // o desafio vira pergunta de portal? devolve { opcoes, certa } ou null
  // figura (d.figura) ou só desenho nas opções (d.soImagem): a pergunta depende do desenho, não vira portal só com texto
  function opcoesDe(d) {
    if (!d || d.apoio || d.livre || d.figura || d.soImagem) return null;
    if (d.tipo === 'vf') return typeof d.afirmacao === 'string' ? { opcoes: ['Verdadeiro', 'Falso'], certa: d.certo ? 0 : 1 } : null;
    if (d.tipo !== 'escolha' || !Array.isArray(d.opcoes)) return null;
    if (d.opcoes.length < 2 || d.opcoes.length > MAX_OPCOES) return null;
    var textos = d.opcoes.map(function (o) { return o && o.t; });
    if (!textos.every(curta) || !Number.isInteger(d.certa) || !textos[d.certa]) return null;
    return { opcoes: textos, certa: d.certa };
  }
  function salaFeita(id) {
    try { var e = R.Progresso.estado(), x = e && e.salas && e.salas[id]; return !!(x && x.feita); } catch (e) { return false; }
  }
  function enunciado(d) {
    return R.Desafios && R.Desafios.enunciado ? R.Desafios.enunciado(d) : (d.pergunta || d.afirmacao || '');
  }

  /** Perguntas curtas da matéria. @returns {{ id, materia, sala, texto, opcoes: string[], certa: number, desafio }[]} */
  V.perguntas = function (materia, n, chave) {
    var U = R.util, m = (R.materias || []).find(function (x) { return x.id === materia; });
    if (!m || !(n > 0)) return [];
    var todas = [];
    (m.salas || []).forEach(function (s) {
      (s.desafios || []).forEach(function (d) {
        var o = opcoesDe(d);
        if (o) todas.push({ sala: s, desafio: d, o: o });
      });
    });
    var feitas = todas.filter(function (p) { return salaFeita(p.sala.id); });
    var base = feitas.length ? feitas : todas;
    var k = String(chave == null ? 'viagem' : chave);
    // faltou das feitas: completa com as outras (sem repetir)
    var lista = U.embaralhar(base, k + ':feitas');
    if (lista.length < n && base !== todas) lista = lista.concat(U.embaralhar(todas.filter(function (p) { return base.indexOf(p) < 0; }), k + ':resto'));
    return lista.slice(0, n).map(function (p) {
      // as opções também embaralhadas (a certa não fica sempre no mesmo lado); vf fica Verdadeiro, Falso
      var ordem = p.desafio.tipo === 'vf' ? [0, 1] : U.embaralhar(p.o.opcoes.map(function (_, i) { return i; }), k + ':' + p.desafio.id);
      return {
        id: p.desafio.id, materia: m.id, sala: p.sala.id, texto: enunciado(p.desafio),
        opcoes: ordem.map(function (i) { return p.o.opcoes[i]; }), certa: ordem.indexOf(p.o.certa), desafio: p.desafio,
        ordem: ordem,   // índices originais na ordem da tela (para ler: Reino.Falas.segmentosDesafio(desafio, ordem))
      };
    });
  };
})();
