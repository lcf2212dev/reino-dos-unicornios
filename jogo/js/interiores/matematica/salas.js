/* Torre dos Números da Matemática do Dia a Dia (4º bimestre, docs/contratos/quarto-bimestre.md §7): as salas dos
   dois livros viram estações (objeto ma-estacao, matematica/ma-objetos.js) GERADAS DOS DADOS. Cada andar é um
   capítulo, com três cômodos em fila: duas galerias do Livro de Aprendizagem (as salas 1 a 5 e 6 a 10 do capítulo) e
   o ateliê do Livro de Atividades (até 4 salas). Em cada cômodo as estações ficam na fileira 3, na ordem do livro,
   da esquerda para a direita (a fileira 2, em cima delas, fica livre: a estação é alta); vaga sem sala = enfeite,
   sala sem vaga = erro na carga (nunca some uma sala).
   Põe em Reino._predios.matematica: MAT, CAPITULOS, VAGAS e estacoes(cap, comodo, ox, oy), lidos pelo layout
   (matematica/matematica.js e ma-andares.js).
   O arquivo de mesmo nome do 3º bimestre (a planta do interior padrão) está em
   arquivo/terceiro-bimestre/jogo/js/interiores/matematica/salas.js, que a fixture histórica dos testes carrega. */
(function () {
  var R = window.Reino;
  var MAT = 'matematica4', M = R.materia && R.materia(MAT);
  // sem a matéria (contexto só com o catálogo do 3º bimestre) a torre não tem estações
  if (!M) return;
  var S = R._predios.matematica;

  var CAPITULOS = [10, 11, 12];
  // vagas em coordenadas do cômodo (0–10; fileiras 0 e 1 são a parede), na ordem do livro
  var VAGAS = { galeria: [[1, 3], [3, 3], [5, 3], [7, 3], [9, 3]], atelie: [[1, 3], [3, 3], [5, 3], [7, 3]] };
  var LIVRO = { galeria1: 'aprendizagem', galeria2: 'aprendizagem', atelie: 'atividades' };
  function salasDo(cap, livro) { return M.salas.filter(function (s) { return s.capitulo === cap && s.livroOrigem === livro; }); }
  // as salas de um cômodo: as duas galerias repartem as do Livro de Aprendizagem; o ateliê tem as de Atividades
  function salasDoComodo(cap, comodo) {
    var ss = salasDo(cap, LIVRO[comodo]), n = VAGAS.galeria.length;
    if (comodo === 'galeria1') return ss.slice(0, n);
    if (comodo === 'galeria2') return ss.slice(n);
    return ss;
  }
  M.salas.forEach(function (s) {
    if (CAPITULOS.indexOf(s.capitulo) < 0 || ['aprendizagem', 'atividades'].indexOf(s.livroOrigem) < 0) {
      throw new Error('matematica: a sala ' + s.id + ' (capítulo ' + s.capitulo + ', livro ' + s.livroOrigem +
        ') não tem andar na Torre dos Números (matematica/salas.js, CAPITULOS)');
    }
  });
  CAPITULOS.forEach(function (cap) {
    var max = { aprendizagem: 2 * VAGAS.galeria.length, atividades: VAGAS.atelie.length };
    Object.keys(max).forEach(function (livro) {
      var n = salasDo(cap, livro).length;
      if (n > max[livro]) throw new Error('matematica: o capítulo ' + cap + ' tem ' + n + ' salas do livro "' + livro + '", mas ' +
        (livro === 'atividades' ? 'o ateliê só tem ' : 'as duas galerias só têm ') + max[livro] + ' vagas (matematica/salas.js, VAGAS)');
    });
  });

  // "pp. 3 a 9" → "Páginas 3 a 9"; "p. 4" → "Página 4"
  function textoPaginas(p) {
    var t = String(p || '').trim(), m = /^(pp?)\.\s*(.+)$/i.exec(t);
    if (!m) return t;
    return (m[1].toLowerCase() === 'pp' || /\d\D+\d/.test(m[2]) ? 'Páginas ' : 'Página ') + m[2];
  }
  // fala curta da estação (sem emoji): "Páginas 3 a 9: As moedas."; se não couber numa página, só "Páginas 3 a 9."
  // (o nome da sala já está no título do balão: não se repete)
  function falaSala(s) {
    var pg = String(textoPaginas(s.paginas) || '').replace(/\bp\. /g, 'página '), nome = String(s.nome || '').trim(), fim = /[.!?…]$/.test(nome) ? '' : '.';
    if (!pg) return nome + fim;
    var uma = pg + ': ' + nome + fim;
    return uma.length <= 34 ? uma : pg + '.';
  }
  function primeiraPagina(p) { var m = /\d+/.exec(String(p || '')); return m ? m[0] : ''; }
  // vaga sem sala: um pedestal com a miudeza do capítulo (galeria) ou um cavalete (ateliê); nunca uma estação vazia
  var MIUDEZAS = { 10: ['moedas', 'medalha', 'moedas', 'gema', 'moedas'], 11: ['bolo', 'xicara', 'bolo', 'bule', 'bolo'],
    12: ['planta', 'estrela', 'planta', 'globo', 'planta'] };
  function enfeite(cap, comodo, i) {
    if (comodo === 'atelie') return { tipo: 'cavalete' };
    return { tipo: 'pedestal', var: { item: MIUDEZAS[cap][i] } };
  }
  // as estações de um cômodo ('galeria1' | 'galeria2' | 'atelie') do capítulo, com o canto do cômodo em (ox, oy)
  function estacoes(cap, comodo, ox, oy) {
    var ss = salasDoComodo(cap, comodo), livro = LIVRO[comodo];
    return VAGAS[comodo === 'atelie' ? 'atelie' : 'galeria'].map(function (p, i) {
      var s = ss[i], o = { x: ox + p[0], y: oy + p[1] };
      if (!s) return Object.assign(o, enfeite(cap, comodo, i));
      return Object.assign(o, { tipo: 'ma-estacao', chave: 'ma-sala-' + s.id, nome: s.nome, fala: falaSala(s),
        acao: { tipo: 'sala', materia: MAT, sala: s.id }, var: { livro: livro, pagina: primeiraPagina(s.paginas) } });
    });
  }

  S.MAT = MAT; S.CAPITULOS = CAPITULOS; S.VAGAS = VAGAS; S.estacoes = estacoes;
})();
