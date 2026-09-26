/* Registro das salas e do livro de cada matéria (DADOS; carregado antes das matérias).
   Cada sala mora num arquivo próprio (conteudo/materias/<m>/<sala>.js) e se registra com
   Reino.registrarSala('<m>', { id, nome, ..., desafios }); o livro, com
   Reino.registrarLivro('<m>', [cartas]). O arquivo da matéria (<m>/<m>.js), carregado DEPOIS das
   salas e do livro, junta tudo em Reino.registrarMateria({ ..., salas: Reino.salasDa('<m>'),
   livro: Reino.livroDa('<m>'), ... }).
   A ordem das salas é a ordem de carga (a do manifesto). Sala nova = um arquivo <m>/<id>.js +
   uma linha no js/manifesto.js (grupo 'materias', node: true) depois da última sala e antes de
   <m>/livro.js e <m>/<m>.js. */
(function () {
  /** @type {Object<string, { salas: Sala[], livro: CartaLivro[] }>} */
  var pendentes = {};   // { idDaMateria: { salas: [...], livro: [...] } }
  function da(materiaId) { return pendentes[materiaId] || (pendentes[materiaId] = { salas: [], livro: [] }); }

  Reino.registrarSala = function (materiaId, sala) { da(materiaId).salas.push(sala); };
  Reino.registrarLivro = function (materiaId, cartas) { da(materiaId).livro = cartas; };
  Reino.salasDa = function (materiaId) { return da(materiaId).salas; };
  Reino.livroDa = function (materiaId) { return da(materiaId).livro; };
})();
