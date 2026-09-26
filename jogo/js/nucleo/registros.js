/* Registro das matérias (js/conteudo/materias/) e das provas bimestrais (js/conteudo/provas/):
   cada arquivo de conteúdo chama Reino.registrarMateria / Reino.registrarProva ao carregar.
   Formas (Materia, Prova): jogo/ferramentas/testes/tipos-jogo.d.ts. */
window.Reino = window.Reino || {};

Reino.materias = [];
/** @param {Materia} m */
Reino.registrarMateria = function (m) { Reino.materias.push(m); };
/** @param {string} id @returns {Materia | undefined} */
Reino.materia = function (id) { return Reino.materias.find(function (m) { return m.id === id; }); };
// provas bimestrais: cada uma em js/conteudo/provas/<id>.js
Reino.provas = [];
/** @param {Prova} p */
Reino.registrarProva = function (p) { Reino.provas.push(p); };
/** @param {string} id @returns {Prova | undefined} */
Reino.prova = function (id) { return Reino.provas.find(function (p) { return p.id === id; }); };
