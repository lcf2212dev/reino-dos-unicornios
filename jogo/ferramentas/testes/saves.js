// Saves 100% SINTÉTICOS para os testes (valores inventados). Nunca copie o save real da Mariana.
// gerarSaves roda DENTRO da página (usa os dados do jogo carregado: unicórnios, salas, enfeites),
// então os ids batem com o jogo sem lista copiada aqui.
function gerarSaves() {
  var R = window.Reino, T = 1790000000000, H = 3600000;
  var unis = R.Unicornios.todos('lilas').map(function (u) { return u.id; });
  var salas = [];
  R.materias.forEach(function (m) { m.salas.forEach(function (s, i) { salas.push({ m: m.id, s: s.id, i: i }); }); });
  var enfeites = (R.LojaItens && R.LojaItens.ENFEITES || []).map(function (e) { return e.id; });
  var comidas = (R.config.comidas || []).map(function (c) { return c.id; });
  function base(extra) {
    return Object.assign({
      v: 1, geracao: 1, ciclo: 1, criado: T - 30 * 24 * H, atualizado: T - H, comecou: true,
      aparencia: { pele: '#f1c7a5', cabelo: '#5a3825', roupa: '#ff7eb6', laco: '#ff4f9a' },
      corInicial: 'lilas', salas: {}, treinos: {}, provas: {},
      unis: { inicial: { em: T - 30 * 24 * H, nome: 'Teste Lua', xp: 40, chocado: true } },
      montaria: 'inicial', estrelas: { ganhas: 5, gastas: 0 },
      loja: {}, usando: { enfeites: [], capa: false, asasFada: false, estrelinhas: false }, pago: {},
      ajustes: { som: false, musica: false, voz: false, animacoes: false, texto: 1, setas: false, surpresa: false },
      ritualVisto: true, cuidados: {}, despensa: {},
    }, extra || {});
  }
  function sala(k, n) { return { feita: T - (40 - n) * H, melhor: 5 - (n % 2), perfeita: n % 3 === 0, calma: n % 2 === 0, vezes: 1 + (n % 3) }; }
  var completo = base({
    aparencia: { pele: '#e0a77f', cabelo: '#2b1a12', roupa: '#7c5cff', laco: '#ffd34d' },
    salas: {}, treinos: { historia: { melhor: 8, ouro: true, perfeito: false, vezes: 3 }, ingles: { melhor: 6, ouro: false, perfeito: false, vezes: 1 } },
    provas: { 'historia-3bim': { tentativas: 1, notas: [10], melhor: 10, premio: 'lendario', premioEm: T - 5 * H } },
    unis: {}, montaria: 'inicial', estrelas: { ganhas: 140, gastas: 35 },
    loja: {}, usando: { enfeites: enfeites.slice(0, 2), capa: true, asasFada: false, estrelinhas: false },
    pago: { historia: 10 },
    cuidados: { inicial: { fome: 62, sede: 44, banho: 71, em: T - 1000, acao: T - 5000, acaoFome: T - 5000, acaoSede: T - 9000, acaoBanho: T - 20000 } },
    despensa: {},
  });
  // só as matérias FIXAS: matéria nova não muda o save (nem o dinheiro do HUD em todas as imagens)
  var FIXAS = ['historia', 'ingles', 'portugues'];
  salas.forEach(function (x, n) { if (x.i < 3 && FIXAS.indexOf(x.m) >= 0) completo.salas[x.s] = sala(x.s, n); });
  unis.slice(0, 9).forEach(function (id, n) { completo.unis[id] = { em: T - (50 - n) * H, nome: n ? '' : 'Teste Lua', xp: [220, 10, 35, 90, 160, 0, 5, 60, 0][n], chocado: n < 7 }; });
  enfeites.slice(0, 6).forEach(function (id) { completo.loja[id] = true; });
  comidas.slice(0, 3).forEach(function (id, n) { completo.despensa[id] = { compradas: 3 + n, usadas: n }; });

  var avancado = JSON.parse(JSON.stringify(completo));
  salas.forEach(function (x, n) { avancado.salas[x.s] = sala(x.s, n); });
  unis.forEach(function (id, n) { avancado.unis[id] = { em: T - (80 - n) * H, nome: '', xp: 30 * n, chocado: true }; });
  avancado.unis.inicial.nome = 'Teste Sol';
  R.provas.forEach(function (p, n) { avancado.provas[p.id] = { tentativas: 2, notas: [7.5, 9.5 + n * 0.1], melhor: 9.5 + n * 0.1, premio: 'raro', premioEm: T - 3 * H }; });
  enfeites.forEach(function (id) { avancado.loja[id] = true; });
  avancado.usando = { enfeites: enfeites.slice(2, 5), capa: false, asasFada: true, estrelinhas: true };
  avancado.montaria = unis[3];
  avancado.estrelas = { ganhas: 400, gastas: 390 };
  avancado.pago = { historia: 50, ingles: 20 };
  avancado.cuidados = {};
  avancado.cuidados[unis[3]] = { fome: 12, sede: 9, banho: 8, em: T - 1000, acao: T - 90000, acaoFome: T - 90000, acaoSede: T - 90000, acaoBanho: 0 };

  var ovos = base({ unis: { inicial: { em: T - 10 * H, nome: 'Teste Lua', xp: 12, chocado: true } }, estrelas: { ganhas: 12, gastas: 2 } });
  unis.slice(1, 4).forEach(function (id, n) { ovos.unis[id] = { em: T - n * H, nome: '', xp: 0, chocado: false }; });
  ovos.salas[salas[0].s] = sala(salas[0].s, 0);
  ovos.cuidados = { inicial: { fome: 20, sede: 95, banho: 30, em: T - 1000, acao: T - 5000, acaoFome: T - 50000, acaoSede: T - 5000, acaoBanho: 0 } };

  return { completo: completo, avancado: avancado, ovos: ovos, inicio: base() };
}

module.exports = { gerarSaves };
