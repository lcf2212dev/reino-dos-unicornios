/* Registro das matérias (js/conteudo/materias/) e das provas bimestrais (js/conteudo/provas/):
   cada arquivo de conteúdo chama Reino.registrarMateria / Reino.registrarProva ao carregar. */
window.Reino = window.Reino || {};

Reino.materias = [];
Reino.registrarMateria = function (m) { Reino.materias.push(m); };
Reino.materia = function (id) { return Reino.materias.find(function (m) { return m.id === id; }); };
// provas bimestrais: cada uma em js/conteudo/provas/<id>.js
Reino.provas = [];
Reino.registrarProva = function (p) { Reino.provas.push(p); };
Reino.prova = function (id) { return Reino.provas.find(function (p) { return p.id === id; }); };
