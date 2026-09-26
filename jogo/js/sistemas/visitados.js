/* Visitados e o selo "✨ Novo!" do menu Lugares.
   O save ganha `visitados: { <id>: true }` (P.registrarCampo; mescla = união, o Novo ciclo mantém): ids dos
   interiores e dos lugares em que ela já entrou. A novidade é DECLARADA no lugar (`lugar.novidade: 'AAAA-MM-DD'`)
   e vale por `config.novidadeDias` dias (padrão 45) ou até a 1ª visita. Contrato: docs/contratos/conteudo.md. */
(function () {
  var U = Reino.util, EV = Reino.EVENTOS, P = Reino.Progresso, I = Reino._progresso;
  var DIAS = 45;   // padrão, se o config não disser

  P.registrarCampo('visitados', { padrao: function () { return {}; }, mesclar: 'uniao', novoCiclo: 'mantem' });

  function lista() { return (I.estado && I.estado.visitados) || {}; }
  function dias() { var n = Reino.config && Reino.config.novidadeDias; return typeof n === 'number' ? n : DIAS; }
  // 'AAAA-MM-DD' em ms (meia-noite UTC); NaN se não for data
  function dataDe(txt) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(txt || '');
    return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : NaN;
  }

  var N = {};
  N.visitado = function (id) { return !!id && Object.prototype.hasOwnProperty.call(lista(), id); };
  // marca os ids ainda não vistos; NÃO grava na hora (salvar a cada entrada travava o laço do relógio no modo de teste):
  // vai junto na próxima gravação normal do jogo; se ela fechar antes, o pior é o selo voltar
  N.marcar = function () {
    if (!I.estado) return false;
    var novo = false;
    Array.prototype.slice.call(arguments).forEach(function (id) {
      if (typeof id !== 'string' || !id || N.visitado(id)) return;
      (I.estado.visitados = I.estado.visitados || {})[id] = true;
      novo = true;
    });
    return novo;
  };
  // o lugar tem novidade declarada, recente (menos de novidadeDias dias) e ela ainda não entrou
  N.ehNovo = function (lugar) {
    if (!lugar || !lugar.novidade) return false;
    var t = dataDe(lugar.novidade);
    if (!isFinite(t) || (Date.now() - t) / 86400000 >= dias()) return false;
    return !N.visitado(lugar.id) && !N.visitado(lugar.interior);
  };
  N.dataDe = dataDe;

  // entrou num interior: marca o interior e o lugar dele
  U.on(EV.CENA, function () {
    var c = Reino.Cena && Reino.Cena.atual();
    if (c && c.tipo === 'interior') N.marcar(c.id, c.lugarId);
  });

  Reino.Novidades = N;
})();
